package com.taskforge.module.ai.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.taskforge.common.constant.ProjectPriority;
import com.taskforge.common.constant.ProjectStatus;
import com.taskforge.common.constant.ProjectVisibility;
import com.taskforge.common.constant.TaskPriority;
import com.taskforge.common.constant.TaskStatus;
import com.taskforge.common.exception.InvalidStateException;
import com.taskforge.common.exception.ResourceNotFoundException;
import com.taskforge.module.activity.service.ActivityService;
import com.taskforge.module.ai.constant.AIIntent;
import com.taskforge.module.ai.dto.*;
import com.taskforge.module.ai.util.PromptBuilder;
import com.taskforge.module.project.dto.ProjectCreateRequest;
import com.taskforge.module.project.dto.ProjectResponse;
import com.taskforge.module.project.entity.Project;
import com.taskforge.module.project.entity.ProjectMember;
import com.taskforge.module.project.repository.ProjectMemberRepository;
import com.taskforge.module.project.repository.ProjectRepository;
import com.taskforge.module.project.service.ProjectService;
import com.taskforge.module.task.entity.Task;
import com.taskforge.module.task.repository.TaskRepository;
import com.taskforge.module.task.service.TaskService;
import com.taskforge.module.user.entity.User;
import com.taskforge.module.user.repository.UserRepository;
import com.taskforge.security.ProjectAuthorizationService;
import com.taskforge.security.SecurityUtils;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class AIService {

    private static final Logger log = LoggerFactory.getLogger(AIService.class);

    private static final List<String> FORBIDDEN_NEW_PROJECT_TERMS = List.of(
            "workspace",
            "current project",
            "active project",
            "existing project",
            "taskforge",
            "tfec",
            "database context"
    );

    private final GeminiProvider geminiProvider;
    private final ProjectService projectService;
    private final ProjectRepository projectRepository;
    private final TaskService taskService;
    private final TaskRepository taskRepository;
    private final UserRepository userRepository;
    private final ActivityService activityService;
    private final ObjectMapper objectMapper;
    private final IntentDetector intentDetector;
    private final ProjectAuthorizationService authorizationService;
    private final ProjectMemberRepository projectMemberRepository;

    public AIService(
            GeminiProvider geminiProvider,
            ProjectService projectService,
            ProjectRepository projectRepository,
            TaskService taskService,
            TaskRepository taskRepository,
            UserRepository userRepository,
            ActivityService activityService,
            ObjectMapper objectMapper,
            IntentDetector intentDetector,
            ProjectAuthorizationService authorizationService,
            ProjectMemberRepository projectMemberRepository
    ) {
        this.geminiProvider = geminiProvider;
        this.projectService = projectService;
        this.projectRepository = projectRepository;
        this.taskService = taskService;
        this.taskRepository = taskRepository;
        this.userRepository = userRepository;
        this.activityService = activityService;
        this.objectMapper = objectMapper;
        this.intentDetector = intentDetector;
        this.authorizationService = authorizationService;
        this.projectMemberRepository = projectMemberRepository;
    }

    /**
     * FEATURE 1: AI Project Generator
     */
    @Transactional
    public ProjectResponse generateAndPersistProject(GenerateProjectRequest request) {
        String prompt = PromptBuilder.buildGenerateProjectPrompt(
                request.projectName(),
                request.prompt(),
                request.priority(),
                request.projectPhase(),
                request.estimatedTeamSize(),
                request.deadline(),
                request.technologyStack()
        );

        log.info("AI request received: PROJECT_GENERATE");
        log.debug("Gemini project generation prompt: {}", prompt);

        validateNewProjectPrompt(prompt);

        String jsonText = geminiProvider.generateJson(prompt);

        GeneratedProjectDTO dto;
        try {
            dto = objectMapper.readValue(jsonText, GeneratedProjectDTO.class);
        } catch (Exception e) {
            log.error("Failed to parse Gemini generated project JSON: {}", jsonText, e);
            dto = new GeneratedProjectDTO(
                    request.projectName() != null ? request.projectName() : "AI Project",
                    "AI Generated Project for: " + request.prompt(),
                    List.of(new GeneratedProjectDTO.ModuleDTO("Core Features", "Primary setup module",
                            List.of(new GeneratedProjectDTO.TaskDTO("Setup System Architecture", request.prompt(), "HIGH", 8)))),
                    List.of("Milestone 1: Project Setup")
            );
        }

        String projectKey = generateUniqueProjectKey(dto.projectName() != null ? dto.projectName() : request.projectName());

        ProjectPriority priorityVal = ProjectPriority.MEDIUM;
        if (request.priority() != null) {
            try {
                priorityVal = ProjectPriority.valueOf(request.priority().toUpperCase());
            } catch (Exception e) {}
        }

        LocalDate deadlineVal = LocalDate.now().plusMonths(3);
        if (request.deadline() != null && !request.deadline().isBlank()) {
            try {
                deadlineVal = LocalDate.parse(request.deadline());
            } catch (Exception e) {}
        }

        ProjectCreateRequest projectCreateRequest = new ProjectCreateRequest(
                request.projectName() != null ? request.projectName() : (dto.projectName() != null ? dto.projectName() : "AI Project"),
                projectKey,
                dto.description() != null ? dto.description() : request.prompt(),
                ProjectStatus.PLANNING,
                priorityVal,
                ProjectVisibility.PRIVATE,
                LocalDate.now(),
                deadlineVal,
                request.projectPhase(),
                request.estimatedTeamSize(),
                request.technologyStack()
        );

        // 1. Save Project entity first
        ProjectResponse projectResponse = projectService.createProject(projectCreateRequest);
        Long projectId = projectResponse.id();
        if (projectId == null) {
            throw new InvalidStateException("Saved project ID cannot be null");
        }

        // Retrieve saved Project entity directly
        Project savedProject = projectRepository.findById(projectId)
                .orElseThrow(() -> new ResourceNotFoundException("Saved project not found with id: " + projectId));

        // Obtain default user / owner for task assignment if needed
        User defaultUser = null;
        String currentUserEmail = SecurityUtils.getCurrentUserUsername().orElse(null);
        if (currentUserEmail != null) {
            defaultUser = userRepository.findByEmail(currentUserEmail).orElse(null);
        }
        if (defaultUser == null) {
            defaultUser = savedProject.getOwner();
        }

        List<String> failedTasks = new ArrayList<>();

        if (dto.modules() != null) {
            for (GeneratedProjectDTO.ModuleDTO mod : dto.modules()) {
                if (mod.tasks() != null) {
                    for (GeneratedProjectDTO.TaskDTO t : mod.tasks()) {
                        String title = t.title() != null ? t.title() : "AI Task";
                        TaskPriority priority = TaskPriority.HIGH;
                        if (t.priority() != null) {
                            try {
                                priority = TaskPriority.valueOf(t.priority().toUpperCase());
                            } catch (Exception ignored) {}
                        }

                        // Log task details at DEBUG level
                        log.debug("Task created: [{}] Priority: {} Status: {} ProjectId: {}",
                                title, priority, TaskStatus.TODO, savedProject.getId());

                        Task task = Task.builder()
                                .title(title)
                                .description((mod.name() != null ? "[" + mod.name() + "] " : "") + (t.description() != null ? t.description() : ""))
                                .status(TaskStatus.TODO)
                                .priority(priority)
                                .project(savedProject)
                                .assignee(defaultUser)
                                .startDate(LocalDate.now())
                                .dueDate(LocalDate.now().plusWeeks(2))
                                .estimatedHours(t.estimatedHours() != null ? t.estimatedHours() : 8)
                                .build();

                        try {
                            taskRepository.save(task);
                        } catch (Exception ex) {
                            log.error("Failed to save task '{}' for project ID {}: {}", title, savedProject.getId(), ex.getMessage(), ex);
                            failedTasks.add(title);
                        }
                    }
                }
            }
        }

        if (!failedTasks.isEmpty()) {
            log.warn("Project '{}' generated with {} failed tasks: {}", savedProject.getName(), failedTasks.size(), failedTasks);
        }

        return projectResponse;
    }

    /**
     * FEATURE 2: Context-Aware & Intent-Guided AI Chat
     */
    @Transactional
    public AIResponse chat(ChatRequest request) {
        AIIntent intent = intentDetector.detectIntent(request.message());
        log.info("AI request received: CHAT ({})", intent);

        switch (intent) {
            case NEW_PROJECT -> {
                // DO NOT load current active project or workspace context
                log.info("Rerouting prompt to NEW_PROJECT flow without active workspace context");
                ProjectResponse createdProject = generateAndPersistProject(new GenerateProjectRequest(
                        request.message(), // projectName
                        request.message(), // prompt
                        "MEDIUM",          // priority
                        "Planning",        // projectPhase
                        "1-5",             // estimatedTeamSize
                        null,              // deadline
                        null               // technologyStack
                ));
                String replyMessage = String.format(
                        "Successfully generated and created a new project **%s** (Key: `%s`) in the database with modules and tasks.\n\nDescription: %s",
                        createdProject.name(),
                        createdProject.projectKey(),
                        createdProject.description()
                );
                return new AIResponse(replyMessage);
            }
            case PROJECT_CHAT -> {
                // Load active project database context
                String dbContext = buildProjectDbContext(request.projectId());
                String prompt = PromptBuilder.buildProjectChatPrompt(request.message(), dbContext);
                String response = geminiProvider.generateResponse(prompt);
                return new AIResponse(response);
            }
            case GENERAL_CHAT -> {
                // Send directly to Gemini WITHOUT loading any database context
                String prompt = PromptBuilder.buildGeneralChatPrompt(request.message());
                String response = geminiProvider.generateResponse(prompt);
                return new AIResponse(response);
            }
            default -> {
                String prompt = PromptBuilder.buildGeneralChatPrompt(request.message());
                String response = geminiProvider.generateResponse(prompt);
                return new AIResponse(response);
            }
        }
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

    private void validateNewProjectPrompt(String prompt) {
        if (prompt == null || prompt.isBlank()) {
            throw new IllegalStateException("NEW_PROJECT prompt cannot be null or blank");
        }
        String lowerPrompt = prompt.toLowerCase();
        for (String forbidden : FORBIDDEN_NEW_PROJECT_TERMS) {
            if (lowerPrompt.contains(forbidden)) {
                throw new IllegalStateException(
                        "NEW_PROJECT prompt contains forbidden workspace term '" + forbidden +
                        "'. NEW_PROJECT prompts must be completely isolated."
                );
            }
        }
    }

    private String buildProjectDbContext(Long projectId) {
        StringBuilder sb = new StringBuilder();

        if (projectId != null) {
            Project project = projectRepository.findById(projectId).orElse(null);
            if (project != null) {
                // Verify the authenticated user has read access to this project
                User currentUser = authorizationService.getAuthenticatedUser();
                authorizationService.verifyProjectReadAccess(project, currentUser);

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

        // Workspace context — scope to user's accessible projects with single aggregation query
        User currentUser = authorizationService.getAuthenticatedUser();
        List<Project> accessibleProjects;

        if (authorizationService.isAdmin(currentUser)) {
            accessibleProjects = projectRepository.findAll();
        } else {
            accessibleProjects = projectMemberRepository.findByUser(currentUser).stream()
                    .map(ProjectMember::getProject)
                    .toList();
        }

        sb.append("WORKSPACE GLOBAL CONTEXT:\n");
        sb.append("- Total Projects: ").append(accessibleProjects.size()).append("\n");

        if (!accessibleProjects.isEmpty()) {
            List<Long> projectIds = accessibleProjects.stream().map(Project::getId).toList();

            // Single GROUP BY query replaces 2P individual count queries
            List<TaskRepository.ProjectTaskSummary> summaries = taskRepository.countTaskSummaryByProjects(projectIds);
            Map<Long, TaskRepository.ProjectTaskSummary> summaryMap = new HashMap<>();
            for (TaskRepository.ProjectTaskSummary s : summaries) {
                summaryMap.put(s.getProjectId(), s);
            }

            for (Project p : accessibleProjects) {
                TaskRepository.ProjectTaskSummary summary = summaryMap.get(p.getId());
                long total = summary != null ? summary.getTotalCount() : 0;
                long done = summary != null ? summary.getDoneCount() : 0;
                sb.append("  • Project: ").append(p.getName()).append(" [Key: ").append(p.getProjectKey()).append(", Status: ").append(p.getStatus()).append("] Tasks: ").append(done).append("/").append(total).append(" completed\n");
            }
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
