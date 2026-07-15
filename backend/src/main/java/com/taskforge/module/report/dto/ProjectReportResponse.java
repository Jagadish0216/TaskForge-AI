package com.taskforge.module.report.dto;

import com.taskforge.common.constant.ProjectPriority;
import com.taskforge.common.constant.ProjectStatus;
import io.swagger.v3.oas.annotations.media.Schema;

@Schema(description = "Response payload representing project analysis report")
public record ProjectReportResponse(
    Long projectId,
    String projectName,
    String projectKey,
    ProjectStatus status,
    ProjectPriority priority,
    long totalTasks,
    long completedTasks,
    long pendingTasks,
    long overdueTasks,
    double completionRate,
    long totalMembers
) {}
