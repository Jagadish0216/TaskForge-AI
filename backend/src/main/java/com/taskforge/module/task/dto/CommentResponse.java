package com.taskforge.module.task.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import java.time.LocalDateTime;

@Schema(description = "Response representation of a comment")
public record CommentResponse(
    Long id,
    String content,
    Long taskId,
    Long authorId,
    String authorName,
    String authorEmail,
    Long parentCommentId,
    boolean edited,
    boolean deleted,
    LocalDateTime createdAt,
    LocalDateTime updatedAt
) {}
