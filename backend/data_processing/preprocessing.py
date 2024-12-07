from typing import Dict, List
import copy
from .normalization import normalize_lin, normalize_sig, normalize_logit

import logging
preprocessing_logger = logging.getLogger(__name__)

def normalize_primary_score(players: Dict[str, Dict[str, float]],
                            normalization_settings
                            ) -> Dict[str, Dict[str, int]]: # max_score and min_score between two values the primaryScore takes playe and min and max defines between two values the output will be
    try:
        primaryNormOptions = normalization_settings["NormSettingsPrimaryScore"]
        norm_status = primaryNormOptions["status"]
        if not norm_status:
            return players
        preprocessing_logger.debug(f"Normalization Primary Score settings = {primaryNormOptions}")
        preprocessing_logger.debug(f"Normalization Primary Score status = {norm_status}")

        min_value_setting, max_value_setting = primaryNormOptions["minValue"], primaryNormOptions["maxValue"]

        # determining smallest value
        list_primary_scores = [players[p]["primaryScore"] for p in players]
        if min_value_setting == "custom":
            smallest_value = primaryNormOptions["minValueCustom"]
        elif min_value_setting == "smallest_value":
            smallest_value = min(list_primary_scores)
        elif min_value_setting == "largest_value":
            smallest_value = max(list_primary_scores)
        elif min_value_setting == "symmetric":
            smallest_value = -max([abs(min(list_primary_scores)), abs(max(list_primary_scores))])
        preprocessing_logger.debug(f"Normalization Primary Score smallest value = {smallest_value}")


        # determining largest value
        if max_value_setting == "custom":
            largest_value = primaryNormOptions["maxValueCustom"]
        elif max_value_setting == "smallest_value":
            largest_value = min(list_primary_scores)
        elif max_value_setting == "largest_value":
            largest_value = max(list_primary_scores)
        elif max_value_setting == "symmetric":
            largest_value = max([abs(min(list_primary_scores)), abs(max(list_primary_scores))])
        preprocessing_logger.debug(f"Normalization Primary Score largest value = {largest_value}")

        # determining smallest output value
        minValueOutput, maxValueOutput = primaryNormOptions["minValueOutput"], primaryNormOptions["maxValueOutput"]
        if minValueOutput == "automatic":
            smallest_output_value = 1
        elif minValueOutput == "custom":
            smallest_output_value = primaryNormOptions["minValueOutputCustom"]
        preprocessing_logger.debug(f"Normalization Primary Score smallest output value = {smallest_output_value}")

        if maxValueOutput == "automatic":
            largest_output_value = 3
        elif maxValueOutput == "custom":
            largest_output_value = primaryNormOptions["maxValueOutputCustom"]
        preprocessing_logger.debug(f"Normalization Primary Score largest output value = {largest_output_value}")


        players_lin_normalized = copy.deepcopy(players)
        norm_type = primaryNormOptions["type"]
        preprocessing_logger.debug(f"Normalization Primary Score type = {norm_type}")

        if norm_type == "linear":
            for player_name, player_data in players_lin_normalized.items():
                player_data["primaryScore"] = normalize_lin(players_lin_normalized[player_name]["primaryScore"], smallest_value, largest_value, smallest_output_value, largest_output_value)
            return players_lin_normalized
        elif norm_type == "sigmoid":
            for player_name, player_data in players_lin_normalized.items():
                player_data["primaryScore"] = normalize_lin(players_lin_normalized[player_name]["primaryScore"], smallest_value, largest_value, -3, 3)
            player_sig_normalized = copy.deepcopy(players_lin_normalized)
            for player_name, player_data in player_sig_normalized.items():
                player_data["primaryScore"] = normalize_sig(player_sig_normalized[player_name]["primaryScore"]) * (largest_output_value - smallest_output_value) + smallest_output_value
            return player_sig_normalized
        elif norm_type == "logit":
            for player_name, player_data in players_lin_normalized.items():
                player_data["primaryScore"] = normalize_lin(players_lin_normalized[player_name]["primaryScore"], smallest_value, largest_value, 0.1, 0.9)
            player_logit_normalized = copy.deepcopy(players_lin_normalized)
            for player_name, player_data in player_logit_normalized.items():
                player_data["primaryScore"] = normalize_logit(player_logit_normalized[player_name]["primaryScore"]) * (largest_output_value - smallest_output_value) + smallest_output_value
            return player_logit_normalized
        else:
            raise ValueError(f"Normalization type was invalid: {primaryNormOptions['type']}")
    except Exception as e:
        raise 

def normalize_pairPerformance(player_to_player_data: Dict[str, Dict[str, int]],
                              normalization_settings,
                              player_data: Dict[str, Dict[str, any]]
                              ):
    pairNormSettings = normalization_settings["NormSettingsPairPerformance"]
    norm_status: bool = pairNormSettings["status"]
    if not norm_status:
        return player_to_player_data
    min_value_setting, max_value_setting = pairNormSettings["minValue"], pairNormSettings["maxValue"]

    list_ptp_values = [x for xs in [[player_to_player_data[p1][p2] for p2 in player_to_player_data[p1]] for p1 in player_to_player_data.keys()] for x in xs]

    preprocessing_logger.debug(f"Normalization PairPerformance status = {norm_status}")

    if min_value_setting == "custom":
        smallest_value = pairNormSettings["minValueCustom"]
    elif min_value_setting == "smallest_value":
        smallest_value = min(list_ptp_values)
    elif min_value_setting == "largest_value":
        smallest_value = max(list_ptp_values)
    elif min_value_setting == "symmetric":
        smallest_value = -max([abs(min(list_ptp_values)), abs(max(list_ptp_values))])
    preprocessing_logger.debug(f"Normalization PairPerformance smallest value = {smallest_value}")

    if max_value_setting == "custom":
        largest_value = pairNormSettings["maxValueCustom"]
    elif max_value_setting == "smallest_value":
        largest_value = min(list_ptp_values)
    elif max_value_setting == "largest_value":
        largest_value = max(list_ptp_values)
    elif max_value_setting == "symmetric":
        largest_value = max([abs(min(list_ptp_values)), abs(max(list_ptp_values))])
    preprocessing_logger.debug(f"Normalization PairPerformance largest value = {largest_value}")

    if pairNormSettings["weight"] == "automatic":
        primary_score_list = [player_data[player_name]["primaryScore"] for player_name in player_data.keys()]
        ptp_weight = (abs(max(list_ptp_values)) - min(list_ptp_values)) / (abs(max(primary_score_list)) + abs(min(primary_score_list)))
        if ptp_weight < 1/10:
            ptp_weight = 1/10
        elif ptp_weight > 5:
            ptp_weight = 5
    else:
        ptp_weight = float(pairNormSettings["weightCustom"])
    preprocessing_logger.debug(f"Normalization PairPerformance weight = {ptp_weight}")

    ptp_lin_norm = {p1: {} for p1 in player_to_player_data}

    if pairNormSettings["minValueOutput"] == "custom":
        smallest_output_value = pairNormSettings["minValueOutputCustom"]
    else:
        primary_score_list_normalized = [player_data[player_name]["primaryScore"] for player_name in player_data.keys()]
        smallest_output_value = min(primary_score_list_normalized) * ptp_weight
    preprocessing_logger.debug(f"Normalization PairPerformance smallest output = {smallest_output_value}")

    if pairNormSettings["maxValueOutput"] == "custom":
        largest_output_value = pairNormSettings["maxValueOutputCustom"]
    else:
        if not primary_score_list_normalized:
            primary_score_list_normalized = [player_data[player_name]["primaryScore"] for player_name in player_data.keys()]
        largest_output_value = max(primary_score_list_normalized) * ptp_weight
    preprocessing_logger.debug(f"Normalization PairPerformance largest output = {largest_output_value}")

    norm_type = pairNormSettings["type"]
    preprocessing_logger.debug(f"Normalization PairPerformance type = {norm_type}")

    if norm_type == "linear":
        for p1 in player_to_player_data.keys():
            for p2 in player_to_player_data[p1].keys():
                ptp_lin_norm[p1][p2] = normalize_lin(player_to_player_data[p1][p2], smallest_value, largest_value, smallest_output_value, largest_output_value)
        return ptp_lin_norm
    elif norm_type == "sigmoid":
        for p1 in player_to_player_data.keys():
            for p2 in player_to_player_data[p1].keys():
                ptp_lin_norm[p1][p2] = normalize_lin(player_to_player_data[p1][p2], smallest_value, largest_value, -3, 3)
        ptp_sigmoid_norm = {}
        for p1 in ptp_lin_norm.keys():
            ptp_sigmoid_norm[p1] = {}
            for p2 in ptp_lin_norm[p1].keys():
                ptp_sigmoid_norm[p1][p2] = normalize_sig(ptp_lin_norm[p1][p2]) * (largest_output_value - smallest_output_value) + smallest_output_value
        return ptp_sigmoid_norm
    elif norm_type == "logit":
        for p1 in player_to_player_data.keys():
            for p2 in player_to_player_data[p1].keys():
                ptp_lin_norm[p1][p2] = normalize_lin(player_to_player_data[p1][p2], smallest_value, largest_value, 0.1, 0.9)
        ptp_logit_norm = {}
        for p1 in ptp_lin_norm.keys():
            ptp_logit_norm[p1] = {}
            for p2 in ptp_lin_norm[p1].keys():
                ptp_logit_norm[p1][p2] = normalize_logit(ptp_lin_norm[p1][p2]) * (largest_output_value - smallest_output_value) + smallest_output_value
        return ptp_logit_norm
    else:
        raise ValueError(f"Normalization type was invalid: {normalization_settings['NormSettingsPairPerformance']['type']}") * ptp_weight