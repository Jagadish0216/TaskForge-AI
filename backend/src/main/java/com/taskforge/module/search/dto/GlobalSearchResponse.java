package com.taskforge.module.search.dto;

import com.taskforge.module.project.dto.ProjectResponse;
import com.taskforge.module.task.dto.CommentResponse;
import com.taskforge.module.task.dto.TaskResponse;
import com.taskforge.module.user.dto.UserResponse;
import io.swagger.v3.oas.annotations.media.Schema;

import java.util.List;

@Schema(description = "Response payload representing global multi-entity keyword search results")
public record GlobalSearchResponse(
    List<ProjectResponse> projects,
    List<TaskResponse> tasks,
    List<UserResponse> users,
    List<CommentResponse> comments
) {}
