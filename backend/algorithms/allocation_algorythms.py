import itertools
import random
from typing import List, Dict
from calculations import calculate_team_score_difference, calculate_team_scores

def get_possible_games(team_size_allocate: List[int],
					   team_size_original: List[int],
					   available_players: Dict[str, dict],
					   teams: Dict[str, Dict[str, dict]],
					   amount_possibilities: int,
					   pairPerformance: Dict[str, Dict[str, int]],
					   players: Dict[str, dict],
					   matches: Dict[str, str],
					   amount_best_games: int,
					   player_count: int
					   ) -> List[Dict[str,Dict[int,Dict[str, dict]]]]:
	possible_games = []
	possibilities_count = 0
	available_players = list(available_players.items())
	random.shuffle(available_players) # shuffle to avoid repetitive patterns
	team_names = list(teams)
	players_needed = sum(team_size_original)
	print("started : ", player_count, " and ", players_needed)
	if players_needed == player_count:
		for player_order in itertools.permutations(available_players): # All permuations of all playing players
			possibility = {team: [] for team in teams}
			start = 0
			for index_team, team_size in enumerate(team_size_allocate):
				team_name = team_names[index_team]
				possibility[team_name] = player_order[start:start+team_size]
				start += team_size
			possible_games = sorted(possible_games, key=lambda x:list(list(x.values())[0].keys())[0], reverse=True)
			game_scores = calculate_team_scores(possibility, pairPerformance, teams, players)
			team_score_difference = calculate_team_score_difference(game_scores, matches)

			if possible_games:
				if team_score_difference > list(list(possible_games[0].values())[0].keys())[0] or len(possible_games) < amount_best_games:
					possible_games.append({f"possibility {possibilities_count}":{team_score_difference: possibility}})
					possible_games = sorted(possible_games, key=lambda x:list(list(x.values())[0].keys())[0], reverse=True)
					possible_games.pop(0)
				possibilities_count += 1
			else:
				possible_games.append({f"possibility {possibilities_count}":{team_score_difference: possibility}})
			print(possibilities_count)
			if possibilities_count >= amount_possibilities:
				break
	else:
		for player_combination in itertools.combinations(available_players, players_needed): # All combinations minus Sitting out players
			for player_order in itertools.permutations(player_combination): # All permuations of all playing players

				possibility = {team: [] for team in teams}
				start = 0
				for index_team, team_size in enumerate(team_size_allocate):
					team_name = team_names[index_team]
					possibility[team_name] = player_order[start:start+team_size]
					start += team_size
				possible_games = sorted(possible_games, key=lambda x:list(list(x.values())[0].keys())[0], reverse=True)
				game_scores = calculate_team_scores(possibility, pairPerformance, teams, players)
				team_score_difference = calculate_team_score_difference(game_scores, matches)

				if team_score_difference > list(possible_games[0][list(possible_games[0])[0]].keys())[0] or len(possible_games) < amount_best_games:
					possible_games.append({f"possibility {possibilities_count}":{team_score_difference: possibility}})
					possible_games = sorted(possible_games, key=lambda x:list(list(x.values())[0].keys())[0], reverse=True)
					possible_games.pop(0)
				possibilities_count += 1
				print(possibilities_count)
				if possibilities_count >= amount_possibilities:
					break
			if possibilities_count >= amount_possibilities:
				break
	print("finshed")
	return possible_games