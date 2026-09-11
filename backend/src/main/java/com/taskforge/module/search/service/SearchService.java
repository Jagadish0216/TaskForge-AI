package com.taskforge.module.search.service;

import com.taskforge.module.project.dto.ProjectResponse;
import com.taskforge.module.project.entity.Project;
import com.taskforge.module.project.entity.ProjectMember;
import com.taskforge.module.project.mapper.ProjectMapper;
import com.taskforge.module.project.repository.ProjectMemberRepository;
import com.taskforge.module.project.repository.ProjectRepository;
import com.taskforge.module.search.dto.GlobalSearchResponse;
import com.taskforge.module.task.dto.CommentResponse;
import com.taskforge.module.task.dto.TaskResponse;
import com.taskforge.module.task.entity.Comment;
import com.taskforge.module.task.entity.Task;
import com.taskforge.module.task.mapper.CommentMapper;
import com.taskforge.module.task.mapper.TaskMapper;
import com.taskforge.module.task.repository.CommentRepository;
import com.taskforge.module.task.repository.TaskRepository;
import com.taskforge.module.user.dto.UserResponse;
import com.taskforge.module.user.entity.User;
import com.taskforge.module.user.mapper.UserMapper;
import com.taskforge.module.user.repository.UserRepository;
import com.taskforge.security.ProjectAuthorizationService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.util.Collections;
import java.util.List;

@Service
public class SearchService {

    private final ProjectRepository projectRepository;
    private final TaskRepository taskRepository;
    private final UserRepository userRepository;
    private final CommentRepository commentRepository;
    private final ProjectMemberRepository projectMemberRepository;

    private final ProjectMapper projectMapper;
    private final TaskMapper taskMapper;
    private final UserMapper userMapper;
    private final CommentMapper commentMapper;

    private final ProjectAuthorizationService authorizationService;

    public SearchService(
            ProjectRepository projectRepository,
            TaskRepository taskRepository,
            UserRepository userRepository,
            CommentRepository commentRepository,
            ProjectMemberRepository projectMemberRepository,
            ProjectMapper projectMapper,
            TaskMapper taskMapper,
            UserMapper userMapper,
            CommentMapper commentMapper,
            ProjectAuthorizationService authorizationService
    ) {
        this.projectRepository = projectRepository;
        this.taskRepository = taskRepository;
        this.userRepository = userRepository;
        this.commentRepository = commentRepository;
        this.projectMemberRepository = projectMemberRepository;
        this.projectMapper = projectMapper;
        this.taskMapper = taskMapper;
        this.userMapper = userMapper;
        this.commentMapper = commentMapper;
        this.authorizationService = authorizationService;
    }

    @Transactional(readOnly = true)
    public GlobalSearchResponse globalSearch(String keyword) {
        if (!StringUtils.hasText(keyword)) {
            return new GlobalSearchResponse(
                    Collections.emptyList(),
                    Collections.emptyList(),
                    Collections.emptyList(),
                    Collections.emptyList()
            );
        }

        // Resolve accessible project IDs for the authenticated user
        List<Long> accessibleProjectIds = resolveAccessibleProjectIds();

        if (accessibleProjectIds.isEmpty()) {
            // User has no project memberships — only user search is possible
            List<User> users = userRepository.searchByKeyword(keyword);
            List<UserResponse> userResponses = users.stream()
                    .map(userMapper::toResponse)
                    .toList();
            return new GlobalSearchResponse(
                    Collections.emptyList(),
                    Collections.emptyList(),
                    userResponses,
                    Collections.emptyList()
            );
        }

        // 1. Projects Search — scoped to accessible projects
        List<Project> projects = projectRepository.searchByKeyword(keyword, accessibleProjectIds);
        List<ProjectResponse> projectResponses = projects.stream()
                .map(projectMapper::toResponse)
                .toList();

        // 2. Tasks Search — scoped to accessible projects
        List<Task> tasks = taskRepository.searchByKeyword(keyword, accessibleProjectIds);
        List<TaskResponse> taskResponses = taskMapper.toResponseList(tasks);

        // 3. Users Search — globally visible (filtered by enabled + not deleted)
        List<User> users = userRepository.searchByKeyword(keyword);
        List<UserResponse> userResponses = users.stream()
                .map(userMapper::toResponse)
                .toList();

        // 4. Comments Search — scoped to accessible projects, excludes soft-deleted
        List<Comment> comments = commentRepository.searchByKeyword(keyword, accessibleProjectIds);
        List<CommentResponse> commentResponses = commentMapper.toResponseList(comments);

        return new GlobalSearchResponse(
                projectResponses,
                taskResponses,
                userResponses,
                commentResponses
        );
    }

    /**
     * Resolves the list of project IDs the authenticated user has access to.
     * Admins get access to all projects; regular users get their project memberships.
     */
    private List<Long> resolveAccessibleProjectIds() {
        User currentUser = authorizationService.getAuthenticatedUser();

        if (authorizationService.isAdmin(currentUser)) {
            return projectRepository.findAll().stream()
                    .map(Project::getId)
                    .toList();
        }

        return projectMemberRepository.findByUser(currentUser).stream()
                .map(pm -> pm.getProject().getId())
                .toList();
    }
}
