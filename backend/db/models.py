from pydantic import BaseModel, Field, ConfigDict

class UserModel(BaseModel):
    id: int = Field(alias="_id", default=None)
    username: str
    disabled: bool
    model_config = ConfigDict(
        extra="forbid",
        populate_by_name= True,
        json_schema_extra= {
            "example": {
                "_id": 1,
                "username": "example_user",
                "disabled": True
            }
        }
    )

class UserDB(UserModel):
    hashed_password: str

class TokenData(BaseModel):
    username : str | None = None

class Token(BaseModel):
    access_token: str
    token_type: str