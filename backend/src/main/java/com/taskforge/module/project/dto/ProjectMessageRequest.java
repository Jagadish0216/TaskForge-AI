package com.taskforge.module.project.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;

@Schema(description = "Request body to post a project discussion message")
public record ProjectMessageRequest(
    @NotBlank(message = "Message cannot be empty")
    @Schema(description = "Content of the message", example = "Let's align on task completion dates.")
    String message
) {}
