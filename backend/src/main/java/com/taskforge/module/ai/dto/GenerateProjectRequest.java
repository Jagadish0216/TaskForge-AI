package com.taskforge.module.ai.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;

@Schema(description = "Request payload for generating a new project using AI")
public record GenerateProjectRequest(
    @Schema(description = "Description or title of the project to build", example = "Build a Hospital Management System")
    @NotBlank(message = "Prompt is required")
    String prompt
) {}
