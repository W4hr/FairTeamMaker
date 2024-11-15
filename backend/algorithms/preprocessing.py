from typing import Dict, List
import copy
from .normalization import normalize_lin, normalize_sig

def compress_players_dictionary(players: Dict[str, dict]
                                ) -> Dict[str, Dict[str, int]]:
    return {p : {"primaryScore" : players[p]["primaryScore"]} for p in players} # remove all data that is currently irrelevant to save memory

def normalize_primary_score(players: Dict[str, Dict[str, int]],
                            max_score: int,
                            min_score: int,
                            minimum_value: int,
                            maximum_value: int
                            ) -> Dict[str, Dict[str, int]]: # max_score and min_score between two values the primaryScore takes playe and min and max defines between two values the output will be
    primary_scores = [players[p]["primaryScore"] for p in players]
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

def normalize_pairPerformance(player_to_player_data: Dict[Dict[str, int]], normalization_settings, player_data: Dict[Dict[str, any]]):
    norm_type = normalization_settings["PairPerformance"]["type"]
    if norm_type == "off":
        return player_to_player_data
    min_value_setting, max_value_setting = normalization_settings["PairPerformance"]["min_value"], normalization_settings["PairPerformance"]["max_value"]

    list_ptp_values = [x for xs in [[player_to_player_data[p1][p2] for p2 in player_to_player_data[p1]] for p1 in player_to_player_data.keys()] for x in xs]

    if min_value_setting == "custom":
        smallest_value = normalization_settings["PairPerformance"]["minValue"]
    elif min_value_setting == "smallest_value":
        smallest_value = min(list_ptp_values)
    elif min_value_setting == "largest_value":
        smallest_value = max(list_ptp_values)
    elif min_value_setting == "symmetric":
        smallest_value = -max([abs(min(list_ptp_values)), abs(max(list_ptp_values))])

    if max_value_setting == "custom":
        largest_value = normalization_settings["PairPerformance"]["maxValue"]
    elif max_value_setting == "smallest_value":
        largest_value = min(list_ptp_values)
    elif max_value_setting == "largest_value":
        largest_value = max(list_ptp_values)
    elif max_value_setting == "symmetric":
        largest_value = max([abs(min(list_ptp_values)), abs(max(list_ptp_values))])

    if normalization_settings["PairPerformance"]["weight"] == "automatic":
        primary_score_list = [player_data[player_name]["primaryScore"] for player_name in player_data.keys()]
        ptp_weight = (abs(max(primary_score_list)) + abs(min(primary_score_list))) / (abs(max(list_ptp_values)) - abs(min(list_ptp_values)))
        if ptp_weight < 1/10:
            ptp_weight = 1/10
        elif ptp_weight > 5:
            ptp_weight = 5
    else:
        ptp_weight = float(normalization_settings["PairPerformance"]["weight"])

    ptp_lin_norm = {p1: {} for p1 in player_to_player_data}

    if normalization_settings["PairPerformance"]["type"] == "linear":
        for p1 in player_to_player_data.keys():
            for p2 in player_to_player_data[p1].keys():
                ptp_lin_norm[p1][p2] = normalize_lin(player_to_player_data[p1][p2], smallest_value, largest_value, -1, 1) * ptp_weight
        return ptp_lin_norm
    elif normalization_settings["PairPerformance"]["type"] == "sigmoid":
        for p1 in player_to_player_data.keys():
            for p2 in player_to_player_data[p1].keys():
                ptp_lin_norm[p1][p2] = normalize_lin(player_to_player_data[p1][p2], smallest_value, largest_value, -3, 3)
        ptp_sigmoid_norm = {}
        for p1 in ptp_lin_norm.keys():
            for p2 in ptp_lin_norm[p1].keys():
                ptp_sigmoid_norm[p1][p2] = normalize_lin(ptp_lin_norm[p1][p2], smallest_value, largest_value, -3, 3) * ptp_weight
        return ptp_sigmoid_norm