package com.taskforge.module.notification.controller;

import com.taskforge.common.api.ApiResponse;
import com.taskforge.module.notification.dto.NotificationPreferenceResponse;
import com.taskforge.module.notification.dto.NotificationPreferenceUpdateRequest;
import com.taskforge.module.notification.dto.NotificationResponse;
import com.taskforge.module.notification.service.NotificationService;
import com.taskforge.module.user.entity.User;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/notifications")
@Tag(name = "Notification Management", description = "Endpoints for user notifications and preferences")
public class NotificationController {

    private final NotificationService notificationService;

    public NotificationController(NotificationService notificationService) {
        this.notificationService = notificationService;
    }

    @GetMapping
    @Operation(summary = "Get current user notifications", description = "Returns a paginated list of notifications for the active user")
    public ResponseEntity<ApiResponse<Page<NotificationResponse>>> getNotifications(Pageable pageable) {
        User currentUser = notificationService.getCurrentAuthenticatedUser();
        Page<NotificationResponse> notifications = notificationService.getNotifications(currentUser.getId(), pageable);
        return ResponseEntity.ok(ApiResponse.success(notifications));
    }

    @PostMapping("/{id}/read")
    @Operation(summary = "Mark notification as read", description = "Sets the isRead flag of a specific notification to true")
    public ResponseEntity<ApiResponse<Void>> markAsRead(@PathVariable Long id) {
        notificationService.markAsRead(id);
        return ResponseEntity.ok(ApiResponse.success(null, "Notification marked as read"));
    }

    @PostMapping("/read-all")
    @Operation(summary = "Mark all notifications as read", description = "Marks all unread notifications for the active user as read")
    public ResponseEntity<ApiResponse<Void>> markAllAsRead() {
        User currentUser = notificationService.getCurrentAuthenticatedUser();
        notificationService.markAllAsRead(currentUser.getId());
        return ResponseEntity.ok(ApiResponse.success(null, "All notifications marked as read"));
    }

    @GetMapping("/unread-count")
    @Operation(summary = "Get unread notifications count", description = "Returns the count of unread notifications for the active user")
    public ResponseEntity<ApiResponse<Long>> getUnreadCount() {
        User currentUser = notificationService.getCurrentAuthenticatedUser();
        long count = notificationService.getUnreadCount(currentUser.getId());
        return ResponseEntity.ok(ApiResponse.success(count));
    }

    @GetMapping("/preferences")
    @Operation(summary = "Get notification preferences", description = "Returns notification preference flags for the active user")
    public ResponseEntity<ApiResponse<NotificationPreferenceResponse>> getPreferences() {
        User currentUser = notificationService.getCurrentAuthenticatedUser();
        NotificationPreferenceResponse preferences = notificationService.getPreferences(currentUser.getId());
        return ResponseEntity.ok(ApiResponse.success(preferences));
    }

    @PutMapping("/preferences")
    @Operation(summary = "Update notification preferences", description = "Updates notification preference flags for the active user")
    public ResponseEntity<ApiResponse<NotificationPreferenceResponse>> updatePreferences(
            @RequestBody NotificationPreferenceUpdateRequest request) {
        User currentUser = notificationService.getCurrentAuthenticatedUser();
        NotificationPreferenceResponse updated = notificationService.updatePreferences(currentUser.getId(), request);
        return ResponseEntity.ok(ApiResponse.success(updated, "Preferences updated successfully"));
    }
}
