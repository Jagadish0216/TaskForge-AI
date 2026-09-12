package com.taskforge.config;

import com.taskforge.common.constant.UserRole;
import com.taskforge.module.activity.repository.ActivityLogRepository;
import com.taskforge.module.notification.repository.NotificationRepository;
import com.taskforge.module.project.entity.Project;
import com.taskforge.module.project.repository.ProjectMemberRepository;
import com.taskforge.module.project.repository.ProjectRepository;
import com.taskforge.module.task.repository.CommentRepository;
import com.taskforge.module.task.repository.TaskRepository;
import com.taskforge.module.user.entity.Role;
import com.taskforge.module.user.repository.RoleRepository;
import com.taskforge.module.user.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.util.ReflectionTestUtils;

import java.util.Optional;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class DataInitializerTest {

    @Mock
    private RoleRepository roleRepository;
    @Mock
    private UserRepository userRepository;
    @Mock
    private ProjectRepository projectRepository;
    @Mock
    private ProjectMemberRepository projectMemberRepository;
    @Mock
    private TaskRepository taskRepository;
    @Mock
    private CommentRepository commentRepository;
    @Mock
    private ActivityLogRepository activityLogRepository;
    @Mock
    private NotificationRepository notificationRepository;
    @Mock
    private PasswordEncoder passwordEncoder;
    @Mock
    private JdbcTemplate jdbcTemplate;

    private DataInitializer dataInitializer;

    @BeforeEach
    void setUp() {
        dataInitializer = new DataInitializer(
                roleRepository,
                userRepository,
                projectRepository,
                projectMemberRepository,
                taskRepository,
                commentRepository,
                activityLogRepository,
                notificationRepository,
                passwordEncoder,
                jdbcTemplate
        );

        lenient().when(roleRepository.findByName(any(UserRole.class))).thenAnswer(invocation -> {
            UserRole userRole = invocation.getArgument(0);
            Role role = new Role();
            role.setName(userRole);
            return Optional.of(role);
        });
    }

    @Test
    @DisplayName("Should skip seeding when APP_SEED_DEMO_DATA is false")
    void shouldSkipSeedingWhenDisabled() {
        ReflectionTestUtils.setField(dataInitializer, "seedDemoData", false);
        ReflectionTestUtils.setField(dataInitializer, "resetDemoData", false);

        dataInitializer.run();

        verify(projectRepository, never()).save(any(Project.class));
    }

    @Test
    @DisplayName("Should skip seeding when dataset already exists")
    void shouldSkipSeedingWhenDatasetAlreadyInitialized() {
        ReflectionTestUtils.setField(dataInitializer, "seedDemoData", true);
        ReflectionTestUtils.setField(dataInitializer, "resetDemoData", false);

        when(projectRepository.existsByProjectKey("PULSE")).thenReturn(true);

        dataInitializer.run();

        verify(projectRepository, never()).save(any(Project.class));
        verify(userRepository, never()).save(any());
    }

    @Test
    @DisplayName("Should seed dataset when APP_SEED_DEMO_DATA is true and dataset does not exist")
    void shouldSeedDatasetWhenEmpty() {
        ReflectionTestUtils.setField(dataInitializer, "seedDemoData", true);
        ReflectionTestUtils.setField(dataInitializer, "resetDemoData", false);

        when(projectRepository.existsByProjectKey("PULSE")).thenReturn(false);
        when(userRepository.existsByEmail(anyString())).thenReturn(false);
        when(passwordEncoder.encode(anyString())).thenReturn("hashed_password");
        when(userRepository.save(any())).thenAnswer(invocation -> invocation.getArgument(0));
        when(projectRepository.save(any())).thenAnswer(invocation -> invocation.getArgument(0));
        when(taskRepository.save(any())).thenAnswer(invocation -> invocation.getArgument(0));

        dataInitializer.run();

        verify(userRepository, times(3)).save(any());
        verify(projectRepository, times(1)).save(any());
        verify(taskRepository, times(10)).save(any());
    }
}
