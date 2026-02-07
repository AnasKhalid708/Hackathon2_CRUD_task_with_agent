from typing import Optional, Dict, Any
import logging
from datetime import datetime
from sqlmodel import Session, select
from src.database import engine
from src.models.task import Task
from google.adk.tools import ToolContext

logger = logging.getLogger(__name__)


def _get_user_id(tool_context: ToolContext) -> Optional[str]:
    """Get user_id from ToolContext state."""
    if tool_context and hasattr(tool_context, 'state'):
        user_id = tool_context.state.get('user_id')
        if user_id:
            return user_id
    return None


def create_task(
    tool_context: ToolContext,
    title: str, 
    description: str = "", 
    deadline: Optional[str] = None,
) -> Dict[str, Any]:
    """
    Create a new task for the current user.
    
    Args:
        title: The task title (required, max 200 characters)
        description: Task description (optional, max 1000 characters)
        deadline: Deadline in ISO format like "2026-01-25T12:00:00" (optional)
    
    Returns:
        Task details with id, title, description, completed status, deadline, and creation time
    """
    try:
        # Get user_id from tool context state
        user_id = _get_user_id(tool_context)
        if not user_id:
            return {"error": "User context not available"}
        
        logger.info(f"Creating task for user {user_id}: {title}")
        
        with Session(engine) as db:
            deadline_dt = None
            if deadline:
                try:
                    deadline_dt = datetime.fromisoformat(deadline.replace('Z', '+00:00'))
                except ValueError:
                    return {"error": "Invalid deadline format. Use ISO format (YYYY-MM-DDTHH:MM:SS)"}
            
            task = Task(
                user_id=user_id,
                title=title[:200],
                description=description[:1000] if description else "",
                deadline=deadline_dt
            )
            
            db.add(task)
            db.commit()
            db.refresh(task)
            
            return {
                "success": True,
                "message": f"Task '{title}' created successfully!",
                "task": {
                    "id": str(task.id),
                    "title": task.title,
                    "description": task.description,
                    "completed": task.completed,
                    "deadline": task.deadline.isoformat() if task.deadline else None,
                    "created_at": task.created_at.isoformat()
                }
            }
    except Exception as e:
        logger.error(f"Error creating task: {str(e)}")
        return {"error": f"Failed to create task: {str(e)}"}


def get_all_tasks(
    tool_context: ToolContext
) -> Dict[str, Any]:
    """
    Retrieve all tasks for the current user.
    
    Returns:
        List of all tasks with their details (id, title, description, completed, deadline)
    """
    try:
        # Get user_id from tool context state
        user_id = _get_user_id(tool_context)
        if not user_id:
            return {"error": "User context not available"}
        
        logger.info(f"Retrieving all tasks for user {user_id}")
        
        with Session(engine) as db:
            query = select(Task).where(Task.user_id == user_id)
            query = query.order_by(Task.created_at.desc())
            tasks = db.exec(query).all()
            
            task_list = [
                {
                    "id": str(task.id),
                    "title": task.title,
                    "description": task.description,
                    "completed": task.completed,
                    "deadline": task.deadline.isoformat() if task.deadline else None,
                    "created_at": task.created_at.isoformat()
                }
                for task in tasks
            ]
            
            return {
                "success": True,
                "count": len(task_list),
                "tasks": task_list
            }
            
    except Exception as e:
        logger.error(f"Error retrieving tasks: {str(e)}")
        return {"error": f"Failed to retrieve tasks: {str(e)}"}


def update_task(
    tool_context: ToolContext,
    task_id: str,
    title: Optional[str] = None,
    description: Optional[str] = None,
    completed: Optional[bool] = None,
    deadline: Optional[str] = None
) -> Dict[str, Any]:
    """
    Update an existing task.
    
    Args:
        task_id: The UUID of the task to update
        title: New title (optional)
        description: New description (optional)
        completed: Mark as complete (True) or incomplete (False) (optional)
        deadline: New deadline in ISO format (optional)
    
    Returns:
        Updated task details
    """
    try:
        # Get user_id from tool context state
        user_id = _get_user_id(tool_context)
        if not user_id:
            return {"error": "User context not available"}
        
        logger.info(f"Updating task {task_id} for user {user_id}")
        
        with Session(engine) as db:
            task = db.get(Task, task_id)
            
            if not task or str(task.user_id) != str(user_id):
                return {"error": "Task not found"}
            
            if title is not None:
                task.title = title[:200]
            if description is not None:
                task.description = description[:1000]
            if completed is not None:
                task.completed = completed
            if deadline is not None:
                try:
                    task.deadline = datetime.fromisoformat(deadline.replace('Z', '+00:00'))
                except ValueError:
                    return {"error": "Invalid deadline format. Use ISO format (YYYY-MM-DDTHH:MM:SS)"}
            
            task.updated_at = datetime.utcnow()
            
            db.add(task)
            db.commit()
            db.refresh(task)
            
            return {
                "success": True,
                "message": f"Task '{task.title}' updated successfully!",
                "task": {
                    "id": str(task.id),
                    "title": task.title,
                    "description": task.description,
                    "completed": task.completed,
                    "deadline": task.deadline.isoformat() if task.deadline else None,
                    "updated_at": task.updated_at.isoformat()
                }
            }
            
    except Exception as e:
        logger.error(f"Error updating task: {str(e)}")
        return {"error": f"Failed to update task: {str(e)}"}


def delete_task(
    tool_context: ToolContext, 
    task_id: str
) -> Dict[str, Any]:
    """
    Delete a task permanently.
    
    Args:
        task_id: The UUID of the task to delete
    
    Returns:
        Success message or error
    """
    try:
        # Get user_id from tool context state
        user_id = _get_user_id(tool_context)
        if not user_id:
            return {"error": "User context not available"}
        
        logger.info(f"Deleting task {task_id} for user {user_id}")
        
        with Session(engine) as db:
            task = db.get(Task, task_id)
            
            if not task or str(task.user_id) != str(user_id):
                return {"error": "Task not found"}
            
            task_title = task.title
            db.delete(task)
            db.commit()
            
            return {
                "success": True,
                "message": f"Task '{task_title}' deleted successfully!"
            }
            
    except Exception as e:
        logger.error(f"Error deleting task: {str(e)}")
        return {"error": f"Failed to delete task: {str(e)}"}
