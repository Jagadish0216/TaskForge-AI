# TaskForge AI — 2-Minute Evaluator & Recruiter Walkthrough

This document provides a step-by-step demonstration script designed for technical recruiters, evaluators, and hiring managers reviewing **TaskForge AI**.

---

## ⏱️ Demonstration Script (2–3 Minutes)

### Step 1: Landing Page & Portfolio Overview
- **Action**: Open [https://taskforge-ai-psi.vercel.app/](https://taskforge-ai-psi.vercel.app/).
- **What to Notice**:
  - Technical "Engineering Control Surface" aesthetic: dark slate palette, minimal border radii, typography hierarchy, and zero marketing fluff.
  - Live system status indicators, key feature overview, and direct login presets.
- **Technical Highlight**: React 18 single-page app built with Vite and Tailwind CSS.

---

### Step 2: One-Click Demo Authentication (Project Manager)
- **Action**: Click **"Demo as Project Manager"** on the login page (or enter `manager@demo.taskforge.local` / `demo123`).
- **What to Notice**:
  - Instant authentication without manual typing.
  - User avatar and role badge (`Project Manager`) displayed in the top navbar and sidebar.
- **Technical Highlight**: Stateless JWT Access & Refresh Token exchange, BCrypt password verification, and Spring Security authority context binding.

---

### Step 3: Executive Dashboard & Workspace Metrics
- **Action**: Review the default **Dashboard** view.
- **What to Notice**:
  - Real-time project health metrics: Total Tasks, Completed Tasks, In Progress, and Velocity charts.
  - Workspace Switcher showing active project context (**PULSE**).
- **Technical Highlight**: RESTful aggregation endpoints calculated in Spring Boot with indexed JPA repository queries.

---

### Step 4: Workspace Navigation & PULSE Project Kanban Board
- **Action**: Click **"Projects"** in the sidebar, select **PULSE**, and switch to the **Kanban Board** tab.
- **What to Notice**:
  - 5-column Kanban layout: `Backlog`, `To Do`, `In Progress`, `In Review`, `Done`.
  - Exactly 10 canonical portfolio tasks cleanly distributed across columns.
  - Drag-and-drop or status dropdown updates for Kanban cards.
- **Technical Highlight**: State updates synchronized via REST API with strict RBAC permission checks (`@PreAuthorize`).

---

### Step 5: Project AI Co-Pilot (Structured Sprint Insights)
- **Action**: On the PULSE Project page, click the **"AI Insights Co-Pilot"** tab.
- **What to Notice**:
  - Structured sprint recommendation cards showing proposed tasks, priorities, estimated effort, and rationale.
  - Optional **"View Raw JSON"** toggle for developer inspection.
  - Zero raw JSON text dumps by default.
- **Technical Highlight**: Spring Boot `GeminiProvider` service invoking Google Gemini API, parsing structured JSON schema via `ObjectMapper`, and rendering React UI cards.

---

### Step 6: AI Mission Control — Risk Radar & Sprint Planner
- **Action**: Click **"AI Mission Control"** in the main sidebar.
- **What to Notice**:
  - **Risk Radar**: Automated analysis of project bottlenecks, capacity risks, and dependency bottlenecks.
  - **Sprint Planner**: Interactive input prompt to scaffold new sprints or project modules.
- **Technical Highlight**: Multi-intent AI routing (`intentDetector`) differentiating standard workspace chat from project generation flows.

---

### Step 7: Review-Before-Write AI Task Scaffolding
- **Action**: In Sprint Planner, generate or inspect proposed sprint tasks. Select specific check-boxes and click **"Apply Selected Tasks to Project"**.
- **What to Notice**:
  - **Human-in-the-Loop Safeguard**: AI suggestions are strictly transient until explicitly reviewed and approved by the user.
  - Upon confirmation, newly created tasks immediately appear on the PULSE Kanban board.
- **Technical Highlight**: Transactional backend batch task persistence (`@Transactional`) ensuring zero unintended database mutations until user approval.

---

### Step 8: Platform Admin Portal & Audit Logs
- **Action**: Log out and log back in as **Admin** (`admin@demo.taskforge.local` / `demo123`). Navigate to **Admin Control Surface**.
- **What to Notice**:
  - System-wide operational metrics: Total Users, Active Projects, System Health, and Global Activity Audit Log.
  - Full platform management tools restricted exclusively to System Administrators.
- **Technical Highlight**: Role-gated endpoints (`ROLE_ADMIN`) enforcing global authority boundaries.

---

### Step 9: Team Member RBAC Verification
- **Action**: Log out and log in as **Team Member** (`member@demo.taskforge.local` / `demo123`).
- **What to Notice**:
  - Team Member can view assigned projects/tasks, add comments, and update status on assigned Kanban cards.
  - Administrative options (Admin Portal, System Settings) are hidden and restricted.
- **Technical Highlight**: Dual-layer security (Frontend route guards + Backend API Spring Security authorization).

---

## 🔑 Canonical Demo Credentials Summary

| Role | Email | Password | Allowed Actions |
| :--- | :--- | :--- | :--- |
| **System Admin** | `admin@demo.taskforge.local` | `demo123` | Full system control, user management, global audit logs |
| **Project Manager** | `manager@demo.taskforge.local` | `demo123` | Create projects, manage team members, plan AI sprints |
| **Team Member** | `member@demo.taskforge.local` | `demo123` | View assigned projects, move Kanban cards, post comments |
