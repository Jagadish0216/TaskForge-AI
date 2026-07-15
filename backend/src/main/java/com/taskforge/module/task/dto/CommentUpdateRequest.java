package com.taskforge.module.task.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;

@Schema(description = "Request payload for updating a comment")
public record CommentUpdateRequest(
    @Schema(description = "Updated comment content", example = "This is the updated content")
    @NotBlank(message = "Comment content is required")
    String content
) {}
