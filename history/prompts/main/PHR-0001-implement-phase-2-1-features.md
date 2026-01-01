---
id: PHR-0001
title: Implement Phase 2.1 Features
stage: green
feature: main
date: 2026-01-01
status: completed
---

# Prompt History Record: Implement Phase 2.1 Features

## Prompt

Implement the new Phase 2.1 features that were just added to the specification.

**Context:**
- Backend is currently running and working perfectly
- Database migrations already exist (users and tasks tables)
- Specification updated to version 2.1.0 in specs/main/spec-phase2.md

**New Features to Implement:**

### 1. Task Deadline Feature
**Backend:**
- Add `deadline` field to Task model (Optional[datetime])
- Create new Alembic migration to add deadline column to tasks table
- Update TaskCreate and TaskUpdate schemas to accept deadline
- Update task endpoints to handle deadline field
- Add filtering by: overdue, upcoming, no-deadline
- Add sorting by deadline

**Database Migration:**
- Create migration 003_add_task_deadline.py
- Add column: deadline TIMESTAMP NULL
- Add index on deadline for performance

### 2. Deadline Reminders/Notifications
**Backend:**
- GET /api/users/{user_id}/tasks/upcoming - Tasks due in next 24h
- GET /api/users/{user_id}/tasks/overdue - Overdue incomplete tasks  
- GET /api/users/{user_id}/tasks/stats - Statistics (total, completed, overdue, due_today, upcoming)

### 3. User Profile Management
**Backend:**
- GET /api/users/{user_id}/profile - Get user profile
- PUT /api/users/{user_id}/profile - Update email (requires current password)
- PUT /api/users/{user_id}/password - Change password (requires current password)
- DELETE /api/users/{user_id} - Delete account (with password confirmation)

**Frontend:**
- Update TaskForm to include deadline picker
- Add deadline display in TaskItem component
- Add deadline filters (overdue, upcoming, no deadline)
- Create /profile page with email update, password change, and account deletion
- Add visual indicators for overdue tasks
- Add deadline display in local timezone

## Response

Successfully implemented all Phase 2.1 features:

### Backend Changes

1. **Database Migration (003_add_task_deadline.py)**
   - Added `deadline TIMESTAMP NULL` column to tasks table
   - Created index `idx_tasks_deadline` for query performance
   - Migration executed successfully

2. **Task Model Updates (backend/src/models/task.py)**
   - Added `deadline: Optional[datetime]` field to Task model
   - Updated TaskCreate schema to accept optional deadline
   - Updated TaskUpdate schema to accept optional deadline (can be set to null)
   - Updated TaskRead schema to include deadline in responses

3. **Task Routes Updates (backend/src/routes/tasks.py)**
   - Updated list_tasks endpoint:
     - Added filter options: overdue, upcoming, no-deadline
     - Added sort options: deadline_asc, deadline_desc
     - Implemented deadline filtering logic (overdue: deadline < now AND completed = false)
     - Implemented upcoming filtering (deadline within next 24 hours)
   - Updated create_task endpoint to accept deadline
   - Updated update_task endpoint to handle deadline changes
   - Added three new endpoints:
     - GET /api/users/{user_id}/tasks/upcoming
     - GET /api/users/{user_id}/tasks/overdue
     - GET /api/users/{user_id}/tasks/stats

4. **User Profile Routes (backend/src/routes/users.py)** - NEW FILE
   - Created complete user profile management system
   - GET /api/users/{user_id}/profile - Returns user profile
   - PUT /api/users/{user_id}/profile - Updates email with password verification
   - PUT /api/users/{user_id}/password - Changes password with validation
   - DELETE /api/users/{user_id} - Deletes account with password confirmation
   - All endpoints enforce user ownership validation

5. **Main Application Updates (backend/src/main.py)**
   - Registered users_router
   - Updated API version to 2.1.0

### Frontend Changes

1. **Type Definitions (frontend/src/types/task.ts)**
   - Added `deadline: string | null` to Task interface
   - Updated TaskCreate and TaskUpdate to include optional deadline
   - Added TaskStatsResponse interface
   - Expanded FilterType to include: overdue, upcoming, no-deadline
   - Expanded SortType to include: deadline_asc, deadline_desc

2. **API Client (frontend/src/lib/api.ts)**
   - Added getUpcomingTasks method
   - Added getOverdueTasks method
   - Added getTaskStats method
   - Added getProfile method
   - Added updateProfile method
   - Added changePassword method
   - Added deleteAccount method

3. **DateTime Utilities (frontend/src/lib/datetime.ts)** - NEW FILE
   - formatDateTime: Formats deadline in user's local timezone
   - formatDate: Formats date only
   - isOverdue: Checks if task is overdue
   - isUpcoming: Checks if task is due within 24 hours
   - toISOString: Converts date to ISO string

4. **TaskForm Component (frontend/src/components/TaskForm.tsx)**
   - Added deadline picker (datetime-local input)
   - Added clear deadline button
   - Converts local datetime to UTC ISO string for API
   - Handles existing deadline when editing

5. **TaskItem Component (frontend/src/components/TaskItem.tsx)**
   - Added deadline display with formatting
   - Visual indicators:
     - Red left border for overdue tasks
     - Yellow left border for upcoming tasks
     - Colored badges (red for overdue, yellow for upcoming, gray for normal)
   - Shows deadline with emoji indicators (🔴 overdue, ⚠️ due soon, 📅 normal)

6. **Tasks Page (frontend/src/app/tasks/page.tsx)**
   - Added new filter options: Overdue, Due Soon (24h), No Deadline
   - Added new sort options: Deadline (Earliest), Deadline (Latest)
   - Added Profile link to header navigation

7. **Profile Page (frontend/src/app/profile/page.tsx)** - NEW FILE
   - Complete profile management interface
   - Email update form with password verification
   - Password change form with confirmation
   - Account deletion section with confirmation dialog
   - Form validation and error handling
   - Success/error message display
   - Back to Tasks navigation

### Testing & Validation

- Backend imports successfully: ✓
- API version updated to 2.1.0: ✓
- Database migration executed: ✓
- All new routes registered: ✓
- Type definitions updated: ✓
- Deadline filtering logic implemented: ✓
- Visual indicators for overdue tasks: ✓
- Profile management complete: ✓

### Implementation Quality

- Maintained existing code patterns
- Followed specification exactly
- All endpoints require JWT authentication
- Multi-user isolation enforced
- Password verification for sensitive operations
- Proper error handling throughout
- Responsive UI design maintained
- TypeScript strict mode compliance

## Files Changed

### Backend
- `backend/alembic/versions/003_add_task_deadline.py` - CREATED
- `backend/src/models/task.py` - MODIFIED
- `backend/src/routes/tasks.py` - MODIFIED
- `backend/src/routes/users.py` - CREATED
- `backend/src/routes/__init__.py` - MODIFIED
- `backend/src/main.py` - MODIFIED

### Frontend
- `frontend/src/types/task.ts` - MODIFIED
- `frontend/src/lib/api.ts` - MODIFIED
- `frontend/src/lib/datetime.ts` - CREATED
- `frontend/src/components/TaskForm.tsx` - MODIFIED
- `frontend/src/components/TaskItem.tsx` - MODIFIED
- `frontend/src/app/tasks/page.tsx` - MODIFIED
- `frontend/src/app/profile/page.tsx` - CREATED

## Status

**SUCCEEDED** - All Phase 2.1 features implemented successfully.
