from fastapi import APIRouter
from app.api.v1.endpoints import auth, projects, submissions, ai, admin, oauth

router = APIRouter()

router.include_router(auth.router, prefix="/auth", tags=["auth"])
router.include_router(oauth.router, prefix="/oauth", tags=["oauth"])
router.include_router(projects.router, prefix="/projects", tags=["projects"])
router.include_router(submissions.router, prefix="/submissions", tags=["submissions"])
router.include_router(ai.router, prefix="/ai", tags=["ai"])
router.include_router(admin.router, prefix="/admin", tags=["admin"])
@router.get("/health")
def health_check():
    return {"status": "ok", "project": "backend"}
