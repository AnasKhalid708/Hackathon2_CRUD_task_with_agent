# CopilotKit Integration - Implementation Tasks

## Phase 1: Frontend Setup (1-2 hours)

### Task 1.1: Install Dependencies
```bash
cd frontend
npm install @copilotkit/react-core @copilotkit/react-ui
```

### Task 1.2: Create CopilotKit Provider Component
**File**: `frontend/src/components/CopilotProvider.tsx`
- Wrap application with `<CopilotKit>`
- Configure custom runtime endpoint
- Inject user_id from AuthContext

### Task 1.3: Add Chat Popup to Tasks Page
**File**: `frontend/src/app/tasks/page.tsx`
- Import `<CopilotPopup>` from `@copilotkit/react-ui`
- Add floating button to trigger chat
- Style with existing Tailwind theme

### Task 1.4: Create Custom Backend Adapter
**File**: `frontend/src/lib/copilotkit-adapter.ts`
- Create function to call `/api/agent/chat`
- Transform request format
- Handle authentication token
- Transform response format

## Phase 2: Backend Integration (1 hour)

### Task 2.1: Create CopilotKit Adapter Module
**File**: `backend/src/copilotkit/adapter.py`
- Create `CopilotKitAdapter` class
- Implement request transformation
- Implement response transformation
- Add error handling

### Task 2.2: Create CopilotKit Endpoint (Optional)
**File**: `backend/src/routes/copilotkit.py`
- Add `POST /api/copilotkit/chat` endpoint
- Use CopilotKit adapter
- Forward to existing agent logic
- OR: Modify existing `/api/agent/chat` to support both formats

### Task 2.3: Update Agent Response Format
**File**: `backend/src/routes/agent.py`
- Ensure response includes proper structure for CopilotKit
- Add support for streaming responses (optional)
- Include tool call information

## Phase 3: Testing & Polish (1 hour)

### Task 3.1: Manual Testing
- [ ] Test login → open chat → send message
- [ ] Test user context (user_id) injection
- [ ] Test task creation via chat
- [ ] Test task retrieval via chat
- [ ] Test task update via chat
- [ ] Test task deletion via chat
- [ ] Test conversation history
- [ ] Test error handling

### Task 3.2: Error Handling
- [ ] Network failure toast
- [ ] Authentication error handling
- [ ] Agent error display
- [ ] Loading states

### Task 3.3: UI/UX Polish
- [ ] Style chat interface to match app theme
- [ ] Add animations for popup
- [ ] Test responsive design
- [ ] Add keyboard shortcuts (ESC to close)

## Implementation Example Code

### Frontend: CopilotProvider Setup

```typescript
// components/CopilotProvider.tsx
'use client';

import { CopilotKit } from '@copilotkit/react-core';
import { useAuth } from '@/contexts/AuthContext';

export function CopilotProvider({ children }: { children: React.Node }) {
  const { user, token } = useAuth();
  
  return (
    <CopilotKit
      runtimeUrl="/api/agent/chat"
      headers={{
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }}
      properties={{
        user_id: user?.id
      }}
    >
      {children}
    </CopilotKit>
  );
}
```

### Frontend: Chat Popup Usage

```typescript
// app/tasks/page.tsx
import { CopilotPopup } from '@copilotkit/react-ui';
import '@copilotkit/react-ui/styles.css';

export default function TasksPage() {
  return (
    <div>
      {/* Your existing tasks page content */}
      <CopilotPopup
        labels={{
          title: "Task Assistant",
          initial: "How can I help you with your tasks?",
          placeholder: "Ask me anything..."
        }}
      />
    </div>
  );
}
```

### Backend: CopilotKit Adapter

```python
# backend/src/copilotkit/adapter.py
from typing import Dict, Any
from src.routes.agent import chat_with_agent

class CopilotKitAdapter:
    """Adapts CopilotKit requests to internal agent format."""
    
    @staticmethod
    def transform_request(copilot_request: Dict[str, Any]) -> Dict[str, Any]:
        """Transform CopilotKit request to AgentRequest format."""
        return {
            "message": copilot_request.get("message", ""),
            "user_id": copilot_request.get("properties", {}).get("user_id"),
            "chat_history": copilot_request.get("messages", [])
        }
    
    @staticmethod
    def transform_response(agent_response: Dict[str, Any]) -> Dict[str, Any]:
        """Transform AgentResponse to CopilotKit format."""
        return {
            "text": agent_response.get("response", ""),
            "toolCalls": agent_response.get("tool_calls", [])
        }
```

## Estimated Timeline

- **Frontend Setup**: 1-2 hours
- **Backend Integration**: 1 hour  
- **Testing & Polish**: 1 hour
- **Total**: 3-4 hours

## Dependencies

**Frontend**:
- @copilotkit/react-core: ^1.0.0
- @copilotkit/react-ui: ^1.0.0

**Backend**:
- No new dependencies (uses existing FastAPI setup)

## Documentation

Full specification available in:
- `specs/001-copilotkit-chat-integration/spec.md`
- `specs/001-copilotkit-chat-integration/plan.md`

## Success Criteria

✅ User can click chat button on tasks page
✅ Chat interface opens as popup
✅ User can send messages to AI agent
✅ Agent responds with relevant task information
✅ User_id is automatically injected from auth context
✅ Conversation history is maintained
✅ Error messages display clearly
✅ Chat interface matches app theme

## Notes

- CopilotKit provides the UI components - no need to build custom chat interface
- Existing `/api/agent/chat` endpoint can be reused with minimal modifications
- Agent tools are fully functional and tested
- Focus on integration layer between CopilotKit and existing agent

## Quick Start Command

```bash
# Frontend
cd frontend
npm install @copilotkit/react-core @copilotkit/react-ui

# No backend dependencies needed - uses existing setup
```

Ready to implement! 🚀
