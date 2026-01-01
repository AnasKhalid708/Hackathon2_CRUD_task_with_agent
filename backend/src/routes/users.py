"""User profile management routes."""
from fastapi import APIRouter, HTTPException, status, Depends
from sqlmodel import Session, select
from datetime import datetime
from pydantic import BaseModel
from src.models.user import User, UserRead
from src.database import get_db
from src.middleware.jwt_auth import get_current_user
from src.utils.password import hash_password, verify_password

router = APIRouter(prefix="/api/users/{user_id}", tags=["users"])


def validate_user_ownership(user_id: str, token_user_id: str):
    """Validate that URL user_id matches JWT token user_id."""
    if user_id != token_user_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied: user_id mismatch"
        )


class ProfileUpdate(BaseModel):
    """Request model for updating profile."""
    email: str
    current_password: str


class PasswordChange(BaseModel):
    """Request model for changing password."""
    current_password: str
    new_password: str


class AccountDelete(BaseModel):
    """Request model for deleting account."""
    password: str


@router.get("/profile", response_model=UserRead)
async def get_profile(
    user_id: str,
    token_user_id: str = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get user profile."""
    validate_user_ownership(user_id, token_user_id)
    
    user = db.get(User, user_id)
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    return user


@router.put("/profile", response_model=UserRead)
async def update_profile(
    user_id: str,
    profile_data: ProfileUpdate,
    token_user_id: str = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Update user email (requires current password)."""
    validate_user_ownership(user_id, token_user_id)
    
    user = db.get(User, user_id)
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    if not verify_password(profile_data.current_password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid password"
        )
    
    email_lower = profile_data.email.lower()
    
    if email_lower != user.email:
        existing_user = db.exec(
            select(User).where(User.email == email_lower)
        ).first()
        
        if existing_user:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Email already in use"
            )
        
        user.email = email_lower
    
    user.updated_at = datetime.utcnow()
    
    db.add(user)
    db.commit()
    db.refresh(user)
    
    return user


@router.put("/password")
async def change_password(
    user_id: str,
    password_data: PasswordChange,
    token_user_id: str = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Change user password (requires current password)."""
    validate_user_ownership(user_id, token_user_id)
    
    user = db.get(User, user_id)
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    if not verify_password(password_data.current_password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid password"
        )
    
    if len(password_data.new_password) < 8:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="New password must be at least 8 characters"
        )
    
    if verify_password(password_data.new_password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="New password must be different"
        )
    
    user.hashed_password = hash_password(password_data.new_password)
    user.updated_at = datetime.utcnow()
    
    db.add(user)
    db.commit()
    
    return {"message": "Password updated successfully"}


@router.delete("", status_code=status.HTTP_204_NO_CONTENT)
async def delete_account(
    user_id: str,
    delete_data: AccountDelete,
    token_user_id: str = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Delete user account (requires password confirmation)."""
    validate_user_ownership(user_id, token_user_id)
    
    user = db.get(User, user_id)
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    if not verify_password(delete_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid password"
        )
    
    db.delete(user)
    db.commit()
