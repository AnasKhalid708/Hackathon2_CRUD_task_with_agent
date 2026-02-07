"""Task model and schemas."""
from sqlmodel import SQLModel, Field, Relationship
from datetime import datetime
from uuid import uuid4
from typing import Optional, TYPE_CHECKING

if TYPE_CHECKING:
    from src.models.user import User


class Task(SQLModel, table=True):
    """Todo task belonging to a user."""
    
    __tablename__ = "tasks"
    
    id: str = Field(
        default_factory=lambda: str(uuid4()),
        primary_key=True,
        description="Unique task identifier (UUID v4)"
    )
    
    user_id: str = Field(
        foreign_key="users.id",
        index=True,
        description="Task owner user ID (foreign key)"
    )
    
    title: str = Field(
        max_length=200,
        description="Task title (required, max 200 chars)"
    )
    
    description: str = Field(
        default="",
        max_length=1000,
        description="Task description (optional, max 1000 chars)"
    )
    
    completed: bool = Field(
        default=False,
        index=True,
        description="Completion status (default False)"
    )
    
    deadline: Optional[datetime] = Field(
        default=None,
        nullable=True,
        description="Task deadline (optional, UTC)"
    )
    
    recurrence: Optional[str] = Field(
        default=None,
        nullable=True,
        max_length=100,
        description="Recurrence pattern: 'daily', 'weekly', 'monthly', 'every_tuesday', etc."
    )
    
    created_at: datetime = Field(
        default_factory=datetime.utcnow,
        description="Creation timestamp (UTC)"
    )
    
    updated_at: datetime = Field(
        default_factory=datetime.utcnow,
        description="Last update timestamp (UTC)"
    )
    
    user: Optional["User"] = Relationship(back_populates="tasks")


class TaskCreate(SQLModel):
    """Request model for creating task."""
    title: str = Field(min_length=1, max_length=200)
    description: Optional[str] = Field(default="", max_length=1000)
    deadline: Optional[datetime] = None


class TaskUpdate(SQLModel):
    """Request model for updating task."""
    title: Optional[str] = Field(None, min_length=1, max_length=200)
    description: Optional[str] = Field(None, max_length=1000)
    deadline: Optional[datetime] = None


class TaskRead(SQLModel):
    """Response model for task."""
    id: str
    user_id: str
    title: str
    description: str
    completed: bool
    deadline: Optional[datetime]
    recurrence: Optional[str]
    created_at: datetime
    updated_at: datetime
