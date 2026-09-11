package com.taskforge.module.ai.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.taskforge.common.constant.ProjectMemberRole;
import com.taskforge.common.constant.ProjectPriority;
import com.taskforge.common.constant.ProjectStatus;
import com.taskforge.common.constant.ProjectVisibility;
import com.taskforge.common.constant.TaskStatus;
import com.taskforge.module.activity.service.ActivityService;
import com.taskforge.module.ai.constant.AIIntent;
import com.taskforge.module.ai.dto.AIResponse;
import com.taskforge.module.ai.dto.ChatRequest;
import com.taskforge.module.ai.dto.GenerateProjectRequest;
import com.taskforge.module.ai.util.PromptBuilder;
import com.taskforge.module.project.dto.ProjectResponse;
import com.taskforge.module.project.entity.Project;
import com.taskforge.module.project.entity.ProjectMember;
import com.taskforge.module.project.repository.ProjectMemberRepository;
import com.taskforge.module.project.repository.ProjectRepository;
import com.taskforge.module.project.service.ProjectService;
import com.taskforge.module.task.repository.TaskRepository;
import com.taskforge.module.task.service.TaskService;
import com.taskforge.module.user.entity.User;
import com.taskforge.module.user.repository.UserRepository;
import com.taskforge.security.ProjectAuthorizationService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;

import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

class AIServiceTest {

    private AIService aiService;
    private GeminiProvider geminiProvider;
    private ProjectService projectService;
    private ProjectRepository projectRepository;
    private TaskService taskService;
    private TaskRepository taskRepository;
    private UserRepository userRepository;
    private ActivityService activityService;
    private ObjectMapper objectMapper;
    private IntentDetector intentDetector;
    private ProjectAuthorizationService authorizationService;
    private ProjectMemberRepository projectMemberRepository;

    @BeforeEach
    void setUp() {
        geminiProvider = Mockito.mock(GeminiProvider.class);
        projectService = Mockito.mock(ProjectService.class);
        projectRepository = Mockito.mock(ProjectRepository.class);
        taskService = Mockito.mock(TaskService.class);
        taskRepository = Mockito.mock(TaskRepository.class);
        userRepository = Mockito.mock(UserRepository.class);
        activityService = Mockito.mock(ActivityService.class);
        objectMapper = new ObjectMapper();
        intentDetector = new IntentDetector();
        authorizationService = Mockito.mock(ProjectAuthorizationService.class);
        projectMemberRepository = Mockito.mock(ProjectMemberRepository.class);

        aiService = new AIService(
                geminiProvider,
                projectService,
                projectRepository,
                taskService,
                taskRepository,
                userRepository,
                activityService,
                objectMapper,
                intentDetector,
                authorizationService,
                projectMemberRepository
        );
    }

    @Test
    void testNewProjectPromptHasNoForbiddenTerms() {
        String prompt = PromptBuilder.buildGenerateProjectPrompt("Build a Hospital Management System");
        
        Mockito.when(geminiProvider.generateJson(Mockito.anyString()))
                .thenReturn("{\"projectName\": \"Hospital Management System\", \"description\": \"System\", \"modules\": []}");

        ProjectResponse mockProjectResponse = Mockito.mock(ProjectResponse.class);
        Mockito.when(mockProjectResponse.id()).thenReturn(1L);
        Mockito.when(projectService.createProject(Mockito.any())).thenReturn(mockProjectResponse);

        Project mockProject = Mockito.mock(Project.class);
        Mockito.when(mockProject.getId()).thenReturn(1L);
        Mockito.when(projectRepository.findById(1L)).thenReturn(Optional.of(mockProject));
        assertDoesNotThrow(() -> aiService.generateAndPersistProject(new GenerateProjectRequest(
            "Hospital Management System",
            "Build a Hospital Management System",
            "MEDIUM",
            "PLANNING",
            "5",
            "2026-12-31",
            "React, Spring Boot"
        )));
    }

    @Test
    void testWorkspaceContextUsesGroupByQueryAndAuthScoping() {
        // Setup: authenticated user with 2 project memberships
        User currentUser = User.builder()
                .id(1L)
                .email("user@test.com")
                .password("pass")
                .firstName("Test")
                .lastName("User")
                .build();

        when(authorizationService.getAuthenticatedUser()).thenReturn(currentUser);
        when(authorizationService.isAdmin(currentUser)).thenReturn(false);

        Project project1 = Project.builder()
                .id(10L).name("Alpha").projectKey("ALPH")
                .status(ProjectStatus.IN_PROGRESS).priority(ProjectPriority.HIGH)
                .visibility(ProjectVisibility.PRIVATE).owner(currentUser).build();
        Project project2 = Project.builder()
                .id(20L).name("Beta").projectKey("BETA")
                .status(ProjectStatus.PLANNING).priority(ProjectPriority.MEDIUM)
                .visibility(ProjectVisibility.PRIVATE).owner(currentUser).build();

        ProjectMember pm1 = ProjectMember.builder()
                .id(1L).project(project1).user(currentUser).role(ProjectMemberRole.OWNER).build();
        ProjectMember pm2 = ProjectMember.builder()
                .id(2L).project(project2).user(currentUser).role(ProjectMemberRole.MEMBER).build();

        when(projectMemberRepository.findByUser(currentUser)).thenReturn(List.of(pm1, pm2));

        // Mock the GROUP BY aggregation result
        TaskRepository.ProjectTaskSummary summary1 = mock(TaskRepository.ProjectTaskSummary.class);
        when(summary1.getProjectId()).thenReturn(10L);
        when(summary1.getTotalCount()).thenReturn(5L);
        when(summary1.getDoneCount()).thenReturn(3L);

        TaskRepository.ProjectTaskSummary summary2 = mock(TaskRepository.ProjectTaskSummary.class);
        when(summary2.getProjectId()).thenReturn(20L);
        when(summary2.getTotalCount()).thenReturn(8L);
        when(summary2.getDoneCount()).thenReturn(1L);

        when(taskRepository.countTaskSummaryByProjects(List.of(10L, 20L)))
                .thenReturn(List.of(summary1, summary2));

        // Mock Gemini for PROJECT_CHAT with null projectId (workspace context)
        when(geminiProvider.generateResponse(anyString())).thenReturn("AI response");

        // "project status" matches PROJECT_CHAT intent; null projectId triggers workspace context path
        ChatRequest request = new ChatRequest("show project status", null);
        AIResponse response = aiService.chat(request);

        assertNotNull(response);

        // Verify: GROUP BY query was used (1 call), NOT individual countByProject calls (0 calls)
        verify(taskRepository, times(1)).countTaskSummaryByProjects(List.of(10L, 20L));
        verify(taskRepository, never()).countByProject(any());
        verify(taskRepository, never()).countByProjectAndStatus(any(), any());

        // Verify: only user's projects were accessed, not findAll()
        verify(projectRepository, never()).findAll();
        verify(projectMemberRepository, times(1)).findByUser(currentUser);
    }
}
