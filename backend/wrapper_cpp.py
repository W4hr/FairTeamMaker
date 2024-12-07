from .algorithms.game_calculator import brute_force, random

from typing import Dict, List, Optional

from .data_processing.team_size_processing import teams_sizes as get_teams_sizes
from .data_processing.calculations import distribute_amount_of_combinations_to_calculate
from .data_processing.filtering import get_attending_players, get_unallocated_allocated_players, get_allocated_player_in_teams, compress_players_dictionary
from .data_processing.preprocessing import normalize_primary_score, normalize_pairPerformance

from .data_processing.cpp_data_preperation import *

# Logging
import logging
progress_logger = logging.getLogger("progress")
data_logger = logging.getLogger("data")
data_logger.setLevel(logging.ERROR)

### THIS IS THE FASTER CPP/PYTHON BRUTE FORCE/RANDOM IMPLEMENTATION

def get_games(data: dict):
    try:
        pitchNames: List[str] = data["pitches"]
        teams: Dict[str, dict] = data["teams"]
        matches: Dict[str, str] = data["matches"]
        player_count: int = data["number_of_players"]
        players: Dict[str, Dict[str, int]] = data["players"]
        pairPerformance: Dict[str, Dict[str, int]] = data["pairPerformance"]

        maxDifferenceTeams: int = data["settings"]["maxDifferenceTeams"]
        maxDifferencePitch: int = data["settings"]["maxDifferencePitches"]
        interchangeable : bool = data["settings"]["interchangeableTeams"]
        maximum_number_players_sitting_out: int = data["settings"]["maxSittingOut"]
        algorithm_choice: str = data["settings"]["algorithmChoice"]
        normalization_settings: Dict[str, Dict[str, any]] = data["settings"]["normalizationSettings"]

        desired_amount_of_combinations: int = 700000
        dispersion_tries: float = 1
        amount_best_games: int = 5

        temporary_matches = {key: value for key, value in matches.items()}
        temporary_matches.update({value: key for key, value in matches.items()})
        progress_logger.debug("initializing temporary matches succeeded")
        data_logger.debug(f"teams: {teams}")

        teams_sizes: List[List[int]] = get_teams_sizes(teams, temporary_matches, maxDifferenceTeams, maxDifferencePitch, player_count, maximum_number_players_sitting_out)
        progress_logger.debug(f"team size calculation succeeded")
        data_logger.debug(f"teams sizes: {teams_sizes}")
        if len(teams_sizes) < 1:
            raise ValueError("There are no possible Teamsizes with your configuration")
        desired_amount_team_sizes = round(len(teams_sizes)* dispersion_tries)
        if desired_amount_team_sizes < 1:
            desired_amount_team_sizes = 1
        amount_of_tries_for_each_team_size: List[int] = distribute_amount_of_combinations_to_calculate(desired_amount_of_combinations, desired_amount_team_sizes)
        progress_logger.debug("calculation distribution succeeded")
        data_logger.debug(f"amount of tries for each team size: {amount_of_tries_for_each_team_size}")
        
        attending_players = get_attending_players(players)
        progress_logger.debug("getting attending players succeeded")
        compressed_players = compress_players_dictionary(attending_players)
        progress_logger.debug("compressing players succeeded")
        data_logger.debug(f"compressed players: {compressed_players}")
        normalized_players = normalize_primary_score(compressed_players, normalization_settings)
        progress_logger.debug(f"normalizing player data succeeded")
        data_logger.debug(f"normalized player data: {normalized_players}")
        unallocated_players, _ = get_unallocated_allocated_players(normalized_players, teams)
        progress_logger.debug("getting unallocated players succeeded")
        allocated_players = get_allocated_player_in_teams(teams)
        progress_logger.debug("getting allocated players succeeded")

        normalized_pairPerformance = normalize_pairPerformance(pairPerformance, normalization_settings, players)
        progress_logger.debug(f"normalizing pairPerformance data successded")
        data_logger.debug(f"normalized pair performance data: {normalized_pairPerformance}")
        # CPP data preperation
        player_index_dict : Dict[str, int]= get_player_index_dict(normalized_players)
        index_player_dict : Dict[int, str]= get_index_player_dict(normalized_players)
        # CPP compatible conversion
        index_skill_dict : List[float]= get_index_skill_dict(normalized_players, player_index_dict)
        index_allocated_players : List[List[Optional[int]]]= get_index_allocated_players(player_index_dict, allocated_players)
        index_unallocated_players : List[int]= get_index_unallocated_players(unallocated_players, player_index_dict)
        matrix_pairPerformance : List[List[float]]= get_matrix_pairPerformance(normalized_pairPerformance, index_player_dict)
        best_games_player_indexes = []
        data_logger.debug(f"teams_sizes = {teams_sizes}")
        data_logger.debug(f"amount_of_tries_for_each_team_size = {amount_of_tries_for_each_team_size}")
        data_logger.debug(f"index_allocated_players = {index_allocated_players}")
        data_logger.debug(f"index_skill_dict = {index_skill_dict}")
        data_logger.debug(f"index_unallocated_players = {index_unallocated_players}")
        data_logger.debug(f"amount_best_games = {amount_best_games}")
        data_logger.debug(f"matrix_pairPerformance = {matrix_pairPerformance}")

        if algorithm_choice == "brute_force":
            best_games_player_indexes = brute_force(teams_sizes,
                                                    amount_of_tries_for_each_team_size,
                                                    index_allocated_players,
                                                    index_skill_dict,
                                                    index_unallocated_players,
                                                    amount_best_games,
                                                    matrix_pairPerformance,
                                                    interchangeable
                                                    )
        elif algorithm_choice == "random":
            best_games_player_indexes = random(teams_sizes,
                                            amount_of_tries_for_each_team_size,
                                            index_allocated_players,
                                            index_skill_dict,
                                            index_unallocated_players,
                                            amount_best_games,
                                            matrix_pairPerformance,
                                            interchangeable
                                            )
        progress_logger.debug("calculating possibilities succeeded")
        data_logger.debug(f"output = {best_games_player_indexes}")
        num_active_players = len([p for p in players if players[p]["attendanceState"]])
        data_logger.debug(f"number of active players: {num_active_players}")
        results_formated = format_cpp_output(best_games_player_indexes, index_player_dict, teams, pitchNames, num_active_players, normalized_players, index_allocated_players)
        data_logger.debug(f"formated output: {results_formated}")
    except Exception as e:
        progress_logger.error(f"Calculation failed: {e}")
    return results_formated