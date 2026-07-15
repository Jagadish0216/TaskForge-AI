package com.taskforge.module.activity.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import java.util.List;

/**
 * Paginated list wrapper response for activity logs.
 */
@Schema(description = "Paginated wrapper response for activity records")
public record ActivityPageResponse(
    @Schema(description = "List of activity responses on the current page")
    List<ActivityResponse> content,

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
