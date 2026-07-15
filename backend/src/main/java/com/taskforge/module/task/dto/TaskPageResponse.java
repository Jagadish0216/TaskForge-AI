package com.taskforge.module.task.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import java.util.List;

/**
 * Paginated list wrapper response for tasks.
 */
@Schema(description = "Paginated wrapper response for task records")
public record TaskPageResponse(
    @Schema(description = "List of task responses on the current page")
    List<TaskResponse> content,

    @Schema(description = "Current page number (0-indexed)")
    int pageNumber,

    @Schema(description = "Number of records per page")
    int pageSize,

    @Schema(description = "Total number of pages available")
    int totalPages,

    @Schema(description = "Total number of records matching criteria")
    long totalElements,

    @Schema(description = "Flag indicating if this is the last page")
    boolean last
) {}
