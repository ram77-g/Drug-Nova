import os
from datetime import datetime, timedelta, timezone
from fastapi import APIRouter, HTTPException, Depends, Header
from pydantic import BaseModel
import jwt

from models.user import UserCreate, UserLogin, UserResponse, UserUpdate, GoogleAuthRequest, ForgotPasswordRequest, ResetPasswordRequest, SignupOTPRequest, VerifySignupOTPRequest, GoogleCompleteSignupRequest
from google.oauth2 import id_token
from google.auth.transport import requests as google_requests
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
import random
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
        raise HTTPException(status_code=400, detail="This mail id is already used by someone else")

    existing_name = await db.users.find_one({"name": {"$regex": f"^{user.name}$", "$options": "i"}})
    if existing_name:
        raise HTTPException(status_code=400, detail="Username already exists")
    
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
    
    existing_name = await db.users.find_one({"name": {"$regex": f"^{user_update.name}$", "$options": "i"}})
    if existing_name and existing_name["email"] != email:
        raise HTTPException(status_code=400, detail="Username already exists")

    await db.users.update_one({"email": email}, {"$set": {"name": user_update.name}})
    
    db_user = await db.users.find_one({"email": email})
    return UserResponse(name=db_user["name"], email=db_user["email"])

@router.post("/google")
async def google_auth(request: GoogleAuthRequest):
    try:
        client_id = os.getenv("GOOGLE_CLIENT_ID", "")
        idinfo = id_token.verify_oauth2_token(
            request.credential, google_requests.Request(), client_id
        )
        
        email = idinfo["email"].lower()
        name = idinfo.get("name", "Google User")
        
        db = get_db()
        existing_user = await db.users.find_one({"email": email})
        
        if not existing_user:
            return {"is_new_user": True, "email": email, "name": name}
            
        access_token = create_access_token(data={"sub": existing_user["email"], "name": existing_user["name"]})
        return {"access_token": access_token, "token_type": "bearer"}
        
    except ValueError:
        raise HTTPException(status_code=401, detail="Invalid Google token")

@router.post("/google-complete-signup")
async def google_complete_signup(req: GoogleCompleteSignupRequest):
    try:
        client_id = os.getenv("GOOGLE_CLIENT_ID", "")
        idinfo = id_token.verify_oauth2_token(
            req.credential, google_requests.Request(), client_id
        )
        email = idinfo["email"].lower()
        name = idinfo.get("name", "Google User")
        
        db = get_db()
        existing_user = await db.users.find_one({"email": email})
        if existing_user:
            raise HTTPException(status_code=400, detail="User already exists")
            
        hashed_password = get_password_hash(req.password)
        new_user = {
            "name": name,
            "email": email,
            "hashed_password": hashed_password,
            "auth_provider": "google"
        }
        await db.users.insert_one(new_user)
        
        access_token = create_access_token(data={"sub": new_user["email"], "name": new_user["name"]})
        return {"access_token": access_token, "token_type": "bearer"}
        
    except ValueError:
        raise HTTPException(status_code=401, detail="Invalid Google token")

def send_otp_email(receiver_email: str, otp: str):
    sender_email = os.getenv("SMTP_USER", "")
    sender_password = os.getenv("SMTP_PASS", "")
    smtp_server = os.getenv("SMTP_SERVER", "smtp.gmail.com")
    smtp_port = int(os.getenv("SMTP_PORT", "587"))

    if not sender_email or not sender_password:
        if os.getenv("ENVIRONMENT") != "production":
            print("Warning: SMTP credentials not set. Printing OTP to console.")
            print(f"OTP for {receiver_email} is {otp}")
        return

    msg = MIMEMultipart()
    msg['From'] = sender_email
    msg['To'] = receiver_email
    msg['Subject'] = "Drug Nova - Password Reset OTP"
    
    body = f"Your OTP for password reset is: {otp}\nIt will expire in 10 minutes."
    msg.attach(MIMEText(body, 'plain'))
    
    try:
        server = smtplib.SMTP(smtp_server, smtp_port)
        server.starttls()
        server.login(sender_email, sender_password)
        server.send_message(msg)
        server.quit()
        print(f"SUCCESS! Email sent to {receiver_email}. The OTP was {otp}")
    except Exception as e:
        print(f"Failed to send email: {e}")
        print(f"OTP for {receiver_email} is {otp}")

@router.post("/forgot-password")
async def forgot_password(req: ForgotPasswordRequest):
    db = get_db()
    email = req.email.lower()
    
    existing_user = await db.users.find_one({"email": email})
    if not existing_user:
        return {"message": "If the email exists, an OTP will be sent."}
        
    otp_record = await db.otps.find_one({"email": email})
    now = datetime.now(timezone.utc)
    if otp_record and "last_requested" in otp_record:
        last_requested = otp_record["last_requested"]
        if last_requested.tzinfo is None:
            last_requested = last_requested.replace(tzinfo=timezone.utc)
        if now - last_requested < timedelta(minutes=1):
            raise HTTPException(status_code=429, detail="Please wait 1 minute before requesting another OTP.")

    otp = str(random.randint(100000, 999999))
    expire_at = now + timedelta(minutes=10)
    
    await db.otps.update_one(
        {"email": email},
        {"$set": {"otp": otp, "expire_at": expire_at, "last_requested": now, "attempts": 0}},
        upsert=True
    )
    
    send_otp_email(email, otp)
    
    return {"message": "If the email exists, an OTP will be sent."}

@router.post("/reset-password")
async def reset_password(req: ResetPasswordRequest):
    db = get_db()
    email = req.email.lower()
    
    otp_record = await db.otps.find_one({"email": email})
    if not otp_record:
        raise HTTPException(status_code=400, detail="Invalid or expired OTP")
        
    expire_at = otp_record["expire_at"]
    if expire_at.tzinfo is None:
        expire_at = expire_at.replace(tzinfo=timezone.utc)
        
    if datetime.now(timezone.utc) > expire_at:
        await db.otps.delete_one({"email": email})
        raise HTTPException(status_code=400, detail="OTP has expired")
        
    attempts = otp_record.get("attempts", 0)
    if attempts >= 3:
        await db.otps.delete_one({"email": email})
        raise HTTPException(status_code=400, detail="Too many failed attempts. Please request a new OTP.")
        
    if otp_record["otp"] != req.otp:
        await db.otps.update_one({"email": email}, {"$inc": {"attempts": 1}})
        raise HTTPException(status_code=400, detail="Invalid OTP")
        
    hashed_password = get_password_hash(req.new_password)
    await db.users.update_one(
        {"email": email}, 
        {"$set": {"hashed_password": hashed_password}}
    )
    
    await db.otps.delete_one({"email": email})
    
    return {"message": "Password reset successfully"}

@router.post("/request-signup-otp")
async def request_signup_otp(req: SignupOTPRequest):
    db = get_db()
    email = req.email.lower()
    name = req.name
    
    existing_email = await db.users.find_one({"email": email})
    if existing_email:
        raise HTTPException(status_code=400, detail="This mail id is already used by someone else")

    existing_name = await db.users.find_one({"name": {"$regex": f"^{name}$", "$options": "i"}})
    if existing_name:
        raise HTTPException(status_code=400, detail="Username already exists")
        
    otp_record = await db.otps.find_one({"email": email})
    now = datetime.now(timezone.utc)
    if otp_record and "last_requested" in otp_record:
        last_requested = otp_record["last_requested"]
        if last_requested.tzinfo is None:
            last_requested = last_requested.replace(tzinfo=timezone.utc)
        if now - last_requested < timedelta(minutes=1):
            raise HTTPException(status_code=429, detail="Please wait 1 minute before requesting another OTP.")

    otp = str(random.randint(100000, 999999))
    expire_at = now + timedelta(minutes=10)
    
    await db.otps.update_one(
        {"email": email},
        {"$set": {"otp": otp, "expire_at": expire_at, "last_requested": now, "attempts": 0}},
        upsert=True
    )
    
    send_otp_email(email, otp)
    return {"message": "OTP sent successfully"}

@router.post("/verify-signup-otp")
async def verify_signup_otp(req: VerifySignupOTPRequest):
    db = get_db()
    email = req.email.lower()
    name = req.name
    
    existing_email = await db.users.find_one({"email": email})
    if existing_email:
        raise HTTPException(status_code=400, detail="This mail id is already used by someone else")

    existing_name = await db.users.find_one({"name": {"$regex": f"^{name}$", "$options": "i"}})
    if existing_name:
        raise HTTPException(status_code=400, detail="Username already exists")
    
    otp_record = await db.otps.find_one({"email": email})
    if not otp_record:
        raise HTTPException(status_code=400, detail="Invalid or expired OTP")
        
    expire_at = otp_record["expire_at"]
    if expire_at.tzinfo is None:
        expire_at = expire_at.replace(tzinfo=timezone.utc)
        
    if datetime.now(timezone.utc) > expire_at:
        await db.otps.delete_one({"email": email})
        raise HTTPException(status_code=400, detail="OTP has expired")
        
    attempts = otp_record.get("attempts", 0)
    if attempts >= 3:
        await db.otps.delete_one({"email": email})
        raise HTTPException(status_code=400, detail="Too many failed attempts. Please request a new OTP.")
        
    if otp_record["otp"] != req.otp:
        await db.otps.update_one({"email": email}, {"$inc": {"attempts": 1}})
        raise HTTPException(status_code=400, detail="Invalid OTP")
        
    hashed_password = get_password_hash(req.password)
    new_user = {
        "name": name,
        "email": email,
        "hashed_password": hashed_password
    }
    await db.users.insert_one(new_user)
    
    await db.otps.delete_one({"email": email})
    
    access_token = create_access_token(data={"sub": new_user["email"], "name": new_user["name"]})
    return {"access_token": access_token, "token_type": "bearer"}
