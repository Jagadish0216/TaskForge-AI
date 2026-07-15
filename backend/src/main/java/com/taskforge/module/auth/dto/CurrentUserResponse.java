package com.taskforge.module.auth.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import java.util.Set;

/**
 * Response payload containing current authenticated user profile details.
 */
@Schema(description = "Current user profile response payload")
public record CurrentUserResponse(
    @Schema(description = "Unique database identifier")
    Long id,

    @Schema(description = "User's email address")
    String email,

    @Schema(description = "User's first name")
    String firstName,

    @Schema(description = "User's last name")
    String lastName,

    @Schema(description = "Set of assigned roles")
    Set<String> roles
) {}
