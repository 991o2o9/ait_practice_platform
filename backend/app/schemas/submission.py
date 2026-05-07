from pydantic import BaseModel
import uuid
from datetime import datetime
from app.models.submission import SubmissionStatus

class SubmissionCreate(BaseModel):
    task_id: uuid.UUID
    code: str

class SubmissionResponse(BaseModel):
    id: uuid.UUID
    task_id: uuid.UUID
    user_id: uuid.UUID
    code: str
    status: SubmissionStatus
    submitted_at: datetime

    class Config:
        from_attributes = True
