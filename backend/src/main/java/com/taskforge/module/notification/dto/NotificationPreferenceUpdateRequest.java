package com.taskforge.module.notification.dto;

import io.swagger.v3.oas.annotations.media.Schema;

@Schema(description = "Request payload to update notification preferences")
public record NotificationPreferenceUpdateRequest(
    @Schema(description = "Enable/disable task assignment notifications")
    Boolean taskAssigned,

    @Schema(description = "Enable/disable comment mention notifications")
    Boolean commentMention,

    @Schema(description = "Enable/disable project invitation notifications")
    Boolean projectInvitation,

    @Schema(description = "Enable/disable task deadline notifications")
    Boolean taskDeadline
) {}
