from typing import Dict, List

from .data_processing.team_size_processing import teams_sizes as get_teams_sizes
from .data_processing.calculations import distribute_amount_of_combinations_to_calculate
from .data_processing.preprocessing import normalize_primary_score
from .data_processing.filtering import get_attending_players, get_unallocated_allocated_players, compress_players_dictionary
from .data_processing.brute_force import get_possible_games

### THIS IS THE SLOWER PURE PYTHON BRUTE FORCE IMPLEMENTATION

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
              amount_best_games: int
              ):
    teams_sizes: List[List[int]] = get_teams_sizes(teams, matches, maxDifferenceTeams, maxDifferencePitch, player_count, maximum_number_players_sitting_out)
    amount_of_tries_for_each_team_size = distribute_amount_of_combinations_to_calculate(desired_amount_of_combinations, round(len(teams_sizes)* dispersion_tries))
    
    attending_players = get_attending_players(players)
    compressed_players = compress_players_dictionary(attending_players)
    normalized_players = normalize_primary_score(compressed_players, 4, 1, 1, 8)
    unallocated_players, allocated_players = get_unallocated_allocated_players(normalized_players, teams)
    
    print(normalized_players)

    number_allocated_players = [len(team["players"]) for team in teams.values()]
    possible_games = []
    for index, amount_of_tries in enumerate(amount_of_tries_for_each_team_size):
        team_size_original = [x + y for x, y in zip(number_allocated_players, teams_sizes[index])]
        possible_games.append(get_possible_games(teams_sizes[index], team_size_original, unallocated_players, teams, round(amount_of_tries), pairPerformance, normalized_players, matches, amount_best_games, player_count))
    print(amount_of_tries_for_each_team_size)
    return possible_games        