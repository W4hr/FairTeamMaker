from datetime import datetime
import uuid

def create_default_starter_project():
    return {
        "owner" : "id",
        "uuid": str(uuid.uuid4()),
        "preview_project": {
            "name": "Project Name",
            "color": "#529955",
            "save_reason": "Auto-Saved",
            "date": datetime.now().strftime("%d.%m.%Y"),
            "time": datetime.now().strftime("%H:%M")
        },
        "project": {
            "name": "Project Name",
            "description": "Project Description",
            "color": "#529955",
            "number_of_players": 2,
            "matches": {},
            "teams": {},
            "settings": {
                "interachangableTeams": True,
                "maxSittingOut": 2,
                "maxDifferenceTeams": 2,
                "maxDifferencePitches": 2,
                "auto-save": "False"
            },
            "categories": [],
            "players": {
                "player 1": {
                    "attendanceState": True,
                    "primaryScore": 0,
                    "scores": {}
                },
                "player 2": {
                    "attendanceState": True,
                    "primaryScore": 0,
                    "scores": {}
                }
            },
            "pairPerformance": {
                "player 1": {
                    "player 1": 0,
                    "player 2": 1
                },
                "player 2": {
                    "player 1": 1,
                    "player 2": 0
                }
            }
        }
    }
