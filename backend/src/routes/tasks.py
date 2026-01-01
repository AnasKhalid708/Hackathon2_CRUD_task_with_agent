"""Task CRUD routes."""
from fastapi import APIRouter, HTTPException, status, Depends, Query
from sqlmodel import Session, select
from datetime import datetime
from typing import Optional
from src.models.task import Task, TaskCreate, TaskUpdate, TaskRead
from src.database import get_db
from src.middleware.jwt_auth import get_current_user

router = APIRouter(prefix="/api/users/{user_id}/tasks", tags=["tasks"])


def validate_user_ownership(user_id: str, token_user_id: str):
    """Validate that URL user_id matches JWT token user_id."""
    if user_id != token_user_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied: user_id mismatch"
        )


@router.get("", response_model=dict)
async def list_tasks(
    user_id: str,
    filter: Optional[str] = Query("all", pattern="^(all|complete|incomplete|overdue|upcoming|no-deadline)$"),
    sort: Optional[str] = Query("created_desc", pattern="^(created_asc|created_desc|title_asc|title_desc|status|deadline_asc|deadline_desc)$"),
    search: Optional[str] = None,
    token_user_id: str = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get all tasks for authenticated user with filtering, sorting, and search."""
    validate_user_ownership(user_id, token_user_id)
    
    query = select(Task).where(Task.user_id == user_id)
    
    now = datetime.utcnow()
    
    if filter == "complete":
        query = query.where(Task.completed == True)
    elif filter == "incomplete":
        query = query.where(Task.completed == False)
    elif filter == "overdue":
        query = query.where(Task.deadline < now, Task.completed == False)
    elif filter == "upcoming":
        from datetime import timedelta
        upcoming_deadline = now + timedelta(hours=24)
        query = query.where(Task.deadline != None, Task.deadline <= upcoming_deadline, Task.deadline >= now)
    elif filter == "no-deadline":
        query = query.where(Task.deadline == None)
    
    if search:
        search_pattern = f"%{search}%"
        query = query.where(
            (Task.title.contains(search)) | (Task.description.contains(search))
        )
    
    tasks = db.exec(query).all()
    
    if sort == "created_asc":
        tasks = sorted(tasks, key=lambda t: t.created_at)
    elif sort == "created_desc":
        tasks = sorted(tasks, key=lambda t: t.created_at, reverse=True)
    elif sort == "title_asc":
        tasks = sorted(tasks, key=lambda t: t.title.lower())
    elif sort == "title_desc":
        tasks = sorted(tasks, key=lambda t: t.title.lower(), reverse=True)
    elif sort == "status":
        tasks = sorted(tasks, key=lambda t: (t.completed, t.created_at))
    elif sort == "deadline_asc":
        tasks = sorted(tasks, key=lambda t: (t.deadline is None, t.deadline or datetime.max))
    elif sort == "deadline_desc":
        tasks = sorted(tasks, key=lambda t: (t.deadline is None, t.deadline or datetime.min), reverse=True)
    
    return {
        "tasks": [TaskRead.model_validate(task) for task in tasks],
        "total": len(tasks)
    }


@router.post("", response_model=TaskRead, status_code=status.HTTP_201_CREATED)
async def create_task(
    user_id: str,
    task_data: TaskCreate,
    token_user_id: str = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Create a new task for authenticated user."""
    validate_user_ownership(user_id, token_user_id)
    
    if not task_data.title.strip():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Title cannot be empty"
        )
    
    new_task = Task(
        user_id=user_id,
        title=task_data.title.strip(),
        description=task_data.description.strip() if task_data.description else "",
        deadline=task_data.deadline
    )
    
    db.add(new_task)
    db.commit()
    db.refresh(new_task)
    
    return new_task


@router.get("/stats", response_model=dict)
async def get_task_stats(
    user_id: str,
    token_user_id: str = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get task statistics."""
    validate_user_ownership(user_id, token_user_id)
    
    from datetime import timedelta, date
    now = datetime.utcnow()
    upcoming_deadline = now + timedelta(hours=24)
    today_start = datetime.combine(date.today(), datetime.min.time())
    today_end = datetime.combine(date.today(), datetime.max.time())
    
    all_tasks = db.exec(select(Task).where(Task.user_id == user_id)).all()
    
    total = len(all_tasks)
    completed = len([t for t in all_tasks if t.completed])
    incomplete = total - completed
    overdue = len([t for t in all_tasks if t.deadline and t.deadline < now and not t.completed])
    due_today = len([t for t in all_tasks if t.deadline and today_start <= t.deadline <= today_end])
    upcoming_24h = len([t for t in all_tasks if t.deadline and now <= t.deadline <= upcoming_deadline])
    no_deadline = len([t for t in all_tasks if t.deadline is None])
    
    return {
        "total": total,
        "completed": completed,
        "incomplete": incomplete,
        "overdue": overdue,
        "due_today": due_today,
        "upcoming_24h": upcoming_24h,
        "no_deadline": no_deadline
    }


@router.get("/upcoming", response_model=dict)
async def get_upcoming_tasks(
    user_id: str,
    token_user_id: str = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get tasks due in next 24 hours."""
    validate_user_ownership(user_id, token_user_id)
    
    from datetime import timedelta
    now = datetime.utcnow()
    upcoming_deadline = now + timedelta(hours=24)
    
    query = select(Task).where(
        Task.user_id == user_id,
        Task.deadline != None,
        Task.deadline <= upcoming_deadline,
        Task.deadline >= now
    ).order_by(Task.deadline)
    
    tasks = db.exec(query).all()
    
    return {
        "tasks": [TaskRead.model_validate(task) for task in tasks],
        "count": len(tasks)
    }


@router.get("/overdue", response_model=dict)
async def get_overdue_tasks(
    user_id: str,
    token_user_id: str = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get overdue incomplete tasks."""
    validate_user_ownership(user_id, token_user_id)
    
    now = datetime.utcnow()
    
    query = select(Task).where(
        Task.user_id == user_id,
        Task.deadline < now,
        Task.completed == False
    ).order_by(Task.deadline)
    
    tasks = db.exec(query).all()
    
    return {
        "tasks": [TaskRead.model_validate(task) for task in tasks],
        "count": len(tasks)
    }


@router.get("/{task_id}", response_model=TaskRead)
async def get_task(
    user_id: str,
    task_id: str,
    token_user_id: str = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get details of a specific task."""
    validate_user_ownership(user_id, token_user_id)
    
    task = db.get(Task, task_id)
    
    if not task:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Task not found"
        )
    
    if task.user_id != user_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied: not your task"
        )
    
    return task


@router.put("/{task_id}", response_model=TaskRead)
async def update_task(
    user_id: str,
    task_id: str,
    task_data: TaskUpdate,
    token_user_id: str = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Update task title and/or description."""
    validate_user_ownership(user_id, token_user_id)
    
    task = db.get(Task, task_id)
    
    if not task:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Task not found"
        )
    
    if task.user_id != user_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied: not your task"
        )
    
    if task_data.title is None and task_data.description is None and task_data.deadline is None:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="At least one field must be provided for update"
        )
    
    if task_data.title is not None:
        if not task_data.title.strip():
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Title cannot be empty"
            )
        task.title = task_data.title.strip()
    
    if task_data.description is not None:
        task.description = task_data.description.strip()
    
    if task_data.deadline is not None:
        task.deadline = task_data.deadline
    
    task.updated_at = datetime.utcnow()
    
    db.add(task)
    db.commit()
    db.refresh(task)
    
    return task


@router.delete("/{task_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_task(
    user_id: str,
    task_id: str,
    token_user_id: str = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Delete a task permanently."""
    validate_user_ownership(user_id, token_user_id)
    
    task = db.get(Task, task_id)
    
    if not task:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Task not found"
        )
    
    if task.user_id != user_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied: not your task"
        )
    
    db.delete(task)
    db.commit()


@router.patch("/{task_id}/complete", response_model=TaskRead)
async def toggle_task_completion(
    user_id: str,
    task_id: str,
    token_user_id: str = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Toggle task completion status."""
    validate_user_ownership(user_id, token_user_id)
    
    task = db.get(Task, task_id)
    
    if not task:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Task not found"
        )
    
    if task.user_id != user_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied: not your task"
        )
    
    task.completed = not task.completed
    task.updated_at = datetime.utcnow()
    
    db.add(task)
    db.commit()
    db.refresh(task)
    
    return task


