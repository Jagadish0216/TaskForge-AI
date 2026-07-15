package com.taskforge.module.notification.dto;

import io.swagger.v3.oas.annotations.media.Schema;

@Schema(description = "Response payload representing user notification preferences")
public record NotificationPreferenceResponse(
    boolean taskAssigned,
    boolean commentMention,
    boolean projectInvitation,
    boolean taskDeadline
) {}
