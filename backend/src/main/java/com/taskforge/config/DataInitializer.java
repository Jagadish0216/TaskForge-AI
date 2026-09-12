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
 * Component to seed baseline system roles and clean portfolio demonstration dataset.
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

        if (userRepository.existsByEmail("admin@demo.taskforge.local") || projectRepository.existsByProjectKey("PULSE")) {
            log.info("Portfolio demonstration dataset already initialized. Skipping seed.");
            return;
        }

        log.info("Seeding clean, realistic portfolio demonstration dataset...");
        seedDataset(roleMap);
        log.info("Portfolio demonstration dataset successfully seeded!");
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
        String encodedPassword = passwordEncoder.encode("demo123");

        // 1. Create Exactly Three Demo Accounts
        User admin = createUser("admin@demo.taskforge.local", encodedPassword, "System", "Administrator", "admin",
                "Administration", "System Administrator", "Platform security and system administration.",
                "Java, Spring Security, MySQL, Admin", roleMap.get(UserRole.ROLE_ADMIN));

        User manager = createUser("manager@demo.taskforge.local", encodedPassword, "Alex", "Morgan", "alex.morgan",
                "Engineering", "Senior Engineering Manager", "Leading technical execution and sprint architecture.",
                "Java 17, Architecture, Project Management", roleMap.get(UserRole.ROLE_PROJECT_MANAGER));

        User member = createUser("member@demo.taskforge.local", encodedPassword, "Sarah", "Chen", "sarah.chen",
                "Engineering", "Lead Full Stack Engineer", "Building high-performance React applications and REST APIs.",
                "React, TypeScript, Spring Boot, MySQL", roleMap.get(UserRole.ROLE_TEAM_MEMBER));

        // 2. Create Primary Demonstration Project: PULSE
        LocalDate now = LocalDate.now();
        Project pulse = createProject("Pulse Analytics Platform", "PULSE",
                "Real-time analytics engine and telemetry dashboard providing deep streaming data insights and AI-driven predictive project metrics.",
                ProjectStatus.IN_PROGRESS, ProjectPriority.HIGH, ProjectVisibility.PUBLIC,
                now.minusDays(30), now.plusDays(60), "React, Spring Boot, MySQL", "3", "Development", manager);

        // 3. Create Project Memberships
        addMember(pulse, manager, ProjectMemberRole.OWNER);
        addMember(pulse, member, ProjectMemberRole.MEMBER);
        addMember(pulse, admin, ProjectMemberRole.VIEWER);

        // 4. Create 10 Realistic Software Engineering Tasks
        List<Task> tasks = new ArrayList<>();

        // BACKLOG
        tasks.add(createTask("Integrate OpenTelemetry tracing for real-time pipeline visualization",
                "Set up distributed tracing agents across backend services to capture query spans and API latency metrics.",
                TaskStatus.BACKLOG, TaskPriority.MEDIUM, now, now.plusDays(14), null, 12, 0, pulse, member, manager));

        tasks.add(createTask("Design automated fallback circuit-breaker for Gemini API failure states",
                "Implement exponential backoff and secondary model switching when Google Gemini API encounters rate limits.",
                TaskStatus.BACKLOG, TaskPriority.HIGH, now.plusDays(1), now.plusDays(10), null, 8, 0, pulse, manager, manager));

        // TODO
        tasks.add(createTask("Optimize database indexing on project_activity_logs for dynamic pagination",
                "Add composite index on (project_id, created_at) to accelerate workspace activity timeline rendering.",
                TaskStatus.TODO, TaskPriority.HIGH, now.minusDays(2), now.plusDays(5), null, 6, 0, pulse, member, manager));

        tasks.add(createTask("Implement WebSocket heartbeat protocol for multi-user Kanban sync",
                "Add STOMP over SockJS fallback to handle network reconnections cleanly without UI state desynchronization.",
                TaskStatus.TODO, TaskPriority.MEDIUM, now.minusDays(1), now.plusDays(7), null, 10, 0, pulse, manager, manager));

        // IN_PROGRESS
        tasks.add(createTask("Architect Spring Security JWT stateless filter with fine-grained authorization",
                "Build stateless JwtAuthenticationFilter with access/refresh token rotation and RBAC endpoint security.",
                TaskStatus.IN_PROGRESS, TaskPriority.URGENT, now.minusDays(8), now.plusDays(2), null, 16, 8, pulse, manager, manager));

        tasks.add(createTask("Build interactive React Kanban board with drag-and-drop state persistence",
                "Create smooth column drag interaction, optimistic updates, and instant REST backend sync.",
                TaskStatus.IN_PROGRESS, TaskPriority.HIGH, now.minusDays(6), now.plusDays(4), null, 14, 10, pulse, member, manager));

        // IN_REVIEW
        tasks.add(createTask("Develop AI Risk Radar score engine and prompt context assembly",
                "Gather project telemetry, task status counts, and historical velocity to form structured Gemini prompt payloads.",
                TaskStatus.IN_REVIEW, TaskPriority.URGENT, now.minusDays(10), now.plusDays(1), null, 12, 11, pulse, manager, manager));

        tasks.add(createTask("Refactor task details drawer with activity trail and comment timeline",
                "Enhance drawer UI with tabbed navigation for task descriptions, team comments, and audit activity trail.",
                TaskStatus.IN_REVIEW, TaskPriority.MEDIUM, now.minusDays(7), now.plusDays(3), null, 8, 7, pulse, member, manager));

        // DONE
        tasks.add(createTask("Establish Tailwind/Vanilla CSS design token system and core layout shell",
                "Construct TaskForge dark mode design foundation using curated HSL color tokens and responsive grid shell.",
                TaskStatus.DONE, TaskPriority.HIGH, now.minusDays(25), now.minusDays(12), now.minusDays(12), 20, 20, pulse, member, manager));

        tasks.add(createTask("Configure baseline Spring Boot 3.3 REST API controllers and DTO mappings",
                "Define standard API response DTOs, exception handling advice, and Swagger OpenAPI documentation.",
                TaskStatus.DONE, TaskPriority.URGENT, now.minusDays(30), now.minusDays(20), now.minusDays(19), 16, 16, pulse, manager, manager));

        // 5. Create Realistic Comments
        createComment("JWT authentication filter is implemented. Refresh token rotation tested cleanly.", tasks.get(4), manager, null);
        createComment("Tested access token expiration handling with 401 interceptor redirect.", tasks.get(4), member, null);

        createComment("Kanban drag and drop works smoothly across all 5 status columns.", tasks.get(5), member, null);
        createComment("Verified optimistic status update. Backend sync is crisp.", tasks.get(5), manager, null);

        createComment("Risk Radar prompt assembly returns structured JSON payload matching healthScore and risk lists.", tasks.get(6), manager, null);

        // 6. Create Activity Logs
        createActivityLog(ActivityType.PROJECT_CREATED, "Project 'Pulse Analytics Platform' was created by Alex Morgan.", pulse, null, manager);
        createActivityLog(ActivityType.MEMBER_JOINED, "Sarah Chen joined project 'Pulse Analytics Platform' as MEMBER.", pulse, null, member);
        createActivityLog(ActivityType.TASK_CREATED, "Task 'Architect Spring Security JWT stateless filter' created in PULSE.", pulse, tasks.get(4), manager);
        createActivityLog(ActivityType.TASK_STATUS_CHANGED, "Task 'Develop AI Risk Radar score engine' moved to IN_REVIEW.", pulse, tasks.get(6), manager);
        createActivityLog(ActivityType.TASK_COMPLETED, "Task 'Establish Tailwind/Vanilla CSS design token system' completed by Sarah Chen.", pulse, tasks.get(8), member);

        // 7. Create Notifications
        createNotification("Task Assignment", "You were assigned to task 'Build interactive React Kanban board' in Pulse Analytics Platform.", NotificationType.TASK_ASSIGNED, false, member);
        createNotification("Task Review Required", "Task 'Develop AI Risk Radar score engine' moved to IN_REVIEW for approval.", NotificationType.TASK_STATUS_UPDATED, false, manager);
        createNotification("Project Invitation", "You were added as MEMBER to project 'Pulse Analytics Platform'.", NotificationType.PROJECT_INVITATION, true, member);
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
