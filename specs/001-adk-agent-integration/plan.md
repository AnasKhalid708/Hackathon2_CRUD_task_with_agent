# Implementation Plan: ADK Agent Task Management Integration

**Branch**: `001-adk-agent-integration` | **Date**: 2026-01-24 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/001-adk-agent-integration/spec.md`

**Note**: This template is filled in by the `/sp.plan` command. See `.specify/templates/commands/plan.md` for the execution workflow.

## Summary

Enable natural language task management through Google ADK agent integration. The feature allows users to create, retrieve, update, and delete tasks through conversational AI interface using the Google ADK framework. Backend code already exists in `src/agent.py` and `src/routes/agent.py`. This plan focuses on dependency installation, testing, bug fixes, and documentation to make the agent fully operational within the existing Phase II full-stack application.

## Technical Context

**Language/Version**: Python 3.12.4 (EXACT - project requirement)  
**Primary Dependencies**: 
  - FastAPI 0.109.0+ (existing web framework)
  - google-genai 0.3.0+ (Gemini AI SDK - NEEDS INSTALLATION)
  - google-adk 0.1.0+ (ADK Agent framework - NEEDS INSTALLATION)
  - SQLModel 0.0.14+ (existing ORM)
  - PyJWT 2.8.0+ (existing auth)
  
**Storage**: PostgreSQL (Neon serverless) - already configured  
**Testing**: pytest (existing framework) - NEEDS TEST COVERAGE for agent endpoints  
**Target Platform**: Web application backend (FastAPI server)  
**Project Type**: Web (backend + frontend split architecture)  
**Performance Goals**: 
  - Agent response time <10 seconds per request
  - Support 100 concurrent agent sessions
  - Conversation history limited to 20 messages per user
  
**Constraints**: 
  - Must integrate with existing JWT authentication
  - Must maintain user isolation (no cross-user data access)
  - Must use existing Task model and database schema
  - GOOGLE_API_KEY required in environment
  - Response time <15 seconds per agent interaction
  
**Scale/Scope**: 
  - 4 CRUD tools (create, retrieve, update, delete)
  - 3 agent endpoints (/chat, /clear-history, /status)
  - 20 message conversation history per user
  - Integration with existing Phase II codebase (~2000 LOC)

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

### Alignment with Master Constitution

✅ **Spec-Driven Development**: This plan follows spec-first approach with pre-written spec.md and acceptance criteria  
✅ **Phase Execution**: This feature belongs to Phase III (AI-Powered Todo Chatbot) per constitution section 2  
✅ **Phase Prerequisites**: Phase II is COMPLETE (authentication, CRUD, database persistence all working)  
✅ **Documentation Discipline**: Using single spec directory structure under specs/001-adk-agent-integration/  
✅ **Approved Tooling**: Using Google ADK and google-genai as specified in constitution section 6  
✅ **No Prohibited Frameworks**: Not using LangChain or other unapproved abstractions  
✅ **Code Generation Principle**: Backend code pre-generated from spec, this plan focuses on integration and testing  

### Phase III Addendum Compliance

✅ **Natural Language Interaction**: Core feature requirement aligns with Phase III charter  
✅ **Builds on Phase II**: Leverages existing authentication, database, and CRUD endpoints  
✅ **Agent Architecture**: Follows official Google ADK agent patterns (LlmAgent with tools)  
✅ **Progressive Enhancement**: Adds conversational layer without modifying Phase II core functionality  

### Constitution Gate Result: **PASS** ✅

No violations detected. Feature correctly positioned in Phase III, follows approved architecture, and maintains backward compatibility with Phase II.

## Project Structure

### Documentation (this feature)

```text
specs/001-adk-agent-integration/
├── spec.md              # Feature specification (COMPLETE)
├── plan.md              # This file (in progress)
├── research.md          # Phase 0 output - dependency analysis, integration patterns
├── data-model.md        # Phase 1 output - conversation history, agent request/response models
├── quickstart.md        # Phase 1 output - agent setup, testing guide
├── contracts/           # Phase 1 output - OpenAPI specs for agent endpoints
│   ├── agent-chat.yaml
│   ├── agent-status.yaml
│   └── conversation-history.yaml
└── tasks.md             # Phase 2 output (/sp.tasks command - NOT created by /sp.plan)
```

### Source Code (repository root)

```text
backend/
├── src/
│   ├── agent.py                    # ADK Agent implementation (EXISTING)
│   │                               # - LlmAgent with gemini-2.0-flash-exp
│   │                               # - CRUD tool functions
│   │                               # - Conversation history management
│   ├── routes/
│   │   ├── agent.py                # Agent API endpoints (EXISTING)
│   │   │                           # - POST /api/agent/chat
│   │   │                           # - POST /api/agent/clear-history
│   │   │                           # - GET /api/agent/status
│   │   ├── auth.py                 # Authentication (Phase II)
│   │   ├── tasks.py                # Task CRUD (Phase II)
│   │   └── users.py                # User management (Phase II)
│   ├── models/
│   │   └── task.py                 # Task model (Phase II - reused by agent)
│   ├── middleware/
│   │   └── jwt_auth.py             # JWT validation (Phase II - reused by agent)
│   ├── database.py                 # Database engine (Phase II)
│   ├── config.py                   # Settings with GOOGLE_API_KEY (Phase II)
│   └── main.py                     # FastAPI app (needs agent router registration)
├── requirements.txt                # Dependencies (needs google-genai, google-adk)
└── tests/                          # NEEDS CREATION
    ├── test_agent_tools.py         # Unit tests for CRUD tools
    ├── test_agent_routes.py        # Integration tests for agent endpoints
    └── test_agent_security.py      # Security tests for user isolation

frontend/
├── src/
│   ├── app/
│   │   └── agent/                  # FUTURE: Agent chat UI (Phase III bonus)
│   └── services/
│       └── agent.ts                # FUTURE: Agent API client (Phase III bonus)

src/                                # Phase I console app (legacy)
```

**Structure Decision**: Using Option 2 (Web application) architecture. The agent feature integrates into existing Phase II backend structure under `backend/src/`. Agent code already exists but requires dependency installation, route registration in main.py, and comprehensive testing. Frontend integration deferred as bonus feature. This maintains clean separation between Phase II (REST API) and Phase III (Agent AI) while enabling progressive enhancement.

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

**Status**: No violations detected. Constitution Check passed with no complexity concerns.

The feature follows standard Phase III architecture with:
- Single agent implementation using approved Google ADK
- Reuse of existing Phase II models and authentication
- Standard FastAPI routing patterns
- No additional architectural layers beyond agent wrapper
