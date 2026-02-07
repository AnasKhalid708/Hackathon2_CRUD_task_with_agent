"""Simple test to verify agent creates tasks."""
import requests
import json
from datetime import datetime, timedelta
import jwt

# Create JWT token
secret = "XiZoxQg1uKgfOcM2ZWJkQJm50GR8_eKLrsndu_DI_Bo"
user_id = "7f8e66d0-9fc5-4db2-8ff8-70ca8793d868"
expire = datetime.utcnow() + timedelta(hours=24)

token_data = {
    "sub": user_id,
    "exp": expire
}
token = jwt.encode(token_data, secret, algorithm="HS256")

# Test agent
url = "http://localhost:8000/api/agent/chat"
headers = {
    "Authorization": f"Bearer {token}",
    "Content-Type": "application/json"
}

print("Testing: Create a task called 'Buy groceries'")
payload = {
    "message": "create a task called 'Buy groceries'",
    "user_id": user_id
}

response = requests.post(url, json=payload, headers=headers)
print(f"Status: {response.status_code}")
if response.status_code == 200:
    data = response.json()
    print(f"✅ Response: {data['response'][:300]}")
else:
    print(f"❌ Error: {response.text[:200]}")
