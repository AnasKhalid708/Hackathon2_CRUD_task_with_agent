# ADK Task Agent Documentation

## Overview
The ADK Task Agent is an AI-powered conversational agent that helps users manage their tasks through natural language interactions. Built using Google's ADK (Agent Development Kit), it can perform CRUD operations on tasks.

## Features

### Conversational Task Management
- **Create Tasks**: "Create a task to buy groceries"
- **View Tasks**: "Show me all my tasks" or "What are my incomplete tasks?"
- **Update Tasks**: "Mark task ABC123 as completed" or "Update the deadline for my grocery task"
- **Delete Tasks**: "Delete the task with ID ABC123"

### Intelligent Understanding
- Natural language processing
- Context-aware responses
- Friendly and helpful tone
- Confirms actions before execution

## API Endpoints

### 1. Chat with Agent
**POST** `/api/agent/chat`

**Headers:**
```
Authorization: Bearer <your_jwt_token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "message": "Show me all my incomplete tasks",
  "user_id": "your-user-id",
  "chat_history": []
}
```

**Response:**
```json
{
  "response": "Here are your incomplete tasks: ...",
  "success": true,
  "tool_calls": [
    {
      "name": "retrieve_tasks",
      "args": {
        "user_id": "your-user-id",
        "filter_type": "incomplete"
      }
    }
  ]
}
```

### 2. Agent Status
**GET** `/api/agent/status`

**Response:**
```json
{
  "status": "active",
  "agent_name": "TaskMasterAgent",
  "model": "gemini-2.0-flash-exp",
  "tools_available": 4
}
```

## Agent Tools

### 1. create_task
Creates a new task for the user.

**Parameters:**
- `user_id` (str): User ID
- `title` (str): Task title (max 200 chars)
- `description` (str, optional): Task description (max 1000 chars)
- `deadline` (str, optional): ISO format datetime

**Example:**
```python
create_task(
    user_id="user123",
    title="Buy groceries",
    description="Milk, eggs, bread",
    deadline="2026-01-25T18:00:00"
)
```

### 2. retrieve_tasks
Retrieves tasks for the user.

**Parameters:**
- `user_id` (str): User ID
- `task_id` (str, optional): Specific task ID
- `filter_type` (str): "all", "complete", "incomplete", "overdue"

**Example:**
```python
retrieve_tasks(
    user_id="user123",
    filter_type="incomplete"
)
```

### 3. update_task
Updates an existing task.

**Parameters:**
- `user_id` (str): User ID
- `task_id` (str): Task ID to update
- `title` (str, optional): New title
- `description` (str, optional): New description
- `completed` (bool, optional): Completion status
- `deadline` (str, optional): New deadline (ISO format)

**Example:**
```python
update_task(
    user_id="user123",
    task_id="task456",
    completed=True
)
```

### 4. delete_task
Deletes a task.

**Parameters:**
- `user_id` (str): User ID
- `task_id` (str): Task ID to delete

**Example:**
```python
delete_task(
    user_id="user123",
    task_id="task456"
)
```

## Example Conversations

### Creating a Task
**User:** "Create a task to finish the project report by tomorrow 5 PM"

**Agent:** "I'll create that task for you!"
- Creates task with title "Finish the project report"
- Sets deadline to tomorrow at 5 PM
- Returns confirmation with task details

### Viewing Tasks
**User:** "What tasks do I have?"

**Agent:** "Let me get your tasks..."
- Retrieves all tasks
- Presents them in a clear, organized format

### Updating a Task
**User:** "Mark my grocery task as completed"

**Agent:** "I'll mark that task as completed..."
- Finds the grocery task
- Updates completion status
- Confirms the update

### Deleting a Task
**User:** "Delete the task about groceries"

**Agent:** "Are you sure you want to delete the grocery task?"
- Confirms with user
- Deletes the task
- Provides confirmation

## Configuration

### Environment Variables
Make sure to set in your `.env`:
```env
GOOGLE_API_KEY=your_google_api_key
```

### Agent Settings
Located in `backend/src/agent.py`:
- **Model**: `gemini-2.0-flash-exp`
- **Temperature**: 0.3 (balanced creativity)
- **Top P**: 0.9
- **Top K**: 40

## Installation

1. Install dependencies:
```bash
cd backend
pip install -r requirements.txt
```

2. Set up environment variables in `.env`

3. Run the server:
```bash
uvicorn src.main:app --reload
```

4. Test the agent:
```bash
curl -X POST http://localhost:8000/api/agent/chat \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"message": "Show me my tasks", "user_id": "YOUR_USER_ID"}'
```

## Security

- All endpoints require JWT authentication
- User ID validation ensures users can only access their own tasks
- SQL injection protection via SQLModel ORM
- Input validation and sanitization

## Error Handling

The agent handles various error scenarios:
- Invalid user ID
- Task not found
- Invalid date formats
- Database connection issues
- Tool execution errors

All errors return descriptive messages to help users understand what went wrong.

## Future Enhancements

Potential improvements:
- Multi-turn conversation memory
- Task priority suggestions
- Smart deadline recommendations
- Task categorization
- Natural language date parsing (e.g., "tomorrow", "next week")
- Task dependencies and sub-tasks
- Recurring task suggestions
