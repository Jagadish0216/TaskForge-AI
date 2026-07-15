package com.taskforge.module.ai.dto;

import io.swagger.v3.oas.annotations.media.Schema;

@Schema(description = "Response payload containing AI generated content")
public record AIResponse(
    @Schema(description = "Generated text content")
    String generatedContent
) {}
