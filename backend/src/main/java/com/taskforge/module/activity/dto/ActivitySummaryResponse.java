package com.taskforge.module.activity.dto;

import com.taskforge.common.constant.ActivityType;
import io.swagger.v3.oas.annotations.media.Schema;

import java.time.LocalDateTime;

/**
 * Lightweight summary of an activity log.
 */
@Schema(description = "Lightweight activity summary")
public record ActivitySummaryResponse(
    @Schema(description = "Unique activity identifier")
    Long id,

    @Schema(description = "Activity event type")
    ActivityType type,

    @Schema(description = "Summary description text")
    String description,

    @Schema(description = "Timestamp when the activity occurred")
    LocalDateTime createdAt
) {}
