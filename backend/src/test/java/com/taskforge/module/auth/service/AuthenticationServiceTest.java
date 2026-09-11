package com.taskforge.module.auth.service;

import com.taskforge.common.constant.UserRole;
import com.taskforge.module.activity.service.ActivityService;
import com.taskforge.module.auth.dto.AuthResponse;
import com.taskforge.module.auth.dto.LoginRequest;
import com.taskforge.module.project.entity.Project;
import com.taskforge.module.project.entity.ProjectMember;
import com.taskforge.module.project.repository.ProjectMemberRepository;
import com.taskforge.module.user.entity.Role;
import com.taskforge.module.user.entity.User;
import com.taskforge.module.user.repository.RoleRepository;
import com.taskforge.module.user.repository.UserRepository;
import com.taskforge.security.jwt.JwtTokenProvider;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.List;
import java.util.Optional;
import java.util.Set;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.*;

class AuthenticationServiceTest {

    private AuthenticationService authenticationService;

    @Mock
    private UserRepository userRepository;

    @Mock
    private RoleRepository roleRepository;

    @Mock
    private ProjectMemberRepository projectMemberRepository;

    @Mock
    private ActivityService activityService;

    @Mock
    private PasswordEncoder passwordEncoder;

    @Mock
    private JwtTokenProvider jwtTokenProvider;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
        authenticationService = new AuthenticationService(
                userRepository,
                roleRepository,
                projectMemberRepository,
                activityService,
                passwordEncoder,
                jwtTokenProvider
        );
    }

    @Test
    void testLogin_IncludesProjectNamesFromMemberRepository() {
        User user = new User();
        user.setId(1L);
        user.setEmail("user@example.com");
        user.setPassword("encodedPassword");
        user.setFirstName("John");
        user.setLastName("Doe");
        user.setEnabled(true);

        Role role = new Role(1L, UserRole.ROLE_TEAM_MEMBER);
        user.setRoles(Set.of(role));

        Project project1 = new Project();
        project1.setId(10L);
        project1.setName("Alpha Project");

        Project project2 = new Project();
        project2.setId(20L);
        project2.setName("Beta Project");

        ProjectMember member1 = new ProjectMember();
        member1.setProject(project1);
        member1.setUser(user);

        ProjectMember member2 = new ProjectMember();
        member2.setProject(project2);
        member2.setUser(user);

        when(userRepository.findByEmail("user@example.com")).thenReturn(Optional.of(user));
        when(passwordEncoder.matches("rawPassword", "encodedPassword")).thenReturn(true);
        when(projectMemberRepository.findByUser(user)).thenReturn(List.of(member1, member2));
        when(jwtTokenProvider.generateAccessToken(anyString(), any(), any())).thenReturn("mockAccessToken");
        when(jwtTokenProvider.generateRefreshToken(anyString())).thenReturn("mockRefreshToken");

        LoginRequest loginRequest = new LoginRequest("user@example.com", "rawPassword");
        AuthResponse response = authenticationService.login(loginRequest);

        assertNotNull(response);
        assertEquals("user@example.com", response.email());
        assertEquals("John Doe", response.name());
        assertEquals(List.of("Alpha Project", "Beta Project"), response.projects());

        verify(projectMemberRepository).findByUser(user);
    }
}
