import math
from typing import List, Dict
from normalization import normalize_lin, normalize_norm

def calculate_team_scores(game: Dict[str, List[Dict]],
						  pairPerformance: Dict[str, Dict[str, int]],
						  teams: Dict[str, Dict],
						  players_data: Dict[str, Dict]
						  ) -> Dict[str, int]:
	team_scores = {}
	allocated_player_data = {team_name: {player: players_data[player] for player in team_data["players"]} for team_name, team_data in teams.items()}
	for team, players in allocated_player_data.items():
		if team in game:
			game[team].update(players)
	for team_name, team_players in game.items():
		team_scores[team_name] = 0
		for player_name, player_data in team_players.items():
			primaryScore = player_data["primaryScore"]
			team_scores[team_name] += primaryScore
			for player_name_pair in team_players:
				team_scores[player_name] += pairPerformance[player_name][player_name_pair]
				break
	return team_scores

def calculate_team_score_difference(team_scores: Dict[str, int],
									matches: Dict[str, str]
									) -> float:
    difference = 0
    for team in team_scores:
        difference += abs(team_scores[team] - team_scores[matches[team]])
    return difference/2


def distribute_amount_of_combinations_to_calculate(desired_amount_of_combinations: int,
												   amount_different_potential_team_sizes: int) -> list:
    def get_k(desired_amount_of_combinations, amount_different_potential_team_sizes):
        max_norm = 2
        min_norm = 0
        mn = 0
        gaussian_sum = sum([math.e**-((x - mn)/(amount_different_potential_team_sizes-mn)*(max_norm-min_norm)+min_norm)**2 for x in range(0, amount_different_potential_team_sizes)])
        return desired_amount_of_combinations / gaussian_sum
    
    k = get_k(desired_amount_of_combinations, amount_different_potential_team_sizes)
    lin_normalized = [normalize_lin(v, 0, amount_different_potential_team_sizes, 0, 2) for v in range(0, amount_different_potential_team_sizes)]
    return normalize_norm(lin_normalized, k)