package com.taskforge.module.task.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import java.util.List;

@Schema(description = "Paginated comments list response")
public record CommentPageResponse(
    List<CommentResponse> content,
    int pageNumber,
    int pageSize,
    int totalPages,
    long totalElements,
    boolean last
) {}
