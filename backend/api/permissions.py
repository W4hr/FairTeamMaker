from typing import Dict

from backend.db.models import UserModel, Project

def can_project_analysis(user: UserModel, project: Project):
    if (user.permissions.custom_iteration_count):
        if (project.settings.count_iterations <= user.permissions.max_iterations_count):
            return True
        else:
            return False
    else:
        return False

def can_save(user: UserModel):
    if (user.permissions.saving and user.count_saves < user.permissions.max_saves):
        return True
    else:
        return False