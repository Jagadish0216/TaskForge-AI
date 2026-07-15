package com.taskforge.module.activity.controller;

import com.taskforge.common.api.ApiResponse;
import com.taskforge.module.activity.dto.ActivityPageResponse;
import com.taskforge.module.activity.dto.ActivitySearchRequest;
import com.taskforge.module.activity.service.ActivityService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

/**
 * REST controller exposing endpoints for retrieving Activity Timelines (project-specific, user-specific, search/filter queries).
 */
@RestController
@RequestMapping("/activities")
@Tag(name = "Activity Timeline Module", description = "Endpoints for querying project action history, user events, and global audit logging")
public class ActivityController {

    private final ActivityService activityService;

    public ActivityController(ActivityService activityService) {
        this.activityService = activityService;
    }

    /**
     * Searches and lists activity logs dynamically based on search criteria.
     *
     * @param searchRequest search filters (type, project, user, task, keyword)
     * @param page          page number (0-indexed)
     * @param size          page size
     * @param sortBy        field to sort by
     * @param direction     sort direction (ASC/DESC)
     * @return paginated activity search results wrapped in ApiResponse
     */
    @PostMapping("/search")
    @Operation(summary = "Search activity timeline logs", description = "Searches and filters activity logs globally. Requires ADMIN or PROJECT_MANAGER role.")
    public ResponseEntity<ApiResponse<ActivityPageResponse>> searchActivities(
            @RequestBody ActivitySearchRequest searchRequest,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "id") String sortBy,
            @RequestParam(defaultValue = "DESC") String direction) {

        Sort sort = direction.equalsIgnoreCase("DESC") ? Sort.by(sortBy).descending() : Sort.by(sortBy).ascending();
        Pageable pageable = PageRequest.of(page, size, sort);
        ActivityPageResponse response = activityService.searchActivities(searchRequest, pageable);
        return ResponseEntity.ok(ApiResponse.success(response, "Activity logs search executed successfully"));
    }

    /**
     * Retrieves the paginated activity timeline for a project. Accessible only to project members and admins.
     *
     * @param projectId project ID
     * @param page      page number (0-indexed)
     * @param size      page size
     * @param direction sort direction (ASC/DESC)
     * @return paginated list of project activities wrapped in ApiResponse
     */
    @GetMapping("/projects/{projectId}")
    @Operation(summary = "Get project activity timeline", description = "Retrieves the action history logs for a specific project. Accessible only to project members and admins.")
    public ResponseEntity<ApiResponse<ActivityPageResponse>> getProjectTimeline(
            @PathVariable Long projectId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "DESC") String direction) {

        Sort sort = direction.equalsIgnoreCase("DESC") ? Sort.by("id").descending() : Sort.by("id").ascending();
        Pageable pageable = PageRequest.of(page, size, sort);
        ActivityPageResponse response = activityService.getProjectActivityTimeline(projectId, pageable);
        return ResponseEntity.ok(ApiResponse.success(response, "Project timeline retrieved successfully"));
    }

    /**
     * Retrieves the paginated activity timeline performed by a user.
     *
     * @param userId    user ID
     * @param page      page number (0-indexed)
     * @param size      page size
     * @param direction sort direction (ASC/DESC)
     * @return paginated list of user activities wrapped in ApiResponse
     */
    @GetMapping("/users/{userId}")
    @Operation(summary = "Get user activity timeline", description = "Retrieves all activities performed by a specific user. Requires ADMIN or PROJECT_MANAGER role.")
    public ResponseEntity<ApiResponse<ActivityPageResponse>> getUserTimeline(
            @PathVariable Long userId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "DESC") String direction) {

        Sort sort = direction.equalsIgnoreCase("DESC") ? Sort.by("id").descending() : Sort.by("id").ascending();
        Pageable pageable = PageRequest.of(page, size, sort);
        ActivityPageResponse response = activityService.getUserActivityTimeline(userId, pageable);
        return ResponseEntity.ok(ApiResponse.success(response, "User timeline retrieved successfully"));
    }

    /**
     * Retrieves the most recent activities matching optional global criteria.
     *
     * @param page      page number (0-indexed)
     * @param size      page size
     * @return paginated list of recent activities wrapped in ApiResponse
     */
    @GetMapping("/recent")
    @Operation(summary = "Get recent activities feed", description = "Retrieves a feed of the most recent system activities. Requires ADMIN or PROJECT_MANAGER role.")
    public ResponseEntity<ApiResponse<ActivityPageResponse>> getRecentActivities(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {

        Pageable pageable = PageRequest.of(page, size, Sort.by("id").descending());
        ActivityPageResponse response = activityService.searchActivities(new ActivitySearchRequest(null, null, null, null, null), pageable);
        return ResponseEntity.ok(ApiResponse.success(response, "Recent activities retrieved successfully"));
    }
}
