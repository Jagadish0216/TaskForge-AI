package com.taskforge.module.dashboard.service;

import com.taskforge.common.constant.ProjectMemberRole;
import com.taskforge.common.constant.ProjectStatus;
import com.taskforge.common.constant.TaskStatus;
import com.taskforge.common.constant.UserRole;
import com.taskforge.module.activity.entity.ActivityLog;
import com.taskforge.module.activity.mapper.ActivityMapper;
import com.taskforge.module.activity.repository.ActivityLogRepository;
import com.taskforge.module.dashboard.dto.DashboardStatsResponse;
import com.taskforge.module.project.entity.Project;
import com.taskforge.module.project.entity.ProjectMember;
import com.taskforge.module.project.repository.ProjectMemberRepository;
import com.taskforge.module.project.repository.ProjectRepository;
import com.taskforge.module.task.entity.Task;
import com.taskforge.module.task.mapper.TaskMapper;
import com.taskforge.module.task.repository.TaskRepository;
import com.taskforge.module.user.entity.Role;
import com.taskforge.module.user.entity.User;
import com.taskforge.module.user.repository.UserRepository;
import com.taskforge.security.SecurityUtils;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockedStatic;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Pageable;

import java.time.LocalDate;
import java.util.Collections;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.Set;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class DashboardServiceTest {

    @Mock ProjectRepository projectRepository;
    @Mock TaskRepository taskRepository;
    @Mock ActivityLogRepository activityLogRepository;
    @Mock UserRepository userRepository;
    @Mock ProjectMemberRepository projectMemberRepository;
    @Mock TaskMapper taskMapper;
    @Mock ActivityMapper activityMapper;

    @InjectMocks DashboardService dashboardService;

    private MockedStatic<SecurityUtils> securityUtilsMock;
    private User teamMember;
    private User admin;

    @BeforeEach
    void setUp() {
        securityUtilsMock = mockStatic(SecurityUtils.class);
        securityUtilsMock.when(SecurityUtils::getCurrentUserUsername)
                .thenReturn(Optional.of("user@test.com"));

        Role tmRole = new Role();
        tmRole.setName(UserRole.ROLE_TEAM_MEMBER);

        teamMember = new User();
        teamMember.setId(1L);
        teamMember.setEmail("user@test.com");
        teamMember.setFirstName("Jane");
        teamMember.setLastName("Doe");
        teamMember.setRoles(Set.of(tmRole));

        Role adminRole = new Role();
        adminRole.setName(UserRole.ROLE_ADMIN);

        admin = new User();
        admin.setId(2L);
        admin.setEmail("admin@test.com");
        admin.setFirstName("Admin");
        admin.setLastName("User");
        admin.setRoles(Set.of(adminRole));
    }

    @AfterEach
    void tearDown() {
        securityUtilsMock.close();
    }

    // ─── Helper: build a project ─────────────────────────────────────────────

    private Project makeProject(Long id, String name, ProjectStatus status) {
        Project p = new Project();
        p.setId(id);
        p.setName(name);
        p.setStatus(status);
        return p;
    }

    private ProjectMember makeMembership(Project project, User user, ProjectMemberRole role) {
        ProjectMember pm = new ProjectMember();
        pm.setProject(project);
        pm.setUser(user);
        pm.setRole(role);
        return pm;
    }

    // ─── Tests: ROLE_TEAM_MEMBER ─────────────────────────────────────────────

    @Test
    void testTotalProjectsForTeamMember() {
        when(userRepository.findByEmail("user@test.com")).thenReturn(Optional.of(teamMember));
        Project p1 = makeProject(10L, "Alpha", ProjectStatus.IN_PROGRESS);
        Project p2 = makeProject(11L, "Beta", ProjectStatus.COMPLETED);
        ProjectMember m1 = makeMembership(p1, teamMember, ProjectMemberRole.MEMBER);
        ProjectMember m2 = makeMembership(p2, teamMember, ProjectMemberRole.MEMBER);
        when(projectMemberRepository.findByUser(teamMember)).thenReturn(List.of(m1, m2));

        when(projectRepository.countByIdInAndStatus(List.of(10L, 11L), ProjectStatus.COMPLETED))
                .thenReturn(1L);
        when(taskRepository.countByProjectIdIn(List.of(10L, 11L))).thenReturn(5L);
        when(taskRepository.countByProjectIdInAndStatus(List.of(10L, 11L), TaskStatus.DONE)).thenReturn(2L);
        when(taskRepository.countByProjectIdInAndStatusNotAndDueDateBefore(
                eq(List.of(10L, 11L)), eq(TaskStatus.DONE), any(LocalDate.class))).thenReturn(1L);
        when(taskRepository.countTaskSummaryByProjects(List.of(10L, 11L))).thenReturn(List.of());
        when(projectRepository.findAllById(List.of(10L, 11L))).thenReturn(List.of(p1, p2));
        when(activityLogRepository.findRecentForProjects(eq(List.of(10L, 11L)), any(Pageable.class)))
                .thenReturn(List.of());
        when(taskRepository.findUpcomingDeadlinesForProjects(eq(List.of(10L, 11L)), any(LocalDate.class), any(Pageable.class)))
                .thenReturn(List.of());
        when(taskRepository.countDoneTasksGroupedByAssignee(List.of(10L, 11L))).thenReturn(List.of());
        when(taskRepository.countByStatusGroupedForProjects(List.of(10L, 11L))).thenReturn(List.of());
        when(activityMapper.toResponseList(anyList())).thenReturn(List.of());
        when(taskMapper.toResponseList(anyList())).thenReturn(List.of());

        DashboardStatsResponse result = dashboardService.getDashboardSummary();

        assertThat(result.totalProjects()).isEqualTo(2);
        assertThat(result.completedProjects()).isEqualTo(1);
        assertThat(result.totalTasks()).isEqualTo(5);
        assertThat(result.completedTasks()).isEqualTo(2);
        assertThat(result.pendingTasks()).isEqualTo(3);
        assertThat(result.overdueTasks()).isEqualTo(1);
    }

    @Test
    void testAdminSeesAllProjects() {
        securityUtilsMock.when(SecurityUtils::getCurrentUserUsername)
                .thenReturn(Optional.of("admin@test.com"));
        when(userRepository.findByEmail("admin@test.com")).thenReturn(Optional.of(admin));

        Project p1 = makeProject(1L, "Proj1", ProjectStatus.IN_PROGRESS);
        Project p2 = makeProject(2L, "Proj2", ProjectStatus.IN_PROGRESS);
        when(projectRepository.findAll()).thenReturn(List.of(p1, p2));
        when(projectRepository.countByIdInAndStatus(List.of(1L, 2L), ProjectStatus.COMPLETED))
                .thenReturn(0L);
        when(taskRepository.countByProjectIdIn(List.of(1L, 2L))).thenReturn(0L);
        when(taskRepository.countByProjectIdInAndStatus(List.of(1L, 2L), TaskStatus.DONE)).thenReturn(0L);
        when(taskRepository.countByProjectIdInAndStatusNotAndDueDateBefore(
                eq(List.of(1L, 2L)), eq(TaskStatus.DONE), any(LocalDate.class))).thenReturn(0L);
        when(taskRepository.countTaskSummaryByProjects(List.of(1L, 2L))).thenReturn(List.of());
        when(projectRepository.findAllById(List.of(1L, 2L))).thenReturn(List.of(p1, p2));
        when(activityLogRepository.findRecentForProjects(eq(List.of(1L, 2L)), any(Pageable.class)))
                .thenReturn(List.of());
        when(taskRepository.findUpcomingDeadlinesForProjects(eq(List.of(1L, 2L)), any(LocalDate.class), any(Pageable.class)))
                .thenReturn(List.of());
        when(taskRepository.countDoneTasksGroupedByAssignee(List.of(1L, 2L))).thenReturn(List.of());
        when(taskRepository.countByStatusGroupedForProjects(List.of(1L, 2L))).thenReturn(List.of());
        when(activityMapper.toResponseList(anyList())).thenReturn(List.of());
        when(taskMapper.toResponseList(anyList())).thenReturn(List.of());

        DashboardStatsResponse result = dashboardService.getDashboardSummary();

        assertThat(result.totalProjects()).isEqualTo(2);
        // Admin does NOT call projectMemberRepository
        verify(projectMemberRepository, never()).findByUser(any());
    }

    @Test
    void testProjectManagerSeesOnlyOwnedOrManaged() {
        Role pmRole = new Role();
        pmRole.setName(UserRole.ROLE_PROJECT_MANAGER);
        User pm = new User();
        pm.setId(3L);
        pm.setEmail("pm@test.com");
        pm.setRoles(Set.of(pmRole));

        securityUtilsMock.when(SecurityUtils::getCurrentUserUsername)
                .thenReturn(Optional.of("pm@test.com"));
        when(userRepository.findByEmail("pm@test.com")).thenReturn(Optional.of(pm));

        Project ownedProject = makeProject(5L, "OwnedProject", ProjectStatus.IN_PROGRESS);
        Project memberProject = makeProject(6L, "MemberProject", ProjectStatus.IN_PROGRESS);
        ProjectMember ownerMembership = makeMembership(ownedProject, pm, ProjectMemberRole.OWNER);
        ProjectMember regularMembership = makeMembership(memberProject, pm, ProjectMemberRole.MEMBER);
        when(projectMemberRepository.findByUser(pm))
                .thenReturn(List.of(ownerMembership, regularMembership));

        when(projectRepository.countByIdInAndStatus(List.of(5L), ProjectStatus.COMPLETED)).thenReturn(0L);
        when(taskRepository.countByProjectIdIn(List.of(5L))).thenReturn(0L);
        when(taskRepository.countByProjectIdInAndStatus(List.of(5L), TaskStatus.DONE)).thenReturn(0L);
        when(taskRepository.countByProjectIdInAndStatusNotAndDueDateBefore(
                eq(List.of(5L)), eq(TaskStatus.DONE), any(LocalDate.class))).thenReturn(0L);
        when(taskRepository.countTaskSummaryByProjects(List.of(5L))).thenReturn(List.of());
        when(projectRepository.findAllById(List.of(5L))).thenReturn(List.of(ownedProject));
        when(activityLogRepository.findRecentForProjects(eq(List.of(5L)), any(Pageable.class)))
                .thenReturn(List.of());
        when(taskRepository.findUpcomingDeadlinesForProjects(eq(List.of(5L)), any(LocalDate.class), any(Pageable.class)))
                .thenReturn(List.of());
        when(taskRepository.countDoneTasksGroupedByAssignee(List.of(5L))).thenReturn(List.of());
        when(taskRepository.countByStatusGroupedForProjects(List.of(5L))).thenReturn(List.of());
        when(activityMapper.toResponseList(anyList())).thenReturn(List.of());
        when(taskMapper.toResponseList(anyList())).thenReturn(List.of());

        DashboardStatsResponse result = dashboardService.getDashboardSummary();

        // Only 1 project visible (the OWNER one), not the MEMBER one
        assertThat(result.totalProjects()).isEqualTo(1);
    }

    @Test
    void testProjectHealthZeroTasks() {
        when(userRepository.findByEmail("user@test.com")).thenReturn(Optional.of(teamMember));
        Project p = makeProject(20L, "EmptyProject", ProjectStatus.IN_PROGRESS);
        ProjectMember m = makeMembership(p, teamMember, ProjectMemberRole.MEMBER);
        when(projectMemberRepository.findByUser(teamMember)).thenReturn(List.of(m));

        when(projectRepository.countByIdInAndStatus(List.of(20L), ProjectStatus.COMPLETED)).thenReturn(0L);
        when(taskRepository.countByProjectIdIn(List.of(20L))).thenReturn(0L);
        when(taskRepository.countByProjectIdInAndStatus(List.of(20L), TaskStatus.DONE)).thenReturn(0L);
        when(taskRepository.countByProjectIdInAndStatusNotAndDueDateBefore(
                eq(List.of(20L)), eq(TaskStatus.DONE), any(LocalDate.class))).thenReturn(0L);
        // No task summary entries for this project → should default to 0% health
        when(taskRepository.countTaskSummaryByProjects(List.of(20L))).thenReturn(List.of());
        when(projectRepository.findAllById(List.of(20L))).thenReturn(List.of(p));
        when(activityLogRepository.findRecentForProjects(eq(List.of(20L)), any(Pageable.class)))
                .thenReturn(List.of());
        when(taskRepository.findUpcomingDeadlinesForProjects(eq(List.of(20L)), any(LocalDate.class), any(Pageable.class)))
                .thenReturn(List.of());
        when(taskRepository.countDoneTasksGroupedByAssignee(List.of(20L))).thenReturn(List.of());
        when(taskRepository.countByStatusGroupedForProjects(List.of(20L))).thenReturn(List.of());
        when(activityMapper.toResponseList(anyList())).thenReturn(List.of());
        when(taskMapper.toResponseList(anyList())).thenReturn(List.of());

        DashboardStatsResponse result = dashboardService.getDashboardSummary();

        assertThat(result.projectHealth()).containsKey("EmptyProject");
        assertThat(result.projectHealth().get("EmptyProject")).isEqualTo(0.0);
    }

    @Test
    void testTaskDistributionAllStatuses() {
        when(userRepository.findByEmail("user@test.com")).thenReturn(Optional.of(teamMember));
        Project p = makeProject(30L, "P", ProjectStatus.IN_PROGRESS);
        ProjectMember m = makeMembership(p, teamMember, ProjectMemberRole.MEMBER);
        when(projectMemberRepository.findByUser(teamMember)).thenReturn(List.of(m));

        when(projectRepository.countByIdInAndStatus(List.of(30L), ProjectStatus.COMPLETED)).thenReturn(0L);
        when(taskRepository.countByProjectIdIn(List.of(30L))).thenReturn(6L);
        when(taskRepository.countByProjectIdInAndStatus(List.of(30L), TaskStatus.DONE)).thenReturn(2L);
        when(taskRepository.countByProjectIdInAndStatusNotAndDueDateBefore(
                eq(List.of(30L)), eq(TaskStatus.DONE), any(LocalDate.class))).thenReturn(0L);
        when(taskRepository.countTaskSummaryByProjects(List.of(30L))).thenReturn(List.of());
        when(projectRepository.findAllById(List.of(30L))).thenReturn(List.of(p));
        when(activityLogRepository.findRecentForProjects(eq(List.of(30L)), any(Pageable.class)))
                .thenReturn(List.of());
        when(taskRepository.findUpcomingDeadlinesForProjects(eq(List.of(30L)), any(LocalDate.class), any(Pageable.class)))
                .thenReturn(List.of());
        when(taskRepository.countDoneTasksGroupedByAssignee(List.of(30L))).thenReturn(List.of());

        // Simulate grouped status results
        TaskRepository.TaskStatusCount doneCount = new TaskRepository.TaskStatusCount() {
            public String getStatus() { return "DONE"; }
            public long getCount() { return 2L; }
        };
        TaskRepository.TaskStatusCount inProgressCount = new TaskRepository.TaskStatusCount() {
            public String getStatus() { return "IN_PROGRESS"; }
            public long getCount() { return 3L; }
        };
        TaskRepository.TaskStatusCount todoCount = new TaskRepository.TaskStatusCount() {
            public String getStatus() { return "TODO"; }
            public long getCount() { return 1L; }
        };
        when(taskRepository.countByStatusGroupedForProjects(List.of(30L)))
                .thenReturn(List.of(doneCount, inProgressCount, todoCount));

        when(activityMapper.toResponseList(anyList())).thenReturn(List.of());
        when(taskMapper.toResponseList(anyList())).thenReturn(List.of());

        DashboardStatsResponse result = dashboardService.getDashboardSummary();

        assertThat(result.taskDistribution()).containsEntry("DONE", 2L);
        assertThat(result.taskDistribution()).containsEntry("IN_PROGRESS", 3L);
        assertThat(result.taskDistribution()).containsEntry("TODO", 1L);
    }

    @Test
    void testEmptyProjectListProducesZeroMetrics() {
        when(userRepository.findByEmail("user@test.com")).thenReturn(Optional.of(teamMember));
        when(projectMemberRepository.findByUser(teamMember)).thenReturn(Collections.emptyList());

        DashboardStatsResponse result = dashboardService.getDashboardSummary();

        assertThat(result.totalProjects()).isEqualTo(0);
        assertThat(result.completedProjects()).isEqualTo(0);
        assertThat(result.totalTasks()).isEqualTo(0);
        assertThat(result.overdueTasks()).isEqualTo(0);
        assertThat(result.projectHealth()).isEmpty();
        assertThat(result.recentActivities()).isEmpty();
        assertThat(result.upcomingDeadlines()).isEmpty();
        assertThat(result.teamProductivity()).isEmpty();
        assertThat(result.taskDistribution()).isEmpty();
        // No repository calls beyond membership when there are no projects
        verify(taskRepository, never()).countByProjectIdIn(anyList());
    }

    @Test
    void testNoMembershipQueryForAdmin() {
        securityUtilsMock.when(SecurityUtils::getCurrentUserUsername)
                .thenReturn(Optional.of("admin@test.com"));
        when(userRepository.findByEmail("admin@test.com")).thenReturn(Optional.of(admin));
        when(projectRepository.findAll()).thenReturn(Collections.emptyList());

        dashboardService.getDashboardSummary();

        verify(projectMemberRepository, never()).findByUser(any());
    }
}
