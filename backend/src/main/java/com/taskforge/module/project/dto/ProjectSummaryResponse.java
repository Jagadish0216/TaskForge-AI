package com.taskforge.module.project.dto;

import com.taskforge.common.constant.ProjectStatus;
import io.swagger.v3.oas.annotations.media.Schema;

/**
 * Lightweight summary of a project.
 */
@Schema(description = "Lightweight project summary")
public record ProjectSummaryResponse(
    @Schema(description = "Unique project identifier")
    Long id,

    @Schema(description = "Project name")
    String name,

    @Schema(description = "Unique alphanumeric project key")
    String projectKey,

    @Schema(description = "Project workflow status")
    ProjectStatus status
) {}
