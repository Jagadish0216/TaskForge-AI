package com.taskforge.module.report.dto;

import com.taskforge.module.task.dto.TaskResponse;
import io.swagger.v3.oas.annotations.media.Schema;
import java.util.List;

@Schema(description = "Response payload representing task analysis report summary")
public record TaskReportResponse(
    long totalTasks,
    long todoCount,
    long inProgressCount,
    long doneCount,
    long inReviewCount,
    long backlogCount,
    double totalEstimatedHours,
    double totalActualHours,
    List<TaskResponse> tasks
) {}
