# Data Model: Todo Full-Stack Web Application (Phase II)

**Date**: 2026-01-01  
**Phase**: II - Design & Contracts  
**Feature**: Phase II Full-Stack Web App with Authentication

---

## Purpose

This document defines all data entities, their fields, relationships, validation rules, and state transitions for the Phase II Todo full-stack web application with multi-user support.

---

## Entities

### 1. User

**Description**: Represents a registered user account with authentication credentials.

**SQLModel Implementation**: Database table with bcrypt password hashing

#### Fields

| Field | Type | Required | Default | Constraints | Description |
|-------|------|----------|---------|-------------|-------------|
| `id` | `str` | Yes | Generated | UUID v4 format | Unique user identifier |
| `email` | `str` | Yes | - | Unique, valid email, max 255 chars | User email address |
| `hashed_password` | `str` | Yes | - | Bcrypt hash, max 255 chars | Hashed password (never store plaintext) |
| `created_at` | `datetime` | Yes | Generated | UTC timestamp | Account creation timestamp |
| `updated_at` | `datetime` | Yes | Generated | UTC timestamp | Last update timestamp |

#### Field Validation Rules

1. **id**:
   - Format: UUID v4 (e.g., `550e8400-e29b-41d4-a716-446655440000`)
   - Generated automatically via `uuid.uuid4()`
   - Immutable after creation
   - Primary key

2. **email**:
   - Must match email regex pattern
   - Case-insensitive uniqueness (store lowercase)
   - Maximum length: 255 characters
   - Cannot be empty
   - Index for fast lookup

3. **hashed_password**:
   - NEVER store plaintext password
   - Hash with bcrypt (cost factor 12)
   - Maximum length: 255 characters (bcrypt output)
   - Validation: `len(password) >= 8` before hashing

4. **created_at**:
   - UTC datetime (e.g., `2026-01-01T14:22:13.123456`)
   - Generated via `datetime.utcnow()`
   - Immutable after creation

5. **updated_at**:
   - UTC datetime
   - Generated via `datetime.utcnow()`
   - Updated on every modification

#### Relationships

- **tasks**: One-to-many relationship with Task entity (User has many Tasks)
- Cascade delete: When User deleted, all their Tasks are deleted

---

### 2. Task

**Description**: Represents a todo item belonging to a specific user.

**SQLModel Implementation**: Database table with foreign key to users

#### Fields

| Field | Type | Required | Default | Constraints | Description |
|-------|------|----------|---------|-------------|-------------|
| `id` | `str` | Yes | Generated | UUID v4 format | Unique task identifier |
| `user_id` | `str` | Yes | - | Foreign key to users.id | Task owner |
| `title` | `str` | Yes | - | Non-empty, max 200 chars | Task title/summary |
| `description` | `str` | No | `""` | Max 1000 chars | Detailed task description |
| `completed` | `bool` | Yes | `False` | True or False | Completion status |
| `created_at` | `datetime` | Yes | Generated | UTC timestamp | Creation timestamp |
| `updated_at` | `datetime` | Yes | Generated | UTC timestamp | Last update timestamp |

#### Field Validation Rules

1. **id**:
   - Format: UUID v4
   - Generated automatically via `uuid.uuid4()`
   - Immutable after creation
   - Primary key

2. **user_id**:
   - Format: UUID v4 (foreign key to users.id)
   - Required, cannot be null
   - Index for fast user task queries
   - Immutable after creation (tasks cannot be transferred)
   - Cascade delete from users table

3. **title**:
   - Cannot be empty or whitespace-only
   - Strip leading/trailing whitespace
   - Maximum length: 200 characters
   - Validation: `if not title.strip(): raise ValueError("Title cannot be empty")`

4. **description**:
   - Optional field (can be empty string)
   - Strip leading/trailing whitespace
   - Maximum length: 1000 characters
   - Default: `""`

5. **completed**:
   - Boolean type only
   - Default: `False` on creation
   - Togglable via PATCH endpoint

6. **created_at**:
   - UTC datetime
   - Generated via `datetime.utcnow()`
   - Immutable after creation

7. **updated_at**:
   - UTC datetime
   - Generated via `datetime.utcnow()`
   - Updated on every modification (update, toggle)

#### Relationships

- **user**: Many-to-one relationship with User entity (Task belongs to User)

#### State Transitions

```
┌─────────────┐
│   Created   │
│ completed = │
│    False    │
└──────┬──────┘
       │
       │ PATCH /tasks/{id}/complete
       ↓
┌─────────────┐
│  Completed  │
│ completed = │
│    True     │
└──────┬──────┘
       │
       │ PATCH /tasks/{id}/complete
       ↓
┌─────────────┐
│   Pending   │
│ completed = │
│    False    │
└─────────────┘
       ↓
    (cycle)
```

**State Transition Rules**:
- Tasks start in "Pending" state (`completed = False`)
- Toggle endpoint flips boolean: `True` ↔ `False`
- `updated_at` refreshed on every toggle
- Deletion removes task from database permanently

---

## Database Schema

### PostgreSQL Tables

#### users Table

```sql
CREATE TABLE users (
    id VARCHAR(36) PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    hashed_password VARCHAR(255) NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_users_email ON users(email);
```

#### tasks Table

```sql
CREATE TABLE tasks (
    id VARCHAR(36) PRIMARY KEY,
    user_id VARCHAR(36) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(200) NOT NULL,
    description VARCHAR(1000) DEFAULT '',
    completed BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_tasks_user_id ON tasks(user_id);
CREATE INDEX idx_tasks_completed ON tasks(completed);
```

### Indexes

**Performance Optimization:**
- `users.email` - Unique index for fast login lookup
- `tasks.user_id` - Index for fast user task queries (most common operation)
- `tasks.completed` - Index for filtering by completion status

### Constraints

**Referential Integrity:**
- `tasks.user_id` → `users.id` (foreign key with CASCADE delete)
- Ensures all tasks have valid owner
- Automatically deletes tasks when user is deleted

**Uniqueness:**
- `users.email` - Prevents duplicate accounts

**Not Null:**
- All required fields enforced at database level

---

## SQLModel Python Implementation

### User Model

```python
from sqlmodel import SQLModel, Field, Relationship
from datetime import datetime
from uuid import uuid4
from typing import Optional

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
        description="Bcrypt hashed password (never store plaintext)"
    )
    
    created_at: datetime = Field(
        default_factory=datetime.utcnow,
        description="Account creation timestamp (UTC)"
    )
    
    updated_at: datetime = Field(
        default_factory=datetime.utcnow,
        description="Last update timestamp (UTC)"
    )
    
    # Relationships
    tasks: list["Task"] = Relationship(
        back_populates="user",
        sa_relationship_kwargs={"cascade": "all, delete-orphan"}
    )
    
    class Config:
        json_schema_extra = {
            "example": {
                "id": "550e8400-e29b-41d4-a716-446655440000",
                "email": "user@example.com",
                "created_at": "2026-01-01T14:22:13.123456",
                "updated_at": "2026-01-01T14:22:13.123456"
            }
        }


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
```

---

### Task Model

```python
from sqlmodel import SQLModel, Field, Relationship
from datetime import datetime
from uuid import uuid4
from typing import Optional

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
    
    created_at: datetime = Field(
        default_factory=datetime.utcnow,
        description="Creation timestamp (UTC)"
    )
    
    updated_at: datetime = Field(
        default_factory=datetime.utcnow,
        description="Last update timestamp (UTC)"
    )
    
    # Relationships
    user: User = Relationship(back_populates="tasks")
    
    class Config:
        json_schema_extra = {
            "example": {
                "id": "7c9e6679-fe0c-425c-883b-1e1d3e8c9f12",
                "user_id": "550e8400-e29b-41d4-a716-446655440000",
                "title": "Buy groceries",
                "description": "Milk, bread, eggs",
                "completed": False,
                "created_at": "2026-01-01T14:22:13.123456",
                "updated_at": "2026-01-01T14:22:13.123456"
            }
        }


class TaskCreate(SQLModel):
    """Request model for creating task."""
    title: str = Field(min_length=1, max_length=200)
    description: Optional[str] = Field(default="", max_length=1000)


class TaskUpdate(SQLModel):
    """Request model for updating task."""
    title: Optional[str] = Field(None, min_length=1, max_length=200)
    description: Optional[str] = Field(None, max_length=1000)


class TaskRead(SQLModel):
    """Response model for task."""
    id: str
    user_id: str
    title: str
    description: str
    completed: bool
    created_at: datetime
    updated_at: datetime
```

---

## Security & Multi-User Isolation

### User Ownership Validation

**Service Layer Enforcement:**

```python
async def validate_task_ownership(task_id: str, user_id: str, db: Session) -> Task:
    """
    Validate that task belongs to authenticated user.
    
    Args:
        task_id: Task identifier
        user_id: Authenticated user identifier from JWT
        db: Database session
        
    Returns:
        Task object if validation passes
        
    Raises:
        HTTPException 404: Task not found
        HTTPException 403: Task belongs to different user
    """
    task = db.query(Task).filter(Task.id == task_id).first()
    
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    
    if task.user_id != user_id:
        raise HTTPException(status_code=403, detail="Access denied: not your task")
    
    return task
```

**Database Query Filtering:**

```python
# ALWAYS filter by authenticated user_id
tasks = db.query(Task).filter(Task.user_id == current_user_id).all()
```

**Security Rules:**
1. Extract user_id from JWT token (NEVER trust URL parameter)
2. Validate URL user_id matches JWT user_id (403 if mismatch)
3. Filter all database queries by authenticated user_id
4. Never expose other users' data in responses
5. Log unauthorized access attempts

---

## Validation Summary

### Creation Validation

**User:**
- ✅ Email is valid format and unique
- ✅ Email stored lowercase for case-insensitive uniqueness
- ✅ Password minimum 8 characters
- ✅ Password hashed with bcrypt (cost 12) before storage
- ✅ ID auto-generated UUID v4
- ✅ Timestamps auto-generated

**Task:**
- ✅ Title is required and non-empty
- ✅ Title max length: 200 characters
- ✅ Description max length: 1000 characters
- ✅ user_id is required and valid (foreign key constraint)
- ✅ ID auto-generated UUID v4
- ✅ completed defaults to False
- ✅ Timestamps auto-generated

### Update Validation

**User:**
- ✅ Email can be updated (uniqueness checked)
- ✅ Password can be updated (rehashed with bcrypt)
- ✅ updated_at refreshed automatically

**Task:**
- ✅ At least one field must be provided
- ✅ Title cannot be empty if provided
- ✅ Title max length: 200 characters
- ✅ Description max length: 1000 characters
- ✅ User ownership validated before update
- ✅ updated_at refreshed automatically
- ✅ ID and user_id are immutable

### Toggle Validation

**Task:**
- ✅ Task must exist (404 if not found)
- ✅ User ownership validated (403 if not owner)
- ✅ Completed field flips boolean value
- ✅ updated_at refreshed

### Delete Validation

**User:**
- ✅ All user's tasks cascade deleted
- ✅ Cannot delete if referenced by active sessions (business logic)

**Task:**
- ✅ Task must exist (404 if not found)
- ✅ User ownership validated (403 if not owner)
- ✅ Task permanently removed from database

---

## Future Evolution

### Phase III Additions (Out of Scope for Phase II):
- Add `ai_suggestions` field to Task (JSON/TEXT for AI-generated suggestions)
- Add `voice_transcript` field to Task (speech-to-text input)
- Add `ai_chat_history` table for AI agent conversations

### Phase IV Additions (Out of Scope for Phase II):
- Add `team_id` field to User (multi-tenancy)
- Add `shared_tasks` table (task sharing between users)
- Add `task_history` table (audit log)

### Phase V Additions (Out of Scope for Phase II):
- Add `language` field to User (i18n support)
- Add `timezone` field to User (localized timestamps)
- Add `analytics_events` table (usage tracking)

---

## Acceptance Criteria

**Database Models:**
- [x] User entity fully defined with SQLModel
- [x] Task entity fully defined with SQLModel
- [x] Validation rules specified for all fields
- [x] Relationships documented (User ↔ Task)
- [x] Foreign key constraints defined
- [x] Indexes for performance optimization
- [x] Cascade delete configured

**Security:**
- [x] Password hashing with bcrypt
- [x] User ownership validation patterns
- [x] Multi-user isolation enforced
- [x] SQL injection prevention (SQLModel parameterized queries)

**Request/Response Models:**
- [x] UserCreate, UserLogin, UserRead defined
- [x] TaskCreate, TaskUpdate, TaskRead defined
- [x] Pydantic validation rules specified

**State Transitions:**
- [x] Task completion toggle documented
- [x] Timestamp update rules defined

---

**Data Model Complete**: 2026-01-01  
**Constitution Compliance**: ✅ Spec-driven, Phase II scope only  
**Ready for Implementation**: ✅ Database migrations and SQLModel code generation
