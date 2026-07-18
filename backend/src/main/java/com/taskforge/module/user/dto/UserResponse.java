package com.taskforge.module.user.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import java.time.LocalDateTime;
import java.util.Set;

@Schema(description = "Detailed user profile response")
public record UserResponse(
    Long id,
    String email,
    String firstName,
    String lastName,
    boolean enabled,
    boolean deleted,
    Set<String> roles,
    LocalDateTime createdAt,
    LocalDateTime updatedAt,
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
