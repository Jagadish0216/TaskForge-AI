package com.taskforge.module.project.dto;

import com.taskforge.common.constant.ProjectPriority;
import com.taskforge.common.constant.ProjectStatus;
import com.taskforge.common.constant.ProjectVisibility;
import com.taskforge.module.user.dto.UserSummaryResponse;
import io.swagger.v3.oas.annotations.media.Schema;

import java.time.LocalDate;
import java.time.LocalDateTime;

/**
 * Detailed representation of a project response.
 */
@Schema(description = "Detailed project response information")
public record ProjectResponse(
    @Schema(description = "Unique project identifier")
    Long id,

    @Schema(description = "Project name")
    String name,

    @Schema(description = "Unique alphanumeric project key")
    String projectKey,

    @Schema(description = "Detailed description")
    String description,

    @Schema(description = "Project workflow status")
    ProjectStatus status,

    @Schema(description = "Project priority level")
    ProjectPriority priority,

    @Schema(description = "Project visibility level")
    ProjectVisibility visibility,

    @Schema(description = "Flag indicating if project is archived")
    boolean archived,

    @Schema(description = "Target start date")
    LocalDate startDate,

    @Schema(description = "Target end date")
    LocalDate endDate,

    @Schema(description = "Project owner summary profile")
    UserSummaryResponse owner,

    @Schema(description = "Project creation timestamp")
    LocalDateTime createdAt,

    @Schema(description = "Project last updated timestamp")
    LocalDateTime updatedAt
) {}
