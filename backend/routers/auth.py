import os
from datetime import datetime, timedelta, timezone
from fastapi import APIRouter, HTTPException, Depends, Header
from pydantic import BaseModel
import jwt

from models.user import UserCreate, UserLogin, UserResponse, UserUpdate
from db.mongodb import get_db

router = APIRouter()

import bcrypt

SECRET_KEY = os.getenv("JWT_SECRET", "supersecretkey_drugnova")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 24 * 7 # 7 days

def verify_password(plain_password, hashed_password):
    return bcrypt.checkpw(plain_password.encode('utf-8'), hashed_password.encode('utf-8'))

def get_password_hash(password):
    return bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')

def create_access_token(data: dict):
    to_encode = data.copy()
    expire = datetime.now(timezone.utc) + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

async def get_current_user(authorization: str = Header(None)):
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Invalid authorization header")
    
    token = authorization.split(" ")[1]
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        email: str = payload.get("sub")
        if email is None:
            raise HTTPException(status_code=401, detail="Invalid token")
        return payload
    except jwt.PyJWTError:
        raise HTTPException(status_code=401, detail="Invalid token")

@router.post("/signup")
async def signup(user: UserCreate):
    db = get_db()
    existing_user = await db.users.find_one({"email": user.email.lower()})
    if existing_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    hashed_password = get_password_hash(user.password)
    new_user = {
        "name": user.name,
        "email": user.email.lower(),
        "hashed_password": hashed_password
    }
    await db.users.insert_one(new_user)
    
    access_token = create_access_token(data={"sub": new_user["email"], "name": new_user["name"]})
    return {"access_token": access_token, "token_type": "bearer"}

@router.post("/login")
async def login(user: UserLogin):
    db = get_db()
    db_user = await db.users.find_one({"email": user.email.lower()})
    if not db_user or not verify_password(user.password, db_user["hashed_password"]):
        raise HTTPException(status_code=401, detail="Incorrect email or password")
    
    access_token = create_access_token(data={"sub": db_user["email"], "name": db_user["name"]})
    return {"access_token": access_token, "token_type": "bearer"}

@router.get("/profile", response_model=UserResponse)
async def get_profile(current_user: dict = Depends(get_current_user)):
    db = get_db()
    db_user = await db.users.find_one({"email": current_user["sub"]})
    if not db_user:
        raise HTTPException(status_code=404, detail="User not found")
    return UserResponse(name=db_user["name"], email=db_user["email"])

@router.put("/profile", response_model=UserResponse)
async def update_profile(user_update: UserUpdate, current_user: dict = Depends(get_current_user)):
    db = get_db()
    email = current_user["sub"]
    await db.users.update_one({"email": email}, {"$set": {"name": user_update.name}})
    
    db_user = await db.users.find_one({"email": email})
    return UserResponse(name=db_user["name"], email=db_user["email"])
