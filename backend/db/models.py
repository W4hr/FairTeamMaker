from pydantic import BaseModel, Field, ConfigDict
from datetime import datetime
from typing import Optional, Dict, List
from bson import ObjectId

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