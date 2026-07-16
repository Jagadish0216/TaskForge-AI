package com.taskforge.module.user.service;

import com.taskforge.common.constant.TaskStatus;
import com.taskforge.common.exception.ResourceNotFoundException;
import com.taskforge.common.exception.UnauthorizedAccessException;
import com.taskforge.module.project.repository.ProjectMemberRepository;
import com.taskforge.module.project.repository.ProjectRepository;
import com.taskforge.module.task.repository.TaskRepository;
import com.taskforge.module.user.dto.*;
import com.taskforge.module.user.entity.Role;
import com.taskforge.module.user.entity.User;
import com.taskforge.module.user.mapper.UserMapper;
import com.taskforge.module.user.repository.UserRepository;
import com.taskforge.security.SecurityUtils;
import jakarta.persistence.criteria.Join;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.util.ArrayList;
import java.util.List;

/**
 * Service for managing user profiles, searching, and administrative operations like deactivation or soft-deleting.
 */
@Service
public class UserService {

    private final UserRepository userRepository;
    private final ProjectRepository projectRepository;
    private final ProjectMemberRepository projectMemberRepository;
    private final TaskRepository taskRepository;
    private final UserMapper userMapper;

    public UserService(
            UserRepository userRepository,
            ProjectRepository projectRepository,
            ProjectMemberRepository projectMemberRepository,
            TaskRepository taskRepository,
            UserMapper userMapper
    ) {
        this.userRepository = userRepository;
        this.projectRepository = projectRepository;
        this.projectMemberRepository = projectMemberRepository;
        this.taskRepository = taskRepository;
        this.userMapper = userMapper;
    }

    /**
     * Retrieves the profile details of the currently authenticated user.
     *
     * @return current user profile
     */
    @Transactional(readOnly = true)
    public UserResponse getCurrentUserProfile() {
        String email = SecurityUtils.getCurrentUserUsername().orElse(null);
        User user;
        if (email != null) {
            user = userRepository.findByEmail(email)
                    .orElseThrow(() -> new ResourceNotFoundException("User profile not found with email: " + email));
        } else {
            user = userRepository.findAll().stream().findFirst()
                    .orElseThrow(() -> new UnauthorizedAccessException("No user is currently authenticated or exists in database"));
        }
        return userMapper.toResponse(user);
    }

    /**
     * Updates profile details of the currently authenticated user.
     *
     * @param request update payload
     * @return updated user details
     */
    @Transactional
    public UserResponse updateCurrentUserProfile(UpdateUserRequest request) {
        String email = SecurityUtils.getCurrentUserUsername().orElse(null);
        User user;
        if (email != null) {
            user = userRepository.findByEmail(email)
                    .orElseThrow(() -> new ResourceNotFoundException("User profile not found with email: " + email));
        } else {
            user = userRepository.findAll().stream().findFirst()
                    .orElseThrow(() -> new UnauthorizedAccessException("No user is currently authenticated or exists in database"));
        }

        user.setFirstName(request.firstName());
        user.setLastName(request.lastName());

        User updatedUser = userRepository.save(user);
        return userMapper.toResponse(updatedUser);
    }

    /**
     * Gets detailed user profile by ID.
     *
     * @param id user ID
     * @return user profile details
     */
    @Transactional(readOnly = true)
    public UserResponse getUserById(Long id) {
        if (id == null) {
            throw new ResourceNotFoundException("User ID must not be null");
        }

        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + id));
        return userMapper.toResponse(user);
    }

    /**
     * Gets detailed user profile by Email.
     *
     * @param email user email
     * @return user profile details
     */
    @Transactional(readOnly = true)
    public UserResponse getUserByEmail(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with email: " + email));
        return userMapper.toResponse(user);
    }

    /**
     * Searches and filters users with pagination and sorting.
     *
     * @param searchRequest filtering criteria
     * @param pageable      pagination and sorting metadata
     * @return paginated user responses
     */
    @Transactional(readOnly = true)
    public UserPageResponse searchUsers(UserSearchRequest searchRequest, Pageable pageable) {
        Specification<User> spec = (root, query, cb) -> {
            var predicates = new ArrayList<jakarta.persistence.criteria.Predicate>();

            boolean searchDeleted = searchRequest.deleted() != null && searchRequest.deleted();
            predicates.add(cb.equal(root.get("deleted"), searchDeleted));

            if (searchRequest.enabled() != null) {
                predicates.add(cb.equal(root.get("enabled"), searchRequest.enabled()));
            }

            if (searchRequest.role() != null) {
                Join<User, Role> rolesJoin = root.join("roles");
                predicates.add(cb.equal(rolesJoin.get("name"), searchRequest.role()));
            }

            if (StringUtils.hasText(searchRequest.keyword())) {
                String searchPattern = "%" + searchRequest.keyword().toLowerCase() + "%";
                var keywordPredicates = cb.or(
                        cb.like(cb.lower(root.get("email")), searchPattern),
                        cb.like(cb.lower(root.get("firstName")), searchPattern),
                        cb.like(cb.lower(root.get("lastName")), searchPattern)
                );
                predicates.add(keywordPredicates);
            }

            return cb.and(predicates.toArray(new jakarta.persistence.criteria.Predicate[0]));
        };

        Page<User> userPage = userRepository.findAll(spec, pageable);
        List<UserResponse> content = userPage.getContent().stream()
                .map(userMapper::toResponse)
                .toList();

        return new UserPageResponse(
                content,
                userPage.getNumber(),
                userPage.getSize(),
                userPage.getTotalPages(),
                userPage.getTotalElements(),
                userPage.isLast()
        );
    }

    /**
     * Gets usage stats (projects, tasks) for a user.
     *
     * @param userId user ID
     * @return statistical counts for projects and tasks
     */
    @Transactional(readOnly = true)
    public UserStatisticsResponse getUserStatistics(Long userId) {
        if (userId == null) {
            throw new ResourceNotFoundException("User ID must not be null");
        }

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));

        long ownedProjects = projectRepository.countByOwner(user);
        long memberProjects = projectMemberRepository.countByUser(user);
        long assignedTasks = taskRepository.countByAssignee(user);
        long completedTasks = taskRepository.countByAssigneeAndStatus(user, TaskStatus.DONE);
        long pendingTasks = assignedTasks - completedTasks;

        return new UserStatisticsResponse(
                ownedProjects,
                memberProjects,
                assignedTasks,
                completedTasks,
                pendingTasks
        );
    }

    /**
     * Soft deletes user by setting deleted = true and disabled.
     *
     * @param id user ID
     */
    @Transactional
    public void softDeleteUser(Long id) {
        if (id == null) {
            throw new ResourceNotFoundException("User ID must not be null");
        }

        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + id));
        user.setDeleted(true);
        user.setEnabled(false);
        userRepository.save(user);
    }

    /**
     * Activates a user profile.
     *
     * @param id user ID
     */
    @Transactional
    public void activateUser(Long id) {
        if (id == null) {
            throw new ResourceNotFoundException("User ID must not be null");
        }

        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + id));
        user.setEnabled(true);
        userRepository.save(user);
    }

    /**
     * Deactivates a user profile.
     *
     * @param id user ID
     */
    @Transactional
    public void deactivateUser(Long id) {
        if (id == null) {
            throw new ResourceNotFoundException("User ID must not be null");
        }

        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + id));
        user.setEnabled(false);
        userRepository.save(user);
    }
}
