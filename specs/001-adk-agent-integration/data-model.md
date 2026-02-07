# Phase 1: Data Model
## ADK Agent Task Management Integration

**Date**: 2026-01-24  
**Feature**: 001-adk-agent-integration  
**Status**: Complete

---

## Entity Overview

This feature introduces conversational interaction entities that wrap existing Phase II Task entities. The agent does NOT create new database tables - it operates on existing Task model using conversational interface.

---

## Primary Entities

### 1. ChatMessage
**Purpose**: Individual message in conversation  
**Lifecycle**: Transient (in-memory only, 20-message limit per user)  
**Validation**: Role must be "user" or "agent"

**Fields**:
| Field | Type | Required | Constraints | Description |
|-------|------|----------|-------------|-------------|
| role | str | Yes | Enum: "user", "agent", "system" | Message sender |
| content | str | Yes | Max 5000 chars | Message text |

**Python Model**:
```python
class ChatMessage(BaseModel):
    """Chat message model."""
    role: str  # "user", "agent", or "system"
    content: str
```

**JSON Example**:
```json
{
  "role": "user",
  "content": "Create a task to buy groceries tomorrow"
}
```

---

### 2. AgentRequest
**Purpose**: Request payload for agent chat endpoint  
**Lifecycle**: Per-request (HTTP body)  
**Validation**: user_id must match JWT token

**Fields**:
| Field | Type | Required | Constraints | Description |
|-------|------|----------|-------------|-------------|
| message | str | Yes | 1-2000 chars | User's input message |
| user_id | str | Yes | Must match JWT token | Authenticated user ID |
| chat_history | List[ChatMessage] | No | Max 20 messages | Optional conversation context |

**Python Model**:
```python
class AgentRequest(BaseModel):
    """Request model for agent interaction."""
    message: str
    user_id: str
    chat_history: Optional[List[ChatMessage]] = []
```

**JSON Example**:
```json
{
  "message": "Show me my incomplete tasks",
  "user_id": "user_123",
  "chat_history": [
    {
      "role": "user",
      "content": "Create task to buy groceries"
    },
    {
      "role": "agent",
      "content": "Task 'buy groceries' created successfully!"
    }
  ]
}
```

---

### 3. AgentResponse
**Purpose**: Response from agent chat endpoint  
**Lifecycle**: Per-request (HTTP response)  
**Validation**: success must be boolean

**Fields**:
| Field | Type | Required | Constraints | Description |
|-------|------|----------|-------------|-------------|
| response | str | Yes | - | Agent's text response |
| success | bool | Yes | - | Operation success status |
| tool_calls | List[Dict] | No | - | Tools invoked during processing |

**Python Model**:
```python
class AgentResponse(BaseModel):
    """Response model for agent interaction."""
    response: str
    success: bool
    tool_calls: Optional[List[Dict[str, Any]]] = []
```

**JSON Example - Success**:
```json
{
  "response": "I've created a task titled 'buy groceries' with a deadline for tomorrow. The task has been added to your list successfully!",
  "success": true,
  "tool_calls": [
    {
      "name": "create_task",
      "args": {
        "user_id": "user_123",
        "title": "buy groceries",
        "description": "",
        "deadline": "2026-01-25T23:59:59"
      }
    }
  ]
}
```

**JSON Example - Error**:
```json
{
  "response": "I couldn't complete that operation due to an error. Please try again.",
  "success": false,
  "tool_calls": []
}
```

---

### 4. ToolCallRecord (Internal)
**Purpose**: Track agent tool invocations for debugging  
**Lifecycle**: Per-request (logged, not persisted)  
**Validation**: name must match available tool functions

**Fields**:
| Field | Type | Description |
|-------|------|-------------|
| name | str | Tool function name |
| args | Dict | Arguments passed to tool |

**Example**:
```python
{
    "name": "update_task",
    "args": {
        "user_id": "user_123",
        "task_id": "task_456",
        "completed": True
    }
}
```

---

### 5. ConversationHistory (Internal)
**Purpose**: Store conversation state per user  
**Lifecycle**: Server lifetime (in-memory)  
**Storage**: Python dictionary, not database

**Structure**:
```python
user_conversations: Dict[str, List[Dict[str, str]]] = {}

# Example content
{
    "user_123": [
        {"role": "user", "content": "Create task"},
        {"role": "agent", "content": "Task created!"},
        {"role": "user", "content": "Show my tasks"},
        {"role": "agent", "content": "You have 3 tasks: ..."}
    ]
}
```

**Constraints**:
- Maximum 20 messages per user
- Automatic trimming when exceeded
- Lost on server restart (acceptable)

---

## Reused Entities from Phase II

### Task (Database Model)
**Purpose**: Core task entity managed by agent tools  
**Source**: `src.models.task.Task`  
**Usage**: Agent CRUD tools operate on this existing model

**Key Fields Used by Agent**:
| Field | Type | Description |
|-------|------|-------------|
| id | UUID | Task identifier |
| user_id | str | Owner (enforced by agent) |
| title | str | Task title (max 200 chars) |
| description | str | Task description (max 1000 chars) |
| completed | bool | Completion status |
| deadline | datetime | Optional deadline |
| created_at | datetime | Creation timestamp |
| updated_at | datetime | Last update timestamp |

**Agent Tool Mapping**:
- `create_task()` → creates Task instance
- `retrieve_tasks()` → queries Task table
- `update_task()` → modifies Task instance
- `delete_task()` → removes Task instance

---

## Relationships

```
User (Phase II)
  │
  ├─[owns]─> Task (Phase II) ────[managed by]───> Agent Tools
  │                                                      │
  └─[has]──> ConversationHistory (in-memory) <──[uses]──┘
                    │
                    └─[contains]─> ChatMessage[]
```

**Key Relationships**:
1. User → Task: One-to-many (existing Phase II relationship)
2. User → ConversationHistory: One-to-one (per session, in-memory)
3. ConversationHistory → ChatMessage: One-to-many (max 20)
4. Agent Tools → Task: Read/Write through SQLModel ORM

---

## State Transitions

### Task State (via Agent)
```
[No Task] 
   │
   │ create_task()
   ↓
[Task: completed=False]
   │
   │ update_task(completed=True)
   ↓
[Task: completed=True]
   │
   │ delete_task()
   ↓
[No Task]
```

### Conversation State
```
[Empty History]
   │
   │ User sends message
   ↓
[History: 1 message]
   │
   │ Agent responds
   ↓
[History: 2 messages]
   │
   │ ... (conversation continues)
   ↓
[History: 20 messages]
   │
   │ Next message (auto-trim)
   ↓
[History: 20 messages] (oldest removed)
```

---

## Validation Rules

### Message Validation
1. **Role constraint**: Must be "user", "agent", or "system"
2. **Content length**: 1-5000 characters
3. **History size**: Maximum 20 messages per user
4. **User ID**: Must match JWT token in request

### Tool Parameter Validation
1. **create_task**:
   - `title`: Required, 1-200 chars
   - `description`: Optional, 0-1000 chars
   - `deadline`: Optional, ISO 8601 format
   - `user_id`: Required, must match authenticated user

2. **retrieve_tasks**:
   - `user_id`: Required, must match authenticated user
   - `task_id`: Optional UUID
   - `filter_type`: Optional enum ("all", "complete", "incomplete", "overdue")

3. **update_task**:
   - `task_id`: Required UUID
   - `user_id`: Required, must match authenticated user
   - At least one field to update required
   - Task must exist and belong to user

4. **delete_task**:
   - `task_id`: Required UUID
   - `user_id`: Required, must match authenticated user
   - Task must exist and belong to user

---

## Security Constraints

### User Isolation
- **Enforcement Point**: All tool functions check `task.user_id == user_id`
- **Validation**: JWT token user_id must match request user_id
- **Database**: SQLModel queries filter by user_id

### Cross-User Access Prevention
```python
# Example from retrieve_tasks
task = db.get(Task, task_id)
if not task or task.user_id != user_id:
    return {"error": "Task not found"}  # Hides existence from other users
```

### Input Sanitization
- SQLModel ORM prevents SQL injection (parameterized queries)
- Pydantic models validate types and lengths
- ISO 8601 parsing validates datetime formats

---

## Data Flow Diagrams

### Create Task Flow
```
Client
  │
  │ POST /api/agent/chat
  │ {message: "Create task X", user_id: "123"}
  ↓
JWT Middleware
  │ Validates token → user_id: "123"
  ↓
Agent Route Handler
  │ Validates request.user_id == token.user_id
  │ Builds context with user_id
  ↓
ADK Agent (task_agent)
  │ Parses intent → "create task"
  │ Calls create_task(user_id="123", title="X")
  ↓
create_task() Tool
  │ Creates Task(user_id="123", title="X")
  │ Saves to database
  │ Returns success + task data
  ↓
Agent Route Handler
  │ Stores exchange in user_conversations["123"]
  │ Returns AgentResponse
  ↓
Client
  │ Receives confirmation
```

### Retrieve Tasks Flow
```
Client → Agent Route → ADK Agent → retrieve_tasks()
                                       │
                                       ↓
                                   SQLModel Query
                                   WHERE user_id = "123"
                                       │
                                       ↓
                                   Task[] ← Database
                                       │
                                       ↓
                              Agent Response (formatted)
```

---

## Performance Considerations

### In-Memory Conversation Storage
- **Memory per user**: ~5KB for 20 messages (approximate)
- **100 concurrent users**: ~500KB total memory
- **Garbage collection**: Manual clearing via /clear-history or server restart
- **Scalability**: For >1000 users, consider Redis

### Database Query Optimization
- Existing Task table indexes on user_id (from Phase II)
- Order by created_at desc for recent tasks first
- Filter conditions use indexed columns

---

## Future Enhancements (Post-MVP)

1. **Persistent Conversation History**: Store in database for session recovery
2. **Conversation Analytics**: Track tool usage, response times
3. **Multi-Turn Confirmation**: Ask user confirmation before delete operations
4. **Context Summarization**: Compress old messages to extend history
5. **Streaming Responses**: Server-sent events for real-time agent output

---

**Data Model Phase Complete**: All entities defined, relationships mapped, validation rules established. Ready for contract generation (Phase 1).
