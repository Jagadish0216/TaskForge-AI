package com.taskforge.module.user.dto;

import com.taskforge.common.constant.UserRole;
import io.swagger.v3.oas.annotations.media.Schema;

/**
 * Filter and search criteria for user queries.
 */
@Schema(description = "Criteria for searching and filtering users")
public record UserSearchRequest(
    @Schema(description = "Query string matching first name, last name, or email", example = "john")
    String keyword,

    @Schema(description = "Role identifier to filter by", example = "ROLE_TEAM_MEMBER")
    UserRole role,

    @Schema(description = "Filter by active status", example = "true")
    Boolean enabled,

    @Schema(description = "Filter by deleted status", example = "false")
    Boolean deleted
) {}
