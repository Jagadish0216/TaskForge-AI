package com.taskforge.module.activity.mapper;

import com.taskforge.module.activity.dto.ActivityResponse;
import com.taskforge.module.activity.dto.ActivitySummaryResponse;
import com.taskforge.module.activity.entity.ActivityLog;
import com.taskforge.module.project.mapper.ProjectMapper;
import com.taskforge.module.task.mapper.TaskMapper;
import com.taskforge.module.user.mapper.UserMapper;
import org.mapstruct.Mapper;

import java.util.List;

/**
 * MapStruct mapper interface for converting ActivityLog entity models to DTOs.
 */
@Mapper(componentModel = "spring", uses = {UserMapper.class, ProjectMapper.class, TaskMapper.class})
public interface ActivityMapper {

    /**
     * Maps ActivityLog entity to ActivityResponse DTO.
     *
     * @param log activity log entity
     * @return ActivityResponse DTO
     */
    ActivityResponse toResponse(ActivityLog log);

    /**
     * Maps ActivityLog entity to ActivitySummaryResponse DTO.
     *
     * @param log activity log entity
     * @return ActivitySummaryResponse DTO
     */
    ActivitySummaryResponse toSummaryResponse(ActivityLog log);

    /**
     * Maps a list of ActivityLog entities to a list of ActivityResponse DTOs.
     *
     * @param logs list of activity log entities
     * @return list of ActivityResponse DTOs
     */
    List<ActivityResponse> toResponseList(List<ActivityLog> logs);
}
