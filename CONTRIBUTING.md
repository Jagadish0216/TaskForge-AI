# Contributing to TaskForge AI

Thank you for your interest in contributing to **TaskForge AI**! This guide outlines the development workflow, coding standards, and submission guidelines.

---

## 🚀 Local Development Setup

### 1. Prerequisites
- **Java 17** or higher
- **Node.js 18+** & **npm 9+**
- **MySQL 8.0** (or embedded H2 for quick local testing)

### 2. Backend Environment
```bash
cd backend
./mvnw.cmd clean test
./mvnw.cmd spring-boot:run "-Dspring-boot.run.jvmArguments=-Dspring.profiles.active=local,h2"
```

### 3. Frontend Environment
```bash
cd frontend
npm install
npm run dev
```

---

## 🌿 Branch Naming Conventions

Use concise, descriptive branch names prefixed with the change type:

- `feat/<short-description>` — New features or feature enhancements
- `fix/<short-description>` — Bug fixes or defect repairs
- `refactor/<short-description>` — Code refactoring without changing functionality
- `docs/<short-description>` — Documentation updates or additions
- `test/<short-description>` — Adding or updating test cases

*Example:* `feat/kanban-drag-and-drop` or `fix/jwt-expiration-handling`.

---

## 📝 Commit Conventions

We follow the **Conventional Commits** specification:

```text
<type>(<scope>): <short description>
```

### Types:
- `feat`: A new user-facing or system feature
- `fix`: A bug fix
- `refactor`: A code change that neither fixes a bug nor adds a feature
- `docs`: Documentation changes
- `test`: Adding missing tests or correcting existing tests
- `chore`: Build system, configuration, or dependency updates

*Examples:*
- `feat(ai): add structured JSON parser for sprint planner`
- `fix(data): ensure DataInitializer seeding is idempotent`
- `docs(readme): update deployment architecture links`

---

## ✅ Testing Requirements

Before submitting any Pull Request:

1. **Backend Tests**: All Spring Boot unit and integration tests must pass cleanly:
   ```bash
   cd backend
   ./mvnw.cmd clean test
   ```
2. **Frontend Production Build**: The React frontend must compile without errors or linting failures:
   ```bash
   cd frontend
   npm run build
   ```
3. **Git Diff Check**: Ensure no trailing whitespace or formatting warnings exist:
   ```bash
   git diff --check
   ```

---

## 📥 Pull Request Expectations

- **Single Responsibility**: Keep PRs focused on a single logical task or issue.
- **No Secrets**: Verify that no API keys, credentials, or private configuration files (`.env`, `application-local.properties`) are included in your commit.
- **Description**: Include a clear summary of changes, motivation, and verification steps in your PR description.
