package com.taskforge.config;

import com.taskforge.common.constant.*;
import com.taskforge.module.activity.entity.ActivityLog;
import com.taskforge.module.activity.repository.ActivityLogRepository;
import com.taskforge.module.notification.entity.Notification;
import com.taskforge.module.notification.repository.NotificationRepository;
import com.taskforge.module.project.entity.Project;
import com.taskforge.module.project.entity.ProjectMember;
import com.taskforge.module.project.repository.ProjectMemberRepository;
import com.taskforge.module.project.repository.ProjectRepository;
import com.taskforge.module.task.entity.Comment;
import com.taskforge.module.task.entity.Task;
import com.taskforge.module.task.repository.CommentRepository;
import com.taskforge.module.task.repository.TaskRepository;
import com.taskforge.module.user.entity.Role;
import com.taskforge.module.user.entity.User;
import com.taskforge.module.user.repository.RoleRepository;
import com.taskforge.module.user.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.*;

/**
 * Component to seed baseline system roles and realistic development/demo data.
 */
@Component
public class DataInitializer implements CommandLineRunner {

    private static final Logger log = LoggerFactory.getLogger(DataInitializer.class);

    private final RoleRepository roleRepository;
    private final UserRepository userRepository;
    private final ProjectRepository projectRepository;
    private final ProjectMemberRepository projectMemberRepository;
    private final TaskRepository taskRepository;
    private final CommentRepository commentRepository;
    private final ActivityLogRepository activityLogRepository;
    private final NotificationRepository notificationRepository;
    private final PasswordEncoder passwordEncoder;

    @Value("${app.seed-demo-data:false}")
    private boolean seedDemoData;

    public DataInitializer(
            RoleRepository roleRepository,
            UserRepository userRepository,
            ProjectRepository projectRepository,
            ProjectMemberRepository projectMemberRepository,
            TaskRepository taskRepository,
            CommentRepository commentRepository,
            ActivityLogRepository activityLogRepository,
            NotificationRepository notificationRepository,
            PasswordEncoder passwordEncoder) {
        this.roleRepository = roleRepository;
        this.userRepository = userRepository;
        this.projectRepository = projectRepository;
        this.projectMemberRepository = projectMemberRepository;
        this.taskRepository = taskRepository;
        this.commentRepository = commentRepository;
        this.activityLogRepository = activityLogRepository;
        this.notificationRepository = notificationRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    @Transactional
    public void run(String... args) {
        log.info("Initializing baseline system roles...");
        Map<UserRole, Role> roleMap = initRoles();

        if (!seedDemoData) {
            log.info("Demo data seeding is disabled via configuration.");
            return;
        }

        if (userRepository.existsByEmail("alex@demo.taskforge.local") || projectRepository.existsByProjectKey("PULSE")) {
            log.info("Demo dataset already initialized. Skipping seed.");
            return;
        }

        log.info("Seeding realistic development/demo dataset...");
        seedDataset(roleMap);
        log.info("Development/demo dataset successfully seeded!");
    }

    private Map<UserRole, Role> initRoles() {
        Map<UserRole, Role> roleMap = new EnumMap<>(UserRole.class);
        Arrays.stream(UserRole.values()).forEach(userRole -> {
            Role role = roleRepository.findByName(userRole).orElseGet(() -> {
                Role newRole = new Role();
                newRole.setName(userRole);
                return roleRepository.save(newRole);
            });
            roleMap.put(userRole, role);
        });
        return roleMap;
    }

    private void seedDataset(Map<UserRole, Role> roleMap) {
        String encodedPassword = passwordEncoder.encode("Password123!");

        // 1. Create Users
        User alex = createUser("alex@demo.taskforge.local", encodedPassword, "Alex", "Vance", "alex.vance",
                "Engineering", "VP of Engineering", "Engineering lead for platform infrastructure and security.",
                "Java, Spring Boot, MySQL, Security", roleMap.get(UserRole.ROLE_ADMIN));

        User maya = createUser("maya@demo.taskforge.local", encodedPassword, "Maya", "Lin", "maya.lin",
                "Product", "Senior Product Manager", "Driving agile product roadmap and sprint delivery.",
                "Agile, Product Strategy, Roadmap", roleMap.get(UserRole.ROLE_PROJECT_MANAGER));

        User david = createUser("david@demo.taskforge.local", encodedPassword, "David", "Chen", "david.chen",
                "Engineering", "Full Stack Engineer", "Focusing on React UI components and REST API integration.",
                "React, TypeScript, TailwindCSS", roleMap.get(UserRole.ROLE_TEAM_MEMBER));

        User sarah = createUser("sarah@demo.taskforge.local", encodedPassword, "Sarah", "Jenkins", "sarah.jenkins",
                "Engineering", "Staff Backend Engineer", "Architecting high-performance Java microservices.",
                "Java 21, JPA, Microservices, Redis", roleMap.get(UserRole.ROLE_TEAM_MEMBER));

        User marcus = createUser("marcus@demo.taskforge.local", encodedPassword, "Marcus", "Rostov", "marcus.rostov",
                "DevOps", "DevOps Specialist", "Managing CI/CD pipelines, Docker containers, and Cloud infrastructure.",
                "Docker, Kubernetes, CI/CD, AWS", roleMap.get(UserRole.ROLE_TEAM_MEMBER));

        User elena = createUser("elena@demo.taskforge.local", encodedPassword, "Elena", "Kowalski", "elena.kowalski",
                "Quality", "QA Automation Engineer", "Ensuring high test coverage and automated integration tests.",
                "JUnit 5, Selenium, Playwright", roleMap.get(UserRole.ROLE_TEAM_MEMBER));

        User jordan = createUser("jordan@demo.taskforge.local", encodedPassword, "Jordan", "Taylor", "jordan.taylor",
                "Design", "Senior Product Designer", "Crafting modern UI/UX design systems and wireframes.",
                "Figma, UI/UX, Design Tokens", roleMap.get(UserRole.ROLE_TEAM_MEMBER));

        // 2. Create Projects
        LocalDate now = LocalDate.now();
        Project pulse = createProject("Pulse Analytics Platform", "PULSE",
                "Real-time streaming analytics engine for user interaction events and performance telemetry.",
                ProjectStatus.IN_PROGRESS, ProjectPriority.HIGH, ProjectVisibility.PUBLIC,
                now.minusDays(30), now.plusDays(60), "Spring Boot, React, PostgreSQL, Redis", "5-10", "Development", maya);

        Project orbit = createProject("Orbit Mobile App", "ORBIT",
                "Cross-platform mobile application for real-time task tracking and push notification alerts.",
                ProjectStatus.IN_PROGRESS, ProjectPriority.URGENT, ProjectVisibility.PUBLIC,
                now.minusDays(20), now.plusDays(40), "React Native, GraphQL, Node.js", "1-5", "Beta Testing", maya);

        Project atlas = createProject("Atlas Core API", "ATLAS",
                "Centralized REST gateway and core domain microservices supporting TaskForge AI.",
                ProjectStatus.COMPLETED, ProjectPriority.MEDIUM, ProjectVisibility.PUBLIC,
                now.minusDays(90), now.minusDays(5), "Java 21, Spring Cloud, MySQL", "5-10", "Production", alex);

        Project nova = createProject("Nova E-Commerce Engine", "NOVA",
                "Next-gen merchant storefront with automated inventory reconciliation and AI recommendations.",
                ProjectStatus.PLANNING, ProjectPriority.LOW, ProjectVisibility.PRIVATE,
                now.minusDays(5), now.plusDays(90), "Next.js, TailwindCSS, Microservices", "1-5", "Discovery", alex);

        // 3. Create Project Members
        addMember(pulse, maya, ProjectMemberRole.OWNER);
        addMember(pulse, sarah, ProjectMemberRole.MANAGER);
        addMember(pulse, david, ProjectMemberRole.MEMBER);
        addMember(pulse, marcus, ProjectMemberRole.MEMBER);
        addMember(pulse, elena, ProjectMemberRole.MEMBER);
        addMember(pulse, jordan, ProjectMemberRole.VIEWER);

        addMember(orbit, maya, ProjectMemberRole.OWNER);
        addMember(orbit, jordan, ProjectMemberRole.MANAGER);
        addMember(orbit, sarah, ProjectMemberRole.MEMBER);
        addMember(orbit, david, ProjectMemberRole.MEMBER);
        addMember(orbit, alex, ProjectMemberRole.MEMBER);

        addMember(atlas, alex, ProjectMemberRole.OWNER);
        addMember(atlas, marcus, ProjectMemberRole.MANAGER);
        addMember(atlas, sarah, ProjectMemberRole.MEMBER);
        addMember(atlas, david, ProjectMemberRole.MEMBER);
        addMember(atlas, elena, ProjectMemberRole.VIEWER);

        addMember(nova, alex, ProjectMemberRole.OWNER);
        addMember(nova, maya, ProjectMemberRole.MANAGER);
        addMember(nova, jordan, ProjectMemberRole.MEMBER);
        addMember(nova, elena, ProjectMemberRole.MEMBER);
        addMember(nova, marcus, ProjectMemberRole.MEMBER);

        // 4. Create Tasks
        List<Task> allTasks = new ArrayList<>();

        // --- PULSE (8 Tasks) ---
        allTasks.add(createTask("Implement OAuth2 JWT authentication flow", "Secure login and token refresh logic using BCrypt and Spring Security.", TaskStatus.DONE, TaskPriority.HIGH, now.minusDays(25), now.minusDays(20), now.minusDays(21), 16, 14, pulse, sarah, maya));
        allTasks.add(createTask("Optimize BigQuery project search index queries", "Refactor JPA queries to eliminate N+1 scans and leverage GROUP BY projections.", TaskStatus.DONE, TaskPriority.HIGH, now.minusDays(20), now.minusDays(15), now.minusDays(14), 12, 10, pulse, sarah, maya));
        allTasks.add(createTask("Build Redis caching layer for task statistics", "Cache summary metrics in Redis to improve dashboard load latency.", TaskStatus.DONE, TaskPriority.MEDIUM, now.minusDays(15), now.minusDays(10), now.minusDays(9), 8, 8, pulse, marcus, sarah));
        allTasks.add(createTask("Design responsive Kanban drag-and-drop board", "Implement @dnd-kit integration for smooth card reordering across columns.", TaskStatus.DONE, TaskPriority.HIGH, now.minusDays(12), now.minusDays(5), now.minusDays(6), 16, 18, pulse, david, maya));
        allTasks.add(createTask("Set up Prometheus and Grafana metrics dashboard", "Configure Micrometer metrics exporter for JVM and HTTP throughput telemetry.", TaskStatus.DONE, TaskPriority.MEDIUM, now.minusDays(10), now.minusDays(3), now.minusDays(4), 10, 9, pulse, marcus, alex));
        allTasks.add(createTask("Fix CORS preflight credential header handling", "Ensure Access-Control-Allow-Credentials: true is returned for frontend calls.", TaskStatus.IN_PROGRESS, TaskPriority.URGENT, now.minusDays(4), now.minusDays(2), null, 6, 4, pulse, david, sarah)); // Overdue
        allTasks.add(createTask("Integrate Gemini AI sprint planning prompt pipeline", "Connect backend AI service with Google Gemini API for automated backlog estimation.", TaskStatus.IN_PROGRESS, TaskPriority.HIGH, now.minusDays(3), now.plusDays(4), null, 20, 8, pulse, sarah, maya));
        allTasks.add(createTask("Audit database indexes for activity log queries", "Add composite index on (project_id, created_at) to speed up timeline fetching.", TaskStatus.TODO, TaskPriority.LOW, now.minusDays(1), now.plusDays(7), null, 6, 0, pulse, marcus, sarah));

        // --- ORBIT (8 Tasks) ---
        allTasks.add(createTask("Design mobile task detail modal drawer", "Create fluid touch-friendly task drawer with tabs for comments and history.", TaskStatus.DONE, TaskPriority.HIGH, now.minusDays(18), now.minusDays(12), now.minusDays(11), 12, 11, orbit, jordan, maya));
        allTasks.add(createTask("Configure WebSocket channel for live task updates", "Set up STOMP over WebSocket for real-time task status sync across devices.", TaskStatus.DONE, TaskPriority.HIGH, now.minusDays(14), now.minusDays(8), now.minusDays(7), 16, 15, orbit, sarah, jordan));
        allTasks.add(createTask("Implement push notification service for task assignment", "Integrate FCM push triggers when a user is assigned to a high-priority task.", TaskStatus.DONE, TaskPriority.MEDIUM, now.minusDays(10), now.minusDays(4), now.minusDays(5), 10, 10, orbit, david, maya));
        allTasks.add(createTask("Build offline storage & local sync database", "Cache active tasks locally using WatermelonDB for offline drafting.", TaskStatus.DONE, TaskPriority.MEDIUM, now.minusDays(8), now.minusDays(2), now.minusDays(2), 14, 16, orbit, david, jordan));
        allTasks.add(createTask("Refactor user authorization middleware", "Ensure fine-grained project membership checks on all REST endpoints.", TaskStatus.IN_REVIEW, TaskPriority.URGENT, now.minusDays(5), now.plusDays(1), null, 8, 7, orbit, alex, maya));
        allTasks.add(createTask("Fix responsive layout shift on mobile navbar", "Eliminate layout shifts during theme toggle and sidebar drawer animation.", TaskStatus.IN_REVIEW, TaskPriority.LOW, now.minusDays(3), now.plusDays(3), null, 4, 3, orbit, jordan, maya));
        allTasks.add(createTask("Add Dark Mode design token utilities", "Update CSS custom properties for sleek high-contrast dark palette.", TaskStatus.IN_PROGRESS, TaskPriority.MEDIUM, now.minusDays(2), now.plusDays(5), null, 8, 3, orbit, jordan, maya));
        allTasks.add(createTask("Write Playwright end-to-end user registration tests", "Automate E2E test scripts covering login, signup, and project navigation.", TaskStatus.BACKLOG, TaskPriority.LOW, now, now.plusDays(10), null, 12, 0, orbit, elena, maya));

        // --- ATLAS (8 Tasks) ---
        allTasks.add(createTask("Implement global search endpoint with pagination", "Build JPA Specification multi-field keyword search across projects and tasks.", TaskStatus.DONE, TaskPriority.HIGH, now.minusDays(80), now.minusDays(75), now.minusDays(74), 16, 14, atlas, sarah, alex));
        allTasks.add(createTask("Add exportable CSV report generation endpoint", "Create streaming CSV download controller for project completion metrics.", TaskStatus.DONE, TaskPriority.MEDIUM, now.minusDays(70), now.minusDays(65), now.minusDays(66), 8, 7, atlas, david, marcus));
        allTasks.add(createTask("Set up Docker multi-stage build for production deployment", "Optimize Spring Boot Docker image size using layered JAR building.", TaskStatus.DONE, TaskPriority.MEDIUM, now.minusDays(60), now.minusDays(55), now.minusDays(56), 6, 6, atlas, marcus, alex));
        allTasks.add(createTask("Write JUnit 5 integration tests for TaskService", "Achieve 85%+ code coverage across core business logic services.", TaskStatus.DONE, TaskPriority.HIGH, now.minusDays(50), now.minusDays(42), now.minusDays(43), 20, 19, atlas, elena, marcus));
        allTasks.add(createTask("Configure MySQL connection pool health checks", "Tune HikariCP pool parameters and keep-alive query validation.", TaskStatus.DONE, TaskPriority.LOW, now.minusDays(40), now.minusDays(35), now.minusDays(36), 4, 4, atlas, marcus, alex));
        allTasks.add(createTask("Build team permission matrix audit view", "Create RBAC permission matrix mapping roles to capability flags.", TaskStatus.DONE, TaskPriority.MEDIUM, now.minusDays(30), now.minusDays(25), now.minusDays(24), 10, 11, atlas, david, alex));
        allTasks.add(createTask("Write API documentation with Swagger/OpenAPI", "Annotate REST endpoints with OpenAPI annotations and example schemas.", TaskStatus.DONE, TaskPriority.LOW, now.minusDays(20), now.minusDays(15), now.minusDays(16), 8, 8, atlas, sarah, marcus));
        allTasks.add(createTask("Implement automated database backup cron job", "Schedule nightly GCS database dump script with 30-day retention.", TaskStatus.IN_REVIEW, TaskPriority.HIGH, now.minusDays(10), now.plusDays(2), null, 6, 5, atlas, marcus, alex));

        // --- NOVA (8 Tasks) ---
        allTasks.add(createTask("Configure Flyway database migration scripts", "Set up versioned SQL migration scripts for schema evolution.", TaskStatus.DONE, TaskPriority.MEDIUM, now.minusDays(4), now.minusDays(2), now.minusDays(2), 6, 6, nova, marcus, alex));
        allTasks.add(createTask("Set up CI/CD GitHub Actions workflow", "Automate linting, unit testing, and Docker build on pull request push.", TaskStatus.DONE, TaskPriority.HIGH, now.minusDays(3), now.minusDays(1), now.minusDays(1), 8, 7, nova, marcus, maya));
        allTasks.add(createTask("Add rate limiting middleware to public endpoints", "Enforce Bucket4j token bucket rate limiting on public API routes.", TaskStatus.IN_PROGRESS, TaskPriority.URGENT, now.minusDays(2), now.minusDays(1), null, 6, 4, nova, sarah, alex)); // Overdue
        allTasks.add(createTask("Design merchant inventory dashboard wireframes", "Create high-fidelity Figma mockups for product management view.", TaskStatus.IN_PROGRESS, TaskPriority.MEDIUM, now.minusDays(1), now.plusDays(4), null, 12, 5, nova, jordan, maya));
        allTasks.add(createTask("Implement file upload size validation", "Restrict avatar and attachment uploads to 10MB max size.", TaskStatus.TODO, TaskPriority.LOW, now, now.plusDays(6), null, 4, 0, nova, david, maya));
        allTasks.add(createTask("Add user notification preferences settings page", "Allow users to toggle email vs push channels for workspace events.", TaskStatus.TODO, TaskPriority.MEDIUM, now, now.plusDays(8), null, 8, 0, nova, jordan, alex));
        allTasks.add(createTask("Benchmark dashboard aggregate query latency", "Measure response time of Dashboard summary endpoint under concurrency.", TaskStatus.BACKLOG, TaskPriority.LOW, now.plusDays(1), now.plusDays(12), null, 6, 0, nova, elena, maya));
        allTasks.add(createTask("Implement automated invoice PDF generator", "Generate PDF transaction summaries using JasperReports.", TaskStatus.BACKLOG, TaskPriority.LOW, now.plusDays(2), now.plusDays(15), null, 16, 0, nova, david, alex));

        // 5. Create Comments
        createComment("PR is submitted and ready for review! Refactored the token interceptor to avoid infinite loops.", allTasks.get(0), sarah, null);
        createComment("Verified token refresh flow locally. Tests pass cleanly.", allTasks.get(0), maya, null);

        createComment("Reduced query latency from 420ms to 18ms by adding the composite index.", allTasks.get(1), sarah, null);
        createComment("Awesome optimization! Merging into main branch.", allTasks.get(1), maya, null);

        createComment("Redis cache TTL is set to 15 minutes. Cache invalidation triggers on task status change.", allTasks.get(2), marcus, null);

        createComment("The @dnd-kit drag animation feels super smooth now. Added haptic feedback for mobile.", allTasks.get(3), david, null);
        createComment("Great work on the accessibility keyboard navigation support!", allTasks.get(3), jordan, null);

        createComment("CORS preflight request was failing because Access-Control-Allow-Credentials header was missing. Fixed in SecurityConfig.", allTasks.get(5), david, null);

        createComment("Prompt pipeline supports context window injection for active sprint backlog.", allTasks.get(6), sarah, null);

        createComment("Drawer panel includes focus trap and keyboard ESC listener for ARIA compliance.", allTasks.get(8), jordan, null);

        createComment("STOMP over SockJS fallback tested across Firefox and Safari.", allTasks.get(9), sarah, null);

        createComment("FCM push payload configured with custom click_action metadata.", allTasks.get(10), david, null);

        createComment("Middleware checks whether current user is an active member or owner of target project.", allTasks.get(12), alex, null);
        createComment("Could we add a unit test covering forbidden access scenarios?", allTasks.get(12), elena, null);

        createComment("Global keyword search covers project name, key, and task title with case-insensitive matching.", allTasks.get(16), sarah, null);

        createComment("CSV streaming exporter uses Apache Commons CSV for zero-memory footprint.", allTasks.get(17), david, null);

        createComment("Docker image size reduced from 450MB down to 180MB using Eclipse Temurin JRE base image.", allTasks.get(18), marcus, null);

        createComment("Swagger UI accessible at /api/v1/swagger-ui.html with Bearer JWT authorize button.", allTasks.get(22), sarah, null);

        createComment("Rate limiter returns HTTP 429 Too Many Requests when bucket capacity is exhausted.", allTasks.get(26), sarah, null);

        // 6. Create Activity Logs
        createActivityLog(ActivityType.PROJECT_CREATED, "Project 'Pulse Analytics Platform' was created by Maya Lin.", pulse, null, maya);
        createActivityLog(ActivityType.MEMBER_JOINED, "Sarah Jenkins joined project 'Pulse Analytics Platform' as MANAGER.", pulse, null, sarah);
        createActivityLog(ActivityType.TASK_CREATED, "Task 'Implement OAuth2 JWT authentication flow' created in PULSE.", pulse, allTasks.get(0), maya);
        createActivityLog(ActivityType.TASK_COMPLETED, "Task 'Implement OAuth2 JWT authentication flow' completed by Sarah Jenkins.", pulse, allTasks.get(0), sarah);
        createActivityLog(ActivityType.TASK_CREATED, "Task 'Optimize BigQuery project search index queries' created in PULSE.", pulse, allTasks.get(1), maya);
        createActivityLog(ActivityType.TASK_COMPLETED, "Task 'Optimize BigQuery project search index queries' completed by Sarah Jenkins.", pulse, allTasks.get(1), sarah);
        createActivityLog(ActivityType.COMMENT_ADDED, "Comment added on task 'Fix CORS preflight credential header handling'.", pulse, allTasks.get(5), david);

        createActivityLog(ActivityType.PROJECT_CREATED, "Project 'Orbit Mobile App' was created by Maya Lin.", orbit, null, maya);
        createActivityLog(ActivityType.MEMBER_JOINED, "Jordan Taylor joined project 'Orbit Mobile App' as MANAGER.", orbit, null, jordan);
        createActivityLog(ActivityType.TASK_CREATED, "Task 'Design mobile task detail modal drawer' created in ORBIT.", orbit, allTasks.get(8), maya);
        createActivityLog(ActivityType.TASK_COMPLETED, "Task 'Design mobile task detail modal drawer' completed by Jordan Taylor.", orbit, allTasks.get(8), jordan);

        createActivityLog(ActivityType.PROJECT_CREATED, "Project 'Atlas Core API' was created by Alex Vance.", atlas, null, alex);
        createActivityLog(ActivityType.TASK_CREATED, "Task 'Implement global search endpoint with pagination' created in ATLAS.", atlas, allTasks.get(16), alex);
        createActivityLog(ActivityType.TASK_COMPLETED, "Task 'Implement global search endpoint with pagination' completed by Sarah Jenkins.", atlas, allTasks.get(16), sarah);

        createActivityLog(ActivityType.PROJECT_CREATED, "Project 'Nova E-Commerce Engine' was created by Alex Vance.", nova, null, alex);
        createActivityLog(ActivityType.TASK_CREATED, "Task 'Configure Flyway database migration scripts' created in NOVA.", nova, allTasks.get(24), alex);
        createActivityLog(ActivityType.TASK_COMPLETED, "Task 'Configure Flyway database migration scripts' completed by Marcus Rostov.", nova, allTasks.get(24), marcus);

        // 7. Create Notifications
        createNotification("Task Assignment", "You have been assigned to task 'Fix CORS preflight credential header handling' in Pulse Analytics Platform.", NotificationType.TASK_ASSIGNED, false, david);
        createNotification("Task Assignment", "You have been assigned to task 'Integrate Gemini AI sprint planning prompt pipeline' in Pulse Analytics Platform.", NotificationType.TASK_ASSIGNED, false, sarah);
        createNotification("Overdue Task Alert", "Task 'Fix CORS preflight credential header handling' is overdue since yesterday.", NotificationType.TASK_OVERDUE, false, david);
        createNotification("Overdue Task Alert", "Task 'Add rate limiting middleware to public endpoints' is overdue.", NotificationType.TASK_OVERDUE, false, sarah);
        createNotification("Project Invitation", "You were added as MANAGER to project 'Orbit Mobile App'.", NotificationType.PROJECT_INVITATION, true, jordan);
        createNotification("Comment Added", "Sarah Jenkins commented on task 'Implement OAuth2 JWT authentication flow'.", NotificationType.COMMENT_ADDED, true, maya);
        createNotification("Task Status Updated", "Task 'Refactor user authorization middleware' moved to IN_REVIEW.", NotificationType.TASK_STATUS_UPDATED, false, maya);
        createNotification("Task Assignment", "You have been assigned to task 'Design merchant inventory dashboard wireframes'.", NotificationType.TASK_ASSIGNED, false, jordan);
        createNotification("Task Assignment", "You have been assigned to task 'Refactor user authorization middleware'.", NotificationType.TASK_ASSIGNED, true, alex);
    }

    private User createUser(String email, String encodedPassword, String firstName, String lastName, String username,
                            String department, String designation, String bio, String skills, Role role) {
        User user = new User();
        user.setEmail(email);
        user.setPassword(encodedPassword);
        user.setFirstName(firstName);
        user.setLastName(lastName);
        user.setUsername(username);
        user.setDepartment(department);
        user.setDesignation(designation);
        user.setBio(bio);
        user.setSkills(skills);
        user.setEnabled(true);
        user.setDeleted(false);
        if (role != null) {
            user.getRoles().add(role);
        }
        return userRepository.save(user);
    }

    private Project createProject(String name, String key, String description, ProjectStatus status,
                                  ProjectPriority priority, ProjectVisibility visibility,
                                  LocalDate startDate, LocalDate endDate, String techStack,
                                  String teamSize, String phase, User owner) {
        Project project = new Project();
        project.setName(name);
        project.setProjectKey(key);
        project.setDescription(description);
        project.setStatus(status);
        project.setPriority(priority);
        project.setVisibility(visibility);
        project.setStartDate(startDate);
        project.setEndDate(endDate);
        project.setTechStack(techStack);
        project.setTeamSize(teamSize);
        project.setPhase(phase);
        project.setOwner(owner);
        project.setArchived(false);
        project.setAiGenerated(false);
        return projectRepository.save(project);
    }

    private void addMember(Project project, User user, ProjectMemberRole role) {
        ProjectMember member = new ProjectMember();
        member.setProject(project);
        member.setUser(user);
        member.setRole(role);
        projectMemberRepository.save(member);
    }

    private Task createTask(String title, String description, TaskStatus status, TaskPriority priority,
                            LocalDate startDate, LocalDate dueDate, LocalDate completedDate,
                            Integer estimatedHours, Integer actualHours, Project project, User assignee, User assignedBy) {
        Task task = new Task();
        task.setTitle(title);
        task.setDescription(description);
        task.setStatus(status);
        task.setPriority(priority);
        task.setStartDate(startDate);
        task.setDueDate(dueDate);
        task.setCompletedDate(completedDate);
        task.setEstimatedHours(estimatedHours);
        task.setActualHours(actualHours);
        task.setProject(project);
        task.setAssignee(assignee);
        task.setAssignedBy(assignedBy);
        if (assignee != null) {
            task.setAssignedDate(java.time.LocalDateTime.now().minusDays(2));
        }
        return taskRepository.save(task);
    }

    private void createComment(String content, Task task, User author, Comment parent) {
        Comment comment = new Comment();
        comment.setContent(content);
        comment.setTask(task);
        comment.setAuthor(author);
        comment.setParentComment(parent);
        comment.setDeleted(false);
        comment.setEdited(false);
        commentRepository.save(comment);
    }

    private void createActivityLog(ActivityType type, String description, Project project, Task task, User user) {
        ActivityLog log = new ActivityLog();
        log.setType(type);
        log.setDescription(description);
        log.setProject(project);
        log.setTask(task);
        log.setUser(user);
        activityLogRepository.save(log);
    }

    private void createNotification(String title, String message, NotificationType type, boolean isRead, User recipient) {
        Notification notification = new Notification();
        notification.setTitle(title);
        notification.setMessage(message);
        notification.setType(type);
        notification.setRead(isRead);
        notification.setRecipient(recipient);
        notificationRepository.save(notification);
    }
}
