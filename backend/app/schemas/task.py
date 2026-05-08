from pydantic import BaseModel
import uuid
from app.models.task import TaskDifficulty

class TaskBase(BaseModel):
    title: str
    description: str | None = None
    difficulty: TaskDifficulty
    learning_objective: str | None = None
    connections: str | None = None
    order_index: int = 1
    test_code: str
    solution_template: str
    hints: str | None = None

class TaskCreate(TaskBase):
    pass

class TaskResponse(TaskBase):
    id: uuid.UUID
    project_id: uuid.UUID

    class Config:
        from_attributes = True
