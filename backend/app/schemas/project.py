from pydantic import BaseModel
import uuid
from datetime import datetime

class ProjectBase(BaseModel):
    title: str
    description: str
    ai_generated: bool = False

class ProjectCreate(ProjectBase):
    pass

class ProjectUpdate(BaseModel):
    title: str | None = None
    description: str | None = None

class ProjectResponse(ProjectBase):
    id: uuid.UUID
    created_by: uuid.UUID
    created_at: datetime

    class Config:
        from_attributes = True
