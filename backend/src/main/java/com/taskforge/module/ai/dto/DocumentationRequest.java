package com.taskforge.module.ai.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record DocumentationRequest(
    @NotNull(message = "Project ID is required")
    Long projectId,
    @NotBlank(message = "Document type is required")
    String docType
) {}
