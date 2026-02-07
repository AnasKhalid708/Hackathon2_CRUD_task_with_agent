# Quickstart Guide: ADK Agent Task Management
## Get Started with Natural Language Task Management

**Feature**: 001-adk-agent-integration  
**Version**: 1.0.0  
**Date**: 2026-01-24

---

## Prerequisites

Before starting, ensure you have:

- ✅ Phase II Todo application running (backend + database)
- ✅ Python 3.12.4 installed
- ✅ Virtual environment activated
- ✅ Google Cloud account with Gemini API access
- ✅ GOOGLE_API_KEY obtained from [Google AI Studio](https://aistudio.google.com/app/apikey)

---

## Step 1: Install Dependencies

Navigate to the backend directory and install the ADK packages:

```bash
cd backend

# Activate virtual environment if not already active
# On Windows:
venv\Scripts\activate
# On Mac/Linux:
source venv/bin/activate

# Install Google ADK dependencies
pip install google-genai>=0.3.0 google-adk>=0.1.0

# Verify installation
python -c "from google.adk.agents import LlmAgent; print('ADK installed successfully!')"
```

**Expected Output**:
```
ADK installed successfully!
```

---

## Step 2: Configure Google API Key

Add your Google API key to the backend environment configuration:

### Option A: Update .env file
```bash
# Edit backend/.env
echo GOOGLE_API_KEY=your_actual_api_key_here >> .env
```

### Option B: Set environment variable
```bash
# Windows PowerShell
$env:GOOGLE_API_KEY="your_actual_api_key_here"

# Mac/Linux
export GOOGLE_API_KEY="your_actual_api_key_here"
```

**Security Note**: Never commit your API key to version control. Keep it in .env (which is gitignored).

---

## Step 3: Verify Agent Status

Start the backend server and check agent health:

```bash
# Start backend (if not running)
cd backend
uvicorn src.main:app --reload --host 0.0.0.0 --port 8000
```

In a new terminal, check agent status:

```bash
curl http://localhost:8000/api/agent/status
```

**Expected Response**:
```json
{
  "status": "active",
  "agent_name": "TaskMasterAgent",
  "model": "gemini-2.0-flash-exp",
  "tools_available": 4
}
```

**Troubleshooting**:
- If status is "error": Check GOOGLE_API_KEY is set correctly
- If agent_name missing: Verify google-adk package installed
- If tools_available ≠ 4: Check src/agent.py tool registration

---

## Step 4: Test Agent Chat

### Create a Task via Natural Language

```bash
# Get JWT token first (replace with your credentials)
TOKEN=$(curl -X POST http://localhost:8000/api/auth/signin \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"test123"}' \
  | jq -r '.access_token')

# Chat with agent
curl -X POST http://localhost:8000/api/agent/chat \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "message": "Create a task to buy groceries tomorrow",
    "user_id": "your_user_id",
    "chat_history": []
  }'
```

**Expected Response**:
```json
{
  "response": "I've created a task titled 'buy groceries' with a deadline for tomorrow at 11:59 PM. The task has been added to your list successfully!",
  "success": true,
  "tool_calls": [
    {
      "name": "create_task",
      "args": {
        "user_id": "your_user_id",
        "title": "buy groceries",
        "deadline": "2026-01-25T23:59:59"
      }
    }
  ]
}
```

### Retrieve Tasks via Natural Language

```bash
curl -X POST http://localhost:8000/api/agent/chat \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "message": "Show me all my incomplete tasks",
    "user_id": "your_user_id",
    "chat_history": []
  }'
```

### Update Task Status

```bash
curl -X POST http://localhost:8000/api/agent/chat \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "message": "Mark the groceries task as complete",
    "user_id": "your_user_id",
    "chat_history": []
  }'
```

### Delete a Task

```bash
curl -X POST http://localhost:8000/api/agent/chat \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "message": "Delete the task about groceries",
    "user_id": "your_user_id",
    "chat_history": []
  }'
```

---

## Step 5: Test with Conversation History

Simulate a multi-turn conversation:

```bash
curl -X POST http://localhost:8000/api/agent/chat \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "message": "Did I create any tasks today?",
    "user_id": "your_user_id",
    "chat_history": [
      {
        "role": "user",
        "content": "Create a task to buy groceries"
      },
      {
        "role": "agent",
        "content": "Task created successfully!"
      },
      {
        "role": "user",
        "content": "Create another task to call dentist"
      },
      {
        "role": "agent",
        "content": "Task created successfully!"
      }
    ]
  }'
```

The agent uses conversation history to provide contextual responses.

---

## Step 6: Clear Conversation History

When starting a fresh conversation:

```bash
curl -X POST http://localhost:8000/api/agent/clear-history \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "user_id": "your_user_id"
  }'
```

**Response**:
```json
{
  "success": true,
  "message": "Conversation history cleared"
}
```

---

## Running Tests

### Install Test Dependencies

```bash
cd backend
pip install pytest pytest-asyncio httpx
```

### Run Agent Tests

```bash
# Run all agent tests
pytest tests/test_agent_*.py -v

# Run specific test file
pytest tests/test_agent_routes.py -v

# Run with coverage
pytest tests/test_agent_*.py --cov=src.agent --cov=src.routes.agent
```

**Expected Output**:
```
tests/test_agent_tools.py::test_create_task PASSED
tests/test_agent_tools.py::test_retrieve_tasks PASSED
tests/test_agent_routes.py::test_chat_endpoint PASSED
tests/test_agent_security.py::test_user_isolation PASSED
======================== 12 passed in 5.32s ========================
```

---

## Common Use Cases

### 1. Quick Task Creation
```
User: "Remind me to call John at 3pm"
Agent: Creates task with title "call John" and deadline parsed from "3pm"
```

### 2. Task Queries
```
User: "What do I need to do today?"
Agent: Retrieves incomplete tasks with today's deadline
```

### 3. Bulk Operations
```
User: "Show me all completed tasks from last week"
Agent: Filters tasks by completion status and date range
```

### 4. Task Updates
```
User: "Change the deadline for project report to next Friday"
Agent: Identifies "project report" task and updates deadline
```

### 5. Ambiguity Handling
```
User: "Delete the task"
Agent: "I found multiple tasks. Which one would you like to delete?"
```

---

## Performance Benchmarks

Expected response times (local development):

| Operation | Expected Time | Tool Calls |
|-----------|--------------|------------|
| Simple chat (no tools) | 1-3 seconds | 0 |
| Create task | 2-5 seconds | 1 |
| Retrieve tasks | 2-4 seconds | 1 |
| Update task | 3-6 seconds | 1-2 |
| Multi-turn reasoning | 5-10 seconds | 2-3 |

**Note**: Production times may vary based on network latency to Google API.

---

## Troubleshooting

### Issue: "Agent error: 403 Forbidden"
**Solution**: Check GOOGLE_API_KEY is valid and has Gemini API access enabled.

### Issue: "Access denied: user_id mismatch"
**Solution**: Ensure `user_id` in request body matches the JWT token's user ID.

### Issue: "Tool call failed: Task not found"
**Solution**: The user may not own the task. Check task ownership and user isolation.

### Issue: Agent response takes >15 seconds
**Solution**: 
- Check network connection to Google API
- Verify model is "gemini-2.0-flash-exp" (not thinking variant)
- Reduce conversation history size

### Issue: Conversation history not persisting
**Solution**: History is in-memory only. Cleared on server restart. This is expected behavior.

---

## Next Steps

1. **Frontend Integration**: Build a chat UI in Next.js frontend
2. **Advanced Features**: 
   - Multi-turn confirmations for destructive operations
   - Natural language date parsing improvements
   - Context summarization for long conversations
3. **Production Deployment**:
   - Set GOOGLE_API_KEY in production environment
   - Configure monitoring for agent endpoint
   - Set up rate limiting for API calls
4. **Testing**: Expand test coverage to 100% (see tasks.md)

---

## API Reference

Full API documentation:
- **Agent Chat**: See `contracts/agent-chat.yaml`
- **Agent Status**: See `contracts/agent-status.yaml`
- **Conversation History**: See `contracts/conversation-history.yaml`

---

## Support & Resources

- **Google ADK Documentation**: https://ai.google.dev/adk
- **Gemini API Docs**: https://ai.google.dev/docs
- **Project README**: `../../README.md`
- **Feature Spec**: `spec.md`
- **Data Model**: `data-model.md`

---

**Quickstart Complete!** You now have a working natural language task management agent. Start chatting with your tasks! 🎉
