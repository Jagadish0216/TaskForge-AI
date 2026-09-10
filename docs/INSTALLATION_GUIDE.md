# 🛠️ TaskForge AI — Installation & Deployment Guide

This guide provides step-by-step instructions for installing, configuring, running, and deploying **TaskForge AI** across local development environments and production servers.

---

## 📋 1. System Requirements & Prerequisites

Prior to starting, verify that the following tools are installed on your workstation:

| Prerequisite | Minimum Version | Recommended Version | Verification Command |
| :--- | :--- | :--- | :--- |
| **Java Development Kit (JDK)** | Java 17 | JDK 17 (LTS) | `java -version` |
| **Node.js** | v18.0.0 | v20.x.x (LTS) | `node -v` |
| **NPM** | v9.0.0 | v10.x.x | `npm -v` |
| **Database** | MySQL 8.0 or embedded H2 | MySQL 8.0 | `mysql --version` |
| **Git** | v2.30 | Latest | `git --version` |

---

## 📁 2. Workspace Setup & Repository Cloning

```bash
# Clone the repository
git clone https://github.com/Jagadish0216/TaskForge-AI.git

# Navigate into the project root directory
cd TaskForge-AI
```

---

## 🗄️ 3. Database Configuration

### Option A: MySQL Database Setup (Recommended for Production)
1. Launch your MySQL Server instance.
2. Create the target database schema:
```sql
CREATE DATABASE taskforge_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```
3. Update `backend/src/main/resources/application.properties` or set environment variables:
```properties
spring.datasource.url=jdbc:mysql://localhost:3306/taskforge_db?useSSL=false&serverTimezone=UTC
spring.datasource.username=root
spring.datasource.password=YourSecurePassword
```

### Option B: Embedded H2 Database (Fast Local Testing)
To run without installing MySQL, active profile `h2` can be passed to Spring Boot:
```bash
./mvnw.cmd spring-boot:run -Dspring-boot.run.profiles=h2
```

---

## ☕ 4. Backend Installation & Execution

1. Navigate to the `backend` folder:
```bash
cd backend
```

2. Compile source code and download dependencies using Maven Wrapper:
```bash
./mvnw.cmd clean compile
```

3. Run the automated unit & integration test suite:
```bash
./mvnw.cmd test
```

4. Launch the Spring Boot backend server:
```bash
./mvnw.cmd spring-boot:run
```

The server will initialize on `http://localhost:8080/api/v1`.  
Swagger UI will be accessible at `http://localhost:8080/api/v1/swagger-ui.html`.

---

## ⚛️ 5. Frontend Installation & Execution

1. Open a new terminal window and navigate to the `frontend` directory:
```bash
cd frontend
```

2. Install NPM package dependencies:
```bash
npm install
```

3. Verify production compilation build:
```bash
cmd.exe /c "npm run build"
```

4. Start the frontend Vite development server:
```bash
npm run dev
```

The web application will open automatically at `http://localhost:5173`.

---

## 🔑 6. Google OAuth 2.0 Client Setup

To enable live Google Sign-In:

1. Go to the [Google Cloud Console](https://console.cloud.google.com/).
2. Create a new Project and navigate to **APIs & Services > Credentials**.
3. Create an **OAuth 2.0 Client ID** (Application Type: Web Application).
4. Add Authorized JavaScript Origins: `http://localhost:5173` and `http://localhost:8080`.
5. Copy your Client ID and configure environment variable:
```bash
# In backend application.properties or shell:
export GOOGLE_CLIENT_ID="your-client-id.apps.googleusercontent.com"
```

---

## 🐳 7. Production JAR Packaging & Deployment

To package TaskForge AI into a standalone executable JAR file:

```bash
cd backend
./mvnw.cmd clean package -DskipTests
```

The compiled binary `taskforge-backend-0.0.1-SNAPSHOT.jar` will be located in the `target/` directory.

Run the binary:
```bash
java -jar target/taskforge-backend-0.0.1-SNAPSHOT.jar
```

---

## ❓ 8. Troubleshooting & Diagnostics

- **Port 8080 Already in Use**: Change `server.port=8081` in `application.properties`.
- **CORS Error on Frontend**: Ensure `cors.allowed-origins` includes your frontend URL (`http://localhost:5173`).
- **Token Expiration in Testing**: Adjust `jwt.access-token-expiration-ms` in `application.properties`.
