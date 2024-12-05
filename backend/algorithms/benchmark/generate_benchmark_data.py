import random
import string
from typing import List, Dict, Optional
from backend.algorithms.team_size_processing import teams_sizes
from backend.algorithms.cpp_data_preperation import get_player_index_dict

from .benchmark_algorithms import random as cpp_random
# Variables

from motor.motor_asyncio import AsyncIOMotorClient

mongoclient = AsyncIOMotorClient("mongodb://localhost:27017")
mongodb = mongoclient["myWebsiteDB"]
mongobenchmarks = mongodb["benchmarks"]

player_count_Options: List[int] = [4, 10, 20, 45, 100]
amount_allocated_players_percent_Options: List[float] = [0, 0.02, 0.15, 0.3, 0.65, 0.85, 1]
interchangableSettings_Options: List[bool] = [True, False]
maxSittingOutpercent_Options: List[float] = [0, 0.02, 0.3, 0.5, 0.75, 0.95]
amount_teams_Options: List[int] = [2, 4, 8, 14]

def run_benchmarks(player_count_Options, amount_allocated_players_percent_Options, interchangableSettings_Options, maxSittingOutpercent_Option, amount_teams_Options):    
    i = 0
    for player_count in player_count_Options:
        player_relationships = generate_relationship_matrix(player_count)
        players_names = generate_string_list(player_count, 3)
        amount_allocated_players = [p*player_count for p in amount_allocated_players_percent_Options]
        max_sitting_out_list = [p*player_count for p in maxSittingOutpercent_Option]
        for amount_allocated_player in amount_allocated_players:
            for max_sitting_out in max_sitting_out_list:
                for team_count in amount_teams_Options:
                    team_sizes, allocated_players = get_teams_sizes(player_count, amount_allocated_player, max_sitting_out, team_count, players_names)
                    allocated_players_indexes, players_skills, unallocated_players = player_data_preperation(allocated_players, players_names)
                    if team_sizes:
                        if len(team_sizes) > 10:
                            team_sizes = team_sizes[:9]
                        for interchangable in interchangableSettings_Options:
                            i += 1
                            result: Dict[str, Dict[str, any]] = {
                                "player_count" : player_count,
                                "amount_allocated_player" : amount_allocated_player,
                                "max_sitting_out" : max_sitting_out,
                                "team_count" : team_count,
                                "interchangable": interchangable,
                                "teams_sizes": teams_sizes,
                                "results" : cpp_random(team_sizes, 700000, allocated_players_indexes, players_skills, unallocated_players, 10, player_relationships, interchangable)
                            }
                            mongobenchmarks.insert_one(result)

def generate_string_list(length_list: int, length_str: int) -> List[str]:
    string_set: set = set()
    while len(string_set) < length_list:
        random_string: str = "".join([random.choice(string.ascii_lowercase) for _ in range(length_str)])
        string_set.add(random_string)
    return list(string_set)

def get_teams_sizes(player_count: int, count_allocated_players: int, count_max_sitting_out: int, count_teams: int, players_names: List[str]):
    teams_names = generate_string_list(count_teams, 3)
    allocated_players_names = random.sample(players_names, count_allocated_players)
    allocated_players_teams = randomly_split_list(allocated_players_names, count_teams)
    teams = {}
    for i, _ in enumerate(count_teams):
        teams[teams_names[i]] = {
            "num_players": None,
            "players": allocated_players_teams[i]
        }
    matches = {teams_names[i]: teams_names[i + 1] for i in range(0, len(teams_names), 2)}
    teams_sizes: List[List[int]] = teams_sizes(teams, matches, 4, 4, player_count, count_max_sitting_out)
    return teams_sizes, allocated_players_teams

def randomly_split_list(list: List[any],
                        count_splices: int
                        ) -> List[List[any]]:
    cuts: List[int] = [0] + sorted([random.randint(0, len(list)) for _ in range(0, count_splices)]) + [len(list)]
    return [list[cuts[i]:cuts[i + 1]] for i in range(0, len(cuts) - 1)]

def player_data_preperation(allocated_players_teams: List[List[Optional[str]]], players_names):
    player_index_dict = get_player_index_dict(players_names)

    allocated_players = [[player_index_dict[p] for p in team] for team in allocated_players_teams]

    player_skills = [random.randint(1, 3) for _ in players_names]

    flattened_allocated_players = [x for xs in allocated_players_teams for x in xs]
    unallocated_players_indexes = []
    for i, p in enumerate(players_names):
        if p not in flattened_allocated_players:
            unallocated_players_indexes.append(i)
    return allocated_players, player_skills, unallocated_players_indexes

def generate_relationship_matrix(number_players: int):
    relationship_matrix = [[0 for _ in range(number_players)] for _ in range(number_players)]

    for m in range(number_players):
        for n in range(number_players):
            if m != n:
                relationship_score = random.uniform(-1, 1)
                relationship_matrix[m][n] = relationship_score
                relationship_matrix[n][m] = relationship_score
            else:
                relationship_matrix[m][n] = 0
    return relationship_matrix

if __name__ == "__main__":
    run_benchmarks(player_count_Options, amount_allocated_players_percent_Options, interchangableSettings_Options, maxSittingOutpercent_Options, amount_teams_Options)