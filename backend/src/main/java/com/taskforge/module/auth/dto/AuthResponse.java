package com.taskforge.module.auth.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import java.util.List;

/**
 * Response payload containing user information upon successful login.
 */
@Schema(description = "Authentication response profile details")
public record AuthResponse(
    @Schema(description = "Unique user database identifier")
    Long id,

    @Schema(description = "User's full name")
    String name,

    @Schema(description = "User's registered email address")
    String email,

    @Schema(description = "User's primary role")
    String role,

    @Schema(description = "List of project names the user belongs to")
    List<String> projects
) {}
