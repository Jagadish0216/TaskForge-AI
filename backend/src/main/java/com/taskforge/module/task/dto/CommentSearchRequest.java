package com.taskforge.module.task.dto;

import io.swagger.v3.oas.annotations.media.Schema;

@Schema(description = "Search and filter criteria for comments")
public record CommentSearchRequest(
    @Schema(description = "Filter by task ID")
    Long taskId,

    @Schema(description = "Search keyword in comment content")
    String keyword,

    @Schema(description = "Include soft-deleted comments")
    Boolean includeDeleted
) {}
