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
