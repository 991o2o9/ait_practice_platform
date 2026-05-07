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
