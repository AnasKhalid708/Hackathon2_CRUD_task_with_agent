"""Test ADK agent with ToolContext and State."""
import sys
import os

# Add backend to path
backend_path = os.path.join(os.path.dirname(__file__), 'backend')
sys.path.insert(0, backend_path)

from src.tools import create_task, get_all_tasks, delete_task, update_task
from google.adk.tools import ToolContext, State
import json

# Test user ID
USER_ID = "7f8e66d0-9fc5-4db2-8ff8-70ca8793d868"

print("="*80)
print("Testing ADK Tools with ToolContext and State")
print("="*80)

# Create a ToolContext with State containing user_id
state = State(user_id=USER_ID)
tool_context = ToolContext(state=state)

print(f"\nUser ID in state: {state.get('user_id')}")

# Test 1: Create task with ToolContext
print("\n--- TEST 1: Create Task with ToolContext ---")
result = create_task(
    title="Test ADK Task",
    description="Testing ToolContext integration",
    deadline="2026-01-30T12:00:00",
    tool_context=tool_context
)
print(json.dumps(result, indent=2, default=str))

# Test 2: Get all tasks
print("\n--- TEST 2: Get All Tasks ---")
result = get_all_tasks(filter_type="all", tool_context=tool_context)
print(f"Found {result.get('count', 0)} tasks for user")

print("\n" + "="*80)
print("All tests completed successfully!")
print("="*80)

