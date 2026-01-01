# Research Document: Todo Full-Stack Web Application (Phase II)

**Date**: 2026-01-01  
**Phase**: II - Research & Technical Discovery  
**Feature**: Phase II Full-Stack Web Application with JWT Authentication
**Previous**: Phase I (In-Memory Console) - Reference Only

---

## Purpose

This document consolidates Phase II research findings for the full-stack web application transition. It resolves all technical uncertainties for:
- Better Auth + JWT authentication integration
- Neon PostgreSQL + SQLModel ORM setup
- Next.js 14 App Router patterns
- Multi-user isolation strategies
- Monorepo development workflow

Phase I research (Python console app) remains below for reference but is superseded by Phase II decisions.

---

## Phase II Research Tasks

### R1: Better Auth + JWT Integration with FastAPI

**Decision**: Implement custom JWT authentication using PyJWT library with Better Auth patterns.

**Rationale**:
- Full control over token generation and validation
- Lightweight solution without external service dependencies
- Educational value for understanding authentication flows
- FastAPI dependency injection enables clean middleware pattern
- JWT_AUTH environment variable provides secure secret management

**Implementation Pattern**:

```python
# Backend: JWT Generation
def create_access_token(user_id: str, expires_delta: timedelta = None):
    payload = {
        "user_id": user_id,
        "exp": datetime.utcnow() + (expires_delta or timedelta(hours=24))
    }
    return jwt.encode(payload, settings.JWT_AUTH, algorithm="HS256")

# Backend: JWT Validation Middleware
async def get_current_user(authorization: str = Header(None)):
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Missing authorization")
    token = authorization.split(" ")[1]
    payload = jwt.decode(token, settings.JWT_AUTH, algorithms=["HS256"])
    return payload.get("user_id")
```

**Frontend Token Storage**:
- **Selected**: localStorage (simple, explicit token management)
- **Alternative**: httpOnly cookies (more secure, deferred to Phase V)
- **Reasoning**: localStorage sufficient for Phase II development/hackathon scope

**Dependencies**:
- Backend: `PyJWT==2.8.0`, `bcrypt==4.1.2`
- Frontend: None (native fetch with Authorization header)

**Alternatives Considered**:
- Firebase Auth: Cloud-dependent, external service complexity
- Auth0: Third-party service, overkill for hackathon
- OAuth2 Password Flow: More complex, requires additional scopes
- **Selected Custom JWT**: Full control, lightweight, phase-appropriate

---

### R2: Neon PostgreSQL + SQLModel ORM Setup

**Decision**: Use Neon Serverless PostgreSQL with SQLModel ORM for type-safe database operations.

**Rationale**:
- Neon provides free tier serverless PostgreSQL (ideal for hackathon)
- SQLModel combines SQLAlchemy power with Pydantic validation
- Native FastAPI integration through shared Pydantic base
- Type-safe models reduce runtime errors
- Alembic migrations provide schema version control

**Connection Configuration**:

```python
# Neon connection string format
DATABASE_URL=postgresql://user:password@ep-xxx.region.aws.neon.tech/dbname?sslmode=require

# Engine setup
from sqlmodel import create_engine, Session

engine = create_engine(
    settings.DATABASE_URL,
    echo=True,  # SQL logging in development
    pool_pre_ping=True,  # Verify connections before use
    pool_size=5,
    max_overflow=10
)

def get_db():
    with Session(engine) as session:
        yield session
```

**SQLModel Pattern**:

```python
from sqlmodel import SQLModel, Field
import uuid

class User(SQLModel, table=True):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()), primary_key=True)
    email: str = Field(unique=True, index=True, max_length=255)
    hashed_password: str
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

class Task(SQLModel, table=True):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()), primary_key=True)
    user_id: str = Field(foreign_key="users.id", index=True)
    title: str = Field(max_length=200)
    description: Optional[str] = Field(default="", max_length=2000)
    completed: bool = Field(default=False)
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
```

**Migration Workflow**:

```bash
# Initialize Alembic
alembic init alembic

# Generate migration
alembic revision --autogenerate -m "Create users and tasks tables"

# Apply migrations
alembic upgrade head
```

**Dependencies**:
- `sqlmodel==0.0.14`
- `alembic==1.13.1`
- `psycopg2-binary==2.9.9`

**Alternatives Considered**:
- SQLAlchemy Core: More verbose, less type-safe
- Django ORM: Requires full Django framework (overkill)
- Raw SQL: No type safety, manual migrations
- **Selected SQLModel**: Type-safe, FastAPI-native, Pydantic integration

---

### R3: Next.js 14 App Router + Better Auth Client

**Decision**: Use Next.js 14 App Router with custom auth context for client-side authentication state.

**Rationale**:
- Next.js 14 App Router provides modern React patterns with server components
- Client components for interactive auth forms maintain clear separation
- Auth context provider centralizes authentication logic
- API client pattern enables automatic JWT injection
- Protected route wrapper enforces authentication requirements

**Auth Context Pattern**:

```typescript
// src/lib/auth.ts
'use client';

interface AuthContext {
  user: User | null;
  token: string | null;
  signin: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string) => Promise<void>;
  signout: () => void;
  isLoading: boolean;
}

export function AuthProvider({ children }) {
  const [token, setToken] = useState<string | null>(null);
  
  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    if (storedToken) setToken(storedToken);
  }, []);

  const signin = async (email: string, password: string) => {
    const response = await fetch(`${API_URL}/auth/signin`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    const data = await response.json();
    setToken(data.token);
    localStorage.setItem('token', data.token);
  };

  return <AuthContext.Provider value={{ token, signin, ... }}>{children}</AuthContext.Provider>;
}
```

**Protected Route Pattern**:

```typescript
// src/components/auth/ProtectedRoute.tsx
export function ProtectedRoute({ children }) {
  const { token, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !token) router.push('/signin');
  }, [token, isLoading]);

  if (isLoading) return <div>Loading...</div>;
  if (!token) return null;
  return <>{children}</>;
}
```

**API Client with Token Injection**:

```typescript
// src/lib/api.ts
export async function apiRequest(endpoint: string, options: RequestInit = {}) {
  const token = localStorage.getItem('token');
  const headers = {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
    ...options.headers,
  };

  const response = await fetch(`${API_URL}${endpoint}`, { ...options, headers });
  
  if (response.status === 401) {
    localStorage.removeItem('token');
    window.location.href = '/signin';
  }
  
  return response.json();
}
```

**Server vs Client Components**:
- Server Components: Static pages, layouts (default)
- Client Components: Auth forms, task list (use 'use client' directive)

**Dependencies**:
- `next@14.0.4`
- `react@18.2.0`
- `typescript@5.3.3`
- `tailwindcss@3.4.0`

**Alternatives Considered**:
- React Router: No SSR, client-only
- Vite + React: Simpler but lacks SSR
- Remix: Newer, less ecosystem support
- **Selected Next.js 14**: Modern patterns, production-ready, excellent DX

---

### R4: Multi-User Isolation at Database Level

**Decision**: Implement service-layer validation pattern with user_id filtering on all database queries.

**Rationale**:
- Service layer provides single point of validation for user ownership
- Explicit filtering by user_id prevents cross-user data leakage
- Testable and auditable security pattern
- Clear separation between authentication (middleware) and authorization (service)
- Performance optimized with database indexes on user_id

**Middleware User Extraction**:

```python
# src/middleware/jwt_auth.py
async def extract_user_id(request: Request):
    auth_header = request.headers.get("Authorization")
    if not auth_header or not auth_header.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Missing authorization")
    
    token = auth_header.split(" ")[1]
    payload = decode_access_token(token)
    user_id = payload.get("user_id")
    
    request.state.user_id = user_id
    return user_id
```

**Service Layer Validation**:

```python
# src/services/task_service.py
class TaskService:
    def validate_ownership(self, task_id: str, user_id: str) -> Task:
        task = self.db.get(Task, task_id)
        if not task:
            raise HTTPException(status_code=404, detail="Task not found")
        if task.user_id != user_id:
            raise HTTPException(status_code=403, detail="Access forbidden")
        return task
    
    def get_user_tasks(self, user_id: str, filters: dict = None):
        query = select(Task).where(Task.user_id == user_id)
        # Apply filters...
        return self.db.exec(query).all()
```

**Route Usage**:

```python
@router.get("/api/users/{user_id}/tasks")
async def get_tasks(
    user_id: str,
    token_user_id: str = Depends(extract_user_id),
    db: Session = Depends(get_db)
):
    if user_id != token_user_id:
        raise HTTPException(status_code=403, detail="Access forbidden")
    
    service = TaskService(db)
    return service.get_user_tasks(user_id)
```

**Error Response Strategy**:
- **401 Unauthorized**: Missing/invalid/expired token (authentication failure)
- **403 Forbidden**: Valid token but accessing another user's resource (authorization failure)
- **404 Not Found**: Resource doesn't exist (security through obscurity for cross-user attempts)

**Security Best Practices**:
1. Always filter queries by authenticated user_id
2. Validate path parameter user_id matches token user_id
3. Use database indexes on user_id for performance
4. Log all 403 errors for security monitoring
5. Never expose existence of other users' data in error messages

**Alternatives Considered**:
- PostgreSQL Row-Level Security: Complex setup, Neon limitations
- Query Interceptors: Global query modification (magic, hard to debug)
- Middleware-only validation: Service layer clearer and testable
- **Selected Service Layer**: Explicit, testable, clear ownership validation

---

### R5: Monorepo Development Workflow

**Decision**: Simple monorepo structure with separate `/frontend` and `/backend` directories.

**Rationale**:
- Single repository simplifies version control for related changes
- Independent dependency management for frontend/backend
- Clear separation of concerns without repository overhead
- Suitable for 2-project structure (no need for Turborepo/Nx)
- Easy cross-layer debugging during development

**Project Structure**:

```
hackathon-todo/
├── frontend/        # Next.js 14 application
├── backend/         # FastAPI application
├── specs/           # Phase II specifications
├── .gitignore
└── README.md
```

**Development Startup** (Windows PowerShell):

```powershell
# start-dev.ps1
Start-Process pwsh -ArgumentList "-NoExit", "-Command", "cd backend; .\venv\Scripts\Activate.ps1; uvicorn src.main:app --reload --port 8000"
Start-Process pwsh -ArgumentList "-NoExit", "-Command", "cd frontend; npm run dev"
```

**CORS Configuration**:

```python
# Backend: src/main.py
from fastapi.middleware.cors import CORSMiddleware

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

**Environment Variables**:

```bash
# backend/.env
DATABASE_URL=postgresql://user:password@ep-xxx.region.aws.neon.tech/db?sslmode=require
JWT_AUTH=your-secret-key-minimum-32-characters

# frontend/.env.local
NEXT_PUBLIC_API_URL=http://localhost:8000
```

**Port Allocation**:
- Backend: `http://localhost:8000`
- Frontend: `http://localhost:3000`
- Database: Neon cloud (no local port)

**Dependency Installation**:

```bash
# Backend
cd backend
python -m venv venv
venv\Scripts\activate  # Windows
pip install -r requirements.txt
alembic upgrade head

# Frontend
cd frontend
npm install
```

**Alternatives Considered**:
- Separate Repositories: Harder to manage related changes
- Polyrepo with Git Submodules: Complex merge conflicts
- Turborepo/Nx: Overkill for 2-project structure
- **Selected Simple Monorepo**: Straightforward, version control friendly

---

## Phase II Dependencies Summary

### Backend (`requirements.txt`)

```
fastapi==0.109.0
uvicorn[standard]==0.27.0
sqlmodel==0.0.14
alembic==1.13.1
psycopg2-binary==2.9.9
PyJWT==2.8.0
bcrypt==4.1.2
python-dotenv==1.0.0
pydantic[email]==2.5.3
```

### Frontend (`package.json`)

```json
{
  "dependencies": {
    "next": "14.0.4",
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "typescript": "^5.3.3"
  },
  "devDependencies": {
    "tailwindcss": "^3.4.0",
    "postcss": "^8.4.32",
    "autoprefixer": "^10.4.16",
    "@types/node": "^20.10.6",
    "@types/react": "^18.2.46",
    "@types/react-dom": "^18.2.18"
  }
}
```

---

## Phase II Research Summary

| Research Task | Technology Decision | Key Benefit |
|--------------|---------------------|-------------|
| R1: Authentication | Better Auth + Custom JWT | Full control, lightweight, educational |
| R2: Database + ORM | Neon PostgreSQL + SQLModel | Serverless, type-safe, FastAPI-native |
| R3: Frontend | Next.js 14 App Router | Modern React, SSR, production-ready |
| R4: Security | Service Layer Validation | Explicit, testable, clear ownership |
| R5: Workflow | Simple Monorepo | Version control friendly, easy setup |

**All technical uncertainties resolved**. Ready to proceed to Phase 1 (Design).

---

## Next Steps

1. ✅ Phase 0 Research Complete
2. ⏭️ Phase 1: Design (data-model.md, contracts/rest-api.md, quickstart.md)
3. ⏭️ Update Agent Context (Copilot.md files)
4. ⏭️ Re-check Constitution Compliance
5. ⏭️ Phase 2: Task Breakdown (/sp.tasks command)

---

## Phase I Research (Reference Only - Superseded by Phase II)

Phase I focused on in-memory Python console application. The research below is preserved for reference but does not apply to Phase II full-stack web implementation.

### 1. Python 3.12.4 Suitability for Console Applications

**Decision**: Python 3.12.4 is ideal for this Phase I implementation.

**Rationale**:
- Stable release with excellent standard library support
- Native support for dataclasses (PEP 681 improvements in 3.12)
- Enhanced error messages improve development experience
- uuid and datetime modules fully mature and reliable
- Cross-platform console support (Windows/Linux/macOS)
- No backward compatibility concerns for Phase I scope

**Alternatives Considered**:
- Python 3.11: Stable but lacks 3.12 error message improvements
- Python 3.13: Too new, not needed for Phase I features

**References**:
- Python 3.12 release notes (dataclass improvements)
- Standard library documentation (uuid, datetime)

---

### 2. In-Memory Storage Implementation Pattern

**Decision**: Use Python dictionary with UUID keys, managed through a dedicated MemoryStore class.

**Rationale**:
- Dict[str, Task] provides O(1) lookup by ID
- Simple and efficient for Phase I scale (<1000 tasks)
- Native Python data structure - no external dependencies
- Easy to serialize/persist in future phases
- MemoryStore class encapsulates storage logic for clean architecture

**Alternatives Considered**:
- List[Task]: O(n) lookup, requires linear search by ID
- SQLite in-memory: Overkill for Phase I, violates "no database" constraint
- OrderedDict: Unnecessary, dict maintains insertion order in Python 3.7+

**Implementation Pattern**:
```python
class MemoryStore:
    def __init__(self):
        self._tasks: Dict[str, Task] = {}
    
    def add(self, task: Task) -> None:
        self._tasks[task.id] = task
    
    def get(self, task_id: str) -> Optional[Task]:
        return self._tasks.get(task_id)
    
    def list_all(self) -> List[Task]:
        return list(self._tasks.values())
    
    def delete(self, task_id: str) -> bool:
        return self._tasks.pop(task_id, None) is not None
```

---

### 3. CLI Interface Design Pattern

**Decision**: REPL-style interactive command loop with command dispatcher pattern.

**Rationale**:
- Familiar interface for console users (like Python REPL, shell)
- Command pattern allows clean separation of command logic
- Easy to extend with new commands in future phases
- Input validation centralized in command handler
- Clear user feedback for all operations

**Alternatives Considered**:
- Argparse CLI (e.g., `python todo.py add "Task"`): Less interactive, requires re-running program
- Menu-driven numbered options: Less flexible, more verbose
- Natural language parsing: Out of scope for Phase I

**Command Dispatcher Pattern**:
```python
class CommandHandler:
    def __init__(self, task_service: TaskService):
        self.task_service = task_service
        self.commands = {
            'add': self.handle_add,
            'list': self.handle_list,
            'update': self.handle_update,
            'delete': self.handle_delete,
            'toggle': self.handle_toggle,
            'exit': self.handle_exit,
            'quit': self.handle_exit,
        }
    
    def dispatch(self, command: str, args: List[str]):
        handler = self.commands.get(command.lower())
        if handler:
            return handler(args)
        else:
            print(f"Unknown command: {command}")
```

---

### 4. Task ID Strategy

**Decision**: UUID v4 as string, display first 8 characters in UI.

**Rationale**:
- UUID v4 guarantees uniqueness without coordination
- String format for easy storage and comparison
- First 8 chars provide sufficient uniqueness for Phase I scale
- Standard library support (uuid.uuid4())
- Compatible with future database implementations

**Alternatives Considered**:
- Sequential integer IDs: Requires state management, less portable
- UUID v1: Includes MAC address (privacy concern)
- Short random strings: Higher collision risk

**Implementation**:
```python
import uuid

task_id = str(uuid.uuid4())  # Full: "550e8400-e29b-41d4-a716-446655440000"
display_id = task_id[:8]     # Display: "550e8400"
```

---

### 5. Task Data Model

**Decision**: Python dataclass with explicit fields and defaults.

**Rationale**:
- Dataclasses provide clean syntax and automatic __init__
- Type hints improve code clarity and IDE support
- Immutable by default (frozen=True) for safety
- Easy to serialize for future phases (to_dict/from_dict)
- Standard library (dataclasses module)

**Implementation**:
```python
from dataclasses import dataclass
from datetime import datetime

@dataclass
class Task:
    id: str
    title: str
    description: str
    completed: bool
    created_at: str  # ISO 8601 format
    
    @staticmethod
    def create(title: str, description: str = "") -> 'Task':
        return Task(
            id=str(uuid.uuid4()),
            title=title,
            description=description,
            completed=False,
            created_at=datetime.utcnow().isoformat()
        )
```

**Alternatives Considered**:
- Plain dict: Less type safety, no IDE support
- NamedTuple: Immutable but less flexible for future evolution
- Pydantic: External dependency, overkill for Phase I

---

### 6. CLI Output Formatting

**Decision**: Use Python string formatting with optional `rich` library for enhanced output.

**Rationale**:
- f-strings provide clean, readable formatting
- `rich` library offers beautiful console output with minimal code
- Fallback to plain strings if rich not available
- Status indicators: ✓ (complete) / ✗ (incomplete)
- Tabular layout for task list

**Alternatives Considered**:
- Plain print: Works but less user-friendly
- Colorama: Lower-level, more verbose code
- Prettytable: Heavier dependency, not needed

**Example Output**:
```
Tasks:
┌──────────┬──────────────────────┬─────────────────┬────────┬─────────────────────┐
│ ID       │ Title                │ Description     │ Status │ Created             │
├──────────┼──────────────────────┼─────────────────┼────────┼─────────────────────┤
│ 550e8400 │ Buy groceries        │ Milk and bread  │ ✗      │ 2026-01-01 14:22:13 │
│ 7c9e6679 │ Write documentation  │ Phase I spec    │ ✓      │ 2026-01-01 14:25:30 │
└──────────┴──────────────────────┴─────────────────┴────────┴─────────────────────┘
```

---

### 7. Error Handling Strategy

**Decision**: Explicit error messages with try-except blocks at command handler level.

**Rationale**:
- User-friendly error messages improve UX
- Graceful degradation - app never crashes
- Centralized error handling in command dispatcher
- Specific errors for common cases (invalid ID, empty title)

**Error Categories**:
1. **Invalid Input**: Empty title, malformed ID
2. **Not Found**: Task ID doesn't exist
3. **Invalid Command**: Unknown command entered

**Implementation Pattern**:
```python
def handle_delete(self, args: List[str]):
    try:
        if not args:
            print("Error: Task ID required")
            return
        
        task_id = args[0]
        success = self.task_service.delete_task(task_id)
        
        if success:
            print(f"Task {task_id[:8]} deleted successfully")
        else:
            print(f"Error: Task {task_id[:8]} not found")
    except Exception as e:
        print(f"Error: {str(e)}")
```

---

### 8. Application Entry Point

**Decision**: Standard Python `if __name__ == "__main__"` pattern with main() function.

**Rationale**:
- Standard Python convention
- Allows module import without auto-execution
- Clean separation of initialization and execution
- Easy to test (future phases)

**Implementation**:
```python
# src/main.py
def main():
    store = MemoryStore()
    service = TaskService(store)
    handler = CommandHandler(service)
    display = Display()
    
    print("Todo Application (Phase I)")
    print("Type 'help' for commands, 'exit' to quit")
    
    while True:
        try:
            user_input = input("\ntodo> ").strip()
            if not user_input:
                continue
            
            parts = user_input.split(maxsplit=1)
            command = parts[0]
            args = parts[1:] if len(parts) > 1 else []
            
            handler.dispatch(command, args)
            
        except KeyboardInterrupt:
            print("\nExiting...")
            break
        except EOFError:
            break

if __name__ == "__main__":
    main()
```

---

### 9. Best Practices for Python Console Applications

**Research Findings**:

1. **Project Structure**:
   - Use `src/` layout (not flat structure)
   - `__init__.py` in all package directories
   - Single entry point (main.py)

2. **Code Quality**:
   - Follow PEP 8 style guide
   - Type hints for all functions
   - Docstrings for public APIs
   - Max line length: 88 characters (Black standard)

3. **User Experience**:
   - Clear command prompt
   - Immediate feedback for all actions
   - Help command for usage instructions
   - Graceful exit handling (Ctrl+C, Ctrl+D)

4. **Dependencies**:
   - Minimize external dependencies
   - Use stdlib when possible
   - Document optional dependencies in requirements.txt

5. **README Content**:
   - Python version requirement (first line)
   - Installation steps (if any)
   - Usage examples for each command
   - Phase I scope clarification

**References**:
- PEP 8: Python Style Guide
- Python Packaging User Guide (src layout)
- Python Console UI patterns (Real Python)

---

### 10. Integration Points for Future Phases

**Research Findings**:

This architecture supports clean evolution to Phase II:

1. **Storage Layer Swap**:
   - MemoryStore can be replaced with DatabaseStore
   - TaskService interface remains unchanged
   - No changes to CLI or models

2. **API Addition**:
   - TaskService can be wrapped with FastAPI endpoints
   - Shared business logic between CLI and API
   - Models reused for API request/response

3. **Testing Addition**:
   - Services are testable (dependency injection)
   - Storage layer can use test doubles
   - CLI can be tested with input/output mocking

**Migration Path Example**:
```python
# Phase I
store = MemoryStore()

# Phase II - minimal change
from storage.database_store import DatabaseStore
store = DatabaseStore(connection_string)

# Service layer unchanged
service = TaskService(store)
```

---

## Summary of Resolutions

All technical uncertainties from the implementation plan have been resolved:

| Area | Status | Resolution |
|------|--------|------------|
| Python Version | ✅ Resolved | 3.12.4 confirmed suitable |
| Storage Pattern | ✅ Resolved | Dict[str, Task] with MemoryStore class |
| CLI Design | ✅ Resolved | REPL-style with command dispatcher |
| Task ID Strategy | ✅ Resolved | UUID v4, display first 8 chars |
| Data Model | ✅ Resolved | Python dataclass with explicit fields |
| Output Formatting | ✅ Resolved | f-strings + optional rich library |
| Error Handling | ✅ Resolved | Explicit messages at command handler level |
| Entry Point | ✅ Resolved | Standard __main__ pattern |

---

## Next Steps

With all research completed, proceed to:
1. **Phase 1**: Generate data-model.md
2. **Phase 1**: Generate quickstart.md
3. **Phase 1**: Update agent context
4. **Phase 2**: Break down into implementation tasks

---

**Research Complete**: 2026-01-01  
**Ready for Phase 1**: ✅
