<div align="center">

# 🚀 TaskForge AI

### *An AI-Powered Project Management & Team Collaboration Platform*

[![Java](https://img.shields.io/badge/Java-17-ED8B00?style=for-the-badge&logo=openjdk&logoColor=white)](https://www.oracle.com/java/)
[![Spring Boot](https://img.shields.io/badge/Spring_Boot-3.3.4-6DB33F?style=for-the-badge&logo=springboot&logoColor=white)](https://spring.io/projects/spring-boot)
[![MySQL](https://img.shields.io/badge/MySQL-8.0-4479A1?style=for-the-badge&logo=mysql&logoColor=white)](https://www.mysql.com/)
[![Swagger](https://img.shields.io/badge/Swagger-OpenAPI_3.0-85EA2D?style=for-the-badge&logo=swagger&logoColor=black)](http://localhost:8080/api/v1/swagger-ui/index.html)
[![Maven](https://img.shields.io/badge/Maven-3.9+-C71A36?style=for-the-badge&logo=apachemaven&logoColor=white)](https://maven.apache.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=for-the-badge)](LICENSE)
[![GitHub last commit](https://img.shields.io/github/last-commit/Jagadish0216/TaskForge-AI?style=for-the-badge&logo=github)](https://github.com/Jagadish0216/TaskForge-AI)
[![GitHub repo size](https://img.shields.io/github/repo-size/Jagadish0216/TaskForge-AI?style=for-the-badge&logo=github)](https://github.com/Jagadish0216/TaskForge-AI)
[![GitHub top language](https://img.shields.io/github/languages/top/Jagadish0216/TaskForge-AI?style=for-the-badge&logo=java)](https://github.com/Jagadish0216/TaskForge-AI)
[![GitHub issues](https://img.shields.io/github/issues/Jagadish0216/TaskForge-AI?style=for-the-badge&logo=github)](https://github.com/Jagadish0216/TaskForge-AI/issues)

---

</div>

## 📌 Project Highlights

- ✔ **Enterprise Layered Architecture** (Controller → Service → Repository → Database)
- ✔ **RESTful API Design** with standardized response envelopes and clean status codes
- ✔ **Session-Based Authentication** using stateful HTTP session management
- ✔ **Cloud MySQL Database Support** pre-configured for Aiven Cloud & Local MySQL
- ✔ **Swagger API Documentation** powered by SpringDoc OpenAPI 3.0
- ✔ **Activity Timeline** capturing real-time automated audit logs across all system events
- ✔ **Dashboard Analytics** featuring executive KPI metrics and completion ratios
- ✔ **Reports Module** tracking project progress velocity and user metrics
- ✔ **Calendar Module** aggregating daily, weekly, and monthly task schedules
- ✔ **Global Search Engine** providing multi-entity keyword searches
- ✔ **AI-Ready Architecture** structured endpoints designed for AI sprint generation
- ✔ **React Frontend** (*Coming Soon*)

---

## 🌐 Backend Demo

- 🛠 **Swagger UI Explorer**: `http://localhost:8080/api/v1/swagger-ui/index.html` *(Available when backend is running)*
- 💻 **Frontend Client**: *Coming Soon*

---

## 📖 1. Project Overview

**TaskForge AI** is a modern, enterprise-grade project management and team collaboration platform inspired by industry-leading tools like **Jira**, **Trello**, and **Linear**.

Built with a production-grade backend powered by **Spring Boot 3**, **Spring Data JPA**, and **MySQL (Aiven Cloud)**, TaskForge AI enables organizations to manage projects, track task lifecycles, delegate responsibilities, collaborate through nested discussion threads, upload file attachments, and monitor productivity using comprehensive analytics, real-time activity timelines, and executive dashboard KPIs.

### Core Architecture Goals
The platform was engineered to showcase enterprise software development practices—including modular domain-driven architecture, DTO object mapping, stateful session-based authentication, declarative database auditing, and global exception handling.

> [!NOTE]
> **Current Project Status**: Core backend modules are fully implemented and verified. The React frontend client interface and AI service integrations are currently in progress.

---

## ⚡ 2. Features

| Category | Feature | Description |
| :--- | :--- | :--- |
| **Authentication** | Stateful Session Management | Secure user registration, credential login, stateful HTTP session context, and profile retrieval. |
| **Projects** | Project Management | Full CRUD operations, key generation, visibility settings (`PUBLIC`/`PRIVATE`), archiving, and restoration. |
| **Tasks** | Task Engine | Task creation, assignee delegation, status tracking (`TODO` → `DONE`), priority rankings, and estimation metrics. |
| **Comments** | Threaded Discussions | Hierarchical comment replies, automatic user notification triggering on `@mentions`, and audit history tracking. |
| **Members** | Project Delegation | Invitation workflows (send, accept, reject), role management (`OWNER`, `MANAGER`, `MEMBER`, `VIEWER`), and ownership transfer. |
| **Dashboard** | Executive Dashboard | Multi-dimensional project health indicators, completion ratios, and recent team activity streams. |
| **Reports** | Productivity Analytics | Executive summaries, team velocity metrics, and weekly sprint progress summaries. |
| **Notifications** | Notification Engine | User-targeted notifications for comment mentions, task assignments, and project invitations with preference toggles. |
| **Search** | Unified Search | Multi-entity keyword search across projects, tasks, user directory, and comment contents. |
| **Calendar** | Milestone Scheduler | Aggregated daily, weekly, and monthly task schedules for milestone planning. |
| **Attachments** | File Management | Local disk storage service with UUID file generation, stream download handlers, and cascade deletions. |
| **Activity Logs** | Automated Timeline | Granular audit trail capturing system-wide operational events across all modules. |
| **AI Ready** | AI Sprint Generator | Structured AI-ready API interfaces designed for sprint backlog generation and risk summary prompts. |

---

## 🛠 3. Technology Stack

### Backend Infrastructure
| Technology | Version | Purpose |
| :--- | :--- | :--- |
| **Java** | 17 | Core Programming Language |
| **Spring Boot** | 3.3.4 | Application Framework |
| **Spring Data JPA** | 3.3.4 | Persistence Framework |
| **Hibernate** | 6.5.3 | ORM Engine |
| **HikariCP** | 5.1.0 | High-Performance JDBC Connection Pool |
| **MySQL** | 8.0 | Relational Database (Aiven Cloud / Local) |
| **SpringDoc / Swagger** | 2.6.0 | OpenAPI 3.0 Documentation |
| **Lombok** | 1.18.34 | Boilerplate Code Reduction |
| **Maven** | 3.9+ | Build & Dependency Management |

### Upcoming Frontend & Future Tooling
| Technology | Purpose | Status |
| :--- | :--- | :--- |
| **React** | User Interface Library | 🚧 In Progress |
| **Vite** | Frontend Build Tool | 🚧 In Progress |
| **TypeScript** | Type-Safe Frontend Development | 🚧 In Progress |
| **Gemini AI** | AI Project Assistance & Sprint Generator | 🚧 Planned |
| **Docker** | Containerized Deployment | 🚧 Planned |
| **GitHub Actions** | Automated CI/CD Pipelines | 🚧 Planned |

---

## 🖼 4. Screenshots

> [!INFO]
> *Frontend screenshots will be added after the React frontend is completed.*

---

## 🏛 5. Architecture

TaskForge AI implements a clean **Layered Domain-Driven Architecture** adhering to SOLID software design principles.

```
+-----------------------------------------------------------------------+
|                       React Frontend (Client)                         |
|                 (Single Page Interface - Upcoming)                    |
+-----------------------------------+-----------------------------------+
                                    |  HTTP REST / JSON
                                    v
+-----------------------------------------------------------------------+
|                    REST API Controller Layer                          |
|  (AuthController, ProjectController, TaskController, ReportController)|
+-----------------------------------+-----------------------------------+
                                    |  DTOs / Command Invocation
                                    v
+-----------------------------------------------------------------------+
|                         Service Logic Layer                           |
|  (Business Rules, Access Control Verification, Activity Auditing)     |
+-----------------------------------+-----------------------------------+
                                    |  Domain Entities / Queries
                                    v
+-----------------------------------------------------------------------+
|                       Repository Layer (JPA)                          |
|       (Spring Data Repositories, Custom JPQL Specifications)          |
+-----------------------------------+-----------------------------------+
                                    |  JDBC / HikariCP
                                    v
+-----------------------------------------------------------------------+
|                     Relational Database (MySQL)                       |
|                 (Local MySQL or Aiven Cloud Instance)                 |
+-----------------------------------------------------------------------+
```

---

## 📁 6. Folder Structure

```
TaskForge-AI/
├── backend/
│   ├── .mvn/
│   │   └── wrapper/
│   ├── src/
│   │   ├── main/
│   │   │   ├── java/com/taskforge/
│   │   │   │   ├── common/
│   │   │   │   │   ├── constant/          # Enums (UserRole, TaskStatus, TaskPriority, etc.)
│   │   │   │   │   ├── dto/               # Standard ApiResponse wrapper & Base DTOs
│   │   │   │   │   ├── entity/            # BaseEntity (created_at, updated_at)
│   │   │   │   │   └── exception/         # Custom Exceptions & GlobalExceptionHandler
│   │   │   │   ├── config/                # SwaggerConfig, JpaAuditingConfig, DataInitializer
│   │   │   │   ├── security/              # SecurityUtils & Session Context Management
│   │   │   │   └── module/                # Domain Modules
│   │   │   │       ├── activity/          # Activity Logs & Timelines
│   │   │   │       ├── ai/                # AI Assistant Controllers & Providers
│   │   │   │       ├── auth/              # Registration & Login Controllers/Services
│   │   │   │       ├── calendar/          # Daily/Weekly Calendar Scheduling
│   │   │   │       ├── dashboard/         # Executive Dashboard Analytics
│   │   │   │       ├── notification/      # Notifications & User Preferences
│   │   │   │       ├── project/           # Projects, Members, & Invitations
│   │   │   │       ├── report/            # Reports & Velocity Analytics
│   │   │   │       ├── search/            # Global Search Engine
│   │   │   │       ├── storage/           # Attachments & Local File Storage
│   │   │   │       ├── task/              # Tasks, Comments, & Comment History
│   │   │   │       └── user/              # User Profile Management
│   │   │   └── resources/
│   │   │       ├── application.properties
│   │   │       └── application-local.properties  (Git-Ignored)
│   ├── mvnw
│   ├── mvnw.cmd
│   └── pom.xml
├── frontend/                              # React Single-Page Application (In Progress)
├── docs/                                  # Documentation & Screenshots
├── README.md                              # Main Repository Documentation
├── LICENSE                                # MIT Open Source License
└── CHANGELOG.md                           # Version Release History
```

---

## 📦 7. Backend Modules

| # | Module | Package Path | Description |
| :-: | :--- | :--- | :--- |
| **1** | **Authentication** | `com.taskforge.module.auth` | Handles registration, stateful HTTP session login, logout, and `/me` profile context. |
| **2** | **User Management** | `com.taskforge.module.user` | Manages user profiles, keyword directory search, and baseline system roles. |
| **3** | **Project Management** | `com.taskforge.module.project` | Handles project lifecycle (CRUD), priorities, visibility, archiving, and restoration. |
| **4** | **Project Members** | `com.taskforge.module.project` | Handles invitation processing, member listing, role updates, and ownership transfer. |
| **5** | **Task Management** | `com.taskforge.module.task` | Manages task creation, status workflows (`TODO`, `IN_PROGRESS`, `DONE`), assignees, and stats. |
| **6** | **Comments** | `com.taskforge.module.task` | Manages threaded comment discussions, `@mentions` parsing, and edit audit histories. |
| **7** | **Storage & Attachments**| `com.taskforge.module.storage` | Handles file upload streaming, UUID generation, local storage, downloads, and cleanup. |
| **8** | **Notifications** | `com.taskforge.module.notification` | Dispatches notifications for mentions, tasks, and invites with user preference toggles. |
| **9** | **Activity Timeline** | `com.taskforge.module.activity` | Automatically generates readable system audit timelines for all user operational events. |
| **10**| **Dashboard** | `com.taskforge.module.dashboard` | Computes system-wide KPIs, project status distributions, and completion ratios. |
| **11**| **Reports** | `com.taskforge.module.report` | Generates project progress reports, user velocity metrics, and weekly summaries. |
| **12**| **Search** | `com.taskforge.module.search` | Executes unified multi-entity keyword searches across projects, tasks, users, and comments. |
| **13**| **Calendar** | `com.taskforge.module.calendar` | Aggregates project tasks into daily, weekly, and monthly schedule maps. |
| **14**| **AI Module** | `com.taskforge.module.ai` | Provides structured API endpoints for automated sprint generation and risk analysis. |

---

## 🗄 8. Database Overview

The persistence layer maps **12 relational entities** using **Hibernate ORM** and **HikariCP Connection Pool**, supporting both **Local MySQL** and **Aiven Cloud MySQL**:

- 👤 **`users`**: System user credentials, full name, email, and active profile details.
- 🔑 **`roles`**: Baseline system roles (`ROLE_ADMIN`, `ROLE_PROJECT_MANAGER`, `ROLE_TEAM_MEMBER`).
- 🔗 **`user_roles`**: Many-to-Many junction mapping users to their system roles.
- 📁 **`projects`**: Project definitions, code key, status, priority, visibility, and project owner reference.
- 👥 **`project_members`**: Project membership junction with project-specific roles (`OWNER`, `MANAGER`, `MEMBER`, `VIEWER`).
- ✉️ **`project_invitations`**: Project invitation records and status (`PENDING`, `ACCEPTED`, `REJECTED`).
- ✅ **`tasks`**: Task metadata, status (`TODO`, `IN_PROGRESS`, `IN_REVIEW`, `DONE`), priority, assignee, and estimation hours.
- 💬 **`comments`**: Threaded user comments with self-referential parent-child hierarchy relations.
- 📜 **`comment_histories`**: Historical logs capturing previous iterations of edited comments.
- 📎 **`attachments`**: Uploaded file metadata, physical disk paths, file size, and entity associations.
- 🔔 **`notifications`**: Targeted user notification messages, type enums, and read flags.
- ⚙️ **`notification_preferences`**: User-configurable boolean flags for notification categories.
- ⏱ **`activity_logs`**: Comprehensive immutable audit trail of system events.

---

## 🔌 9. API Overview

TaskForge AI provides comprehensive REST APIs covering all core backend modules under the `/api/v1` base path:

### 🔑 Authentication (`/api/v1/auth`)
- `POST /api/v1/auth/register` - Register a new account
- `POST /api/v1/auth/login` - Authenticate & initialize HTTP session
- `GET /api/v1/auth/me` - Retrieve authenticated user context
- `POST /api/v1/auth/logout` - Invalidate active session

### 📁 Projects (`/api/v1/projects`)
- `POST /api/v1/projects` - Create a project
- `GET /api/v1/projects` - Search & list projects (paginated)
- `GET /api/v1/projects/{id}` - Retrieve project details
- `PUT /api/v1/projects/{id}` - Update project properties
- `POST /api/v1/projects/{id}/archive` - Archive a project
- `POST /api/v1/projects/{id}/restore` - Restore an archived project
- `DELETE /api/v1/projects/{id}` - Cascade delete a project

### ✅ Tasks (`/api/v1/tasks`)
- `POST /api/v1/tasks` - Create a task
- `GET /api/v1/tasks/{id}` - Retrieve task details
- `PUT /api/v1/tasks/{id}` - Update task details & assignment
- `DELETE /api/v1/tasks/{id}` - Delete a task

### 👤 Users (`/api/v1/users`)
- `GET /api/v1/users/me` - Get current user profile
- `PUT /api/v1/users/me` - Update profile details
- `GET /api/v1/users/{id}` - Get user by ID
- `POST /api/v1/users/search` - Search user directory

### 📊 Dashboard & Reports (`/api/v1/dashboard`, `/api/v1/reports`)
- `GET /api/v1/dashboard/summary` - Executive KPI metrics
- `GET /api/v1/reports/projects/{id}` - Project progress report
- `GET /api/v1/reports/users/{id}` - User productivity analytics

### 🔍 Search & Calendar (`/api/v1/search`, `/api/v1/calendar`)
- `GET /api/v1/search?query={q}` - Global multi-entity search
- `GET /api/v1/calendar/weekly` - Weekly scheduled tasks map

---

## 📋 10. API Response Format

All API endpoints return a standardized JSON envelope (`ApiResponse<T>`):

### Success Response (`200 OK` / `201 Created`)
```json
{
  "success": true,
  "message": "Task created successfully",
  "data": {
    "id": 14,
    "title": "Build React Components",
    "status": "TODO",
    "priority": "HIGH",
    "estimatedHours": 12.5,
    "createdAt": "2026-07-13T10:00:00Z"
  },
  "errors": null,
  "timestamp": "2026-07-13T10:00:00Z"
}
```

### Error Response (`400 Bad Request` / `404 Not Found`)
```json
{
  "success": false,
  "message": "Resource not found with id: 99",
  "data": null,
  "errors": [
    "Project not found with id: 99"
  ],
  "timestamp": "2026-07-13T10:00:00Z"
}
```

---

## 📘 11. Swagger Documentation

TaskForge AI includes interactive API documentation powered by **SpringDoc OpenAPI 3.0**.

Once the application is running locally, open your browser to view and test all endpoints interactively:

```
http://localhost:8080/api/v1/swagger-ui/index.html
```

---

## ⚙️ 12. Installation Guide

### Prerequisites
- **Java Development Kit (JDK) 17** or higher
- **Apache Maven 3.8+** (or use the included `mvnw` wrapper)
- **MySQL 8.0+** instance (Local or Aiven Cloud)

### Step-by-Step Installation

1. **Clone the Repository**:
   ```bash
   git clone https://github.com/Jagadish0216/TaskForge-AI.git
   cd TaskForge-AI/backend
   ```

2. **Configure Database Settings**:

   - **Option A: Use Local MySQL**  
     Create a local database named `taskforge_db` and configure `src/main/resources/application-local.properties`:
     ```properties
     spring.datasource.url=jdbc:mysql://localhost:3306/taskforge_db?useSSL=false&serverTimezone=UTC&allowPublicKeyRetrieval=true
     spring.datasource.username=root
     spring.datasource.password=your_local_password
     ```

   - **Option B (Recommended): Use Aiven Cloud MySQL**  
     Configure your Aiven Cloud connection details in `src/main/resources/application-local.properties` (this file is Git-ignored for security):
     ```properties
     spring.datasource.url=jdbc:mysql://<aiven-host>:<port>/defaultdb?sslMode=REQUIRED
     spring.datasource.username=avnadmin
     spring.datasource.password=<aiven-password>
     ```

3. **Compile Application**:
   ```bash
   ./mvnw clean compile
   ```

---

## 🚀 13. Local Development Setup

To launch the backend locally with the `local` Spring profile active:

```bash
./mvnw spring-boot:run "-Dspring-boot.run.profiles=local"
```

The server will initialize Tomcat on port `8080` with context path `/api/v1`.

---

## 📐 14. Design Principles

TaskForge AI is engineered adhering to industry-standard backend design principles:

- 🏗 **Layered Architecture**: Strict separation between Controller, Service, Repository, and Model layers.
- 🔄 **DTO Pattern**: Separation of internal domain entities from public API request/response structures.
- 🏛 **Repository Pattern**: Abstraction of data persistence through Spring Data JPA interfaces.
- 💉 **Dependency Injection**: Explicit constructor injection across all components using Spring IoC.
- 🛡 **Global Exception Handling**: Centralized controller advice translating application exceptions into clean HTTP responses.
- ⚖ **SOLID Principles**: Single Responsibility Services, Open/Closed DTO designs, and Interface-driven implementations.

---

## 🗺 15. Future Roadmap

- [x] **Core Backend Modules**: Fully implemented and verified.
- [ ] **React Frontend**: Single Page Application featuring Kanban boards and Gantt view options.
- [ ] **Gemini AI Integration**: AI project planning assistance and sprint backlog suggestions.
- [ ] **Real-Time WebSockets**: Instant live notifications and real-time comment streaming.
- [ ] **Docker & CI/CD**: Containerized Docker image packaging and automated deployment workflows.

---

## 📂 16. GitHub Repository Structure

```
.
├── backend/                  # Spring Boot 3 Java Backend
│   ├── src/                  # Java Source Code & Application Resources
│   ├── mvnw                  # Linux/macOS Maven Wrapper
│   ├── mvnw.cmd              # Windows Maven Wrapper
│   └── pom.xml               # Project Dependencies & Build Plugins
├── frontend/                 # React Frontend Application (In Progress)
├── docs/                     # Architecture Documentation
├── CHANGELOG.md              # Project Version Log
├── LICENSE                   # MIT License File
└── README.md                 # Project Documentation
```

---

## 👤 17. Contributor

**Jagadish K**  
*Lead Developer*  
🎓 **Malla Reddy University**  
📜 **B.Tech Internet of Things (IoT)**

---

## 📜 18. License

This project is open-source software licensed under the **[MIT License](LICENSE)**.

---

## 🙏 19. Acknowledgements

- **Spring Boot Ecosystem**: For enabling rapid, reliable Java backend development.
- **Hibernate & MySQL**: For scalable object-relational data persistence.
- **Aiven Cloud**: For providing high-availability MySQL database hosting.
- **SpringDoc OpenAPI**: For seamless, interactive API documentation.
- **Open Source Community**: For ongoing inspiration and developer tooling.

---

## 📊 20. Project Status

| Component | Completion Status | Progress |
| :--- | :--- | :--- |
| **Backend Architecture** | ✅ Core Modules Implemented | `100%` |
| **Documentation & OpenAPI** | ✅ Completed | `95%` |
| **Frontend UI (React)** | 🚧 In Progress | `0%` |
| **AI Integration (Gemini)** | 🚧 Planned | `0%` |
| **Cloud Deployment** | 🚧 Planned | `0%` |

---

## 💡 21. Why This Project?

**TaskForge AI** was engineered to demonstrate core competencies in modern **backend engineering, software architecture, and cloud database integration**.

This project serves as a practical implementation for:
- **Enterprise Backend Architecture**: Implementing clean layered separation, constructor injection, and maintainable package structures.
- **REST API Development**: Designing standard, predictable RESTful APIs with uniform JSON envelopes and explicit HTTP status codes.
- **Database Design**: Modeling complex relational domain schemas with Hibernate ORM, cascade rules, and HikariCP connection pooling.
- **Team Collaboration Workflows**: Engineering task delegation, invitation states, nested comment hierarchies, and real-time activity timelines.
- **Cloud Database Integration**: Seamlessly configuring connection parameters for production cloud instances (Aiven Cloud MySQL).
- **Modular Software Engineering**: Designing decoupled domain modules ready to interface with frontend clients and AI providers.
- **AI-Ready Application Design**: Structuring data contracts and controllers to support intelligent sprint backlog generation and automated risk summaries.
