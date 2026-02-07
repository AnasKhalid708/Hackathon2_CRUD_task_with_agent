# Phase 0: Research & Technical Decisions
## Feature: CopilotKit Chat Integration

**Date**: 2026-01-24  
**Status**: Complete  
**Branch**: 001-copilotkit-chat-integration

## Research Tasks Completed

This document consolidates research findings for all technical unknowns identified during planning.

---

## 1. CopilotKit Architecture & Integration Patterns

### Decision: Use @copilotkit/react-core + @copilotkit/react-ui with Custom Adapter

**Rationale**:
- CopilotKit provides production-ready React components for chat interfaces
- Supports custom backend adapters via `CopilotRuntime` API
- Allows complete control over backend integration without requiring CopilotKit Cloud
- React hooks-based architecture integrates seamlessly with existing Next.js app
- Built-in state management for conversation history reduces custom code

**Alternatives Considered**:
1. **Build custom chat UI from scratch**: Rejected - reinventing wheel, longer development time, more bugs
2. **Use LangChain ChatUI**: Rejected - violates constitution (no LangChain)
3. **Use generic chat libraries (react-chat-elements)**: Rejected - lacks AI-specific features like tool call visualization

**Implementation Pattern**:
```typescript
// Custom adapter structure
class FastAPIAgentAdapter extends CopilotAdapter {
  async processMessage(message: string, context: UserContext) {
    // Forward to existing /api/agent/chat endpoint
    // Inject user_id from context
    // Transform response to CopilotKit format
  }
}
```

**Dependencies**:
- `@copilotkit/react-core`: ^1.0.0
- `@copilotkit/react-ui`: ^1.0.0

---

## 2. Custom FastAPI Adapter Pattern

### Decision: Create Python-side CopilotKit-compatible middleware wrapper

**Rationale**:
- Existing `/api/agent/chat` endpoint must remain unchanged per constitution
- CopilotKit expects specific request/response format
- Adapter pattern allows decoupling CopilotKit from ADK agent implementation
- Enables future migration or multiple frontend chat interfaces

**Architecture**:
```python
# backend/src/copilotkit/adapter.py
class CopilotKitAdapter:
    """Adapts CopilotKit requests to ADK agent format"""
    
    def transform_request(self, copilot_request):
        # Extract message and user context
        # Format as AgentRequest for /api/agent/chat
        pass
    
    def transform_response(self, agent_response):
        # Convert AgentResponse to CopilotKit format
        # Include tool calls if present
        pass
```

**Alternatives Considered**:
1. **Modify existing agent.py directly**: Rejected - violates minimal changes principle, increases coupling
2. **Create new /api/copilot endpoint**: Rejected - duplicate logic, more maintenance
3. **Frontend-only transformation**: Rejected - mixing concerns, harder to test backend behavior

**Best Practices**:
- Use dependency injection for agent.py functions
- Comprehensive error handling and logging
- Type hints with Pydantic models
- Unit tests for request/response transformations

---

## 3. User Context Injection from AuthContext

### Decision: Automatic user_id extraction via custom React hook

**Rationale**:
- AuthContext already provides `user.id` and authentication state
- CopilotKit's `useCopilotContext` can be extended with custom metadata
- Prevents user error by making user_id injection transparent
- Maintains security by validating token on backend

**Implementation Pattern**:
```typescript
// hooks/useChatPersistence.ts
function useChatWithAuth() {
  const { user } = useAuth();
  const copilotContext = useCopilotContext();
  
  // Automatically inject user_id into all messages
  useEffect(() => {
    if (user?.id) {
      copilotContext.setMetadata({ user_id: user.id });
    }
  }, [user?.id]);
  
  return copilotContext;
}
```

**Alternatives Considered**:
1. **Manual user_id parameter on every message**: Rejected - error-prone, poor UX
2. **Global state management**: Rejected - overcomplicating, CopilotKit has built-in context
3. **Backend-only extraction from JWT**: Partially used - backend validates, frontend still sends for transparency

**Best Practices from React Context patterns**:
- Always check for null/undefined user before accessing id
- Show loading state while auth is initializing
- Redirect to login if user becomes unauthenticated mid-conversation

---

## 4. Tailwind Styling Integration

### Decision: Extend existing Tailwind theme with CopilotKit component overrides

**Rationale**:
- Project already uses Tailwind CSS 3.4 with custom theme
- Existing design uses slate-900 backgrounds with primary/secondary gradients
- CopilotKit components accept className props for styling
- Maintains visual consistency with tasks page

**Theme Mapping**:
```javascript
// Existing theme colors (from tailwind.config.js investigation)
- Background: slate-900 variants (bg-slate-900/50, bg-slate-900/80)
- Primary: gradient colors (primary, secondary)
- Borders: white/10, slate-800
- Text: slate-300, slate-400, white
- Interactive: primary with shadow effects
```

**CopilotKit Component Overrides**:
```typescript
<CopilotChat
  className="bg-slate-900/95 border-slate-800"
  messageClassName="bg-slate-800/50"
  inputClassName="bg-slate-900 border-slate-700"
/>
```

**Alternatives Considered**:
1. **Custom CSS modules**: Rejected - breaks Tailwind-first approach
2. **Inline styles**: Rejected - not maintainable, loses theme consistency
3. **Complete UI rebuild**: Rejected - unnecessary work, CopilotKit UI is production-ready

**Best Practices**:
- Use existing utility classes from project
- Match animation timing (framer-motion durations)
- Maintain responsive design patterns
- Test dark mode appearance (project appears dark-themed)

---

## 5. SessionStorage Persistence Strategy

### Decision: Custom React hook with JSON serialization

**Rationale**:
- SessionStorage survives page refreshes but clears on tab/browser close
- Aligns with out-of-scope constraint (no long-term persistence)
- Simple to implement and test
- No backend changes required

**Implementation**:
```typescript
// hooks/useChatPersistence.ts
const STORAGE_KEY = 'copilotkit_chat_history';

function useChatPersistence(userId: string) {
  const loadHistory = useCallback(() => {
    const stored = sessionStorage.getItem(`${STORAGE_KEY}_${userId}`);
    return stored ? JSON.parse(stored) : [];
  }, [userId]);
  
  const saveHistory = useCallback((messages: Message[]) => {
    sessionStorage.setItem(
      `${STORAGE_KEY}_${userId}`,
      JSON.stringify(messages)
    );
  }, [userId]);
  
  return { loadHistory, saveHistory };
}
```

**Alternatives Considered**:
1. **LocalStorage**: Rejected - persists beyond session (out of scope)
2. **IndexedDB**: Rejected - overengineered for session-only storage
3. **Backend storage**: Rejected - explicitly out of scope per spec
4. **No persistence**: Rejected - fails FR-015, FR-016 requirements

**Best Practices**:
- Namespace keys with user_id to prevent cross-user contamination
- Implement size limits (sessionStorage has 5-10MB limit)
- Handle JSON parse errors gracefully
- Clear on logout event

---

## 6. Floating Chat Button Placement

### Decision: Fixed position bottom-right with z-index above page content

**Rationale**:
- Standard UI pattern for chat interfaces (familiar to users)
- Tasks page has header at top, main content scrolls
- Bottom-right doesn't obstruct task list or filters
- Mobile responsive with adequate touch target size

**CSS Positioning**:
```css
.floating-chat-button {
  position: fixed;
  bottom: 2rem;
  right: 2rem;
  z-index: 50; /* Below header (z-40), above content */
}

@media (max-width: 640px) {
  .floating-chat-button {
    bottom: 1rem;
    right: 1rem;
  }
}
```

**Alternatives Considered**:
1. **Top-right near logout**: Rejected - crowded header area
2. **Bottom-left**: Rejected - less conventional for chat buttons
3. **Inline in task list**: Rejected - takes up content space
4. **Sidebar toggle**: Rejected - requires layout restructuring

**Accessibility Considerations**:
- Minimum 44x44px touch target (mobile)
- ARIA label: "Open AI chat assistant"
- Keyboard accessible (tab navigation)
- Focus visible on keyboard navigation

---

## 7. Error Handling & Toast Notifications

### Decision: Reuse existing toast notification system with typed error messages

**Rationale**:
- Project already has toast notification infrastructure (referenced in AuthContext error handling)
- Consistent error UX across application
- Meets FR-008 requirement for error display

**Error Scenarios to Handle**:
```typescript
enum ChatErrorType {
  NETWORK_FAILURE = 'network',
  AUTH_EXPIRED = 'auth',
  AGENT_ERROR = 'agent',
  RATE_LIMIT = 'rate_limit',
  VALIDATION = 'validation'
}

const errorMessages = {
  network: 'Connection lost. Check your internet and try again.',
  auth: 'Your session expired. Please log in again.',
  agent: 'The AI assistant encountered an error. Please try again.',
  rate_limit: 'Too many requests. Please wait a moment.',
  validation: 'Invalid message. Please check your input.'
};
```

**Alternatives Considered**:
1. **In-chat error messages**: Partially used - show in chat for context-specific errors
2. **Modal dialogs**: Rejected - too disruptive for transient errors
3. **Silent retry**: Rejected - users need feedback on failures

**Best Practices**:
- Actionable error messages (tell user what to do)
- Retry mechanism for transient failures
- Log errors to console for debugging
- Don't expose technical details to users

---

## 8. Performance Optimization

### Decision: Lazy load CopilotKit components, debounce auto-save, virtual scrolling for long histories

**Rationale**:
- CopilotKit adds ~200KB to bundle size
- Only users who open chat need the library loaded
- Auto-save on every message can cause storage thrashing
- 50+ message conversations need efficient rendering

**Optimization Techniques**:
```typescript
// Lazy load chat components
const ChatInterface = dynamic(
  () => import('@/components/copilot/ChatInterface'),
  { ssr: false, loading: () => <ChatLoadingSkeleton /> }
);

// Debounce sessionStorage writes
const debouncedSave = useDebouncedCallback(saveHistory, 1000);

// Virtual scrolling for message list
import { useVirtualizer } from '@tanstack/react-virtual';
```

**Performance Targets**:
- Initial page load: No impact (lazy loaded)
- Chat open time: <200ms (SC-009)
- Message render time: <16ms (60fps)
- Auto-save frequency: Max once per second

**Alternatives Considered**:
1. **Eager load everything**: Rejected - slows initial page load
2. **No virtual scrolling**: Acceptable if <50 messages, implement if performance degrades
3. **Web Workers for persistence**: Rejected - overengineered for sessionStorage

---

## 9. Testing Strategy

### Decision: Component tests for UI, integration tests for adapter, E2E for critical flows

**Rationale**:
- CopilotKit components are third-party (don't test internals)
- Custom logic (adapter, persistence) needs coverage
- Critical user flows need E2E validation

**Test Coverage Plan**:

**Component Tests** (Jest + React Testing Library):
- ChatInterface renders with correct styling
- FloatingChatButton opens/closes modal
- User messages display correctly
- Error states render appropriately

**Integration Tests**:
- Backend adapter transforms requests correctly
- user_id injection works as expected
- SessionStorage persistence save/load
- Auth expiration triggers re-login

**E2E Tests** (Playwright/Cypress):
- User can send message and receive response
- Conversation persists across page refresh
- Unauthenticated users redirected to login
- Error handling displays toast notifications

**Alternatives Considered**:
1. **Only E2E tests**: Rejected - slow, hard to debug failures
2. **Only unit tests**: Rejected - misses integration issues
3. **No tests**: Rejected - violates quality standards

---

## Summary of Technical Decisions

| Area | Decision | Key Dependencies |
|------|----------|------------------|
| Frontend Framework | @copilotkit/react-core + react-ui | CopilotKit 1.0+ |
| Backend Adapter | Custom Python middleware wrapper | Pydantic models |
| User Context | Auto-inject via React hook + AuthContext | Existing auth system |
| Styling | Tailwind with component overrides | Tailwind CSS 3.4 |
| Persistence | SessionStorage with custom hook | Browser APIs |
| UI Placement | Fixed bottom-right floating button | CSS positioning |
| Error Handling | Existing toast system + typed errors | Project toast lib |
| Performance | Lazy loading + debounced saves | React lazy, debounce |
| Testing | Component + Integration + E2E | Jest, Playwright |

---

## Risks & Mitigations

| Risk | Impact | Mitigation |
|------|--------|------------|
| CopilotKit API changes | High | Pin to specific version, monitor releases |
| SessionStorage size limits | Medium | Implement message pruning (keep last 50) |
| Backend adapter complexity | Medium | Comprehensive unit tests, clear separation |
| Performance with long conversations | Low | Virtual scrolling, lazy rendering |
| Auth token refresh during chat | Medium | Listen to auth events, prompt re-login |

---

## Next Steps (Phase 1)

1. Generate `data-model.md` with entity definitions
2. Create OpenAPI contract for CopilotKit adapter in `contracts/`
3. Document component interfaces and props
4. Generate `quickstart.md` for developer setup
5. Update agent context via `.specify/scripts/powershell/update-agent-context.ps1`

**Phase 0 Complete**: All technical unknowns resolved. Ready for Phase 1 design.
