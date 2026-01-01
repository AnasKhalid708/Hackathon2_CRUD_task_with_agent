# Feature Specification: Todo Full-Stack Web Application (Phase II)

**Version**: 2.1.0  
**Date**: 2026-01-01  
**Phase**: II - Full-Stack Web Application with Authentication  
**Spec Type**: Full-Stack (Frontend + Backend + Database)

---

## 1. PURPOSE

Build a multi-user full-stack Todo web application with JWT authentication, persistent storage (Neon PostgreSQL), RESTful API (FastAPI), and modern UI (Next.js 14). Users can sign up, sign in, and manage their own tasks with complete isolation from other users.

This is Phase II of the "Evolution of Todo – 5-Phase Hackathon" project, operating under the Master Constitution.

**Phase I Completed**: In-memory Python console application with CRUD operations.

---

## 2. SCOPE

### IN SCOPE (Phase II)

**Authentication:**
- User signup with email/password
- User signin with JWT token issuance
- JWT token validation on all API requests
- User signout (token invalidation)
- Multi-user isolation enforced

**Task Management:**
- Add Task (associated with logged-in user)
- Delete Task (user's own tasks only)
- Update Task (user's own tasks only)
- View Task List (user's own tasks only)
- Mark Task as Complete / Incomplete
- Task filtering (all/complete/incomplete/overdue/upcoming/no-deadline)
- Task sorting (creation date, title, completion status, deadline)
- Task search (by title/description)
- Task deadlines (optional field, add/update/remove)
- Task deadline reminders (upcoming tasks, overdue tasks)
- Task statistics (total, completed, overdue, due today)

**User Profile Management:**
- View user profile (email, account info)
- Update email (requires current password)
- Change password (requires current password)
- Delete account (requires password confirmation)

**Technical Requirements:**
- Persistent storage in Neon Serverless PostgreSQL
- RESTful API with FastAPI (Python 3.12.4)
- Frontend with Next.js 14 App Router, TypeScript, Tailwind CSS
- SQLModel ORM for type-safe database operations
- JWT_AUTH environment variable for token signing
- Monorepo structure (/frontend and /backend)

### OUT OF SCOPE (Future Phases)
- AI agents (Phase III)
- Voice input (Bonus features)
- Multi-language support (Bonus features)
- Real-time collaboration
- Kubernetes deployment (Phase IV)
- Cloud-native architecture (Phase V)
- Advanced analytics
- Task categories/tags
- Task priorities
- Email/SMS notifications for deadlines
- Calendar integration
- Recurring tasks

---

## 3. FUNCTIONAL REQUIREMENTS

### FR1: User Authentication

#### FR1.1: User Signup
**Description**: New users can create an account with email and password.

**Acceptance Criteria**:
- User provides email and password
- Email must be valid format and unique
- Password must be at least 8 characters
- Password is hashed using bcrypt before storage
- User ID is generated as UUID v4
- Success returns user object without password
- Duplicate email returns 400 Bad Request with clear error message

**API Endpoint**: `POST /api/auth/signup`

**Request Body**:
```json
{
  "email": "user@example.com",
  "password": "securepass123"
}
```

**Response (201 Created)**:
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "email": "user@example.com",
  "created_at": "2026-01-01T14:22:13.123456"
}
```

---

#### FR1.2: User Signin
**Description**: Registered users can sign in and receive JWT access token.

**Acceptance Criteria**:
- User provides email and password
- Email and password are validated against database
- Correct credentials generate JWT token signed with JWT_AUTH secret
- Token includes user_id in payload
- Token expires after 24 hours
- Invalid credentials return 401 Unauthorized
- Token is returned in response body

**API Endpoint**: `POST /api/auth/signin`

**Request Body**:
```json
{
  "email": "user@example.com",
  "password": "securepass123"
}
```

**Response (200 OK)**:
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "bearer",
  "expires_in": 86400,
  "user": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "email": "user@example.com"
  }
}
```

---

#### FR1.3: JWT Token Validation
**Description**: All protected API endpoints validate JWT token.

**Acceptance Criteria**:
- Token must be provided in Authorization header as "Bearer {token}"
- Token signature validated using JWT_AUTH secret
- Token expiry checked
- user_id extracted from token payload
- Missing token returns 401 Unauthorized
- Invalid token returns 401 Unauthorized
- Expired token returns 401 Unauthorized with "Token expired" message

**Header Format**:
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

---

#### FR1.4: User Signout
**Description**: Authenticated user can sign out and invalidate their JWT token.

**Acceptance Criteria**:
- User token is cleared from frontend storage
- Subsequent requests without token return 401 Unauthorized
- User is redirected to signin page

**API Endpoint**: `POST /api/auth/signout`

**Response (200 OK)**:
```json
{
  "message": "Successfully signed out"
}
```

---

### FR2: Task Management

#### FR2.1: Add Task
**Description**: Authenticated user can create a new task.

**Acceptance Criteria**:
- Task is associated with authenticated user (user_id from JWT)
- Task has unique UUID v4 identifier
- Task has title (required, non-empty, max 200 chars)
- Task has description (optional, max 1000 chars)
- Task has deadline (optional, datetime in ISO 8601 format)
- Task starts with `completed = False`
- Task has `created_at` and `updated_at` timestamps
- Success returns created task object
- Unauthenticated request returns 401 Unauthorized

**API Endpoint**: `POST /api/users/{user_id}/tasks`

**Security**: user_id in URL must match user_id from JWT token, else 403 Forbidden

**Request Body**:
```json
{
  "title": "Buy groceries",
  "description": "Milk, bread, eggs",
  "deadline": "2026-01-05T18:00:00Z"
}
```

**Note**: `deadline` is optional. Omit or set to `null` for tasks without deadlines.

**Response (201 Created)**:
```json
{
  "id": "7c9e6679-fe0c-425c-883b-1e1d3e8c9f12",
  "user_id": "550e8400-e29b-41d4-a716-446655440000",
  "title": "Buy groceries",
  "description": "Milk, bread, eggs",
  "completed": false,
  "deadline": "2026-01-05T18:00:00Z",
  "created_at": "2026-01-01T14:22:13.123456",
  "updated_at": "2026-01-01T14:22:13.123456"
}
```

---

#### FR2.2: List Tasks
**Description**: Authenticated user can view all their tasks with filtering, sorting, and search.

**Acceptance Criteria**:
- Returns only tasks belonging to authenticated user
- Supports query parameters: filter, sort, search
- Filter options: all (default), complete, incomplete, overdue, upcoming, no-deadline
  - `overdue`: Tasks with deadline in the past and not completed
  - `upcoming`: Tasks with deadline in next 24 hours
  - `no-deadline`: Tasks without a deadline set
- Sort options: created_asc, created_desc, title_asc, title_desc, status, deadline_asc, deadline_desc
- Search by title or description (case-insensitive partial match)
- Returns empty array if no tasks found
- Unauthenticated request returns 401 Unauthorized
- Attempting to view another user's tasks returns 403 Forbidden

**API Endpoint**: `GET /api/users/{user_id}/tasks`

**Query Parameters**:
- `filter`: all | complete | incomplete | overdue | upcoming | no-deadline (default: all)
- `sort`: created_asc | created_desc | title_asc | title_desc | status | deadline_asc | deadline_desc (default: created_desc)
- `search`: string (optional)

**Example Request**: `GET /api/users/{user_id}/tasks?filter=incomplete&sort=created_desc&search=grocery`

**Response (200 OK)**:
```json
{
  "tasks": [
    {
      "id": "7c9e6679-fe0c-425c-883b-1e1d3e8c9f12",
      "user_id": "550e8400-e29b-41d4-a716-446655440000",
      "title": "Buy groceries",
      "description": "Milk, bread, eggs",
      "completed": false,
      "deadline": "2026-01-05T18:00:00Z",
      "created_at": "2026-01-01T14:22:13.123456",
      "updated_at": "2026-01-01T14:22:13.123456"
    }
  ],
  "total": 1
}
```

---

#### FR2.3: Get Task Details
**Description**: Authenticated user can view details of a specific task.

**Acceptance Criteria**:
- Returns task details if task belongs to authenticated user
- Task not found returns 404 Not Found
- Task belongs to different user returns 403 Forbidden
- Unauthenticated request returns 401 Unauthorized

**API Endpoint**: `GET /api/users/{user_id}/tasks/{task_id}`

**Response (200 OK)**:
```json
{
  "id": "7c9e6679-fe0c-425c-883b-1e1d3e8c9f12",
  "user_id": "550e8400-e29b-41d4-a716-446655440000",
  "title": "Buy groceries",
  "description": "Milk, bread, eggs",
  "completed": false,
  "deadline": "2026-01-05T18:00:00Z",
  "created_at": "2026-01-01T14:22:13.123456",
  "updated_at": "2026-01-01T14:22:13.123456"
}
```

---

#### FR2.4: Update Task
**Description**: Authenticated user can update title and/or description of their task.

**Acceptance Criteria**:
- User can update title (optional, non-empty if provided)
- User can update description (optional)
- User can update deadline (optional, set to null to remove)
- At least one field must be provided
- Only task owner can update
- updated_at timestamp is refreshed
- Task not found returns 404 Not Found
- Task belongs to different user returns 403 Forbidden
- Unauthenticated request returns 401 Unauthorized

**API Endpoint**: `PUT /api/users/{user_id}/tasks/{task_id}`

**Request Body**:
```json
{
  "title": "Buy groceries and household items",
  "description": "Milk, bread, eggs, paper towels",
  "deadline": "2026-01-06T18:00:00Z"
}
```

**To remove deadline**:
```json
{
  "deadline": null
}
```

**Response (200 OK)**:
```json
{
  "id": "7c9e6679-fe0c-425c-883b-1e1d3e8c9f12",
  "user_id": "550e8400-e29b-41d4-a716-446655440000",
  "title": "Buy groceries and household items",
  "description": "Milk, bread, eggs, paper towels",
  "completed": false,
  "deadline": "2026-01-06T18:00:00Z",
  "created_at": "2026-01-01T14:22:13.123456",
  "updated_at": "2026-01-01T14:30:00.000000"
}
```

---

#### FR2.5: Delete Task
**Description**: Authenticated user can delete their task.

**Acceptance Criteria**:
- Only task owner can delete
- Task is permanently removed from database
- Task not found returns 404 Not Found
- Task belongs to different user returns 403 Forbidden
- Unauthenticated request returns 401 Unauthorized
- Success returns 204 No Content

**API Endpoint**: `DELETE /api/users/{user_id}/tasks/{task_id}`

**Response (204 No Content)**: Empty body

---

#### FR2.6: Toggle Task Completion
**Description**: Authenticated user can mark task as complete or incomplete.

**Acceptance Criteria**:
- Only task owner can toggle
- Completion status is flipped (true ↔ false)
- updated_at timestamp is refreshed
- Task not found returns 404 Not Found
- Task belongs to different user returns 403 Forbidden
- Unauthenticated request returns 401 Unauthorized

**API Endpoint**: `PATCH /api/users/{user_id}/tasks/{task_id}/complete`

**Response (200 OK)**:
```json
{
  "id": "7c9e6679-fe0c-425c-883b-1e1d3e8c9f12",
  "user_id": "550e8400-e29b-41d4-a716-446655440000",
  "title": "Buy groceries",
  "description": "Milk, bread, eggs",
  "completed": true,
  "deadline": "2026-01-05T18:00:00Z",
  "created_at": "2026-01-01T14:22:13.123456",
  "updated_at": "2026-01-01T14:35:00.000000"
}
```

---

#### FR2.7: Get Upcoming Tasks
**Description**: Authenticated user can retrieve tasks with deadlines in the next 24 hours.

**Acceptance Criteria**:
- Returns tasks belonging to authenticated user
- Only includes tasks with deadline within next 24 hours
- Includes both completed and incomplete tasks
- Sorted by deadline (earliest first)
- Returns empty array if no upcoming tasks
- Unauthenticated request returns 401 Unauthorized

**API Endpoint**: `GET /api/users/{user_id}/tasks/upcoming`

**Response (200 OK)**:
```json
{
  "tasks": [
    {
      "id": "7c9e6679-fe0c-425c-883b-1e1d3e8c9f12",
      "user_id": "550e8400-e29b-41d4-a716-446655440000",
      "title": "Submit report",
      "description": "Q4 financial report",
      "completed": false,
      "deadline": "2026-01-02T10:00:00Z",
      "created_at": "2026-01-01T14:22:13.123456",
      "updated_at": "2026-01-01T14:22:13.123456"
    }
  ],
  "count": 1
}
```

---

#### FR2.8: Get Overdue Tasks
**Description**: Authenticated user can retrieve incomplete tasks with past deadlines.

**Acceptance Criteria**:
- Returns tasks belonging to authenticated user
- Only includes tasks where deadline < current time AND completed = false
- Sorted by deadline (oldest first)
- Returns empty array if no overdue tasks
- Unauthenticated request returns 401 Unauthorized

**API Endpoint**: `GET /api/users/{user_id}/tasks/overdue`

**Response (200 OK)**:
```json
{
  "tasks": [
    {
      "id": "8d0f7780-gf1d-536d-b827-557766551111",
      "user_id": "550e8400-e29b-41d4-a716-446655440000",
      "title": "Pay bills",
      "description": "Electric and water bill",
      "completed": false,
      "deadline": "2025-12-31T23:59:00Z",
      "created_at": "2025-12-20T10:00:00.000000",
      "updated_at": "2025-12-20T10:00:00.000000"
    }
  ],
  "count": 1
}
```

---

#### FR2.9: Get Task Statistics
**Description**: Authenticated user can retrieve summary statistics about their tasks.

**Acceptance Criteria**:
- Returns task counts for authenticated user
- Includes: total tasks, completed tasks, overdue tasks, tasks due today
- Due today: deadline is today (same date, any time)
- Overdue: deadline < current time AND completed = false
- Unauthenticated request returns 401 Unauthorized

**API Endpoint**: `GET /api/users/{user_id}/tasks/stats`

**Response (200 OK)**:
```json
{
  "total": 25,
  "completed": 18,
  "incomplete": 7,
  "overdue": 2,
  "due_today": 3,
  "upcoming_24h": 5,
  "no_deadline": 4
}
```

---

### FR3: User Profile Management

#### FR3.1: Get User Profile
**Description**: Authenticated user can view their profile information.

**Acceptance Criteria**:
- Returns user profile for authenticated user
- Includes: id, email, created_at, updated_at
- Does not include hashed_password
- user_id in URL must match user_id from JWT token, else 403 Forbidden
- Unauthenticated request returns 401 Unauthorized

**API Endpoint**: `GET /api/users/{user_id}/profile`

**Response (200 OK)**:
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "email": "user@example.com",
  "created_at": "2026-01-01T10:00:00.000000",
  "updated_at": "2026-01-01T10:00:00.000000"
}
```

---

#### FR3.2: Update User Email
**Description**: Authenticated user can update their email address.

**Acceptance Criteria**:
- User provides new email and current password
- New email must be valid format and unique
- Current password must be correct
- Email is updated in database
- updated_at timestamp is refreshed
- user_id in URL must match user_id from JWT token, else 403 Forbidden
- Invalid password returns 401 Unauthorized with "Invalid password"
- Duplicate email returns 400 Bad Request with "Email already in use"
- Unauthenticated request returns 401 Unauthorized

**API Endpoint**: `PUT /api/users/{user_id}/profile`

**Request Body**:
```json
{
  "email": "newemail@example.com",
  "current_password": "securepass123"
}
```

**Response (200 OK)**:
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "email": "newemail@example.com",
  "created_at": "2026-01-01T10:00:00.000000",
  "updated_at": "2026-01-01T15:00:00.000000"
}
```

---

#### FR3.3: Change Password
**Description**: Authenticated user can change their password.

**Acceptance Criteria**:
- User provides current password and new password
- Current password must be correct
- New password must be at least 8 characters
- New password must be different from current password
- New password is hashed using bcrypt before storage
- updated_at timestamp is refreshed
- user_id in URL must match user_id from JWT token, else 403 Forbidden
- Invalid current password returns 401 Unauthorized with "Invalid password"
- Same password returns 400 Bad Request with "New password must be different"
- Unauthenticated request returns 401 Unauthorized

**API Endpoint**: `PUT /api/users/{user_id}/password`

**Request Body**:
```json
{
  "current_password": "securepass123",
  "new_password": "newsecurepass456"
}
```

**Response (200 OK)**:
```json
{
  "message": "Password updated successfully"
}
```

---

#### FR3.4: Delete User Account
**Description**: Authenticated user can permanently delete their account.

**Acceptance Criteria**:
- User provides password for confirmation
- Password must be correct
- User account is permanently deleted from database
- All user's tasks are deleted (CASCADE)
- user_id in URL must match user_id from JWT token, else 403 Forbidden
- Invalid password returns 401 Unauthorized with "Invalid password"
- Unauthenticated request returns 401 Unauthorized
- Success returns 204 No Content

**API Endpoint**: `DELETE /api/users/{user_id}`

**Request Body**:
```json
{
  "password": "securepass123"
}
```

**Response (204 No Content)**: Empty body

---

## 4. DATA MODEL

### User Entity

```python
class User(SQLModel, table=True):
    __tablename__ = "users"
    
    id: str = Field(default_factory=lambda: str(uuid4()), primary_key=True)
    email: str = Field(unique=True, index=True, max_length=255)
    hashed_password: str = Field(max_length=255)
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    
    # Relationship
    tasks: list["Task"] = Relationship(back_populates="user")
```

### Task Entity

```python
class Task(SQLModel, table=True):
    __tablename__ = "tasks"
    
    id: str = Field(default_factory=lambda: str(uuid4()), primary_key=True)
    user_id: str = Field(foreign_key="users.id", index=True)
    title: str = Field(max_length=200)
    description: str = Field(default="", max_length=1000)
    completed: bool = Field(default=False)
    deadline: Optional[datetime] = Field(default=None, nullable=True)
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    
    # Relationship
    user: User = Relationship(back_populates="tasks")
```

### Database Schema

**users** table:
- id (VARCHAR PRIMARY KEY)
- email (VARCHAR UNIQUE NOT NULL)
- hashed_password (VARCHAR NOT NULL)
- created_at (TIMESTAMP DEFAULT NOW())
- updated_at (TIMESTAMP DEFAULT NOW())

**tasks** table:
- id (VARCHAR PRIMARY KEY)
- user_id (VARCHAR NOT NULL REFERENCES users(id) ON DELETE CASCADE)
- title (VARCHAR(200) NOT NULL)
- description (VARCHAR(1000) DEFAULT '')
- completed (BOOLEAN DEFAULT FALSE)
- deadline (TIMESTAMP NULL)
- created_at (TIMESTAMP DEFAULT NOW())
- updated_at (TIMESTAMP DEFAULT NOW())

**Indexes**:
- users.email (UNIQUE)
- tasks.user_id (for faster user task queries)
- tasks.deadline (for deadline queries and sorting)

---

## 5. INTERFACE REQUIREMENTS

### Backend API

**Base URL**: `http://localhost:8000` (development)

**Authentication Endpoints**:
- `POST /api/auth/signup` - User registration
- `POST /api/auth/signin` - User login
- `POST /api/auth/signout` - User logout (optional)

**Task Endpoints** (all require JWT):
- `GET /api/users/{user_id}/tasks` - List tasks (with filtering, sorting, search)
- `POST /api/users/{user_id}/tasks` - Create task
- `GET /api/users/{user_id}/tasks/{task_id}` - Get task
- `PUT /api/users/{user_id}/tasks/{task_id}` - Update task
- `DELETE /api/users/{user_id}/tasks/{task_id}` - Delete task
- `PATCH /api/users/{user_id}/tasks/{task_id}/complete` - Toggle completion
- `GET /api/users/{user_id}/tasks/upcoming` - Get tasks due in next 24h
- `GET /api/users/{user_id}/tasks/overdue` - Get overdue incomplete tasks
- `GET /api/users/{user_id}/tasks/stats` - Get task statistics

**User Profile Endpoints** (all require JWT):
- `GET /api/users/{user_id}/profile` - Get user profile
- `PUT /api/users/{user_id}/profile` - Update email
- `PUT /api/users/{user_id}/password` - Change password
- `DELETE /api/users/{user_id}` - Delete account

**Error Responses**:

401 Unauthorized:
```json
{
  "detail": "Missing authorization header"
}
```

403 Forbidden:
```json
{
  "detail": "Access denied: not your task"
}
```

404 Not Found:
```json
{
  "detail": "Task not found"
}
```

400 Bad Request:
```json
{
  "detail": "Validation error: title cannot be empty"
}
```

---

### Frontend Pages

**Public Pages** (no authentication required):
- `/signup` - User registration form
- `/signin` - User login form

**Protected Pages** (require authentication):
- `/tasks` - Task list with filtering, sorting, search, deadline indicators
- `/tasks/new` - Add new task form (optional, can be modal)
- `/tasks/{id}` - Task detail view (optional)
- `/tasks/{id}/edit` - Edit task form (optional, can be modal)
- `/profile` - User profile management page
- `/dashboard` - Dashboard with task statistics and reminders (optional)

**Frontend Components**:
- AuthForm - Reusable signup/signin form
- TaskList - Display tasks with filters and deadline indicators
- TaskItem - Individual task card/row with deadline display and overdue indicator
- TaskForm - Add/edit task form with deadline picker
- TaskFilters - Filter by completion status and deadline status
- TaskSort - Sort dropdown including deadline options
- TaskSearch - Search input
- TaskStats - Dashboard showing task statistics and reminders
- NotificationBadge - Badge showing count of due/overdue tasks
- ProfileForm - User profile edit form
- PasswordChangeForm - Password change form
- DeleteAccountConfirm - Account deletion confirmation dialog
- ProtectedRoute - Wrapper for authenticated pages
- Header - Navigation with user info, notification badge, and logout

---

## 6. NON-FUNCTIONAL REQUIREMENTS

### NFR1: Security
- JWT tokens signed with JWT_AUTH environment variable secret
- Passwords hashed with bcrypt (cost factor 12)
- Multi-user isolation enforced at service layer
- All task queries filtered by authenticated user_id
- CORS configured for frontend domain only
- SQL injection prevented through SQLModel parameterized queries
- XSS prevention through React default escaping

### NFR2: Performance
- API response time <500ms p95
- Frontend initial page load <3s
- Database queries optimized with indexes
- Connection pooling for database (max 20 connections)
- JWT validation cached for request duration

### NFR3: Code Quality
- TypeScript strict mode enabled
- FastAPI with Pydantic validation
- SQLModel for type-safe database operations
- ESLint + Prettier for frontend
- Black + isort for backend
- No manual code editing (Spec-Driven Development)

### NFR4: User Experience
- Loading states for all async operations
- Error messages user-friendly and actionable
- Form validation with immediate feedback
- Responsive design (mobile-friendly)
- Accessible (WCAG 2.1 Level A minimum)
- Visual indicators for overdue tasks (e.g., red color/icon)
- Deadline display in user's local timezone
- Notification badges for due/overdue tasks
- Confirmation dialogs for destructive actions (delete account)

### NFR5: Development
- Monorepo structure (/frontend, /backend)
- Environment variables for configuration
- Copilot.md in each folder for code generation guidelines
- README with setup instructions
- Git ignored sensitive files (.env, __pycache__, node_modules)

---

## 7. VALIDATION & ACCEPTANCE

### Manual Verification Steps

#### Authentication Tests
1. User can sign up with valid email/password
2. Duplicate email returns error
3. User can sign in with correct credentials
4. Invalid credentials return 401 error
5. JWT token is stored in frontend
6. Token is attached to all API requests
7. Invalid token returns 401 error
8. User can sign out and token is cleared

#### Task CRUD Tests (Authenticated User)
1. User can add task with title only
2. User can add task with title and description
3. User can view their task list
4. User cannot view other users' tasks
5. User can update their task title
6. User can update their task description
7. User can delete their task
8. User cannot delete other users' tasks
9. User can toggle task completion
10. User cannot toggle other users' tasks

#### Frontend Feature Tests
1. Filter shows all/complete/incomplete/overdue/upcoming/no-deadline tasks correctly
2. Sort by creation date (asc/desc) works
3. Sort by title (asc/desc) works
4. Sort by completion status works
5. Sort by deadline (asc/desc) works
6. Search filters tasks by title/description
7. Add task form validates input (with optional deadline)
8. Update task form validates input (with optional deadline)
9. Delete confirmation dialog appears
10. Loading states display during operations
11. Error messages display on failures
12. Overdue tasks show visual indicator
13. Notification badge shows count of due/overdue tasks
14. Dashboard displays task statistics correctly

#### Multi-User Isolation Tests
1. User A cannot see User B's tasks
2. User A cannot update User B's tasks (403 error)
3. User A cannot delete User B's tasks (403 error)
4. User A cannot toggle User B's tasks (403 error)
5. User A cannot view User B's profile (403 error)
6. User A cannot update User B's profile (403 error)
7. User A cannot delete User B's account (403 error)

#### Deadline Feature Tests
1. User can create task without deadline
2. User can create task with deadline
3. User can update task to add deadline
4. User can update task to remove deadline (set to null)
5. Filter by overdue shows only incomplete tasks with past deadline
6. Filter by upcoming shows only tasks with deadline in next 24h
7. Filter by no-deadline shows only tasks without deadline
8. Sort by deadline (asc/desc) works correctly
9. Overdue tasks display visual indicator
10. Task statistics show correct counts (overdue, due today, upcoming)
11. Upcoming tasks endpoint returns correct tasks
12. Overdue tasks endpoint returns correct tasks

#### User Profile Tests
1. User can view their profile
2. User can update email with correct password
3. Email update with wrong password returns 401 error
4. Email update with duplicate email returns 400 error
5. User can change password with correct current password
6. Password change with wrong current password returns 401 error
7. Password change with same password returns 400 error
8. User can delete account with correct password
9. Account deletion with wrong password returns 401 error
10. Account deletion also deletes all user's tasks

### Phase II Completion Criteria

**Backend:**
- [ ] Database models (User, Task) implemented with SQLModel
- [ ] Task model includes optional deadline field
- [ ] Database migrations created with Alembic
- [ ] Neon PostgreSQL connection configured
- [ ] JWT authentication implemented (signup, signin, signout)
- [ ] JWT middleware validates all protected routes
- [ ] All task CRUD endpoints implemented
- [ ] Task deadline filtering (overdue, upcoming, no-deadline) implemented
- [ ] Task deadline sorting implemented
- [ ] Upcoming tasks endpoint implemented
- [ ] Overdue tasks endpoint implemented
- [ ] Task statistics endpoint implemented
- [ ] User profile endpoints implemented (get, update email, change password, delete account)
- [ ] User ownership validation enforced
- [ ] Password validation for profile operations
- [ ] Error handling returns proper HTTP status codes
- [ ] Password hashing with bcrypt

**Frontend:**
- [ ] Signup page with form validation
- [ ] Signin page with form validation
- [ ] Task list page with filtering (including deadline filters), sorting (including deadline), search
- [ ] Add task form/modal with optional deadline picker
- [ ] Update task form/modal with optional deadline picker
- [ ] Delete task confirmation dialog
- [ ] Toggle completion button
- [ ] Visual indicator for overdue tasks
- [ ] Notification badge showing due/overdue task count
- [ ] Dashboard/stats section showing task statistics
- [ ] Profile page with email update form
- [ ] Password change form
- [ ] Delete account confirmation dialog
- [ ] JWT token stored and attached to requests
- [ ] Protected routes redirect to signin
- [ ] Error handling with user-friendly messages
- [ ] Loading states for async operations
- [ ] Responsive design
- [ ] Deadline display in local timezone

**Integration:**
- [ ] User can complete full workflow: signup → signin → CRUD tasks with deadlines → manage profile → signout
- [ ] Multi-user isolation verified
- [ ] JWT expiry handled gracefully
- [ ] 401/403 errors handled correctly
- [ ] Deadline filtering and sorting work correctly
- [ ] Task statistics display accurate counts
- [ ] Profile update operations work correctly
- [ ] Account deletion removes user and all tasks
- [ ] All acceptance criteria passed

---

## 8. TECHNICAL CONSTRAINTS

### Backend Stack
- Python 3.12.4 (EXACT VERSION)
- FastAPI 0.109+
- SQLModel 0.0.14+
- Alembic 1.13+
- PyJWT 2.8+
- bcrypt 4.1+
- psycopg2-binary 2.9+
- uvicorn 0.27+

### Frontend Stack
- Node.js 20+
- Next.js 14 (App Router)
- React 18
- TypeScript 5+
- Tailwind CSS 3+
- Better Auth patterns (custom JWT client)

### Database
- Neon Serverless PostgreSQL (cloud-hosted)
- Connection string in DATABASE_URL environment variable
- Connection pooling enabled

### Environment Variables
**Backend (.env)**:
```
DATABASE_URL=postgresql://user:pass@host/db
JWT_AUTH=your-secret-key-min-32-chars
```

**Frontend (.env.local)**:
```
NEXT_PUBLIC_API_URL=http://localhost:8000
```

### Prohibited
- Manual code editing (Spec-Driven Development only)
- AI agents (Phase III feature)
- External authentication services (Firebase, Auth0)
- NoSQL databases
- GraphQL (use REST)

---

## 9. IMPLEMENTATION APPROACH

### Development Methodology
- Spec-Driven Development (SDD) using Spec-Kit Plus
- Implementation MUST be generated via Copilot CLI
- No manual code editing allowed
- If output is incorrect, refine spec and regenerate

### Workflow
1. Specifications are source of truth (this document)
2. Generate detailed implementation plan
3. Generate task breakdown
4. Create Copilot.md files for frontend and backend
5. Use Copilot CLI to generate code from specs
6. Validate against acceptance criteria
7. If issues found, update specs and regenerate

---

## 10. DELIVERABLES

### Required Files

**Backend:**
1. `/backend/src/main.py` - FastAPI entry point
2. `/backend/src/models/user.py` - User SQLModel
3. `/backend/src/models/task.py` - Task SQLModel (with deadline field)
4. `/backend/src/routes/auth.py` - Auth endpoints
5. `/backend/src/routes/tasks.py` - Task endpoints (including deadline queries)
6. `/backend/src/routes/users.py` - User profile endpoints
7. `/backend/src/middleware/jwt_auth.py` - JWT validation
8. `/backend/src/database.py` - DB connection
9. `/backend/src/config.py` - Settings
10. `/backend/alembic/versions/*.py` - Migrations
11. `/backend/requirements.txt` - Dependencies
12. `/backend/.env.example` - Env template
13. `/backend/Copilot.md` - Code generation guidelines

**Frontend:**
1. `/frontend/src/app/signup/page.tsx` - Signup page
2. `/frontend/src/app/signin/page.tsx` - Signin page
3. `/frontend/src/app/tasks/page.tsx` - Task list page with deadline features
4. `/frontend/src/app/profile/page.tsx` - User profile page
5. `/frontend/src/app/dashboard/page.tsx` - Dashboard with statistics (optional)
6. `/frontend/src/components/AuthForm.tsx` - Auth form component
7. `/frontend/src/components/TaskList.tsx` - Task list component
8. `/frontend/src/components/TaskItem.tsx` - Task item with deadline display
9. `/frontend/src/components/TaskForm.tsx` - Task form with deadline picker
10. `/frontend/src/components/TaskFilters.tsx` - Filter component (with deadline filters)
11. `/frontend/src/components/TaskStats.tsx` - Task statistics dashboard
12. `/frontend/src/components/NotificationBadge.tsx` - Notification badge
13. `/frontend/src/components/ProfileForm.tsx` - Profile edit form
14. `/frontend/src/components/PasswordChangeForm.tsx` - Password change form
15. `/frontend/src/components/DeleteAccountConfirm.tsx` - Account deletion confirmation
16. `/frontend/src/lib/api.ts` - API client (with deadline endpoints)
17. `/frontend/src/lib/auth.ts` - Auth utilities
18. `/frontend/src/lib/datetime.ts` - Date/time formatting utilities
19. `/frontend/package.json` - Dependencies
20. `/frontend/.env.local.example` - Env template
21. `/frontend/Copilot.md` - Code generation guidelines

**Documentation:**
1. `/README.md` - Setup and running instructions
2. `/specs/main/data-model.md` - Database schema details
3. `/specs/main/contracts/rest-api.md` - API contract
4. `/specs/main/quickstart.md` - User guide

**Optional:**
1. `/docker-compose.yml` - Local dev environment

---

## 11. FUTURE EVOLUTION (NOT IN PHASE II)

Phase III will add:
- AI-powered chatbot interface
- Natural language task management
- Voice input support

Phase IV will add:
- Kubernetes deployment
- Microservices architecture

Phase V will add:
- Cloud-native features
- Multi-language support
- Advanced analytics

**These features are FORBIDDEN in Phase II.**

---

## CHANGE LOG

| Version | Date | Changes | Phase |
|---------|------|---------|-------|
| 1.0.0 | 2026-01-01 | Initial Phase I specification (console app) | I |
| 2.0.0 | 2026-01-01 | Phase II specification (full-stack web app) | II |
| 2.1.0 | 2026-01-01 | Added task deadlines, deadline reminders/notifications, user profile management | II |

---

**Approved**: 2026-01-01  
**Constitution Compliance**: ✓ Verified against Master Constitution v1.0.0  
**Phase I Status**: ✅ Complete  
**Phase II Status**: 📋 Specification Complete, Ready for Implementation
