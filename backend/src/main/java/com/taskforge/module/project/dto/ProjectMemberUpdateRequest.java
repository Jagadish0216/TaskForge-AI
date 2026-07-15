package com.taskforge.module.project.dto;

import com.taskforge.common.constant.ProjectMemberRole;
import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotNull;

/**
 * Request payload for updating a project member's role.
 */
@Schema(description = "Request payload for updating project member role")
public record ProjectMemberUpdateRequest(
    @Schema(description = "Updated role to assign", example = "MANAGER")
    @NotNull(message = "Role is required")
    ProjectMemberRole role
) {}
