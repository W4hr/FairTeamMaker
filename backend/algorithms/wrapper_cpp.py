from .game_calculator import brute_force, random

from typing import Dict, List, Optional

from .team_size_processing import teams_sizes as get_teams_sizes
from .calculations import distribute_amount_of_combinations_to_calculate
from .preprocessing import compress_players_dictionary, normalize_primary_score
from .filtering import get_attending_players, get_unallocated_allocated_players, get_allocated_player_in_teams

from .cpp_data_preperation import *

# Logging
import logging
algorithm_logger = logging.getLogger("algorithm")
file_handler = logging.FileHandler("./algorithm.log", mode="w")
file_handler.setFormatter(logging.Formatter("%(asctime)s - %(levelname)s - %(message)s"))
algorithm_logger.addHandler(file_handler)
algorithm_logger.setLevel(logging.DEBUG)


### THIS IS THE FASTER CPP/PYTHON BRUTE FORCE IMPLEMENTATION

def get_teams(teams : Dict[str, dict], 
              matches: Dict[str, str], 
              maxDifferenceTeams: int, 
              maxDifferencePitch: int, 
              player_count: int, 
              maximum_number_players_sitting_out: int,
              desired_amount_of_combinations: int,
              dispersion_tries: int,
              players: Dict[str, Dict[str, int]],
              pairPerformance: Dict[str, Dict[str, int]],
              amount_best_games: int,
              pitchNames: List[str],
              algorithm_choice: str
              ):
    try:
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
        normalized_players = normalize_primary_score(compressed_players, 4, 1, 1, 8)
        algorithm_logger.debug("normalizing player data succeeded")
        unallocated_players, _ = get_unallocated_allocated_players(normalized_players, teams)
        algorithm_logger.debug("getting unallocated players succeeded")
        allocated_players = get_allocated_player_in_teams(teams)
        algorithm_logger.debug("getting allocated players succeeded")

        # CPP data preperation
        player_index_dict : Dict[str, int]= get_player_index_dict(normalized_players)
        index_player_dict : Dict[int, str]= get_index_player_dict(normalized_players)
        # CPP ready conversion
        index_skill_dict : List[float]= get_index_skill_dict(normalized_players, player_index_dict)
        index_allocated_players : List[List[Optional[int]]]= get_index_allocated_players(player_index_dict, allocated_players)
        index_unallocated_players : List[int]= get_index_unallocated_players(unallocated_players, player_index_dict)
        matrix_pairPerformance : List[List[float]]= get_matrix_pairPerformance(pairPerformance, index_player_dict)
        matches_indexes_dict : Dict[int, int]= get_index_matches(matches)
        print(f"amount_of_tries_for_each_team_size = {amount_of_tries_for_each_team_size}")
        best_games_player_indexes = []
        if algorithm_choice == "brute_force":
            best_games_player_indexes = brute_force(teams_sizes,
                                                    amount_of_tries_for_each_team_size,
                                                    index_allocated_players,
                                                    index_skill_dict,
                                                    index_unallocated_players,
                                                    amount_best_games,
                                                    matrix_pairPerformance,
                                                    matches_indexes_dict
                                                    )
        elif algorithm_choice == "random":
            best_games_player_indexes = random(teams_sizes,
                                            amount_of_tries_for_each_team_size,
                                            index_allocated_players,
                                            index_skill_dict,
                                            index_unallocated_players,
                                            amount_best_games,
                                            matrix_pairPerformance,
                                            matches_indexes_dict
                                            )
        algorithm_logger.debug("calculating possibilities succeeded")
        results_formated = format_cpp_output(amount_of_tries_for_each_team_size, best_games_player_indexes, teams_sizes, index_player_dict, teams, pitchNames, player_index_dict)
    except Exception as e:
        algorithm_logger.error(f"Calculation failed: {e}")
    return results_formated

if __name__ == "__main__":
    data = {
        "name": "Class 13",
        "description": "Example Group",
        "number_of_players": 27,
        "matches": {
            "team 1": "team 2",
            "team 3": "team 4",
        },
        "pitchNames": ["Pitchname1", "Pitchname2"],
        "teams": {
            "team 1": {
                "num_players": None,
                "players": ["Helge", "Jonathan"]
            },
            "team 2": {
                "num_players": None,
                "players": ["Wanda"]
            },
            "team 3": {
                "num_players": None,
                "players": ["ClaraB"]
            },
            "team 4": {
                "num_players": None,
                "players": []
            }
        },
        "settings": {
            "interachangableTeams": True,
            "maxSittingOut": 0,
            "maxDifferenceTeams": 1,
            "maxDifferencePitches": 3
        },
        "categories": [],
        "players": {
            "Helge": {
                "attendanceState": True,
                "primaryScore": 3
            },
            "ClaraB": {
                "attendanceState": True,
                "primaryScore": 2
            },
            "Viktoria": {
                "attendanceState": True,
                "primaryScore": 2
            },
            "Immanuel": {
                "attendanceState": True,
                "primaryScore": 1
            },
            "Fridolin": {
                "attendanceState": True,
                "primaryScore": 1
            },
            "Lena": {
                "attendanceState": True,
                "primaryScore": 4
            },
            "Joris": {
                "attendanceState": True,
                "primaryScore": 1
            },
            "Julian": {
                "attendanceState": True,
                "primaryScore": 2
            },
            "Luisa": {
                "attendanceState": True,
                "primaryScore": 3
            },
            "Schirin": {
                "attendanceState": True,
                "primaryScore": 3
            },
            "Leonore": {
                "attendanceState": True,
                "primaryScore": 2
            },
            "SimonH": {
                "attendanceState": True,
                "primaryScore": 2
            },
            "Theodor": {
                "attendanceState": True,
                "primaryScore": 3
            },
            "SimonK": {
                "attendanceState": True,
                "primaryScore": 3
            },
            "Sarah": {
                "attendanceState": True,
                "primaryScore": 3
            },
            "Julius": {
                "attendanceState": True,
                "primaryScore": 2
            },
            "Till": {
                "attendanceState": True,
                "primaryScore": 1
            },
            "Ida": {
                "attendanceState": True,
                "primaryScore": 3
            },
            "ClaraP": {
                "attendanceState": True,
                "primaryScore": 3
            },
            "Jonathan": {
                "attendanceState": True,
                "primaryScore": 1
            },
            "Charlotte": {
                "attendanceState": True,
                "primaryScore": 3
            },
            "Helene": {
                "attendanceState": True,
                "primaryScore": 1
            },
            "Hedda": {
                "attendanceState": True,
                "primaryScore": 3
            },
            "Alma": {
                "attendanceState": True,
                "primaryScore": 2
            },
            "Tessa": {
                "attendanceState": True,
                "primaryScore": 2
            },
            "Wanda": {
                "attendanceState": True,
                "primaryScore": 4
            },
            "Luca": {
                "attendanceState": True,
                "primaryScore": 1
            }
        },
        "pairPerformance": {
            "Helge": {
                "Helge": 0,
                "ClaraB": 1,
                "Viktoria": 0,
                "Immanuel": 0,
                "Fridolin": 2,
                "Lena": -2,
                "Joris": -2,
                "Julian": 0,
                "Luisa": 0,
                "Schirin": 0,
                "Leonore": 0,
                "SimonH": 0,
                "Theodor": 0,
                "SimonK": 0,
                "Sarah": -1,
                "Julius": 0,
                "Till": 2,
                "Ida": -1,
                "ClaraP": -1,
                "Jonathan": 0,
                "Charlotte": 0,
                "Helene": 0,
                "Hedda": -2,
                "Alma": 0,
                "Tessa": -2,
                "Wanda": -2,
                "Luca": 0
            },
            "ClaraB": {
                "Helge": 1,
                "ClaraB": 0,
                "Viktoria": 0,
                "Immanuel": 0,
                "Fridolin": 0,
                "Lena": 0,
                "Joris": 0,
                "Julian": 0,
                "Luisa": 0,
                "Schirin": 0,
                "Leonore": 0,
                "SimonH": 0,
                "Theodor": 0,
                "SimonK": 0,
                "Sarah": 0,
                "Julius": 0,
                "Till": 0,
                "Ida": 0,
                "ClaraP": 0,
                "Jonathan": 0,
                "Charlotte": 0,
                "Helene": 0,
                "Hedda": 0,
                "Alma": 0,
                "Tessa": 0,
                "Wanda": 0,
                "Luca": 0
            },
            "Viktoria": {
                "Helge": 0,
                "ClaraB": 0,
                "Viktoria": 0,
                "Immanuel": 0,
                "Fridolin": 0,
                "Lena": 0,
                "Joris": 0,
                "Julian": 0,
                "Luisa": 0,
                "Schirin": 0,
                "Leonore": 0,
                "SimonH": 0,
                "Theodor": 0,
                "SimonK": 0,
                "Sarah": 0,
                "Julius": 0,
                "Till": 0,
                "Ida": 0,
                "ClaraP": 0,
                "Jonathan": 0,
                "Charlotte": 0,
                "Helene": 0,
                "Hedda": 0,
                "Alma": 0,
                "Tessa": 0,
                "Wanda": 0,
                "Luca": 0
            },
            "Immanuel": {
                "Helge": 0,
                "ClaraB": 0,
                "Viktoria": 0,
                "Immanuel": 0,
                "Fridolin": 0,
                "Lena": 0,
                "Joris": -2,
                "Julian": 0,
                "Luisa": 0,
                "Schirin": 0,
                "Leonore": 0,
                "SimonH": 0,
                "Theodor": 0,
                "SimonK": 0,
                "Sarah": 0,
                "Julius": 0,
                "Till": 0,
                "Ida": 0,
                "ClaraP": 0,
                "Jonathan": -1,
                "Charlotte": 0,
                "Helene": 0,
                "Hedda": 0,
                "Alma": -2,
                "Tessa": 0,
                "Wanda": 0,
                "Luca": -1
            },
            "Fridolin": {
                "Helge": 2,
                "ClaraB": 0,
                "Viktoria": 0,
                "Immanuel": 0,
                "Fridolin": 0,
                "Lena": 0,
                "Joris": -2,
                "Julian": 0,
                "Luisa": 0,
                "Schirin": 0,
                "Leonore": 0,
                "SimonH": 0,
                "Theodor": 0,
                "SimonK": 0,
                "Sarah": 0,
                "Julius": 0,
                "Till": -1,
                "Ida": 0,
                "ClaraP": 0,
                "Jonathan": -2,
                "Charlotte": 0,
                "Helene": 0,
                "Hedda": 0,
                "Alma": 0,
                "Tessa": 0,
                "Wanda": 0,
                "Luca": -2
            },
            "Lena": {
                "Helge": -2,
                "ClaraB": 0,
                "Viktoria": 0,
                "Immanuel": 0,
                "Fridolin": 0,
                "Lena": 0,
                "Joris": 0,
                "Julian": 0,
                "Luisa": 0,
                "Schirin": 0,
                "Leonore": 0,
                "SimonH": 0,
                "Theodor": 0,
                "SimonK": 0,
                "Sarah": 0,
                "Julius": 0,
                "Till": 0,
                "Ida": -1,
                "ClaraP": 0,
                "Jonathan": 0,
                "Charlotte": 0,
                "Helene": 0,
                "Hedda": -2,
                "Alma": 0,
                "Tessa": 0,
                "Wanda": -2,
                "Luca": -1
            },
            "Joris": {
                "Helge": -2,
                "ClaraB": 0,
                "Viktoria": 0,
                "Immanuel": -2,
                "Fridolin": 0,
                "Lena": 0,
                "Joris": -2,
                "Julian": 0,
                "Luisa": 0,
                "Schirin": 0,
                "Leonore": 0,
                "SimonH": 0,
                "Theodor": 0,
                "SimonK": 0,
                "Sarah": 0,
                "Julius": 0,
                "Till": -2,
                "Ida": 0,
                "ClaraP": 0,
                "Jonathan": -1,
                "Charlotte": 0,
                "Helene": 0,
                "Hedda": 0,
                "Alma": 0,
                "Tessa": 0,
                "Wanda": 0,
                "Luca": 0
            },
            "Julian": {
                "Helge": 0,
                "ClaraB": 0,
                "Viktoria": 0,
                "Immanuel": 0,
                "Fridolin": 0,
                "Lena": 0,
                "Joris": 0,
                "Julian": 0,
                "Luisa": 0,
                "Schirin": 0,
                "Leonore": 0,
                "SimonH": 0,
                "Theodor": 0,
                "SimonK": 0,
                "Sarah": 0,
                "Julius": 0,
                "Till": 0,
                "Ida": 0,
                "ClaraP": 0,
                "Jonathan": 0,
                "Charlotte": 0,
                "Helene": 0,
                "Hedda": 0,
                "Alma": 0,
                "Tessa": 0,
                "Wanda": 0,
                "Luca": 0
            },
            "Luisa": {
                "Helge": 0,
                "ClaraB": 0,
                "Viktoria": 0,
                "Immanuel": 0,
                "Fridolin": 0,
                "Lena": 0,
                "Joris": 0,
                "Julian": 0,
                "Luisa": 0,
                "Schirin": 0,
                "Leonore": 0,
                "SimonH": 0,
                "Theodor": 0,
                "SimonK": 0,
                "Sarah": 0,
                "Julius": 0,
                "Till": 0,
                "Ida": 0,
                "ClaraP": 0,
                "Jonathan": 0,
                "Charlotte": 0,
                "Helene": 0,
                "Hedda": 0,
                "Alma": 0,
                "Tessa": 0,
                "Wanda": 0,
                "Luca": 0
            },
            "Schirin": {
                "Helge": 0,
                "ClaraB": 0,
                "Viktoria": 0,
                "Immanuel": 0,
                "Fridolin": 0,
                "Lena": 0,
                "Joris": 0,
                "Julian": 0,
                "Luisa": 0,
                "Schirin": 0,
                "Leonore": 0,
                "SimonH": 0,
                "Theodor": 0,
                "SimonK": 0,
                "Sarah": 0,
                "Julius": 0,
                "Till": 0,
                "Ida": 0,
                "ClaraP": 0,
                "Jonathan": 0,
                "Charlotte": 0,
                "Helene": 0,
                "Hedda": 0,
                "Alma": 0,
                "Tessa": 0,
                "Wanda": 0,
                "Luca": 0
            },
            "Leonore": {
                "Helge": 0,
                "ClaraB": 0,
                "Viktoria": 0,
                "Immanuel": 0,
                "Fridolin": 0,
                "Lena": 0,
                "Joris": 0,
                "Julian": 0,
                "Luisa": 0,
                "Schirin": 0,
                "Leonore": 0,
                "SimonH": 0,
                "Theodor": 0,
                "SimonK": 0,
                "Sarah": 0,
                "Julius": 0,
                "Till": 0,
                "Ida": 0,
                "ClaraP": 0,
                "Jonathan": 0,
                "Charlotte": 0,
                "Helene": 0,
                "Hedda": 0,
                "Alma": 0,
                "Tessa": 0,
                "Wanda": 0,
                "Luca": 0
            },
            "SimonH": {
                "Helge": 0,
                "ClaraB": 0,
                "Viktoria": 0,
                "Immanuel": 0,
                "Fridolin": 0,
                "Lena": 0,
                "Joris": 0,
                "Julian": 0,
                "Luisa": 0,
                "Schirin": 0,
                "Leonore": 0,
                "SimonH": 0,
                "Theodor": 0,
                "SimonK": 0,
                "Sarah": 0,
                "Julius": 0,
                "Till": 0,
                "Ida": 0,
                "ClaraP": 0,
                "Jonathan": 0,
                "Charlotte": 0,
                "Helene": 0,
                "Hedda": 0,
                "Alma": 0,
                "Tessa": 0,
                "Wanda": 0,
                "Luca": 0
            },
            "Theodor": {
                "Helge": 0,
                "ClaraB": 0,
                "Viktoria": 0,
                "Immanuel": 0,
                "Fridolin": 0,
                "Lena": 0,
                "Joris": 0,
                "Julian": 0,
                "Luisa": 0,
                "Schirin": 0,
                "Leonore": 0,
                "SimonH": 0,
                "Theodor": 0,
                "SimonK": 0,
                "Sarah": 0,
                "Julius": 0,
                "Till": 0,
                "Ida": 0,
                "ClaraP": 0,
                "Jonathan": 0,
                "Charlotte": 0,
                "Helene": 0,
                "Hedda": 0,
                "Alma": 0,
                "Tessa": 0,
                "Wanda": 0,
                "Luca": 0
            },
            "SimonK": {
                "Helge": 0,
                "ClaraB": 0,
                "Viktoria": 0,
                "Immanuel": 0,
                "Fridolin": 0,
                "Lena": 0,
                "Joris": 0,
                "Julian": 0,
                "Luisa": 0,
                "Schirin": 0,
                "Leonore": 0,
                "SimonH": 0,
                "Theodor": 0,
                "SimonK": 0,
                "Sarah": 0,
                "Julius": 0,
                "Till": 0,
                "Ida": 0,
                "ClaraP": 0,
                "Jonathan": 0,
                "Charlotte": 0,
                "Helene": 0,
                "Hedda": 0,
                "Alma": 0,
                "Tessa": 0,
                "Wanda": 0,
                "Luca": 0
            },
            "Sarah": {
                "Helge": -1,
                "ClaraB": 0,
                "Viktoria": 0,
                "Immanuel": 0,
                "Fridolin": 0,
                "Lena": 0,
                "Joris": 0,
                "Julian": 0,
                "Luisa": 0,
                "Schirin": 0,
                "Leonore": 0,
                "SimonH": 0,
                "Theodor": 0,
                "SimonK": 0,
                "Sarah": 0,
                "Julius": 0,
                "Till": 0,
                "Ida": 0,
                "ClaraP": 0,
                "Jonathan": 0,
                "Charlotte": 0,
                "Helene": 0,
                "Hedda": 0,
                "Alma": 0,
                "Tessa": 0,
                "Wanda": 0,
                "Luca": 0
            },
            "Julius": {
                "Helge": 0,
                "ClaraB": 0,
                "Viktoria": 0,
                "Immanuel": 0,
                "Fridolin": 0,
                "Lena": 0,
                "Joris": 0,
                "Julian": 0,
                "Luisa": 0,
                "Schirin": 0,
                "Leonore": 0,
                "SimonH": 0,
                "Theodor": 0,
                "SimonK": 0,
                "Sarah": 0,
                "Julius": 0,
                "Till": 0,
                "Ida": 0,
                "ClaraP": 0,
                "Jonathan": 0,
                "Charlotte": 0,
                "Helene": 0,
                "Hedda": 0,
                "Alma": 0,
                "Tessa": 0,
                "Wanda": 0,
                "Luca": 0
            },
            "Till": {
                "Helge": 2,
                "ClaraB": 0,
                "Viktoria": 0,
                "Immanuel": 0,
                "Fridolin": -1,
                "Lena": 0,
                "Joris": -2,
                "Julian": 0,
                "Luisa": 0,
                "Schirin": 0,
                "Leonore": 0,
                "SimonH": 0,
                "Theodor": 0,
                "SimonK": 0,
                "Sarah": 0,
                "Julius": 0,
                "Till": 0,
                "Ida": 0,
                "ClaraP": 0,
                "Jonathan": -2,
                "Charlotte": 0,
                "Helene": 0,
                "Hedda": 0,
                "Alma": 0,
                "Tessa": 0,
                "Wanda": 0,
                "Luca": -2
            },
            "Ida": {
                "Helge": -1,
                "ClaraB": 0,
                "Viktoria": 0,
                "Immanuel": 0,
                "Fridolin": 0,
                "Lena": -1,
                "Joris": 0,
                "Julian": 0,
                "Luisa": 0,
                "Schirin": 0,
                "Leonore": 0,
                "SimonH": 0,
                "Theodor": 0,
                "SimonK": 0,
                "Sarah": 0,
                "Julius": 0,
                "Till": 0,
                "Ida": 0,
                "ClaraP": 0,
                "Jonathan": 0,
                "Charlotte": 0,
                "Helene": 0,
                "Hedda": 0,
                "Alma": 0,
                "Tessa": 0,
                "Wanda": 0,
                "Luca": 0
            },
            "ClaraP": {
                "Helge": -1,
                "ClaraB": 0,
                "Viktoria": 0,
                "Immanuel": 0,
                "Fridolin": 0,
                "Lena": 0,
                "Joris": 0,
                "Julian": 0,
                "Luisa": 0,
                "Schirin": 0,
                "Leonore": 0,
                "SimonH": 0,
                "Theodor": 0,
                "SimonK": 0,
                "Sarah": 0,
                "Julius": 0,
                "Till": 0,
                "Ida": 0,
                "ClaraP": 0,
                "Jonathan": 0,
                "Charlotte": 0,
                "Helene": 0,
                "Hedda": 0,
                "Alma": 0,
                "Tessa": 0,
                "Wanda": 0,
                "Luca": 0
            },
            "Jonathan": {
                "Helge": 0,
                "ClaraB": 0,
                "Viktoria": 0,
                "Immanuel": -1,
                "Fridolin": -2,
                "Lena": 0,
                "Joris": -1,
                "Julian": 0,
                "Luisa": 0,
                "Schirin": 0,
                "Leonore": 0,
                "SimonH": 0,
                "Theodor": 0,
                "SimonK": 0,
                "Sarah": 0,
                "Julius": 0,
                "Till": -2,
                "Ida": 0,
                "ClaraP": 0,
                "Jonathan": 0,
                "Charlotte": 0,
                "Helene": 0,
                "Hedda": 0,
                "Alma": 0,
                "Tessa": 0,
                "Wanda": 0,
                "Luca": -2
            },
            "Charlotte": {
                "Helge": 0,
                "ClaraB": 0,
                "Viktoria": 0,
                "Immanuel": 0,
                "Fridolin": 0,
                "Lena": 0,
                "Joris": 0,
                "Julian": 0,
                "Luisa": 0,
                "Schirin": 0,
                "Leonore": 0,
                "SimonH": 0,
                "Theodor": 0,
                "SimonK": 0,
                "Sarah": 0,
                "Julius": 0,
                "Till": 0,
                "Ida": 0,
                "ClaraP": 0,
                "Jonathan": 0,
                "Charlotte": 0,
                "Helene": 0,
                "Hedda": 0,
                "Alma": 0,
                "Tessa": 0,
                "Wanda": 0,
                "Luca": 0
            },
            "Helene": {
                "Helge": 0,
                "ClaraB": 0,
                "Viktoria": 0,
                "Immanuel": 0,
                "Fridolin": 0,
                "Lena": 0,
                "Joris": 0,
                "Julian": 0,
                "Luisa": 0,
                "Schirin": 0,
                "Leonore": 0,
                "SimonH": 0,
                "Theodor": 0,
                "SimonK": 0,
                "Sarah": 0,
                "Julius": 0,
                "Till": 0,
                "Ida": 0,
                "ClaraP": 0,
                "Jonathan": 0,
                "Charlotte": 0,
                "Helene": 0,
                "Hedda": 0,
                "Alma": 0,
                "Tessa": 0,
                "Wanda": 0,
                "Luca": 0
            },
            "Hedda": {
                "Helge": -2,
                "ClaraB": 0,
                "Viktoria": 0,
                "Immanuel": 0,
                "Fridolin": 0,
                "Lena": -2,
                "Joris": 0,
                "Julian": 0,
                "Luisa": 0,
                "Schirin": 0,
                "Leonore": 0,
                "SimonH": 0,
                "Theodor": 0,
                "SimonK": 0,
                "Sarah": 0,
                "Julius": 0,
                "Till": 0,
                "Ida": 0,
                "ClaraP": 0,
                "Jonathan": 0,
                "Charlotte": 0,
                "Helene": 0,
                "Hedda": 0,
                "Alma": 0,
                "Tessa": 0,
                "Wanda": 0,
                "Luca": 0
            },
            "Alma": {
                "Helge": 0,
                "ClaraB": 0,
                "Viktoria": 0,
                "Immanuel": -2,
                "Fridolin": 0,
                "Lena": 0,
                "Joris": 0,
                "Julian": 0,
                "Luisa": 0,
                "Schirin": 0,
                "Leonore": 0,
                "SimonH": 0,
                "Theodor": 0,
                "SimonK": 0,
                "Sarah": 0,
                "Julius": 0,
                "Till": 0,
                "Ida": 0,
                "ClaraP": 0,
                "Jonathan": 0,
                "Charlotte": 0,
                "Helene": 0,
                "Hedda": 0,
                "Alma": 0,
                "Tessa": 0,
                "Wanda": 0,
                "Luca": 0
            },
            "Tessa": {
                "Helge": -2,
                "ClaraB": 0,
                "Viktoria": 0,
                "Immanuel": 0,
                "Fridolin": 0,
                "Lena": 0,
                "Joris": 0,
                "Julian": 0,
                "Luisa": 0,
                "Schirin": 0,
                "Leonore": 0,
                "SimonH": 0,
                "Theodor": 0,
                "SimonK": 0,
                "Sarah": 0,
                "Julius": 0,
                "Till": 0,
                "Ida": 0,
                "ClaraP": 0,
                "Jonathan": 0,
                "Charlotte": 0,
                "Helene": 0,
                "Hedda": 0,
                "Alma": 0,
                "Tessa": 0,
                "Wanda": -2,
                "Luca": 0
            },
            "Wanda": {
                "Helge": -2,
                "ClaraB": 0,
                "Viktoria": 0,
                "Immanuel": 0,
                "Fridolin": 0,
                "Lena": -2,
                "Joris": 0,
                "Julian": 0,
                "Luisa": 0,
                "Schirin": 0,
                "Leonore": 0,
                "SimonH": 0,
                "Theodor": 0,
                "SimonK": 0,
                "Sarah": 0,
                "Julius": 0,
                "Till": 0,
                "Ida": 0,
                "ClaraP": 0,
                "Jonathan": 0,
                "Charlotte": 0,
                "Helene": 0,
                "Hedda": 0,
                "Alma": 0,
                "Tessa": -2,
                "Wanda": 0,
                "Luca": 0
            },
            "Luca": {
                "Helge": 0,
                "ClaraB": 0,
                "Viktoria": 0,
                "Immanuel": -1,
                "Fridolin": -2,
                "Lena": -1,
                "Joris": 0,
                "Julian": 0,
                "Luisa": 0,
                "Schirin": 0,
                "Leonore": 0,
                "SimonH": 0,
                "Theodor": 0,
                "SimonK": 0,
                "Sarah": 0,
                "Julius": 0,
                "Till": -2,
                "Ida": 0,
                "ClaraP": 0,
                "Jonathan": -2,
                "Charlotte": 0,
                "Helene": 0,
                "Hedda": 0,
                "Alma": 0,
                "Tessa": 0,
                "Wanda": 0,
                "Luca": 0
            }
        }
    }
    
    results_formated =  get_teams(data["teams"], data["matches"], data["settings"]["maxDifferenceTeams"], data["settings"]["maxDifferencePitches"], data["number_of_players"], data["settings"]["maxSittingOut"], 700000, 0.25, data["players"], data["pairPerformance"], 10, data["pitchNames"], "random")
    print(f"Output : {results_formated}")