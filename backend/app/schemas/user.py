from pydantic import BaseModel, EmailStr
import uuid
from datetime import datetime
from app.models.user import UserRole

class UserBase(BaseModel):
    username: str
    email: EmailStr

class UserCreate(UserBase):
    password: str

class UserResponse(UserBase):
    id: uuid.UUID
    role: UserRole
    created_at: datetime

    class Config:
        from_attributes = True
