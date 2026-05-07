from fastapi import APIRouter
from app.api.v1.endpoints import auth, projects, submissions

router = APIRouter()

router.include_router(auth.router, prefix="/auth", tags=["auth"])
router.include_router(projects.router, prefix="/projects", tags=["projects"])
router.include_router(submissions.router, prefix="/submissions", tags=["submissions"])
@router.get("/health")
def health_check():
    return {"status": "ok", "project": "backend"}
