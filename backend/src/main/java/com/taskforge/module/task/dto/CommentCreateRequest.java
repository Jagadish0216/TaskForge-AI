package com.taskforge.module.task.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

@Schema(description = "Request payload for creating a comment")
public record CommentCreateRequest(
    @Schema(description = "Comment content", example = "This is a comment on the task")
    @NotBlank(message = "Comment content is required")
    String content,

    @Schema(description = "ID of the target task")
    @NotNull(message = "Task ID is required")
    Long taskId,

    @Schema(description = "Optional parent comment ID for replies")
    Long parentCommentId
) {}
