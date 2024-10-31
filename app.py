from fastapi import FastAPI, status, Body, Form, Request, Depends, HTTPException
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from fastapi.staticfiles import StaticFiles
from fastapi.responses import JSONResponse
from fastapi.encoders import jsonable_encoder

from starlette.responses import FileResponse
from typing import List, Optional
from datetime import datetime, timedelta, timezone
from jose import JWTError, jwt
from passlib.context import CryptContext
from motor.motor_asyncio import AsyncIOMotorClient
from dotenv import load_dotenv
import os
from pymongo.errors import PyMongoError

from backend.db.defaultproject import create_default_starter_project
from backend.scripts.data_preprocessing import get_preview, create_project_data

from backend.db.models import TokenData, Token, UserModel, Project

app = FastAPI()

load_dotenv()

SECRET_KEY = os.getenv("SECRET_KEY")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRES = timedelta(hours=24)

# Env check
if not SECRET_KEY:
    raise ValueError("SECRET_KEY environment variable not set.")

# Logging
import logging

logging.basicConfig(level=logging.DEBUG, filename="log.log", filemode="w",
                    format="%(asctime)s - %(levelname)s - %(message)s")

# MongoDB
mongoclient = AsyncIOMotorClient("mongodb://localhost:27017")
mongodb = mongoclient["myWebsiteDB"]
mongousers = mongodb["users"]
mongoprojects = mongodb["projects"]
mongologs = mongodb["logs"]

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
oAuth2_scheme = OAuth2PasswordBearer(tokenUrl="token")

# Frontend Setup
app.mount("/frontend", StaticFiles(directory="frontend"), name="frontend")

@app.get("/")
async def HTMLUserInterface():
    return FileResponse("frontend/UI/interface.html")

@app.get("/login")
async def serve_login():
    return FileResponse("frontend/SignUp/index.html")


def verify_password(password:str, hashed_password:str):
    return pwd_context.verify(password, hashed_password)

def generate_password_hash(password: str):
    return pwd_context.hash(password)

async def get_token_from_cookie(request: Request) -> str:
    token = request.cookies.get("access_token")
    if not token:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Could not validate credentials", headers={"WWW-Authenticate" : "Bearer"})
    return token

async def get_user(username:str) -> UserModel | None:
    user = await mongousers.find_one({"username": username}, {"_id": 1, "username": 1,"hashed_password": 1, "disabled": 1})
    if user:
        user["_id"] = str(user["_id"])
        user_in_UserModel = UserModel(**user)
        return user_in_UserModel
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

async def get_current_user(token: str = Depends(get_token_from_cookie)):
    credential_exception = HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Could not validate credentials", headers={"WWW-Authenticate" : "Bearer"})
    logging.debug(f"Authentication started: {token}")
    try:
        logging.debug("started authentification decoding")
        jwt_payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM], options={"verify_exp": True})
        logging.debug(f"Decoded = {jwt_payload}")
        username : str = jwt_payload.get("sub")
        if username == None:
            raise credential_exception
        token_data = TokenData(sub=username, exp=jwt_payload.get("exp"))
    except jwt.ExpiredSignatureError:
        logging.debug(f"Expired Signature: {jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM], options={'verify_exp': False}).get('exp')}")
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Token expired")
    except JWTError:
        logging.debug("Invalid Token")
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token")
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR)

    
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
    response = JSONResponse(content={"msg": "Login was successful"})
    response.set_cookie(
        key="access_token",
        value=access_token,
        httponly=True
        )
    return response

@app.post(
        "/SignUp",
        status_code=status.HTTP_201_CREATED
        )
async def SignUp(username: str = Form(...), password: str = Form(...)):
    try:
        if len(username) < 3 or len(password) < 4:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Password or username is too short")
        user_existing = await mongousers.find_one({"username" : username})
        if user_existing:
            raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Username already taken")
        user_in_db = UserModel(
            username=username,
            hashed_password=generate_password_hash(password),
            disabled=False)
        user = await mongousers.insert_one(user_in_db.model_dump(by_alias=False, exclude=["_id"]))
        default_starter_project = create_default_starter_project()
        default_starter_project["owner"] = str(user.inserted_id)
        await mongoprojects.insert_one(default_starter_project)
        return {"message": "User created successfully"}
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"An unexpected error occurred: {e}")

@app.get("/user-project-previews")
async def get_users_project_previews(current_user: UserModel = Depends(get_current_active_user)):
    try:
        if current_user:
            projects_previews = await mongoprojects.find(
                {"owner": str(current_user.id)}
            ).to_list(length=None)
            return JSONResponse([get_preview(project) for project in projects_previews])
        else:
            raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="An unexpected error occurred.")
    except PyMongoError as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"Database error: {str(e)}")
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"An unexpected error occurred: {str(e)}")
    
@app.get("/user-project-preview/{uuid}")
async def get_users_project(uuid:str, current_user: UserModel = Depends(get_current_active_user)):
    try:
        selected_project = await mongoprojects.find_one({"uuid": uuid})
        logging.debug(f"Found Project: {selected_project}")
        if selected_project:
            return JSONResponse(selected_project["project"])
        else:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="The Project was not Found")
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="There was an error finding your project")
    
@app.post("/user-save-project")
async def save_project(project: Project, current_user: UserModel = Depends(get_current_active_user)):
    try:
        full_project = create_project_data(project, str(current_user.id))
        full_project = jsonable_encoder(full_project)
        await mongoprojects.insert_one(full_project)
    except PyMongoError as me:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Something went wrong when saving the project")
    except Exception as e:
        logging.error(f"INTERNAL ERROR - {e}")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Some internal error accured")