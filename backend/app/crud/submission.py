from sqlalchemy.ext.asyncio import AsyncSession
import uuid
from app.models.submission import Submission, SubmissionStatus
from app.schemas.submission import SubmissionCreate

async def create_submission(
    db: AsyncSession, submission_in: SubmissionCreate, user_id: uuid.UUID, status: SubmissionStatus
) -> Submission:
    db_obj = Submission(
        task_id=submission_in.task_id,
        user_id=user_id,
        code=submission_in.code,
        status=status
    )
    db.add(db_obj)
    await db.commit()
    await db.refresh(db_obj)
    return db_obj

async def get_submission(db: AsyncSession, submission_id: uuid.UUID) -> Submission | None:
    return await db.get(Submission, submission_id)

from sqlalchemy import select
from app.models.task import Task

from sqlalchemy.orm import selectinload

async def get_passed_submissions_for_context(
    db: AsyncSession, user_id: uuid.UUID, project_id: uuid.UUID, max_order_index: int
) -> list[Submission]:
    # Получаем все успешные сабмишены для данного проекта, задачи которых идут ДО текущей
    # Используем DISTINCT ON (task_id) чтобы взять самый последний (submitted_at DESC)
    stmt = (
        select(Submission)
        .join(Task, Submission.task_id == Task.id)
        .options(selectinload(Submission.task))
        .where(
            Submission.user_id == user_id,
            Submission.status == SubmissionStatus.passed,
            Task.project_id == project_id,
            Task.order_index < max_order_index
        )
        .distinct(Submission.task_id)
        .order_by(Submission.task_id, Submission.submitted_at.desc())
    )
    result = await db.execute(stmt)
    submissions = list(result.scalars().all())
    
    # Сортируем в Python по order_index
    submissions.sort(key=lambda s: s.task.order_index)
    return submissions

from sqlalchemy import func

async def count_passed_submissions(db: AsyncSession) -> int:
    result = await db.execute(
        select(func.count(Submission.id)).where(Submission.status == SubmissionStatus.passed)
    )
    return result.scalar() or 0
