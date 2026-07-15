package com.taskforge.module.ai.dto;

import jakarta.validation.constraints.NotBlank;

public record ChatRequest(
    @NotBlank(message = "Message is required")
    String message,
    Long projectId
) {}
