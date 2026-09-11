package com.taskforge.module.search.service;

import com.taskforge.common.constant.ProjectMemberRole;
import com.taskforge.common.constant.ProjectPriority;
import com.taskforge.common.constant.ProjectStatus;
import com.taskforge.common.constant.ProjectVisibility;
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
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.util.Collections;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

class SearchServiceTest {

    private SearchService searchService;
    private ProjectRepository projectRepository;
    private TaskRepository taskRepository;
    private UserRepository userRepository;
    private CommentRepository commentRepository;
    private ProjectMemberRepository projectMemberRepository;
    private ProjectMapper projectMapper;
    private TaskMapper taskMapper;
    private UserMapper userMapper;
    private CommentMapper commentMapper;
    private ProjectAuthorizationService authorizationService;

    @BeforeEach
    void setUp() {
        projectRepository = mock(ProjectRepository.class);
        taskRepository = mock(TaskRepository.class);
        userRepository = mock(UserRepository.class);
        commentRepository = mock(CommentRepository.class);
        projectMemberRepository = mock(ProjectMemberRepository.class);
        projectMapper = mock(ProjectMapper.class);
        taskMapper = mock(TaskMapper.class);
        userMapper = mock(UserMapper.class);
        commentMapper = mock(CommentMapper.class);
        authorizationService = mock(ProjectAuthorizationService.class);

        searchService = new SearchService(
                projectRepository,
                taskRepository,
                userRepository,
                commentRepository,
                projectMemberRepository,
                projectMapper,
                taskMapper,
                userMapper,
                commentMapper,
                authorizationService
        );
    }

    @Test
    void testEmptyKeywordReturnsEmptyResults() {
        GlobalSearchResponse response = searchService.globalSearch("");
        assertNotNull(response);
        assertTrue(response.projects().isEmpty());
        assertTrue(response.tasks().isEmpty());
        assertTrue(response.users().isEmpty());
        assertTrue(response.comments().isEmpty());

        // No repository calls should be made
        verifyNoInteractions(projectRepository, taskRepository, userRepository, commentRepository);
    }

    @Test
    void testNullKeywordReturnsEmptyResults() {
        GlobalSearchResponse response = searchService.globalSearch(null);
        assertNotNull(response);
        assertTrue(response.projects().isEmpty());
        verifyNoInteractions(projectRepository, taskRepository, userRepository, commentRepository);
    }

    @Test
    void testSearchUsesDbQueriesWithAuthScoping() {
        // Setup: authenticated non-admin user with 1 project membership
        User currentUser = User.builder()
                .id(1L).email("user@test.com").password("pass")
                .firstName("Test").lastName("User").build();

        when(authorizationService.getAuthenticatedUser()).thenReturn(currentUser);
        when(authorizationService.isAdmin(currentUser)).thenReturn(false);

        Project project = Project.builder()
                .id(10L).name("TestProject").projectKey("TP")
                .status(ProjectStatus.IN_PROGRESS).priority(ProjectPriority.HIGH)
                .visibility(ProjectVisibility.PRIVATE).owner(currentUser).build();

        ProjectMember pm = ProjectMember.builder()
                .id(1L).project(project).user(currentUser).role(ProjectMemberRole.OWNER).build();

        when(projectMemberRepository.findByUser(currentUser)).thenReturn(List.of(pm));

        // Mock repository keyword search responses
        when(projectRepository.searchByKeyword(eq("test"), eq(List.of(10L)))).thenReturn(List.of(project));
        when(taskRepository.searchByKeyword(eq("test"), eq(List.of(10L)))).thenReturn(Collections.emptyList());
        when(userRepository.searchByKeyword(eq("test"))).thenReturn(Collections.emptyList());
        when(commentRepository.searchByKeyword(eq("test"), eq(List.of(10L)))).thenReturn(Collections.emptyList());

        // Mock mappers
        when(taskMapper.toResponseList(anyList())).thenReturn(Collections.emptyList());
        when(commentMapper.toResponseList(anyList())).thenReturn(Collections.emptyList());

        GlobalSearchResponse response = searchService.globalSearch("test");

        assertNotNull(response);

        // Verify DB keyword queries were used — NOT findAll()
        verify(projectRepository, times(1)).searchByKeyword("test", List.of(10L));
        verify(taskRepository, times(1)).searchByKeyword("test", List.of(10L));
        verify(userRepository, times(1)).searchByKeyword("test");
        verify(commentRepository, times(1)).searchByKeyword("test", List.of(10L));

        // Verify findAll() was never called
        verify(projectRepository, never()).findAll();
        verify(taskRepository, never()).findAll();
        verify(userRepository, never()).findAll();
        verify(commentRepository, never()).findAll();
    }

    @Test
    void testSearchWithNoProjectMembershipsReturnsOnlyUsers() {
        User currentUser = User.builder()
                .id(2L).email("lonely@test.com").password("pass")
                .firstName("Lonely").lastName("User").build();

        when(authorizationService.getAuthenticatedUser()).thenReturn(currentUser);
        when(authorizationService.isAdmin(currentUser)).thenReturn(false);
        when(projectMemberRepository.findByUser(currentUser)).thenReturn(Collections.emptyList());

        when(userRepository.searchByKeyword("keyword")).thenReturn(List.of(currentUser));

        GlobalSearchResponse response = searchService.globalSearch("keyword");

        assertNotNull(response);
        assertTrue(response.projects().isEmpty());
        assertTrue(response.tasks().isEmpty());
        assertTrue(response.comments().isEmpty());

        // Only user search was performed
        verify(userRepository, times(1)).searchByKeyword("keyword");
        verify(projectRepository, never()).searchByKeyword(anyString(), anyList());
        verify(taskRepository, never()).searchByKeyword(anyString(), anyList());
        verify(commentRepository, never()).searchByKeyword(anyString(), anyList());
    }

    @Test
    void testAdminSearchUsesAllProjects() {
        User adminUser = User.builder()
                .id(99L).email("admin@test.com").password("pass")
                .firstName("Admin").lastName("User").build();

        when(authorizationService.getAuthenticatedUser()).thenReturn(adminUser);
        when(authorizationService.isAdmin(adminUser)).thenReturn(true);

        Project p1 = Project.builder().id(1L).name("P1").projectKey("P1")
                .status(ProjectStatus.IN_PROGRESS).priority(ProjectPriority.HIGH)
                .visibility(ProjectVisibility.PRIVATE).owner(adminUser).build();
        Project p2 = Project.builder().id(2L).name("P2").projectKey("P2")
                .status(ProjectStatus.IN_PROGRESS).priority(ProjectPriority.LOW)
                .visibility(ProjectVisibility.PUBLIC).owner(adminUser).build();

        when(projectRepository.findAll()).thenReturn(List.of(p1, p2));

        when(projectRepository.searchByKeyword(eq("data"), eq(List.of(1L, 2L)))).thenReturn(Collections.emptyList());
        when(taskRepository.searchByKeyword(eq("data"), eq(List.of(1L, 2L)))).thenReturn(Collections.emptyList());
        when(userRepository.searchByKeyword(eq("data"))).thenReturn(Collections.emptyList());
        when(commentRepository.searchByKeyword(eq("data"), eq(List.of(1L, 2L)))).thenReturn(Collections.emptyList());
        when(taskMapper.toResponseList(anyList())).thenReturn(Collections.emptyList());
        when(commentMapper.toResponseList(anyList())).thenReturn(Collections.emptyList());

        GlobalSearchResponse response = searchService.globalSearch("data");

        assertNotNull(response);

        // Admin: findAll() is called to get all project IDs
        verify(projectRepository, times(1)).findAll();
        // But then searchByKeyword is used for the actual search
        verify(projectRepository, times(1)).searchByKeyword("data", List.of(1L, 2L));
    }
}
