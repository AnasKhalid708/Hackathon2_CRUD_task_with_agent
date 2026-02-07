"""Test clear history endpoint."""
import requests
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

# Test clear history
url = "http://localhost:8000/api/agent/clear-history"
headers = {
    "Authorization": f"Bearer {token}",
    "Content-Type": "application/json"
}

payload = {
    "user_id": user_id
}

print(f"Testing clear history for user: {user_id}")
response = requests.post(url, json=payload, headers=headers)
print(f"Status: {response.status_code}")
print(f"Response: {response.json()}")

if response.status_code == 200:
    print("✅ Clear history works!")
else:
    print(f"❌ Error: {response.text}")
