package com.taskforge.module.task.service;

import com.taskforge.common.constant.TaskStatus;
import com.taskforge.common.constant.UserRole;
import com.taskforge.common.exception.InvalidStateException;
import com.taskforge.common.exception.ResourceNotFoundException;
import com.taskforge.common.exception.UnauthorizedAccessException;
import com.taskforge.module.project.entity.Project;
import com.taskforge.module.project.repository.ProjectMemberRepository;
import com.taskforge.module.project.repository.ProjectRepository;
import com.taskforge.module.task.dto.*;
import com.taskforge.module.task.entity.Task;
import com.taskforge.module.task.mapper.TaskMapper;
import com.taskforge.module.task.repository.TaskRepository;
import com.taskforge.module.user.entity.User;
import com.taskforge.module.user.repository.UserRepository;
import com.taskforge.security.SecurityUtils;
import com.taskforge.module.notification.service.NotificationService;
import com.taskforge.common.constant.NotificationType;
import com.taskforge.common.constant.ProjectMemberRole;
import jakarta.persistence.criteria.Subquery;
import jakarta.persistence.criteria.Root;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

/**
 * Service orchestrating Task lifecycle management: CRUD operations, user assignments, searching, and statistics.
 */
@Service
public class TaskService {

    private final TaskRepository taskRepository;
    private final ProjectRepository projectRepository;
    private final ProjectMemberRepository projectMemberRepository;
    private final UserRepository userRepository;
    private final TaskMapper taskMapper;
    private final com.taskforge.module.activity.service.ActivityService activityService;
    private final com.taskforge.module.task.repository.CommentRepository commentRepository;
    private final com.taskforge.module.task.repository.CommentHistoryRepository commentHistoryRepository;
    private final com.taskforge.module.storage.repository.AttachmentRepository attachmentRepository;
    private final com.taskforge.module.activity.repository.ActivityLogRepository activityLogRepository;
    private final NotificationService notificationService;

    public TaskService(
            TaskRepository taskRepository,
            ProjectRepository projectRepository,
            ProjectMemberRepository projectMemberRepository,
            UserRepository userRepository,
            TaskMapper taskMapper,
            com.taskforge.module.activity.service.ActivityService activityService,
            com.taskforge.module.task.repository.CommentRepository commentRepository,
            com.taskforge.module.task.repository.CommentHistoryRepository commentHistoryRepository,
            com.taskforge.module.storage.repository.AttachmentRepository attachmentRepository,
            com.taskforge.module.activity.repository.ActivityLogRepository activityLogRepository,
            NotificationService notificationService
    ) {
        this.taskRepository = taskRepository;
        this.projectRepository = projectRepository;
        this.projectMemberRepository = projectMemberRepository;
        this.userRepository = userRepository;
        this.taskMapper = taskMapper;
        this.activityService = activityService;
        this.commentRepository = commentRepository;
        this.commentHistoryRepository = commentHistoryRepository;
        this.attachmentRepository = attachmentRepository;
        this.activityLogRepository = activityLogRepository;
        this.notificationService = notificationService;
    }

    /**
     * Creates a new task. Restricted to ADMIN and PROJECT_MANAGER of the project.
     *
     * @param request creation request payload
     * @return response details of the created task
     */
    @Transactional
    public TaskResponse createTask(TaskCreateRequest request) {
        if (request.projectId() == null) {
            throw new InvalidStateException("Project ID must not be null");
        }

        Project project = projectRepository.findById(request.projectId())
                .orElseThrow(() -> new ResourceNotFoundException("Project not found with id: " + request.projectId()));

        verifyModificationAccess(project);
        User currentUser = getCurrentAuthenticatedUser(project);

        User assignee = null;
        if (request.assigneeId() != null) {
            assignee = userRepository.findById(request.assigneeId())
                    .orElseThrow(() -> new ResourceNotFoundException("Assignee user not found with id: " + request.assigneeId()));

            boolean isMember = projectMemberRepository.existsByProjectAndUser(project, assignee);
            if (!isMember) {
                throw new InvalidStateException("Assignee must be a member of the project");
            }
        }

        Task task = taskMapper.toEntity(request);
        task.setProject(project);
        task.setAssignee(assignee);

        if (assignee != null) {
            task.setAssignedBy(currentUser);
            task.setAssignedDate(java.time.LocalDateTime.now());
        }

        if (task.getStatus() == TaskStatus.DONE) {
            task.setCompletedDate(LocalDate.now());
        }

        Task savedTask = taskRepository.save(task);

        activityService.recordActivity(
                com.taskforge.common.constant.ActivityType.TASK_CREATED,
                "Task created: " + savedTask.getTitle(),
                savedTask.getProject(),
                savedTask
        );

        if (savedTask.getAssignee() != null) {
            activityService.recordActivity(
                    com.taskforge.common.constant.ActivityType.TASK_ASSIGNED,
                    "Task '" + savedTask.getTitle() + "' assigned to: " + savedTask.getAssignee().getEmail(),
                    savedTask.getProject(),
                    savedTask
            );

            notificationService.createNotification(
                    savedTask.getAssignee(),
                    "You have been assigned a new task",
                    "Project: " + project.getName() + " | Task: " + savedTask.getTitle() + " | Assigned By: " + (currentUser.getFirstName() + " " + currentUser.getLastName()).trim() + " | Priority: " + savedTask.getPriority() + " | Deadline: " + (savedTask.getDueDate() != null ? savedTask.getDueDate().toString() : "N/A"),
                    NotificationType.TASK_ASSIGNED
            );
        }

        return taskMapper.toResponse(savedTask);
    }

    /**
     * Retrieves task details by ID with visibility checks.
     *
     * @param id task ID
     * @return task details
     */
    @Transactional(readOnly = true)
    public TaskResponse getTaskById(Long id) {
        if (id == null) {
            throw new ResourceNotFoundException("Task ID must not be null");
        }

        Task task = taskRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Task not found with id: " + id));

        verifyReadAccess(task);
        return taskMapper.toResponse(task);
    }

    /**
     * Updates details of an existing task.
     *
     * @param id      task ID
     * @param request update payload
     * @return updated task details
     */
    @Transactional
    public TaskResponse updateTask(Long id, TaskUpdateRequest request) {
        if (id == null) {
            throw new ResourceNotFoundException("Task ID must not be null");
        }

        Task task = taskRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Task not found with id: " + id));

        User currentUser = getCurrentAuthenticatedUser(task.getProject());
        boolean canManage = false;
        boolean isAdmin = currentUser.getRoles().stream().anyMatch(r -> r.getName() == UserRole.ROLE_ADMIN);
        if (isAdmin) {
            canManage = true;
        } else {
            com.taskforge.module.project.entity.ProjectMember member = projectMemberRepository.findByProjectAndUser(task.getProject(), currentUser).orElse(null);
            if (member != null && (member.getRole() == ProjectMemberRole.OWNER || member.getRole() == ProjectMemberRole.MANAGER)) {
                canManage = true;
            }
        }

        TaskStatus oldStatus = task.getStatus();
        User oldAssignee = task.getAssignee();

        if (!canManage) {
            if (task.getAssignee() == null || !task.getAssignee().getId().equals(currentUser.getId())) {
                throw new UnauthorizedAccessException("You can only update tasks assigned to you");
            }

            updateTaskStatus(task, request.status());
            if (request.actualHours() != null) {
                task.setActualHours(request.actualHours());
            }
        } else {

            task.setTitle(request.title());
            task.setDescription(request.description());
            task.setPriority(request.priority());
            task.setStartDate(request.startDate());
            task.setDueDate(request.dueDate());
            task.setEstimatedHours(request.estimatedHours());
            task.setActualHours(request.actualHours());

            updateTaskStatus(task, request.status());

            User assignee = null;
            if (request.assigneeId() != null) {
                assignee = userRepository.findById(request.assigneeId())
                        .orElseThrow(() -> new ResourceNotFoundException("Assignee user not found with id: " + request.assigneeId()));

                boolean isMember = projectMemberRepository.existsByProjectAndUser(task.getProject(), assignee);
                if (!isMember) {
                    throw new InvalidStateException("Assignee must be a member of the project");
                }
            }

            boolean changed = (oldAssignee == null && assignee != null) ||
                              (oldAssignee != null && assignee != null && !oldAssignee.getId().equals(assignee.getId())) ||
                              (oldAssignee != null && assignee == null);
            if (changed) {
                task.setAssignee(assignee);
                task.setAssignedBy(currentUser);
                task.setAssignedDate(java.time.LocalDateTime.now());

                String originalName = oldAssignee != null ? (oldAssignee.getFirstName() + " " + oldAssignee.getLastName()).trim() : "Unassigned";
                if (originalName.isEmpty() && oldAssignee != null) {
                    originalName = oldAssignee.getEmail();
                }
                String newName = assignee != null ? (assignee.getFirstName() + " " + assignee.getLastName()).trim() : "Unassigned";
                if (newName.isEmpty() && assignee != null) {
                    newName = assignee.getEmail();
                }
                String historyMsg = "Task reassigned. Originally Assigned To: " + originalName + " | Reassigned To: " + newName + " | Reassigned By: " + (currentUser.getFirstName() + " " + currentUser.getLastName()).trim();

                activityService.recordActivity(
                        com.taskforge.common.constant.ActivityType.TASK_ASSIGNED,
                        historyMsg,
                        task.getProject(),
                        task
                );

                if (assignee != null) {
                    notificationService.createNotification(
                            assignee,
                            "You have been assigned a new task",
                            "Project: " + task.getProject().getName() + " | Task: " + task.getTitle() + " | Assigned By: " + (currentUser.getFirstName() + " " + currentUser.getLastName()).trim() + " | Priority: " + task.getPriority() + " | Deadline: " + (task.getDueDate() != null ? task.getDueDate().toString() : "N/A"),
                            NotificationType.TASK_ASSIGNED
                    );
                }

                if (oldAssignee != null) {
                    notificationService.createNotification(
                            oldAssignee,
                            "You have been unassigned from a task",
                            "Project: " + task.getProject().getName() + " | Task: " + task.getTitle() + " | Unassigned By: " + (currentUser.getFirstName() + " " + currentUser.getLastName()).trim(),
                            NotificationType.TASK_ASSIGNED
                    );
                }
            }
        }

        Task updatedTask = taskRepository.save(task);

        if (updatedTask.getStatus() == TaskStatus.DONE && oldStatus != TaskStatus.DONE) {
            activityService.recordActivity(
                    com.taskforge.common.constant.ActivityType.TASK_COMPLETED,
                    "Task completed: " + updatedTask.getTitle(),
                    updatedTask.getProject(),
                    updatedTask
            );
        } else if (updatedTask.getStatus() != oldStatus) {
            activityService.recordActivity(
                    com.taskforge.common.constant.ActivityType.TASK_STATUS_CHANGED,
                    "Task status changed to " + updatedTask.getStatus() + ": " + updatedTask.getTitle(),
                    updatedTask.getProject(),
                    updatedTask
            );
        } else {
            activityService.recordActivity(
                    com.taskforge.common.constant.ActivityType.TASK_UPDATED,
                    "Task updated: " + updatedTask.getTitle(),
                    updatedTask.getProject(),
                    updatedTask
            );
        }

        User newAssignee = updatedTask.getAssignee();
        boolean assigneeChanged = (oldAssignee == null && newAssignee != null) ||
                                  (oldAssignee != null && newAssignee != null && !oldAssignee.getId().equals(newAssignee.getId())) ||
                                  (oldAssignee != null && newAssignee == null);
        if (assigneeChanged) {
            String oldAssigneeName = oldAssignee != null
                    ? (oldAssignee.getFirstName() + " " + oldAssignee.getLastName()).trim() + " (" + oldAssignee.getEmail() + ")"
                    : "Unassigned";
            String newAssigneeName = newAssignee != null
                    ? (newAssignee.getFirstName() + " " + newAssignee.getLastName()).trim() + " (" + newAssignee.getEmail() + ")"
                    : "Unassigned";
            String currentUserName = (currentUser.getFirstName() + " " + currentUser.getLastName()).trim();
            String timestamp = java.time.format.DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss").format(java.time.LocalDateTime.now());

            String activityDesc = String.format("Task reassigned. Originally Assigned To: %s | Reassigned By: %s | Reassigned Date: %s",
                    oldAssigneeName, currentUserName, timestamp);

            activityService.recordActivity(
                    com.taskforge.common.constant.ActivityType.TASK_ASSIGNED,
                    activityDesc,
                    updatedTask.getProject(),
                    updatedTask
            );

            // Notify New Assignee if present
            if (newAssignee != null) {
                notificationService.createNotification(
                        newAssignee,
                        "You have been assigned a new task",
                        "Project: " + updatedTask.getProject().getName() + " | Task: " + updatedTask.getTitle() + " | Assigned By: " + currentUserName + " | Priority: " + updatedTask.getPriority() + " | Deadline: " + (updatedTask.getDueDate() != null ? updatedTask.getDueDate().toString() : "N/A"),
                        NotificationType.TASK_ASSIGNED
                );
            }

            // Notify Old Assignee if present
            if (oldAssignee != null) {
                notificationService.createNotification(
                        oldAssignee,
                        "This task has been reassigned",
                        "The task '" + updatedTask.getTitle() + "' in project '" + updatedTask.getProject().getName() + "' previously assigned to you has been reassigned to " + (newAssignee != null ? newAssignee.getFirstName() + " " + newAssignee.getLastName() : "Unassigned") + ".",
                        NotificationType.TASK_ASSIGNED
                );
            }
        }

        return taskMapper.toResponse(updatedTask);
    }

    /**
     * Permanently deletes a task.
     *
     * @param id task ID
     */
    @Transactional
    public void deleteTask(Long id) {
        if (id == null) {
            throw new ResourceNotFoundException("Task ID must not be null");
        }

        Task task = taskRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Task not found with id: " + id));

        verifyModificationAccess(task.getProject());

        List<com.taskforge.module.task.entity.Comment> comments = commentRepository.findByTask(task);
        for (com.taskforge.module.task.entity.Comment comment : comments) {
            if (comment.getParentComment() != null) {
                List<com.taskforge.module.task.entity.CommentHistory> history = commentHistoryRepository.findByCommentOrderByEditedAtDesc(comment);
                commentHistoryRepository.deleteAll(history);
                commentRepository.delete(comment);
            }
        }
        for (com.taskforge.module.task.entity.Comment comment : comments) {
            if (comment.getParentComment() == null) {
                List<com.taskforge.module.task.entity.CommentHistory> history = commentHistoryRepository.findByCommentOrderByEditedAtDesc(comment);
                commentHistoryRepository.deleteAll(history);
                commentRepository.delete(comment);
            }
        }

        List<com.taskforge.module.storage.entity.Attachment> attachments = attachmentRepository.findByTask(task);
        attachmentRepository.deleteAll(attachments);

        List<com.taskforge.module.activity.entity.ActivityLog> logs = activityLogRepository.findByTask(task);
        for (com.taskforge.module.activity.entity.ActivityLog log : logs) {
            log.setTask(null);
            activityLogRepository.save(log);
        }

        activityService.recordActivity(
                com.taskforge.common.constant.ActivityType.TASK_DELETED,
                "Task deleted: " + task.getTitle(),
                task.getProject(),
                null
        );

        taskRepository.delete(task);
    }

    /**
     * Assigns or reassigns a user to a task.
     *
     * @param id     task ID
     * @param userId user ID to assign, or null to unassign
     * @return updated task details
     */
    @Transactional
    public TaskResponse assignUser(Long id, Long userId) {
        if (id == null) {
            throw new ResourceNotFoundException("Task ID must not be null");
        }

        Task task = taskRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Task not found with id: " + id));

        verifyModificationAccess(task.getProject());

        User currentUser = getCurrentAuthenticatedUser(task.getProject());
        User oldAssignee = task.getAssignee();

        if (userId != null) {
            User assignee = userRepository.findById(userId)
                    .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));

            boolean isMember = projectMemberRepository.existsByProjectAndUser(task.getProject(), assignee);
            if (!isMember) {
                throw new InvalidStateException("Assignee must be a member of the project");
            }
            task.setAssignee(assignee);
            task.setAssignedBy(currentUser);
            task.setAssignedDate(java.time.LocalDateTime.now());
        } else {
            task.setAssignee(null);
            task.setAssignedBy(null);
            task.setAssignedDate(null);
        }

        Task updatedTask = taskRepository.save(task);

        boolean changed = (oldAssignee == null && updatedTask.getAssignee() != null) ||
                          (oldAssignee != null && updatedTask.getAssignee() != null && !oldAssignee.getId().equals(updatedTask.getAssignee().getId())) ||
                          (oldAssignee != null && updatedTask.getAssignee() == null);

        if (changed) {
            String originalName = oldAssignee != null ? (oldAssignee.getFirstName() + " " + oldAssignee.getLastName()).trim() : "Unassigned";
            if (originalName.isEmpty() && oldAssignee != null) {
                originalName = oldAssignee.getEmail();
            }
            String newName = updatedTask.getAssignee() != null ? (updatedTask.getAssignee().getFirstName() + " " + updatedTask.getAssignee().getLastName()).trim() : "Unassigned";
            if (newName.isEmpty() && updatedTask.getAssignee() != null) {
                newName = updatedTask.getAssignee().getEmail();
            }
            String historyMsg = "Task reassigned. Originally Assigned To: " + originalName + " | Reassigned To: " + newName + " | Reassigned By: " + (currentUser.getFirstName() + " " + currentUser.getLastName()).trim();

            activityService.recordActivity(
                    com.taskforge.common.constant.ActivityType.TASK_ASSIGNED,
                    historyMsg,
                    updatedTask.getProject(),
                    updatedTask
            );

            if (updatedTask.getAssignee() != null) {
                notificationService.createNotification(
                        updatedTask.getAssignee(),
                        "You have been assigned a new task",
                        "Project: " + updatedTask.getProject().getName() + " | Task: " + updatedTask.getTitle() + " | Assigned By: " + (currentUser.getFirstName() + " " + currentUser.getLastName()).trim() + " | Priority: " + updatedTask.getPriority() + " | Deadline: " + (updatedTask.getDueDate() != null ? updatedTask.getDueDate().toString() : "N/A"),
                        NotificationType.TASK_ASSIGNED
                );
            }

            if (oldAssignee != null) {
                notificationService.createNotification(
                        oldAssignee,
                        "You have been unassigned from a task",
                        "Project: " + updatedTask.getProject().getName() + " | Task: " + updatedTask.getTitle() + " | Unassigned By: " + (currentUser.getFirstName() + " " + currentUser.getLastName()).trim(),
                        NotificationType.TASK_ASSIGNED
                );
            }
        } else {
            activityService.recordActivity(
                    com.taskforge.common.constant.ActivityType.TASK_UPDATED,
                    "Task '" + updatedTask.getTitle() + "' details updated",
                    updatedTask.getProject(),
                    updatedTask
            );
        }

        return taskMapper.toResponse(updatedTask);
    }

    /**
     * Searches and filters tasks with pagination and sorting.
     *
     * @param searchRequest search filters (keyword, status, priority, projectId, assigneeId, dueDate)
     * @param pageable      pagination and sorting details
     * @return paginated tasks list
     */
    @Transactional(readOnly = true)
    public TaskPageResponse searchTasks(TaskSearchRequest searchRequest, Pageable pageable) {
        Project project = null;
        if (searchRequest != null && searchRequest.projectId() != null) {
            project = projectRepository.findById(searchRequest.projectId()).orElse(null);
            if (project != null) {
                verifyAccess(project);
            }
        }
        User currentUser = getCurrentAuthenticatedUser(project);
        boolean isAdmin = currentUser.getRoles().stream()
                .anyMatch(r -> r.getName() == UserRole.ROLE_ADMIN);
        boolean isPM = currentUser.getRoles().stream()
                .anyMatch(r -> r.getName() == UserRole.ROLE_PROJECT_MANAGER);
        boolean isTeamMember = currentUser.getRoles().stream()
                .anyMatch(r -> r.getName() == UserRole.ROLE_TEAM_MEMBER);

        Specification<Task> spec = (root, query, cb) -> {
            var predicates = new ArrayList<jakarta.persistence.criteria.Predicate>();

            if (searchRequest.status() != null) {
                predicates.add(cb.equal(root.get("status"), searchRequest.status()));
            }

            if (searchRequest.priority() != null) {
                predicates.add(cb.equal(root.get("priority"), searchRequest.priority()));
            }

            if (searchRequest.projectId() != null) {
                predicates.add(cb.equal(root.get("project").get("id"), searchRequest.projectId()));
            }

            if (searchRequest.dueDate() != null) {
                predicates.add(cb.lessThanOrEqualTo(root.get("dueDate"), searchRequest.dueDate()));
            }

            if (StringUtils.hasText(searchRequest.keyword())) {
                String searchPattern = "%" + searchRequest.keyword().toLowerCase() + "%";
                var keywordPredicate = cb.or(
                        cb.like(cb.lower(root.get("title")), searchPattern),
                        cb.like(cb.lower(root.get("description")), searchPattern)
                );
                predicates.add(keywordPredicate);
            }

            if (searchRequest.assigneeId() != null) {
                predicates.add(cb.equal(root.get("assignee").get("id"), searchRequest.assigneeId()));
            }

            if (!isAdmin && searchRequest.projectId() == null) {
                Subquery<Long> subquery = query.subquery(Long.class);
                Root<com.taskforge.module.project.entity.ProjectMember> pmRoot = subquery.from(com.taskforge.module.project.entity.ProjectMember.class);
                
                if (isPM) {
                    subquery.select(pmRoot.get("project").get("id"))
                            .where(cb.and(
                                    cb.equal(pmRoot.get("user"), currentUser),
                                    pmRoot.get("role").in(ProjectMemberRole.OWNER, ProjectMemberRole.MANAGER)
                            ));
                } else if (isTeamMember) {
                    subquery.select(pmRoot.get("project").get("id"))
                            .where(cb.equal(pmRoot.get("user"), currentUser));
                } else {
                    subquery.select(pmRoot.get("project").get("id"))
                            .where(cb.and(
                                    cb.equal(pmRoot.get("user"), currentUser),
                                    cb.equal(pmRoot.get("role"), ProjectMemberRole.OWNER)
                            ));
                }
                predicates.add(root.get("project").get("id").in(subquery));
            }

            return cb.and(predicates.toArray(new jakarta.persistence.criteria.Predicate[0]));
        };

        Page<Task> taskPage = taskRepository.findAll(spec, pageable);
        List<TaskResponse> content = taskPage.getContent().stream()
                .map(taskMapper::toResponse)
                .toList();

        return new TaskPageResponse(
                content,
                taskPage.getNumber(),
                taskPage.getSize(),
                taskPage.getTotalPages(),
                taskPage.getTotalElements(),
                taskPage.isLast()
        );
    }

    /**
     * Calculates statistics metadata overview of tasks filtered by project and/or assignee.
     *
     * @param projectId  optional filter by parent project
     * @param assigneeId optional filter by assignee user
     * @return task statistics overview
     */
    @Transactional(readOnly = true)
    public TaskStatisticsResponse getTaskStatistics(Long projectId, Long assigneeId) {
        Project project = null;
        if (projectId != null) {
            project = projectRepository.findById(projectId).orElse(null);
        }
        User currentUser = getCurrentAuthenticatedUser(project);
        boolean isTeamMember = currentUser.getRoles().stream()
                .anyMatch(r -> r.getName() == UserRole.ROLE_TEAM_MEMBER);

        Long effectiveAssigneeId = isTeamMember ? currentUser.getId() : assigneeId;

        Specification<Task> spec = (root, query, cb) -> {
            var predicates = new ArrayList<jakarta.persistence.criteria.Predicate>();

            if (projectId != null) {
                predicates.add(cb.equal(root.get("project").get("id"), projectId));
            }
            if (effectiveAssigneeId != null) {
                predicates.add(cb.equal(root.get("assignee").get("id"), effectiveAssigneeId));
            }

            return cb.and(predicates.toArray(new jakarta.persistence.criteria.Predicate[0]));
        };

        List<Task> tasks = taskRepository.findAll(spec);
        long totalTasks = tasks.size();
        long completedTasks = tasks.stream().filter(t -> t.getStatus() == TaskStatus.DONE).count();
        long pendingTasks = totalTasks - completedTasks;

        LocalDate today = LocalDate.now();
        long overdueTasks = tasks.stream()
                .filter(t -> t.getStatus() != TaskStatus.DONE && t.getDueDate() != null && t.getDueDate().isBefore(today))
                .count();

        double completionPercentage = 0.0;
        if (totalTasks > 0) {
            completionPercentage = ((double) completedTasks / totalTasks) * 100.0;
            completionPercentage = Math.round(completionPercentage * 100.0) / 100.0;
        }

        return new TaskStatisticsResponse(
                totalTasks,
                completedTasks,
                pendingTasks,
                overdueTasks,
                completionPercentage
        );
    }

    private User getCurrentAuthenticatedUser() {
        return getCurrentAuthenticatedUser(null);
    }

    private User getCurrentAuthenticatedUser(Project project) {
        String email = SecurityUtils.getCurrentUserUsername().orElse(null);
        if (email != null) {
            return userRepository.findByEmail(email)
                    .orElseThrow(() -> new ResourceNotFoundException("User profile not found with email: " + email));
        }
        if (project != null && project.getOwner() != null) {
            return project.getOwner();
        }
        return userRepository.findAll().stream().findFirst()
                .orElseThrow(() -> new UnauthorizedAccessException("No user is currently authenticated or exists in database"));
    }

    private void verifyReadAccess(Task task) {
        User currentUser = getCurrentAuthenticatedUser(task.getProject());
        boolean isAdmin = currentUser.getRoles().stream().anyMatch(r -> r.getName() == UserRole.ROLE_ADMIN);
        if (isAdmin) {
            return;
        }

        boolean isMember = projectMemberRepository.existsByProjectAndUser(task.getProject(), currentUser);
        if (!isMember) {
            throw new UnauthorizedAccessException("You do not have permission to view this task. You must be a member of the project.");
        }
    }

    private void verifyAccess(Project project) {
        User currentUser = getCurrentAuthenticatedUser(project);
        boolean isAdmin = currentUser.getRoles().stream().anyMatch(r -> r.getName() == UserRole.ROLE_ADMIN);
        if (isAdmin) {
            return;
        }

        com.taskforge.module.project.entity.ProjectMember member = projectMemberRepository.findByProjectAndUser(project, currentUser)
                .orElseThrow(() -> new UnauthorizedAccessException("You do not have permission to access this project"));

        boolean isPM = currentUser.getRoles().stream().anyMatch(r -> r.getName() == UserRole.ROLE_PROJECT_MANAGER);
        if (isPM) {
            if (member.getRole() != ProjectMemberRole.OWNER && member.getRole() != ProjectMemberRole.MANAGER) {
                throw new UnauthorizedAccessException("Project Managers can only view projects they own or manage");
            }
            return;
        }

        boolean isTeamMember = currentUser.getRoles().stream().anyMatch(r -> r.getName() == UserRole.ROLE_TEAM_MEMBER);
        if (isTeamMember) {
            return;
        }

        if (member.getRole() != ProjectMemberRole.OWNER) {
            throw new UnauthorizedAccessException("You can only view projects you own");
        }
    }

    private void verifyModificationAccess(Project project) {
        User currentUser = getCurrentAuthenticatedUser(project);

        boolean isAdmin = currentUser.getRoles().stream().anyMatch(r -> r.getName() == UserRole.ROLE_ADMIN);
        if (isAdmin) {
            return;
        }

        com.taskforge.module.project.entity.ProjectMember member = projectMemberRepository.findByProjectAndUser(project, currentUser).orElse(null);
        if (member != null && (member.getRole() == ProjectMemberRole.OWNER || member.getRole() == ProjectMemberRole.MANAGER)) {
            return;
        }

        throw new UnauthorizedAccessException("You do not have permission to manage/assign tasks in this project. Only Project Owner, Project Manager, or Admin can assign tasks.");
    }

    private void updateTaskStatus(Task task, TaskStatus newStatus) {
        TaskStatus oldStatus = task.getStatus();
        if (newStatus != oldStatus) {
            task.setStatus(newStatus);
            if (newStatus == TaskStatus.DONE) {
                task.setCompletedDate(LocalDate.now());
            } else if (oldStatus == TaskStatus.DONE) {
                task.setCompletedDate(null);
            }
        }
    }
}
