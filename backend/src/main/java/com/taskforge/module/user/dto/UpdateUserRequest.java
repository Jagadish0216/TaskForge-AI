package com.taskforge.module.user.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;

@Schema(description = "Update user profile request payload")
public record UpdateUserRequest(
    @NotBlank(message = "First name is required")
    String firstName,

    @NotBlank(message = "Last name is required")
    String lastName,

    String username,
    String phoneNumber,
    String gender,
    String country,
    String city,
    String language,
    String timezone,
    String department,
    String designation,
    String bio,
    String skills,
    String experienceLevel,
    String aiPreferences,
    String theme,
    String avatarUrl,
    java.time.LocalDate dateOfBirth
) {}
