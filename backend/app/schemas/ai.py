from pydantic import BaseModel
from typing import List, Dict, Any, Optional

class ProjectDraftRequest(BaseModel):
    prompt: str

class ProjectRefineRequest(BaseModel):
    current_draft: Dict[str, Any]
    feedback: str

class DraftTask(BaseModel):
    title: str
    difficulty: str
    test_code: str
    solution_template: str
    hints: Optional[str] = None

class DraftResponse(BaseModel):
    project_title: str
    project_description: str
    tasks: List[DraftTask]

class ProjectPublishRequest(BaseModel):
    project_title: str
    project_description: str
    ai_generated: bool = True
    tasks: List[DraftTask]

class ExplainFailureRequest(BaseModel):
    student_code: str
    test_code: str
    error_logs: str

class ExplainFailureResponse(BaseModel):
    hint: str
