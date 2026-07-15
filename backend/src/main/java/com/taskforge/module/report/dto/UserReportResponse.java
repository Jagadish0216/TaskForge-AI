package com.taskforge.module.report.dto;

import io.swagger.v3.oas.annotations.media.Schema;

@Schema(description = "Response payload representing user productivity report")
public record UserReportResponse(
    Long userId,
    String fullName,
    String email,
    long totalAssignedTasks,
    long completedTasks,
    long pendingTasks,
    long overdueTasks,
    double completionRate,
    double estimatedHoursSum,
    double actualHoursSum
) {}
