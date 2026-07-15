package com.taskforge.module.task.dto;

import com.taskforge.common.constant.TaskPriority;
import com.taskforge.common.constant.TaskStatus;
import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.time.LocalDate;

/**
 * Request payload for creating a new task.
 */
@Schema(description = "Task creation request payload")
public record TaskCreateRequest(
    @Schema(description = "Title of the task", example = "Implement OAuth login")
    @NotBlank(message = "Task title is required")
    @Size(max = 150, message = "Task title cannot exceed 150 characters")
    String title,

    @Schema(description = "Detailed task description", example = "Integrate Google and GitHub login endpoints.")
    String description,

    @Schema(description = "Workflow status", example = "TODO")
    @NotNull(message = "Task status is required")
    TaskStatus status,

    @Schema(description = "Priority level", example = "HIGH")
    @NotNull(message = "Task priority is required")
    TaskPriority priority,

    @Schema(description = "ID of the assigned user")
    Long assigneeId,

    @Schema(description = "ID of the parent project")
    @NotNull(message = "Project ID is required")
    Long projectId,

    @Schema(description = "Start date", example = "2026-07-15")
    LocalDate startDate,

    @Schema(description = "Due date", example = "2026-07-20")
    LocalDate dueDate,

    @Schema(description = "Estimated effort in hours", example = "8")
    Integer estimatedHours
) {}
