---
id: PHR-20260101-210809
title: Phase II Full-Stack Planning
stage: plan
date: 2026-01-01T16:00:27.196Z
surface: Copilot CLI
model: claude-sonnet-4
feature: main
branch: main
user: System
command: Phase II Planning Request
labels: [phase-ii, full-stack, planning, spec-driven]
links:
  spec: specs/main/plan.md
  ticket: N/A
  adr: N/A
  pr: N/A
files:
  - path: specs/main/plan.md
    status: updated
    lines_changed: 650+
  - path: specs/main/research.md
    status: updated
    lines_changed: 400+
tests: []
---

## Prompt

# Phase II Planning Request: Todo Full-Stack Web Application

## Constitutional Context
Operating under the "Evolution of Todo – 5-Phase Hackathon" Master Constitution.
This plan applies ONLY to Phase II.

## Phase Definition
**Phase II Name:** Todo Full-Stack Web Application  
**Python Version:** Python 3.12.4 (backend)  
**Primary Objective:** Design a complete, spec-driven plan to build a multi-user full-stack Todo web application with persistent storage (Neon PostgreSQL) and JWT-based authentication (Better Auth).

## Strict Phase II Scope

### MUST Include (Basic Level Features):
1. Add Task (with user ownership)
2. Delete Task (user's own tasks only)
3. Update Task (user's own tasks only)
4. View Task List (user's own tasks only)
5. Mark Task as Complete / Incomplete
6. User Authentication (signup/signin) using Better Auth + JWT
7. Task filtering, sorting, and search in frontend
8. Multi-user isolation: users can only access their own tasks
9. RESTful API endpoints

### Explicit Constraints:
- Persistent storage MUST use Neon Serverless PostgreSQL
- Environment variable `JWT_AUTH` for JWT signing secret
- JWT token validation, expiry, and unauthorized handling enforced
- Frontend: Next.js 14 (App Router), Tailwind CSS, TypeScript
- Backend: Python FastAPI, SQLModel ORM
- Monorepo structure with `/frontend` and `/backend` folders
- Copilot.md files in both frontend and backend for code generation guidelines
- NO manual code editing - Spec-Driven Development only

[... full prompt details as provided by user ...]

## Response snapshot

**Phase II Implementation Plan Generated Successfully**

### Completed Artifacts

1. **specs/main/plan.md** - Comprehensive Phase II implementation plan containing:
   - Technical Context (Python 3.12.4 backend, Next.js 14 frontend, Neon PostgreSQL)
   - Constitution Check (all gates passed)
   - Complete monorepo project structure (frontend/ + backend/ with full file tree)
   - Phase 0: Research tasks (5 research areas identified)
   - Phase 1: Design specifications (data models, API contracts, quickstart)
   - Phase 2: Task breakdown strategy (deferred to /sp.tasks)
   - Architecture flow diagram (Frontend ↔ Backend ↔ Database)
   - Security patterns (JWT validation, multi-user isolation)
   - Phase II completion checklist (30+ criteria)

2. **specs/main/research.md** - Updated for Phase II with complete technology research:
   - R1: Better Auth + JWT Integration with FastAPI (custom JWT pattern)
   - R2: Neon PostgreSQL + SQLModel ORM Setup (connection config, migration workflow)
   - R3: Next.js 14 App Router + Better Auth Client (auth context, protected routes)
   - R4: Multi-User Isolation at Database Level (service layer validation pattern)
   - R5: Monorepo Development Workflow (startup scripts, CORS, environment variables)
   - Dependencies summary (backend requirements.txt, frontend package.json)
   - All code patterns and implementation strategies documented

### Key Decisions

**Authentication**: Custom JWT with Better Auth patterns (PyJWT library, localStorage token storage)
**Database**: Neon Serverless PostgreSQL with SQLModel ORM (type-safe, Alembic migrations)
**Frontend**: Next.js 14 App Router (server components + client components for auth)
**Security**: Service layer validation with user_id filtering on all queries
**Structure**: Simple monorepo (frontend/ + backend/ directories)

### Data Models

**User Entity**:
- id (UUID), email (unique), hashed_password (bcrypt), timestamps

**Task Entity**:
- id (UUID), user_id (foreign key), title, description, completed, timestamps
- Index on user_id for performance
- All queries filtered by authenticated user_id

### API Endpoints (6 total)

**Auth**: POST /auth/signup, POST /auth/signin, POST /auth/signout
**Tasks**: GET/POST/PUT/DELETE /users/{user_id}/tasks, PATCH /users/{user_id}/tasks/{task_id}/complete
All task endpoints require JWT validation and enforce user ownership

### Project Structure

```
hackathon-todo/
├── frontend/           # Next.js 14 with Copilot.md
│   ├── src/
│   │   ├── app/       # Pages (signup, signin, tasks)
│   │   ├── components/ # Auth, Task components
│   │   ├── lib/       # API client, auth context
│   │   └── types/     # TypeScript types
├── backend/           # FastAPI with Copilot.md
│   ├── src/
│   │   ├── models/    # User, Task (SQLModel)
│   │   ├── routes/    # Auth, Task routes
│   │   ├── middleware/ # JWT validation
│   │   ├── services/  # Business logic with user isolation
│   │   └── utils/     # JWT, password hashing
│   └── alembic/       # Database migrations
└── specs/main/        # All Phase II specifications
```

### Phase II Completion Criteria

**Planning Phase**: ✅ Complete (plan.md, research.md created)
**Phase 0 Research**: ✅ Complete (all 5 research tasks documented)
**Phase 1 Design**: ⏳ Next (data-model.md, contracts/, quickstart.md)
**Phase 2 Tasks**: ⏳ Deferred to /sp.tasks command
**Implementation**: ⏳ Future (Copilot CLI code generation)
**Validation**: ⏳ Future (manual testing checklist)

## Outcome

- ✅ Impact: Phase II implementation plan fully specified and ready for execution
- 🧪 Tests: Manual testing checklist defined (30+ validation criteria)
- 📁 Files: 2 specification files created/updated (plan.md, research.md)
- 🔁 Next prompts: Execute Phase 1 design (data-model.md, contracts/, quickstart.md), then update agent context
- 🧠 Reflection: Plan successfully transitions Phase I (in-memory console) to Phase II (full-stack web) while maintaining constitutional compliance. All technical decisions documented with rationale, alternatives, and implementation patterns. Ready for Copilot CLI code generation.

## Evaluation notes (flywheel)

- Failure modes observed: None - plan executed successfully
- Graders run and results (PASS/FAIL): N/A (planning phase)
- Prompt variant (if applicable): Standard /sp.plan workflow with Phase II context
- Next experiment (smallest change to try): Execute Phase 1 design artifacts, validate against Constitution gates
