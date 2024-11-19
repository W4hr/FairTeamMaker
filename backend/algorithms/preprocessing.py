from typing import Dict, List
import copy
from .normalization import normalize_lin, normalize_sig, normalize_logit

def compress_players_dictionary(players: Dict[str, dict]
                                ) -> Dict[str, Dict[str, int]]:
    return {p : {"primaryScore" : players[p]["primaryScore"]} for p in players} # remove all data that is currently irrelevant to save memory

def normalize_primary_score(players: Dict[str, Dict[str, float]],
                            normalization_settings
                            ) -> Dict[str, Dict[str, int]]: # max_score and min_score between two values the primaryScore takes playe and min and max defines between two values the output will be
    primaryNormOptions = normalization_settings["NormSettingsPrimaryScore"]
    norm_type = primaryNormOptions["type"]
    if norm_type == "off":
        return players
    min_value_setting, max_value_setting = primaryNormOptions["minValue"], primaryNormOptions["maxValue"]

    list_primary_scores = [players[p]["primaryScore"] for p in players]
    if min_value_setting == "custom":
        smallest_value = primaryNormOptions["minValue"]
    elif min_value_setting == "smallest_value":
        smallest_value = min(list_primary_scores)
    elif min_value_setting == "largest_value":
        smallest_value = max(list_primary_scores)
    elif min_value_setting == "symmetric":
        smallest_value = -max([abs(min(list_primary_scores)), abs(max(list_primary_scores))])

    if max_value_setting == "custom":
        largest_value = primaryNormOptions["maxValue"]
    elif max_value_setting == "smallest_value":
        largest_value = min(list_primary_scores)
    elif max_value_setting == "largest_value":
        largest_value = max(list_primary_scores)
    elif max_value_setting == "symmetric":
        largest_value = max([abs(min(list_primary_scores)), abs(max(list_primary_scores))])
        
    players_lin_normalized = copy.deepcopy(players)

    if norm_type == "linear":
        for player_name, player_data in players_lin_normalized.items():
            player_data["primaryScore"] = normalize_lin(players_lin_normalized[player_name]["primaryScore"], smallest_value, largest_value, -1, 1)
        return players_lin_normalized
    elif norm_type == "sigmoid":
        for player_name, player_data in players_lin_normalized.items():
            player_data["primaryScore"] = normalize_lin(players_lin_normalized[player_name]["primaryScore"], smallest_value, largest_value, -3, 3)
        player_sig_normalized = copy.deepcopy(players_lin_normalized)
        for player_name, player_data in player_sig_normalized.items():
            player_data["primaryScore"] = normalize_sig(player_sig_normalized[player_name]["primaryScore"])
        return player_sig_normalized
    elif norm_type == "logit":
        for player_name, player_data in players_lin_normalized.items():
            player_data["primaryScore"] = normalize_lin(players_lin_normalized[player_name]["primaryScore"], smallest_value, largest_value, 0.01, 0.99)
        player_logit_normalized = copy.deepcopy(players_lin_normalized)
        for player_name, player_data in player_logit_normalized.items():
            player_data["primaryScore"] = normalize_logit(player_logit_normalized[player_name]["primaryScore"])
        return player_logit_normalized
    else:
        raise ValueError(f"Normalization type was invalid: {primaryNormOptions['type']}")

def normalize_pairPerformance(player_to_player_data: Dict[str, Dict[str, int]],
                              normalization_settings,
                              player_data: Dict[str, Dict[str, any]]):
    norm_type = normalization_settings["NormSettingsPairPerformance"]["type"]
    if norm_type == "off":
        return player_to_player_data
    min_value_setting, max_value_setting = normalization_settings["NormSettingsPairPerformance"]["minValue"], normalization_settings["NormSettingsPairPerformance"]["maxValue"]

    list_ptp_values = [x for xs in [[player_to_player_data[p1][p2] for p2 in player_to_player_data[p1]] for p1 in player_to_player_data.keys()] for x in xs]

    if min_value_setting == "custom":
        smallest_value = normalization_settings["NormSettingsPairPerformance"]["minValue"]
    elif min_value_setting == "smallest_value":
        smallest_value = min(list_ptp_values)
    elif min_value_setting == "largest_value":
        smallest_value = max(list_ptp_values)
    elif min_value_setting == "symmetric":
        smallest_value = -max([abs(min(list_ptp_values)), abs(max(list_ptp_values))])

    if max_value_setting == "custom":
        largest_value = normalization_settings["NormSettingsPairPerformance"]["maxValue"]
    elif max_value_setting == "smallest_value":
        largest_value = min(list_ptp_values)
    elif max_value_setting == "largest_value":
        largest_value = max(list_ptp_values)
    elif max_value_setting == "symmetric":
        largest_value = max([abs(min(list_ptp_values)), abs(max(list_ptp_values))])

    if normalization_settings["NormSettingsPairPerformance"]["weight"] == "automatic":
        primary_score_list = [player_data[player_name]["primaryScore"] for player_name in player_data.keys()]
        ptp_weight = (abs(max(primary_score_list)) + abs(min(primary_score_list))) / (abs(max(list_ptp_values)) - abs(min(list_ptp_values)))
        if ptp_weight < 1/10:
            ptp_weight = 1/10
        elif ptp_weight > 5:
            ptp_weight = 5
    else:
        ptp_weight = float(normalization_settings["NormSettingsPairPerformance"]["weight"])

    ptp_lin_norm = {p1: {} for p1 in player_to_player_data}

    if norm_type == "linear":
        for p1 in player_to_player_data.keys():
            for p2 in player_to_player_data[p1].keys():
                ptp_lin_norm[p1][p2] = normalize_lin(player_to_player_data[p1][p2], smallest_value, largest_value, -1, 1) * ptp_weight
        return ptp_lin_norm
    elif norm_type == "sigmoid":
        for p1 in player_to_player_data.keys():
            for p2 in player_to_player_data[p1].keys():
                ptp_lin_norm[p1][p2] = normalize_lin(player_to_player_data[p1][p2], smallest_value, largest_value, -3, 3)
        ptp_sigmoid_norm = {}
        for p1 in ptp_lin_norm.keys():
            ptp_sigmoid_norm[p1] = {}
            for p2 in ptp_lin_norm[p1].keys():
                ptp_sigmoid_norm[p1][p2] = normalize_sig(ptp_lin_norm[p1][p2]) * ptp_weight
        return ptp_sigmoid_norm
    elif norm_type == "logit":
        for p1 in player_to_player_data.keys():
            for p2 in player_to_player_data[p1].keys():
                ptp_lin_norm[p1][p2] = normalize_lin(player_to_player_data[p1][p2], smallest_value, largest_value, 0.01, 0.99)
        ptp_logit_norm = {}
        for p1 in ptp_lin_norm.keys():
            ptp_logit_norm[p1] = {}
            for p2 in ptp_lin_norm[p1].keys():
                ptp_logit_norm[p1][p2] = normalize_logit(ptp_lin_norm[p1][p2])
        return ptp_logit_norm
    else:
        raise ValueError(f"Normalization type was invalid: {normalization_settings['NormSettingsPairPerformance']['type']}") * ptp_weight