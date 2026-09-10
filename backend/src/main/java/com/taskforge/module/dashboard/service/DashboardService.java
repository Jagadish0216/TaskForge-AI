package com.taskforge.module.dashboard.service;

import com.taskforge.common.constant.ProjectStatus;
import com.taskforge.common.constant.TaskStatus;
import com.taskforge.common.exception.ResourceNotFoundException;
import com.taskforge.common.exception.UnauthorizedAccessException;
import com.taskforge.module.activity.dto.ActivityResponse;
import com.taskforge.module.activity.entity.ActivityLog;
import com.taskforge.module.activity.mapper.ActivityMapper;
import com.taskforge.module.activity.repository.ActivityLogRepository;
import com.taskforge.module.dashboard.dto.DashboardStatsResponse;
import com.taskforge.module.project.entity.Project;
import com.taskforge.module.project.repository.ProjectRepository;
import com.taskforge.module.task.dto.TaskResponse;
import com.taskforge.module.task.entity.Task;
import com.taskforge.module.task.mapper.TaskMapper;
import com.taskforge.module.task.repository.TaskRepository;
import com.taskforge.module.user.entity.User;
import com.taskforge.module.user.repository.UserRepository;
import com.taskforge.security.SecurityUtils;
import com.taskforge.module.project.entity.ProjectMember;
import com.taskforge.module.project.repository.ProjectMemberRepository;
import com.taskforge.common.constant.UserRole;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

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

        // 1. Projects metrics - Filtered by visibility
        List<Project> allProjects = projectRepository.findAll().stream()
                .filter(p -> {
                    try {
                        verifyAccess(p, currentUser);
                        return true;
                    } catch (Exception e) {
                        return false;
                    }
                })
                .toList();

        long totalProjects = allProjects.size();
        long completedProjects = allProjects.stream().filter(p -> p.getStatus() == ProjectStatus.COMPLETED).count();

        // 2. Tasks metrics - Filtered to visible projects only
        List<Long> visibleProjectIds = allProjects.stream().map(Project::getId).toList();
        List<Task> allTasks = taskRepository.findAll().stream()
                .filter(t -> visibleProjectIds.contains(t.getProject().getId()))
                .toList();

        long totalTasks = allTasks.size();
        long completedTasks = allTasks.stream().filter(t -> t.getStatus() == TaskStatus.DONE).count();
        long pendingTasks = totalTasks - completedTasks;
        long overdueTasks = allTasks.stream()
                .filter(t -> t.getStatus() != TaskStatus.DONE && t.getDueDate() != null && t.getDueDate().isBefore(LocalDate.now()))
                .count();

        // 3. Project Health
        Map<String, Double> projectHealth = new HashMap<>();
        for (Project project : allProjects) {
            List<Task> projectTasks = allTasks.stream().filter(t -> t.getProject().getId().equals(project.getId())).toList();
            double progress = 0.0;
            if (!projectTasks.isEmpty()) {
                long done = projectTasks.stream().filter(t -> t.getStatus() == TaskStatus.DONE).count();
                progress = ((double) done / projectTasks.size()) * 100.0;
            }
            projectHealth.put(project.getName(), Math.round(progress * 100.0) / 100.0);
        }

        // 4. Recent Activities - Filtered to visible projects only
        Pageable recentLogPageable = PageRequest.of(0, 10, Sort.by(Sort.Direction.DESC, "createdAt"));
        List<ActivityLog> recentLogs = activityLogRepository.findAll(recentLogPageable).getContent().stream()
                .filter(log -> log.getProject() == null || visibleProjectIds.contains(log.getProject().getId()))
                .toList();
        List<ActivityResponse> recentActivities = activityMapper.toResponseList(recentLogs);

        // 5. Upcoming Deadlines
        List<Task> upcomingDeadlineTasks = allTasks.stream()
                .filter(t -> t.getStatus() != TaskStatus.DONE && t.getDueDate() != null && !t.getDueDate().isBefore(LocalDate.now()))
                .sorted((t1, t2) -> t1.getDueDate().compareTo(t2.getDueDate()))
                .limit(5)
                .toList();
        List<TaskResponse> upcomingDeadlines = taskMapper.toResponseList(upcomingDeadlineTasks);

        // 6. Team Productivity (completed tasks per user email)
        Map<String, Long> teamProductivity = allTasks.stream()
                .filter(t -> t.getStatus() == TaskStatus.DONE && t.getAssignee() != null)
                .collect(Collectors.groupingBy(t -> t.getAssignee().getFirstName() + " " + t.getAssignee().getLastName(), Collectors.counting()));

        // 7. Task Distribution
        Map<String, Long> taskDistribution = allTasks.stream()
                .collect(Collectors.groupingBy(t -> t.getStatus().name(), Collectors.counting()));

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

    private void verifyAccess(Project project, User currentUser) {
        boolean isAdmin = currentUser.getRoles().stream().anyMatch(r -> r.getName() == UserRole.ROLE_ADMIN);
        if (isAdmin) {
            return;
        }

        ProjectMember member = projectMemberRepository.findByProjectAndUser(project, currentUser)
                .orElseThrow(() -> new UnauthorizedAccessException("You do not have access to this project"));

        boolean isPM = currentUser.getRoles().stream().anyMatch(r -> r.getName() == UserRole.ROLE_PROJECT_MANAGER);
        if (isPM) {
            if (member.getRole() != com.taskforge.common.constant.ProjectMemberRole.OWNER && member.getRole() != com.taskforge.common.constant.ProjectMemberRole.MANAGER) {
                throw new UnauthorizedAccessException("Project Managers can only view projects they own or manage");
            }
            return;
        }

        boolean isTeamMember = currentUser.getRoles().stream().anyMatch(r -> r.getName() == UserRole.ROLE_TEAM_MEMBER);
        if (isTeamMember) {
            return;
        }

        if (member.getRole() != com.taskforge.common.constant.ProjectMemberRole.OWNER) {
            throw new UnauthorizedAccessException("You can only view projects you own");
        }
    }

    private User getCurrentAuthenticatedUser() {
        String email = SecurityUtils.getCurrentUserUsername()
                .orElseThrow(() -> new UnauthorizedAccessException("No user is currently authenticated"));
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User profile not found with email: " + email));
    }
}
