package com.taskforge.module.task.dto;

import com.taskforge.common.constant.TaskPriority;
import com.taskforge.common.constant.TaskStatus;
import com.taskforge.module.project.dto.ProjectSummaryResponse;
import com.taskforge.module.user.dto.UserSummaryResponse;
import io.swagger.v3.oas.annotations.media.Schema;

import java.time.LocalDate;
import java.time.LocalDateTime;

/**
 * Detailed representation of a task response.
 */
@Schema(description = "Detailed task response information")
public record TaskResponse(
    @Schema(description = "Unique task identifier")
    Long id,

    @Schema(description = "Task title")
    String title,

    @Schema(description = "Detailed task description")
    String description,

    @Schema(description = "Task workflow status")
    TaskStatus status,

    @Schema(description = "Task priority level")
    TaskPriority priority,

    @Schema(description = "Start date")
    LocalDate startDate,

    @Schema(description = "Due date")
    LocalDate dueDate,

    @Schema(description = "Timestamp when the task was moved to completed status")
    LocalDate completedDate,

    @Schema(description = "Estimated effort in hours")
    Integer estimatedHours,

    @Schema(description = "Actual effort spent in hours")
    Integer actualHours,

    @Schema(description = "Summary profile of assignee user")
    UserSummaryResponse assignee,

    @Schema(description = "Summary profile of parent project")
    ProjectSummaryResponse project,

    @Schema(description = "Task creation timestamp")
    LocalDateTime createdAt,

    @Schema(description = "Task last updated timestamp")
    LocalDateTime updatedAt
) {}
