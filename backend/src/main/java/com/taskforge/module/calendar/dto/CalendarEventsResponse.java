package com.taskforge.module.calendar.dto;

import com.taskforge.module.task.dto.TaskResponse;
import io.swagger.v3.oas.annotations.media.Schema;

import java.util.List;

@Schema(description = "Response payload representing calendar task events")
public record CalendarEventsResponse(
    @Schema(description = "List of tasks mapped to calendar timeline")
    List<TaskResponse> tasks
) {}
