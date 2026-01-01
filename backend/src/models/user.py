"""User model and schemas."""
from sqlmodel import SQLModel, Field, Relationship
from datetime import datetime
from uuid import uuid4
from typing import TYPE_CHECKING

if TYPE_CHECKING:
    from src.models.task import Task


class User(SQLModel, table=True):
    """User account with authentication credentials."""
    
    __tablename__ = "users"
    
    id: str = Field(
        default_factory=lambda: str(uuid4()),
        primary_key=True,
        description="Unique user identifier (UUID v4)"
    )
    
    email: str = Field(
        unique=True,
        index=True,
        max_length=255,
        description="User email address (unique, lowercase)"
    )
    
    hashed_password: str = Field(
        max_length=255,
        description="Bcrypt hashed password"
    )
    
    created_at: datetime = Field(
        default_factory=datetime.utcnow,
        description="Account creation timestamp (UTC)"
    )
    
    updated_at: datetime = Field(
        default_factory=datetime.utcnow,
        description="Last update timestamp (UTC)"
    )
    
    tasks: list["Task"] = Relationship(
        back_populates="user",
        sa_relationship_kwargs={"cascade": "all, delete-orphan"}
    )


class UserCreate(SQLModel):
    """Request model for user signup."""
    email: str = Field(max_length=255)
    password: str = Field(min_length=8, max_length=100)


class UserLogin(SQLModel):
    """Request model for user signin."""
    email: str
    password: str


class UserRead(SQLModel):
    """Response model for user (no password)."""
    id: str
    email: str
    created_at: datetime
    updated_at: datetime
