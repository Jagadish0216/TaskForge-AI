package com.taskforge.module.project.service;

import com.taskforge.common.constant.ProjectMemberRole;
import com.taskforge.common.constant.TaskStatus;
import com.taskforge.common.constant.UserRole;
import com.taskforge.common.exception.InvalidStateException;
import com.taskforge.common.exception.ResourceNotFoundException;
import com.taskforge.common.exception.UnauthorizedAccessException;
import com.taskforge.module.project.dto.*;
import com.taskforge.module.project.entity.Project;
import com.taskforge.module.project.entity.ProjectMember;
import com.taskforge.module.project.repository.ProjectMemberRepository;
import com.taskforge.module.project.repository.ProjectRepository;
import com.taskforge.module.task.repository.TaskRepository;
import com.taskforge.module.user.entity.User;
import com.taskforge.module.user.repository.UserRepository;
import com.taskforge.module.project.mapper.ProjectMapper;
import com.taskforge.security.SecurityUtils;
import jakarta.persistence.criteria.Root;
import jakarta.persistence.criteria.Subquery;
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
 * Service orchestrating Project Lifecycle actions: CRUD operations, search filters, statistics, and archiving.
 */
@Service
public class ProjectService {

    private final ProjectRepository projectRepository;
    private final ProjectMemberRepository projectMemberRepository;
    private final TaskRepository taskRepository;
    private final UserRepository userRepository;
    private final ProjectMapper projectMapper;
    private final com.taskforge.module.activity.service.ActivityService activityService;
    private final com.taskforge.module.project.repository.ProjectInvitationRepository projectInvitationRepository;
    private final com.taskforge.module.activity.repository.ActivityLogRepository activityLogRepository;
    private final com.taskforge.module.storage.repository.AttachmentRepository attachmentRepository;
    private final com.taskforge.module.task.repository.CommentRepository commentRepository;
    private final com.taskforge.module.task.repository.CommentHistoryRepository commentHistoryRepository;

    public ProjectService(
            ProjectRepository projectRepository,
            ProjectMemberRepository projectMemberRepository,
            TaskRepository taskRepository,
            UserRepository userRepository,
            ProjectMapper projectMapper,
            com.taskforge.module.activity.service.ActivityService activityService,
            com.taskforge.module.project.repository.ProjectInvitationRepository projectInvitationRepository,
            com.taskforge.module.activity.repository.ActivityLogRepository activityLogRepository,
            com.taskforge.module.storage.repository.AttachmentRepository attachmentRepository,
            com.taskforge.module.task.repository.CommentRepository commentRepository,
            com.taskforge.module.task.repository.CommentHistoryRepository commentHistoryRepository
    ) {
        this.projectRepository = projectRepository;
        this.projectMemberRepository = projectMemberRepository;
        this.taskRepository = taskRepository;
        this.userRepository = userRepository;
        this.projectMapper = projectMapper;
        this.activityService = activityService;
        this.projectInvitationRepository = projectInvitationRepository;
        this.activityLogRepository = activityLogRepository;
        this.attachmentRepository = attachmentRepository;
        this.commentRepository = commentRepository;
        this.commentHistoryRepository = commentHistoryRepository;
    }

    /**
     * Creates a new project and assigns the creator as the OWNER member.
     *
     * @param request creation request payload
     * @return response details of the created project
     */
    @Transactional
    public ProjectResponse createProject(ProjectCreateRequest request) {
        if (projectRepository.existsByProjectKey(request.projectKey())) {
            throw new InvalidStateException("Project key '" + request.projectKey() + "' is already in use");
        }

        User currentUser = getCurrentAuthenticatedUser();

        Project project = projectMapper.toEntity(request);
        project.setOwner(currentUser);
        project.setArchived(false);

        Project savedProject = projectRepository.save(project);

        ProjectMember ownerMember = ProjectMember.builder()
                .project(savedProject)
                .user(currentUser)
                .role(ProjectMemberRole.OWNER)
                .build();
        projectMemberRepository.save(ownerMember);

        activityService.recordActivity(
                com.taskforge.common.constant.ActivityType.PROJECT_CREATED,
                "Project created: " + savedProject.getName() + " (" + savedProject.getProjectKey() + ")",
                savedProject,
                null
        );

        return projectMapper.toResponse(savedProject);
    }

    /**
     * Gets project details by ID with visibility checks.
     *
     * @param id project ID
     * @return project details
     */
    @Transactional(readOnly = true)
    public ProjectResponse getProjectById(Long id) {
        Project project = projectRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Project not found with id: " + id));

        verifyAccess(project);
        return projectMapper.toResponse(project);
    }

    /**
     * Gets project details by unique Project Key with visibility checks.
     *
     * @param projectKey project key
     * @return project details
     */
    @Transactional(readOnly = true)
    public ProjectResponse getProjectByProjectKey(String projectKey) {
        Project project = projectRepository.findByProjectKey(projectKey)
                .orElseThrow(() -> new ResourceNotFoundException("Project not found with key: " + projectKey));

        verifyAccess(project);
        return projectMapper.toResponse(project);
    }

    /**
     * Searches and filters projects with pagination and sorting.
     *
     * @param searchRequest search filters (keyword, status, priority, visibility, archived)
     * @param pageable      pagination and sorting details
     * @return paginated projects list
     */
    @Transactional(readOnly = true)
    public ProjectPageResponse searchProjects(ProjectSearchRequest searchRequest, Pageable pageable) {
        User currentUser = getCurrentAuthenticatedUser();
        boolean isTeamMember = currentUser.getRoles().stream()
                .anyMatch(r -> r.getName() == UserRole.ROLE_TEAM_MEMBER);

        Specification<Project> spec = (root, query, cb) -> {
            var predicates = new ArrayList<jakarta.persistence.criteria.Predicate>();

            // Default: exclude archived projects unless explicitly requested
            boolean searchArchived = searchRequest.archived() != null && searchRequest.archived();
            predicates.add(cb.equal(root.get("archived"), searchArchived));

            if (searchRequest.status() != null) {
                predicates.add(cb.equal(root.get("status"), searchRequest.status()));
            }

            if (searchRequest.priority() != null) {
                predicates.add(cb.equal(root.get("priority"), searchRequest.priority()));
            }

            if (searchRequest.visibility() != null) {
                predicates.add(cb.equal(root.get("visibility"), searchRequest.visibility()));
            }

            if (searchRequest.ownerId() != null) {
                predicates.add(cb.equal(root.get("owner").get("id"), searchRequest.ownerId()));
            }

            if (StringUtils.hasText(searchRequest.keyword())) {
                String searchPattern = "%" + searchRequest.keyword().toLowerCase() + "%";
                var keywordPredicate = cb.or(
                        cb.like(cb.lower(root.get("name")), searchPattern),
                        cb.like(cb.lower(root.get("projectKey")), searchPattern)
                );
                predicates.add(keywordPredicate);
            }

            // Access control: Team members can ONLY search/see projects where they are members
            if (isTeamMember) {
                Subquery<Long> subquery = query.subquery(Long.class);
                Root<ProjectMember> pmRoot = subquery.from(ProjectMember.class);
                subquery.select(pmRoot.get("project").get("id"))
                        .where(cb.equal(pmRoot.get("user"), currentUser));
                predicates.add(root.get("id").in(subquery));
            }

            return cb.and(predicates.toArray(new jakarta.persistence.criteria.Predicate[0]));
        };

        Page<Project> projectPage = projectRepository.findAll(spec, pageable);
        List<ProjectResponse> content = projectPage.getContent().stream()
                .map(projectMapper::toResponse)
                .toList();

        return new ProjectPageResponse(
                content,
                projectPage.getNumber(),
                projectPage.getSize(),
                projectPage.getTotalPages(),
                projectPage.getTotalElements(),
                projectPage.isLast()
        );
    }

    /**
     * Updates an existing project.
     *
     * @param id      project ID
     * @param request update payload
     * @return updated project response
     */
    @Transactional
    public ProjectResponse updateProject(Long id, ProjectUpdateRequest request) {
        Project project = projectRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Project not found with id: " + id));

        verifyModificationAccess(project);

        project.setName(request.name());
        project.setDescription(request.description());
        project.setStatus(request.status());
        project.setPriority(request.priority());
        project.setVisibility(request.visibility());
        project.setStartDate(request.startDate());
        project.setEndDate(request.endDate());

        Project updatedProject = projectRepository.save(project);

        activityService.recordActivity(
                com.taskforge.common.constant.ActivityType.PROJECT_UPDATED,
                "Project updated: " + updatedProject.getName(),
                updatedProject,
                null
        );

        return projectMapper.toResponse(updatedProject);
    }

    /**
     * Archives a project.
     *
     * @param id project ID
     */
    @Transactional
    public void archiveProject(Long id) {
        Project project = projectRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Project not found with id: " + id));

        verifyModificationAccess(project);
        project.setArchived(true);
        Project savedProject = projectRepository.save(project);

        activityService.recordActivity(
                com.taskforge.common.constant.ActivityType.PROJECT_ARCHIVED,
                "Project archived: " + savedProject.getName(),
                savedProject,
                null
        );
    }

    /**
     * Restores an archived project.
     *
     * @param id project ID
     */
    @Transactional
    public void restoreProject(Long id) {
        Project project = projectRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Project not found with id: " + id));

        verifyModificationAccess(project);
        project.setArchived(false);
        Project savedProject = projectRepository.save(project);

        activityService.recordActivity(
                com.taskforge.common.constant.ActivityType.PROJECT_RESTORED,
                "Project restored: " + savedProject.getName(),
                savedProject,
                null
        );
    }

    /**
     * Permanently deletes a project.
     *
     * @param id project ID
     */
    @Transactional
    public void deleteProject(Long id) {
        Project project = projectRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Project not found with id: " + id));

        verifyModificationAccess(project);

        // 1. Delete activities
        List<com.taskforge.module.activity.entity.ActivityLog> activities = activityLogRepository.findByProject(project);
        activityLogRepository.deleteAll(activities);

        // 2. Delete invitations
        List<com.taskforge.module.project.entity.ProjectInvitation> invitations = projectInvitationRepository.findByProject(project);
        projectInvitationRepository.deleteAll(invitations);

        // 3. Delete members
        List<com.taskforge.module.project.entity.ProjectMember> members = projectMemberRepository.findByProject(project);
        projectMemberRepository.deleteAll(members);

        // 4. Delete tasks (tasks have comments, comment history, and attachments)
        List<com.taskforge.module.task.entity.Task> tasks = taskRepository.findByProject(project);
        for (com.taskforge.module.task.entity.Task task : tasks) {
            List<com.taskforge.module.task.entity.Comment> comments = commentRepository.findByTask(task);
            // 1. Delete replies (child comments) first
            for (com.taskforge.module.task.entity.Comment comment : comments) {
                if (comment.getParentComment() != null) {
                    List<com.taskforge.module.task.entity.CommentHistory> history = commentHistoryRepository.findByCommentOrderByEditedAtDesc(comment);
                    commentHistoryRepository.deleteAll(history);
                    commentRepository.delete(comment);
                }
            }
            // 2. Delete parent comments second
            for (com.taskforge.module.task.entity.Comment comment : comments) {
                if (comment.getParentComment() == null) {
                    List<com.taskforge.module.task.entity.CommentHistory> history = commentHistoryRepository.findByCommentOrderByEditedAtDesc(comment);
                    commentHistoryRepository.deleteAll(history);
                    commentRepository.delete(comment);
                }
            }
            List<com.taskforge.module.storage.entity.Attachment> taskAttachments = attachmentRepository.findByTask(task);
            attachmentRepository.deleteAll(taskAttachments);
            taskRepository.delete(task);
        }

        // 5. Delete project-level attachments
        List<com.taskforge.module.storage.entity.Attachment> projAttachments = attachmentRepository.findByProject(project);
        attachmentRepository.deleteAll(projAttachments);

        // 6. Delete project
        projectRepository.delete(project);
    }

    /**
     * Retrieves statistics metadata overview for a specific project.
     *
     * @param id project ID
     * @return project statistics
     */
    @Transactional(readOnly = true)
    public ProjectStatisticsResponse getProjectStatistics(Long id) {
        Project project = projectRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Project not found with id: " + id));

        verifyAccess(project);

        long totalMembers = projectMemberRepository.countByProject(project);
        long totalTasks = taskRepository.countByProject(project);
        long completedTasks = taskRepository.countByProjectAndStatus(project, TaskStatus.DONE);
        long pendingTasks = totalTasks - completedTasks;
        long overdueTasks = taskRepository.countByProjectAndStatusNotAndDueDateBefore(project, TaskStatus.DONE, LocalDate.now());

        double progressPercentage = 0.0;
        if (totalTasks > 0) {
            progressPercentage = ((double) completedTasks / totalTasks) * 100.0;
            // Round to 2 decimal places
            progressPercentage = Math.round(progressPercentage * 100.0) / 100.0;
        }

        return new ProjectStatisticsResponse(
                totalMembers,
                totalTasks,
                completedTasks,
                pendingTasks,
                overdueTasks,
                progressPercentage
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

    private void verifyAccess(Project project) {
        User currentUser = getCurrentAuthenticatedUser(project);

        // Admin and PM can view all projects. Team members can view only projects they belong to.
        boolean isTeamMember = currentUser.getRoles().stream()
                .anyMatch(r -> r.getName() == UserRole.ROLE_TEAM_MEMBER);

        if (isTeamMember) {
            boolean isMember = projectMemberRepository.existsByProjectAndUser(project, currentUser);
            if (!isMember) {
                throw new UnauthorizedAccessException("You are not a member of this project");
            }
        }
    }

    private void verifyModificationAccess(Project project) {
        User currentUser = getCurrentAuthenticatedUser(project);

        boolean isAdmin = currentUser.getRoles().stream().anyMatch(r -> r.getName() == UserRole.ROLE_ADMIN);
        boolean isPM = currentUser.getRoles().stream().anyMatch(r -> r.getName() == UserRole.ROLE_PROJECT_MANAGER);

        if (isAdmin) {
            return; // Admins have full access
        }

        if (isPM) {
            // Project Managers can modify ONLY their own owned projects
            if (!project.getOwner().getId().equals(currentUser.getId())) {
                throw new UnauthorizedAccessException("You can only modify projects you own");
            }
            return;
        }

        if (project.getOwner().getId().equals(currentUser.getId())) {
            return;
        }

        throw new UnauthorizedAccessException("You do not have permission to modify this project");
    }
}
