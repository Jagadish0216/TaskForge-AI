package com.taskforge.module.report.controller;

import com.taskforge.common.api.ApiResponse;
import com.taskforge.module.report.dto.ProjectReportResponse;
import com.taskforge.module.report.dto.TaskReportResponse;
import com.taskforge.module.report.dto.UserReportResponse;
import com.taskforge.module.report.service.ReportService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/reports")
@Tag(name = "Reports Management", description = "Endpoints for generating export-ready project, user, and task analytics reports")
public class ReportController {

    private final ReportService reportService;

    public ReportController(ReportService reportService) {
        this.reportService = reportService;
    }

    @GetMapping("/projects/{projectId}")
    @Operation(summary = "Generate project report", description = "Returns a project status and progress report summary")
    public ResponseEntity<ApiResponse<ProjectReportResponse>> getProjectReport(@PathVariable Long projectId) {
        ProjectReportResponse response = reportService.generateProjectReport(projectId);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @GetMapping("/users/{userId}")
    @Operation(summary = "Generate user report", description = "Returns a productivity and task completion report summary for a specific user ID")
    public ResponseEntity<ApiResponse<UserReportResponse>> getUserReport(@PathVariable Long userId) {
        UserReportResponse response = reportService.generateUserReport(userId);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @GetMapping("/tasks/{projectId}")
    @Operation(summary = "Generate tasks report", description = "Returns a task list and hours distribution analysis report for a specific project ID")
    public ResponseEntity<ApiResponse<TaskReportResponse>> getTaskReport(@PathVariable Long projectId) {
        TaskReportResponse response = reportService.generateTaskReport(projectId);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @GetMapping("/projects/{projectId}/weekly")
    @Operation(summary = "Generate weekly project report", description = "Returns project status update stats specifically compiled for the past 7 days")
    public ResponseEntity<ApiResponse<TaskReportResponse>> getWeeklyReport(@PathVariable Long projectId) {
        TaskReportResponse response = reportService.generateWeeklyReport(projectId);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @GetMapping("/projects/{projectId}/monthly")
    @Operation(summary = "Generate monthly project report", description = "Returns project status update stats specifically compiled for the past 30 days")
    public ResponseEntity<ApiResponse<TaskReportResponse>> getMonthlyReport(@PathVariable Long projectId) {
        TaskReportResponse response = reportService.generateMonthlyReport(projectId);
        return ResponseEntity.ok(ApiResponse.success(response));
    }
}
