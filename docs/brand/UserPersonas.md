# TaskForge AI — User Personas & Target Audience Profiles

This document defines the 6 primary user personas for TaskForge AI. All product features, UX interactions, and marketing strategies must directly address the goals and pain points of these personas.

---

## Persona 1: The Student Capstone Team ("Campus Team")

```
   ┌─────────────────────────────────────────────────────────────┐
   │  NAME: Alex Rivera & Team (4 Developers)                    │
   │  ROLE: Senior B.Tech Computer Science Students             │
   │  EXPERIENCE: Intermediate React / Java / Python             │
   │  PRIMARY TOOL: VS Code, GitHub Public Repos, Discord        │
   └─────────────────────────────────────────────────────────────┘
```

### Goals
- Organate a 12-week capstone engineering project into manageable weekly milestones.
- Equalize workload distribution across team members without awkward manual assignment.
- Generate clean progress reports and milestone dashboards to present to faculty evaluators.

### Pain Points
- Enterprise tools like Jira are over-complicated and take days to configure properly.
- Simple tools like Trello lack code-centric metadata (task keys, commit references, priority chips).
- Free tiers of commercial tools often limit total users or project board counts.

### Daily Workflow
1. Opens TaskForge AI during morning Discord sync.
2. Checks the **Kanban Board** to see active tasks in `IN_PROGRESS` and `IN_REVIEW`.
3. Drags completed tasks to `DONE` and assigns remaining tasks for the week.
4. Uses **AI Sprint Generator** to automatically split major project deliverables into bite-sized tasks.

### How TaskForge AI Helps
- Pre-configured project templates allow instant setup (<30 seconds).
- AI backlog allocation splits complex assignment descriptions into actionable sub-tasks.
- Zero cost and zero administrative overhead.

---

## Persona 2: The Early-Stage Startup Founder ("Velocity Founder")

```
   ┌─────────────────────────────────────────────────────────────┐
   │  NAME: Priya Sharma                                         │
   │  ROLE: Co-Founder & CTO at Seed-Funded SaaS Startup        │
   │  EXPERIENCE: Senior Full-Stack Engineer                     │
   │  PRIMARY TOOL: Cursor, Terminal, TaskForge AI, Slack        │
   └─────────────────────────────────────────────────────────────┘
```

### Goals
- Move fast, ship features weekly, and maintain high code quality with a lean team of 5 engineers.
- Keep investors and stakeholders informed without spending hours writing manual status reports.
- Avoid spending $30+/user/month on bulky enterprise SaaS tools.

### Pain Points
- Context switching between Jira, GitHub, and Slack wastes precious development hours.
- Difficulty seeing team bandwidth and identifying delayed PR reviews before deadlines hit.

### Daily Workflow
1. Reviews the **Executive Dashboard** at 8:00 AM over coffee.
2. Inspects **Sprint Velocity Metrics** and **Status Distribution Ratios**.
3. Uses global search (`⌘K`) to jump directly to urgent customer-reported issues.
4. Triggers background **AI Sprint Backlog Allocation** to auto-balance workload for the upcoming sprint.

### How TaskForge AI Helps
- Instant Executive Dashboard provides a birds-eye view of company productivity.
- Dark-mode native interface feels like developer tooling rather than corporate software.

---

## Persona 3: The Senior Software Engineer ("Flow Developer")

```
   ┌─────────────────────────────────────────────────────────────┐
   │  NAME: Marcus Vance                                         │
   │  ROLE: Senior Backend Engineer                              │
   │  EXPERIENCE: 8+ Years Java / Spring Boot / Kubernetes       │
   │  PRIMARY TOOL: IntelliJ IDEA, Terminal, Neovim              │
   └─────────────────────────────────────────────────────────────┘
```

### Goals
- Maintain uninterrupted flow state while coding complex microservices.
- Easily view assigned tasks, update issue statuses, and reference requirements without slow page reloads.
- Minimize mandatory administrative meetings and ticket logging overhead.

### Pain Points
- Hates slow, laggy web applications that take 3+ seconds to load ticket details.
- Frustrated by cluttered menus with 50 irrelevant fields for a simple task update.

### Daily Workflow
1. Keeps TaskForge AI open on a secondary vertical display in Dark Mode.
2. Uses keyboard shortcuts to filter tasks assigned to `me`.
3. Opens task details modal to view attached API specs and comment discussion history.
4. Changes status from `IN_PROGRESS` to `IN_REVIEW` in one click via the quick-selector.

### How TaskForge AI Helps
- Sub-50ms reactive updates and keyboard-driven search (`⌘K`).
- Clean, uncluttered UI showing only what developers care about: title, requirements, priority, attachments, and discussion logs.

---

## Persona 4: The Technical Product Manager ("Agile PM")

```
   ┌─────────────────────────────────────────────────────────────┐
   │  NAME: Elena Rostova                                        │
   │  ROLE: Senior Product Manager                               │
   │  EXPERIENCE: 6 Years Managing Mobile & Web SaaS Products    │
   │  PRIMARY TOOL: TaskForge AI, Figma, Notion, Slack           │
   └─────────────────────────────────────────────────────────────┘
```

### Goals
- Track multi-project progress, feature epics, and milestone delivery dates.
- Facilitate smooth sprint grooming and backlog refinement sessions.
- Keep historical audit logs of comments, task edits, and version changes.

### Pain Points
- Out-of-date sprint status because developers dislike updating tickets in heavy systems.
- Lack of clear visual throughput reports for quarterly planning.

### Daily Workflow
1. Manages multiple active projects in the **Projects Directory**.
2. Swaps between **Kanban Board** view and **List Table** view depending on team sync type.
3. Reviews the **Reports Analytics** suite to analyze historical velocity bars and priority distributions.

### How TaskForge AI Helps
- Dual view toggle (Kanban & Table) adapts to both strategic overview and detailed ticket management.
- Recharts analytics automatically generate exportable velocity summaries.

---

## Persona 5: The Independent Freelancer ("Solo Creator")

```
   ┌─────────────────────────────────────────────────────────────┐
   │  NAME: Devyn Chen                                           │
   │  ROLE: Independent Full-Stack Freelance Consultant          │
   │  EXPERIENCE: 4 Years Full-Stack Web Development             │
   │  PRIMARY TOOL: VS Code, Figma, TaskForge AI, Stripe         │
   └─────────────────────────────────────────────────────────────┘
```

### Goals
- Manage multiple client projects simultaneously without mixing up deadlines or assets.
- Provide clients with view-only progress visibility to reduce status update calls.
- Track hours estimated vs. hours spent per deliverable.

### Pain Points
- Overpaying for complex enterprise licenses when working solo or with 1-2 collaborators.
- Scattered client requirements across email, messages, and document links.

### Daily Workflow
1. Organizes client projects by unique project keys (e.g., `CLIENT-A`, `CLIENT-B`).
2. Attaches API specs, mockups, and files directly to specific task cards.
3. Uses the **Calendar Grid View** to spot upcoming client delivery dates across all active projects.

### How TaskForge AI Helps
- Unified Calendar view aggregates deliverables across all isolated client projects.
- Role-based security (Owner vs. Viewer) makes sharing client updates effortless.

---

## Persona 6: The Engineering University Instructor ("Lab Coordinator")

```
   ┌─────────────────────────────────────────────────────────────┐
   │  NAME: Prof. Alan Thorne                                    │
   │  ROLE: Computer Science Professor & Lab Coordinator          │
   │  EXPERIENCE: 15 Years Software Engineering Education        │
   │  PRIMARY TOOL: LMS, Canvas, GitHub Classroom, TaskForge AI  │
   └─────────────────────────────────────────────────────────────┘
```

### Goals
- Monitor 15 student project groups simultaneously during a semester course.
- Assess individual student contribution levels via commit histories and task activity audit trails.
- Provide students with real-world industry agile tools.

### Pain Points
- Legacy grading setups don't reflect real software industry practices.
- Difficulty verifying if all group members contributed equally to project deliverables.

### Daily Workflow
1. Log in to TaskForge AI to view high-level project completion status for all lab groups.
2. Checks the **System Audit Timeline** to inspect real-time student activity logs.

### How TaskForge AI Helps
- Audit activity timeline logs precisely who created, edited, and completed every task.
- Industry-standard workflow preps students for professional software engineering roles.
