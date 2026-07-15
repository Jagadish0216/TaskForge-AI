package com.taskforge.module.project.dto;

import io.swagger.v3.oas.annotations.media.Schema;

/**
 * Statistical metadata overview for a specific project.
 */
@Schema(description = "Project statistics overview")
public record ProjectStatisticsResponse(
    @Schema(description = "Total number of members in this project")
    long totalMembers,

    @Schema(description = "Total number of tasks in this project")
    long totalTasks,

    @Schema(description = "Number of completed tasks")
    long completedTasks,

    @Schema(description = "Number of pending or in-progress tasks")
    long pendingTasks,

    @Schema(description = "Number of overdue tasks (due date has passed and task is not completed)")
    long overdueTasks,

    @Schema(description = "Project progress percentage", example = "75.5")
    double progressPercentage
) {}
