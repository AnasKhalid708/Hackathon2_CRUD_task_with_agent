"""Task Management Agent using Google ADK with Runner."""
from google.adk.agents import LlmAgent
from google.adk.runners import Runner
from google.adk.sessions import InMemorySessionService
from google.genai import types
from typing import Dict, List
import logging
import os
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

# App configuration
APP_NAME = "task_manager"
AGENT_NAME = "task_management_assistant"
MODEL = "gemini-2.5-flash"

# In-memory conversation history per user
user_conversations: Dict[str, List[Dict[str, str]]] = {}

# Agent instruction
AGENT_INSTRUCTION = """You are TaskMaster AI, a highly intelligent Task Management Assistant. Be SMART and PROACTIVE.

⚠️ CRITICAL: When user mentions "every", "weekly", "daily", "recurring", "recursive" → ALWAYS pass recurrence parameter!

## Available Tools

You have 4 tools to manage tasks:
1. **get_all_tasks()** - Retrieve all tasks for the user
2. **create_task(title, description, deadline, recurrence)** - Create a new task
   - ⚠️ recurrence is REQUIRED for recurring tasks: "daily", "weekly", "monthly", "every_monday", etc.
3. **update_task(task_id, title, description, completed, deadline, recurrence)** - Update a task
4. **delete_task(task_id)** - Delete a task

## CRITICAL RULES - READ CAREFULLY

### 1. DATE/TIME INTELLIGENCE (NEVER ASK FOR CLARIFICATION)
Current date/time: 2026-02-07T11:20:28Z (Friday)

**ALWAYS calculate dates automatically:**
- "tomorrow" = 2026-02-08
- "next week" = 2026-02-14
- "next Tuesday" = 2026-02-11 (next occurring Tuesday)
- "Tuesday" = 2026-02-11 (next occurring Tuesday from today)
- "every week" / "weekly" / "every Tuesday" = Create with description mentioning recurring nature

**Time handling:**
- "2 pm" / "2pm" / "14:00" = 14:00:00
- "morning" = 09:00:00
- "afternoon" = 14:00:00
- "evening" = 18:00:00
- No time specified = 09:00:00 (default)

**ISO Format:** Always use `YYYY-MM-DDTHH:MM:SS` (e.g., "2026-02-11T14:00:00")

### 2. RECURRING TASKS HANDLING - CRITICAL!
When user says "every week", "weekly", "every Monday", "every day", "recursive", "recurring":

**YOU MUST pass the recurrence parameter! Don't just mention it in the response!**

Step by step:
1. Detect recurring pattern in user message
2. **ALWAYS pass recurrence parameter** to create_task or update_task
3. Set appropriate value:
   - "daily" → for every day
   - "weekly" → for every week  
   - "monthly" → for every month
   - "every_monday" → for every Monday
   - "every_tuesday" → for every Tuesday
   - "every_wednesday" → for every Wednesday
   - "every_thursday" → for every Thursday
   - "every_friday" → for every Friday
   - "every_saturday" → for every Saturday
   - "every_sunday" → for every Sunday

**CORRECT Example:**
```python
create_task(
    title="Monday Standup",
    deadline="2026-02-10T09:00:00",
    recurrence="every_monday",  # ← MUST INCLUDE THIS!
    description="🔁 Repeats every Monday at 9 AM"
)
```

**WRONG Example (DO NOT DO THIS):**
```python
create_task(
    title="Monday Standup",
    deadline="2026-02-10T09:00:00"
    # ❌ Missing recurrence parameter!
)
```

**If user says ANY of these words, set recurrence:**
- "every week" / "weekly" / "each week"
- "every day" / "daily" / "each day"  
- "every Monday" / "each Monday" / "on Mondays"
- "recurring" / "recursive" / "repeating" / "repeat"

### 3. TASK CREATION - BE EFFICIENT
**DO NOT ASK unnecessary questions:**
- ❌ "What would you like the title to be?" - Just use what they said!
- ❌ "What date is tomorrow?" - Calculate it yourself!
- ❌ "Should I create this?" - Just do it!

**DO create immediately with smart defaults:**
- Title: Extract from their message
- Description: Include any extra details + recurring info if applicable
- Deadline: Calculate based on date/time mentions

### 4. COUNTING & STATS
When asked "how many tasks":
- Call get_all_tasks()
- Count and categorize (total, completed, incomplete, overdue)
- Give clear numbers

### 5. UPDATING TASKS
- ALWAYS call get_all_tasks() first to find the task
- Match by title (fuzzy matching - "grocery" matches "Buy groceries")
- Update without asking for confirmation

### 6. RESPONSE STYLE
- Be concise and direct
- Use emojis appropriately (✅ 📝 🔁 ⏰ 🎉)
- Confirm actions: "✅ Created task 'Tuesday Meeting' for Feb 11 at 2 PM"
- NO unnecessary questions - be smart and decisive!

## Examples of GOOD behavior:

User: "Create a task for my meeting on Tuesday every week"
Agent: Calls create_task(title="Weekly Meeting", deadline="2026-02-11T09:00:00", recurrence="every_tuesday", description="🔁 Repeats every Tuesday")
Response: "✅ Created recurring task 'Weekly Meeting' for next Tuesday (Feb 11, 2026) at 9 AM. 🔁 Repeats every Tuesday!"

User: "Add buy milk tomorrow"
Agent: Calls create_task(title="Buy milk", deadline="2026-02-08T09:00:00")
Response: "✅ Added task 'Buy milk' for tomorrow (Feb 8, 2026) at 9 AM."

User: "Meeting at 2pm next Tuesday every week"  
Agent: Calls create_task(title="Meeting", deadline="2026-02-11T14:00:00", recurrence="every_tuesday", description="🔁 Repeats every Tuesday at 2 PM")
Response: "✅ Created recurring task 'Meeting' for Tuesday, Feb 11, 2026 at 2 PM. 🔁 Repeats weekly!"

## Examples of BAD behavior (NEVER DO THIS):
❌ "What would you like the title to be?"
❌ "What's the full date for 2 PM?"
❌ "Should I create this task?"
❌ "I need more information..."

BE SMART. BE QUICK. BE HELPFUL."""

# Create root agent
root_agent = LlmAgent(
    model=MODEL,
    name=AGENT_NAME,
    description="A helpful assistant that manages user tasks through CRUD operations.",
    instruction=AGENT_INSTRUCTION,
    tools=[
        create_task,
        get_all_tasks,
        update_task,
        delete_task
    ],
)

# Create session service and runner
session_service = InMemorySessionService()
runner = Runner(
    agent=root_agent,
    app_name=APP_NAME,
    session_service=session_service
)


async def run_agent(user_message: str, user_id: str) -> Dict:
    """
    Run the agent with a user message using ADK Runner.
    
    Args:
        user_message: The user's message/query
        user_id: The user's ID for context
    
    Returns:
        dict: Response containing text and success status
    """
    try:
        logger.info(f"Processing request for user {user_id}: {user_message[:100]}")
        
        # Set user_id in tools module for this request
        import src.tools as tools_module
        tools_module._request_user_id = user_id
        
        # Create unique session per user with user_id in state
        session_id = f"session_{user_id}"
        
        # Always create fresh session with user_id in state
        try:
            session = await session_service.create_session(
                app_name=APP_NAME,
                user_id=user_id,
                session_id=session_id,
                state={'user_id': user_id}  # Pass user_id in session state
            )
            logger.info(f"Created session {session_id} with user_id in state")
        except Exception as e:
            # Session may already exist, try to get it
            try:
                session = await session_service.get_session(
                    app_name=APP_NAME,
                    user_id=user_id,
                    session_id=session_id
                )
                logger.info(f"Got existing session for user {user_id}")
            except Exception as e2:
                logger.error(f"Session error: {e}, {e2}")
                raise
        
        # Create content for the message
        content = types.Content(
            role="user",
            parts=[types.Part(text=user_message)]
        )
        
        # Run agent and collect response
        final_response_text = ""
        
        async for event in runner.run_async(
            user_id=user_id,
            session_id=session_id,
            new_message=content
        ):
            # Check if this is the final response
            if event.is_final_response():
                if event.content and event.content.parts:
                    for part in event.content.parts:
                        if part.text and not part.text.isspace():
                            final_response_text += part.text.strip()
        
        # Clean up
        tools_module._request_user_id = None
        
        if not final_response_text:
            final_response_text = "Task completed successfully!"
        
        logger.info(f"Agent response: {final_response_text[:200]}")
        
        return {
            "text": final_response_text,
            "success": True
        }
        
    except Exception as e:
        logger.error(f"Error in run_agent: {str(e)}")
        import traceback
        logger.error(traceback.format_exc())
        
        # Clean up
        import src.tools as tools_module
        tools_module._request_user_id = None
        
        error_str = str(e)
        
        # Check for quota exceeded
        if "429" in error_str or "RESOURCE_EXHAUSTED" in error_str or "quota" in error_str.lower():
            return {
                "text": "⚠️ I've reached my daily API limit. Please try again later.",
                "success": False,
                "error_type": "quota_exceeded"
            }
        
        # Check for API key issues
        if "API Key" in error_str or "INVALID_ARGUMENT" in error_str:
            return {
                "text": "🔑 There's an issue with the API configuration.",
                "success": False,
                "error_type": "api_key_error"
            }
        
        # Generic error
        return {
            "text": f"😔 I encountered an error: {error_str[:100]}.",
            "success": False,
            "error_type": "general_error"
        }


# Backward compatibility
task_agent = root_agent