package com.taskforge.module.user.controller;

import com.taskforge.common.api.ApiResponse;
import com.taskforge.module.user.dto.*;
import com.taskforge.module.user.service.UserService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

/**
 * REST controller exposing endpoints for User Profile Management, Administrative deactivation, and searching.
 */
@RestController
@RequestMapping("/users")
@Tag(name = "User Management Module", description = "Endpoints for managing user profiles, statistics, and administrative account statuses")
public class UserController {

    private final UserService userService;

    public UserController(UserService userService) {
        this.userService = userService;
    }

    /**
     * Retrieves the profile details of the currently authenticated user.
     *
     * @return current user profile details
     */
    @GetMapping("/me")
    @Operation(summary = "Get currently logged-in user profile", description = "Retrieves profile info for the currently authenticated user session.")
    public ResponseEntity<ApiResponse<UserResponse>> getMe() {
        UserResponse response = userService.getCurrentUserProfile();
        return ResponseEntity.ok(ApiResponse.success(response, "Profile retrieved successfully"));
    }

    /**
     * Updates profile details of the currently authenticated user.
     *
     * @param request update payload containing first and last name
     * @return updated user details
     */
    @PutMapping("/me")
    @Operation(summary = "Update logged-in user profile details", description = "Updates first name and last name for the currently authenticated user.")
    public ResponseEntity<ApiResponse<UserResponse>> updateMe(@Valid @RequestBody UpdateUserRequest request) {
        UserResponse response = userService.updateCurrentUserProfile(request);
        return ResponseEntity.ok(ApiResponse.success(response, "Profile updated successfully"));
    }

    /**
     * Retrieves usage statistics for the currently authenticated user.
     *
     * @return current user stats
     */
    @GetMapping("/me/statistics")
    @Operation(summary = "Get own user statistics", description = "Retrieves project and task counts for the currently logged-in user.")
    public ResponseEntity<ApiResponse<UserStatisticsResponse>> getMyStatistics() {
        UserResponse profile = userService.getCurrentUserProfile();
        UserStatisticsResponse response = userService.getUserStatistics(profile.id());
        return ResponseEntity.ok(ApiResponse.success(response, "Statistics retrieved successfully"));
    }

    /**
     * Gets a detailed user profile by ID. Restricted to Admin and Project Manager.
     *
     * @param id user ID
     * @return user profile details
     */
    @GetMapping("/{id}")
    @Operation(summary = "Get user by ID", description = "Retrieves detailed profile info for a user by ID. Requires ADMIN or PROJECT_MANAGER role.")
    public ResponseEntity<ApiResponse<UserResponse>> getUserById(@PathVariable Long id) {
        UserResponse response = userService.getUserById(id);
        return ResponseEntity.ok(ApiResponse.success(response, "User retrieved successfully"));
    }

    /**
     * Gets a detailed user profile by Email. Restricted to Admin and Project Manager.
     *
     * @param email user email address
     * @return user profile details
     */
    @GetMapping("/email")
    @Operation(summary = "Get user by Email", description = "Retrieves detailed profile info for a user by email address. Requires ADMIN or PROJECT_MANAGER role.")
    public ResponseEntity<ApiResponse<UserResponse>> getUserByEmail(@RequestParam String email) {
        UserResponse response = userService.getUserByEmail(email);
        return ResponseEntity.ok(ApiResponse.success(response, "User retrieved successfully"));
    }

    /**
     * Searches and lists users with pagination, sorting, and dynamic filtering.
     *
     * @param searchRequest search filters (keyword, role, enabled, deleted)
     * @param page          page number (0-indexed)
     * @param size          page size
     * @param sortBy        field to sort by
     * @param direction     sort direction (ASC/DESC)
     * @return paginated user search results
     */
    @PostMapping("/search")
    @Operation(summary = "Search and list users with pagination", description = "Search users using filter criteria with dynamic paging and sorting. Requires ADMIN or PROJECT_MANAGER role.")
    public ResponseEntity<ApiResponse<UserPageResponse>> searchUsers(
            @RequestBody UserSearchRequest searchRequest,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "id") String sortBy,
            @RequestParam(defaultValue = "ASC") String direction) {

        Sort sort = direction.equalsIgnoreCase("DESC") ? Sort.by(sortBy).descending() : Sort.by(sortBy).ascending();
        Pageable pageable = PageRequest.of(page, size, sort);
        UserPageResponse response = userService.searchUsers(searchRequest, pageable);
        return ResponseEntity.ok(ApiResponse.success(response, "User search executed successfully"));
    }

    /**
     * Retrieves statistics for any user. Restricted to Admin and Project Manager.
     *
     * @param id user ID
     * @return statistical counts for projects and tasks
     */
    @GetMapping("/{id}/statistics")
    @Operation(summary = "Get user statistics by ID", description = "Retrieves project and task counts for a specific user ID. Requires ADMIN or PROJECT_MANAGER role.")
    public ResponseEntity<ApiResponse<UserStatisticsResponse>> getUserStatistics(@PathVariable Long id) {
        UserStatisticsResponse response = userService.getUserStatistics(id);
        return ResponseEntity.ok(ApiResponse.success(response, "Statistics retrieved successfully"));
    }

    /**
     * Activates a user account. Restricted to Admin.
     *
     * @param id user ID
     * @return success response
     */
    @PostMapping("/{id}/activate")
    @Operation(summary = "Activate a user account", description = "Re-enables a deactivated user account. Requires ADMIN role.")
    public ResponseEntity<ApiResponse<Void>> activateUser(@PathVariable Long id) {
        userService.activateUser(id);
        return ResponseEntity.ok(ApiResponse.success(null, "User activated successfully"));
    }

    /**
     * Deactivates a user account. Restricted to Admin.
     *
     * @param id user ID
     * @return success response
     */
    @PostMapping("/{id}/deactivate")
    @Operation(summary = "Deactivate a user account", description = "Disables a user account. Prevents session authentication. Requires ADMIN role.")
    public ResponseEntity<ApiResponse<Void>> deactivateUser(@PathVariable Long id) {
        userService.deactivateUser(id);
        return ResponseEntity.ok(ApiResponse.success(null, "User deactivated successfully"));
    }

    /**
     * Soft deletes a user account. Restricted to Admin.
     *
     * @param id user ID
     * @return success response
     */
    @DeleteMapping("/{id}")
    @Operation(summary = "Soft delete a user account", description = "Soft deletes a user profile. Flags the record as deleted and disables login access. Requires ADMIN role.")
    public ResponseEntity<ApiResponse<Void>> deleteUser(@PathVariable Long id) {
        userService.softDeleteUser(id);
        return ResponseEntity.ok(ApiResponse.success(null, "User soft deleted successfully"));
    }
}
