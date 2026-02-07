"""Task Management Agent using Google ADK with automatic tool calling."""
from google.adk.agents import LlmAgent
from google.genai import types
from typing import Dict, List
import logging
import os
from src.agent_prompt import AGENT_INSTRUCTION
from dotenv import load_dotenv
from src.tools import (
    create_task,
    get_all_tasks,
    update_task,
    delete_task
)

load_dotenv(override=True)
PROJECT_ID = os.getenv("GOOGLE_CLOUD_PROJECT")
LOCATION = os.getenv("GOOGLE_CLOUD_LOCATION", "us-central1")

# Setup logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# In-memory conversation history per user
user_conversations: Dict[str, List[Dict[str, str]]] = {}


# Create root agent
root_agent = LlmAgent(
    model='gemini-2.5-flash',
    name='task_management_assistant',
    description="""
    You are a helpful assistant that manages user tasks. You can create, read, update, and delete tasks for users.
    Each task has a title, description, deadline, and completion status. You have access to specific tools to perform 
    these operations on the user's tasks. Always respond in a natural language format to the user after performing any 
    tool operations.
    """,
    instruction=AGENT_INSTRUCTION,
    generate_content_config=types.GenerateContentConfig(
        temperature=0.3,
        top_p=0.9,
        top_k=40
    ),
    tools=[
        create_task,
        get_all_tasks,
        update_task,
        delete_task
    ],
    sub_agents=[],
)


async def run_agent(user_message: str, user_id: str) -> Dict:
    """
    Run the agent with a user message.
    """
    try:
        logger.info(f"Processing request for user {user_id}: {user_message[:100]}")
        
        # run_async expects the message as the first positional argument
        # and returns an async generator
        response_parts = []
        async for chunk in root_agent.run_async(
            message=user_message,
            # You can add state here if needed
            # state={'user_id': user_id}
        ):
            response_parts.append(chunk)
        
        # Extract text from the response parts
        response_text = ""
        
        # Try to get text from the last chunk first
        if response_parts:
            last_chunk = response_parts[-1]
            
            # Check different possible attributes
            if hasattr(last_chunk, 'text') and last_chunk.text:
                response_text = last_chunk.text
            elif hasattr(last_chunk, 'content') and last_chunk.content:
                if isinstance(last_chunk.content, str):
                    response_text = last_chunk.content
                elif hasattr(last_chunk.content, 'text'):
                    response_text = last_chunk.content.text
                else:
                    response_text = str(last_chunk.content)
            elif hasattr(last_chunk, 'message') and last_chunk.message:
                response_text = str(last_chunk.message)
            else:
                response_text = str(last_chunk)
        
        # Fallback: combine all chunks if no text found
        if not response_text:
            response_text = " ".join(str(chunk) for chunk in response_parts)
        
        logger.info(f"Agent response: {response_text[:200]}")
        
        return {
            "text": response_text,
            "success": True
        }
        
    except Exception as e:
        logger.error(f"Error in run_agent: {str(e)}")
        import traceback
        logger.error(traceback.format_exc())
        
        error_str = str(e)
        
        # Check for quota exceeded
        if "429" in error_str or "RESOURCE_EXHAUSTED" in error_str or "quota" in error_str.lower():
            return {
                "text": "⚠️ I've reached my daily API limit. Please try again later or contact support to upgrade the service for unlimited access. The quota resets in about 24 hours.",
                "success": False,
                "error_type": "quota_exceeded"
            }
        
        # Check for API key issues
        if "API Key" in error_str or "INVALID_ARGUMENT" in error_str:
            return {
                "text": "🔑 There's an issue with the API configuration. Please contact support to resolve this.",
                "success": False,
                "error_type": "api_key_error"
            }
        
        # Generic error
        return {
            "text": f"😔 I encountered an error: {error_str[:100]}. Please try again or contact support if the issue persists.",
            "success": False,
            "error_type": "general_error"
        }