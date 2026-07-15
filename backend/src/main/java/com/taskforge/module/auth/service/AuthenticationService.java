package com.taskforge.module.auth.service;

import com.taskforge.common.constant.ActivityType;
import com.taskforge.common.exception.InvalidStateException;
import com.taskforge.common.exception.ResourceNotFoundException;
import com.taskforge.common.exception.UnauthorizedAccessException;
import com.taskforge.module.auth.dto.*;
import com.taskforge.module.project.entity.ProjectMember;
import com.taskforge.module.project.repository.ProjectMemberRepository;
import com.taskforge.module.user.entity.Role;
import com.taskforge.module.user.entity.User;
import com.taskforge.module.user.repository.RoleRepository;
import com.taskforge.module.user.repository.UserRepository;
import com.taskforge.module.activity.service.ActivityService;
import com.taskforge.security.SecurityUtils;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpSession;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

/**
 * Service orchestrating simplified authentication flows for academic submission (plain-text passwords, HttpSession-based).
 */
@Service
public class AuthenticationService {

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final ProjectMemberRepository projectMemberRepository;
    private final ActivityService activityService;

    public AuthenticationService(
            UserRepository userRepository,
            RoleRepository roleRepository,
            ProjectMemberRepository projectMemberRepository,
            ActivityService activityService
    ) {
        this.userRepository = userRepository;
        this.roleRepository = roleRepository;
        this.projectMemberRepository = projectMemberRepository;
        this.activityService = activityService;
    }

    /**
     * Registers a new user. Stores password as plain-text.
     *
     * @param request the registration details
     * @return the profile of the registered user
     */
    @Transactional
    public CurrentUserResponse register(RegisterRequest request) {
        if (userRepository.existsByEmail(request.email())) {
            throw new InvalidStateException("Email address is already in use");
        }

        Role role = roleRepository.findByName(request.role())
                .orElseThrow(() -> new ResourceNotFoundException("Role not found: " + request.role()));

        User user = User.builder()
                .email(request.email())
                .password(request.password()) // Plain-text password!
                .firstName(request.firstName())
                .lastName(request.lastName())
                .roles(Set.of(role))
                .enabled(true)
                .build();

        User savedUser = userRepository.save(user);

        activityService.recordActivity(
                ActivityType.USER_REGISTERED,
                "User registered with email: " + savedUser.getEmail(),
                savedUser
        );

        return mapToCurrentUserResponse(savedUser);
    }

    /**
     * Authenticates credentials against database and stores session.
     *
     * @param request     the login credentials
     * @param httpRequest current servlet request
     * @return the authentication response carrying user profile summary
     */
    @Transactional
    public AuthResponse login(LoginRequest request, HttpServletRequest httpRequest) {
        User user = userRepository.findByEmail(request.email())
                .orElseThrow(() -> new UnauthorizedAccessException("Invalid email or password"));

        // Plain-text verification
        if (!user.getPassword().equals(request.password())) {
            throw new UnauthorizedAccessException("Invalid email or password");
        }

        // Establish HTTP Session
        HttpSession session = httpRequest.getSession(true);
        session.setAttribute("userEmail", user.getEmail());

        activityService.recordActivity(
                ActivityType.USER_LOGGED_IN,
                "User logged in: " + user.getEmail(),
                user
        );

        List<String> projectNames = projectMemberRepository.findByUser(user).stream()
                .map(pm -> pm.getProject().getName())
                .toList();

        String primaryRole = user.getRoles().stream()
                .map(r -> r.getName().name())
                .findFirst()
                .orElse("ROLE_TEAM_MEMBER");

        String fullName = (user.getFirstName() != null ? user.getFirstName() : "") + " " +
                           (user.getLastName() != null ? user.getLastName() : "");

        return new AuthResponse(
                user.getId(),
                fullName.trim(),
                user.getEmail(),
                primaryRole,
                projectNames
        );
    }

    /**
     * Logs out the current user by invalidating their HTTP Session.
     *
     * @param httpRequest current servlet request
     */
    public void logout(HttpServletRequest httpRequest) {
        HttpSession session = httpRequest.getSession(false);
        if (session != null) {
            session.invalidate();
        }
    }

    /**
     * Retrieves the profile details of the currently authenticated user.
     *
     * @return current user profile
     */
    @Transactional(readOnly = true)
    public CurrentUserResponse getCurrentUser() {
        String username = SecurityUtils.getCurrentUserUsername()
                .orElseThrow(() -> new UnauthorizedAccessException("No user is currently authenticated"));

        User user = userRepository.findByEmail(username)
                .orElseThrow(() -> new ResourceNotFoundException("User profile not found"));

        return mapToCurrentUserResponse(user);
    }

    /**
     * Updates password for the current user.
     *
     * @param request password update payload
     */
    @Transactional
    public void changePassword(ChangePasswordRequest request) {
        String username = SecurityUtils.getCurrentUserUsername()
                .orElseThrow(() -> new UnauthorizedAccessException("No user is currently authenticated"));

        User user = userRepository.findByEmail(username)
                .orElseThrow(() -> new ResourceNotFoundException("User profile not found"));

        // Plain-text comparison
        if (!user.getPassword().equals(request.currentPassword())) {
            throw new InvalidStateException("Current password does not match");
        }

        user.setPassword(request.newPassword()); // Plain-text save
        userRepository.save(user);
    }

    private CurrentUserResponse mapToCurrentUserResponse(User user) {
        Set<String> roleNames = user.getRoles().stream()
                .map(role -> role.getName().name())
                .collect(Collectors.toSet());

        return new CurrentUserResponse(
                user.getId(),
                user.getEmail(),
                user.getFirstName(),
                user.getLastName(),
                roleNames
        );
    }
}
