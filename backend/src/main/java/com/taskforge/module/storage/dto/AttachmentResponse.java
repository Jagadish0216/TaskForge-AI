package com.taskforge.module.storage.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import java.time.LocalDateTime;

@Schema(description = "Response payload representing an attachment")
public record AttachmentResponse(
    Long id,
    String fileName,
    String fileType,
    Long fileSize,
    String filePath,
    Long taskId,
    Long projectId,
    Long uploadedById,
    String uploadedByName,
    LocalDateTime createdAt
) {}
