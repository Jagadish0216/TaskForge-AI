package com.taskforge.module.task.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import java.time.LocalDateTime;

@Schema(description = "Response payload representing a comment edit history entry")
public record CommentHistoryResponse(
    Long id,
    String oldContent,
    LocalDateTime editedAt,
    Long editedById,
    String editedByName
) {}
