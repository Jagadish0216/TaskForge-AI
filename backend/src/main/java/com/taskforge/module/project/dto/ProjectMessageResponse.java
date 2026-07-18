package com.taskforge.module.project.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import java.time.LocalDateTime;

@Schema(description = "Response containing discussion message details")
public record ProjectMessageResponse(
    Long id,
    Long projectId,
    Long senderId,
    String senderEmail,
    String senderName,
    String senderAvatarUrl,
    String message,
    LocalDateTime createdAt,
    boolean edited,
    boolean deleted
) {}
