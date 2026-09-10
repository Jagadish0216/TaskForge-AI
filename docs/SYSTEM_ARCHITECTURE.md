# 🏛️ TaskForge AI — System Architecture Specification

This document provides a technical overview of the architecture, security infrastructure, data model, and component interactions of **TaskForge AI**.

---

## 1. High-Level Architectural Pattern

TaskForge AI relies on a **Decoupled N-Tier Enterprise Architecture**:

1. **Presentation Layer (Frontend)**: React 18 Single Page Application (SPA) powered by Vite, Tailwind CSS, and Axios.
2. **Security & Gateway Layer**: Spring Security Filter Chain with custom `JwtAuthenticationFilter` and CORS configuration.
3. **Application & Business Layer**: Spring Boot REST Controllers, Domain Services, and Gemini AI Orchestrator.
4. **Persistence Layer**: Spring Data JPA with MySQL 8.0 / embedded H2 database.
5. **External Integration Services**: Google OAuth 2.0 Identity Services & Google Gemini AI API.

```mermaid
graph TB
    subgraph Client Browser
        ReactApp[React 18 SPA / Axios Interceptor]
        TokenStore[(LocalStorage / State)]
    end

    subgraph Spring Boot Application Server
        SecurityFilter[JwtAuthenticationFilter]
        SecurityContext[SecurityContextHolder Context]
        
        AuthCtrl[AuthenticationController]
        UserCtrl[UserController]
        ProjectCtrl[ProjectController]
        TaskCtrl[TaskController]
        AICtrl[AIController]
        AdminCtrl[AdminController]

        AuthSvc[AuthenticationService]
        ProjectSvc[ProjectService]
        AISvc[AIService]

        JPARepos[Spring Data JPA Repositories]
    end

    subgraph Persistence & External APIS
        MySQL[(MySQL 8.0 / H2)]
        GoogleAPI[Google OAuth 2.0 API]
        GeminiAPI[Google Gemini AI Engine]
    end

    ReactApp -->|Authorization: Bearer <Token>| SecurityFilter
    SecurityFilter -->|Validate & Set Principal| SecurityContext
    SecurityFilter --> AuthCtrl & UserCtrl & ProjectCtrl & TaskCtrl & AICtrl & AdminCtrl

    AuthCtrl --> AuthSvc
    ProjectCtrl --> ProjectSvc
    AICtrl --> AISvc

    AuthSvc -->|Verify Token| GoogleAPI
    AuthSvc --> JPARepos
    ProjectSvc --> JPARepos
    AISvc -->|Generative Prompts| GeminiAPI

    JPARepos --> MySQL
```

---

## 2. Authentication & Security Subsystem

### 2.1 Token Lifecycle & Structure

TaskForge AI implements stateless authentication using two tokens:

- **Access Token**:
  - **Type**: Signed JWT (HMAC-SHA512)
  - **Lifetime**: 15 minutes to 24 hours (configurable via `jwt.access-token-expiration-ms`)
  - **Claims**: `sub` (user email), `userId`, `roles` (`ROLE_ADMIN`, `ROLE_PROJECT_MANAGER`, `ROLE_TEAM_MEMBER`), `type` ("ACCESS"), `iat`, `exp`.
- **Refresh Token**:
  - **Type**: Signed JWT (HMAC-SHA512)
  - **Lifetime**: 7 days (configurable via `jwt.refresh-token-expiration-ms`)
  - **Claims**: `sub` (user email), `type` ("REFRESH"), `iat`, `exp`.

### 2.2 Token Validation & Renewal Sequence

```mermaid
sequenceDiagram
    autonumber
    participant React as React Axios Interceptor
    participant Filter as JwtAuthenticationFilter
    participant Provider as JwtTokenProvider
    participant AuthController as AuthenticationController
    participant AuthSvc as AuthenticationService

    React->>Filter: GET /api/v1/projects (Authorization: Bearer <accessToken>)
    Filter->>Provider: validateToken(accessToken)
    
    alt Token is Valid
        Provider-->>Filter: true
        Filter->>Filter: Set SecurityContextHolder Authentication
        Filter-->>React: 200 OK Response
    else Token Expired (401 Unauthorized)
        Provider-->>Filter: false (ExpiredJwtException)
        Filter-->>React: 401 Unauthorized
        React->>AuthController: POST /api/v1/auth/refresh (refreshToken)
        AuthController->>AuthSvc: refreshToken(refreshToken)
        AuthSvc->>Provider: validateToken(refreshToken) & check type == REFRESH
        AuthSvc-->>AuthController: New AuthResponse (new accessToken, new refreshToken)
        AuthController-->>React: 200 OK (New Tokens)
        React->>Filter: Retry original GET /api/v1/projects (Bearer <newAccessToken>)
        Filter-->>React: 200 OK Response
    end
```

---

## 3. Entity Relationship Data Model

```mermaid
erDiagram
    USER ||--o{ USER_ROLE : holds
    ROLE ||--o{ USER_ROLE : contains
    USER ||--o{ PROJECT_MEMBER : participates
    PROJECT ||--o{ PROJECT_MEMBER : includes
    PROJECT ||--o{ TASK : contains
    TASK ||--o{ COMMENT : receives
    USER ||--o{ TASK : assigned_to
    USER ||--o{ COMMENT : writes
    PROJECT ||--o{ ATTACHMENT : stores
    TASK ||--o{ ATTACHMENT : stores

    USER {
        bigint id PK
        string email UK
        string password
        string first_name
        string last_name
        string avatar_url
        boolean enabled
    }

    ROLE {
        bigint id PK
        string name UK
    }

    PROJECT {
        bigint id PK
        string name
        string key_code UK
        string description
        string status
        string priority
    }

    PROJECT_MEMBER {
        bigint id PK
        bigint project_id FK
        bigint user_id FK
        string role
    }

    TASK {
        bigint id PK
        bigint project_id FK
        bigint assignee_id FK
        string title
        string status
        string priority
        int estimated_hours
    }
```

---

## 4. Google OAuth 2.0 Integration

1. Frontend initiates login via Google Identity Services button (`https://accounts.google.com/gsi/client`).
2. Google returns an RSA-signed **Google ID Token** to the frontend.
3. Frontend sends `idToken` to backend `POST /api/v1/auth/google`.
4. Backend verifies ID token authenticity against Google Public Certificates using `GoogleIdTokenVerifier`.
5. User is retrieved by email or automatically registered with default `ROLE_TEAM_MEMBER` and profile picture.
6. Backend generates and returns standard TaskForge JWT Access and Refresh Tokens.
