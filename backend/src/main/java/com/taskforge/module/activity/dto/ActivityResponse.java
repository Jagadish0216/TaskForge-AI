package com.taskforge.module.activity.dto;

import com.taskforge.common.constant.ActivityType;
import com.taskforge.module.project.dto.ProjectSummaryResponse;
import com.taskforge.module.task.dto.TaskSummaryResponse;
import com.taskforge.module.user.dto.UserSummaryResponse;
import io.swagger.v3.oas.annotations.media.Schema;

import java.time.LocalDateTime;

/**
 * Detailed representation of an activity log response.
 */
@Schema(description = "Detailed activity log response")
public record ActivityResponse(
    @Schema(description = "Unique activity identifier")
    Long id,

    @Schema(description = "Activity event type")
    ActivityType type,

    @Schema(description = "Descriptive summary of the action performed")
    String description,

    @Schema(description = "Summary of the associated project (if applicable)")
    ProjectSummaryResponse project,

    @Schema(description = "Summary of the associated task (if applicable)")
    TaskSummaryResponse task,

    @Schema(description = "Summary of the user who performed the activity")
    UserSummaryResponse user,

    @Schema(description = "Timestamp when the activity occurred")
    LocalDateTime createdAt
) {}
