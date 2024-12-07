from typing import Dict
from motor.motor_asyncio import AsyncIOMotorClient

from backend.db.models import UserModel, Project

mongoclient = AsyncIOMotorClient("mongodb://localhost:27017")
mongodb = mongoclient["myWebsiteDB"]
mongoprojects = mongodb["projects"]

def can_project_analysis(user: UserModel, project: Project):
    if (user.permissions.custom_iteration_count):
        if (project.settings.count_iterations <= user.permissions.max_iterations_count):
            return True
        else:
            return False
    else:
        return False

def can_save(user: UserModel):
    if user.permissions.saving:
        user_count_saves = mongoprojects.count_documents({"owner": user.id})
        if user_count_saves < user.permissions.max_saves or user.permissions.max_saves == -1:
            return True
        else:
            return False
    else:
        return False