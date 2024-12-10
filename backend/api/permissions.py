from typing import Dict
from motor.motor_asyncio import AsyncIOMotorClient
import logging

from backend.db.models import UserModel, Project

mongoclient = AsyncIOMotorClient("mongodb://localhost:27017")
mongodb = mongoclient["myWebsiteDB"]
mongoprojects = mongodb["projects"]

app_logger = logging.getLogger("app")
data_logger = logging.getLogger("data")

def can_project_analysis(user: UserModel, project: Project):
    if (user.permissions.custom_iteration_count):
        if (project.settings.count_iterations <= user.permissions.max_iterations_count):
            return True
        else:
            return False
    else:
        return False

async def can_save(user: UserModel):
    app_logger.debug("Checking if saving is permitted.")
    data_logger.debug(f"User: {user}")
    if user.permissions.saving:
        user_count_saves = await mongoprojects.count_documents({"owner": user.id})
        if user_count_saves < user.permissions.max_saves or user.permissions.max_saves == -1:
            return True
        else:
            return False
    else:
        return False