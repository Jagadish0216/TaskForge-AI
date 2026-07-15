package com.taskforge.module.task.dto;

import com.taskforge.common.constant.TaskPriority;
import com.taskforge.common.constant.TaskStatus;
import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.time.LocalDate;

/**
 * Request payload for updating task details.
 */
@Schema(description = "Task update request payload")
public record TaskUpdateRequest(
    @Schema(description = "Updated title of the task", example = "Implement OAuth login with dynamic redirect URI")
    @NotBlank(message = "Task title is required")
    @Size(max = 150, message = "Task title cannot exceed 150 characters")
    String title,

    @Schema(description = "Updated detailed task description", example = "Integrate redirect URI checks.")
    String description,

    @Schema(description = "Updated workflow status", example = "IN_PROGRESS")
    @NotNull(message = "Task status is required")
    TaskStatus status,

    @Schema(description = "Updated priority level", example = "URGENT")
    @NotNull(message = "Task priority is required")
    TaskPriority priority,

    @Schema(description = "Updated assignee user ID")
    Long assigneeId,

    @Schema(description = "Updated start date", example = "2026-07-16")
    LocalDate startDate,

    @Schema(description = "Updated due date", example = "2026-07-22")
    LocalDate dueDate,

    @Schema(description = "Updated estimated effort in hours", example = "12")
    Integer estimatedHours,

    @Schema(description = "Actual effort spent in hours", example = "4")
    Integer actualHours
) {}
