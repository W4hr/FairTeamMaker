from typing import Dict, List, Tuple

def get_player_index_dict(Players: Dict[str, Dict[str, any]]) -> Dict[int, str]:
    index_dict = {player_name: index for index, player_name in enumerate(Players.keys())}
    return index_dict

def get_index_player_dict(Players: Dict[str, Dict[str, any]]) -> Dict[int, str]:
    index_dict = {index: player_name for index, player_name in enumerate(Players.keys())}
    return index_dict

def get_index_skill_dict(Players: Dict[str, Dict[str, any]], index_player_dict: Dict[int, str]) -> Dict[int, float]:
    return [Players[player_name]["primaryScore"] for player_name, index in index_player_dict.items()]

def get_index_allocated_players(player_index_dict: Dict[str, int], allocated_players_names: List[List[str]]) -> List[List[int]]:
    return [[player_index_dict[player_name] for player_name in team] for team in allocated_players_names]

def get_matrix_pairPerformance(pairPerformance: Dict[str, Dict[str, int]], index_player_dict: Dict[str, int]) -> List[List[int]]:
    player_names_sorted_index = [index_player_dict[index] for index in sorted(index_player_dict.keys())]
    return [[pairPerformance[p1][p2] for p2 in player_names_sorted_index] for p1 in player_names_sorted_index]

def get_index_matches(matches: Dict[str, str]) -> Dict[int, int]:
    return {index: index + 1 for index, _ in enumerate(list(matches.keys()))}

def get_index_unallocated_players(unallocated_players, player_index_dict):
    return [player_index_dict[player_name] for player_name in list(unallocated_players.keys())]

def convert_brute_force_output_into_json(input_data: List[List[List[Tuple[float, List[List[int]]]]]], teams, index_player_dict: Dict[int, str]):
    teams_names = list(teams.keys())
    structured_data = []
    for game in input_data:
        games = []
        for game_data in game:
            for score, teams in game_data:
                structured_teams = [{teams_names[i]: [index_player_dict[index_player] for index_player in team]} for i, team in enumerate(teams)]
                structured_game = {
                    "difference": score,
                    "teams": structured_teams
                }
                games.append(structured_game)
            structured_data.append({"games": games})
    return structured_data