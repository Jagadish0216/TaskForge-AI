package com.taskforge.module.dashboard.controller;

import com.taskforge.common.api.ApiResponse;
import com.taskforge.module.dashboard.dto.DashboardStatsResponse;
import com.taskforge.module.dashboard.service.DashboardService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/dashboard")
@Tag(name = "Dashboard Management", description = "Endpoints for project summary analytics and widgets")
public class DashboardController {

    private final DashboardService dashboardService;

    public DashboardController(DashboardService dashboardService) {
        this.dashboardService = dashboardService;
    }

    @GetMapping("/summary")
    @Operation(summary = "Get workspace dashboard stats", description = "Returns summary metrics including project health, overdue task status, task status distribution, team productivity, and upcoming deadlines")
    public ResponseEntity<ApiResponse<DashboardStatsResponse>> getDashboardSummary() {
        DashboardStatsResponse response = dashboardService.getDashboardSummary();
        return ResponseEntity.ok(ApiResponse.success(response));
    }
}
