"""Direct test of agent with explicit API key - no environment variables."""
import sys
import requests
import json

# Your API key
USER_API_KEY = "AIzaSyBS2gyco-F6eUfsJdBe6iZlDCB2PcD4qPc"

# Test if API key works directly with Google
print("=" * 80)
print("Testing API Key Directly with Google Genai")
print("=" * 80)

try:
    from google import genai
    
    client = genai.Client(api_key=USER_API_KEY)
    response = client.models.generate_content(
        model='models/gemini-2.5-flash',
        contents='Say "Hello!" in 3 words'
    )
    
    result_text = response.text if hasattr(response, 'text') else str(response)
    print(f"✅ SUCCESS! API Key works!")
    print(f"Response: {result_text}")
    
except Exception as e:
    print(f"❌ FAILED! Error: {str(e)[:200]}")
    sys.exit(1)

print("\n" + "=" * 80)
print("Testing Agent Endpoint")
print("=" * 80)

# Test agent endpoint
url = "http://localhost:8000/api/agent/chat"
payload = {
    "message": "list my tasks",
    "user_id": "7f8e66d0-9fc5-4db2-8ff8-70ca8793d868",
    "chat_history": []
}

try:
    response = requests.post(url, json=payload)
    print(f"Status: {response.status_code}")
    
    if response.status_code == 200:
        data = response.json()
        print(f"✅ Agent Response: {data.get('response', 'No response')[:200]}")
    else:
        print(f"❌ Error: {response.text[:300]}")
        
except Exception as e:
    print(f"❌ Request failed: {e}")

print("\n" + "=" * 80)
