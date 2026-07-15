package com.taskforge.module.task.mapper;

import com.taskforge.module.project.mapper.ProjectMapper;
import com.taskforge.module.task.dto.TaskCreateRequest;
import com.taskforge.module.task.dto.TaskResponse;
import com.taskforge.module.task.dto.TaskSummaryResponse;
import com.taskforge.module.task.entity.Task;
import com.taskforge.module.user.mapper.UserMapper;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

import java.util.List;

/**
 * MapStruct mapper interface for converting Task entity models to DTOs and Requests.
 */
@Mapper(componentModel = "spring", uses = {UserMapper.class, ProjectMapper.class})
public interface TaskMapper {

    /**
     * Maps Task entity to TaskResponse DTO.
     *
     * @param task task entity
     * @return TaskResponse DTO
     */
    TaskResponse toResponse(Task task);

    /**
     * Maps Task entity to TaskSummaryResponse DTO.
     *
     * @param task task entity
     * @return TaskSummaryResponse DTO
     */
    TaskSummaryResponse toSummaryResponse(Task task);

    /**
     * Maps TaskCreateRequest DTO to Task entity.
     *
     * @param request creation request payload
     * @return Task entity
     */
    @Mapping(target = "id", ignore = true)
    @Mapping(target = "project", ignore = true)
    @Mapping(target = "assignee", ignore = true)
    @Mapping(target = "completedDate", ignore = true)
    @Mapping(target = "actualHours", ignore = true)
    Task toEntity(TaskCreateRequest request);

    /**
     * Maps a list of Task entities to a list of TaskResponse DTOs.
     *
     * @param tasks list of task entities
     * @return list of TaskResponse DTOs
     */
    List<TaskResponse> toResponseList(List<Task> tasks);
}
