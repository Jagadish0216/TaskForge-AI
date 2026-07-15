package com.taskforge.module.user.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import java.util.List;

/**
 * Paginated list wrapper response for users.
 */
@Schema(description = "Paginated wrapper response for user records")
public record UserPageResponse(
    @Schema(description = "List of user responses on the current page")
    List<UserResponse> content,

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
