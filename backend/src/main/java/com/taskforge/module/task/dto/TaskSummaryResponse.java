package com.taskforge.module.task.dto;

import com.taskforge.common.constant.TaskStatus;
import io.swagger.v3.oas.annotations.media.Schema;

/**
 * Lightweight summary of a task.
 */
@Schema(description = "Lightweight task summary")
public record TaskSummaryResponse(
    @Schema(description = "Unique task identifier")
    Long id,

    @Schema(description = "Task title")
    String title,

    @Schema(description = "Task workflow status")
    TaskStatus status
) {}
