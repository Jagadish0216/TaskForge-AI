package com.taskforge.security;

import com.taskforge.common.constant.ProjectMemberRole;
import com.taskforge.common.constant.UserRole;
import com.taskforge.common.exception.ResourceNotFoundException;
import com.taskforge.common.exception.UnauthorizedAccessException;
import com.taskforge.module.project.entity.Project;
import com.taskforge.module.project.entity.ProjectMember;
import com.taskforge.module.project.repository.ProjectMemberRepository;
import com.taskforge.module.user.entity.User;
import com.taskforge.module.user.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;

/**
 * Reusable authorization service enforcing project-level fine-grained access control.
 */
@Service
@Transactional(readOnly = true)
public class ProjectAuthorizationService {

    private final UserRepository userRepository;
    private final ProjectMemberRepository projectMemberRepository;

    public ProjectAuthorizationService(
            UserRepository userRepository,
            ProjectMemberRepository projectMemberRepository
    ) {
        this.userRepository = userRepository;
        this.projectMemberRepository = projectMemberRepository;
    }

    /**
     * Gets the currently authenticated user from SecurityContext. Throws UnauthorizedAccessException if missing.
     */
    public User getAuthenticatedUser() {
        String email = SecurityUtils.getCurrentUserUsername()
                .orElseThrow(() -> new UnauthorizedAccessException("No user is currently authenticated"));
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User profile not found with email: " + email));
    }

    /**
     * Checks if user has system-wide ROLE_ADMIN authority.
     */
    public boolean isAdmin(User user) {
        if (user == null || user.getRoles() == null) {
            return false;
        }
        return user.getRoles().stream().anyMatch(r -> r.getName() == UserRole.ROLE_ADMIN);
    }

    /**
     * Retrieves the project membership for a user if present.
     */
    public Optional<ProjectMember> getProjectMember(Project project, User user) {
        return projectMemberRepository.findByProjectAndUser(project, user);
    }

    /**
     * Enforces read access to a project. System Admins or active project members have access.
     */
    public ProjectMember verifyProjectReadAccess(Project project, User user) {
        if (isAdmin(user)) {
            return null;
        }
        return projectMemberRepository.findByProjectAndUser(project, user)
                .orElseThrow(() -> new UnauthorizedAccessException("You do not have permission to access this project"));
    }

    /**
     * Enforces write access to a project (e.g. creating/updating tasks, comments, attachments).
     * Rejects VIEWER members and non-members.
     */
    public ProjectMember verifyProjectWriteAccess(Project project, User user) {
        if (isAdmin(user)) {
            return null;
        }
        ProjectMember member = projectMemberRepository.findByProjectAndUser(project, user)
                .orElseThrow(() -> new UnauthorizedAccessException("You do not have permission to access this project"));

        if (member.getRole() == ProjectMemberRole.VIEWER) {
            throw new UnauthorizedAccessException("Viewers have read-only access to this project");
        }
        return member;
    }

    /**
     * Enforces project management access (OWNER, MANAGER, or ADMIN).
     */
    public ProjectMember verifyProjectManagementAccess(Project project, User user) {
        if (isAdmin(user)) {
            return null;
        }
        ProjectMember member = projectMemberRepository.findByProjectAndUser(project, user)
                .orElseThrow(() -> new UnauthorizedAccessException("You do not have permission to access this project"));

        if (member.getRole() != ProjectMemberRole.OWNER && member.getRole() != ProjectMemberRole.MANAGER) {
            throw new UnauthorizedAccessException("Only Project Owner, Manager, or Admin can manage this project");
        }
        return member;
    }

    /**
     * Enforces project ownership access (OWNER or ADMIN).
     */
    public void verifyProjectOwnerAccess(Project project, User user) {
        if (isAdmin(user)) {
            return;
        }
        if (project.getOwner() == null || !project.getOwner().getId().equals(user.getId())) {
            throw new UnauthorizedAccessException("Only the Project Owner or Admin can perform this operation");
        }
    }
}
