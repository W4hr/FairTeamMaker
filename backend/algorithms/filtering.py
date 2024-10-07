from typing import Dict, Tuple

# Filtering for attending Players
def get_attending_players(players: Dict[str,Dict[str, int]]
                          ) -> Dict[str, Dict[str, int | bool]]:
    return {player_name: player_data for player_name, player_data in players.items() if player_data["attendanceState"]}

# Filtering for attending Players
def get_unallocated_allocated_players(players: Dict[str,Dict[str, int]],
                            teams: Dict[str, Dict[str, str | list]]
                            ) -> Tuple[
                                Dict[str, Dict[str, int]],
                                Dict[str, Dict[str, int]]
                                ]:
    allocated_players = [x for xs in [teams[t]["players"] for t in teams] for x in xs]
    return {player_name: data for player_name, data in players.items() if player_name not in allocated_players}, {player_name: data for player_name, data in players.items() if player_name in allocated_players}