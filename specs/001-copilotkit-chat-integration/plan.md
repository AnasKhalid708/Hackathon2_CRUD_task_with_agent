# Implementation Plan: CopilotKit Chat Integration

**Branch**: `001-copilotkit-chat-integration` | **Date**: 2026-01-24 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/001-copilotkit-chat-integration/spec.md`

**Note**: This template is filled in by the `/sp.plan` command. See `.specify/templates/commands/plan.md` for the execution workflow.

## Summary

This feature integrates CopilotKit's chat interface with the existing ADK agent backend to provide an in-page AI assistant for task management. The implementation will use @copilotkit/react-core and @copilotkit/react-ui packages, create a custom FastAPI adapter to connect to the existing /api/agent/chat endpoint, automatically inject user_id from the AuthContext, and use Tailwind styling to match the existing design. Conversation history will be persisted in sessionStorage, and the chat will be accessible via a floating button on the tasks page.

## Technical Context

**Language/Version**: TypeScript 5.3.3 (frontend), Python 3.12.4 (backend adapter)  
**Primary Dependencies**: 
  - Frontend: @copilotkit/react-core, @copilotkit/react-ui, React 18.2, Next.js 14.0.4, Tailwind CSS 3.4
  - Backend: FastAPI 0.109+, existing Google ADK 1.15.0 integration  
**Storage**: SessionStorage for conversation persistence (client-side only)  
**Testing**: Existing test infrastructure (not specified, assumed to follow project standards)  
**Target Platform**: Web browsers (desktop and mobile responsive)  
**Project Type**: Web application (Next.js frontend + FastAPI backend)  
**Performance Goals**: 
  - Chat interface opens within 200ms
  - Agent responses displayed within 3 seconds under normal network conditions
  - Smooth scrolling for 50+ message history  
**Constraints**: 
  - Must reuse existing /api/agent/chat endpoint without backend changes
  - Must integrate with existing AuthContext (user.id and JWT token from localStorage)
  - Must match existing Tailwind theme (slate-900 backgrounds, primary/secondary colors)
  - No long-term persistence beyond browser session  
**Scale/Scope**: 
  - Single chat interface per user session
  - Support 50+ messages per conversation
  - No multi-device synchronization
  - Tasks page integration only (Phase III scope)

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

### Spec-Driven Development Compliance
✅ **PASS**: Feature has complete specification with acceptance criteria and constraints
✅ **PASS**: Implementation will be generated from approved spec, not manually coded
✅ **PASS**: Clear technical decisions documented for agent-based code generation

### Phase Execution Compliance
✅ **PASS**: Feature aligns with Phase III (AI-Powered Todo Chatbot) requirements
✅ **PASS**: Builds on completed Phase II infrastructure (full-stack web app with auth)
✅ **PASS**: Does not introduce Phase IV/V concepts (no Kubernetes, cloud-native features)

### Agentic Stack & Tooling Compliance
✅ **PASS**: Uses approved Google ADK (existing backend agent integration)
✅ **PASS**: CopilotKit is an approved UI framework for agent interaction
✅ **PASS**: No LangChain or unapproved frameworks introduced
✅ **PASS**: Follows existing FastAPI backend architecture patterns

### Documentation Rules Compliance
✅ **PASS**: Single spec file for feature (no unnecessary markdown proliferation)
✅ **PASS**: Updates existing documentation rather than duplicating
✅ **PASS**: Clear phase tracking (Phase III)

### Feature Evolution Compliance
✅ **PASS**: Natural-language interaction appropriate for Phase III
✅ **PASS**: Does not introduce Phase IV/V features prematurely
✅ **PASS**: Builds incrementally on existing CRUD and filtering capabilities

### Quality & Compliance
✅ **PASS**: Implementation will be deterministic and reproducible via spec
✅ **PASS**: Traceable back to spec via feature branch and documentation
✅ **PASS**: No ambiguities requiring manual intervention

**GATE STATUS**: ✅ ALL GATES PASSED - Proceed to Phase 0 research

## Project Structure

### Documentation (this feature)

```text
specs/001-copilotkit-chat-integration/
├── spec.md              # Feature specification (COMPLETE)
├── plan.md              # This file (/sp.plan command output)
├── research.md          # Phase 0 output (/sp.plan command)
├── data-model.md        # Phase 1 output (/sp.plan command)
├── quickstart.md        # Phase 1 output (/sp.plan command)
├── contracts/           # Phase 1 output (/sp.plan command)
│   └── copilotkit-adapter.yaml  # CopilotKit custom adapter contract
└── tasks.md             # Phase 2 output (/sp.tasks command - NOT created by /sp.plan)
```

### Source Code (repository root)

```text
# Web application structure (frontend + backend)
backend/
├── src/
│   ├── routes/
│   │   └── agent.py             # EXISTING: /api/agent/chat endpoint
│   ├── agent.py                  # EXISTING: ADK agent implementation
│   └── copilotkit/               # NEW: CopilotKit adapter
│       ├── __init__.py
│       ├── adapter.py            # Custom FastAPI CopilotKit adapter
│       └── config.py             # CopilotKit configuration
└── requirements.txt              # UPDATE: Add copilotkit dependencies

frontend/
├── src/
│   ├── components/
│   │   ├── copilot/              # NEW: CopilotKit components
│   │   │   ├── CopilotProvider.tsx   # CopilotKit provider wrapper
│   │   │   ├── ChatInterface.tsx     # Chat UI component
│   │   │   └── FloatingChatButton.tsx # Floating action button
│   │   └── [existing components]
│   ├── context/
│   │   └── AuthContext.tsx       # EXISTING: Auth state management
│   ├── lib/
│   │   ├── copilotkit-config.ts  # NEW: CopilotKit configuration
│   │   └── api.ts                # EXISTING: API client
│   ├── hooks/
│   │   └── useChatPersistence.ts # NEW: SessionStorage persistence hook
│   ├── app/
│   │   ├── tasks/
│   │   │   └── page.tsx          # UPDATE: Add floating chat button
│   │   └── layout.tsx            # UPDATE: Wrap with CopilotProvider
│   └── types/
│       └── copilot.ts            # NEW: CopilotKit type definitions
└── package.json                  # UPDATE: Add @copilotkit dependencies

tests/
├── frontend/
│   └── copilot/                  # NEW: CopilotKit integration tests
│       ├── chat-interface.test.tsx
│       └── user-context-injection.test.tsx
└── backend/
    └── copilotkit/               # NEW: Adapter tests
        └── test_adapter.py
```

**Structure Decision**: Web application structure selected. Feature adds new frontend components for CopilotKit integration and a custom backend adapter to bridge CopilotKit with existing ADK agent endpoint. Minimal changes to existing code - primarily additive with updates to package.json, tasks page, and app layout.

## Complexity Tracking

> **No constitution violations detected - this section intentionally left empty per template instructions**
