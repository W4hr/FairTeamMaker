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
            "color": "#3B8E5D",
            "number_of_players": 2,
            "matches": {},
            "pitches": ["Pitch 1"],
            "teams": {
                "Team 1": {
                    "num_players": None,
                    "players": []
                },
                "Team 2": {
                    "num_players": None,
                    "players": []
                }
            },
            "settings": {
                "interchangeableTeams": True,
                "maxSittingOut": 2,
                "maxDifferenceTeams": 2,
                "maxDifferencePitches": 2,
                "auto_save": False,
                "count_iterations": 10000,
                "algorithmChoice": "random",
                "normalizationSettings": {
                    "NormSettingsPrimaryScore": {
                        "status": True,
                        "type": "logit",
                        "minValue": "symmetric",
                        "minValueCustom": 0,
                        "maxValue": "symmetric",
                        "maxValueCustom": 10,
                        "minValueOutput": "automatic",
                        "minValueOutputCustom": 1,
                        "maxValueOutput": "automatic",
                        "maxValueOutputCustom": 3
                    },
                    "NormSettingsPairPerformance": {
                        "status": True,
                        "type": "logit",
                        "minValue": "symmetric",
                        "minValueCustom": 0,
                        "maxValue": "symmetric",
                        "maxValueCustom": 10,
                        "minValueOutput": "weight",
                        "minValueOutputCustom": 0.5,
                        "maxValueOutput": "weight",
                        "maxValueOutputCustom": 1.5,
                        "weight": "custom",
                        "weightCustom": 0.4
                    }
                }
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
