# Implementation Plan: Phase II - Todo Full-Stack Web Application

**Branch**: `main` | **Date**: 2026-01-01 | **Spec**: specs/main/spec.md
**Input**: Phase II Planning Request (Constitutional Context)

**Note**: This plan executes Phase II of the "Evolution of Todo – 5-Phase Hackathon" under the Master Constitution.

## Summary

Build a multi-user full-stack Todo web application with JWT authentication (Better Auth), persistent storage (Neon PostgreSQL), RESTful API (FastAPI), and modern UI (Next.js 14). All development follows strict Spec-Driven Development using Copilot CLI for code generation. Phase I (in-memory console app) is complete; Phase II transitions to web architecture with database persistence and multi-user support.

## Technical Context

**Language/Version**: 
- Backend: Python 3.12.4 (EXACT VERSION)
- Frontend: TypeScript 5.x (Next.js 14 App Router)

**Primary Dependencies**:
- Backend: FastAPI, SQLModel, Alembic, Better Auth (JWT), bcrypt, uvicorn, psycopg2-binary
- Frontend: Next.js 14, React 18, Tailwind CSS, TypeScript, Better Auth Client

**Storage**: Neon Serverless PostgreSQL (cloud-hosted, persistent)

**Testing**: Manual testing via acceptance criteria checklist (automated tests optional Phase II extension)

**Target Platform**: 
- Backend: Linux/Windows development server, deployable to any Python WSGI/ASGI host
- Frontend: Next.js 14 App Router (SSR/CSR hybrid)

**Project Type**: Web (monorepo with separate /frontend and /backend)

**Performance Goals**: 
- API response time <500ms p95
- Frontend initial load <3s
- Support 100+ concurrent users (development target)

**Constraints**: 
- NO manual code editing (Spec-Driven Development only)
- JWT_AUTH environment variable MUST be used for token signing
- Multi-user isolation enforced at database query level
- All API endpoints require JWT validation except auth routes

**Scale/Scope**: 
- 5 core CRUD operations (add, delete, update, view, toggle)
- 2 database models (User, Task)
- 6 API endpoints (signup, signin, signout, task CRUD)
- 4 frontend pages (signup, signin, task list, task detail)

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

**Master Constitution v1.0.0 Compliance Review**

### ✅ Spec-Driven Development (Section 3)
- [ ] No manual code writing - Copilot CLI generates all code from specs
- [ ] All features have clear specifications with acceptance criteria
- [ ] Code refinement happens through spec updates, not manual edits
- [ ] Specs are single source of truth

### ✅ Documentation Rules (Section 4)
- [ ] Minimal documentation: one spec per logical area
- [ ] Continuous updates instead of duplication
- [ ] Change tracking with phase attribution
- [ ] Phase II specs evolve from Phase I foundations

### ✅ Phase Execution Rules (Section 7)
- [ ] Phase I completed and validated (in-memory console app)
- [ ] Phase II addendum defined (this plan)
- [ ] Implementation generated via Copilot CLI
- [ ] Validation against acceptance criteria before Phase III
- [ ] Phase freeze before moving to Phase III

### ✅ Feature Evolution Rules (Section 8)
- [ ] Phase II features: Persistence, web UI, multi-user, RESTful API
- [ ] Phase III features (AI agents) explicitly deferred
- [ ] Phase IV/V features (Kubernetes, cloud) explicitly deferred
- [ ] No premature feature implementation

### ✅ Agentic Stack Compliance (Section 6)
- [ ] Copilot CLI as primary interface
- [ ] Official Google ADK patterns followed
- [ ] No LangChain or unapproved frameworks
- [ ] Better Auth (approved JWT solution)

### ✅ Hackathon Alignment (Section 9)
- [ ] Focus: Complete Phase II correctly
- [ ] Bonus features (Urdu, voice) deferred until all 5 phases complete
- [ ] Core system stability prioritized

**GATE STATUS**: ✅ PASS - All constitutional requirements satisfied for Phase II planning

**Notes**: 
- Phase I (in-memory console) completed successfully
- Phase II introduces web stack, persistence, authentication (constitutional progression)
- No violations detected
- No complexity exceptions required

## Project Structure

### Documentation (Phase II)

```text
specs/main/
├── plan.md                        # This file (Phase II implementation plan)
├── spec.md                        # Phase I spec (reference only)
├── research.md                    # Phase 0 output: Technology research & decisions
├── data-model.md                  # Phase 1 output: User & Task entity models
├── quickstart.md                  # Phase 1 output: Setup and running guide
├── contracts/                     # Phase 1 output: API specifications
│   ├── rest-api.md               # RESTful endpoint definitions
│   └── openapi.yaml              # OpenAPI 3.0 specification (optional)
├── features/                      # Detailed feature specifications
│   ├── authentication.md         # Auth flow, JWT, Better Auth integration
│   └── task-management.md        # Task CRUD with multi-user isolation
├── frontend-spec.md              # Frontend architecture & components
├── backend-spec.md               # Backend architecture & routes
└── tasks.md                       # Phase 2 output: Task breakdown (created by /sp.tasks)
```

### Source Code (monorepo root)

```text
hackathon-todo/                    # Project root
├── .spec-kit/                     # Spec-Kit Plus configuration
├── .specify/                      # Spec tooling and templates
│   ├── memory/
│   │   └── constitution.md       # Master Constitution v1.0.0
│   └── scripts/
│       └── powershell/
│           ├── setup-plan.ps1
│           └── update-agent-context.ps1
├── specs/                         # All specifications (see above)
├── history/                       # Prompt History Records
│   └── prompts/
│       ├── constitution/
│       ├── main/                 # Phase II PHRs
│       └── general/
├── frontend/                      # Next.js 14 application
│   ├── Copilot.md                # Frontend code generation guidelines
│   ├── src/
│   │   ├── app/                  # Next.js App Router
│   │   │   ├── page.tsx          # Home/landing page
│   │   │   ├── signup/
│   │   │   │   └── page.tsx      # User registration page
│   │   │   ├── signin/
│   │   │   │   └── page.tsx      # User login page
│   │   │   ├── tasks/
│   │   │   │   ├── page.tsx      # Task list page (main app)
│   │   │   │   └── [id]/
│   │   │   │       └── page.tsx  # Task detail/edit page
│   │   │   └── layout.tsx        # Root layout with auth context
│   │   ├── components/           # React components
│   │   │   ├── auth/
│   │   │   │   ├── SignupForm.tsx
│   │   │   │   ├── SigninForm.tsx
│   │   │   │   └── ProtectedRoute.tsx
│   │   │   ├── tasks/
│   │   │   │   ├── TaskList.tsx
│   │   │   │   ├── TaskItem.tsx
│   │   │   │   ├── TaskForm.tsx  # Add/edit task
│   │   │   │   ├── TaskFilters.tsx
│   │   │   │   └── TaskSearch.tsx
│   │   │   └── ui/               # Reusable UI components
│   │   │       ├── Button.tsx
│   │   │       ├── Input.tsx
│   │   │       └── Modal.tsx
│   │   ├── lib/                  # Utilities and API client
│   │   │   ├── api.ts            # API client with JWT injection
│   │   │   ├── auth.ts           # Better Auth client configuration
│   │   │   └── utils.ts
│   │   └── types/                # TypeScript types
│   │       ├── task.ts
│   │       └── user.ts
│   ├── public/                   # Static assets
│   ├── package.json
│   ├── tsconfig.json
│   ├── tailwind.config.ts
│   ├── postcss.config.js
│   ├── next.config.js
│   └── .env.example
├── backend/                       # FastAPI application
│   ├── Copilot.md                # Backend code generation guidelines
│   ├── src/
│   │   ├── main.py               # FastAPI app entry point
│   │   ├── config.py             # Environment configuration
│   │   ├── database.py           # Database connection & session management
│   │   ├── models/               # SQLModel database models
│   │   │   ├── __init__.py
│   │   │   ├── user.py           # User model (id, email, hashed_password)
│   │   │   └── task.py           # Task model (id, user_id, title, etc.)
│   │   ├── routes/               # API route handlers
│   │   │   ├── __init__.py
│   │   │   ├── auth.py           # POST /auth/signup, /auth/signin, /auth/signout
│   │   │   └── tasks.py          # Task CRUD endpoints
│   │   ├── middleware/           # Request middleware
│   │   │   ├── __init__.py
│   │   │   └── jwt_auth.py       # JWT token validation
│   │   ├── schemas/              # Pydantic request/response schemas
│   │   │   ├── __init__.py
│   │   │   ├── auth.py           # SignupRequest, SigninRequest, TokenResponse
│   │   │   └── task.py           # TaskCreate, TaskUpdate, TaskResponse
│   │   ├── services/             # Business logic
│   │   │   ├── __init__.py
│   │   │   ├── auth_service.py   # User registration, login, JWT generation
│   │   │   └── task_service.py   # Task CRUD with user ownership validation
│   │   └── utils/                # Utilities
│   │       ├── __init__.py
│   │       ├── password.py       # bcrypt hashing
│   │       └── jwt.py            # JWT encode/decode
│   ├── alembic/                  # Database migrations
│   │   ├── versions/
│   │   ├── env.py
│   │   └── alembic.ini
│   ├── requirements.txt
│   ├── .env.example
│   └── README.md
├── docker-compose.yml             # Optional: Local development environment
├── .gitignore
└── README.md                      # Project overview and setup instructions
```

**Structure Decision**: Web application monorepo with separate `/frontend` and `/backend` directories. This structure supports clear separation of concerns, independent deployment options, and aligns with Phase II full-stack requirements. Phase I code (in-memory console) can remain in `/src` for reference but is not used in Phase II.

## Complexity Tracking

**NO VIOLATIONS DETECTED** - Phase II complexity aligns with constitutional requirements.

This section documents only justified violations per Constitution Check requirements. Phase II introduces web architecture, persistence, and multi-user authentication as part of natural progression from Phase I (in-memory console) to Phase II (full-stack web), which is explicitly sanctioned by Master Constitution Section 8 (Feature Evolution Rules).

**Architectural Justifications**:
- **Monorepo structure**: Required to maintain frontend + backend in single repository for Phase II scope
- **JWT authentication**: Better Auth with JWT is the approved authentication standard for multi-user web applications
- **Neon PostgreSQL**: Phase II explicitly requires persistent storage (upgrade from Phase I in-memory)
- **Next.js 14 App Router**: Modern React framework for server-side rendering and routing

All complexity is phase-appropriate and constitutionally sanctioned.

---

## Phase 0: Research & Technology Decisions

### Research Tasks

**Phase 0 generates `research.md` to resolve all technical unknowns before design.**

#### R1: Better Auth + JWT Integration with FastAPI
**Question**: How to integrate Better Auth JWT tokens with FastAPI middleware?
**Research Focus**:
- Better Auth server-side configuration for JWT generation
- FastAPI dependency injection for JWT validation
- Token refresh strategies
- httpOnly cookie vs. localStorage security trade-offs

**Expected Output**: 
- JWT_AUTH environment variable usage pattern
- FastAPI middleware implementation strategy
- Token validation decorator pattern
- Error handling for expired/invalid tokens

#### R2: Neon PostgreSQL + SQLModel ORM Setup
**Question**: How to connect SQLModel ORM to Neon Serverless PostgreSQL?
**Research Focus**:
- Neon connection string format
- SQLModel engine configuration for async operations
- Connection pooling best practices
- Alembic migration patterns with SQLModel

**Expected Output**:
- Database connection configuration
- Session management pattern
- Migration workflow
- Environment variable setup (DATABASE_URL)

#### R3: Next.js 14 App Router + Better Auth Client
**Question**: How to implement Better Auth client in Next.js 14 App Router?
**Research Focus**:
- Better Auth React hooks
- Protected route patterns with App Router
- Server components vs. client components for auth
- Token storage and refresh in client

**Expected Output**:
- Auth context provider pattern
- Protected route wrapper component
- API client with automatic token injection
- SSR-compatible auth state management

#### R4: Multi-User Isolation at Database Level
**Question**: How to enforce user_id filtering in all SQLModel queries?
**Research Focus**:
- SQLModel query filtering patterns
- FastAPI request context for user_id extraction
- Row-level security considerations
- Authorization middleware vs. service-level validation

**Expected Output**:
- Service layer pattern for user-scoped queries
- Middleware to extract user_id from JWT
- Validation patterns to prevent cross-user access
- Error responses for unauthorized access (403 vs 401)

#### R5: Monorepo Development Workflow
**Question**: How to run frontend + backend simultaneously in development?
**Research Focus**:
- docker-compose for local development (optional)
- Environment variable management (.env files)
- CORS configuration for local development
- Port allocation (backend 8000, frontend 3000)

**Expected Output**:
- Development startup script or documentation
- CORS configuration for FastAPI
- Environment variable template (.env.example)
- Dependency installation workflow

### Research Output Format

`specs/main/research.md` will contain:

```markdown
# Phase II Research: Technology Decisions

## Decision: Better Auth + JWT with FastAPI
**Rationale**: [findings]
**Implementation**: [code patterns]
**Alternatives Considered**: [other auth solutions]

## Decision: Neon + SQLModel Configuration
**Rationale**: [findings]
**Implementation**: [connection pattern]
**Alternatives Considered**: [other PostgreSQL hosting]

[... etc for all research tasks]
```

---

## Phase 1: Design & Contracts

**Prerequisites**: `research.md` complete with all decisions documented

### P1.1: Data Model Design (`data-model.md`)

#### User Entity
```
User:
  - id: UUID (primary key, auto-generated)
  - email: String (unique, required, max 255 chars)
  - hashed_password: String (required, bcrypt hash)
  - created_at: DateTime (auto-generated, UTC)
  - updated_at: DateTime (auto-updated, UTC)

Validations:
  - email: valid email format, unique constraint
  - password: min 8 characters, hashed with bcrypt before storage

Relationships:
  - One User has many Tasks (cascade delete)
```

#### Task Entity
```
Task:
  - id: UUID (primary key, auto-generated)
  - user_id: UUID (foreign key → User.id, required, indexed)
  - title: String (required, non-empty, max 200 chars)
  - description: String (optional, max 2000 chars)
  - completed: Boolean (default: False)
  - created_at: DateTime (auto-generated, UTC)
  - updated_at: DateTime (auto-updated, UTC)

Validations:
  - title: non-empty string
  - user_id: must reference existing User
  - All queries MUST filter by user_id from JWT

Relationships:
  - Many Tasks belong to one User

Indexes:
  - user_id (for efficient user task queries)
  - created_at (for sorting)
```

### P1.2: API Contracts (`contracts/rest-api.md`)

#### Authentication Endpoints

```
POST /api/auth/signup
Request Body:
  {
    "email": "user@example.com",
    "password": "SecurePass123"
  }
Response (201 Created):
  {
    "user_id": "uuid",
    "email": "user@example.com",
    "token": "jwt.token.here"
  }
Errors:
  - 400: Invalid email format or password too short
  - 409: Email already exists

POST /api/auth/signin
Request Body:
  {
    "email": "user@example.com",
    "password": "SecurePass123"
  }
Response (200 OK):
  {
    "user_id": "uuid",
    "email": "user@example.com",
    "token": "jwt.token.here"
  }
Errors:
  - 401: Invalid credentials
  - 400: Missing email or password

POST /api/auth/signout
Headers: Authorization: Bearer {token}
Response (200 OK):
  { "message": "Signed out successfully" }
Note: Client-side token deletion (stateless JWT)
```

#### Task CRUD Endpoints (All require JWT)

```
GET /api/users/{user_id}/tasks
Headers: Authorization: Bearer {token}
Query Params:
  - completed: boolean (optional, filter by completion status)
  - sort: "created_asc" | "created_desc" | "title_asc" | "title_desc" (optional)
  - search: string (optional, search title/description)
Response (200 OK):
  {
    "tasks": [
      {
        "id": "uuid",
        "user_id": "uuid",
        "title": "Task title",
        "description": "Task description",
        "completed": false,
        "created_at": "2026-01-01T10:00:00Z",
        "updated_at": "2026-01-01T10:00:00Z"
      }
    ],
    "total": 10
  }
Errors:
  - 401: Invalid/missing token
  - 403: user_id mismatch with token claims

POST /api/users/{user_id}/tasks
Headers: Authorization: Bearer {token}
Request Body:
  {
    "title": "New task",
    "description": "Optional description"
  }
Response (201 Created):
  {
    "id": "uuid",
    "user_id": "uuid",
    "title": "New task",
    "description": "Optional description",
    "completed": false,
    "created_at": "2026-01-01T10:00:00Z",
    "updated_at": "2026-01-01T10:00:00Z"
  }
Errors:
  - 400: Empty title
  - 401: Invalid/missing token
  - 403: user_id mismatch

GET /api/users/{user_id}/tasks/{task_id}
Headers: Authorization: Bearer {token}
Response (200 OK): [Task object]
Errors:
  - 401: Invalid/missing token
  - 403: user_id mismatch or task not owned by user
  - 404: Task not found

PUT /api/users/{user_id}/tasks/{task_id}
Headers: Authorization: Bearer {token}
Request Body:
  {
    "title": "Updated title",
    "description": "Updated description"
  }
Response (200 OK): [Updated Task object]
Errors:
  - 400: Empty title
  - 401: Invalid/missing token
  - 403: user_id mismatch or task not owned by user
  - 404: Task not found

DELETE /api/users/{user_id}/tasks/{task_id}
Headers: Authorization: Bearer {token}
Response (204 No Content)
Errors:
  - 401: Invalid/missing token
  - 403: user_id mismatch or task not owned by user
  - 404: Task not found

PATCH /api/users/{user_id}/tasks/{task_id}/complete
Headers: Authorization: Bearer {token}
Request Body:
  {
    "completed": true
  }
Response (200 OK): [Updated Task object]
Errors:
  - 401: Invalid/missing token
  - 403: user_id mismatch or task not owned by user
  - 404: Task not found
```

### P1.3: Frontend Component Specifications

#### Page Components
- `SignupPage`: User registration form with email/password validation
- `SigninPage`: User login form with error handling
- `TaskListPage`: Main task management interface with filters, search, sort
- `TaskDetailPage`: Edit task form (optional, can be modal)

#### Reusable Components
- `ProtectedRoute`: HOC/wrapper to enforce authentication
- `TaskList`: Display tasks with completion toggle
- `TaskItem`: Single task display with edit/delete actions
- `TaskForm`: Add/edit task form with validation
- `TaskFilters`: Filter by completion status
- `TaskSearch`: Search by title/description

### P1.4: Agent Context Update

**Run**: `.specify\scripts\powershell\update-agent-context.ps1 -AgentType copilot`

This updates `frontend/Copilot.md` and `backend/Copilot.md` with:
- Phase II technology stack
- Code generation conventions
- API contract references
- Security patterns (JWT validation, user isolation)

### P1.5: Quickstart Guide (`quickstart.md`)

```markdown
# Phase II Quickstart: Todo Full-Stack Web Application

## Prerequisites
- Python 3.12.4
- Node.js 18+ and npm
- Neon PostgreSQL account (free tier)

## Environment Setup

### Backend (.env)
```
DATABASE_URL=postgresql://user:pass@host/db
JWT_AUTH=your-secret-key-min-32-chars
```

### Frontend (.env.local)
```
NEXT_PUBLIC_API_URL=http://localhost:8000
```

## Installation

### Backend
```bash
cd backend
pip install -r requirements.txt
alembic upgrade head
uvicorn src.main:app --reload --port 8000
```

### Frontend
```bash
cd frontend
npm install
npm run dev
```

## First Run
1. Navigate to http://localhost:3000
2. Click "Sign Up" and create account
3. Sign in with credentials
4. Start managing tasks!

## Development Workflow
1. Update specs in `/specs/main/`
2. Use Copilot CLI to generate code from specs
3. Test functionality against acceptance criteria
4. Refine specs if issues found, regenerate code
```

---

## Phase 2: Task Breakdown (Deferred to /sp.tasks)

**Phase 2 execution**: Run `/sp.tasks` command to generate `specs/main/tasks.md`

The tasks file will break down implementation into:

### Backend Tasks (B1-B10)
- B1: SQLModel User and Task models with relationships
- B2: Alembic migration scripts (create users, create tasks)
- B3: Database connection and session management
- B4: Password hashing utility (bcrypt)
- B5: JWT encoding/decoding utility
- B6: Auth service (signup, signin logic)
- B7: Auth routes (POST /auth/signup, /auth/signin, /auth/signout)
- B8: JWT authentication middleware
- B9: Task service with user ownership validation
- B10: Task routes (all CRUD endpoints)

### Frontend Tasks (F1-F10)
- F1: Better Auth client configuration
- F2: API client with JWT injection
- F3: Auth context provider
- F4: ProtectedRoute wrapper component
- F5: Signup page and form
- F6: Signin page and form
- F7: Task list page with filters/search/sort
- F8: TaskList and TaskItem components
- F9: TaskForm component (add/edit)
- F10: Error handling and loading states

### Integration Tasks (I1-I5)
- I1: CORS configuration
- I2: End-to-end auth flow testing
- I3: Multi-user isolation verification
- I4: Error handling validation
- I5: Performance and security review

---

## Phase II Completion Checklist

### Planning Phase (Pre-Implementation) ✅
- [x] Feature specifications created
- [x] API specification created
- [x] Database schema specification created
- [x] Architecture document created
- [x] Constitution compliance verified

### Phase 0: Research ⏳
- [ ] research.md completed with all technology decisions
- [ ] Better Auth + JWT integration documented
- [ ] Neon + SQLModel configuration documented
- [ ] Next.js 14 auth patterns documented
- [ ] Multi-user isolation strategy documented
- [ ] Development workflow documented

### Phase 1: Design ⏳
- [ ] data-model.md created (User + Task entities)
- [ ] contracts/rest-api.md created (all endpoints)
- [ ] quickstart.md created
- [ ] Agent context updated (Copilot.md files)
- [ ] Constitution re-check passed

### Phase 2: Task Breakdown ⏳
- [ ] /sp.tasks command executed
- [ ] tasks.md generated with backend/frontend/integration tasks
- [ ] Task dependencies identified
- [ ] Implementation order determined

### Implementation (Code Generation) - Future
- [ ] Backend database models generated
- [ ] Backend API routes generated
- [ ] Backend JWT middleware generated
- [ ] Frontend authentication pages generated
- [ ] Frontend task management pages generated
- [ ] Frontend API client generated
- [ ] Database migrations created
- [ ] Environment configuration setup

### Validation (Testing) - Future
- [ ] User can sign up successfully
- [ ] User can sign in and receive token
- [ ] Token is validated on all API requests
- [ ] Unauthorized requests return 401
- [ ] User can only access their own tasks
- [ ] All CRUD operations work correctly
- [ ] Filtering, sorting, search work in frontend
- [ ] Multi-user isolation verified
- [ ] Token expiry handled gracefully
- [ ] Error messages are user-friendly

### Phase II Freeze Criteria
- [ ] All acceptance criteria validated
- [ ] No critical bugs
- [ ] Performance targets met (<500ms API, <3s frontend load)
- [ ] Security validated (JWT, user isolation)
- [ ] Documentation complete
- [ ] Ready for Phase III (AI agent integration)

---

## Out of Scope (Deferred to Future Phases)

**Phase III (AI Agents)**:
- Natural language task management
- Chatbot interface
- AI-powered task suggestions

**Phase IV (Kubernetes)**:
- Container orchestration
- Local cluster deployment
- Service mesh

**Phase V (Cloud-Native)**:
- Cloud provider deployment
- Horizontal scaling
- Advanced monitoring

**Bonus Features (Post-Phase V)**:
- Urdu language support
- Voice commands
- Advanced analytics

---

## Validation Strategy

### Manual Testing Checklist

#### Authentication
1. Sign up with valid email/password → Success
2. Sign up with existing email → 409 error
3. Sign up with invalid email → 400 error
4. Sign in with valid credentials → Receive JWT token
5. Sign in with invalid credentials → 401 error
6. Access protected route without token → 401 error
7. Access protected route with expired token → 401 error

#### Task CRUD
1. Create task with title only → Success
2. Create task with title + description → Success
3. Create task with empty title → 400 error
4. View task list → See only own tasks
5. Update own task → Success
6. Delete own task → Success
7. Toggle task completion → Success
8. Attempt to access another user's task → 403 error

#### Frontend Features
1. Filter tasks by completion status → Correct results
2. Sort tasks by creation date (asc/desc) → Correct order
3. Sort tasks by title (asc/desc) → Correct order
4. Search tasks by title → Correct matches
5. Search tasks by description → Correct matches
6. Loading states display during API calls → Visual feedback
7. Error messages display for failed operations → User-friendly text

### Multi-User Isolation Test
1. Create User A and User B
2. User A creates 3 tasks
3. User B creates 3 tasks
4. Verify User A sees only their 3 tasks
5. Verify User B sees only their 3 tasks
6. Attempt to access User A's task with User B's token → 403 error

---

## Architecture Flow Diagram (Conceptual)

```
┌─────────────────────────────────────────────────────────────────┐
│                         FRONTEND (Next.js 14)                    │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐          │
│  │ Signup Page  │  │ Signin Page  │  │  Task List   │          │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘          │
│         │                  │                  │                   │
│         └──────────────────┴──────────────────┘                  │
│                            │                                      │
│                    ┌───────▼──────┐                              │
│                    │ API Client   │ (JWT injection)              │
│                    │ (Better Auth)│                              │
│                    └───────┬──────┘                              │
└────────────────────────────┼─────────────────────────────────────┘
                             │ HTTP/REST
                             │ Authorization: Bearer {token}
┌────────────────────────────▼─────────────────────────────────────┐
│                        BACKEND (FastAPI)                          │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │              JWT Middleware (validate token)              │   │
│  └──────────────────────────┬───────────────────────────────┘   │
│                             │                                     │
│         ┌───────────────────┴───────────────────┐                │
│         │                                       │                │
│  ┌──────▼──────┐                        ┌──────▼──────┐         │
│  │ Auth Routes │                        │ Task Routes │         │
│  │ /auth/*     │                        │ /users/{id}/│         │
│  └──────┬──────┘                        │   tasks/*   │         │
│         │                                └──────┬──────┘         │
│         │                                       │                │
│  ┌──────▼──────┐                        ┌──────▼──────┐         │
│  │Auth Service │                        │Task Service │         │
│  │(signup,     │                        │(CRUD with   │         │
│  │ signin)     │                        │ user filter)│         │
│  └──────┬──────┘                        └──────┬──────┘         │
│         │                                       │                │
│         └───────────────────┬───────────────────┘                │
│                             │                                     │
│                     ┌───────▼──────┐                             │
│                     │   SQLModel   │                             │
│                     │   (ORM)      │                             │
│                     └───────┬──────┘                             │
└─────────────────────────────┼─────────────────────────────────────┘
                             │ SQL queries
┌────────────────────────────▼─────────────────────────────────────┐
│                   Neon PostgreSQL (Cloud)                         │
│  ┌──────────────┐              ┌──────────────┐                  │
│  │ users table  │              │ tasks table  │                  │
│  │ - id (PK)    │              │ - id (PK)    │                  │
│  │ - email      │◄─────────────┤ - user_id(FK)│                  │
│  │ - hashed_pwd │   1:many     │ - title      │                  │
│  └──────────────┘              │ - completed  │                  │
│                                 └──────────────┘                  │
└──────────────────────────────────────────────────────────────────┘
```

---

## Key Security Patterns

### JWT Validation Flow
```
1. User signs in → Backend generates JWT with user_id claim
2. Frontend stores JWT (localStorage or httpOnly cookie)
3. Frontend attaches JWT to all API requests (Authorization header)
4. Backend middleware extracts + validates JWT
5. Backend extracts user_id from token claims
6. Backend validates user_id in URL matches token user_id
7. Backend filters all queries by authenticated user_id
8. Return 401 for invalid/expired token
9. Return 403 for user_id mismatch
```

### Multi-User Isolation Pattern
```python
# Example service layer pattern
def get_user_tasks(db: Session, user_id: str, token_user_id: str):
    # Validate ownership
    if user_id != token_user_id:
        raise HTTPException(status_code=403, detail="Access forbidden")
    
    # Filter by user_id
    return db.query(Task).filter(Task.user_id == user_id).all()
```

---

## Next Steps

1. **Execute Phase 0**: Generate `research.md` with all technology decisions
2. **Execute Phase 1**: Generate `data-model.md`, `contracts/rest-api.md`, `quickstart.md`
3. **Update Agent Context**: Run update-agent-context.ps1
4. **Re-check Constitution**: Verify Phase 1 design compliance
5. **Execute Phase 2**: Run `/sp.tasks` to generate task breakdown
6. **Report Completion**: Document branch, plan path, and generated artifacts

**Command Ends Here**: Phase II planning complete. Implementation deferred to code generation phase.
