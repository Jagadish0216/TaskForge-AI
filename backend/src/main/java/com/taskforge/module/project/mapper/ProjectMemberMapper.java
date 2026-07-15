package com.taskforge.module.project.mapper;

import com.taskforge.module.project.dto.ProjectInvitationResponse;
import com.taskforge.module.project.dto.ProjectMemberResponse;
import com.taskforge.module.project.entity.ProjectInvitation;
import com.taskforge.module.project.entity.ProjectMember;
import com.taskforge.module.user.mapper.UserMapper;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

import java.util.List;

/**
 * MapStruct mapper interface for converting ProjectMember and ProjectInvitation entity models to DTOs.
 */
@Mapper(componentModel = "spring", uses = {UserMapper.class, ProjectMapper.class})
public interface ProjectMemberMapper {

    /**
     * Maps ProjectMember entity to ProjectMemberResponse DTO.
     *
     * @param member project member entity
     * @return ProjectMemberResponse DTO
     */
    @Mapping(target = "projectId", source = "project.id")
    ProjectMemberResponse toResponse(ProjectMember member);

    /**
     * Maps ProjectInvitation entity to ProjectInvitationResponse DTO.
     *
     * @param invitation project invitation entity
     * @return ProjectInvitationResponse DTO
     */
    ProjectInvitationResponse toResponse(ProjectInvitation invitation);

    /**
     * Maps a list of ProjectMember entities to a list of ProjectMemberResponse DTOs.
     *
     * @param members list of project member entities
     * @return list of ProjectMemberResponse DTOs
     */
    List<ProjectMemberResponse> toResponseList(List<ProjectMember> members);

    /**
     * Maps a list of ProjectInvitation entities to a list of ProjectInvitationResponse DTOs.
     *
     * @param invitations list of project invitation entities
     * @return list of ProjectInvitationResponse DTOs
     */
    List<ProjectInvitationResponse> toInvitationResponseList(List<ProjectInvitation> invitations);
}
