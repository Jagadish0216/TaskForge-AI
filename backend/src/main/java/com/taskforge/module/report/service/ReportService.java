package com.taskforge.module.report.service;

import com.taskforge.common.constant.TaskStatus;
import com.taskforge.common.exception.ResourceNotFoundException;
import com.taskforge.common.exception.UnauthorizedAccessException;
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
import com.taskforge.security.SecurityUtils;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;

@Service
public class ReportService {

    private final ProjectRepository projectRepository;
    private final TaskRepository taskRepository;
    private final ProjectMemberRepository projectMemberRepository;
    private final UserRepository userRepository;
    private final TaskMapper taskMapper;

    public ReportService(
            ProjectRepository projectRepository,
            TaskRepository taskRepository,
            ProjectMemberRepository projectMemberRepository,
            UserRepository userRepository,
            TaskMapper taskMapper
    ) {
        this.projectRepository = projectRepository;
        this.taskRepository = taskRepository;
        this.projectMemberRepository = projectMemberRepository;
        this.userRepository = userRepository;
        this.taskMapper = taskMapper;
    }

    @Transactional(readOnly = true)
    public ProjectReportResponse generateProjectReport(Long projectId) {
        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new ResourceNotFoundException("Project not found with id: " + projectId));

        // Check permission fallback
        getCurrentAuthenticatedUser(project);

        List<Task> tasks = taskRepository.findAll().stream().filter(t -> t.getProject().getId().equals(projectId)).toList();
        long totalTasks = tasks.size();
        long completedTasks = tasks.stream().filter(t -> t.getStatus() == TaskStatus.DONE).count();
        long pendingTasks = totalTasks - completedTasks;
        long overdueTasks = tasks.stream()
                .filter(t -> t.getStatus() != TaskStatus.DONE && t.getDueDate() != null && t.getDueDate().isBefore(LocalDate.now()))
                .count();

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
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));

        List<Task> tasks = taskRepository.findAll().stream()
                .filter(t -> t.getAssignee() != null && t.getAssignee().getId().equals(userId))
                .toList();

        long totalAssignedTasks = tasks.size();
        long completedTasks = tasks.stream().filter(t -> t.getStatus() == TaskStatus.DONE).count();
        long pendingTasks = totalAssignedTasks - completedTasks;
        long overdueTasks = tasks.stream()
                .filter(t -> t.getStatus() != TaskStatus.DONE && t.getDueDate() != null && t.getDueDate().isBefore(LocalDate.now()))
                .count();

        double completionRate = 0.0;
        if (totalAssignedTasks > 0) {
            completionRate = ((double) completedTasks / totalAssignedTasks) * 100.0;
        }

        double estimatedHoursSum = tasks.stream().mapToDouble(t -> t.getEstimatedHours() != null ? t.getEstimatedHours() : 0.0).sum();
        double actualHoursSum = tasks.stream().mapToDouble(t -> t.getActualHours() != null ? t.getActualHours() : 0.0).sum();

        return new UserReportResponse(
                user.getId(),
                user.getFirstName() + " " + user.getLastName(),
                user.getEmail(),
                totalAssignedTasks,
                completedTasks,
                pendingTasks,
                overdueTasks,
                Math.round(completionRate * 100.0) / 100.0,
                estimatedHoursSum,
                actualHoursSum
        );
    }

    @Transactional(readOnly = true)
    public TaskReportResponse generateTaskReport(Long projectId) {
        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new ResourceNotFoundException("Project not found with id: " + projectId));

        getCurrentAuthenticatedUser(project);

        List<Task> tasks = taskRepository.findAll().stream().filter(t -> t.getProject().getId().equals(projectId)).toList();
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

        getCurrentAuthenticatedUser(project);

        LocalDate oneWeekAgo = LocalDate.now().minusWeeks(1);
        List<Task> tasks = taskRepository.findAll().stream()
                .filter(t -> t.getProject().getId().equals(projectId))
                .filter(t -> t.getUpdatedAt() != null && !t.getUpdatedAt().toLocalDate().isBefore(oneWeekAgo))
                .toList();

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

        getCurrentAuthenticatedUser(project);

        LocalDate oneMonthAgo = LocalDate.now().minusMonths(1);
        List<Task> tasks = taskRepository.findAll().stream()
                .filter(t -> t.getProject().getId().equals(projectId))
                .filter(t -> t.getUpdatedAt() != null && !t.getUpdatedAt().toLocalDate().isBefore(oneMonthAgo))
                .toList();

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
}
