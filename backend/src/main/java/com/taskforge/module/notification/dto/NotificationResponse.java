package com.taskforge.module.notification.dto;

import com.taskforge.common.constant.NotificationType;
import io.swagger.v3.oas.annotations.media.Schema;

import java.time.LocalDateTime;

@Schema(description = "Response payload representing a notification")
public record NotificationResponse(
    Long id,
    String title,
    String message,
    NotificationType type,
    boolean isRead,
    LocalDateTime createdAt
) {}
