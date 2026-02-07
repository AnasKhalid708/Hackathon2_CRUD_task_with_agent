"""Test agent endpoint with user_id in state."""
import requests
import json

BASE_URL = "http://127.0.0.1:8000"
USER_ID = "7f8e66d0-9fc5-4db2-8ff8-70ca8793d868"

# Generate test token
import jwt
from datetime import datetime, timedelta

JWT_SECRET = "XiZoxQg1uKgfOcM2ZWJkQJm50GR8_eKLrsndu_DI_Bo"
expire = datetime.utcnow() + timedelta(hours=24)
payload = {"user_id": USER_ID, "exp": expire}
token = jwt.encode(payload, JWT_SECRET, algorithm="HS256")

print("="*80)
print("Testing Agent with ToolContext State Integration")
print("="*80)

# Test 1: Check agent status
print("\n--- TEST 1: Check Agent Status ---")
response = requests.get(f"{BASE_URL}/api/agent/status")
print(f"Status: {response.status_code}")
print(json.dumps(response.json(), indent=2))

# Test 2: Create task via agent
print("\n--- TEST 2: Create Task via Agent ---")
response = requests.post(
    f"{BASE_URL}/api/agent/chat",
    headers={"Authorization": f"Bearer {token}"},
    json={
        "message": "Create a task called 'Test ToolContext Integration' with description 'Verify user_id comes from state'",
        "user_id": USER_ID,
        "chat_history": []
    }
)
print(f"Status: {response.status_code}")
if response.status_code == 200:
    print(json.dumps(response.json(), indent=2))
else:
    print(f"Error: {response.text}")

# Test 3: List all tasks
print("\n--- TEST 3: List All Tasks via Agent ---")
response = requests.post(
    f"{BASE_URL}/api/agent/chat",
    headers={"Authorization": f"Bearer {token}"},
    json={
        "message": "Show me all my tasks",
        "user_id": USER_ID,
        "chat_history": []
    }
)
print(f"Status: {response.status_code}")
if response.status_code == 200:
    result = response.json()
    print(f"Success: {result.get('success')}")
    print(f"Response: {result.get('response')[:200]}...")
    print(f"Tool Calls: {len(result.get('tool_calls', []))}")
else:
    print(f"Error: {response.text}")

print("\n" + "="*80)
print("Tests completed!")
print("="*80)
