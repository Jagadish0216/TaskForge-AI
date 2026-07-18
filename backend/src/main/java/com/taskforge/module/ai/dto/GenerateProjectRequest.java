package com.taskforge.module.ai.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;

@Schema(description = "Request payload for generating a new project using AI")
public record GenerateProjectRequest(
    @NotBlank(message = "Project Name is required")
    @Schema(description = "Name of the project", example = "TaskForge AI")
    String projectName,

    @NotBlank(message = "Prompt/Description is required")
    @Schema(description = "Description or title of the project to build", example = "Build a Hospital Management System")
    String prompt,

    @Schema(description = "Project priority", example = "HIGH")
    String priority,

    @Schema(description = "Project phase", example = "Planning")
    String projectPhase,

    @Schema(description = "Estimated team size", example = "5")
    String estimatedTeamSize,

    @Schema(description = "Project deadline", example = "2026-12-31")
    String deadline,

    @Schema(description = "Technology stack used", example = "React, Spring Boot")
    String technologyStack
) {}
