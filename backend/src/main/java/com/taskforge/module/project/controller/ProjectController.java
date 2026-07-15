package com.taskforge.module.project.controller;

import com.taskforge.common.api.ApiResponse;
import com.taskforge.module.project.dto.*;
import com.taskforge.module.project.service.ProjectService;
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
 * REST controller exposing endpoints for Project Management: CRUD operations, statistics, searching, and archiving.
 */
@RestController
@RequestMapping("/projects")
@Tag(name = "Project Management Module", description = "Endpoints for managing project lifecycle, details, statistics, and access parameters")
public class ProjectController {

    private final ProjectService projectService;

    public ProjectController(ProjectService projectService) {
        this.projectService = projectService;
    }

    /**
     * Creates a new project. Restricted to ADMIN and PROJECT_MANAGER.
     *
     * @param request project creation request payload
     * @return project details response wrapped in ApiResponse
     */
    @PostMapping
    @Operation(summary = "Create a new project", description = "Creates a new project profile. Automatically registers the creator as the project Owner. Requires ADMIN or PROJECT_MANAGER role.")
    public ResponseEntity<ApiResponse<ProjectResponse>> createProject(@Valid @RequestBody ProjectCreateRequest request) {
        ProjectResponse response = projectService.createProject(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(response, "Project created successfully"));
    }

    /**
     * Gets project details by ID with visibility checks.
     *
     * @param id project ID
     * @return project details response wrapped in ApiResponse
     */
    @GetMapping("/{id}")
    @Operation(summary = "Get project by ID", description = "Retrieves detailed information of a project. Team members can only view projects they belong to.")
    public ResponseEntity<ApiResponse<ProjectResponse>> getProjectById(@PathVariable Long id) {
        ProjectResponse response = projectService.getProjectById(id);
        return ResponseEntity.ok(ApiResponse.success(response, "Project retrieved successfully"));
    }

    /**
     * Gets project details by Key with visibility checks.
     *
     * @param key project key string
     * @return project details response wrapped in ApiResponse
     */
    @GetMapping("/key/{key}")
    @Operation(summary = "Get project by unique key", description = "Retrieves detailed project info using its project key. Team members can only view projects they belong to.")
    public ResponseEntity<ApiResponse<ProjectResponse>> getProjectByKey(@PathVariable String key) {
        ProjectResponse response = projectService.getProjectByProjectKey(key);
        return ResponseEntity.ok(ApiResponse.success(response, "Project retrieved successfully"));
    }

    /**
     * Searches and lists projects with pagination, sorting, and filters.
     *
     * @param searchRequest search filters
     * @param page          page number (0-indexed)
     * @param size          page size
     * @param sortBy        field to sort by
     * @param direction     sort direction (ASC/DESC)
     * @return paginated projects search results
     */
    @PostMapping("/search")
    @Operation(summary = "Search and list projects with pagination", description = "Fuzzy search projects based on name or key with dynamic filtering. Team members only see projects they belong to.")
    public ResponseEntity<ApiResponse<ProjectPageResponse>> searchProjects(
            @RequestBody ProjectSearchRequest searchRequest,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "id") String sortBy,
            @RequestParam(defaultValue = "ASC") String direction) {

        Sort sort = direction.equalsIgnoreCase("DESC") ? Sort.by(sortBy).descending() : Sort.by(sortBy).ascending();
        Pageable pageable = PageRequest.of(page, size, sort);
        ProjectPageResponse response = projectService.searchProjects(searchRequest, pageable);
        return ResponseEntity.ok(ApiResponse.success(response, "Project search executed successfully"));
    }

    /**
     * Updates an existing project. Restricted to ADMIN and PROJECT_MANAGER.
     *
     * @param id      project ID
     * @param request update payload
     * @return updated project response wrapped in ApiResponse
     */
    @PutMapping("/{id}")
    @Operation(summary = "Update project details", description = "Modifies project metadata. Project Managers can only update projects they own. Requires ADMIN or PROJECT_MANAGER role.")
    public ResponseEntity<ApiResponse<ProjectResponse>> updateProject(
            @PathVariable Long id,
            @Valid @RequestBody ProjectUpdateRequest request) {
        ProjectResponse response = projectService.updateProject(id, request);
        return ResponseEntity.ok(ApiResponse.success(response, "Project updated successfully"));
    }

    /**
     * Archives a project. Restricted to ADMIN and PROJECT_MANAGER.
     *
     * @param id project ID
     * @return success response wrapped in ApiResponse
     */
    @PostMapping("/{id}/archive")
    @Operation(summary = "Archive a project", description = "Sets project archived status to true. Project Managers can only archive projects they own. Requires ADMIN or PROJECT_MANAGER role.")
    public ResponseEntity<ApiResponse<Void>> archiveProject(@PathVariable Long id) {
        projectService.archiveProject(id);
        return ResponseEntity.ok(ApiResponse.success(null, "Project archived successfully"));
    }

    /**
     * Restores an archived project. Restricted to ADMIN and PROJECT_MANAGER.
     *
     * @param id project ID
     * @return success response wrapped in ApiResponse
     */
    @PostMapping("/{id}/restore")
    @Operation(summary = "Restore an archived project", description = "Restores project archived status to false. Project Managers can only restore projects they own. Requires ADMIN or PROJECT_MANAGER role.")
    public ResponseEntity<ApiResponse<Void>> restoreProject(@PathVariable Long id) {
        projectService.restoreProject(id);
        return ResponseEntity.ok(ApiResponse.success(null, "Project restored successfully"));
    }

    /**
     * Permanently deletes a project. Restricted to ADMIN and PROJECT_MANAGER.
     *
     * @param id project ID
     * @return success response wrapped in ApiResponse
     */
    @DeleteMapping("/{id}")
    @Operation(summary = "Permanently delete a project", description = "Deletes project from database. Project Managers can only delete projects they own. Requires ADMIN or PROJECT_MANAGER role.")
    public ResponseEntity<ApiResponse<Void>> deleteProject(@PathVariable Long id) {
        projectService.deleteProject(id);
        return ResponseEntity.ok(ApiResponse.success(null, "Project permanently deleted successfully"));
    }

    /**
     * Retrieves statistics metadata overview for a specific project.
     *
     * @param id project ID
     * @return project statistics wrapped in ApiResponse
     */
    @GetMapping("/{id}/statistics")
    @Operation(summary = "Get project statistics by ID", description = "Retrieves member count, task count, and progress percentages of a project.")
    public ResponseEntity<ApiResponse<ProjectStatisticsResponse>> getProjectStatistics(@PathVariable Long id) {
        ProjectStatisticsResponse response = projectService.getProjectStatistics(id);
        return ResponseEntity.ok(ApiResponse.success(response, "Project statistics retrieved successfully"));
    }
}
