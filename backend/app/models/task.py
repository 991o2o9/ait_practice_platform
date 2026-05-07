import uuid
import enum
from sqlalchemy import String, Text, Enum, ForeignKey, Integer
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.db.base import Base

class TaskDifficulty(str, enum.Enum):
    easy = "easy"
    medium = "medium"
    hard = "hard"

class Task(Base):
    __tablename__ = "tasks"

    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, default=uuid.uuid4)
    project_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("projects.id", ondelete="CASCADE"))
    order_index: Mapped[int] = mapped_column(Integer, default=1)
    title: Mapped[str] = mapped_column(String(200))
    difficulty: Mapped[TaskDifficulty] = mapped_column(Enum(TaskDifficulty))
    test_code: Mapped[str] = mapped_column(Text)
    solution_template: Mapped[str] = mapped_column(Text)
    hints: Mapped[str | None] = mapped_column(Text, nullable=True)

    project = relationship("Project", back_populates="tasks")
    submissions = relationship("Submission", back_populates="task", cascade="all, delete-orphan")
