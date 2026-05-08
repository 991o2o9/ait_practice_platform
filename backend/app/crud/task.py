from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import Sequence
import uuid
from app.models.task import Task
from app.schemas.task import TaskCreate

async def get_tasks_by_project(db: AsyncSession, project_id: uuid.UUID) -> Sequence[Task]:
    result = await db.execute(select(Task).where(Task.project_id == project_id))
    return result.scalars().all()

async def get_task(db: AsyncSession, task_id: uuid.UUID) -> Task | None:
    return await db.get(Task, task_id)

async def create_task(db: AsyncSession, task_in: TaskCreate, project_id: uuid.UUID) -> Task:
    db_task = Task(
        project_id=project_id,
        title=task_in.title,
        description=task_in.description,
        difficulty=task_in.difficulty,
        learning_objective=task_in.learning_objective,
        connections=task_in.connections,
        test_code=task_in.test_code,
        solution_template=task_in.solution_template,
        hints=task_in.hints
    )
    db.add(db_task)
    await db.commit()
    await db.refresh(db_task)
    return db_task
