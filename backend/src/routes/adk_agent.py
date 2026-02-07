from fastapi import APIRouter, HTTPException, status, Depends
from pydantic import BaseModel
from typing import Optional, List, Dict, Any
from src.middleware.jwt_auth import get_current_user
import logging

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/agent", tags=["agent"])


class ChatMessage(BaseModel):
    """Chat message model."""
    role: str
    content: str


class AgentRequest(BaseModel):
    """Request model for agent interaction."""
    message: str
    user_id: str
    chat_history: Optional[List[ChatMessage]] = []


class ClearHistoryRequest(BaseModel):
    """Request model for clearing chat history."""
    user_id: str


class AgentResponse(BaseModel):
    """Response model for agent interaction."""
    response: str
    success: bool
    tool_calls: Optional[List[Dict[str, Any]]] = []


@router.post("/chat", response_model=AgentResponse)
async def chat_with_agent(
    request: AgentRequest,
    token_user_id: str = Depends(get_current_user)
):
    """
    Chat with the Task Management Agent.
    
    The agent can help you:
    - Create new tasks
    - View your tasks
    - Update existing tasks
    - Delete tasks
    - Answer questions about your tasks
    """
    try:
        # Validate user ownership
        if request.user_id != token_user_id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Access denied: user_id mismatch"
            )
        
        logger.info(f"Processing agent request for user {request.user_id}")
        logger.info(f"Message: {request.message}")
        
        # Import agent function and conversation storage
        from src.agent import run_agent, user_conversations
        
        # Get or initialize conversation history for this user
        if request.user_id not in user_conversations:
            user_conversations[request.user_id] = []
        
        # Add user message to history
        user_conversations[request.user_id].append({
            "role": "user",
            "content": request.message
        })
        
        # Build conversation context (optional - agent handles this internally)
        # For now, just pass the current message
        message_to_agent = request.message
        
        # Run agent with user context - ADD AWAIT HERE
        result = await run_agent(message_to_agent, request.user_id)
        
        response_text = result.get("text", "")
        success = result.get("success", False)
        
        if not success:
            raise Exception(response_text)
        
        # Add agent response to history
        user_conversations[request.user_id].append({
            "role": "agent",
            "content": response_text
        })
        
        # Keep only last 20 messages to prevent memory bloat
        if len(user_conversations[request.user_id]) > 20:
            user_conversations[request.user_id] = user_conversations[request.user_id][-20:]
        
        logger.info(f"Agent response: {response_text[:200]}...")
        
        return AgentResponse(
            response=response_text,
            success=True,
            tool_calls=None
        )
        
    except Exception as e:
        logger.error(f"Error processing agent request: {str(e)}")
        import traceback
        logger.error(f"Traceback: {traceback.format_exc()}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Agent error: {str(e)}"
        )


@router.post("/clear-history")
async def clear_conversation_history(
    request: ClearHistoryRequest,
    token_user_id: str = Depends(get_current_user)
):
    """Clear conversation history for the authenticated user."""
    try:
        if request.user_id != token_user_id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Access denied: user_id mismatch"
            )
        
        from src.agent import user_conversations
        
        if request.user_id in user_conversations:
            user_conversations[request.user_id] = []
            logger.info(f"Cleared conversation history for user {request.user_id}")
        
        return {"success": True, "message": "Conversation history cleared"}
    
    except Exception as e:
        logger.error(f"Error clearing history: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error: {str(e)}"
        )


@router.get("/status")
async def agent_status():
    """Check agent service status."""
    try:
        return {
            "status": "active",
            "agent_name": "TaskMasterAI",
            "model": "gemini-2.5-flash",
            "tools_available": 4
        }
    except Exception as e:
        return {
            "status": "error",
            "error": str(e)
        }
