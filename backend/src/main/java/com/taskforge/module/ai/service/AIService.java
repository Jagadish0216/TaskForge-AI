package com.taskforge.module.ai.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.taskforge.common.constant.ProjectPriority;
import com.taskforge.common.constant.ProjectStatus;
import com.taskforge.common.constant.ProjectVisibility;
import com.taskforge.common.constant.TaskPriority;
import com.taskforge.common.constant.TaskStatus;
import com.taskforge.module.activity.service.ActivityService;
import com.taskforge.module.ai.dto.*;
import com.taskforge.module.ai.util.PromptBuilder;
import com.taskforge.module.project.dto.ProjectCreateRequest;
import com.taskforge.module.project.dto.ProjectResponse;
import com.taskforge.module.project.entity.Project;
import com.taskforge.module.project.repository.ProjectRepository;
import com.taskforge.module.project.service.ProjectService;
import com.taskforge.module.task.dto.TaskCreateRequest;
import com.taskforge.module.task.entity.Task;
import com.taskforge.module.task.repository.TaskRepository;
import com.taskforge.module.task.service.TaskService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;

@Service
public class AIService {

    private static final Logger log = LoggerFactory.getLogger(AIService.class);

    private final GeminiProvider geminiProvider;
    private final ProjectService projectService;
    private final ProjectRepository projectRepository;
    private final TaskService taskService;
    private final TaskRepository taskRepository;
    private final ActivityService activityService;
    private final ObjectMapper objectMapper;

    public AIService(
            GeminiProvider geminiProvider,
            ProjectService projectService,
            ProjectRepository projectRepository,
            TaskService taskService,
            TaskRepository taskRepository,
            ActivityService activityService,
            ObjectMapper objectMapper
    ) {
        this.geminiProvider = geminiProvider;
        this.projectService = projectService;
        this.projectRepository = projectRepository;
        this.taskService = taskService;
        this.taskRepository = taskRepository;
        this.activityService = activityService;
        this.objectMapper = objectMapper;
    }

    /**
     * FEATURE 1: AI Project Generator
     */
    @Transactional
    public ProjectResponse generateAndPersistProject(GenerateProjectRequest request) {
        String prompt = PromptBuilder.buildGenerateProjectPrompt(request.prompt());
        String jsonText = geminiProvider.generateJson(prompt);

        GeneratedProjectDTO dto;
        try {
            dto = objectMapper.readValue(jsonText, GeneratedProjectDTO.class);
        } catch (Exception e) {
            log.error("Failed to parse Gemini generated project JSON: {}", jsonText, e);
            dto = new GeneratedProjectDTO(
                    request.prompt().length() > 50 ? request.prompt().substring(0, 50) : request.prompt(),
                    "AI Generated Project for: " + request.prompt(),
                    List.of(new GeneratedProjectDTO.ModuleDTO("Core Features", "Primary setup module",
                            List.of(new GeneratedProjectDTO.TaskDTO("Setup System Architecture", request.prompt(), "HIGH", 8)))),
                    List.of("Milestone 1: Project Setup")
            );
        }

        String projectKey = generateUniqueProjectKey(dto.projectName());

        ProjectCreateRequest projectCreateRequest = new ProjectCreateRequest(
                dto.projectName() != null ? dto.projectName() : "AI Project",
                projectKey,
                dto.description() != null ? dto.description() : request.prompt(),
                ProjectStatus.PLANNING,
                ProjectPriority.HIGH,
                ProjectVisibility.PRIVATE,
                LocalDate.now(),
                LocalDate.now().plusMonths(3)
        );

        ProjectResponse projectResponse = projectService.createProject(projectCreateRequest);

        if (dto.modules() != null) {
            for (GeneratedProjectDTO.ModuleDTO mod : dto.modules()) {
                if (mod.tasks() != null) {
                    for (GeneratedProjectDTO.TaskDTO t : mod.tasks()) {
                        TaskPriority priority = TaskPriority.HIGH;
                        if (t.priority() != null) {
                            try {
                                priority = TaskPriority.valueOf(t.priority().toUpperCase());
                            } catch (Exception ignored) {}
                        }

                        TaskCreateRequest taskCreateRequest = new TaskCreateRequest(
                                t.title() != null ? t.title() : "AI Task",
                                (mod.name() != null ? "[" + mod.name() + "] " : "") + (t.description() != null ? t.description() : ""),
                                TaskStatus.TODO,
                                priority,
                                projectResponse.id(),
                                null,
                                LocalDate.now(),
                                LocalDate.now().plusWeeks(2),
                                t.estimatedHours() != null ? t.estimatedHours() : 8
                        );
                        try {
                            taskService.createTask(taskCreateRequest);
                        } catch (Exception ex) {
                            log.warn("Failed to create task '{}' for project ID {}: {}", t.title(), projectResponse.id(), ex.getMessage());
                        }
                    }
                }
            }
        }

        return projectResponse;
    }

    /**
     * FEATURE 2: Context-Aware AI Chat
     */
    @Transactional(readOnly = true)
    public AIResponse chat(ChatRequest request) {
        String dbContext = buildProjectDbContext(request.projectId());
        String prompt = PromptBuilder.buildProjectChatPrompt(request.message(), dbContext);
        String response = geminiProvider.generateResponse(prompt);
        return new AIResponse(response);
    }

    /**
     * FEATURE 3: AI Sprint Planner
     */
    @Transactional(readOnly = true)
    public AIResponse planSprint(SprintPlanRequest request) {
        String dbContext = buildProjectDbContext(request.projectId());
        String prompt = PromptBuilder.buildSprintPlanPrompt(dbContext, request.sprintGoal());
        String jsonResponse = geminiProvider.generateJson(prompt);
        return new AIResponse(jsonResponse);
    }

    /**
     * FEATURE 4: AI Risk Analyzer
     */
    @Transactional(readOnly = true)
    public AIResponse analyzeRisks(RiskAnalysisRequest request) {
        String dbContext = buildProjectDbContext(request.projectId());
        String prompt = PromptBuilder.buildRiskAnalysisPrompt(dbContext);
        String jsonResponse = geminiProvider.generateJson(prompt);
        return new AIResponse(jsonResponse);
    }

    /**
     * FEATURE 5: AI Documentation Generator
     */
    @Transactional(readOnly = true)
    public AIResponse generateDocumentation(DocumentationRequest request) {
        String dbContext = buildProjectDbContext(request.projectId());
        String prompt = PromptBuilder.buildDocumentationPrompt(request.docType(), dbContext);
        String markdownResponse = geminiProvider.generateResponse(prompt);
        return new AIResponse(markdownResponse);
    }

    private String buildProjectDbContext(Long projectId) {
        StringBuilder sb = new StringBuilder();

        if (projectId != null) {
            Project project = projectRepository.findById(projectId).orElse(null);
            if (project != null) {
                sb.append("ACTIVE PROJECT CONTEXT:\n");
                sb.append("- ID: ").append(project.getId()).append("\n");
                sb.append("- Name: ").append(project.getName()).append(" (Key: ").append(project.getProjectKey()).append(")\n");
                sb.append("- Status: ").append(project.getStatus()).append(" | Priority: ").append(project.getPriority()).append("\n");
                sb.append("- Description: ").append(project.getDescription()).append("\n");

                List<Task> tasks = taskRepository.findByProject(project);
                sb.append("- Total Tasks Count: ").append(tasks.size()).append("\n");
                long completed = tasks.stream().filter(t -> t.getStatus() == TaskStatus.DONE).count();
                sb.append("- Completed Tasks: ").append(completed).append("\n");
                long overdue = tasks.stream().filter(t -> t.getDueDate() != null && t.getDueDate().isBefore(LocalDate.now()) && t.getStatus() != TaskStatus.DONE).count();
                sb.append("- Overdue Tasks: ").append(overdue).append("\n\n");

                sb.append("TASKS LIST SUMMARY:\n");
                for (Task t : tasks) {
                    sb.append("  • [").append(t.getStatus()).append("] #").append(t.getId()).append(" ").append(t.getTitle())
                            .append(" (Priority: ").append(t.getPriority()).append(", Est: ").append(t.getEstimatedHours() != null ? t.getEstimatedHours() : 0).append("h)\n");
                }
                return sb.toString();
            }
        }

        List<Project> allProjects = projectRepository.findAll();
        sb.append("WORKSPACE GLOBAL CONTEXT:\n");
        sb.append("- Total Projects: ").append(allProjects.size()).append("\n");
        for (Project p : allProjects) {
            long total = taskRepository.countByProject(p);
            long done = taskRepository.countByProjectAndStatus(p, TaskStatus.DONE);
            sb.append("  • Project: ").append(p.getName()).append(" [Key: ").append(p.getProjectKey()).append(", Status: ").append(p.getStatus()).append("] Tasks: ").append(done).append("/").append(total).append(" completed\n");
        }
        return sb.toString();
    }

    private String generateUniqueProjectKey(String name) {
        String base = "PROJ";
        if (name != null) {
            String cleaned = name.replaceAll("[^a-zA-Z]", "").toUpperCase();
            if (cleaned.length() >= 2) {
                base = cleaned.substring(0, Math.min(cleaned.length(), 4));
            }
        }

        String key = base;
        int counter = 1;
        while (projectRepository.existsByProjectKey(key)) {
            key = base + counter;
            counter++;
        }
        return key;
    }
}
