from typing import Any, List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
import uuid
from app.api.deps import get_db, get_current_user
from app.crud.project import get_projects, get_project, create_project
from app.crud.task import get_tasks_by_project, create_task
from app.schemas.project import ProjectCreate, ProjectResponse
from app.schemas.task import TaskCreate, TaskResponse
from app.models.user import User

router = APIRouter()

@router.get("/", response_model=List[ProjectResponse])
async def read_projects(db: AsyncSession = Depends(get_db)) -> Any:
    projects = await get_projects(db)
    return projects

@router.post("/", response_model=ProjectResponse)
async def create_new_project(
    project_in: ProjectCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
) -> Any:
    if current_user.role.value != "admin":
        raise HTTPException(status_code=403, detail="Not enough permissions")
    project = await create_project(db, project_in, current_user.id)
    return project

@router.get("/{project_id}/tasks", response_model=List[TaskResponse])
async def read_project_tasks(
    project_id: uuid.UUID,
    db: AsyncSession = Depends(get_db)
) -> Any:
    project = await get_project(db, project_id)
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    tasks = await get_tasks_by_project(db, project_id)
    return tasks

@router.post("/{project_id}/tasks", response_model=TaskResponse)
async def create_new_task(
    project_id: uuid.UUID,
    task_in: TaskCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
) -> Any:
    if current_user.role.value != "admin":
        raise HTTPException(status_code=403, detail="Not enough permissions")
    project = await get_project(db, project_id)
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    task = await create_task(db, task_in, project_id)
    return task
