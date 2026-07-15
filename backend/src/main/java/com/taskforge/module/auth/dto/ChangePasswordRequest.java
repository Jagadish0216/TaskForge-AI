package com.taskforge.module.auth.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

/**
 * Request payload for changing user password.
 */
@Schema(description = "Change password request payload")
public record ChangePasswordRequest(
    @Schema(description = "Current active password", example = "SecurePassword123")
    @NotBlank(message = "Current password is required")
    String currentPassword,

    @Schema(description = "New password (min 6 characters)", example = "NewSecurePassword123")
    @NotBlank(message = "New password is required")
    @Size(min = 6, message = "New password must be at least 6 characters")
    String newPassword
) {}
