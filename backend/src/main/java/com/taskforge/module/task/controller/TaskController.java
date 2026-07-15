package com.taskforge.module.task.controller;

import com.taskforge.common.api.ApiResponse;
import com.taskforge.module.task.dto.*;
import com.taskforge.module.task.service.TaskService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

/**
 * REST controller exposing endpoints for Task Management: CRUD operations, assignments, statistics, and searching.
 */
@RestController
@RequestMapping("/tasks")
@Tag(name = "Task Management Module", description = "Endpoints for managing task lifecycle, assignments, progress statistics, and queries")
public class TaskController {

    private final TaskService taskService;

    public TaskController(TaskService taskService) {
        this.taskService = taskService;
    }

    /**
     * Creates a new task. Restricted to ADMIN and PROJECT_MANAGER roles.
     *
     * @param request task creation payload
     * @return created task details wrapped in ApiResponse
     */
    @PostMapping
    @Operation(summary = "Create a new task", description = "Creates a new task within a project. Assignee must be a project member. Requires ADMIN or PROJECT_MANAGER role.")
    public ResponseEntity<ApiResponse<TaskResponse>> createTask(@Valid @RequestBody TaskCreateRequest request) {
        TaskResponse response = taskService.createTask(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(response, "Task created successfully"));
    }

    /**
     * Retrieves task details by ID with visibility checks.
     *
     * @param id task ID
     * @return task details wrapped in ApiResponse
     */
    @GetMapping("/{id}")
    @Operation(summary = "Get task by ID", description = "Retrieves detailed information of a task. Team members can only view tasks assigned to them.")
    public ResponseEntity<ApiResponse<TaskResponse>> getTaskById(@PathVariable Long id) {
        TaskResponse response = taskService.getTaskById(id);
        return ResponseEntity.ok(ApiResponse.success(response, "Task retrieved successfully"));
    }

    /**
     * Updates an existing task. Accessible to all roles (Team members can only update status/actual hours of their assigned tasks).
     *
     * @param id      task ID
     * @param request update payload
     * @return updated task details wrapped in ApiResponse
     */
    @PutMapping("/{id}")
    @Operation(summary = "Update task details", description = "Modifies task details. Team members can only update status and actual hours on tasks assigned to them.")
    public ResponseEntity<ApiResponse<TaskResponse>> updateTask(
            @PathVariable Long id,
            @Valid @RequestBody TaskUpdateRequest request) {
        TaskResponse response = taskService.updateTask(id, request);
        return ResponseEntity.ok(ApiResponse.success(response, "Task updated successfully"));
    }

    /**
     * Permanently deletes a task. Restricted to ADMIN and PROJECT_MANAGER roles.
     *
     * @param id task ID
     * @return success response wrapped in ApiResponse
     */
    @DeleteMapping("/{id}")
    @Operation(summary = "Permanently delete a task", description = "Deletes task from database. PMs can only delete tasks in projects they own. Requires ADMIN or PROJECT_MANAGER role.")
    public ResponseEntity<ApiResponse<Void>> deleteTask(@PathVariable Long id) {
        taskService.deleteTask(id);
        return ResponseEntity.ok(ApiResponse.success(null, "Task permanently deleted successfully"));
    }

    /**
     * Assigns or reassigns a user to a task. Restricted to ADMIN and PROJECT_MANAGER roles.
     *
     * @param id     task ID
     * @param userId user ID to assign, or null to unassign
     * @return updated task details wrapped in ApiResponse
     */
    @PutMapping("/{id}/assign")
    @Operation(summary = "Assign or reassign task assignee", description = "Updates assignee of a task. User must be a project member. Requires ADMIN or PROJECT_MANAGER role.")
    public ResponseEntity<ApiResponse<TaskResponse>> assignUser(
            @PathVariable Long id,
            @RequestParam(required = false) Long userId) {
        TaskResponse response = taskService.assignUser(id, userId);
        return ResponseEntity.ok(ApiResponse.success(response, "Task assignee updated successfully"));
    }

    /**
     * Searches and lists tasks with pagination, sorting, and dynamic filters.
     *
     * @param searchRequest search criteria filters
     * @param page          page number (0-indexed)
     * @param size          page size
     * @param sortBy        field to sort by
     * @param direction     sort direction (ASC/DESC)
     * @return paginated task list results wrapped in ApiResponse
     */
    @PostMapping("/search")
    @Operation(summary = "Search and list tasks with pagination", description = "Fuzzy search tasks. Team members only retrieve tasks assigned to them.")
    public ResponseEntity<ApiResponse<TaskPageResponse>> searchTasks(
            @RequestBody TaskSearchRequest searchRequest,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "id") String sortBy,
            @RequestParam(defaultValue = "ASC") String direction) {

        Sort sort = direction.equalsIgnoreCase("DESC") ? Sort.by(sortBy).descending() : Sort.by(sortBy).ascending();
        Pageable pageable = PageRequest.of(page, size, sort);
        TaskPageResponse response = taskService.searchTasks(searchRequest, pageable);
        return ResponseEntity.ok(ApiResponse.success(response, "Task search executed successfully"));
    }

    /**
     * Retrieves statistics metadata overview of tasks.
     *
     * @param projectId  optional filter by parent project
     * @param assigneeId optional filter by assignee user (Team members are restricted to their own stats)
     * @return task statistics wrapped in ApiResponse
     */
    @GetMapping("/statistics")
    @Operation(summary = "Get task statistics overview", description = "Retrieves total tasks, completed, pending, and overdue counts. Team members are restricted to their own statistics.")
    public ResponseEntity<ApiResponse<TaskStatisticsResponse>> getTaskStatistics(
            @RequestParam(required = false) Long projectId,
            @RequestParam(required = false) Long assigneeId) {
        TaskStatisticsResponse response = taskService.getTaskStatistics(projectId, assigneeId);
        return ResponseEntity.ok(ApiResponse.success(response, "Task statistics retrieved successfully"));
    }
}
