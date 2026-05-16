import uuid
import enum
from datetime import datetime, timezone
from sqlalchemy import String, Enum, DateTime, Boolean
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.db.base import Base

class UserRole(str, enum.Enum):
    student = "student"
    admin = "admin"

class User(Base):
    __tablename__ = "users"

    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, default=uuid.uuid4)
    username: Mapped[str] = mapped_column(String(50), unique=True, index=True)
    email: Mapped[str] = mapped_column(String(100), unique=True, index=True)
    hashed_password: Mapped[str | None] = mapped_column(String(255), nullable=True)
    github_id: Mapped[str | None] = mapped_column(String(100), unique=True, index=True, nullable=True)
    discord_id: Mapped[str | None] = mapped_column(String(100), unique=True, index=True, nullable=True)
    avatar_url: Mapped[str | None] = mapped_column(String(255), nullable=True)
    role: Mapped[UserRole] = mapped_column(Enum(UserRole), default=UserRole.student)
    is_blocked: Mapped[bool] = mapped_column(Boolean, default=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))

    projects = relationship("Project", back_populates="creator")
    submissions = relationship("Submission", back_populates="user")
