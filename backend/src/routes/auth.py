"""Authentication routes."""
from fastapi import APIRouter, HTTPException, status, Depends
from sqlmodel import Session, select
from src.models.user import User, UserCreate, UserLogin, UserRead
from src.database import get_db
from src.utils.password import hash_password, verify_password
from src.utils.jwt import create_access_token

router = APIRouter(prefix="/api/auth", tags=["authentication"])


@router.post("/signup", response_model=UserRead, status_code=status.HTTP_201_CREATED)
async def signup(user_data: UserCreate, db: Session = Depends(get_db)):
    """Register a new user account."""
    email_lower = user_data.email.lower()
    
    existing_user = db.exec(
        select(User).where(User.email == email_lower)
    ).first()
    
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )
    
    hashed_pw = hash_password(user_data.password)
    
    new_user = User(
        email=email_lower,
        hashed_password=hashed_pw
    )
    
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    
    return new_user


@router.post("/signin")
async def signin(credentials: UserLogin, db: Session = Depends(get_db)):
    """Login and receive JWT access token."""
    email_lower = credentials.email.lower()
    
    user = db.exec(
        select(User).where(User.email == email_lower)
    ).first()
    
    if not user or not verify_password(credentials.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password"
        )
    
    access_token = create_access_token(user.id)
    
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "expires_in": 86400,
        "user": {
            "id": user.id,
            "email": user.email
        }
    }
