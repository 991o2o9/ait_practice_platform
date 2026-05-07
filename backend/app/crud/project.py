from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import Sequence
import uuid
from app.models.project import Project
from app.schemas.project import ProjectCreate

async def get_projects(db: AsyncSession) -> Sequence[Project]:
    result = await db.execute(select(Project).order_by(Project.created_at.desc()))
    return result.scalars().all()

async def get_project(db: AsyncSession, project_id: uuid.UUID) -> Project | None:
    return await db.get(Project, project_id)

async def create_project(db: AsyncSession, project_in: ProjectCreate, user_id: uuid.UUID) -> Project:
    db_project = Project(
        title=project_in.title,
        description=project_in.description,
        ai_generated=project_in.ai_generated,
        created_by=user_id
    )
    db.add(db_project)
    await db.commit()
    await db.refresh(db_project)
    return db_project

from app.schemas.ai import ProjectPublishRequest
from app.models.task import Task

async def publish_draft(db: AsyncSession, draft: ProjectPublishRequest, user_id: uuid.UUID) -> Project:
    db_project = Project(
        title=draft.project_title,
        description=draft.project_description,
        ai_generated=draft.ai_generated,
        created_by=user_id
    )
    db.add(db_project)
    await db.flush() # Получаем ID проекта до коммита
    
    for i, task_data in enumerate(draft.tasks, start=1):
        db_task = Task(
            project_id=db_project.id,
            title=task_data.title,
            difficulty=task_data.difficulty,
            test_code=task_data.test_code,
            solution_template=task_data.solution_template,
            hints=task_data.hints,
            order_index=i
        )
        db.add(db_task)
        
    await db.commit()
    await db.refresh(db_project)
    return db_project
