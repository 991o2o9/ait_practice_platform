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
    avatar_url: str | None = None

    class Config:
        from_attributes = True

class AdminUserResponse(UserResponse):
    is_blocked: bool
    github_id: str | None = None
    discord_id: str | None = None
    passed_submissions_count: int | None = 0
