package com.taskforge.module.task.dto;

import com.taskforge.common.constant.TaskPriority;
import com.taskforge.common.constant.TaskStatus;
import io.swagger.v3.oas.annotations.media.Schema;

import java.time.LocalDate;

/**
 * Filter and search criteria for task queries.
 */
@Schema(description = "Criteria for searching and filtering tasks")
public record TaskSearchRequest(
    @Schema(description = "Query string matching task title or description", example = "OAuth")
    String keyword,

    @Schema(description = "Filter by status", example = "IN_PROGRESS")
    TaskStatus status,

    @Schema(description = "Filter by priority", example = "HIGH")
    TaskPriority priority,

    @Schema(description = "Filter by parent project ID")
    Long projectId,

    @Schema(description = "Filter by assigned user ID")
    Long assigneeId,

    @Schema(description = "Filter by tasks due on or before this date", example = "2026-07-31")
    LocalDate dueDate
) {}
