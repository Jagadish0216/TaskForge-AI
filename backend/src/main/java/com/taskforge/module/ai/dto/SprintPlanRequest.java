package com.taskforge.module.ai.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotNull;

@Schema(description = "Request payload for AI sprint planning")
public record SprintPlanRequest(
    @Schema(description = "Target project ID")
    @NotNull(message = "Project ID is required")
    Long projectId,

    @Schema(description = "Optional sprint goal or target focus", example = "Focus on backend API security and database migrations")
    String sprintGoal
) {}
