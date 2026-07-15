package com.taskforge.module.user.dto;

import io.swagger.v3.oas.annotations.media.Schema;

/**
 * Statistical metadata overview for a specific user.
 */
@Schema(description = "User statistics overview")
public record UserStatisticsResponse(
    @Schema(description = "Total number of projects owned by this user")
    long ownedProjectsCount,

    @Schema(description = "Total number of projects where this user is a member")
    long memberProjectsCount,

    @Schema(description = "Total number of tasks assigned to this user")
    long assignedTasksCount,

    @Schema(description = "Total number of completed tasks assigned to this user")
    long completedTasksCount,

    @Schema(description = "Total number of pending or in-progress tasks assigned to this user")
    long pendingTasksCount
) {}
