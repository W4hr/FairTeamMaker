from fastapi import FastAPI, status, Body, Response, Depends, HTTPException
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from fastapi.responses import JSONResponse
from pydantic import BaseModel, Field, ConfigDict
from typing import List, Optional
from datetime import datetime, timedelta, timezone
from jose import JWTError, jwt
from passlib.context import CryptContext
from pymongo import MongoClient
from dotenv import load_dotenv
import os
from bson.objectid import ObjectId
from inspect import currentframe

from backend.db.models import TokenData, UserDB, Token, UserModel, LogInForm

app = FastAPI()

load_dotenv()

SECRET_KEY = os.getenv("SECRET_KEY")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRES = 1800 # Seconds (1800 = 30 min)

# MongoDB
mongoclient = MongoClient("mongodb://localhost:27017")
mongodb = mongoclient["myWebsiteDB"]
mongousers = mongodb["users"]
mongoprojects = mongodb["projects"]
mongologs = mongodb["logs"]

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
oAuth2_scheme = OAuth2PasswordBearer(tokenUrl="token")

def log_error(error: str, error_type: str, line:int):
    try:
        time = datetime.now(tz=timezone.utc).isoformat()
        log_entry = {
            "time": time,
            "type": error_type,
            "error": error,
            "line": line
        }
        mongologs.insert_one(log_entry)
    except Exception as e:
        print(f"failed to log {e}")

def verify_password(password:str, hashed_password:str):
    return pwd_context.verify(password, hashed_password)

def generate_password_hash(password: str):
    return pwd_context.hash(password)

def get_user(username:str) -> dict:
    user = mongousers.find_one({"username": username}, {"_id": 0, "username": 1,"hashed_password": 1, "disabled": 1})
    if user:
        return UserModel(**user)
    return None

def authenticate_user(username:str , password: str) -> bool:
    user = get_user(username)
    if user and verify_password(password, user.hashed_password):
        return True
    return False
    
def create_jwt_access_token(data: dict, expires_delta: timedelta | None = None):
    encode_data = data.copy()
    if expires_delta:
        expires_date = datetime.utcnow() + expires_delta
    else:
        expires_date = datetime.utcnow() + timedelta(minutes=15)
    encode_data.update({"exp": int(expires_date.timestamp())})
    encoded_jwt_token = jwt.encode(encode_data, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt_token

async def get_current_user(token: str = Depends(oAuth2_scheme)):
    credential_exception = HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Could not validate credentials", headers={"WWW-Authenticate" : "Bearer"})
    try:
        jwt_payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM], options={"verify_exp": True})
        username : str = jwt_payload.get("sub")
        if username == None:
            raise credential_exception
        token_data = TokenData(sub=username, exp=jwt_payload.get("exp"))
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Token expired")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token")
    
    user = get_user(username=token_data.sub)
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
    access_token = create_jwt_access_token(data = {"sub": login_form.username}, expires_delta=access_token_expires)
    return {"access_token" : access_token, "token_type" : "bearer"}


@app.post(
        "/SignUp",
        status_code=status.HTTP_201_CREATED
        )
async def SignUp(LogInForm):
    try:
        if len(LogInForm.username) < 3 or len(LogInForm.password) < 4:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Password or username is too short")
        user_existing = mongousers.find_one({"username" : LogInForm.username})
        if user_existing:
            raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Username already taken")
        user_in_db = UserModel(
            username=LogInForm.username,
            hashed_password=generate_password_hash(LogInForm.password),
            disabled=False)
        new_user = mongousers.insert_one(user_in_db.model_dump(by_alias=False, exclude=["id"]))
        return {"message": "User created successfully"}
    except:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="An unexpected error occurred.")

@app.post("/savespreview")
async def get_user_data(token:str = Depends(oAuth2_scheme)):
    try:
        user = await get_current_active_user()
        if user:
            mongouser = await mongousers.find_one({"username": user.username})
            if mongouser:
                projects_previews = await mongoprojects.find(
                     {"user_id": str(mongouser["_id"])}
                )
                return JSONResponse([project["preview_project"] for project in projects_previews])
            else:
                raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User does not exist")
        else:
            raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="An unexpected error occurred.")
    except:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="An unexpected error occurred.")