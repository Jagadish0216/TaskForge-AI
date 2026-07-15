package com.taskforge.module.ai.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotNull;

@Schema(description = "Request payload for AI project risk evaluation")
public record RiskAnalysisRequest(
    @Schema(description = "Target project ID")
    @NotNull(message = "Project ID is required")
    Long projectId
) {}
