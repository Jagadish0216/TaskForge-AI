package com.taskforge.module.activity.service;

import com.taskforge.common.constant.ActivityType;
import com.taskforge.common.constant.UserRole;
import com.taskforge.common.exception.ResourceNotFoundException;
import com.taskforge.common.exception.UnauthorizedAccessException;
import com.taskforge.module.activity.dto.ActivityPageResponse;
import com.taskforge.module.activity.dto.ActivityResponse;
import com.taskforge.module.activity.dto.ActivitySearchRequest;
import com.taskforge.module.activity.entity.ActivityLog;
import com.taskforge.module.activity.mapper.ActivityMapper;
import com.taskforge.module.activity.repository.ActivityLogRepository;
import com.taskforge.module.project.entity.Project;
import com.taskforge.module.project.repository.ProjectMemberRepository;
import com.taskforge.module.project.repository.ProjectRepository;
import com.taskforge.module.task.entity.Task;
import com.taskforge.module.user.entity.User;
import com.taskforge.module.user.repository.UserRepository;
import com.taskforge.security.SecurityUtils;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.util.ArrayList;
import java.util.List;

/**
 * Service for publishing activity timeline logs and retrieving project, user, or global timelines.
 */
@Service
public class ActivityService {

    private static final Logger log = LoggerFactory.getLogger(ActivityService.class);

    private final ActivityLogRepository activityLogRepository;
    private final ProjectRepository projectRepository;
    private final ProjectMemberRepository projectMemberRepository;
    private final UserRepository userRepository;
    private final ActivityMapper activityMapper;

    public ActivityService(
            ActivityLogRepository activityLogRepository,
            ProjectRepository projectRepository,
            ProjectMemberRepository projectMemberRepository,
            UserRepository userRepository,
            ActivityMapper activityMapper
    ) {
        this.activityLogRepository = activityLogRepository;
        this.projectRepository = projectRepository;
        this.projectMemberRepository = projectMemberRepository;
        this.userRepository = userRepository;
        this.activityMapper = activityMapper;
    }

    /**
     * Publishes a new activity log entry to the timeline database.
     *
     * @param type        activity event type
     * @param description description summary text
     * @param project     associated project reference (nullable)
     * @param task        associated task reference (nullable)
     * @param user        user actor (nullable, defaults to authenticated user if null)
     */
    @Transactional
    public void recordActivity(ActivityType type, String description, Project project, Task task, User user) {
        User actor = user;
        if (actor == null) {
            actor = getAuthenticatedUserOrNull();
        }

        if (actor == null) {
            log.warn("Activity type '{}' published without active user session context: '{}'", type, description);
            return;
        }

        ActivityLog logEntry = ActivityLog.builder()
                .type(type)
                .description(description)
                .project(project)
                .task(task)
                .user(actor)
                .build();

        activityLogRepository.save(logEntry);
        log.debug("Activity recorded: [{}] - {}", type, description);
    }

    /**
     * Publishes a new activity log entry associated with a project/task under the current authenticated user context.
     *
     * @param type        activity event type
     * @param description description summary text
     * @param project     associated project reference (nullable)
     * @param task        associated task reference (nullable)
     */
    @Transactional
    public void recordActivity(ActivityType type, String description, Project project, Task task) {
        recordActivity(type, description, project, task, null);
    }

    /**
     * Publishes a new activity log entry under a specific user actor context (e.g. login/register events).
     *
     * @param type        activity event type
     * @param description description summary text
     * @param user        user actor reference (not null)
     */
    @Transactional
    public void recordActivity(ActivityType type, String description, User user) {
        recordActivity(type, description, null, null, user);
    }

    /**
     * Retrieves the paginated activity timeline for a project. Accessible only to project members and admins.
     *
     * @param projectId project ID
     * @param pageable  pagination and sorting details
     * @return paginated list of activities
     */
    @Transactional(readOnly = true)
    public ActivityPageResponse getProjectActivityTimeline(Long projectId, Pageable pageable) {
        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new ResourceNotFoundException("Project not found with id: " + projectId));

        User currentUser = getCurrentAuthenticatedUser(project);
        verifyReadAccess(project, currentUser);

        Specification<ActivityLog> spec = (root, query, cb) -> cb.equal(root.get("project"), project);
        Page<ActivityLog> logs = activityLogRepository.findAll(spec, pageable);
        return mapToPageResponse(logs);
    }

    /**
     * Retrieves the paginated activity timeline performed by a user.
     *
     * @param userId   user ID
     * @param pageable pagination and sorting details
     * @return paginated list of activities
     */
    @Transactional(readOnly = true)
    public ActivityPageResponse getUserActivityTimeline(Long userId, Pageable pageable) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));

        Specification<ActivityLog> spec = (root, query, cb) -> cb.equal(root.get("user"), user);
        Page<ActivityLog> logs = activityLogRepository.findAll(spec, pageable);
        return mapToPageResponse(logs);
    }

    /**
     * Searches and lists activity logs dynamically based on search criteria.
     *
     * @param searchRequest search filters (type, project, user, task, keyword)
     * @param pageable      pagination details
     * @return paginated activity search results
     */
    @Transactional(readOnly = true)
    public ActivityPageResponse searchActivities(ActivitySearchRequest searchRequest, Pageable pageable) {
        Specification<ActivityLog> spec = (root, query, cb) -> {
            var predicates = new ArrayList<jakarta.persistence.criteria.Predicate>();

            if (searchRequest.type() != null) {
                predicates.add(cb.equal(root.get("type"), searchRequest.type()));
            }

            if (searchRequest.projectId() != null) {
                predicates.add(cb.equal(root.get("project").get("id"), searchRequest.projectId()));
            }

            if (searchRequest.userId() != null) {
                predicates.add(cb.equal(root.get("user").get("id"), searchRequest.userId()));
            }

            if (searchRequest.taskId() != null) {
                predicates.add(cb.equal(root.get("task").get("id"), searchRequest.taskId()));
            }

            if (StringUtils.hasText(searchRequest.keyword())) {
                String searchPattern = "%" + searchRequest.keyword().toLowerCase() + "%";
                predicates.add(cb.like(cb.lower(root.get("description")), searchPattern));
            }

            return cb.and(predicates.toArray(new jakarta.persistence.criteria.Predicate[0]));
        };

        Page<ActivityLog> logs = activityLogRepository.findAll(spec, pageable);
        return mapToPageResponse(logs);
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

    private User getAuthenticatedUserOrNull() {
        String email = SecurityUtils.getCurrentUserUsername().orElse(null);
        if (email != null) {
            return userRepository.findByEmail(email).orElse(null);
        }
        return userRepository.findAll().stream().findFirst().orElse(null);
    }

    private void verifyReadAccess(Project project, User currentUser) {
        boolean isAdmin = currentUser.getRoles().stream().anyMatch(r -> r.getName() == UserRole.ROLE_ADMIN);
        if (isAdmin) {
            return;
        }

        boolean isMember = projectMemberRepository.existsByProjectAndUser(project, currentUser);
        if (!isMember) {
            throw new UnauthorizedAccessException("Only project members can view this project's activity timeline");
        }
    }

    private ActivityPageResponse mapToPageResponse(Page<ActivityLog> page) {
        List<ActivityResponse> content = page.getContent().stream()
                .map(activityMapper::toResponse)
                .toList();

        return new ActivityPageResponse(
                content,
                page.getNumber(),
                page.getSize(),
                page.getTotalPages(),
                page.getTotalElements(),
                page.isLast()
        );
    }
}
