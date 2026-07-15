package com.taskforge.module.search.service;

import com.taskforge.module.project.dto.ProjectResponse;
import com.taskforge.module.project.entity.Project;
import com.taskforge.module.project.mapper.ProjectMapper;
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

    private final ProjectMapper projectMapper;
    private final TaskMapper taskMapper;
    private final UserMapper userMapper;
    private final CommentMapper commentMapper;

    public SearchService(
            ProjectRepository projectRepository,
            TaskRepository taskRepository,
            UserRepository userRepository,
            CommentRepository commentRepository,
            ProjectMapper projectMapper,
            TaskMapper taskMapper,
            UserMapper userMapper,
            CommentMapper commentMapper
    ) {
        this.projectRepository = projectRepository;
        this.taskRepository = taskRepository;
        this.userRepository = userRepository;
        this.commentRepository = commentRepository;
        this.projectMapper = projectMapper;
        this.taskMapper = taskMapper;
        this.userMapper = userMapper;
        this.commentMapper = commentMapper;
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

        String lowerKeyword = keyword.toLowerCase();

        // 1. Projects Search
        List<Project> projects = projectRepository.findAll().stream()
                .filter(p -> p.getName().toLowerCase().contains(lowerKeyword) ||
                        p.getProjectKey().toLowerCase().contains(lowerKeyword))
                .toList();
        List<ProjectResponse> projectResponses = projects.stream()
                .map(projectMapper::toResponse)
                .toList();

        // 2. Tasks Search
        List<Task> tasks = taskRepository.findAll().stream()
                .filter(t -> t.getTitle().toLowerCase().contains(lowerKeyword) ||
                        (t.getDescription() != null && t.getDescription().toLowerCase().contains(lowerKeyword)))
                .toList();
        List<TaskResponse> taskResponses = taskMapper.toResponseList(tasks);

        // 3. Users Search
        List<User> users = userRepository.findAll().stream()
                .filter(u -> u.getEmail().toLowerCase().contains(lowerKeyword) ||
                        (u.getFirstName() != null && u.getFirstName().toLowerCase().contains(lowerKeyword)) ||
                        (u.getLastName() != null && u.getLastName().toLowerCase().contains(lowerKeyword)))
                .toList();
        List<UserResponse> userResponses = users.stream()
                .map(userMapper::toResponse)
                .toList();

        // 4. Comments Search
        List<Comment> comments = commentRepository.findAll().stream()
                .filter(c -> !c.isDeleted() && c.getContent().toLowerCase().contains(lowerKeyword))
                .toList();
        List<CommentResponse> commentResponses = commentMapper.toResponseList(comments);

        return new GlobalSearchResponse(
                projectResponses,
                taskResponses,
                userResponses,
                commentResponses
        );
    }
}
