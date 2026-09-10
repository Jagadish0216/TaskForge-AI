package com.taskforge.module.auth.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import java.util.List;

/**
 * Response payload containing user information and JWT tokens upon successful authentication.
 */
@Schema(description = "Authentication response payload containing user profile and JWT tokens")
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
    List<String> projects,

    @Schema(description = "JWT Access Token for authorization")
    String accessToken,

    @Schema(description = "JWT Refresh Token for renewing access")
    String refreshToken,

    @Schema(description = "Token type designation", example = "Bearer")
    String tokenType,

    @Schema(description = "User profile avatar URL")
    String avatarUrl
) {
    public AuthResponse(Long id, String name, String email, String role, List<String> projects, String accessToken, String refreshToken, String avatarUrl) {
        this(id, name, email, role, projects, accessToken, refreshToken, "Bearer", avatarUrl);
    }

    public AuthResponse(Long id, String name, String email, String role, List<String> projects) {
        this(id, name, email, role, projects, null, null, "Bearer", null);
    }
}
