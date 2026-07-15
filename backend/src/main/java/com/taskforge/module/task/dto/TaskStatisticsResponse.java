package com.taskforge.module.task.dto;

import io.swagger.v3.oas.annotations.media.Schema;

/**
 * Statistical metadata overview of tasks.
 */
@Schema(description = "Task statistics overview")
public record TaskStatisticsResponse(
    @Schema(description = "Total number of tasks")
    long totalTasks,

    @Schema(description = "Number of completed tasks")
    long completedTasks,

    @Schema(description = "Number of pending or in-progress tasks")
    long pendingTasks,

    @Schema(description = "Number of overdue tasks")
    long overdueTasks,

    @Schema(description = "Task completion percentage", example = "60.0")
    double completionPercentage
) {}
