from pydantic import BaseModel, EmailStr, Field, field_validator
import re

def validate_password_complexity(v: str) -> str:
    if len(v) < 8:
        raise ValueError("Password must be at least 8 characters long")
    if not re.search(r"\d", v):
        raise ValueError("Password must contain at least one numeric value")
    if not re.search(r"[!@#$%^&*(),.?\":{}|<>]", v):
        raise ValueError("Password must contain at least one special character")
    return v

def validate_name_not_empty(v: str) -> str:
    if not v.strip():
        raise ValueError("Name cannot be empty or just whitespace")
    return v.strip()

def validate_gmail(v: str) -> str:
    # Assuming the value is already validated as EmailStr
    if not v.lower().endswith("@gmail.com"):
        raise ValueError("Only @gmail.com email addresses are allowed")
    return v.lower()

class UserCreate(BaseModel):
    name: str = Field(..., min_length=2, max_length=50)
    email: EmailStr
    password: str = Field(..., min_length=8)

    @field_validator('name')
    @classmethod
    def check_name(cls, v: str) -> str:
        return validate_name_not_empty(v)

    @field_validator('email')
    @classmethod
    def check_email(cls, v: str) -> str:
        return validate_gmail(v)

    @field_validator('password')
    @classmethod
    def check_password(cls, v: str) -> str:
        return validate_password_complexity(v)

class UserLogin(BaseModel):
    email: EmailStr
    password: str

    @field_validator('email')
    @classmethod
    def check_email(cls, v: str) -> str:
        return validate_gmail(v)

class UserResponse(BaseModel):
    name: str
    email: str

class UserUpdate(BaseModel):
    name: str = Field(..., min_length=2, max_length=50)

    @field_validator('name')
    @classmethod
    def check_name(cls, v: str) -> str:
        return validate_name_not_empty(v)

class GoogleAuthRequest(BaseModel):
    credential: str

class ForgotPasswordRequest(BaseModel):
    email: EmailStr

    @field_validator('email')
    @classmethod
    def check_email(cls, v: str) -> str:
        return validate_gmail(v)

class ResetPasswordRequest(BaseModel):
    email: EmailStr
    otp: str
    new_password: str = Field(..., min_length=8)

    @field_validator('email')
    @classmethod
    def check_email(cls, v: str) -> str:
        return validate_gmail(v)

    @field_validator('new_password')
    @classmethod
    def check_password(cls, v: str) -> str:
        return validate_password_complexity(v)

class SignupOTPRequest(BaseModel):
    name: str = Field(..., min_length=2, max_length=50)
    email: EmailStr

    @field_validator('name')
    @classmethod
    def check_name(cls, v: str) -> str:
        return validate_name_not_empty(v)

    @field_validator('email')
    @classmethod
    def check_email(cls, v: str) -> str:
        return validate_gmail(v)

class VerifySignupOTPRequest(BaseModel):
    name: str = Field(..., min_length=2, max_length=50)
    email: EmailStr
    otp: str
    password: str = Field(..., min_length=8)

    @field_validator('name')
    @classmethod
    def check_name(cls, v: str) -> str:
        return validate_name_not_empty(v)

    @field_validator('email')
    @classmethod
    def check_email(cls, v: str) -> str:
        return validate_gmail(v)

    @field_validator('password')
    @classmethod
    def check_password(cls, v: str) -> str:
        return validate_password_complexity(v)

class GoogleCompleteSignupRequest(BaseModel):
    credential: str
    password: str = Field(..., min_length=8)

    @field_validator('password')
    @classmethod
    def check_password(cls, v: str) -> str:
        return validate_password_complexity(v)
