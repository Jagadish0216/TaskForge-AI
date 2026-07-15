package com.taskforge.module.project.dto;

import com.taskforge.common.constant.ProjectPriority;
import com.taskforge.common.constant.ProjectStatus;
import com.taskforge.common.constant.ProjectVisibility;
import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.time.LocalDate;

/**
 * Request payload for updating project details.
 */
@Schema(description = "Project update request payload")
public record ProjectUpdateRequest(
    @Schema(description = "Updated project name", example = "TaskForge AI Platform")
    @NotBlank(message = "Project name is required")
    @Size(max = 100, message = "Project name cannot exceed 100 characters")
    String name,

    @Schema(description = "Updated detailed project description", example = "AI-powered task management.")
    String description,

    @Schema(description = "Updated project status", example = "IN_PROGRESS")
    @NotNull(message = "Project status is required")
    ProjectStatus status,

    @Schema(description = "Updated project priority level", example = "URGENT")
    @NotNull(message = "Project priority is required")
    ProjectPriority priority,

    @Schema(description = "Updated project visibility level", example = "PUBLIC")
    @NotNull(message = "Project visibility is required")
    ProjectVisibility visibility,

    @Schema(description = "Updated target start date", example = "2026-07-16")
    LocalDate startDate,

    @Schema(description = "Updated target end date", example = "2027-01-15")
    LocalDate endDate
) {}
