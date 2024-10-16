from pydantic import BaseModel, Field, ConfigDict
from datetime import datetime
from bson import ObjectId

class UserModel(BaseModel):
    _id: ObjectId
    username: str
    disabled: bool
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

class UserDB(UserModel):
    hashed_password: str

class TokenData(BaseModel):
    sub : str | None = None
    exp: datetime

class Token(BaseModel):
    access_token: str
    token_type: str