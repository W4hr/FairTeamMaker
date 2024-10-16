from fastapi import FastAPI, status, Body, Response, Depends, HTTPException
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from fastapi.responses import JSONResponse
from typing import List, Optional
from datetime import datetime, timedelta, timezone
from jose import JWTError, jwt
from passlib.context import CryptContext
from motor.motor_asyncio import AsyncIOMotorClient
from dotenv import load_dotenv
import os
from pymongo.errors import PyMongoError

from backend.db.models import TokenData, Token, UserModel, LogInForm

app = FastAPI()

load_dotenv()

SECRET_KEY = os.getenv("SECRET_KEY")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRES = timedelta(minutes=30)

# Env check
if not SECRET_KEY:
    raise ValueError("SECRET_KEY environment variable not set.")

# MongoDB
mongoclient = AsyncIOMotorClient("mongodb://localhost:27017")
mongodb = mongoclient["myWebsiteDB"]
mongousers = mongodb["users"]
mongoprojects = mongodb["projects"]
mongologs = mongodb["logs"]

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
oAuth2_scheme = OAuth2PasswordBearer(tokenUrl="token")

async def log_error(error: str, error_type: str, line:int):
    try:
        time = datetime.now(tz=timezone.utc).isoformat()
        log_entry = {
            "time": time,
            "type": error_type,
            "error": error,
            "line": line
        }
        await mongologs.insert_one(log_entry)
    except Exception as e:
        print(f"failed to log {e}")

def verify_password(password:str, hashed_password:str):
    return pwd_context.verify(password, hashed_password)

def generate_password_hash(password: str):
    return pwd_context.hash(password)

async def get_user(username:str) -> UserModel | None:
    user = await mongousers.find_one({"username": username}, {"_id": 0, "username": 1,"hashed_password": 1, "disabled": 1})
    if user:
        return UserModel(**user)
    return None

async def authenticate_user(username:str , password: str) -> bool:
    user = await get_user(username)
    if user and verify_password(password, user.hashed_password):
        return True
    return False
    
def create_jwt_access_token(data: dict, expires_delta: timedelta = ACCESS_TOKEN_EXPIRES):
    encode_data = data.copy()
    expires_date = datetime.utcnow() + expires_delta
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
    
    user = await get_user(username=token_data.sub)
    if user is None:
        raise credential_exception
    
    return user

async def get_current_active_user(current_user: UserModel = Depends(get_current_user)):
    if current_user.disabled:
        raise HTTPException(status_code=400, detail="Inactive user")
    return current_user

@app.post("/token", response_model=Token)
async def login_token(login_form: OAuth2PasswordRequestForm = Depends()):
    user_exists : bool = await authenticate_user(login_form.username, login_form.password)
    if not user_exists:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="incorrect username or password", headers={"WWW-Authenticate" : "Bearer"})
    access_token = create_jwt_access_token(data = {"sub": login_form.username}, expires_delta=ACCESS_TOKEN_EXPIRES)
    return {"access_token" : access_token, "token_type" : "bearer"}

@app.post(
        "/SignUp",
        status_code=status.HTTP_201_CREATED
        )
async def SignUp(login_form: LogInForm = Body(...)):
    try:
        if len(login_form.username) < 3 or len(login_form.password) < 4:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Password or username is too short")
        user_existing = await mongousers.find_one({"username" : login_form.username})
        if user_existing:
            raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Username already taken")
        user_in_db = UserModel(
            username=login_form.username,
            hashed_password=generate_password_hash(login_form.password),
            disabled=False)
        new_user = await mongousers.insert_one(user_in_db.model_dump(by_alias=False, exclude=["_id"]))
        return {"message": "User created successfully"}
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"An unexpected error occurred: {e}")

@app.post("/savespreview")
async def get_users_project_previews(current_user: UserModel = Depends(get_current_active_user)):
    try:
        if current_user:
            mongouser = await mongousers.find_one({"username": current_user.username})
            if mongouser:
                projects_previews = await mongoprojects.find(
                     {"user_id": mongouser["_id"]}
                ).to_list(length=None)
                return JSONResponse([project["preview_project"] for project in projects_previews])
            else:
                raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User does not exist")
        else:
            raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="An unexpected error occurred.")
    except PyMongoError as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"Database error: {str(e)}")
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"An unexpected error occurred: {str(e)}")