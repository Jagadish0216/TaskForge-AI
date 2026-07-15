package com.taskforge.module.user.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import java.time.LocalDateTime;
import java.util.Set;

/**
 * Detailed representation of a user profile response.
 */
@Schema(description = "Detailed user profile response")
public record UserResponse(
    @Schema(description = "Unique identifier of the user")
    Long id,

    @Schema(description = "Email address")
    String email,

    @Schema(description = "First name")
    String firstName,

    @Schema(description = "Last name")
    String lastName,

    @Schema(description = "Flag indicating if account is active")
    boolean enabled,

    @Schema(description = "Flag indicating if account is soft-deleted")
    boolean deleted,

    @Schema(description = "Assigned roles")
    Set<String> roles,

    @Schema(description = "Profile creation timestamp")
    LocalDateTime createdAt,

    @Schema(description = "Profile last updated timestamp")
    LocalDateTime updatedAt
) {}
