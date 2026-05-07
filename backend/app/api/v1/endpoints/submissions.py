from typing import Any
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
import uuid
from app.api.deps import get_db, get_current_user
from app.crud.submission import create_submission, get_submission
from app.crud.task import get_task
from app.schemas.submission import SubmissionCreate, SubmissionResponse
from app.services.grader import evaluate_code
from app.models.user import User

router = APIRouter()

@router.post("/", response_model=dict)
async def submit_code(
    submission_in: SubmissionCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
) -> Any:
    task = await get_task(db, submission_in.task_id)
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    
    status, logs = evaluate_code(submission_in.code, task.test_code)
    
    submission = await create_submission(db, submission_in, current_user.id, status)
    
    return {
        "submission": SubmissionResponse.model_validate(submission),
        "details": logs
    }

@router.get("/{submission_id}", response_model=SubmissionResponse)
async def read_submission(
    submission_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
) -> Any:
    submission = await get_submission(db, submission_id)
    if not submission:
        raise HTTPException(status_code=404, detail="Submission not found")
    if submission.user_id != current_user.id and current_user.role.value != "admin":
        raise HTTPException(status_code=403, detail="Not enough permissions")
    return submission
