from typing import Dict, List

def index_player_dictionary(Players: Dict[str, Dict[str, any]]):
    index_dict = {}
    index = 0
    for player_name in enumerate(list(Players.keys())):
        index_dict[player_name] = index
        index += 1
    return index_dict

def index_skill_dict(Players: Dict[str, Dict[str, any]], index_player_dict: Dict[str, int]):
    return {index: Players[player_name]["primaryScore"] for index, player_name in index_player_dict.items()}

def index_allocated_players(index_player_dict, allocated_players_names: List[List[str]]):
    return [[index_player_dict[player_name] for player_name in team] for team in allocated_players_names]

def vector_vector_pairPerformance(pairPerformance: Dict[str, Dict[str, int]], index_player_dict: Dict[str, int]):
    player_names_sorted_index = [index_player_dict[index] for index in sorted(index_player_dict.keys)]
    return [[pairPerformance[p1][p2] for p2 in player_names_sorted_index] for p1 in player_names_sorted_index]

def index_matches(matches: Dict[str, str]) -> Dict[int, int]:
    return {index: index + 1 for index, _ in enumerate(matches.keys)}