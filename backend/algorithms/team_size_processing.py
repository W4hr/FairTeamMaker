from typing import List, Dict, Tuple, Optional, Any
import itertools

def get_opponent_index(index_team: int, 
                       teams: Dict[str, dict], 
                       matches: Dict[str, str]
                       ) -> int:
    return list(teams).index(matches[list(teams)[index_team]])

def set_team_sizes(teams:Dict[str, dict]
                   ) -> Tuple[List[Optional[int]], List[int]]: ## Make order of teams in dictionary in pairs of opponent teams -> frontend
    teams_sizes = []
    for team_name in teams:
        team = teams[team_name]
        if team["num_players"] != None:
            teams_sizes.append(team["num_players"])
        else:
            teams_sizes.append(None)
    determined_team_sizes = [x for x in teams_sizes if x is not None]
    return teams_sizes, determined_team_sizes

def set_min_team_size(teams_sizes: List[Optional[int]], 
                      determined_team_sizes: List[int],
                      maxDifferenceTeams:int,
                      maxDifferencePitch:int,
                      teams: Dict[str, dict],
                      matches: Dict[str, str]
                      ) -> List[Optional[int]]:
    minimum_team_sizes = [None] * len(teams)
    for index, team in enumerate(teams_sizes): # iterate over all Teams. Requires output from: set_team_sizes 
        if team == None:
            potential_minimum_teams_sizes = [1] # set the absolute minimum team size to 1 -> appending all possible minimum team sizes later
            # maxDifferenceTeams to opponent as minimum
            opponent_index = get_opponent_index(index, teams, matches)

            if teams[list(teams)[index]]["players"]: # add potential minimum in case of allocated players to team
                potential_minimum_teams_sizes.append(len(teams[list(teams)[index]]["players"]))

            # maxDifferencePitches to biggest team with determined size
            if determined_team_sizes and maxDifferencePitch != None: # add potential minimum in case maxDifferencePitch
                potential_minimum_teams_sizes.append(max(determined_team_sizes) - maxDifferencePitch)

            if isinstance(maxDifferenceTeams, int): # 
                if teams[list(teams)[opponent_index]]["players"]: # add potential minimum in case of allocated players to opponent team
                    potential_minimum_teams_sizes.append(len(teams[list(teams)[opponent_index]]["players"]) - maxDifferenceTeams)
                if isinstance(teams_sizes[opponent_index], int): # add potential minimum in case of opponent team hast set team size and maxDifferenceTeams
                    potential_minimum_teams_sizes.append(teams_sizes[opponent_index] - maxDifferenceTeams)

            minimum_team_size = max(potential_minimum_teams_sizes)
            if minimum_team_size > 0:
                minimum_team_sizes[index] = minimum_team_size
            else:
                minimum_team_sizes[index] = 1
        else:
            minimum_team_sizes[index] = None
    return minimum_team_sizes

def set_max_team_size(teams_sizes: List[Optional[int]],
                      determined_team_sizes: List[int],
                      maxDifferenceTeams: int,
                      maxDifferencePitch: int,
                      teams: Dict[str, dict],
                      matches: Dict[str, str],
                      player_count: int,
                      minimum_team_sizes: List[int]
                      ) -> List[Optional[int]]:
    maximum_team_sizes = [None] * len(teams)
    for index, team in enumerate(teams_sizes):
        if team == None:
            potential_maximum_team_sizes = [player_count - (len(teams) - 1)] ## Check that there are at least as many players as teams

            minimum_team_sizes_exist:bool = any(x is not None for x in minimum_team_sizes)
            # playercount minus already allocated players
            if determined_team_sizes:
                if minimum_team_sizes_exist:
                    potential_maximum_team_sizes.append(player_count - (sum([x-1 for i,x in enumerate(minimum_team_sizes) if x is not None and i != index]) + sum([x - 1 for x in determined_team_sizes]) + (len(teams) - 1))) # if there are variable team sizes -> possible max at player_count minux the minimum_teams_sizes of the other teams (minus one for each to ballance later subtracing one player for each team) minus the players already allocated to a other team and lastly minus one player for each other team
                else:
                    print("else")
                    potential_maximum_team_sizes.append(player_count - sum([x - 1 for x in determined_team_sizes]) - (len(teams) - 1)) # possible max when subtracting allocated player count and one player from each other team from the total player count
            else:
                if [x for x in minimum_team_sizes if x is not None]:
                    potential_maximum_team_sizes.append(player_count - (sum([x-1 for i,x in enumerate(minimum_team_sizes) if x is not None and i != index]) + (len(teams) - 1))) # possible max when subtracting minimal teams sizes from the other teams from all players


            # maxDifferenceTeams to opponent as minimum
            opponent_index = get_opponent_index(index, teams, matches)

            if type(teams_sizes[opponent_index]) == int and type(maxDifferenceTeams) == int:
                potential_maximum_team_sizes.append(teams_sizes[opponent_index] + maxDifferenceTeams)

            # maxDifferencePitches to smallest team with determined size
            if determined_team_sizes and maxDifferencePitch:
                potential_maximum_team_sizes.append(min(determined_team_sizes) + maxDifferencePitch)

            maximum_team_sizes[index] = min(potential_maximum_team_sizes)
        else:
            maximum_team_sizes[index] = None
    return maximum_team_sizes

def combine_team_size_min_max(team_sizes: List[Optional[int]],
                              minimum_teams_sizes: List[int],
                              maximum_teams_sizes: List[int]
                              ) -> List[int | List[int]]: # combine the team_sizes, minimum_teams_sizes as well as maximum_teams_sizes
    return [
        team if team is not None else [minimum_teams_sizes[index], maximum_teams_sizes[index]] for index, team in enumerate(team_sizes)
    ]

def get_teams_sizes_ranges(teams_sizes: List[int | List[int]]) -> List[List[int]]: # convert minimum and maximum to a range list
    return [list(range(x[0], x[1]+1)) if isinstance(x, list) else [x] for x in teams_sizes]

def get_possible_teams_sizes(teams_sizes_range : List[List[int]]) -> List[List[int]]:
    return [list(i) for i in itertools.product(*teams_sizes_range)]

def check_validity_possible_teams_sizes(possible_teams_sizes: List[List[int]],
                                        maxDifferenceTeams: int,
                                        maxDifferencePitch: int,
                                        teams: Dict[str, Dict[str, Any]],
                                        matches: Dict[str, str],
                                        player_count: int,
                                        maximum_number_players_sitting_out: int
                                        ) -> Tuple[List[List[int]], List[int]]:
    valid_possible_teams_sizes = []
    valid_possible_teams_team_differences = []

    count_allocated_players = len([x for xs in [team_data["players"] for team_name, team_data in teams.items()] for x in xs])
    for possible_game in possible_teams_sizes: # iterate over possible games
        teams_sizes_difference = 0
        if sum(possible_game) in range(player_count - maximum_number_players_sitting_out - count_allocated_players, player_count - count_allocated_players + 1) and max(possible_game) - min(possible_game) <= maxDifferencePitch: # check that the players needed for the game are in the range of all players and the maximum number of players sitting out AND the largest team being a maximum amount larger then the smallest team
            valid_team_size_difference = True
            for index, team_size in enumerate(possible_game): # iterate over all team sizes in possible game
                team_size_difference = abs(possible_game[get_opponent_index(index, teams, matches)] - team_size) # the difference in players between the team and the opponent team
                if team_size_difference > maxDifferenceTeams:
                    valid_team_size_difference = False # set to false and there for not append if game is not valid if the enemy team is a given amount larger or smaller then the team
                    break
                else:
                    teams_sizes_difference += team_size_difference
            if valid_team_size_difference:
                valid_possible_teams_sizes.append(list(possible_game))
                valid_possible_teams_team_differences.append(int(teams_sizes_difference/2))
    return valid_possible_teams_sizes, valid_possible_teams_team_differences # -> [[1,2,3,4], [4,3,2,1]]; # First is the valid team sizes the other is a list of total difference for the whole game between teams

# Sort the possible team sizes by most similar:
def teams_sizes_sorted(valid_possible_teams_sizes: List[List[int]],
                       teams: Dict[str, Dict[str, Any]],
                       matches: Dict[str, str],
                       difference_between_teams: List[int],
                       weight_difference_team_to_pitches:int
                       ) -> List[List[int]]:
    def get_list_pitch_difference(valid_possible_teams_sizes: List[List[int]],
                                teams: Dict[str, Dict[str, Any]],
                                matches: Dict[str, str]
                                ) -> List[int]: 
        valid_possible_teams_pitch_differences = []
        for index_game, game in enumerate(valid_possible_teams_sizes):
            pitch_difference = []
            for index_team, team in enumerate(game):
                opponent_index = get_opponent_index(index_team, teams, matches)
                pitch_difference.append(team + valid_possible_teams_sizes[index_game][opponent_index])

            valid_possible_teams_pitch_differences.append(max(pitch_difference) - min(pitch_difference))
        return valid_possible_teams_pitch_differences

    def sort_valid_possible_teams_sizes_by_most_similar_in_size(difference_between_teams:list,
                                                                difference_between_pitches:list,
                                                                valid_possible_teams_sizes:list,
                                                                weight_difference_team_to_pitches:int
                                                                ) -> List[List[int]]:
        difference_between_teams = [x * weight_difference_team_to_pitches for x in difference_between_teams] # apply weight to list based of user preference
        differences = [x + y for x,y in zip(difference_between_teams, difference_between_pitches)]
        _ , sorted_valid_possible_teams = zip(*sorted(zip(differences, valid_possible_teams_sizes)))
        return sorted_valid_possible_teams # [2,3,4,5]
    
    difference_between_pitches = get_list_pitch_difference(valid_possible_teams_sizes, teams, matches)
    return sort_valid_possible_teams_sizes_by_most_similar_in_size(difference_between_teams, difference_between_pitches, valid_possible_teams_sizes, weight_difference_team_to_pitches)

### WRAPER

def teams_sizes(teams : Dict[str, dict],
                matches: Dict[str, str],
                maxDifferenceTeams: int,
                maxDifferencePitch: int,
                player_count: int,
                maximum_number_players_sitting_out: int
                ) -> List[List[int]]:

    teams_sizes, determined_team_sizes = set_team_sizes(teams)
    minimum_teams_sizes = set_min_team_size(teams_sizes, determined_team_sizes, maxDifferenceTeams, maxDifferencePitch, teams, matches)
    maximum_teams_sizes = set_max_team_size(teams_sizes, determined_team_sizes, maxDifferenceTeams, maxDifferencePitch, teams, matches, player_count, minimum_teams_sizes)
    min_max_teams_sizes = combine_team_size_min_max(teams_sizes, minimum_teams_sizes, maximum_teams_sizes)

    possible_team_sizes = get_possible_teams_sizes(get_teams_sizes_ranges(min_max_teams_sizes))
    valid_possible_team_sizes, difference_between_teams = check_validity_possible_teams_sizes(possible_team_sizes, maxDifferenceTeams, maxDifferencePitch, teams, matches, player_count, maximum_number_players_sitting_out)
    return teams_sizes_sorted(valid_possible_team_sizes, teams, matches, difference_between_teams, 1)