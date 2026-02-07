"""Simple Task Management Agent using Google Genai with manual function calling."""
from google.adk.agents import LlmAgent
from google import genai
from google.genai import types
from typing import Optional, Dict, List, Any
import logging
import os
import json
from dotenv import load_dotenv
from src.agent_prompt import TASK_AGENT_PROMPT
from src.tools import (
    create_task,
    get_all_tasks,
    get_task_by_id,
    get_task_by_title,
    update_task,
    delete_task
)

load_dotenv(override=True)  # Override any system environment variables
PROJECT_ID = os.getenv("GOOGLE_CLOUD_PROJECT")
LOCATION = os.getenv("GOOGLE_CLOUD_LOCATION", "us-central1")

# Setup logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Load settings - force reload to override system vars
GOOGLE_API_KEY = os.getenv("GOOGLE_API_KEY")
if not GOOGLE_API_KEY:
    # Try loading again with absolute path
    env_path = os.path.join(os.path.dirname(os.path.dirname(__file__)), '.env')
    load_dotenv(env_path, override=True)
    GOOGLE_API_KEY = os.getenv("GOOGLE_API_KEY")
    
if not GOOGLE_API_KEY:
    raise ValueError("GOOGLE_API_KEY environment variable not set")

logger.info(f"Agent initialized with API key: {GOOGLE_API_KEY[:10]}...")

# In-memory conversation history per user
user_conversations: Dict[str, List[Dict[str, str]]] = {}


def execute_tool(tool_name: str, tool_args: Dict[str, Any]) -> Dict[str, Any]:
    """Execute a tool function by name."""
    logger.info(f"Executing tool: {tool_name} with args: {tool_args}")
    
    try:
        # All tools accept tool_context parameter, pass None since we set user_id via module variable
        if tool_name == "create_task":
            return create_task(**tool_args, tool_context=None)
        elif tool_name == "get_all_tasks":
            return get_all_tasks(**tool_args, tool_context=None)
        elif tool_name == "get_task_by_id":
            return get_task_by_id(**tool_args, tool_context=None)
        elif tool_name == "update_task":
            return update_task(**tool_args, tool_context=None)
        elif tool_name == "delete_task":
            return delete_task(**tool_args, tool_context=None)
        else:
            return {"error": f"Unknown tool: {tool_name}"}
    except Exception as e:
        logger.error(f"Tool execution error: {str(e)}")
        return {"error": str(e)}


def run_agent(user_message: str, user_id: str) -> Dict:
    """
    Run the agent with a user message using simple approach.
    
    Args:
        user_message: The user's message/query
        user_id: The user's ID for context
    
    Returns:
        dict: Response containing text and success status
    """
    try:
        # Set user context in tools
        import src.tools as tools_module
        tools_module._request_user_id = user_id
        
        logger.info(f"Processing request for user {user_id}: {user_message[:100]}")
        
        # Create a simple client for each request with the API key
        # client = genai.Client(api_key=GOOGLE_API_KEY)
        client = genai.Client(vertexai=True, project=PROJECT_ID, location=LOCATION)
        
        # Build system prompt with instructions
        system_instruction = f"""{TASK_AGENT_PROMPT}

You have access to these tools:
1. create_task(title: str, description: str = "", deadline: str = None) - Create a new task
2. get_all_tasks(filter_type: str = "all") - Get tasks (filter: all/complete/incomplete/overdue)
3. update_task(task_id: str, title: str = None, description: str = None, completed: bool = None, deadline: str = None) - Update a task
4. delete_task(task_id: str) - Delete a task

When you need to use a tool, respond with JSON in this format:
{{"tool": "tool_name", "args": {{"arg1": "value1"}}}}

After using a tool, provide a natural language response to the user."""

        # Create initial prompt
        full_prompt = f"{system_instruction}\n\nUser: {user_message}\n\nAssistant:"
        
        # Make API call
        response = client.models.generate_content(
            model='models/gemini-2.5-flash',
            contents=full_prompt,
            config=types.GenerateContentConfig(
                temperature=0.3,
                max_output_tokens=2048
            )
        )
        
        # Extract response text
        response_text = ""
        if response.candidates:
            for part in response.candidates[0].content.parts:
                if hasattr(part, 'text'):
                    response_text += part.text
        
        logger.info(f"Model response: {response_text[:200]}")
        
        # Check if response contains a tool call (JSON format)
        tool_result_text = ""
        if response_text.strip().startswith('{'):
            try:
                tool_call = json.loads(response_text.strip())
                if 'tool' in tool_call and 'args' in tool_call:
                    # Execute the tool
                    result = execute_tool(tool_call['tool'], tool_call['args'])
                    logger.info(f"Tool result: {str(result)[:200]}")
                    
                    # Get final response from model after tool execution
                    follow_up_prompt = f"""{full_prompt}

Tool call: {json.dumps(tool_call)}
Tool result: {json.dumps(result)}

Based on the tool result, provide a natural, helpful response to the user."""
                    
                    follow_up_response = client.models.generate_content(
                        model='models/gemini-2.5-flash',
                        contents=follow_up_prompt,
                        config=types.GenerateContentConfig(
                            temperature=0.3,
                            max_output_tokens=2048
                        )
                    )
                    
                    if follow_up_response.candidates:
                        for part in follow_up_response.candidates[0].content.parts:
                            if hasattr(part, 'text'):
                                tool_result_text += part.text
                    
                    response_text = tool_result_text if tool_result_text else f"Task completed: {result}"
            except json.JSONDecodeError:
                # Not a tool call, just regular response
                pass
        
        # Clean up
        tools_module._request_user_id = None
        
        return {
            "text": response_text,
            "success": True
        }
        
    except Exception as e:
        logger.error(f"Error in run_agent: {str(e)}")
        import traceback
        logger.error(traceback.format_exc())
        
        # Clean up
        import src.tools as tools_module
        tools_module._request_user_id = None
        
        # Handle specific error types with user-friendly messages
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


# Backward compatibility
task_agent = None
root_agent = None


root_agent = LlmAgent(
    model='gemini-2.5-flash',
    name='fitness_plan_assistant',
    description="""
    A fitness plan assistant that helps users create and modify workout plans.
    Can create new multi-week workout plans based on user goals, fitness level, and preferences.
    Can update existing plans by adding/removing exercises, changing parameters, swapping days, etc.
    Uses human-in-the-loop to gather user preferences through interactive forms.
    """,
    instruction=ROOT_AGENT_PROMPT,
    generate_content_config=types.GenerateContentConfig(
        temperature=0.3,
        top_p=0.9,
        top_k=40
    ),
    tools=[
        create_task,
        get_all_tasks,
        get_task_by_id,
        get_task_by_title,
        update_task,
        delete_task
    ],
    sub_agents=[],
)