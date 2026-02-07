"""Test script for agent CRUD operations."""
import requests
import json
import jwt
from datetime import datetime, timedelta

BASE_URL = "http://127.0.0.1:8000"
USER_ID = "7f8e66d0-9fc5-4db2-8ff8-70ca8793d868"
JWT_SECRET = "XiZoxQg1uKgfOcM2ZWJkQJm50GR8_eKLrsndu_DI_Bo"  # From .env

# Generate JWT token for the user
def generate_test_token():
    """Generate a JWT token for testing."""
    expire = datetime.utcnow() + timedelta(hours=24)
    payload = {
        "user_id": USER_ID,
        "exp": expire
    }
    token = jwt.encode(payload, JWT_SECRET, algorithm="HS256")
    return token

# Global token variable
AUTH_TOKEN = None

def test_agent_chat(message: str, description: str = ""):
    """Test agent chat endpoint."""
    global AUTH_TOKEN
    
    print(f"\n{'='*80}")
    print(f"TEST: {description}")
    print(f"Message: {message}")
    print(f"{'='*80}")
    
    url = f"{BASE_URL}/api/agent/chat"
    
    headers = {
        "Authorization": f"Bearer {AUTH_TOKEN}",
        "Content-Type": "application/json"
    }
    
    payload = {
        "message": message,
        "user_id": USER_ID,
        "chat_history": []
    }
    
    try:
        response = requests.post(url, json=payload, headers=headers)
        print(f"Status Code: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            print(f"Response: {data.get('response', 'No response')}")
            if data.get('tool_calls'):
                print(f"Tool Calls: {json.dumps(data['tool_calls'], indent=2)}")
            print(f"Success: {data.get('success')}")
        else:
            print(f"Error: {response.text}")
            
        return response
    except Exception as e:
        print(f"Exception: {str(e)}")
        return None

def main():
    """Run all agent tests."""
    global AUTH_TOKEN
    
    print("\n" + "="*80)
    print("AGENT TESTING SUITE")
    print("="*80)
    
    # Generate auth token
    print("\nGenerating JWT token for user...")
    try:
        AUTH_TOKEN = generate_test_token()
        print(f"Token generated successfully (length: {len(AUTH_TOKEN)})")
    except Exception as e:
        print(f"Error generating token: {e}")
        return
    
    # First, check agent status
    print("\n1. Checking Agent Status...")
    try:
        response = requests.get(f"{BASE_URL}/api/agent/status")
        print(f"Agent Status: {response.json()}")
    except Exception as e:
        print(f"Error checking status: {e}")
    
    # Test 1: Create a simple task
    test_agent_chat(
        "Create a task called 'Buy groceries' with description 'Milk, eggs, bread'",
        "Test 1: Create Simple Task"
    )
    
    # Test 2: Create task with deadline
    deadline = (datetime.now() + timedelta(days=2)).isoformat()
    test_agent_chat(
        f"Create a task 'Complete project report' with deadline {deadline}",
        "Test 2: Create Task with Deadline"
    )
    
    # Test 3: Create recursive/nested task
    test_agent_chat(
        "Create a task 'Plan vacation' with description 'Research destinations, book flights, reserve hotel'",
        "Test 3: Create Complex Task"
    )
    
    # Test 4: Retrieve all tasks
    test_agent_chat(
        "Show me all my tasks",
        "Test 4: Retrieve All Tasks"
    )
    
    # Test 5: Update a task (we'll need to get task ID first)
    test_agent_chat(
        "Mark the 'Buy groceries' task as complete",
        "Test 5: Update Task Status"
    )
    
    # Test 6: Search for task
    test_agent_chat(
        "Find tasks with 'project' in the title",
        "Test 6: Search Tasks"
    )
    
    # Test 7: Update task description
    test_agent_chat(
        "Update the 'Plan vacation' task description to 'Research Hawaii, book flights for June, reserve beachfront hotel'",
        "Test 7: Update Task Description"
    )
    
    # Test 8: Create multiple related tasks (recursive)
    test_agent_chat(
        "Create a task 'Website redesign' and then create sub-tasks: 'Design mockups', 'Frontend development', 'Backend API', 'Testing'",
        "Test 8: Create Multiple Related Tasks"
    )
    
    # Test 9: Get incomplete tasks
    test_agent_chat(
        "Show me all my incomplete tasks",
        "Test 9: Filter Incomplete Tasks"
    )
    
    # Test 10: Delete a task
    test_agent_chat(
        "Delete the 'Buy groceries' task",
        "Test 10: Delete Task"
    )
    
    # Test 11: Verify deletion
    test_agent_chat(
        "Show me all my tasks",
        "Test 11: Verify Deletion"
    )
    
    print("\n" + "="*80)
    print("TESTING COMPLETE")
    print("="*80)

if __name__ == "__main__":
    main()
