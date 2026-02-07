"""User profile management routes."""
from fastapi import APIRouter, HTTPException, status, Depends
from sqlmodel import Session
from src.models.user import User, UserRead
from src.database import get_db
from src.middleware.jwt_auth import get_current_user

router = APIRouter(prefix="/api/users/{user_id}", tags=["users"])

@router.get("/profile", response_model=UserRead)
async def get_profile(
    user_id: str,
    token_user_id: str = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get user profile."""
    if user_id != token_user_id:
        raise HTTPException(status_code=403, detail="Access denied")
    user = db.get(User, user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user
