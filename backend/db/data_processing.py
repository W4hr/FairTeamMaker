import uuid
from typing import Dict, Any
from datetime import datetime as dt

def get_preview(project: dict):
    preview = project["preview_project"]
    preview["uuid"] = project["uuid"]
    return preview

def create_project_data(project: Any, user_id: str):
    full_project = {
        "owner": user_id,
        "uuid": str(uuid.uuid4()),
        "preview_project": {
            "name": project.name,
            "color": project.color,
            "save_reason": "Manual-Saved",
            "date": dt.now().strftime("%d.%m.%Y"),
            "time": dt.now().strftime("%H:%M")
        }
    }
    full_project["project"] = project
    return full_project