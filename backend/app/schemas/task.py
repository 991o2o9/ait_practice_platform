from pydantic import BaseModel
import uuid
from app.models.task import TaskDifficulty

class TaskBase(BaseModel):
    title: str
    difficulty: TaskDifficulty
    test_code: str
    solution_template: str

class TaskCreate(TaskBase):
    pass

class TaskResponse(TaskBase):
    id: uuid.UUID
    project_id: uuid.UUID

    class Config:
        from_attributes = True
