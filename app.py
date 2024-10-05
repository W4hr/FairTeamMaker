from fastapi import FastAPI, status, Body, Response, Depends, HTTPException
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from pydantic import BaseModel, Field, ConfigDict
from typing import List, Optional
from datetime import datetime, timedelta
from jose import JWTError, jwt
from passlib.context import CryptContext
from pymongo import MongoClient
import database
import json

from backend.db.models import TokenData, UserDB, Token


app = FastAPI()

SECRET_KEY = "e4852d8660fda6f5f21637818338c639b0d267bda1d228e04fb91ec3dde06ed1"
ALGORYTHM = "HS256"
ACCESS_TOKEN_EXPIRES = 1800 # Seconds (1800 = 30 min)

# MongoDB
mongoclient = MongoClient("mongodb://localhost:27017")
mongodb = mongoclient["myWebsiteDB"]
mongousers = mongodb["users"]
mongoprojects = mongodb["projects"]

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
oAuth2_scheme = OAuth2PasswordBearer(takenURL="token")

def verify_password(password:str, hashed_password:str):
    return pwd_context.verify(password, hashed_password)

def generate_password_hash(password: str):
    return pwd_context.hash(password)

def get_user(username:str) -> dict:
    user = mongousers.find_one({"username": username}, {"_id": 0, "username": 1,"password": 1})
    return user if user else None

def authenticate_user(username:str , password: str) -> bool:
    user = get_user(username)
    if user and verify_password(password, get_user(username)["password"]):
        return True
    return False
    
def create_jwt_access_token(data: dict, expires_delta: timedelta | None = None):
    encode_data = data.copy()
    if expires_delta:
        expires_date = datetime.utcnow() + expires_delta
    else:
        expires_date = datetime.utcnow() + timedelta(minutes=15)
    encode_data.update({"expires_date": expires_date})
    encoded_jwt_token = jwt.encode(encode_data, SECRET_KEY, algorithm=ALGORYTHM)
    return encoded_jwt_token

async def get_current_user(token: str = Depends(oAuth2_scheme)):
    credential_exception = HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Could not validate credentials", headers={"WWW-Authenticate" : "Bearer"})
    try:
        jwt_payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORYTHM])
        username : str = jwt_payload.get("sub") # Needs to be understood
        if username == None:
            raise credential_exception
        
        Token_Data = TokenData(username=username) # Maybe Remove
    except JWTError:
        raise credential_exception
    
    user = get_user(username=Token_Data.username)
    if user is None:
        raise credential_exception
    
    return user

async def get_current_active_user(current_user: UserDB = Depends(get_current_user)):
    if current_user.disabled:
        raise HTTPException(status_code=400, detail="Inactive user")
    
    return current_user

@app.post("/token", response_model=Token)
async def login_token(login_form: OAuth2PasswordRequestForm = Depends()):
    user = authenticate_user(login_form.username, login_form.password)
    if not user:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="incorrect username or password", headers={"WWW-Authenticate" : "Bearer"})
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRES)

class UserModel(BaseModel):
    id: int = Field(alias="_id", default=None)
    username: str
    password: str
    model_config = ConfigDict(
        extra="forbid",
        populate_by_name= True,
        json_schema_extra= {
            "example": {
                "_id": 1,
                "username": "example_user",
                "password": "hashed_password"
            }
        }

    )


@app.post(
        "/addUser",
        response_description="Sign Up User",
        response_model=UserModel,
        status_code=status.HTTP_201_CREATED,
        response_model_by_alias= False)
async def addUser(user: UserModel = Body(...)):
    if len(user.username) < 3 and len(user.password) > 4:
        return {"msg-sign-up": "password or username is too short"}
    else:
        if users.find({"username" : user.username}):
            return status.HTTP_409_CONFLICT
        else:
            new_user = await users.insert_one(user.model_dump(by_alias=False, exclude=["id"]))
            return status.HTTP_201_CREATED

@app.post(
    "/login",
)
async def login(user: UserModel = Body(...), response: Response = Response()):

    user_data = await users.find_one({"username": user.username})
    if user_data and user_data["password"] == user.password:
        token = jwt.encode({
            "username": user.username,
            "date": datetime.datetime.utcnow() + datetime.timedelta(minutes=30)
            }, SECRET_KEY, algorithm='HS256')
        response.set_cookie(
            key="session_token", 
            value=token,
            httponly=True,
            expires=1800,
            max_age=1800)
        return {"msg": "Session Authenticated for 30 Minutes"}, status.HTTP_202_ACCEPTED
    else:
        return {"msg":"Unauthorized"}, status.HTTP_401_UNAUTHORIZED