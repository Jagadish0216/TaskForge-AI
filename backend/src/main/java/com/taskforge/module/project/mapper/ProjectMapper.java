package com.taskforge.module.project.mapper;

import com.taskforge.module.project.dto.ProjectCreateRequest;
import com.taskforge.module.project.dto.ProjectResponse;
import com.taskforge.module.project.dto.ProjectSummaryResponse;
import com.taskforge.module.project.entity.Project;
import com.taskforge.module.user.mapper.UserMapper;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

import java.util.List;

/**
 * MapStruct mapper interface for converting Project entity models to DTOs and Requests.
 */
@Mapper(componentModel = "spring", uses = {UserMapper.class})
public interface ProjectMapper {

    /**
     * Maps Project entity to ProjectResponse DTO.
     *
     * @param project project entity
     * @return ProjectResponse DTO
     */
    ProjectResponse toResponse(Project project);

    /**
     * Maps Project entity to ProjectSummaryResponse DTO.
     *
     * @param project project entity
     * @return ProjectSummaryResponse DTO
     */
    ProjectSummaryResponse toSummaryResponse(Project project);

    /**
     * Maps ProjectCreateRequest DTO to Project entity.
     *
     * @param request creation request payload
     * @return Project entity
     */
    @Mapping(target = "id", ignore = true)
    @Mapping(target = "owner", ignore = true)
    @Mapping(target = "archived", ignore = true)
    Project toEntity(ProjectCreateRequest request);

    /**
     * Maps a list of Project entities to a list of ProjectResponse DTOs.
     *
     * @param projects list of project entities
     * @return list of ProjectResponse DTOs
     */
    List<ProjectResponse> toResponseList(List<Project> projects);
}
