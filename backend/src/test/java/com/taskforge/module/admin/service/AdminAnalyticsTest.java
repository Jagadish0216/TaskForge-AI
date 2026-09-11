package com.taskforge.module.admin.service;

import com.taskforge.common.constant.TaskStatus;
import com.taskforge.common.constant.UserRole;
import com.taskforge.common.dto.MonthlyCount;
import com.taskforge.module.activity.mapper.ActivityMapper;
import com.taskforge.module.activity.repository.ActivityLogRepository;
import com.taskforge.module.admin.controller.AdminController;
import com.taskforge.module.project.mapper.ProjectMapper;
import com.taskforge.module.project.repository.ProjectMemberRepository;
import com.taskforge.module.project.repository.ProjectMessageRepository;
import com.taskforge.module.project.repository.ProjectRepository;
import com.taskforge.module.project.service.ProjectMemberService;
import com.taskforge.module.project.service.ProjectService;
import com.taskforge.module.storage.repository.AttachmentRepository;
import com.taskforge.module.task.mapper.TaskMapper;
import com.taskforge.module.task.repository.CommentRepository;
import com.taskforge.module.task.repository.TaskRepository;
import com.taskforge.module.task.service.TaskService;
import com.taskforge.module.user.entity.Role;
import com.taskforge.module.user.entity.User;
import com.taskforge.module.user.mapper.UserMapper;
import com.taskforge.module.user.repository.RoleRepository;
import com.taskforge.module.user.repository.UserRepository;
import com.taskforge.module.user.service.UserService;
import com.taskforge.module.activity.service.ActivityService;
import com.taskforge.security.SecurityUtils;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockedStatic;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.ResponseEntity;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.*;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AdminAnalyticsTest {

    @Mock UserRepository userRepository;
    @Mock RoleRepository roleRepository;
    @Mock ProjectRepository projectRepository;
    @Mock ProjectMemberRepository projectMemberRepository;
    @Mock TaskRepository taskRepository;
    @Mock ActivityLogRepository activityLogRepository;
    @Mock ProjectMessageRepository projectMessageRepository;
    @Mock AttachmentRepository attachmentRepository;
    @Mock CommentRepository commentRepository;
    @Mock UserService userService;
    @Mock ProjectService projectService;
    @Mock ProjectMemberService projectMemberService;
    @Mock TaskService taskService;
    @Mock ActivityService activityService;
    @Mock UserMapper userMapper;
    @Mock ProjectMapper projectMapper;
    @Mock TaskMapper taskMapper;
    @Mock ActivityMapper activityMapper;

    @InjectMocks AdminController adminController;

    private MockedStatic<SecurityUtils> securityMock;
    private User adminUser;

    @BeforeEach
    void setUp() {
        securityMock = mockStatic(SecurityUtils.class);
        securityMock.when(SecurityUtils::getCurrentUserUsername)
                .thenReturn(Optional.of("admin@test.com"));

        Role adminRole = new Role();
        adminRole.setName(UserRole.ROLE_ADMIN);
        adminUser = new User();
        adminUser.setId(1L);
        adminUser.setEmail("admin@test.com");
        adminUser.setRoles(Set.of(adminRole));

        when(userRepository.findByEmail("admin@test.com")).thenReturn(Optional.of(adminUser));
    }

    @AfterEach
    void tearDown() {
        securityMock.close();
    }

    // ─── getAdminStats() tests ────────────────────────────────────────────────

    @Test
    void testAdminStatsTotalCounts() {
        when(userRepository.count()).thenReturn(50L);
        when(projectRepository.count()).thenReturn(10L);
        when(taskRepository.count()).thenReturn(100L);
        when(taskRepository.countByStatus(TaskStatus.DONE)).thenReturn(40L);
        when(projectRepository.countByArchivedTrue()).thenReturn(2L);
        when(projectRepository.countByAiGeneratedTrue()).thenReturn(3L);
        when(userRepository.countByEnabledTrueAndDeletedFalse()).thenReturn(48L);
        when(taskRepository.countOverdueTasks(eq(TaskStatus.DONE), any(LocalDate.class))).thenReturn(5L);
        when(projectMessageRepository.count()).thenReturn(200L);
        when(attachmentRepository.count()).thenReturn(30L);
        when(commentRepository.count()).thenReturn(60L);
        when(attachmentRepository.sumFileSize()).thenReturn(1024L * 1024L);
        when(activityLogRepository.findAll(any(org.springframework.data.domain.Pageable.class)))
                .thenReturn(org.springframework.data.domain.Page.empty());
        when(projectRepository.countAllByPriorityGrouped()).thenReturn(List.of());
        when(taskRepository.countAllByStatusGrouped()).thenReturn(List.of());

        var response = adminController.getAdminStats();
        Map<String, Object> stats = (Map<String, Object>) response.getBody().data();

        assertThat(stats.get("totalUsers")).isEqualTo(50L);
        assertThat(stats.get("totalProjects")).isEqualTo(10L);
        assertThat(stats.get("totalTasks")).isEqualTo(100L);
        assertThat(stats.get("completedTasks")).isEqualTo(40L);
        assertThat(stats.get("pendingTasks")).isEqualTo(60L);
        assertThat(stats.get("archivedProjects")).isEqualTo(2L);
        assertThat(stats.get("activeProjects")).isEqualTo(8L);
        assertThat(stats.get("aiGeneratedProjects")).isEqualTo(3L);
        assertThat(stats.get("overdueTasks")).isEqualTo(5L);
        assertThat(stats.get("storageUsage")).isEqualTo(1024L * 1024L);
    }

    @Test
    void testAdminStatsNeverCallsFindAllForProjects() {
        when(userRepository.count()).thenReturn(0L);
        when(projectRepository.count()).thenReturn(0L);
        when(taskRepository.count()).thenReturn(0L);
        when(taskRepository.countByStatus(any())).thenReturn(0L);
        when(projectRepository.countByArchivedTrue()).thenReturn(0L);
        when(projectRepository.countByAiGeneratedTrue()).thenReturn(0L);
        when(userRepository.countByEnabledTrueAndDeletedFalse()).thenReturn(0L);
        when(taskRepository.countOverdueTasks(any(), any())).thenReturn(0L);
        when(projectMessageRepository.count()).thenReturn(0L);
        when(attachmentRepository.count()).thenReturn(0L);
        when(commentRepository.count()).thenReturn(0L);
        when(attachmentRepository.sumFileSize()).thenReturn(0L);
        when(activityLogRepository.findAll(any(org.springframework.data.domain.Pageable.class)))
                .thenReturn(org.springframework.data.domain.Page.empty());
        when(projectRepository.countAllByPriorityGrouped()).thenReturn(List.of());
        when(taskRepository.countAllByStatusGrouped()).thenReturn(List.of());

        adminController.getAdminStats();

        // No findAll() calls allowed in the optimized path
        verify(projectRepository, never()).findAll();
        verify(taskRepository, never()).findAll();
        verify(attachmentRepository, never()).findAll();
    }

    @Test
    void testTasksByStatusDistribution() {
        when(userRepository.count()).thenReturn(0L);
        when(projectRepository.count()).thenReturn(0L);
        when(taskRepository.count()).thenReturn(0L);
        when(taskRepository.countByStatus(any())).thenReturn(0L);
        when(projectRepository.countByArchivedTrue()).thenReturn(0L);
        when(projectRepository.countByAiGeneratedTrue()).thenReturn(0L);
        when(userRepository.countByEnabledTrueAndDeletedFalse()).thenReturn(0L);
        when(taskRepository.countOverdueTasks(any(), any())).thenReturn(0L);
        when(projectMessageRepository.count()).thenReturn(0L);
        when(attachmentRepository.count()).thenReturn(0L);
        when(commentRepository.count()).thenReturn(0L);
        when(attachmentRepository.sumFileSize()).thenReturn(0L);
        when(activityLogRepository.findAll(any(org.springframework.data.domain.Pageable.class)))
                .thenReturn(org.springframework.data.domain.Page.empty());
        when(projectRepository.countAllByPriorityGrouped()).thenReturn(List.of());

        TaskRepository.TaskStatusCount done = new TaskRepository.TaskStatusCount() {
            public String getStatus() { return "DONE"; }
            public long getCount() { return 10L; }
        };
        TaskRepository.TaskStatusCount todo = new TaskRepository.TaskStatusCount() {
            public String getStatus() { return "TODO"; }
            public long getCount() { return 5L; }
        };
        when(taskRepository.countAllByStatusGrouped()).thenReturn(List.of(done, todo));

        var response = adminController.getAdminStats();
        Map<String, Object> stats = (Map<String, Object>) response.getBody().data();
        Map<String, Long> tasksByStatus = (Map<String, Long>) stats.get("tasksByStatus");

        assertThat(tasksByStatus).containsEntry("DONE", 10L);
        assertThat(tasksByStatus).containsEntry("TODO", 5L);
    }

    // ─── getAdminAnalytics() tests ────────────────────────────────────────────

    @Test
    void testGrowthTrendHasSixMonthSlots() {
        when(userRepository.countCreatedByMonth(any(LocalDateTime.class), any(LocalDateTime.class)))
                .thenReturn(List.of());
        when(projectRepository.countCreatedByMonth(any(LocalDateTime.class), any(LocalDateTime.class)))
                .thenReturn(List.of());
        when(taskRepository.countCreatedByMonth(any(LocalDateTime.class), any(LocalDateTime.class)))
                .thenReturn(List.of());
        when(projectRepository.countByAiGeneratedTrue()).thenReturn(0L);
        when(projectRepository.count()).thenReturn(0L);

        var response = adminController.getAdminAnalytics();
        Map<String, Object> data = (Map<String, Object>) response.getBody().data();
        List<Map<String, Object>> growthTrend = (List<Map<String, Object>>) data.get("growthTrend");

        assertThat(growthTrend).hasSize(6);
    }

    @Test
    void testGrowthTrendZeroFallbackForEmptyMonths() {
        when(userRepository.countCreatedByMonth(any(), any())).thenReturn(List.of());
        when(projectRepository.countCreatedByMonth(any(), any())).thenReturn(List.of());
        when(taskRepository.countCreatedByMonth(any(), any())).thenReturn(List.of());
        when(projectRepository.countByAiGeneratedTrue()).thenReturn(0L);
        when(projectRepository.count()).thenReturn(0L);

        var response = adminController.getAdminAnalytics();
        Map<String, Object> data = (Map<String, Object>) response.getBody().data();
        List<Map<String, Object>> trend = (List<Map<String, Object>>) data.get("growthTrend");

        for (Map<String, Object> entry : trend) {
            assertThat(entry.get("users")).isEqualTo(0L);
            assertThat(entry.get("projects")).isEqualTo(0L);
            assertThat(entry.get("tasks")).isEqualTo(0L);
        }
    }

    @Test
    void testGrowthTrendMonthLabelFormat() {
        when(userRepository.countCreatedByMonth(any(), any())).thenReturn(List.of());
        when(projectRepository.countCreatedByMonth(any(), any())).thenReturn(List.of());
        when(taskRepository.countCreatedByMonth(any(), any())).thenReturn(List.of());
        when(projectRepository.countByAiGeneratedTrue()).thenReturn(0L);
        when(projectRepository.count()).thenReturn(0L);

        var response = adminController.getAdminAnalytics();
        Map<String, Object> data = (Map<String, Object>) response.getBody().data();
        List<Map<String, Object>> trend = (List<Map<String, Object>>) data.get("growthTrend");

        // Every month label should match "MMM YYYY" format (3 chars + space + 4 digits)
        for (Map<String, Object> entry : trend) {
            String label = (String) entry.get("month");
            assertThat(label).matches("[A-Z]{3} \\d{4}");
        }
    }

    @Test
    void testGrowthTrendPopulatesCorrectCounts() {
        LocalDate now = LocalDate.now();
        LocalDate twoMonthsAgo = now.minusMonths(2);

        MonthlyCount userMonth = new MonthlyCount() {
            public int getYear() { return twoMonthsAgo.getYear(); }
            public int getMonth() { return twoMonthsAgo.getMonthValue(); }
            public long getCount() { return 7L; }
        };
        when(userRepository.countCreatedByMonth(any(), any())).thenReturn(List.of(userMonth));
        when(projectRepository.countCreatedByMonth(any(), any())).thenReturn(List.of());
        when(taskRepository.countCreatedByMonth(any(), any())).thenReturn(List.of());
        when(projectRepository.countByAiGeneratedTrue()).thenReturn(0L);
        when(projectRepository.count()).thenReturn(0L);

        var response = adminController.getAdminAnalytics();
        Map<String, Object> data = (Map<String, Object>) response.getBody().data();
        List<Map<String, Object>> trend = (List<Map<String, Object>>) data.get("growthTrend");

        // Month at index 3 should be 2-months-ago (index: 5-2=3)
        Map<String, Object> twoMonthsAgoEntry = trend.get(3);
        assertThat(twoMonthsAgoEntry.get("users")).isEqualTo(7L);
        assertThat(twoMonthsAgoEntry.get("projects")).isEqualTo(0L);
    }

    @Test
    void testAiProjectPercentage() {
        when(userRepository.countCreatedByMonth(any(), any())).thenReturn(List.of());
        when(projectRepository.countCreatedByMonth(any(), any())).thenReturn(List.of());
        when(taskRepository.countCreatedByMonth(any(), any())).thenReturn(List.of());
        when(projectRepository.countByAiGeneratedTrue()).thenReturn(4L);
        when(projectRepository.count()).thenReturn(10L);

        var response = adminController.getAdminAnalytics();
        Map<String, Object> data = (Map<String, Object>) response.getBody().data();

        assertThat(data.get("totalAIProjects")).isEqualTo(4L);
        assertThat((Double) data.get("aiPercentage")).isEqualTo(40.0);
    }

    @Test
    void testAnalyticsNeverCallsFindAll() {
        when(userRepository.countCreatedByMonth(any(), any())).thenReturn(List.of());
        when(projectRepository.countCreatedByMonth(any(), any())).thenReturn(List.of());
        when(taskRepository.countCreatedByMonth(any(), any())).thenReturn(List.of());
        when(projectRepository.countByAiGeneratedTrue()).thenReturn(0L);
        when(projectRepository.count()).thenReturn(0L);

        adminController.getAdminAnalytics();

        verify(userRepository, never()).findAll();
        verify(projectRepository, never()).findAll();
        verify(taskRepository, never()).findAll();
    }
}
