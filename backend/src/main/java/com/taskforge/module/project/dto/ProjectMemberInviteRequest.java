package com.taskforge.module.project.dto;

import com.taskforge.common.constant.ProjectMemberRole;
import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

/**
 * Request payload for inviting a new member to a project.
 */
@Schema(description = "Request payload for inviting a project member")
public record ProjectMemberInviteRequest(
    @Schema(description = "Email address of the user to invite", example = "team.member@example.com")
    @NotBlank(message = "Email is required")
    @Email(message = "Invalid email format")
    String email,

    @Schema(description = "Role to assign to the member upon acceptance", example = "TEAM_MEMBER")
    @NotNull(message = "Role is required")
    ProjectMemberRole role
) {}
