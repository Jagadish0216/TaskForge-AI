package com.taskforge.module.report.service;

import com.taskforge.common.constant.TaskStatus;
import com.taskforge.common.exception.ResourceNotFoundException;
import com.taskforge.module.project.entity.Project;
import com.taskforge.module.project.repository.ProjectMemberRepository;
import com.taskforge.module.project.repository.ProjectRepository;
import com.taskforge.module.report.dto.ProjectReportResponse;
import com.taskforge.module.report.dto.TaskReportResponse;
import com.taskforge.module.report.dto.UserReportResponse;
import com.taskforge.module.task.dto.TaskResponse;
import com.taskforge.module.task.entity.Task;
import com.taskforge.module.task.mapper.TaskMapper;
import com.taskforge.module.task.repository.TaskRepository;
import com.taskforge.module.user.entity.User;
import com.taskforge.module.user.repository.UserRepository;
import com.taskforge.security.ProjectAuthorizationService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Service
public class ReportService {

    private final ProjectRepository projectRepository;
    private final TaskRepository taskRepository;
    private final ProjectMemberRepository projectMemberRepository;
    private final UserRepository userRepository;
    private final TaskMapper taskMapper;
    private final ProjectAuthorizationService projectAuthorizationService;

    public ReportService(
            ProjectRepository projectRepository,
            TaskRepository taskRepository,
            ProjectMemberRepository projectMemberRepository,
            UserRepository userRepository,
            TaskMapper taskMapper,
            ProjectAuthorizationService projectAuthorizationService
    ) {
        this.projectRepository = projectRepository;
        this.taskRepository = taskRepository;
        this.projectMemberRepository = projectMemberRepository;
        this.userRepository = userRepository;
        this.taskMapper = taskMapper;
        this.projectAuthorizationService = projectAuthorizationService;
    }

    @Transactional(readOnly = true)
    public ProjectReportResponse generateProjectReport(Long projectId) {
        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new ResourceNotFoundException("Project not found with id: " + projectId));

        User currentUser = projectAuthorizationService.getAuthenticatedUser();
        projectAuthorizationService.verifyProjectReadAccess(project, currentUser);

        long totalTasks = taskRepository.countByProject(project);
        long completedTasks = taskRepository.countByProjectAndStatus(project, TaskStatus.DONE);
        long pendingTasks = totalTasks - completedTasks;
        long overdueTasks = taskRepository.countByProjectAndStatusNotAndDueDateBefore(project, TaskStatus.DONE, LocalDate.now());

        double completionRate = 0.0;
        if (totalTasks > 0) {
            completionRate = ((double) completedTasks / totalTasks) * 100.0;
        }

        long totalMembers = projectMemberRepository.countByProject(project);

        return new ProjectReportResponse(
                project.getId(),
                project.getName(),
                project.getProjectKey(),
                project.getStatus(),
                project.getPriority(),
                totalTasks,
                completedTasks,
                pendingTasks,
                overdueTasks,
                Math.round(completionRate * 100.0) / 100.0,
                totalMembers
        );
    }

    @Transactional(readOnly = true)
    public UserReportResponse generateUserReport(Long userId) {
        projectAuthorizationService.getAuthenticatedUser();
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));

        long totalAssignedTasks = taskRepository.countByAssignee(user);
        long completedTasks = taskRepository.countByAssigneeAndStatus(user, TaskStatus.DONE);
        long pendingTasks = totalAssignedTasks - completedTasks;
        long overdueTasks = taskRepository.countByAssigneeAndStatusNotAndDueDateBefore(user, TaskStatus.DONE, LocalDate.now());

        double completionRate = 0.0;
        if (totalAssignedTasks > 0) {
            completionRate = ((double) completedTasks / totalAssignedTasks) * 100.0;
        }

        Double estimatedHoursSum = taskRepository.sumEstimatedHoursByAssignee(user);
        Double actualHoursSum = taskRepository.sumActualHoursByAssignee(user);

        return new UserReportResponse(
                user.getId(),
                user.getFirstName() + " " + user.getLastName(),
                user.getEmail(),
                totalAssignedTasks,
                completedTasks,
                pendingTasks,
                overdueTasks,
                Math.round(completionRate * 100.0) / 100.0,
                estimatedHoursSum != null ? estimatedHoursSum : 0.0,
                actualHoursSum != null ? actualHoursSum : 0.0
        );
    }

    @Transactional(readOnly = true)
    public TaskReportResponse generateTaskReport(Long projectId) {
        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new ResourceNotFoundException("Project not found with id: " + projectId));

        User currentUser = projectAuthorizationService.getAuthenticatedUser();
        projectAuthorizationService.verifyProjectReadAccess(project, currentUser);

        List<Task> tasks = taskRepository.findByProject(project);
        long totalTasks = tasks.size();
        long todo = tasks.stream().filter(t -> t.getStatus() == TaskStatus.TODO).count();
        long inProgress = tasks.stream().filter(t -> t.getStatus() == TaskStatus.IN_PROGRESS).count();
        long done = tasks.stream().filter(t -> t.getStatus() == TaskStatus.DONE).count();
        long inReview = tasks.stream().filter(t -> t.getStatus() == TaskStatus.IN_REVIEW).count();
        long backlog = tasks.stream().filter(t -> t.getStatus() == TaskStatus.BACKLOG).count();

        double estimatedHours = tasks.stream().mapToDouble(t -> t.getEstimatedHours() != null ? t.getEstimatedHours() : 0.0).sum();
        double actualHours = tasks.stream().mapToDouble(t -> t.getActualHours() != null ? t.getActualHours() : 0.0).sum();

        List<TaskResponse> taskResponses = taskMapper.toResponseList(tasks);

        return new TaskReportResponse(
                totalTasks,
                todo,
                inProgress,
                done,
                inReview,
                backlog,
                estimatedHours,
                actualHours,
                taskResponses
        );
    }

    @Transactional(readOnly = true)
    public TaskReportResponse generateWeeklyReport(Long projectId) {
        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new ResourceNotFoundException("Project not found with id: " + projectId));

        User currentUser = projectAuthorizationService.getAuthenticatedUser();
        projectAuthorizationService.verifyProjectReadAccess(project, currentUser);

        LocalDateTime oneWeekAgo = LocalDate.now().minusWeeks(1).atStartOfDay();
        List<Task> tasks = taskRepository.findByProjectAndUpdatedAtGreaterThanEqual(project, oneWeekAgo);

        long totalTasks = tasks.size();
        long todo = tasks.stream().filter(t -> t.getStatus() == TaskStatus.TODO).count();
        long inProgress = tasks.stream().filter(t -> t.getStatus() == TaskStatus.IN_PROGRESS).count();
        long done = tasks.stream().filter(t -> t.getStatus() == TaskStatus.DONE).count();
        long inReview = tasks.stream().filter(t -> t.getStatus() == TaskStatus.IN_REVIEW).count();
        long backlog = tasks.stream().filter(t -> t.getStatus() == TaskStatus.BACKLOG).count();

        double estimatedHours = tasks.stream().mapToDouble(t -> t.getEstimatedHours() != null ? t.getEstimatedHours() : 0.0).sum();
        double actualHours = tasks.stream().mapToDouble(t -> t.getActualHours() != null ? t.getActualHours() : 0.0).sum();

        List<TaskResponse> taskResponses = taskMapper.toResponseList(tasks);

        return new TaskReportResponse(
                totalTasks,
                todo,
                inProgress,
                done,
                inReview,
                backlog,
                estimatedHours,
                actualHours,
                taskResponses
        );
    }

    @Transactional(readOnly = true)
    public TaskReportResponse generateMonthlyReport(Long projectId) {
        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new ResourceNotFoundException("Project not found with id: " + projectId));

        User currentUser = projectAuthorizationService.getAuthenticatedUser();
        projectAuthorizationService.verifyProjectReadAccess(project, currentUser);

        LocalDateTime oneMonthAgo = LocalDate.now().minusMonths(1).atStartOfDay();
        List<Task> tasks = taskRepository.findByProjectAndUpdatedAtGreaterThanEqual(project, oneMonthAgo);

        long totalTasks = tasks.size();
        long todo = tasks.stream().filter(t -> t.getStatus() == TaskStatus.TODO).count();
        long inProgress = tasks.stream().filter(t -> t.getStatus() == TaskStatus.IN_PROGRESS).count();
        long done = tasks.stream().filter(t -> t.getStatus() == TaskStatus.DONE).count();
        long inReview = tasks.stream().filter(t -> t.getStatus() == TaskStatus.IN_REVIEW).count();
        long backlog = tasks.stream().filter(t -> t.getStatus() == TaskStatus.BACKLOG).count();

        double estimatedHours = tasks.stream().mapToDouble(t -> t.getEstimatedHours() != null ? t.getEstimatedHours() : 0.0).sum();
        double actualHours = tasks.stream().mapToDouble(t -> t.getActualHours() != null ? t.getActualHours() : 0.0).sum();

        List<TaskResponse> taskResponses = taskMapper.toResponseList(tasks);

        return new TaskReportResponse(
                totalTasks,
                todo,
                inProgress,
                done,
                inReview,
                backlog,
                estimatedHours,
                actualHours,
                taskResponses
        );
    }
}
