from pydantic import BaseModel, Field, ConfigDict, validator, model_validator
from datetime import datetime
from typing import Optional, Dict, List
from bson import ObjectId

import logging
model_logger = logging.getLogger("models")
file_handler = logging.FileHandler("models.log", mode="w")
file_handler.setFormatter(logging.Formatter("%(asctime)s - %(levelname)s - %(message)s"))
model_logger.addHandler(file_handler)
model_logger.setLevel(logging.DEBUG)

class UserModel(BaseModel):
    id: Optional[str] = Field(None, alias="_id")
    username: str
    disabled: bool = False
    hashed_password: str
    model_config = ConfigDict(
        extra="forbid",
        populate_by_name= True,
        json_schema_extra= {
            "example": {
                "_id": "6512fbd2c9b3129f730c1234",
                "username": "example_user",
                "disabled": True,
                "hashed_password": "example_hash"
            }
        }
    )

class TokenData(BaseModel):
    sub : str | None = None
    exp: int

class Token(BaseModel):
    access_token: str
    token_type: str


class Player(BaseModel):
    attendanceState: bool
    primaryScore: float
    scores: Dict[str, float]
    @validator("primaryScore")
    def primaryScore_non_negative_validator(cls, v):
        if v < 0:
            model_logger.error("Primary score must be non-negative. Given: {v}")
            raise ValueError(f"Primary score must be non-negative. Given: {v}")
        return v

class Team(BaseModel):
    num_players: Optional[int] = None
    players: List[str]

class Category(BaseModel):
    name: str
    minimumValue: Optional[float] = None
    maximumValue: Optional[float] = None

class Settings(BaseModel):
    interachangableTeams: bool
    maxSittingOut: int
    maxDifferenceTeams: int
    maxDifferencePitches: int
    auto_save: bool

class Project(BaseModel):
    name: str
    description: str
    color: str
    number_of_players: int
    matches: Dict[str, str]
    teams: Dict[str, Team]
    settings: Settings
    categories: List[Category]
    players: Dict[str, Player]
    pairPerformance: Dict[str, Dict[str, int]]

    @model_validator(mode="after")
    def number_of_players_consistency_validator(cls, values):
        if len(values.get("players")) != len(values.get("pairPerformance")):
            model_logger.error("The number of players must match the pairPerformance dictionary keys.")
            raise ValueError("The number of players must match the pairPerformance dictionary keys.")
        if values.get("number_of_players") != len(values.get("players")):
            model_logger.error("The 'number_of_players' field must match the number of players in the project.")
            raise ValueError("The 'number_of_players' field must match the number of players in the project.")
        return values
    
    @model_validator(mode="after")
    def pairPerformance_validator(cls, values):
        pairPerformance_dict = values.get("pairPerformance")
        list_player_names = list(values.get("players").keys())

        for player_name in list_player_names:
            if player_name not in pairPerformance_dict:
                model_logger.error(f"Missing player '{player_name}' in 'pairPerformance'.")
                raise ValueError(f"Missing player '{player_name}' in 'pairPerformance'.")
            else:
                for pairplayer_name in list_player_names:
                    if pairplayer_name not in pairPerformance_dict[player_name]:
                        model_logger.error(f"Missing pair '{pairplayer_name}' for player '{player_name}' in 'pairPerformance'.")
                        raise ValueError(f"Missing pair '{pairplayer_name}' for player '{player_name}' in 'pairPerformance'.")
        return values
    
    @model_validator(mode="after")
    def categorie_validator(cls, values):
        categories_list = values.get("categories")
        player_dict = values.get("players")

        for category in categories_list:
            for player_name, player in player_dict.items():
                score = player.scores.get(category.name)
            if score is None:
                model_logger.error(f"Player '{player_name}' missing score for category '{category.name}'.")
                raise ValueError(f"Player '{player_name}' missing score for category '{category.name}'.")
            if category.minimumValue is not None and score < category.minimumValue:
                model_logger.error(f"Score {score} for '{player_name}' below minimum {category.minimumValue} for category '{category.name}'.")
                raise ValueError(f"Score {score} for '{player_name}' below minimum {category.minimumValue} for category '{category.name}'.")
            if category.maximumValue is not None and score > category.maximumValue:
                model_logger.error(f"Score {score} for '{player_name}' above maximum {category.maximumValue} for category '{category.name}'.")
                raise ValueError(f"Score {score} for '{player_name}' above maximum {category.maximumValue} for category '{category.name}'.")
        return values
    
    @model_validator(mode="after")
    def team_validator(cls, values):
        teams_dict = values.get("teams")
        for team_name, team  in teams_dict.items():
            if team.num_players != None or len(team.players) > team.num_players:
                model_logger.error(f"Team '{team_name}' has {len(team.players)} players, exceeding the specified limit of {team.num_players}.")
                raise ValueError(f"Team '{team_name}' has {len(team.players)} players, exceeding the specified limit of {team.num_players}.")
                
        return values