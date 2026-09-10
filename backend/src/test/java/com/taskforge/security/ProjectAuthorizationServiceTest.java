package com.taskforge.security;

import com.taskforge.common.constant.ProjectMemberRole;
import com.taskforge.common.constant.UserRole;
import com.taskforge.common.exception.UnauthorizedAccessException;
import com.taskforge.module.project.entity.Project;
import com.taskforge.module.project.entity.ProjectMember;
import com.taskforge.module.project.repository.ProjectMemberRepository;
import com.taskforge.module.storage.entity.Attachment;
import com.taskforge.module.task.entity.Comment;
import com.taskforge.module.task.entity.Task;
import com.taskforge.module.user.entity.Role;
import com.taskforge.module.user.entity.User;
import com.taskforge.module.user.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;

import java.util.Optional;
import java.util.Set;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.when;

class ProjectAuthorizationServiceTest {

    private ProjectAuthorizationService authorizationService;

    @Mock
    private UserRepository userRepository;

    @Mock
    private ProjectMemberRepository projectMemberRepository;

    private User adminUser;
    private User projectOwner;
    private User memberUser;
    private User viewerUser;
    private User nonMemberUser;

    private Project project;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
        authorizationService = new ProjectAuthorizationService(userRepository, projectMemberRepository);

        // Roles
        Role adminRole = new Role(1L, UserRole.ROLE_ADMIN);
        Role memberRole = new Role(2L, UserRole.ROLE_TEAM_MEMBER);

        // Users
        adminUser = new User();
        adminUser.setId(1L);
        adminUser.setEmail("admin@test.com");
        adminUser.setRoles(Set.of(adminRole));

        projectOwner = new User();
        projectOwner.setId(2L);
        projectOwner.setEmail("owner@test.com");
        projectOwner.setRoles(Set.of(memberRole));

        memberUser = new User();
        memberUser.setId(3L);
        memberUser.setEmail("member@test.com");
        memberUser.setRoles(Set.of(memberRole));

        viewerUser = new User();
        viewerUser.setId(4L);
        viewerUser.setEmail("viewer@test.com");
        viewerUser.setRoles(Set.of(memberRole));

        nonMemberUser = new User();
        nonMemberUser.setId(5L);
        nonMemberUser.setEmail("nonmember@test.com");
        nonMemberUser.setRoles(Set.of(memberRole));

        // Project
        project = new Project();
        project.setId(100L);
        project.setOwner(projectOwner);

        // Project Memberships
        ProjectMember ownerMember = new ProjectMember(1L, project, projectOwner, ProjectMemberRole.OWNER);
        ProjectMember regularMember = new ProjectMember(2L, project, memberUser, ProjectMemberRole.MEMBER);
        ProjectMember viewerMember = new ProjectMember(3L, project, viewerUser, ProjectMemberRole.VIEWER);

        when(projectMemberRepository.findByProjectAndUser(project, projectOwner)).thenReturn(Optional.of(ownerMember));
        when(projectMemberRepository.findByProjectAndUser(project, memberUser)).thenReturn(Optional.of(regularMember));
        when(projectMemberRepository.findByProjectAndUser(project, viewerUser)).thenReturn(Optional.of(viewerMember));
        when(projectMemberRepository.findByProjectAndUser(project, nonMemberUser)).thenReturn(Optional.empty());
    }

    // 1. Unauthenticated user / null user -> denied
    @Test
    void testUnauthenticatedUserDenied() {
        assertThrows(UnauthorizedAccessException.class, () -> {
            authorizationService.verifyProjectReadAccess(project, null);
        });
    }

    // 2. Non-member -> project resource -> 403 / UnauthorizedAccessException
    @Test
    void testNonMemberProjectResourceDenied() {
        assertThrows(UnauthorizedAccessException.class, () -> {
            authorizationService.verifyProjectReadAccess(project, nonMemberUser);
        });
    }

    // 3. Viewer -> write operation -> 403 / UnauthorizedAccessException
    @Test
    void testViewerWriteOperationDenied() {
        // Read access allowed for viewer
        assertDoesNotThrow(() -> authorizationService.verifyProjectReadAccess(project, viewerUser));

        // Write access denied for viewer
        assertThrows(UnauthorizedAccessException.class, () -> {
            authorizationService.verifyProjectWriteAccess(project, viewerUser);
        });
    }

    // 4. Member -> permitted task / project write operation -> success
    @Test
    void testMemberPermittedOperationSuccess() {
        assertDoesNotThrow(() -> {
            authorizationService.verifyProjectWriteAccess(project, memberUser);
        });
    }

    // 5. Non-member -> another project's task ID (derived project) -> denied
    @Test
    void testNonMemberTaskAccessDenied() {
        Task task = new Task();
        task.setId(200L);
        task.setProject(project);

        assertThrows(UnauthorizedAccessException.class, () -> {
            authorizationService.verifyProjectReadAccess(task.getProject(), nonMemberUser);
        });
    }

    // 6. User -> non-member / viewer comment deletion -> denied
    @Test
    void testViewerCommentDeletionDenied() {
        Task task = new Task();
        task.setId(200L);
        task.setProject(project);

        Comment comment = new Comment();
        comment.setId(300L);
        comment.setTask(task);
        comment.setAuthor(memberUser);

        // Viewer tries write operation on project -> denied
        assertThrows(UnauthorizedAccessException.class, () -> {
            authorizationService.verifyProjectWriteAccess(comment.getTask().getProject(), viewerUser);
        });
    }

    // 7. Non-member -> another project's attachment download -> denied
    @Test
    void testNonMemberAttachmentDownloadDenied() {
        Attachment attachment = new Attachment();
        attachment.setId(400L);
        attachment.setProject(project);

        assertThrows(UnauthorizedAccessException.class, () -> {
            authorizationService.verifyProjectReadAccess(attachment.getProject(), nonMemberUser);
        });

        // Member can access project attachment
        assertDoesNotThrow(() -> {
            authorizationService.verifyProjectReadAccess(attachment.getProject(), memberUser);
        });
    }

    // 8. Admin -> admin access / project access -> success
    @Test
    void testAdminAccessSuccess() {
        assertTrue(authorizationService.isAdmin(adminUser));
        assertDoesNotThrow(() -> {
            authorizationService.verifyProjectWriteAccess(project, adminUser);
        });
    }

    // 9. Normal user -> admin endpoint / check -> denied
    @Test
    void testNormalUserAdminCheck() {
        assertFalse(authorizationService.isAdmin(memberUser));
        assertFalse(authorizationService.isAdmin(viewerUser));
        assertFalse(authorizationService.isAdmin(nonMemberUser));
    }
}
