package com.taskforge.module.user.dto;

import io.swagger.v3.oas.annotations.media.Schema;

/**
 * Lightweight summary of a user profile.
 */
@Schema(description = "Lightweight user profile summary")
public record UserSummaryResponse(
    @Schema(description = "Unique identifier of the user")
    Long id,

    @Schema(description = "Email address")
    String email,

    @Schema(description = "First name")
    String firstName,

    @Schema(description = "Last name")
    String lastName
) {}
