from typing import Dict

def get_attending_players(players: Dict[str, Dict[str, int]]) -> Dict[str, Dict[str, int | bool]]:
    return {player_name: {"primaryScore": player_data["primaryScore"]} for player_name, player_data in players.items() if player_data["attendanceState"]}
