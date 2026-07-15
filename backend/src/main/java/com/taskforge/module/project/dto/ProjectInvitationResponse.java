package com.taskforge.module.project.dto;

import com.taskforge.common.constant.InvitationStatus;
import com.taskforge.common.constant.ProjectMemberRole;
import com.taskforge.module.user.dto.UserSummaryResponse;
import io.swagger.v3.oas.annotations.media.Schema;

import java.time.LocalDateTime;

/**
 * Response payload representing a project invitation.
 */
@Schema(description = "Detailed project invitation response")
public record ProjectInvitationResponse(
    @Schema(description = "Unique invitation identifier")
    Long id,

    @Schema(description = "Summary of the project being invited to")
    ProjectSummaryResponse project,

    @Schema(description = "User who sent the invitation")
    UserSummaryResponse inviter,

    @Schema(description = "User who received the invitation")
    UserSummaryResponse invitee,

    @Schema(description = "Assigned project member role upon acceptance")
    ProjectMemberRole role,

    @Schema(description = "Active status of the invitation")
    InvitationStatus status,

    @Schema(description = "Timestamp when invitation was generated")
    LocalDateTime createdAt
) {}
