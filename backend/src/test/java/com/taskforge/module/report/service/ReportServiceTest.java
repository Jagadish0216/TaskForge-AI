package com.taskforge.module.report.service;

import com.taskforge.common.constant.ProjectPriority;
import com.taskforge.common.constant.ProjectStatus;
import com.taskforge.common.constant.TaskStatus;
import com.taskforge.common.exception.UnauthorizedAccessException;
import com.taskforge.module.project.entity.Project;
import com.taskforge.module.project.repository.ProjectMemberRepository;
import com.taskforge.module.project.repository.ProjectRepository;
import com.taskforge.module.report.dto.ProjectReportResponse;
import com.taskforge.module.report.dto.TaskReportResponse;
import com.taskforge.module.report.dto.UserReportResponse;
import com.taskforge.module.task.entity.Task;
import com.taskforge.module.task.mapper.TaskMapper;
import com.taskforge.module.task.repository.TaskRepository;
import com.taskforge.module.user.entity.User;
import com.taskforge.module.user.repository.UserRepository;
import com.taskforge.security.ProjectAuthorizationService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

class ReportServiceTest {

    private ReportService reportService;

    @Mock
    private ProjectRepository projectRepository;

    @Mock
    private TaskRepository taskRepository;

    @Mock
    private ProjectMemberRepository projectMemberRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private TaskMapper taskMapper;

    @Mock
    private ProjectAuthorizationService projectAuthorizationService;

    private User authUser;
    private Project project;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
        reportService = new ReportService(
                projectRepository,
                taskRepository,
                projectMemberRepository,
                userRepository,
                taskMapper,
                projectAuthorizationService
        );

        authUser = new User();
        authUser.setId(1L);
        authUser.setEmail("user@test.com");
        authUser.setFirstName("John");
        authUser.setLastName("Doe");

        project = new Project();
        project.setId(10L);
        project.setName("Alpha Project");
        project.setProjectKey("ALPHA");
        project.setStatus(ProjectStatus.IN_PROGRESS);
        project.setPriority(ProjectPriority.HIGH);

        when(projectAuthorizationService.getAuthenticatedUser()).thenReturn(authUser);
        when(projectRepository.findById(10L)).thenReturn(Optional.of(project));
    }

    @Test
    void generateProjectReport_ShouldAggregateCorrectly() {
        when(taskRepository.countByProject(project)).thenReturn(10L);
        when(taskRepository.countByProjectAndStatus(project, TaskStatus.DONE)).thenReturn(4L);
        when(taskRepository.countByProjectAndStatusNotAndDueDateBefore(eq(project), eq(TaskStatus.DONE), any(LocalDate.class))).thenReturn(2L);
        when(projectMemberRepository.countByProject(project)).thenReturn(5L);

        ProjectReportResponse response = reportService.generateProjectReport(10L);

        assertNotNull(response);
        assertEquals(10L, response.projectId());
        assertEquals("Alpha Project", response.projectName());
        assertEquals(10L, response.totalTasks());
        assertEquals(4L, response.completedTasks());
        assertEquals(6L, response.pendingTasks());
        assertEquals(2L, response.overdueTasks());
        assertEquals(40.0, response.completionRate());
        assertEquals(5L, response.totalMembers());

        verify(projectAuthorizationService).verifyProjectReadAccess(project, authUser);
    }

    @Test
    void generateProjectReport_ShouldThrowWhenUnauthorized() {
        doThrow(new UnauthorizedAccessException("Access denied"))
                .when(projectAuthorizationService).verifyProjectReadAccess(project, authUser);

        assertThrows(UnauthorizedAccessException.class, () -> reportService.generateProjectReport(10L));
    }

    @Test
    void generateUserReport_ShouldAggregateHoursAndCounts() {
        User targetUser = new User();
        targetUser.setId(2L);
        targetUser.setEmail("jane@test.com");
        targetUser.setFirstName("Jane");
        targetUser.setLastName("Smith");

        when(userRepository.findById(2L)).thenReturn(Optional.of(targetUser));
        when(taskRepository.countByAssignee(targetUser)).thenReturn(8L);
        when(taskRepository.countByAssigneeAndStatus(targetUser, TaskStatus.DONE)).thenReturn(6L);
        when(taskRepository.countByAssigneeAndStatusNotAndDueDateBefore(eq(targetUser), eq(TaskStatus.DONE), any(LocalDate.class))).thenReturn(1L);
        when(taskRepository.sumEstimatedHoursByAssignee(targetUser)).thenReturn(40.0);
        when(taskRepository.sumActualHoursByAssignee(targetUser)).thenReturn(35.5);

        UserReportResponse response = reportService.generateUserReport(2L);

        assertNotNull(response);
        assertEquals(2L, response.userId());
        assertEquals("Jane Smith", response.fullName());
        assertEquals(8L, response.totalAssignedTasks());
        assertEquals(6L, response.completedTasks());
        assertEquals(2L, response.pendingTasks());
        assertEquals(1L, response.overdueTasks());
        assertEquals(75.0, response.completionRate());
        assertEquals(40.0, response.estimatedHoursSum());
        assertEquals(35.5, response.actualHoursSum());
    }

    @Test
    void generateTaskReport_ShouldAggregateProjectTasks() {
        Task t1 = new Task();
        t1.setStatus(TaskStatus.TODO);
        t1.setEstimatedHours(5);
        t1.setActualHours(2);

        Task t2 = new Task();
        t2.setStatus(TaskStatus.DONE);
        t2.setEstimatedHours(10);
        t2.setActualHours(12);

        when(taskRepository.findByProject(project)).thenReturn(List.of(t1, t2));
        when(taskMapper.toResponseList(anyList())).thenReturn(List.of());

        TaskReportResponse response = reportService.generateTaskReport(10L);

        assertNotNull(response);
        assertEquals(2L, response.totalTasks());
        assertEquals(1L, response.todoCount());
        assertEquals(1L, response.doneCount());
        assertEquals(15.0, response.totalEstimatedHours());
        assertEquals(14.0, response.totalActualHours());

        verify(projectAuthorizationService).verifyProjectReadAccess(project, authUser);
    }

    @Test
    void generateWeeklyReport_ShouldFilterByDateRange() {
        Task t1 = new Task();
        t1.setStatus(TaskStatus.IN_PROGRESS);
        t1.setEstimatedHours(8);
        t1.setActualHours(4);

        when(taskRepository.findByProjectAndUpdatedAtGreaterThanEqual(eq(project), any(LocalDateTime.class)))
                .thenReturn(List.of(t1));
        when(taskMapper.toResponseList(anyList())).thenReturn(List.of());

        TaskReportResponse response = reportService.generateWeeklyReport(10L);

        assertNotNull(response);
        assertEquals(1L, response.totalTasks());
        assertEquals(1L, response.inProgressCount());
        assertEquals(8.0, response.totalEstimatedHours());

        verify(taskRepository).findByProjectAndUpdatedAtGreaterThanEqual(eq(project), any(LocalDateTime.class));
    }

    @Test
    void generateMonthlyReport_ShouldFilterByMonthlyBoundary() {
        when(taskRepository.findByProjectAndUpdatedAtGreaterThanEqual(eq(project), any(LocalDateTime.class)))
                .thenReturn(List.of());
        when(taskMapper.toResponseList(anyList())).thenReturn(List.of());

        TaskReportResponse response = reportService.generateMonthlyReport(10L);

        assertNotNull(response);
        assertEquals(0L, response.totalTasks());

        verify(taskRepository).findByProjectAndUpdatedAtGreaterThanEqual(eq(project), any(LocalDateTime.class));
    }
}
