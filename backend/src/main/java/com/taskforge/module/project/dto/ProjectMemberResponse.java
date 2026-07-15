package com.taskforge.module.project.dto;

import com.taskforge.common.constant.ProjectMemberRole;
import com.taskforge.module.user.dto.UserSummaryResponse;
import io.swagger.v3.oas.annotations.media.Schema;

import java.time.LocalDateTime;

/**
 * Response payload representing a project member.
 */
@Schema(description = "Detailed project member response")
public record ProjectMemberResponse(
    @Schema(description = "Unique database identifier of the project member record")
    Long id,

    @Schema(description = "Project ID parent reference")
    Long projectId,

    @Schema(description = "User summary profile details")
    UserSummaryResponse user,

    @Schema(description = "Assigned member role in this project")
    ProjectMemberRole role,

    @Schema(description = "Timestamp when the user joined the project")
    LocalDateTime createdAt
) {}
