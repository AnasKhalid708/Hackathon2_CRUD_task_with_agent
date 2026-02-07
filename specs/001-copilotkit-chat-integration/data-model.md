# Phase 1: Data Model
## Feature: CopilotKit Chat Integration

**Date**: 2026-01-24  
**Status**: Complete  
**Branch**: 001-copilotkit-chat-integration

---

## Overview

This document defines the data structures and entities for CopilotKit chat integration. Since the feature integrates with an existing backend agent, most entities are interface definitions rather than database models.

---

## Entity Definitions

### 1. ChatMessage

**Description**: Represents a single message in the conversation between user and agent.

**Type**: Client-side interface (no database persistence)

**Fields**:

| Field | Type | Required | Constraints | Description |
|-------|------|----------|-------------|-------------|
| id | string (UUID) | Yes | Unique | Auto-generated message identifier |
| role | 'user' \| 'agent' | Yes | Enum | Sender of the message |
| content | string | Yes | 1-10000 chars | Message text content |
| timestamp | Date | Yes | ISO 8601 | When message was created |
| status | 'sending' \| 'sent' \| 'error' | Yes | Enum | Delivery status |
| toolCalls | ToolCall[] | No | Optional | Agent tool invocations (if any) |
| metadata | Record<string, any> | No | Optional | Additional message context |

**Relationships**:
- Belongs to a Conversation (transient, session-scoped)
- May contain multiple ToolCall references

**Validation Rules**:
- `content` must not be empty or whitespace-only (FR-012)
- `content` length must be ≤ 10,000 characters
- `timestamp` must be valid ISO 8601 date
- `role` must be exactly 'user' or 'agent'

**State Transitions**:
```
User Message: sending → sent (on successful API call)
User Message: sending → error (on API failure)
Agent Message: received → sent (always, as agent messages are already processed)
```

**TypeScript Interface**:
```typescript
interface ChatMessage {
  id: string;
  role: 'user' | 'agent';
  content: string;
  timestamp: Date;
  status: 'sending' | 'sent' | 'error';
  toolCalls?: ToolCall[];
  metadata?: Record<string, any>;
}
```

---

### 2. ToolCall

**Description**: Represents an agent tool invocation (e.g., creating a task, fetching data).

**Type**: Client-side interface (extracted from agent response)

**Fields**:

| Field | Type | Required | Constraints | Description |
|-------|------|----------|-------------|-------------|
| name | string | Yes | Non-empty | Tool function name |
| args | Record<string, any> | Yes | Valid JSON | Tool arguments |
| result | any | No | Optional | Tool execution result (if completed) |
| status | 'pending' \| 'completed' \| 'error' | No | Enum | Execution status |

**Relationships**:
- Belongs to a ChatMessage (agent messages only)

**Validation Rules**:
- `name` must match available tool names from agent
- `args` must be valid JSON object
- Agent-side validation handles tool-specific argument constraints

**TypeScript Interface**:
```typescript
interface ToolCall {
  name: string;
  args: Record<string, any>;
  result?: any;
  status?: 'pending' | 'completed' | 'error';
}
```

---

### 3. UserContext

**Description**: Represents authenticated user's identity and session information for agent requests.

**Type**: Client-side interface (derived from AuthContext)

**Fields**:

| Field | Type | Required | Constraints | Description |
|-------|------|----------|-------------|-------------|
| userId | string | Yes | Non-empty | Authenticated user's ID |
| email | string | Yes | Valid email | User's email address |
| token | string | Yes | JWT format | Authentication token |
| sessionId | string | No | UUID | Current session identifier |

**Relationships**:
- Maps to existing User entity from backend (via userId)
- Associated with Conversation (one-to-one per session)

**Validation Rules**:
- `userId` must match authenticated user from AuthContext (FR-003)
- `token` must be valid JWT (validated on backend)
- Backend validates userId matches token claims (FR-002, agent.py line 50-54)

**TypeScript Interface**:
```typescript
interface UserContext {
  userId: string;
  email: string;
  token: string;
  sessionId?: string;
}
```

---

### 4. Conversation

**Description**: Represents a chat session between user and agent, containing message history.

**Type**: Client-side transient entity (persisted in sessionStorage)

**Fields**:

| Field | Type | Required | Constraints | Description |
|-------|------|----------|-------------|-------------|
| id | string (UUID) | Yes | Unique | Auto-generated conversation identifier |
| userId | string | Yes | Non-empty | Owner of the conversation |
| messages | ChatMessage[] | Yes | Array | Ordered list of messages |
| createdAt | Date | Yes | ISO 8601 | When conversation started |
| lastMessageAt | Date | Yes | ISO 8601 | Last message timestamp |
| metadata | Record<string, any> | No | Optional | Conversation context |

**Relationships**:
- Belongs to a User (via userId)
- Contains multiple ChatMessage entities

**Validation Rules**:
- `userId` must match authenticated user
- `messages` array maintains chronological order (by timestamp)
- Maximum 50 messages retained (older messages pruned)
- `lastMessageAt` must be ≥ `createdAt`

**Storage Strategy**:
- Persisted to sessionStorage keyed by: `copilotkit_chat_history_{userId}`
- Automatically loaded on component mount
- Saved after each message send/receive (debounced to 1s)
- Cleared on logout or session expiry

**TypeScript Interface**:
```typescript
interface Conversation {
  id: string;
  userId: string;
  messages: ChatMessage[];
  createdAt: Date;
  lastMessageAt: Date;
  metadata?: Record<string, any>;
}
```

---

### 5. AgentRequest (Backend)

**Description**: Request payload sent to backend /api/agent/chat endpoint.

**Type**: Backend Pydantic model (existing, defined in agent.py)

**Fields**:

| Field | Type | Required | Constraints | Description |
|-------|------|----------|-------------|-------------|
| message | string | Yes | Non-empty | User's message text |
| user_id | string | Yes | Non-empty | Authenticated user's ID |
| chat_history | ChatMessage[] | No | Optional | Previous conversation context |

**Validation Rules**:
- Defined in `backend/src/routes/agent.py` lines 19-23
- Backend validates `user_id` matches JWT token (line 50)
- `message` cannot be empty

**Python Model**:
```python
class AgentRequest(BaseModel):
    message: str
    user_id: str
    chat_history: Optional[List[ChatMessage]] = []
```

---

### 6. AgentResponse (Backend)

**Description**: Response from backend /api/agent/chat endpoint.

**Type**: Backend Pydantic model (existing, defined in agent.py)

**Fields**:

| Field | Type | Required | Constraints | Description |
|-------|------|----------|-------------|-------------|
| response | string | Yes | Non-empty | Agent's response text |
| success | bool | Yes | Boolean | Whether request succeeded |
| tool_calls | ToolCall[] | No | Optional | Tools invoked by agent |

**Validation Rules**:
- Defined in `backend/src/routes/agent.py` lines 26-30
- `success` must be explicitly set
- `tool_calls` extracted from Gemini response candidates

**Python Model**:
```python
class AgentResponse(BaseModel):
    response: str
    success: bool
    tool_calls: Optional[List[Dict[str, Any]]] = []
```

---

### 7. CopilotKitConfig

**Description**: Configuration object for CopilotKit runtime and adapter.

**Type**: Client-side configuration interface

**Fields**:

| Field | Type | Required | Constraints | Description |
|-------|------|----------|-------------|-------------|
| apiEndpoint | string | Yes | Valid URL | Backend adapter endpoint |
| headers | Record<string, string> | No | Optional | Custom HTTP headers |
| autoInjectUserId | boolean | Yes | Default: true | Auto-inject user_id from AuthContext |
| persistToSessionStorage | boolean | Yes | Default: true | Enable conversation persistence |
| maxHistoryLength | number | Yes | Default: 50 | Max messages to retain |
| theme | ThemeConfig | No | Optional | UI theme overrides |

**TypeScript Interface**:
```typescript
interface CopilotKitConfig {
  apiEndpoint: string;
  headers?: Record<string, string>;
  autoInjectUserId: boolean;
  persistToSessionStorage: boolean;
  maxHistoryLength: number;
  theme?: ThemeConfig;
}

interface ThemeConfig {
  backgroundColor: string;
  messageBackgroundColor: string;
  borderColor: string;
  textColor: string;
}
```

---

## Entity Relationships Diagram

```
┌─────────────┐
│    User     │ (Existing backend entity)
│  (Backend)  │
└──────┬──────┘
       │ 1
       │ has
       │
       │ 1
┌──────▼──────────┐
│  UserContext    │ (Derived from AuthContext)
│  (Frontend)     │
└──────┬──────────┘
       │ 1
       │ has
       │
       │ 1
┌──────▼──────────┐
│  Conversation   │ (SessionStorage)
│  (Frontend)     │
└──────┬──────────┘
       │ 1
       │ contains
       │
       │ N
┌──────▼──────────┐
│  ChatMessage    │ (Transient)
│  (Frontend)     │
└──────┬──────────┘
       │ 1
       │ may have
       │
       │ N
┌──────▼──────────┐
│    ToolCall     │ (Transient)
│  (Frontend)     │
└─────────────────┘

Backend API Flow:
┌──────────────┐      ┌──────────────┐      ┌──────────────┐
│ AgentRequest │ ───> │ ADK Agent    │ ───> │AgentResponse │
│  (Frontend)  │ POST │  (Backend)   │      │  (Backend)   │
└──────────────┘      └──────────────┘      └──────────────┘
```

---

## Data Flow Sequences

### Sequence 1: User Sends Message

```
1. User types message in ChatInterface
2. Frontend validates message (non-empty, length ≤ 10k)
3. Create ChatMessage with role='user', status='sending'
4. Add message to Conversation.messages[]
5. Update UI to show message + loading indicator
6. Extract UserContext (userId, token) from AuthContext
7. Build AgentRequest { message, user_id, chat_history }
8. POST to /api/agent/chat with JWT header
9. Backend validates user_id matches token
10. Backend forwards to ADK agent
11. Receive AgentResponse
12. Update user message status='sent'
13. Create ChatMessage with role='agent', status='sent'
14. Extract tool_calls from response
15. Add agent message to Conversation.messages[]
16. Save Conversation to sessionStorage (debounced)
17. Update UI to show agent response
```

### Sequence 2: Load Conversation on Page Refresh

```
1. User refreshes tasks page (or reopens chat modal)
2. ChatInterface component mounts
3. Extract userId from AuthContext
4. Check sessionStorage for key: copilotkit_chat_history_{userId}
5. If found:
   a. Parse JSON to Conversation object
   b. Validate message structure
   c. Restore messages[] to UI state
6. If not found or parse error:
   a. Initialize empty Conversation
   b. Log warning (not error - expected for new sessions)
7. Render chat interface with loaded/empty history
```

### Sequence 3: User Context Injection

```
1. User authenticated, AuthContext provides { id, email }
2. JWT token stored in localStorage
3. CopilotProvider initializes
4. useChatWithAuth hook reads AuthContext
5. useEffect hook watches user.id changes
6. On user.id available:
   a. Create UserContext object
   b. Inject into CopilotKit metadata
7. On every message send:
   a. Adapter retrieves UserContext from metadata
   b. Adds user_id to AgentRequest
   c. Adds JWT token to request headers
8. Backend validates user_id matches token claims
```

---

## Storage Specifications

### SessionStorage Schema

**Key**: `copilotkit_chat_history_{userId}`

**Value**: JSON string of Conversation object

**Example**:
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "userId": "user_abc123",
  "messages": [
    {
      "id": "msg_001",
      "role": "user",
      "content": "Show me my tasks",
      "timestamp": "2026-01-24T15:00:00.000Z",
      "status": "sent"
    },
    {
      "id": "msg_002",
      "role": "agent",
      "content": "You have 3 tasks...",
      "timestamp": "2026-01-24T15:00:02.000Z",
      "status": "sent",
      "toolCalls": [
        {
          "name": "get_tasks",
          "args": { "user_id": "user_abc123" },
          "status": "completed"
        }
      ]
    }
  ],
  "createdAt": "2026-01-24T15:00:00.000Z",
  "lastMessageAt": "2026-01-24T15:00:02.000Z"
}
```

**Size Management**:
- Target: <1MB per conversation (well within 5-10MB sessionStorage limit)
- Prune strategy: Keep last 50 messages, remove oldest when limit exceeded
- Compression: Not required (JSON is sufficient for 50 messages)

---

## Validation Summary

| Entity | Frontend Validation | Backend Validation |
|--------|--------------------|--------------------|
| ChatMessage | Non-empty content, length ≤ 10k, valid role | N/A (transient) |
| UserContext | userId exists in AuthContext | JWT token validation, user_id match |
| Conversation | Valid JSON structure, userId matches auth | N/A (client-side only) |
| AgentRequest | N/A (built internally) | user_id matches token, message non-empty |
| AgentResponse | Valid structure, success field present | Pydantic model validation |

---

## Migration Notes

**No database migrations required** - this feature is entirely additive and uses client-side storage only.

**Existing backend compatibility**:
- `/api/agent/chat` endpoint unchanged
- AgentRequest/AgentResponse models unchanged
- User authentication flow unchanged

**Backward compatibility**:
- Users without sessionStorage support see empty chat on page refresh (acceptable degradation)
- Existing task management features unaffected
- Chat integration is opt-in (via floating button)

---

**Phase 1 (Data Model) Complete**: All entities defined. Ready to generate API contracts.
