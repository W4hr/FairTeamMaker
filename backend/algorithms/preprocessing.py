from typing import Dict, List
import copy
from normalization import normalize_lin, normalize_sig

def compress_players_dictionary(players: Dict[str, Dict]
                                ) -> Dict[str, Dict[str, int]]:
    return {p : {"primaryScore" : players[p]["primaryScore"]} for p in players} # remove all data that is currently irrelevant to save memory

def normalize_primary_score(players: Dict[str, Dict[str, int]],
                            max_score: int,
                            min_score: int,
                            minimum_value: int,
                            maximum_value: int
                            ) -> Dict[str, Dict[str, int]]: # max_score and min_score between two values the primaryScore takes playe and min and max defines between two values the output will be
    primary_scores = [players[p]["primaryScore"] for p in players]
    print(primary_scores)
    if max_score is None:
        max_score = max(primary_scores)
    if min_score is None:
        min_score = min(primary_scores)
    if minimum_value is None:
        minimum_value = -3
    if maximum_value is None:
        maximum_value = 3

    players_lin_normalized = copy.deepcopy(players)
    for player_name, player_data in players_lin_normalized.items():
        player_data["primaryScore"] = normalize_lin(players_lin_normalized[player_name]["primaryScore"], min_score, max_score, minimum_value, maximum_value)

    player_sig_normalized = copy.deepcopy(players_lin_normalized)
    for player_name, player_data in player_sig_normalized.items():
        player_data["primaryScore"] = normalize_sig(player_sig_normalized[player_name]["primaryScore"])+1

    return player_sig_normalized