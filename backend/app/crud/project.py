from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import Sequence
import uuid
from app.models.project import Project
from app.schemas.project import ProjectCreate

async def get_projects(db: AsyncSession) -> Sequence[Project]:
    result = await db.execute(select(Project).order_by(Project.created_at.desc()))
    return result.scalars().all()

from sqlalchemy import func, or_, and_
from app.models.submission import Submission, SubmissionStatus
from app.models.task import Task

async def get_paginated_projects(db: AsyncSession, user_id: uuid.UUID, limit: int, offset: int, search: str | None = None) -> list[dict]:
    # 1. Subquery for total tasks
    total_tasks_sq = (
        select(Task.project_id, func.count(Task.id).label("total_tasks"))
        .group_by(Task.project_id)
        .subquery()
    )

    # 2. Subquery for passed tasks by the user
    # We use distinct(Submission.task_id) essentially by doing a count of distinct task_ids where status=passed
    passed_tasks_sq = (
        select(Task.project_id, func.count(func.distinct(Submission.task_id)).label("passed_tasks"))
        .select_from(Submission)
        .join(Task, Submission.task_id == Task.id)
        .where(
            Submission.user_id == user_id,
            Submission.status == SubmissionStatus.passed
        )
        .group_by(Task.project_id)
        .subquery()
    )

    # 3. Main query
    stmt = (
        select(
            Project,
            func.coalesce(total_tasks_sq.c.total_tasks, 0).label("total_tasks"),
            func.coalesce(passed_tasks_sq.c.passed_tasks, 0).label("passed_tasks")
        )
        .outerjoin(total_tasks_sq, Project.id == total_tasks_sq.c.project_id)
        .outerjoin(passed_tasks_sq, Project.id == passed_tasks_sq.c.project_id)
    )

    if search:
        search_pattern = f"%{search}%"
        stmt = stmt.where(
            or_(
                Project.title.ilike(search_pattern),
                Project.description.ilike(search_pattern)
            )
        )

    stmt = stmt.order_by(Project.created_at.desc()).limit(limit).offset(offset)
    
    result = await db.execute(stmt)
    rows = result.all()
    
    projects_with_progress = []
    for project, total, passed in rows:
        proj_dict = project.__dict__.copy()
        proj_dict["total_tasks"] = total
        proj_dict["passed_tasks"] = passed
        projects_with_progress.append(proj_dict)
        
    return projects_with_progress

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
            description=task_data.description,
            learning_objective=task_data.learning_objective,
            connections=task_data.connections,
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

from sqlalchemy import func
from app.schemas.project import ProjectUpdate

async def count_projects(db: AsyncSession) -> int:
    result = await db.execute(select(func.count(Project.id)))
    return result.scalar() or 0

async def delete_project(db: AsyncSession, project_id: uuid.UUID) -> bool:
    project = await db.get(Project, project_id)
    if not project:
        return False
    await db.delete(project)
    await db.commit()
    return True

async def update_project(db: AsyncSession, project_id: uuid.UUID, project_in: ProjectUpdate) -> Project | None:
    project = await db.get(Project, project_id)
    if not project:
        return None
    if project_in.title is not None:
        project.title = project_in.title
    if project_in.description is not None:
        project.description = project_in.description
    await db.commit()
    await db.refresh(project)
    return project
