package com.taskforge.module.admin.controller;

import com.taskforge.common.api.ApiResponse;
import com.taskforge.common.constant.ActivityType;
import com.taskforge.common.constant.ProjectMemberRole;
import com.taskforge.common.constant.ProjectStatus;
import com.taskforge.common.constant.TaskStatus;
import com.taskforge.common.constant.UserRole;
import com.taskforge.common.exception.ResourceNotFoundException;
import com.taskforge.common.exception.UnauthorizedAccessException;
import com.taskforge.module.activity.entity.ActivityLog;
import com.taskforge.module.activity.repository.ActivityLogRepository;
import com.taskforge.module.activity.service.ActivityService;
import com.taskforge.module.project.entity.Project;
import com.taskforge.module.project.entity.ProjectMember;
import com.taskforge.module.project.repository.ProjectMemberRepository;
import com.taskforge.module.project.repository.ProjectRepository;
import com.taskforge.module.project.service.ProjectService;
import com.taskforge.module.project.service.ProjectMemberService;
import com.taskforge.module.project.repository.ProjectMessageRepository;
import com.taskforge.module.task.entity.Task;
import com.taskforge.module.task.repository.TaskRepository;
import com.taskforge.module.task.repository.CommentRepository;
import com.taskforge.module.task.service.TaskService;
import com.taskforge.module.storage.repository.AttachmentRepository;
import com.taskforge.module.storage.entity.Attachment;
import com.taskforge.module.user.entity.Role;
import com.taskforge.module.user.entity.User;
import com.taskforge.module.user.repository.RoleRepository;
import com.taskforge.module.user.repository.UserRepository;
import com.taskforge.module.user.service.UserService;
import com.taskforge.security.SecurityUtils;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.transaction.annotation.Transactional;

import com.taskforge.module.user.mapper.UserMapper;
import com.taskforge.module.project.mapper.ProjectMapper;
import com.taskforge.module.task.mapper.TaskMapper;
import com.taskforge.module.activity.mapper.ActivityMapper;
import com.taskforge.module.user.dto.UserResponse;
import com.taskforge.module.project.dto.ProjectResponse;
import com.taskforge.module.task.dto.TaskResponse;
import com.taskforge.module.activity.dto.ActivityResponse;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/admin")
@Tag(name = "Admin Operations", description = "Endpoints for platform administration (restricted to ROLE_ADMIN)")
@Transactional(readOnly = true)
public class AdminController {

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final ProjectRepository projectRepository;
    private final ProjectMemberRepository projectMemberRepository;
    private final TaskRepository taskRepository;
    private final ActivityLogRepository activityLogRepository;
    private final ProjectMessageRepository projectMessageRepository;
    private final AttachmentRepository attachmentRepository;
    private final CommentRepository commentRepository;

    private final UserService userService;
    private final ProjectService projectService;
    private final ProjectMemberService projectMemberService;
    private final TaskService taskService;
    private final ActivityService activityService;

    private final UserMapper userMapper;
    private final ProjectMapper projectMapper;
    private final TaskMapper taskMapper;
    private final ActivityMapper activityMapper;

    public AdminController(
            UserRepository userRepository,
            RoleRepository roleRepository,
            ProjectRepository projectRepository,
            ProjectMemberRepository projectMemberRepository,
            TaskRepository taskRepository,
            ActivityLogRepository activityLogRepository,
            ProjectMessageRepository projectMessageRepository,
            AttachmentRepository attachmentRepository,
            CommentRepository commentRepository,
            UserService userService,
            ProjectService projectService,
            ProjectMemberService projectMemberService,
            TaskService taskService,
            ActivityService activityService,
            UserMapper userMapper,
            ProjectMapper projectMapper,
            TaskMapper taskMapper,
            ActivityMapper activityMapper
    ) {
        this.userRepository = userRepository;
        this.roleRepository = roleRepository;
        this.projectRepository = projectRepository;
        this.projectMemberRepository = projectMemberRepository;
        this.taskRepository = taskRepository;
        this.activityLogRepository = activityLogRepository;
        this.projectMessageRepository = projectMessageRepository;
        this.attachmentRepository = attachmentRepository;
        this.commentRepository = commentRepository;
        this.userService = userService;
        this.projectService = projectService;
        this.projectMemberService = projectMemberService;
        this.taskService = taskService;
        this.activityService = activityService;
        this.userMapper = userMapper;
        this.projectMapper = projectMapper;
        this.taskMapper = taskMapper;
        this.activityMapper = activityMapper;
    }

    private User getAuthenticatedUser() {
        String email = SecurityUtils.getCurrentUserUsername()
                .orElseThrow(() -> new UnauthorizedAccessException("Authentication required"));
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User profile not found: " + email));
    }

    private void verifyAdmin() {
        User user = getAuthenticatedUser();
        boolean isAdmin = user.getRoles().stream()
                .anyMatch(r -> r.getName() == UserRole.ROLE_ADMIN);
        if (!isAdmin) {
            throw new UnauthorizedAccessException("Access denied. Admin role required.");
        }
    }

    // --- DASHBOARD STATS ---

    @GetMapping("/stats")
    @Operation(summary = "Get admin dashboard statistics")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getAdminStats() {
        verifyAdmin();

        Map<String, Object> stats = new HashMap<>();
        stats.put("totalUsers", userRepository.count());
        stats.put("totalProjects", projectRepository.count());
        stats.put("totalTasks", taskRepository.count());
        stats.put("completedTasks", taskRepository.countByStatus(TaskStatus.DONE));
        
        long pending = taskRepository.count() - taskRepository.countByStatus(TaskStatus.DONE);
        stats.put("pendingTasks", pending);

        List<Project> projects = projectRepository.findAll();
        long archived = projects.stream().filter(Project::isArchived).count();
        stats.put("archivedProjects", archived);
        stats.put("activeProjects", projects.size() - archived);
        stats.put("aiGeneratedProjects", projects.stream().filter(Project::isAiGenerated).count());
        stats.put("activeUsers", userRepository.countByEnabledTrueAndDeletedFalse());

        // Overdue tasks
        LocalDate today = LocalDate.now();
        long overdue = taskRepository.findAll().stream()
                .filter(t -> t.getStatus() != TaskStatus.DONE && t.getDueDate() != null && t.getDueDate().isBefore(today))
                .count();
        stats.put("overdueTasks", overdue);

        // Discussion Messages, Comments, Attachments, Storage
        stats.put("discussionMessages", projectMessageRepository.count());
        stats.put("attachments", attachmentRepository.count());
        stats.put("comments", commentRepository.count());

        long totalSize = attachmentRepository.findAll().stream()
                .mapToLong(Attachment::getFileSize)
                .sum();
        stats.put("storageUsage", totalSize);

        // Recent activity
        Pageable pageable = PageRequest.of(0, 15, Sort.by(Sort.Direction.DESC, "createdAt"));
        stats.put("recentActivities", activityLogRepository.findAll(pageable).getContent().stream()
                .map(log -> {
                    Map<String, Object> item = new HashMap<>();
                    item.put("id", log.getId());
                    item.put("type", log.getType() != null ? log.getType().name() : "SYSTEM");
                    item.put("description", log.getDescription());
                    item.put("createdAt", log.getCreatedAt());
                    item.put("userEmail", log.getUser() != null ? log.getUser().getEmail() : "System");
                    return item;
                }).toList());

        // Projects by priority
        Map<String, Long> projectsByPriority = projects.stream()
                .collect(Collectors.groupingBy(p -> p.getPriority().name(), Collectors.counting()));
        stats.put("projectsByPriority", projectsByPriority);

        // Tasks by status
        Map<String, Long> tasksByStatus = taskRepository.findAll().stream()
                .collect(Collectors.groupingBy(t -> t.getStatus().name(), Collectors.counting()));
        stats.put("tasksByStatus", tasksByStatus);

        return ResponseEntity.ok(ApiResponse.success(stats));
    }

    // --- ANALYTICS ---

    @GetMapping("/analytics")
    @Operation(summary = "Get admin dashboard analytics trends")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getAdminAnalytics() {
        verifyAdmin();

        Map<String, Object> data = new HashMap<>();

        // Generate monthly user growth / creation metrics
        List<Map<String, Object>> growthTrend = new ArrayList<>();
        LocalDate now = LocalDate.now();
        for (int i = 5; i >= 0; i--) {
            LocalDate targetDate = now.minusMonths(i);
            String monthName = targetDate.getMonth().name().substring(0, 3) + " " + targetDate.getYear();

            long registeredCount = userRepository.findAll().stream()
                    .filter(u -> u.getCreatedAt() != null && u.getCreatedAt().getMonth() == targetDate.getMonth() && u.getCreatedAt().getYear() == targetDate.getYear())
                    .count();

            long projectsCount = projectRepository.findAll().stream()
                    .filter(p -> p.getCreatedAt() != null && p.getCreatedAt().getMonth() == targetDate.getMonth() && p.getCreatedAt().getYear() == targetDate.getYear())
                    .count();

            long tasksCount = taskRepository.findAll().stream()
                    .filter(t -> t.getCreatedAt() != null && t.getCreatedAt().getMonth() == targetDate.getMonth() && t.getCreatedAt().getYear() == targetDate.getYear())
                    .count();

            growthTrend.add(Map.of(
                    "month", monthName,
                    "users", registeredCount,
                    "projects", projectsCount,
                    "tasks", tasksCount
            ));
        }

        data.put("growthTrend", growthTrend);

        // AI usage details
        long totalAIProjects = projectRepository.findAll().stream().filter(Project::isAiGenerated).count();
        data.put("totalAIProjects", totalAIProjects);
        data.put("aiPercentage", projectRepository.count() > 0 ? (double) totalAIProjects * 100 / projectRepository.count() : 0);

        return ResponseEntity.ok(ApiResponse.success(data));
    }

    // --- AUDIT LOGS ---

    @GetMapping("/audit-logs")
    @Operation(summary = "Get list of activity audit logs")
    public ResponseEntity<ApiResponse<List<Map<String, Object>>>> getAuditLogs(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String type) {
        verifyAdmin();

        List<ActivityLog> allLogs = activityLogRepository.findAll(Sort.by(Sort.Direction.DESC, "createdAt"));
        List<Map<String, Object>> filtered = allLogs.stream()
                .filter(log -> {
                    if (type != null && !type.isEmpty() && !log.getType().name().equalsIgnoreCase(type)) {
                        return false;
                    }
                    if (search != null && !search.isEmpty()) {
                        String s = search.toLowerCase();
                        String desc = log.getDescription() != null ? log.getDescription().toLowerCase() : "";
                        String email = (log.getUser() != null && log.getUser().getEmail() != null) ? log.getUser().getEmail().toLowerCase() : "";
                        return desc.contains(s) || email.contains(s);
                    }
                    return true;
                })
                .map(log -> {
                    Map<String, Object> map = new HashMap<>();
                    map.put("id", log.getId());
                    map.put("type", log.getType().name());
                    map.put("description", log.getDescription());
                    map.put("createdAt", log.getCreatedAt());
                    map.put("userEmail", log.getUser() != null ? log.getUser().getEmail() : "System");
                    return map;
                })
                .toList();

        return ResponseEntity.ok(ApiResponse.success(filtered));
    }

    // --- USER MANAGEMENT ---

    @GetMapping("/users")
    @Operation(summary = "Get list of all users")
    public ResponseEntity<ApiResponse<List<UserResponse>>> listUsers() {
        verifyAdmin();
        return ResponseEntity.ok(ApiResponse.success(userMapper.toResponseList(userRepository.findAll())));
    }

    @PutMapping("/users/{id}")
    @Operation(summary = "Update user details and roles")
    @Transactional
    public ResponseEntity<ApiResponse<UserResponse>> updateUser(@PathVariable Long id, @RequestBody Map<String, Object> payload) {
        verifyAdmin();
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        if (payload.containsKey("firstName")) user.setFirstName((String) payload.get("firstName"));
        if (payload.containsKey("lastName")) user.setLastName((String) payload.get("lastName"));
        if (payload.containsKey("email")) user.setEmail((String) payload.get("email"));
        if (payload.containsKey("enabled")) user.setEnabled((Boolean) payload.get("enabled"));

        // Extended fields updates
        if (payload.containsKey("username")) user.setUsername((String) payload.get("username"));
        if (payload.containsKey("phoneNumber")) user.setPhoneNumber((String) payload.get("phoneNumber"));
        if (payload.containsKey("gender")) user.setGender((String) payload.get("gender"));
        if (payload.containsKey("country")) user.setCountry((String) payload.get("country"));
        if (payload.containsKey("city")) user.setCity((String) payload.get("city"));
        if (payload.containsKey("department")) user.setDepartment((String) payload.get("department"));
        if (payload.containsKey("designation")) user.setDesignation((String) payload.get("designation"));
        if (payload.containsKey("skills")) user.setSkills((String) payload.get("skills"));

        if (payload.containsKey("role")) {
            String roleName = (String) payload.get("role");
            Role role = roleRepository.findByName(UserRole.valueOf(roleName))
                    .orElseThrow(() -> new ResourceNotFoundException("Role not found: " + roleName));
            Set<Role> roles = new HashSet<>();
            roles.add(role);
            user.setRoles(roles);
        }

        User saved = userRepository.save(user);
        return ResponseEntity.ok(ApiResponse.success(userMapper.toResponse(saved), "User updated successfully"));
    }

    @PostMapping("/users/{id}/reset-password")
    @Operation(summary = "Reset a user's password")
    @Transactional
    public ResponseEntity<ApiResponse<Void>> resetPassword(@PathVariable Long id, @RequestBody Map<String, String> payload) {
        verifyAdmin();
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        String newPassword = payload.get("password");
        if (newPassword == null || newPassword.length() < 6) {
            throw new IllegalArgumentException("Password must be at least 6 characters long");
        }

        user.setPassword(newPassword);
        userRepository.save(user);

        activityService.recordActivity(
                ActivityType.USER_UPDATED,
                "Password reset for user: " + user.getEmail(),
                getAuthenticatedUser()
        );

        return ResponseEntity.ok(ApiResponse.success(null, "Password reset successfully"));
    }

    @GetMapping("/users/{id}/projects")
    @Operation(summary = "Get projects associated with a user")
    public ResponseEntity<ApiResponse<List<ProjectResponse>>> getUserProjects(@PathVariable Long id) {
        verifyAdmin();
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        List<Project> owned = projectRepository.findByOwner(user);
        List<Project> memberOf = projectMemberRepository.findByUser(user).stream()
                .map(ProjectMember::getProject)
                .toList();

        Set<Project> all = new HashSet<>(owned);
        all.addAll(memberOf);

        return ResponseEntity.ok(ApiResponse.success(projectMapper.toResponseList(new ArrayList<>(all))));
    }

    @GetMapping("/users/{id}/activities")
    @Operation(summary = "Get activity timeline for a user")
    public ResponseEntity<ApiResponse<List<ActivityResponse>>> getUserActivities(@PathVariable Long id) {
        verifyAdmin();
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        return ResponseEntity.ok(ApiResponse.success(activityMapper.toResponseList(activityLogRepository.findByUser(user))));
    }

    @DeleteMapping("/users/{id}")
    @Operation(summary = "Delete user")
    @Transactional
    public ResponseEntity<ApiResponse<Void>> deleteUser(@PathVariable Long id) {
        verifyAdmin();
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        user.setDeleted(true);
        user.setEnabled(false);
        userRepository.save(user);

        activityService.recordActivity(
                ActivityType.USER_UPDATED,
                "User deleted/soft deleted: " + user.getEmail(),
                getAuthenticatedUser()
        );

        return ResponseEntity.ok(ApiResponse.success(null, "User deleted successfully"));
    }

    // --- PROJECT MANAGEMENT ---

    @GetMapping("/projects")
    @Operation(summary = "Get list of all projects")
    public ResponseEntity<ApiResponse<List<ProjectResponse>>> listProjects() {
        verifyAdmin();
        return ResponseEntity.ok(ApiResponse.success(projectMapper.toResponseList(projectRepository.findAll())));
    }

    @PutMapping("/projects/{id}/transfer-ownership/{userId}")
    @Operation(summary = "Transfer project ownership")
    @Transactional
    public ResponseEntity<ApiResponse<Void>> transferProjectOwnership(@PathVariable Long id, @PathVariable Long userId) {
        verifyAdmin();
        Project project = projectRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Project not found"));
        User targetUser = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Target user not found"));

        project.setOwner(targetUser);
        projectRepository.save(project);

        // Also update member role if they are a member, or make them owner
        ProjectMember member = projectMemberRepository.findByProjectAndUser(project, targetUser)
                .orElseGet(() -> {
                    ProjectMember newMember = ProjectMember.builder()
                            .project(project)
                            .user(targetUser)
                            .role(ProjectMemberRole.OWNER)
                            .build();
                    return projectMemberRepository.save(newMember);
                });
        member.setRole(ProjectMemberRole.OWNER);
        projectMemberRepository.save(member);

        activityService.recordActivity(
                ActivityType.OWNERSHIP_TRANSFERRED,
                "Ownership of project '" + project.getName() + "' transferred to " + targetUser.getEmail(),
                project,
                null
        );

        return ResponseEntity.ok(ApiResponse.success(null, "Ownership transferred successfully"));
    }

    @PutMapping("/projects/{id}/archive")
    @Operation(summary = "Archive project")
    @Transactional
    public ResponseEntity<ApiResponse<Void>> archiveProject(@PathVariable Long id) {
        verifyAdmin();
        Project project = projectRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Project not found"));
        project.setArchived(true);
        projectRepository.save(project);
        return ResponseEntity.ok(ApiResponse.success(null, "Project archived successfully"));
    }

    @PutMapping("/projects/{id}/restore")
    @Operation(summary = "Restore project")
    @Transactional
    public ResponseEntity<ApiResponse<Void>> restoreProject(@PathVariable Long id) {
        verifyAdmin();
        Project project = projectRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Project not found"));
        project.setArchived(false);
        projectRepository.save(project);
        return ResponseEntity.ok(ApiResponse.success(null, "Project restored successfully"));
    }

    @DeleteMapping("/projects/{id}")
    @Operation(summary = "Delete project")
    @Transactional
    public ResponseEntity<ApiResponse<Void>> deleteProject(@PathVariable Long id) {
        verifyAdmin();
        Project project = projectRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Project not found"));
        projectRepository.delete(project);
        return ResponseEntity.ok(ApiResponse.success(null, "Project deleted successfully"));
    }

    // --- TASK MANAGEMENT ---

    @GetMapping("/tasks")
    @Operation(summary = "Get list of all tasks")
    public ResponseEntity<ApiResponse<List<TaskResponse>>> listTasks() {
        verifyAdmin();
        return ResponseEntity.ok(ApiResponse.success(taskMapper.toResponseList(taskRepository.findAll())));
    }

    @PutMapping("/tasks/{id}/move/{projectId}")
    @Operation(summary = "Move task to a different project")
    @Transactional
    public ResponseEntity<ApiResponse<Void>> moveTask(@PathVariable Long id, @PathVariable Long projectId) {
        verifyAdmin();
        Task task = taskRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Task not found"));
        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new ResourceNotFoundException("Project not found"));

        Project oldProject = task.getProject();
        task.setProject(project);
        taskRepository.save(task);

        activityService.recordActivity(
                ActivityType.TASK_UPDATED,
                "Task '" + task.getTitle() + "' moved from project '" + oldProject.getName() + "' to '" + project.getName() + "'",
                project,
                task
        );

        return ResponseEntity.ok(ApiResponse.success(null, "Task moved successfully"));
    }

    @PutMapping("/tasks/{id}/assign/{userId}")
    @Operation(summary = "Assign task to user")
    @Transactional
    public ResponseEntity<ApiResponse<Void>> assignTask(@PathVariable Long id, @PathVariable Long userId) {
        verifyAdmin();
        Task task = taskRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Task not found"));
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        task.setAssignee(user);
        taskRepository.save(task);
        return ResponseEntity.ok(ApiResponse.success(null, "Task assigned successfully"));
    }

    @PutMapping("/tasks/{id}/status")
    @Operation(summary = "Change task status")
    @Transactional
    public ResponseEntity<ApiResponse<Void>> updateTaskStatus(@PathVariable Long id, @RequestParam TaskStatus status) {
        verifyAdmin();
        Task task = taskRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Task not found"));
        task.setStatus(status);
        taskRepository.save(task);
        return ResponseEntity.ok(ApiResponse.success(null, "Task status updated successfully"));
    }

    @DeleteMapping("/tasks/{id}")
    @Operation(summary = "Delete task")
    @Transactional
    public ResponseEntity<ApiResponse<Void>> deleteTask(@PathVariable Long id) {
        verifyAdmin();
        Task task = taskRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Task not found"));
        taskRepository.delete(task);
        return ResponseEntity.ok(ApiResponse.success(null, "Task deleted successfully"));
    }
}
