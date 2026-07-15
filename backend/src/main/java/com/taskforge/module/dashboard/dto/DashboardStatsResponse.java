package com.taskforge.module.dashboard.dto;

import com.taskforge.module.activity.dto.ActivityResponse;
import com.taskforge.module.task.dto.TaskResponse;
import io.swagger.v3.oas.annotations.media.Schema;

import java.util.List;
import java.util.Map;

@Schema(description = "Response payload representing dashboard summary metrics")
public record DashboardStatsResponse(
    long totalProjects,
    long completedProjects,
    long totalTasks,
    long completedTasks,
    long pendingTasks,
    long overdueTasks,
    Map<String, Double> projectHealth,
    List<ActivityResponse> recentActivities,
    List<TaskResponse> upcomingDeadlines,
    Map<String, Long> teamProductivity,
    Map<String, Long> taskDistribution
) {}
