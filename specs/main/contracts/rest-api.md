# REST API Contract: Todo Full-Stack Web Application (Phase II)

**Version**: 2.0.0  
**Date**: 2026-01-01  
**Phase**: II - API Contracts  
**Base URL**: `http://localhost:8000` (development)

---

## Overview

This document defines the complete REST API contract for the Phase II Todo web application. All endpoints follow RESTful conventions with JSON request/response bodies.

**Authentication**: All endpoints except `/api/auth/*` require JWT Bearer token in Authorization header.

**Error Handling**: Standard HTTP status codes with JSON error responses.

---

## Authentication

### Common Headers

**Protected Endpoints:**
```
Authorization: Bearer <jwt_token>
Content-Type: application/json
```

**Public Endpoints:**
```
Content-Type: application/json
```

---

## Endpoints

### 1. User Signup

**Endpoint**: `POST /api/auth/signup`

**Description**: Register a new user account.

**Authentication**: None (public endpoint)

**Request Body**:
```json
{
  "email": "user@example.com",
  "password": "securepass123"
}
```

**Request Validation**:
- `email`: Required, valid email format, max 255 chars
- `password`: Required, min 8 chars, max 100 chars

**Success Response (201 Created)**:
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "email": "user@example.com",
  "created_at": "2026-01-01T14:22:13.123456",
  "updated_at": "2026-01-01T14:22:13.123456"
}
```

**Error Responses**:

400 Bad Request (validation error):
```json
{
  "detail": "Password must be at least 8 characters"
}
```

400 Bad Request (duplicate email):
```json
{
  "detail": "Email already registered"
}
```

422 Unprocessable Entity (invalid JSON):
```json
{
  "detail": [
    {
      "loc": ["body", "email"],
      "msg": "value is not a valid email address",
      "type": "value_error.email"
    }
  ]
}
```

**cURL Example**:
```bash
curl -X POST http://localhost:8000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "securepass123"
  }'
```

---

### 2. User Signin

**Endpoint**: `POST /api/auth/signin`

**Description**: Login and receive JWT access token.

**Authentication**: None (public endpoint)

**Request Body**:
```json
{
  "email": "user@example.com",
  "password": "securepass123"
}
```

**Request Validation**:
- `email`: Required, string
- `password`: Required, string

**Success Response (200 OK)**:
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjoiNTUwZTg0MDAtZTI5Yi00MWQ0LWE3MTYtNDQ2NjU1NDQwMDAwIiwiZXhwIjoxNzM1ODE1MzMzfQ.abc123...",
  "token_type": "bearer",
  "expires_in": 86400,
  "user": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "email": "user@example.com"
  }
}
```

**Error Responses**:

401 Unauthorized (invalid credentials):
```json
{
  "detail": "Invalid email or password"
}
```

422 Unprocessable Entity (missing field):
```json
{
  "detail": [
    {
      "loc": ["body", "password"],
      "msg": "field required",
      "type": "value_error.missing"
    }
  ]
}
```

**cURL Example**:
```bash
curl -X POST http://localhost:8000/api/auth/signin \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "securepass123"
  }'
```

**Notes**:
- Store `access_token` securely (localStorage or httpOnly cookie)
- Include token in all subsequent API requests
- Token expires after 24 hours (86400 seconds)

---

### 3. List Tasks

**Endpoint**: `GET /api/users/{user_id}/tasks`

**Description**: Get all tasks for authenticated user with filtering, sorting, and search.

**Authentication**: Required (JWT Bearer token)

**Path Parameters**:
- `user_id`: User UUID (must match JWT token user_id)

**Query Parameters**:
- `filter`: `all` | `complete` | `incomplete` (default: `all`)
- `sort`: `created_asc` | `created_desc` | `title_asc` | `title_desc` | `status` (default: `created_desc`)
- `search`: string (optional, searches title and description)

**Request Headers**:
```
Authorization: Bearer <jwt_token>
```

**Success Response (200 OK)**:
```json
{
  "tasks": [
    {
      "id": "7c9e6679-fe0c-425c-883b-1e1d3e8c9f12",
      "user_id": "550e8400-e29b-41d4-a716-446655440000",
      "title": "Buy groceries",
      "description": "Milk, bread, eggs",
      "completed": false,
      "created_at": "2026-01-01T14:22:13.123456",
      "updated_at": "2026-01-01T14:22:13.123456"
    },
    {
      "id": "a1b2c3d4-e5f6-4a5b-8c9d-0e1f2a3b4c5d",
      "user_id": "550e8400-e29b-41d4-a716-446655440000",
      "title": "Write documentation",
      "description": "Phase II specs",
      "completed": true,
      "created_at": "2026-01-01T13:15:00.000000",
      "updated_at": "2026-01-01T14:00:00.000000"
    }
  ],
  "total": 2
}
```

**Empty Response (200 OK)**:
```json
{
  "tasks": [],
  "total": 0
}
```

**Error Responses**:

401 Unauthorized (missing token):
```json
{
  "detail": "Missing authorization header"
}
```

401 Unauthorized (invalid token):
```json
{
  "detail": "Invalid or expired token"
}
```

403 Forbidden (user_id mismatch):
```json
{
  "detail": "Access denied: user_id mismatch"
}
```

**cURL Example**:
```bash
# Get all incomplete tasks sorted by creation date (newest first)
curl -X GET "http://localhost:8000/api/users/550e8400-e29b-41d4-a716-446655440000/tasks?filter=incomplete&sort=created_desc" \
  -H "Authorization: Bearer <jwt_token>"

# Search tasks containing "grocery"
curl -X GET "http://localhost:8000/api/users/550e8400-e29b-41d4-a716-446655440000/tasks?search=grocery" \
  -H "Authorization: Bearer <jwt_token>"
```

---

### 4. Create Task

**Endpoint**: `POST /api/users/{user_id}/tasks`

**Description**: Create a new task for authenticated user.

**Authentication**: Required (JWT Bearer token)

**Path Parameters**:
- `user_id`: User UUID (must match JWT token user_id)

**Request Headers**:
```
Authorization: Bearer <jwt_token>
Content-Type: application/json
```

**Request Body**:
```json
{
  "title": "Buy groceries",
  "description": "Milk, bread, eggs"
}
```

**Request Validation**:
- `title`: Required, min 1 char, max 200 chars
- `description`: Optional, max 1000 chars (default: "")

**Success Response (201 Created)**:
```json
{
  "id": "7c9e6679-fe0c-425c-883b-1e1d3e8c9f12",
  "user_id": "550e8400-e29b-41d4-a716-446655440000",
  "title": "Buy groceries",
  "description": "Milk, bread, eggs",
  "completed": false,
  "created_at": "2026-01-01T14:22:13.123456",
  "updated_at": "2026-01-01T14:22:13.123456"
}
```

**Error Responses**:

400 Bad Request (validation error):
```json
{
  "detail": "Title cannot be empty"
}
```

401 Unauthorized:
```json
{
  "detail": "Missing authorization header"
}
```

403 Forbidden (user_id mismatch):
```json
{
  "detail": "Access denied: user_id mismatch"
}
```

422 Unprocessable Entity (invalid JSON):
```json
{
  "detail": [
    {
      "loc": ["body", "title"],
      "msg": "field required",
      "type": "value_error.missing"
    }
  ]
}
```

**cURL Example**:
```bash
curl -X POST http://localhost:8000/api/users/550e8400-e29b-41d4-a716-446655440000/tasks \
  -H "Authorization: Bearer <jwt_token>" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Buy groceries",
    "description": "Milk, bread, eggs"
  }'
```

---

### 5. Get Task Details

**Endpoint**: `GET /api/users/{user_id}/tasks/{task_id}`

**Description**: Get details of a specific task.

**Authentication**: Required (JWT Bearer token)

**Path Parameters**:
- `user_id`: User UUID (must match JWT token user_id)
- `task_id`: Task UUID

**Request Headers**:
```
Authorization: Bearer <jwt_token>
```

**Success Response (200 OK)**:
```json
{
  "id": "7c9e6679-fe0c-425c-883b-1e1d3e8c9f12",
  "user_id": "550e8400-e29b-41d4-a716-446655440000",
  "title": "Buy groceries",
  "description": "Milk, bread, eggs",
  "completed": false,
  "created_at": "2026-01-01T14:22:13.123456",
  "updated_at": "2026-01-01T14:22:13.123456"
}
```

**Error Responses**:

401 Unauthorized:
```json
{
  "detail": "Missing authorization header"
}
```

403 Forbidden (not owner):
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

**cURL Example**:
```bash
curl -X GET http://localhost:8000/api/users/550e8400-e29b-41d4-a716-446655440000/tasks/7c9e6679-fe0c-425c-883b-1e1d3e8c9f12 \
  -H "Authorization: Bearer <jwt_token>"
```

---

### 6. Update Task

**Endpoint**: `PUT /api/users/{user_id}/tasks/{task_id}`

**Description**: Update task title and/or description.

**Authentication**: Required (JWT Bearer token)

**Path Parameters**:
- `user_id`: User UUID (must match JWT token user_id)
- `task_id`: Task UUID

**Request Headers**:
```
Authorization: Bearer <jwt_token>
Content-Type: application/json
```

**Request Body** (at least one field required):
```json
{
  "title": "Buy groceries and household items",
  "description": "Milk, bread, eggs, paper towels"
}
```

**Request Validation**:
- `title`: Optional, min 1 char if provided, max 200 chars
- `description`: Optional, max 1000 chars
- At least one field must be provided

**Success Response (200 OK)**:
```json
{
  "id": "7c9e6679-fe0c-425c-883b-1e1d3e8c9f12",
  "user_id": "550e8400-e29b-41d4-a716-446655440000",
  "title": "Buy groceries and household items",
  "description": "Milk, bread, eggs, paper towels",
  "completed": false,
  "created_at": "2026-01-01T14:22:13.123456",
  "updated_at": "2026-01-01T14:30:00.000000"
}
```

**Error Responses**:

400 Bad Request (validation error):
```json
{
  "detail": "At least one field must be provided for update"
}
```

401 Unauthorized:
```json
{
  "detail": "Missing authorization header"
}
```

403 Forbidden (not owner):
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

**cURL Example**:
```bash
# Update both fields
curl -X PUT http://localhost:8000/api/users/550e8400-e29b-41d4-a716-446655440000/tasks/7c9e6679-fe0c-425c-883b-1e1d3e8c9f12 \
  -H "Authorization: Bearer <jwt_token>" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Buy groceries and household items",
    "description": "Milk, bread, eggs, paper towels"
  }'

# Update title only
curl -X PUT http://localhost:8000/api/users/550e8400-e29b-41d4-a716-446655440000/tasks/7c9e6679-fe0c-425c-883b-1e1d3e8c9f12 \
  -H "Authorization: Bearer <jwt_token>" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Updated title"
  }'
```

---

### 7. Delete Task

**Endpoint**: `DELETE /api/users/{user_id}/tasks/{task_id}`

**Description**: Delete a task permanently.

**Authentication**: Required (JWT Bearer token)

**Path Parameters**:
- `user_id`: User UUID (must match JWT token user_id)
- `task_id`: Task UUID

**Request Headers**:
```
Authorization: Bearer <jwt_token>
```

**Success Response (204 No Content)**:
```
(Empty body)
```

**Error Responses**:

401 Unauthorized:
```json
{
  "detail": "Missing authorization header"
}
```

403 Forbidden (not owner):
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

**cURL Example**:
```bash
curl -X DELETE http://localhost:8000/api/users/550e8400-e29b-41d4-a716-446655440000/tasks/7c9e6679-fe0c-425c-883b-1e1d3e8c9f12 \
  -H "Authorization: Bearer <jwt_token>"
```

---

### 8. Toggle Task Completion

**Endpoint**: `PATCH /api/users/{user_id}/tasks/{task_id}/complete`

**Description**: Toggle task completion status (true ↔ false).

**Authentication**: Required (JWT Bearer token)

**Path Parameters**:
- `user_id`: User UUID (must match JWT token user_id)
- `task_id`: Task UUID

**Request Headers**:
```
Authorization: Bearer <jwt_token>
```

**Request Body**: None (empty body)

**Success Response (200 OK)**:
```json
{
  "id": "7c9e6679-fe0c-425c-883b-1e1d3e8c9f12",
  "user_id": "550e8400-e29b-41d4-a716-446655440000",
  "title": "Buy groceries",
  "description": "Milk, bread, eggs",
  "completed": true,
  "created_at": "2026-01-01T14:22:13.123456",
  "updated_at": "2026-01-01T14:35:00.000000"
}
```

**Error Responses**:

401 Unauthorized:
```json
{
  "detail": "Missing authorization header"
}
```

403 Forbidden (not owner):
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

**cURL Example**:
```bash
curl -X PATCH http://localhost:8000/api/users/550e8400-e29b-41d4-a716-446655440000/tasks/7c9e6679-fe0c-425c-883b-1e1d3e8c9f12/complete \
  -H "Authorization: Bearer <jwt_token>"
```

---

## Error Codes Reference

| Status Code | Meaning | Common Causes |
|-------------|---------|---------------|
| 200 OK | Success | GET, PUT, PATCH requests succeeded |
| 201 Created | Resource created | POST requests succeeded |
| 204 No Content | Success with no body | DELETE requests succeeded |
| 400 Bad Request | Validation error | Invalid input data, missing required fields |
| 401 Unauthorized | Authentication failed | Missing/invalid/expired JWT token |
| 403 Forbidden | Authorization failed | user_id mismatch, not task owner |
| 404 Not Found | Resource not found | Task/user doesn't exist |
| 422 Unprocessable Entity | JSON validation failed | Invalid JSON structure, type errors |
| 500 Internal Server Error | Server error | Database connection, unexpected errors |

---

## JWT Token Structure

**Header**:
```json
{
  "alg": "HS256",
  "typ": "JWT"
}
```

**Payload**:
```json
{
  "user_id": "550e8400-e29b-41d4-a716-446655440000",
  "exp": 1735815333
}
```

**Signature**: HMACSHA256(base64UrlEncode(header) + "." + base64UrlEncode(payload), JWT_AUTH_SECRET)

**Full Token Example**:
```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjoiNTUwZTg0MDAtZTI5Yi00MWQ0LWE3MTYtNDQ2NjU1NDQwMDAwIiwiZXhwIjoxNzM1ODE1MzMzfQ.Xc8pE7k5L_m3N9q1R2s4T5u6V7w8X9y0Z1a2B3c4D5e
```

**Usage in Requests**:
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

---

## Security Notes

1. **Token Storage**: 
   - Frontend: Store in localStorage (Phase II) or httpOnly cookie (Phase V)
   - Never store in URL or query parameters
   - Clear on signout

2. **Token Validation**:
   - Verify signature with JWT_AUTH secret
   - Check expiration (exp claim)
   - Extract user_id from payload
   - Validate user_id matches URL parameter

3. **Multi-User Isolation**:
   - All database queries MUST filter by authenticated user_id
   - Never trust user_id from URL alone
   - Return 403 Forbidden for ownership violations

4. **Password Security**:
   - Hash with bcrypt (cost factor 12)
   - Never return hashed_password in API responses
   - Validate password strength before hashing

5. **CORS**:
   - Configure allowed origins (frontend URL only)
   - Allow credentials for cookie-based auth (Phase V)
   - Restrict methods to: GET, POST, PUT, PATCH, DELETE

---

## Testing Checklist

### Authentication
- [ ] Signup with valid credentials returns 201 with user object
- [ ] Signup with duplicate email returns 400
- [ ] Signin with valid credentials returns 200 with JWT token
- [ ] Signin with invalid credentials returns 401
- [ ] Requests without token return 401
- [ ] Requests with invalid token return 401
- [ ] Requests with expired token return 401

### Task CRUD
- [ ] Create task returns 201 with task object
- [ ] Create task with empty title returns 400
- [ ] List tasks returns 200 with array
- [ ] List tasks filters by completion status
- [ ] List tasks sorts correctly
- [ ] List tasks searches by title/description
- [ ] Get task returns 200 with task object
- [ ] Get non-existent task returns 404
- [ ] Update task returns 200 with updated task
- [ ] Update task with no fields returns 400
- [ ] Delete task returns 204
- [ ] Toggle completion returns 200 with toggled status

### Multi-User Isolation
- [ ] User A cannot see User B's tasks (403)
- [ ] User A cannot update User B's task (403)
- [ ] User A cannot delete User B's task (403)
- [ ] User A cannot toggle User B's task (403)

---

**API Contract Version**: 2.0.0  
**Date**: 2026-01-01  
**Status**: ✅ Complete  
**Ready for Implementation**: Yes (Backend + Frontend API client)
