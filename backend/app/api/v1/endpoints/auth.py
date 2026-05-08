from typing import Any
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.ext.asyncio import AsyncSession
from app.api.deps import get_db, get_current_user
from app.core.security import verify_password, create_access_token
from app.crud.user import get_user_by_email, get_user_by_username, create_user
from app.schemas.user import UserCreate, UserResponse
from app.schemas.token import Token
from app.models.user import User

router = APIRouter()

@router.post("/register", response_model=UserResponse)
async def register_user(
    user_in: UserCreate,
    db: AsyncSession = Depends(get_db)
) -> Any:
    user_by_email = await get_user_by_email(db, email=user_in.email)
    if user_by_email:
        raise HTTPException(
            status_code=400,
            detail="The user with this email already exists in the system.",
        )
    user_by_username = await get_user_by_username(db, username=user_in.username)
    if user_by_username:
        raise HTTPException(
            status_code=400,
            detail="The user with this username already exists in the system.",
        )
    user = await create_user(db, user_in=user_in)
    return user

@router.post("/login", response_model=Token)
async def login_access_token(
    db: AsyncSession = Depends(get_db),
    form_data: OAuth2PasswordRequestForm = Depends()
) -> Any:
    # We allow login by email or username. form_data.username will contain whatever the user typed.
    user = await get_user_by_email(db, email=form_data.username)
    if not user:
        user = await get_user_by_username(db, username=form_data.username)
    
    if not user or not verify_password(form_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Incorrect email/username or password",
        )
    
    return {
        "access_token": create_access_token({
            "sub": str(user.id),
            "email": user.email,
            "username": user.username,
            "role": user.role.value
        }),
        "token_type": "bearer",
    }

@router.get("/me", response_model=UserResponse)
async def read_user_me(
    current_user: User = Depends(get_current_user)
) -> Any:
    return current_user
