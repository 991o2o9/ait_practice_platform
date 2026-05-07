from fastapi import APIRouter, Depends, HTTPException
from typing import Any
from app.schemas.ai import ProjectDraftRequest, ProjectRefineRequest, DraftResponse, ExplainFailureRequest, ExplainFailureResponse
from app.services.ai_service import generate_project_draft, refine_project_draft, explain_code_failure
from app.api.deps import get_current_user
from app.models.user import User

router = APIRouter()

@router.post("/generate-draft", response_model=DraftResponse)
async def generate_draft(
    request: ProjectDraftRequest,
    current_user: User = Depends(get_current_user)
) -> Any:
    if current_user.role.value != "admin":
        raise HTTPException(status_code=403, detail="Not enough permissions")
    
    result = generate_project_draft(request.prompt)
    if "error" in result:
        raise HTTPException(status_code=500, detail="AI generation failed")
        
    return result

@router.post("/refine-draft", response_model=DraftResponse)
async def refine_draft(
    request: ProjectRefineRequest,
    current_user: User = Depends(get_current_user)
) -> Any:
    if current_user.role.value != "admin":
        raise HTTPException(status_code=403, detail="Not enough permissions")
        
    result = refine_project_draft(request.current_draft, request.feedback)
    if "error" in result:
        raise HTTPException(status_code=500, detail="AI refinement failed")
        
    return result

@router.post("/explain-failure", response_model=ExplainFailureResponse)
async def explain_failure(
    request: ExplainFailureRequest,
    current_user: User = Depends(get_current_user)
) -> Any:
    hint = explain_code_failure(request.student_code, request.test_code, request.error_logs)
    return {"hint": hint}
