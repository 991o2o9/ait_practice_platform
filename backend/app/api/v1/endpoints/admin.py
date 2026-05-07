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
