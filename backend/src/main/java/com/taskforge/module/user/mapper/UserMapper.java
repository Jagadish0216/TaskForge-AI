package com.taskforge.module.user.mapper;

import com.taskforge.module.user.dto.UserResponse;
import com.taskforge.module.user.dto.UserSummaryResponse;
import com.taskforge.module.user.entity.Role;
import com.taskforge.module.user.entity.User;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.Named;

import java.util.Collections;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

/**
 * MapStruct mapper interface for converting User entity models to DTOs.
 */
@Mapper(componentModel = "spring")
public interface UserMapper {

    /**
     * Maps User entity to UserResponse DTO.
     *
     * @param user user entity
     * @return UserResponse DTO
     */
    @Mapping(target = "roles", source = "roles", qualifiedByName = "mapRolesToStrings")
    UserResponse toResponse(User user);

    /**
     * Maps User entity to UserSummaryResponse DTO.
     *
     * @param user user entity
     * @return UserSummaryResponse DTO
     */
    UserSummaryResponse toSummaryResponse(User user);

    /**
     * Maps a list of User entities to a list of UserResponse DTOs.
     *
     * @param users list of user entities
     * @return list of UserResponse DTOs
     */
    List<UserResponse> toResponseList(List<User> users);

    /**
     * Helper mapping method to translate Role entities to string values.
     *
     * @param roles role entity set
     * @return set of role names as strings
     */
    @Named("mapRolesToStrings")
    default Set<String> mapRolesToStrings(Set<Role> roles) {
        if (roles == null) {
            return Collections.emptySet();
        }
        return roles.stream()
                .map(role -> role.getName().name())
                .collect(Collectors.toSet());
    }
}
