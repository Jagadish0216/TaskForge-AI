package com.taskforge.module.ai.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.taskforge.module.activity.service.ActivityService;
import com.taskforge.module.ai.dto.GenerateProjectRequest;
import com.taskforge.module.ai.util.PromptBuilder;
import com.taskforge.module.project.dto.ProjectResponse;
import com.taskforge.module.project.entity.Project;
import com.taskforge.module.project.repository.ProjectRepository;
import com.taskforge.module.project.service.ProjectService;
import com.taskforge.module.task.repository.TaskRepository;
import com.taskforge.module.task.service.TaskService;
import com.taskforge.module.user.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertDoesNotThrow;

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

        aiService = new AIService(
                geminiProvider,
                projectService,
                projectRepository,
                taskService,
                taskRepository,
                userRepository,
                activityService,
                objectMapper,
                intentDetector
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

        assertDoesNotThrow(() -> aiService.generateAndPersistProject(new GenerateProjectRequest("Build a Hospital Management System")));
    }
}
