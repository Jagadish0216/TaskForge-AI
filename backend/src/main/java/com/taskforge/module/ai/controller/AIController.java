package com.taskforge.module.ai.controller;

import com.taskforge.common.api.ApiResponse;
import com.taskforge.module.ai.dto.*;
import com.taskforge.module.ai.service.AIService;
import com.taskforge.module.project.dto.ProjectResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
@RestController
@RequestMapping("/ai")
@Tag(name = "Production Gemini AI Tools", description = "Production REST endpoints powered by Google Gemini API")
public class AIController {

    private final AIService aiService;

    public AIController(AIService aiService) {
        this.aiService = aiService;
    }

    @PostMapping("/chat")
    @Operation(summary = "Context-aware AI Chat", description = "Contextual conversational assistant using workspace MySQL context and Google Gemini")
    public ResponseEntity<ApiResponse<AIResponse>> chat(@RequestBody ChatRequest request) {
        AIResponse response = aiService.chat(request);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @PostMapping("/project/generate")
    @Operation(summary = "Generate and persist project", description = "Generates structured JSON project & tasks using Gemini and persists them directly into MySQL DB")
    public ResponseEntity<ApiResponse<ProjectResponse>> generateProject(@Valid @RequestBody GenerateProjectRequest request) {
        ProjectResponse response = aiService.generateAndPersistProject(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(response, "Project generated and created in database successfully"));
    }

    @PostMapping("/sprint/plan")
    @Operation(summary = "Generate Sprint Plan", description = "Generates a structured sprint backlog allocation based on actual database tasks")
    public ResponseEntity<ApiResponse<AIResponse>> planSprint(@Valid @RequestBody SprintPlanRequest request) {
        AIResponse response = aiService.planSprint(request);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @PostMapping("/risk/analyze")
    @Operation(summary = "Generate Risk Analysis & Health Score", description = "Analyzes overdue tasks, completion %, and priority density from database to compute health score")
    public ResponseEntity<ApiResponse<AIResponse>> analyzeRisks(@Valid @RequestBody RiskAnalysisRequest request) {
        AIResponse response = aiService.analyzeRisks(request);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @PostMapping("/documentation")
    @Operation(summary = "Generate Markdown Documentation", description = "Generates Markdown documentation (README, API Docs, Spec) based on database context")
    public ResponseEntity<ApiResponse<AIResponse>> generateDocumentation(@Valid @RequestBody DocumentationRequest request) {
        AIResponse response = aiService.generateDocumentation(request);
        return ResponseEntity.ok(ApiResponse.success(response));
    }
}
