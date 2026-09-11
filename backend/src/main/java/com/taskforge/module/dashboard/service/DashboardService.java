package com.taskforge.module.dashboard.service;

import com.taskforge.common.constant.ProjectMemberRole;
import com.taskforge.common.constant.ProjectStatus;
import com.taskforge.common.constant.TaskStatus;
import com.taskforge.common.constant.UserRole;
import com.taskforge.common.exception.ResourceNotFoundException;
import com.taskforge.common.exception.UnauthorizedAccessException;
import com.taskforge.module.activity.dto.ActivityResponse;
import com.taskforge.module.activity.entity.ActivityLog;
import com.taskforge.module.activity.mapper.ActivityMapper;
import com.taskforge.module.activity.repository.ActivityLogRepository;
import com.taskforge.module.dashboard.dto.DashboardStatsResponse;
import com.taskforge.module.project.entity.Project;
import com.taskforge.module.project.entity.ProjectMember;
import com.taskforge.module.project.repository.ProjectMemberRepository;
import com.taskforge.module.project.repository.ProjectRepository;
import com.taskforge.module.task.dto.TaskResponse;
import com.taskforge.module.task.mapper.TaskMapper;
import com.taskforge.module.task.repository.TaskRepository;
import com.taskforge.module.user.entity.User;
import com.taskforge.module.user.repository.UserRepository;
import com.taskforge.security.SecurityUtils;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class DashboardService {

    private final ProjectRepository projectRepository;
    private final TaskRepository taskRepository;
    private final ActivityLogRepository activityLogRepository;
    private final UserRepository userRepository;
    private final ProjectMemberRepository projectMemberRepository;
    private final TaskMapper taskMapper;
    private final ActivityMapper activityMapper;

    public DashboardService(
            ProjectRepository projectRepository,
            TaskRepository taskRepository,
            ActivityLogRepository activityLogRepository,
            UserRepository userRepository,
            ProjectMemberRepository projectMemberRepository,
            TaskMapper taskMapper,
            ActivityMapper activityMapper
    ) {
        this.projectRepository = projectRepository;
        this.taskRepository = taskRepository;
        this.activityLogRepository = activityLogRepository;
        this.userRepository = userRepository;
        this.projectMemberRepository = projectMemberRepository;
        this.taskMapper = taskMapper;
        this.activityMapper = activityMapper;
    }

    @Transactional(readOnly = true)
    public DashboardStatsResponse getDashboardSummary() {
        User currentUser = getCurrentAuthenticatedUser();

        // 1. Resolve visible project IDs — 1 membership query for non-admins, 0 for admins
        List<Long> visibleProjectIds = resolveVisibleProjectIds(currentUser);

        // 2. Project metrics — COUNT at DB level
        long totalProjects = visibleProjectIds.size();
        long completedProjects = visibleProjectIds.isEmpty() ? 0 :
                projectRepository.countByIdInAndStatus(visibleProjectIds, ProjectStatus.COMPLETED);

        // 3. Task aggregate metrics — targeted COUNT queries
        LocalDate today = LocalDate.now();
        long totalTasks = visibleProjectIds.isEmpty() ? 0 :
                taskRepository.countByProjectIdIn(visibleProjectIds);
        long completedTasks = visibleProjectIds.isEmpty() ? 0 :
                taskRepository.countByProjectIdInAndStatus(visibleProjectIds, TaskStatus.DONE);
        long pendingTasks = totalTasks - completedTasks;
        long overdueTasks = visibleProjectIds.isEmpty() ? 0 :
                taskRepository.countByProjectIdInAndStatusNotAndDueDateBefore(visibleProjectIds, TaskStatus.DONE, today);

        // 4. Project Health — reuse ProjectTaskSummary GROUP BY (from Phase 2A.3)
        Map<String, Double> projectHealth = new HashMap<>();
        if (!visibleProjectIds.isEmpty()) {
            List<TaskRepository.ProjectTaskSummary> summaries =
                    taskRepository.countTaskSummaryByProjects(visibleProjectIds);
            Map<Long, TaskRepository.ProjectTaskSummary> summaryMap = new HashMap<>();
            for (TaskRepository.ProjectTaskSummary s : summaries) {
                summaryMap.put(s.getProjectId(), s);
            }
            // Load only the accessible project names (needed for projectHealth map keys)
            List<Project> visibleProjects = projectRepository.findAllById(visibleProjectIds);
            for (Project project : visibleProjects) {
                TaskRepository.ProjectTaskSummary summary = summaryMap.get(project.getId());
                long total = summary != null ? summary.getTotalCount() : 0;
                long done = summary != null ? summary.getDoneCount() : 0;
                double progress = total > 0 ? ((double) done / total) * 100.0 : 0.0;
                projectHealth.put(project.getName(), Math.round(progress * 100.0) / 100.0);
            }
        }

        // 5. Recent Activities — scoped to visible projects at DB level
        Pageable recentLogPageable = PageRequest.of(0, 10);
        List<ActivityLog> recentLogs = visibleProjectIds.isEmpty()
                ? List.of()
                : activityLogRepository.findRecentForProjects(visibleProjectIds, recentLogPageable);
        List<ActivityResponse> recentActivities = activityMapper.toResponseList(recentLogs);

        // 6. Upcoming Deadlines — DB-side sort + limit, full TaskResponse needed
        List<TaskResponse> upcomingDeadlines = List.of();
        if (!visibleProjectIds.isEmpty()) {
            Pageable top5 = PageRequest.of(0, 5);
            upcomingDeadlines = taskMapper.toResponseList(
                    taskRepository.findUpcomingDeadlinesForProjects(visibleProjectIds, today, top5));
        }

        // 7. Team Productivity — GROUP BY status query, then pick DONE per assignee
        //    Still needs assignee name → load the DONE tasks only (filtered set, not all tasks)
        Map<String, Long> teamProductivity = new HashMap<>();
        if (!visibleProjectIds.isEmpty()) {
            // Load only DONE tasks with assignee for visible projects to build productivity map
            // This avoids loading all tasks while still being correct
            List<TaskRepository.TeamProductivityEntry> entries =
                    taskRepository.countDoneTasksGroupedByAssignee(visibleProjectIds);
            for (TaskRepository.TeamProductivityEntry e : entries) {
                teamProductivity.put(e.getAssigneeName(), e.getCount());
            }
        }

        // 8. Task Distribution — GROUP BY status at DB level
        Map<String, Long> taskDistribution = new HashMap<>();
        if (!visibleProjectIds.isEmpty()) {
            for (TaskRepository.TaskStatusCount sc :
                    taskRepository.countByStatusGroupedForProjects(visibleProjectIds)) {
                taskDistribution.put(sc.getStatus(), sc.getCount());
            }
        }

        return new DashboardStatsResponse(
                totalProjects,
                completedProjects,
                totalTasks,
                completedTasks,
                pendingTasks,
                overdueTasks,
                projectHealth,
                recentActivities,
                upcomingDeadlines,
                teamProductivity,
                taskDistribution
        );
    }

    /**
     * Resolves project IDs visible to the current user.
     * - Admins see all project IDs (1 query: findAll for IDs only)
     * - PROJECT_MANAGER role: only projects where member role = OWNER or MANAGER
     * - ROLE_TEAM_MEMBER: all projects they are a member of
     * - Other authenticated users: only projects where they are OWNER role member
     *
     * Exactly preserves the original verifyAccess() role semantics.
     */
    private List<Long> resolveVisibleProjectIds(User currentUser) {
        boolean isAdmin = currentUser.getRoles().stream()
                .anyMatch(r -> r.getName() == UserRole.ROLE_ADMIN);
        if (isAdmin) {
            return projectRepository.findAll().stream()
                    .map(Project::getId)
                    .toList();
        }

        // Get all memberships for this user in one query
        List<ProjectMember> memberships = projectMemberRepository.findByUser(currentUser);

        boolean isPM = currentUser.getRoles().stream()
                .anyMatch(r -> r.getName() == UserRole.ROLE_PROJECT_MANAGER);
        if (isPM) {
            // Project Managers see projects they own or manage
            return memberships.stream()
                    .filter(m -> m.getRole() == ProjectMemberRole.OWNER
                              || m.getRole() == ProjectMemberRole.MANAGER)
                    .map(m -> m.getProject().getId())
                    .toList();
        }

        boolean isTeamMember = currentUser.getRoles().stream()
                .anyMatch(r -> r.getName() == UserRole.ROLE_TEAM_MEMBER);
        if (isTeamMember) {
            // Team members see all projects they belong to
            return memberships.stream()
                    .map(m -> m.getProject().getId())
                    .toList();
        }

        // Default: only projects where the user is an OWNER member
        return memberships.stream()
                .filter(m -> m.getRole() == ProjectMemberRole.OWNER)
                .map(m -> m.getProject().getId())
                .toList();
    }

    private User getCurrentAuthenticatedUser() {
        String email = SecurityUtils.getCurrentUserUsername()
                .orElseThrow(() -> new UnauthorizedAccessException("No user is currently authenticated"));
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User profile not found with email: " + email));
    }
}
