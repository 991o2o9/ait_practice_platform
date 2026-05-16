from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.models.user import User
from app.schemas.user import UserCreate
from app.core.security import get_password_hash

async def get_user_by_email(db: AsyncSession, email: str) -> User | None:
    result = await db.execute(select(User).where(User.email == email))
    return result.scalars().first()

async def get_user_by_username(db: AsyncSession, username: str) -> User | None:
    result = await db.execute(select(User).where(User.username == username))
    return result.scalars().first()

async def create_user(db: AsyncSession, user_in: UserCreate) -> User:
    hashed_password = get_password_hash(user_in.password)
    db_user = User(
        username=user_in.username,
        email=user_in.email,
        hashed_password=hashed_password
    )
    db.add(db_user)
    await db.commit()
    await db.refresh(db_user)
    return db_user

from sqlalchemy import func

async def count_users(db: AsyncSession) -> int:
    result = await db.execute(select(func.count(User.id)))
    return result.scalar() or 0

from app.models.submission import Submission, SubmissionStatus

async def get_all_users_with_stats(db: AsyncSession):
    stmt = (
        select(
            User,
            func.count(Submission.id).label("passed_submissions_count")
        )
        .outerjoin(
            Submission,
            (User.id == Submission.user_id) & (Submission.status == SubmissionStatus.passed)
        )
        .group_by(User.id)
        .order_by(User.created_at.desc())
    )
    result = await db.execute(stmt)
    # Return as list of dicts or objects. We'll return the user objects with the count injected or as a tuple.
    # Actually, returning a list of dicts mapping perfectly to AdminUserResponse is easier.
    users = []
    for user, count in result.all():
        # Inject the count into the user object (Pydantic can read from attributes)
        user.passed_submissions_count = count
        users.append(user)
    return users
