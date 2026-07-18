package com.taskforge.module.project.service;

import com.taskforge.common.exception.ResourceNotFoundException;
import com.taskforge.common.exception.UnauthorizedAccessException;
import com.taskforge.module.project.dto.ProjectMessageRequest;
import com.taskforge.module.project.dto.ProjectMessageResponse;
import com.taskforge.module.project.entity.Project;
import com.taskforge.module.project.entity.ProjectMessage;
import com.taskforge.module.project.repository.ProjectMessageRepository;
import com.taskforge.module.project.repository.ProjectRepository;
import com.taskforge.module.user.entity.User;
import com.taskforge.module.user.repository.UserRepository;
import com.taskforge.security.SecurityUtils;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.Mock;
import org.mockito.MockedStatic;
import org.mockito.Mockito;
import org.mockito.MockitoAnnotations;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

class ProjectMessageServiceTest {

    private ProjectMessageService projectMessageService;

    @Mock
    private ProjectMessageRepository projectMessageRepository;

    @Mock
    private ProjectRepository projectRepository;

    @Mock
    private UserRepository userRepository;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
        projectMessageService = new ProjectMessageService(projectMessageRepository, projectRepository, userRepository);
    }

    @Test
    void testEditMessageSuccess() {
        Project project = new Project();
        project.setId(1L);

        User sender = new User();
        sender.setId(10L);
        sender.setEmail("sender@test.com");

        ProjectMessage message = new ProjectMessage(project, sender, "Original Message");
        message.setId(100L);

        when(projectMessageRepository.findById(100L)).thenReturn(Optional.of(message));
        when(projectMessageRepository.save(any(ProjectMessage.class))).thenAnswer(invocation -> invocation.getArgument(0));

        try (MockedStatic<SecurityUtils> mockedSecurityUtils = Mockito.mockStatic(SecurityUtils.class)) {
            mockedSecurityUtils.when(SecurityUtils::getCurrentUserUsername).thenReturn(Optional.of("sender@test.com"));
            when(userRepository.findByEmail("sender@test.com")).thenReturn(Optional.of(sender));

            ProjectMessageRequest request = new ProjectMessageRequest("Edited Message");
            ProjectMessageResponse response = projectMessageService.editMessage(1L, 100L, request);

            assertNotNull(response);
            assertEquals("Edited Message", response.message());
            assertTrue(response.edited());
        }
    }

    @Test
    void testEditMessageUnauthorized() {
        Project project = new Project();
        project.setId(1L);

        User sender = new User();
        sender.setId(10L);
        sender.setEmail("sender@test.com");

        User otherUser = new User();
        otherUser.setId(20L);
        otherUser.setEmail("other@test.com");

        ProjectMessage message = new ProjectMessage(project, sender, "Original Message");
        message.setId(100L);

        when(projectMessageRepository.findById(100L)).thenReturn(Optional.of(message));

        try (MockedStatic<SecurityUtils> mockedSecurityUtils = Mockito.mockStatic(SecurityUtils.class)) {
            mockedSecurityUtils.when(SecurityUtils::getCurrentUserUsername).thenReturn(Optional.of("other@test.com"));
            when(userRepository.findByEmail("other@test.com")).thenReturn(Optional.of(otherUser));

            ProjectMessageRequest request = new ProjectMessageRequest("Edited Message");
            assertThrows(UnauthorizedAccessException.class, () -> {
                projectMessageService.editMessage(1L, 100L, request);
            });
        }
    }
}
