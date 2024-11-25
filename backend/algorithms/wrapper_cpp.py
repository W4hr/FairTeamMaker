from .game_calculator import brute_force, random

from typing import Dict, List, Optional

from .team_size_processing import teams_sizes as get_teams_sizes
from .calculations import distribute_amount_of_combinations_to_calculate
from .filtering import get_attending_players, get_unallocated_allocated_players, get_allocated_player_in_teams
from .preprocessing import compress_players_dictionary, normalize_primary_score, normalize_pairPerformance

from .cpp_data_preperation import *

# Logging
import logging
algorithm_logger = logging.getLogger("algorithm")
file_handler = logging.FileHandler("./algorithm.log", mode="w")
file_handler.setFormatter(logging.Formatter("%(asctime)s - %(levelname)s - %(message)s"))
algorithm_logger.addHandler(file_handler)
algorithm_logger.setLevel(logging.DEBUG)


### THIS IS THE FASTER CPP/PYTHON BRUTE FORCE/RANDOM IMPLEMENTATION

def get_teams(data: dict):
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
        dispersion_tries: float = 0.5
        amount_best_games: int = 5

        temporary_matches = {key: value for key, value in matches.items()}
        temporary_matches.update({value: key for key, value in matches.items()})
        algorithm_logger.debug("initializing temporary matches succeeded")
        algorithm_logger.debug(f"teams = {teams}")

        teams_sizes: List[List[int]] = get_teams_sizes(teams, temporary_matches, maxDifferenceTeams, maxDifferencePitch, player_count, maximum_number_players_sitting_out)
        algorithm_logger.debug(f"team size calculation succeeded: {teams_sizes}")
        if len(teams_sizes) < 1:
            raise ValueError("There are no possible Teamsizes with your configuration")
        desired_amount_team_sizes = round(len(teams_sizes)* dispersion_tries)
        if desired_amount_team_sizes < 1:
            desired_amount_team_sizes = 1
        amount_of_tries_for_each_team_size: List[int] = distribute_amount_of_combinations_to_calculate(desired_amount_of_combinations, desired_amount_team_sizes)
        algorithm_logger.debug("calculation distribution succeeded")
        
        attending_players = get_attending_players(players)
        algorithm_logger.debug("getting attending players succeeded")
        compressed_players = compress_players_dictionary(attending_players)
        algorithm_logger.debug("compressing players succeeded")
        algorithm_logger.debug(f"compressed_players = {compressed_players}\nnormalization_settings = {normalization_settings}")
        normalized_players = normalize_primary_score(compressed_players, normalization_settings)
        algorithm_logger.debug("normalizing player data succeeded")
        unallocated_players, _ = get_unallocated_allocated_players(normalized_players, teams)
        algorithm_logger.debug("getting unallocated players succeeded")
        allocated_players = get_allocated_player_in_teams(teams)
        algorithm_logger.debug("getting allocated players succeeded")

        normalized_pairPerformance = normalize_pairPerformance(pairPerformance, normalization_settings, players)
        algorithm_logger.debug(f"normalizing pairPerformance data successded: {normalized_pairPerformance}")
        # CPP data preperation
        player_index_dict : Dict[str, int]= get_player_index_dict(normalized_players)
        index_player_dict : Dict[int, str]= get_index_player_dict(normalized_players)
        # CPP ready conversion
        index_skill_dict : List[float]= get_index_skill_dict(normalized_players, player_index_dict)
        index_allocated_players : List[List[Optional[int]]]= get_index_allocated_players(player_index_dict, allocated_players)
        index_unallocated_players : List[int]= get_index_unallocated_players(unallocated_players, player_index_dict)
        matrix_pairPerformance : List[List[float]]= get_matrix_pairPerformance(normalized_pairPerformance, index_player_dict)
        best_games_player_indexes = []
        algorithm_logger.debug(f"""
teams_sizes = {teams_sizes}
amount_of_tries_for_each_team_size = {amount_of_tries_for_each_team_size}
index_allocated_players = {index_allocated_players}
index_skill_dict = {index_skill_dict}
index_unallocated_players = {index_unallocated_players}
amount_best_games = {amount_best_games}
matrix_pairPerformance = {matrix_pairPerformance}
""")
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
        algorithm_logger.debug("calculating possibilities succeeded")
        algorithm_logger.debug(f"cpp_output = {best_games_player_indexes}")
        num_active_players = len([p for p in players if players[p]["attendanceState"]])
        algorithm_logger.debug(f"num_active_players = {num_active_players}")
        results_formated = format_cpp_output(best_games_player_indexes, index_player_dict, teams, pitchNames, num_active_players, normalized_players, index_allocated_players)
        algorithm_logger.debug(f"results_formated = {results_formated}")
    except Exception as e:
        algorithm_logger.error(f"Calculation failed: {e}")
    return results_formated