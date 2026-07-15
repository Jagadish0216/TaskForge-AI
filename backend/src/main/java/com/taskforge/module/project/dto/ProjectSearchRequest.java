package com.taskforge.module.project.dto;

import com.taskforge.common.constant.ProjectPriority;
import com.taskforge.common.constant.ProjectStatus;
import com.taskforge.common.constant.ProjectVisibility;
import io.swagger.v3.oas.annotations.media.Schema;

/**
 * Filter and search criteria for project queries.
 */
@Schema(description = "Criteria for searching and filtering projects")
public record ProjectSearchRequest(
    @Schema(description = "Query string matching project name or key", example = "TaskForge")
    String keyword,

    @Schema(description = "Project status to filter by", example = "IN_PROGRESS")
    ProjectStatus status,

    @Schema(description = "Project priority to filter by", example = "HIGH")
    ProjectPriority priority,

    @Schema(description = "Project visibility to filter by", example = "PRIVATE")
    ProjectVisibility visibility,

    @Schema(description = "Filter by owner's user ID")
    Long ownerId,

    @Schema(description = "Filter by archived status", example = "false")
    Boolean archived
) {}
