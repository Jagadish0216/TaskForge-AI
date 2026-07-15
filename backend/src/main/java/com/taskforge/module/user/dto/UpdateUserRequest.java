package com.taskforge.module.user.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;

/**
 * Request payload to update user profile information.
 */
@Schema(description = "Update user profile request payload")
public record UpdateUserRequest(
    @Schema(description = "Updated first name", example = "Jane")
    @NotBlank(message = "First name is required")
    String firstName,

    @Schema(description = "Updated last name", example = "Smith")
    @NotBlank(message = "Last name is required")
    String lastName
) {}
