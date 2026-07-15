package com.taskforge.module.auth.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

/**
 * Request payload for user login.
 */
@Schema(description = "User login credentials")
public record LoginRequest(
    @Schema(description = "User's registered email address", example = "john.doe@example.com")
    @NotBlank(message = "Email is required")
    @Email(message = "Invalid email format")
    String email,

    @Schema(description = "User's password", example = "SecurePassword123")
    @NotBlank(message = "Password is required")
    String password
) {}
