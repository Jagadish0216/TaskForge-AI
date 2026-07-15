package com.taskforge.module.activity.dto;

import com.taskforge.common.constant.ActivityType;
import io.swagger.v3.oas.annotations.media.Schema;

/**
 * Filter and search criteria for activity timelines.
 */
@Schema(description = "Criteria for searching and filtering activity logs")
public record ActivitySearchRequest(
    @Schema(description = "Activity event type filter", example = "TASK_CREATED")
    ActivityType type,

    @Schema(description = "Filter by project identifier")
    Long projectId,

    @Schema(description = "Filter by actor user identifier")
    Long userId,

    @Schema(description = "Filter by task identifier")
    Long taskId,

    @Schema(description = "Fuzzy search keyword matching description text", example = "completed")
    String keyword
) {}
