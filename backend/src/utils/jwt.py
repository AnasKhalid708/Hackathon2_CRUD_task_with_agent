"""JWT token utilities."""
import jwt
from datetime import datetime, timedelta
from typing import Optional
from src.config import get_settings

settings = get_settings()


def create_access_token(user_id: str, expires_delta: Optional[timedelta] = None) -> str:
    """Create a JWT access token."""
    if expires_delta is None:
        expires_delta = timedelta(hours=settings.ACCESS_TOKEN_EXPIRE_HOURS)
    
    expire = datetime.utcnow() + expires_delta
    payload = {
        "user_id": user_id,
        "exp": expire
    }
    
    token = jwt.encode(payload, settings.JWT_AUTH, algorithm=settings.ALGORITHM)
    return token


def decode_access_token(token: str) -> dict:
    """Decode and validate a JWT access token."""
    try:
        payload = jwt.decode(token, settings.JWT_AUTH, algorithms=[settings.ALGORITHM])
        return payload
    except jwt.ExpiredSignatureError:
        raise ValueError("Token has expired")
    except jwt.InvalidTokenError:
        raise ValueError("Invalid token")
