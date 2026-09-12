# Security Policy — TaskForge AI

Security is a core requirement for TaskForge AI. This document outlines our security posture, credential handling practices, and reporting procedures for security vulnerabilities.

---

## 🔒 Security Architecture & Credential Management

### 1. Zero Secrets in Source Control
- **No Hardcoded Secrets**: Production secrets, JWT signing keys, database passwords, and API credentials are **never** committed to source code or tracked configuration files.
- **Environment Variables**: Configurations rely on environment variables (`SPRING_DATASOURCE_URL`, `JWT_SECRET`, `GEMINI_API_KEY`, etc.) injected at runtime by host environments (e.g., Render, Vercel, Docker).
- **Tracked Defaults**: Standard tracked properties (`application.properties`) specify unpopulated environment placeholders without default secret fallbacks. Local development fallbacks are restricted to git-ignored files (`application-local.properties`).

### 2. Backend-Only API Secrets
- **Google Gemini API Key**: The `GEMINI_API_KEY` is maintained **strictly on the Spring Boot backend**. Frontend clients never interact with or receive raw Gemini API tokens.
- **API Request Proxies**: All AI processing requests pass through authenticated backend controller endpoints (`/api/v1/ai/*`), enforcing JWT validation and rate-limiting before communicating with Google APIs.

### 3. JWT Authentication & Password Safety
- **Stateless Tokens**: Authentication uses stateless JWTs signed with HMAC-SHA512 (`HS512`).
- **Token Expiration**: Access tokens default to 24-hour expiration (`JWT_ACCESS_EXPIRATION_MS`), and refresh tokens to 7-day expiration (`JWT_REFRESH_EXPIRATION_MS`).
- **Password Hashing**: User credentials are stored using **BCrypt password hashing** with standard salt rounds. Plaintext passwords are never logged or stored.

### 4. Role-Based Access Control (RBAC)
- Authority checks are enforced at both the Spring Security filter layer and API service layer using `@PreAuthorize` annotations and fine-grained repository ownership checks (`ProjectAuthorizationService`).
- Cross-tenant data leaks are prevented by scoping queries to active user memberships.

---

## ⚠️ Reporting a Vulnerability

If you discover a potential security vulnerability in TaskForge AI:

1. **Do NOT open a public GitHub issue.**
2. Send a detailed report to the repository maintainer.
3. Include the following details in your report:
   - Type of issue (e.g., SQL injection, XSS, broken access control, token leakage)
   - Step-by-step instructions or proof-of-concept to reproduce the vulnerability
   - Potential impact of the issue
   - Any suggested remediations

### Public Issue Hygiene
- **Never submit real credentials**, API keys, database connection strings, or authorization headers in public GitHub issues, PRs, or comments.
- Obfuscate all domain names and sensitive parameters when pasting log output or HTTP traces.
