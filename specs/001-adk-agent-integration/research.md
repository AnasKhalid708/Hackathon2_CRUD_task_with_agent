# Phase 0: Research & Decisions
## ADK Agent Task Management Integration

**Date**: 2026-01-24  
**Feature**: 001-adk-agent-integration  
**Status**: Complete

---

## Research Tasks Resolved

### 1. Google ADK SDK Installation & Compatibility

**Research Question**: How to install and configure google-genai and google-adk packages with Python 3.12.4?

**Decision**: Install via pip with minimum versions specified
- `google-genai>=0.3.0` - Core Gemini AI SDK
- `google-adk>=0.1.0` - Agent Development Kit framework

**Rationale**: 
- Both packages available on PyPI with Python 3.12 support
- Version 0.3.0+ of google-genai includes Gemini 2.0 Flash model support
- ADK 0.1.0+ provides LlmAgent with tool integration
- No conflicting dependencies with existing FastAPI/SQLModel stack

**Alternatives Considered**:
- Direct Google AI Studio API calls: Rejected - too low-level, requires custom tool orchestration
- LangChain with Gemini: Rejected - prohibited by constitution section 6
- Vertex AI SDK: Rejected - requires GCP project setup, overkill for simple agent

**Installation Command**:
```bash
pip install google-genai>=0.3.0 google-adk>=0.1.0
```

---

### 2. Agent Tool Integration Patterns

**Research Question**: How should CRUD tools be structured for ADK agent consumption?

**Decision**: Direct function definitions with type hints and docstrings

**Rationale**:
- ADK LlmAgent.tools accepts plain Python functions
- Function signatures automatically converted to tool schemas
- Type hints provide parameter validation
- Docstrings become tool descriptions for the model
- Existing implementation in agent.py already follows this pattern

**Pattern Example**:
```python
def create_task(user_id: str, title: str, description: str = "", deadline: Optional[str] = None) -> Dict[str, Any]:
    """
    Create a new task for the user.
    
    Args:
        user_id: The ID of the user creating the task
        title: The task title (required, max 200 characters)
        description: Optional task description
        deadline: Optional deadline in ISO format
    
    Returns:
        Dictionary with task details or error message
    """
    # Implementation...
```

**Alternatives Considered**:
- Pydantic models for tools: Rejected - ADK doesn't require it, adds boilerplate
- Class-based tools: Rejected - functions are simpler and sufficient
- Async tools: Rejected - database operations fast enough for sync

---

### 3. Conversation History Management

**Research Question**: How to maintain conversation context per user without database overhead?

**Decision**: In-memory dictionary with 20-message limit per user

**Rationale**:
- Fast access with O(1) lookup by user_id
- 20-message limit prevents memory bloat (approximately 10 exchanges)
- Stateless HTTP design maintained (history sent with each request)
- Acceptable to lose history on server restart (not critical data)
- Matches spec requirement FR-010

**Implementation**:
```python
user_conversations: Dict[str, List[Dict[str, str]]] = {}

# Store per user
user_conversations[user_id] = [
    {"role": "user", "content": "..."},
    {"role": "agent", "content": "..."}
]

# Trim to last 20
if len(user_conversations[user_id]) > 20:
    user_conversations[user_id] = user_conversations[user_id][-20:]
```

**Alternatives Considered**:
- Database storage: Rejected - adds latency, unnecessary persistence
- Redis cache: Rejected - additional infrastructure, overkill for in-memory data
- Session-based storage: Rejected - requires sticky sessions, complicates deployment

---

### 4. Authentication Integration

**Research Question**: How to ensure agent respects user isolation and JWT authentication?

**Decision**: Validate user_id against JWT token, pass user_id to all tools

**Rationale**:
- Reuse existing `get_current_user` JWT middleware
- Enforce user_id match between token and request body
- Agent tools receive authenticated user_id in context
- Prevents cross-user data access at agent layer
- Matches spec requirement FR-004

**Security Pattern**:
```python
@router.post("/chat")
async def chat_with_agent(
    request: AgentRequest,
    token_user_id: str = Depends(get_current_user)  # JWT validation
):
    # Validate ownership
    if request.user_id != token_user_id:
        raise HTTPException(status_code=403, detail="Access denied")
    
    # Pass validated user_id to agent context
    context = f"[SYSTEM] Current User ID: {request.user_id}"
```

**Alternatives Considered**:
- Agent-level authentication: Rejected - duplicates existing JWT system
- Database-level user filtering: Already implemented in tool functions
- Session-based auth: Rejected - REST API uses token-based auth

---

### 5. Error Handling Strategy

**Research Question**: How to handle Google API errors and tool failures gracefully?

**Decision**: Try-catch with logging and user-friendly error messages

**Rationale**:
- Catch exceptions at both tool level and endpoint level
- Log detailed errors for debugging (traceback included)
- Return user-friendly messages to client
- Maintain conversation history even on errors
- Matches spec requirement FR-008

**Implementation Pattern**:
```python
try:
    # Tool operation
    pass
except Exception as e:
    logger.error(f"Error: {str(e)}")
    logger.error(f"Traceback: {traceback.format_exc()}")
    return {"error": f"User-friendly message: {str(e)}"}
```

**Common Error Scenarios**:
- Invalid GOOGLE_API_KEY: Return configuration error in /status
- API rate limits: Return retry guidance in response
- Database connection failures: Return error, preserve conversation history
- Tool exceptions: Catch, log, return user-friendly message

**Alternatives Considered**:
- Silent failures: Rejected - user needs feedback
- Detailed error exposure: Rejected - security risk, confusing for users
- Retry logic: Deferred - initial implementation prioritizes clarity

---

### 6. Testing Strategy

**Research Question**: What testing coverage is needed to meet 100% pass rate (SC-009)?

**Decision**: Three-tier testing - unit, integration, security

**Test Layers**:

1. **Unit Tests** (`test_agent_tools.py`):
   - Each CRUD tool function independently
   - Mock database interactions
   - Verify correct parameter handling
   - Test error cases (invalid IDs, missing data)

2. **Integration Tests** (`test_agent_routes.py`):
   - Full agent endpoint workflows
   - Real database interactions (test DB)
   - Conversation history management
   - Tool call verification
   - Response format validation

3. **Security Tests** (`test_agent_security.py`):
   - User isolation verification
   - JWT token validation
   - Cross-user access prevention
   - SQL injection prevention (inherited from SQLModel)

**Tools**: pytest, pytest-asyncio, FastAPI TestClient

**Rationale**:
- Comprehensive coverage of all acceptance scenarios
- Matches existing Phase II testing patterns
- Enables TDD/BDD workflow
- Satisfies constitution quality requirements

**Alternatives Considered**:
- End-to-end tests only: Rejected - insufficient coverage, slow
- Manual testing only: Rejected - violates constitution, not reproducible
- Mocking Google API: Accepted for unit tests, real API for integration

---

### 7. Performance Optimization

**Research Question**: How to achieve <10s response time with potential multi-turn agent reasoning?

**Decision**: Configure temperature=0.3, limit context window, use fast model

**Optimizations**:
- **Model**: gemini-2.0-flash-exp (fast variant)
- **Temperature**: 0.3 (balanced, reduces unnecessary creativity)
- **Context**: Last 10 messages only sent to agent
- **History**: Trim to 20 messages per user
- **Top-p/Top-k**: Standard values (0.9, 40)

**Expected Performance**:
- Single tool call: 2-5 seconds
- Multi-turn reasoning: 5-10 seconds
- No tool call (chat only): 1-3 seconds

**Rationale**:
- Flash model optimized for speed over reasoning depth
- Task management is straightforward, doesn't need deep reasoning
- Lower temperature reduces token generation time
- Context trimming reduces API payload size

**Alternatives Considered**:
- gemini-2.0-flash-thinking: Rejected - slower, unnecessary for CRUD
- Local model: Rejected - infrastructure complexity, not in spec
- Async processing: Deferred - initial implementation prioritizes simplicity

---

## Technology Stack Summary

### Confirmed Dependencies
| Package | Version | Purpose |
|---------|---------|---------|
| google-genai | >=0.3.0 | Gemini AI SDK, model interaction |
| google-adk | >=0.1.0 | Agent framework, tool orchestration |
| fastapi | >=0.109.0 | Web framework (existing) |
| sqlmodel | >=0.0.14 | ORM (existing) |
| pyjwt | >=2.8.0 | Authentication (existing) |
| pytest | latest | Testing framework |

### Integration Points
- **Authentication**: JWT via `get_current_user` middleware (Phase II)
- **Database**: SQLModel engine from `src.database` (Phase II)
- **Models**: Task model from `src.models.task` (Phase II)
- **Configuration**: Settings from `src.config` with GOOGLE_API_KEY

### Environment Requirements
- Python 3.12.4 (EXACT)
- GOOGLE_API_KEY environment variable
- Existing PostgreSQL database (Neon)
- All Phase II dependencies installed

---

## Integration Risks & Mitigations

### Risk 1: Google API Key Missing
**Impact**: Agent initialization fails  
**Mitigation**: Status endpoint reports configuration error, clear setup documentation

### Risk 2: Rate Limiting
**Impact**: Degraded user experience during high load  
**Mitigation**: Error messages include retry guidance, future: implement caching/throttling

### Risk 3: Conversation History Memory Bloat
**Impact**: Server memory exhaustion  
**Mitigation**: Hard limit of 20 messages per user, old conversations garbage collected

### Risk 4: Cross-User Data Leakage
**Impact**: Security violation, failed acceptance criteria  
**Mitigation**: Dual validation (JWT + request body), comprehensive security tests

### Risk 5: Agent Misinterprets Commands
**Impact**: Wrong operations executed  
**Mitigation**: Confirmation messages for destructive operations, conversation history for context

---

## Next Steps (Phase 1)

1. Generate data-model.md defining conversation and message structures
2. Create OpenAPI contracts for agent endpoints
3. Write quickstart.md with setup and testing instructions
4. Update agent context using .specify scripts
5. Re-evaluate constitution check post-design

---

**Research Phase Complete**: All NEEDS CLARIFICATION items resolved. Ready for Phase 1 design.
