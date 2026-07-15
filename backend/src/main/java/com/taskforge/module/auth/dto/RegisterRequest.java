package com.taskforge.module.auth.dto;

import com.taskforge.common.constant.UserRole;
import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

/**
 * Request payload for user registration.
 */
@Schema(description = "User registration request payload")
public record RegisterRequest(
    @Schema(description = "User's email address", example = "john.doe@example.com")
    @NotBlank(message = "Email is required")
    @Email(message = "Invalid email format")
    String email,

    @Schema(description = "User's password (min 6 characters)", example = "SecurePassword123")
    @NotBlank(message = "Password is required")
    @Size(min = 6, message = "Password must be at least 6 characters")
    String password,

    @Schema(description = "User's first name", example = "John")
    @NotBlank(message = "First name is required")
    String firstName,

    @Schema(description = "User's last name", example = "Doe")
    @NotBlank(message = "Last name is required")
    String lastName,

    @Schema(description = "Desired user role", example = "ROLE_TEAM_MEMBER")
    @NotNull(message = "Role is required")
    UserRole role
) {}
