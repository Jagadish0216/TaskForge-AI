package com.taskforge.module.project.dto;

import com.taskforge.common.constant.ProjectPriority;
import com.taskforge.common.constant.ProjectStatus;
import com.taskforge.common.constant.ProjectVisibility;
import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

import java.time.LocalDate;

/**
 * Request payload for creating a new project.
 */
@Schema(description = "Project creation request payload")
public record ProjectCreateRequest(
    @Schema(description = "Name of the project", example = "TaskForge Platform")
    @NotBlank(message = "Project name is required")
    @Size(max = 100, message = "Project name cannot exceed 100 characters")
    String name,

    @Schema(description = "Unique uppercase project key", example = "TF")
    @NotBlank(message = "Project key is required")
    @Size(min = 2, max = 20, message = "Project key must be between 2 and 20 characters")
    @Pattern(regexp = "^[A-Z0-9]+$", message = "Project key must contain only uppercase alphanumeric characters")
    String projectKey,

    @Schema(description = "Detailed project description", example = "Backend rewrite using Spring Boot.")
    String description,

    @Schema(description = "Project workflow status", example = "PLANNING")
    @NotNull(message = "Project status is required")
    ProjectStatus status,

    @Schema(description = "Project priority level", example = "HIGH")
    @NotNull(message = "Project priority is required")
    ProjectPriority priority,

    @Schema(description = "Project visibility level", example = "PRIVATE")
    @NotNull(message = "Project visibility is required")
    ProjectVisibility visibility,

    @Schema(description = "Target start date", example = "2026-07-15")
    LocalDate startDate,

    @Schema(description = "Target end date", example = "2026-12-31")
    LocalDate endDate
) {}
