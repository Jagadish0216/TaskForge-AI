package com.taskforge.module.calendar.controller;

import com.taskforge.common.api.ApiResponse;
import com.taskforge.module.calendar.dto.CalendarEventsResponse;
import com.taskforge.module.calendar.service.CalendarService;
import com.taskforge.module.user.entity.User;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
@RestController
@RequestMapping("/calendar")
@Tag(name = "Calendar Events", description = "Endpoints for viewing task schedules by calendar timelines")
public class CalendarController {

    private final CalendarService calendarService;

    public CalendarController(CalendarService calendarService) {
        this.calendarService = calendarService;
    }

    @GetMapping("/today")
    @Operation(summary = "Get today's tasks", description = "Returns list of tasks due today for the active user")
    public ResponseEntity<ApiResponse<CalendarEventsResponse>> getTodayTasks() {
        User currentUser = calendarService.getCurrentAuthenticatedUser();
        CalendarEventsResponse response = calendarService.getTodayTasks(currentUser.getId());
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @GetMapping("/weekly")
    @Operation(summary = "Get this week's tasks", description = "Returns list of tasks due this week for the active user")
    public ResponseEntity<ApiResponse<CalendarEventsResponse>> getWeeklyTasks() {
        User currentUser = calendarService.getCurrentAuthenticatedUser();
        CalendarEventsResponse response = calendarService.getWeeklyTasks(currentUser.getId());
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @GetMapping("/monthly")
    @Operation(summary = "Get this month's tasks", description = "Returns list of tasks due this month for the active user")
    public ResponseEntity<ApiResponse<CalendarEventsResponse>> getMonthlyTasks() {
        User currentUser = calendarService.getCurrentAuthenticatedUser();
        CalendarEventsResponse response = calendarService.getMonthlyTasks(currentUser.getId());
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @GetMapping("/deadlines")
    @Operation(summary = "Get upcoming deadlines", description = "Returns upcoming non-completed tasks sorted by deadline dates")
    public ResponseEntity<ApiResponse<CalendarEventsResponse>> getUpcomingDeadlines() {
        User currentUser = calendarService.getCurrentAuthenticatedUser();
        CalendarEventsResponse response = calendarService.getUpcomingDeadlines(currentUser.getId());
        return ResponseEntity.ok(ApiResponse.success(response));
    }
}
