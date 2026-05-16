from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from typing import Any

from app.api.deps import get_db, get_current_user
from app.models.user import User
from app.crud.user import count_users
from app.crud.project import count_projects
from app.crud.submission import count_passed_submissions

router = APIRouter()

@router.get("/stats")
async def get_admin_stats(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
) -> Any:
    """
    Получение базовой статистики для панели администратора.
    Доступно только пользователям с ролью 'admin'.
    """
    if current_user.role.value != "admin":
        raise HTTPException(status_code=403, detail="Not enough permissions")

    total_users = await count_users(db)
    total_projects = await count_projects(db)
    total_passed_submissions = await count_passed_submissions(db)

    return {
        "total_users": total_users,
        "total_projects": total_projects,
        "total_passed_submissions": total_passed_submissions
    }

from typing import List
from app.schemas.user import AdminUserResponse
from app.crud.user import get_all_users_with_stats
import uuid

@router.get("/users", response_model=List[AdminUserResponse])
async def get_admin_users(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
) -> Any:
    """
    Получение списка пользователей с их статистикой.
    Доступно только администраторам.
    """
    if current_user.role.value != "admin":
        raise HTTPException(status_code=403, detail="Not enough permissions")
    
    users = await get_all_users_with_stats(db)
    return users

@router.patch("/users/{user_id}/toggle-block")
async def toggle_user_block(
    user_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
) -> Any:
    """
    Блокировка или разблокировка пользователя.
    Доступно только администраторам.
    """
    if current_user.role.value != "admin":
        raise HTTPException(status_code=403, detail="Not enough permissions")
        
    if current_user.id == user_id:
        raise HTTPException(status_code=400, detail="You cannot block yourself")
        
    user = await db.get(User, user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
        
    user.is_blocked = not user.is_blocked
    await db.commit()
    return {"message": "User status updated", "is_blocked": user.is_blocked}
