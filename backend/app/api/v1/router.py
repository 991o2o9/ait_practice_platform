from fastapi import APIRouter
from app.api.v1.endpoints import auth

router = APIRouter()

router.include_router(auth.router, prefix="/auth", tags=["auth"])
@router.get("/health")
def health_check():
    return {"status": "ok", "project": "backend"}
