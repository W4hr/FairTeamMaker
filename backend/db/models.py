from pydantic import BaseModel, Field, ConfigDict
from datetime import datetime
from typing import Optional

class UserModel(BaseModel):
    _id: Optional[str] = Field(None, alias="_id")
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

class LogInForm(BaseModel):
    username: str
    password: str