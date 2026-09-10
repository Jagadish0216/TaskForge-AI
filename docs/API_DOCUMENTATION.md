# 📚 TaskForge AI — REST API Documentation

This document provides a comprehensive specification of the **TaskForge AI REST API** (v1).

---

## 🌐 General API Information

- **Base URL**: `http://localhost:8080/api/v1` (Configurable via `server.servlet.context-path`)
- **Content-Type**: `application/json`
- **Swagger OpenAPI UI**: `http://localhost:8080/api/v1/swagger-ui.html`
- **OpenAPI JSON Spec**: `http://localhost:8080/api/v1/api-docs`

---

## 🔐 Authorization Header

All secured endpoints require a valid JWT Access Token passed via the `Authorization` HTTP header:

```http
Authorization: Bearer <YOUR_JWT_ACCESS_TOKEN>
```

---

## 📦 Standard API Response Wrapper

All API responses strictly adhere to the unified `ApiResponse<T>` record wrapper:

### Success Response Format (`200 OK` / `201 Created`)
```json
{
  "success": true,
  "message": "Operation completed successfully",
  "data": { ... },
  "errors": null,
  "timestamp": "2026-08-05T15:00:00"
}
```

### Error Response Format (`400 Bad Request` / `401 Unauthorized` / `403 Forbidden` / `404 Not Found`)
```json
{
  "success": false,
  "message": "Invalid email or password",
  "data": null,
  "errors": null,
  "timestamp": "2026-08-05T15:00:00"
}
```

---

## 🔑 1. Authentication Module (`/auth`)

### `POST /auth/login`
Authenticates email and password credentials, returning JWT Access and Refresh Tokens along with user profile information.

- **Access**: Public
- **Request Body**:
```json
{
  "email": "alex.chen@taskforge.ai",
  "password": "Password123!"
}
```
- **Response (`200 OK`)**:
```json
{
  "success": true,
  "message": "Login Successful",
  "data": {
    "id": 1,
    "name": "Alex Chen",
    "email": "alex.chen@taskforge.ai",
    "role": "ROLE_PROJECT_MANAGER",
    "projects": ["Enterprise Portal Migration"],
    "accessToken": "eyJhbGciOiJIUzUxMiJ9...",
    "refreshToken": "eyJhbGciOiJIUzUxMiJ9...",
    "tokenType": "Bearer",
    "avatarUrl": "https://lh3.googleusercontent.com/a/default"
  }
}
```

---

### `POST /auth/register`
Registers a new team member account with BCrypt password hashing.

- **Access**: Public
- **Request Body**:
```json
{
  "firstName": "Sarah",
  "lastName": "Jenkins",
  "email": "sarah.j@taskforge.ai",
  "password": "SecurePassword123!",
  "role": "ROLE_TEAM_MEMBER"
}
```
- **Response (`201 Created`)**:
```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "id": 2,
    "email": "sarah.j@taskforge.ai",
    "firstName": "Sarah",
    "lastName": "Jenkins",
    "roles": ["ROLE_TEAM_MEMBER"],
    "avatarUrl": null,
    "theme": "DARK"
  }
}
```

---

### `POST /auth/google`
Authenticates a user via Google OAuth 2.0 ID Token. Automatically registers the user if they do not exist and issues JWT tokens.

- **Access**: Public
- **Request Body**:
```json
{
  "idToken": "eyJhbGciOiJSUzI1NiIs..."
}
```
- **Response (`200 OK`)**: Standard `AuthResponse` with JWT tokens.

---

### `POST /auth/refresh`
Issues a new JWT Access Token using a valid JWT Refresh Token.

- **Access**: Public
- **Request Body**:
```json
{
  "refreshToken": "eyJhbGciOiJIUzUxMiJ9..."
}
```
- **Response (`200 OK`)**: Standard `AuthResponse` with fresh tokens.

---

### `GET /auth/me`
Retrieves current authenticated user details.

- **Access**: Authenticated (`Bearer <token>`)
- **Response (`200 OK`)**: Current user profile metadata.

---

### `POST /auth/logout`
Invalidates session credentials.

- **Access**: Authenticated

---

## 👥 2. User Module (`/users`)

| Method | Endpoint | Description | Access |
| :--- | :--- | :--- | :--- |
| `GET` | `/users/me` | Retrieve profile of authenticated user | Authenticated |
| `PUT` | `/users/me` | Update personal profile metadata | Authenticated |
| `POST` | `/users/me/avatar` | Upload profile avatar picture (`multipart/form-data`) | Authenticated |
| `GET` | `/users/{id}` | Retrieve specific user by ID | Authenticated |
| `POST` | `/users/search` | Search users by name/email/role | Authenticated |

---

## 📁 3. Project Module (`/projects`)

| Method | Endpoint | Description | Access |
| :--- | :--- | :--- | :--- |
| `POST` | `/projects/search` | Paginated search for projects | Authenticated |
| `GET` | `/projects/{id}` | Get project details by ID | Authenticated |
| `POST` | `/projects` | Create a new project | Project Manager / Admin |
| `PUT` | `/projects/{id}` | Update project metadata | Project Manager / Admin |
| `DELETE` | `/projects/{id}` | Soft delete project | Admin |
| `POST` | `/projects/{id}/members/invite` | Invite user to project | Project Manager / Admin |
| `GET` | `/projects/{id}/members` | Get project member list | Authenticated |

---

## 📋 4. Task & Kanban Module (`/tasks`)

| Method | Endpoint | Description | Access |
| :--- | :--- | :--- | :--- |
| `POST` | `/tasks/search` | Search tasks by project, status, assignee | Authenticated |
| `GET` | `/tasks/{id}` | Get detailed task information | Authenticated |
| `POST` | `/tasks` | Create a task | Project Manager / Admin |
| `PUT` | `/tasks/{id}` | Update task status or details | Authenticated |
| `PUT` | `/tasks/{id}/assign` | Assign task to user | Project Manager / Admin |
| `DELETE` | `/tasks/{id}` | Delete task | Project Manager / Admin |

---

## 🤖 5. AI Workspace Module (`/ai`)

### `POST /ai/chat`
Sends a prompt to the Google Gemini AI Assistant with optional project context.

- **Request Body**:
```json
{
  "message": "How can we optimize our sprint velocity for the API migration?",
  "projectId": 1
}
```

### `POST /ai/project/generate`
Scaffolds a complete project structure with automated task breakdown and time estimates.

- **Request Body**:
```json
{
  "prompt": "Create a modern E-commerce Platform with React and Spring Boot",
  "projectName": "E-Commerce Suite"
}
```

### `POST /ai/sprint/plan`
Generates optimal sprint capacity allocation based on historic throughput.

---

## ⚙️ 6. Admin Portal Module (`/admin`)

- **Restricted Access**: Requires `ROLE_ADMIN` authority.

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/admin/stats` | System throughput & total user statistics |
| `GET` | `/admin/users` | Platform-wide user management list |
| `PUT` | `/admin/users/{id}` | Update user roles or activation status |
| `GET` | `/admin/audit-logs` | Retrieve system activity audit logs |
| `GET` | `/admin/announcements` | Manage active platform broadcast banners |
