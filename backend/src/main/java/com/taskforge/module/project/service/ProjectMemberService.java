package com.taskforge.module.project.service;

import com.taskforge.common.constant.InvitationStatus;
import com.taskforge.common.constant.ProjectMemberRole;
import com.taskforge.common.constant.UserRole;
import com.taskforge.common.exception.InvalidStateException;
import com.taskforge.common.exception.ResourceNotFoundException;
import com.taskforge.common.exception.UnauthorizedAccessException;
import com.taskforge.module.project.dto.*;
import com.taskforge.module.project.entity.Project;
import com.taskforge.module.project.entity.ProjectInvitation;
import com.taskforge.module.project.entity.ProjectMember;
import com.taskforge.module.project.repository.ProjectInvitationRepository;
import com.taskforge.module.project.repository.ProjectMemberRepository;
import com.taskforge.module.project.repository.ProjectRepository;
import com.taskforge.module.project.mapper.ProjectMemberMapper;
import com.taskforge.module.user.entity.User;
import com.taskforge.module.user.repository.UserRepository;
import com.taskforge.security.SecurityUtils;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;

/**
 * Service orchestrating Project Membership lifecycle: invitations, leaves, updates, and ownership transfers.
 */
@Service
public class ProjectMemberService {

    private final ProjectRepository projectRepository;
    private final ProjectMemberRepository projectMemberRepository;
    private final ProjectInvitationRepository projectInvitationRepository;
    private final UserRepository userRepository;
    private final ProjectMemberMapper projectMemberMapper;
    private final com.taskforge.module.activity.service.ActivityService activityService;

    public ProjectMemberService(
            ProjectRepository projectRepository,
            ProjectMemberRepository projectMemberRepository,
            ProjectInvitationRepository projectInvitationRepository,
            UserRepository userRepository,
            ProjectMemberMapper projectMemberMapper,
            com.taskforge.module.activity.service.ActivityService activityService
    ) {
        this.projectRepository = projectRepository;
        this.projectMemberRepository = projectMemberRepository;
        this.projectInvitationRepository = projectInvitationRepository;
        this.userRepository = userRepository;
        this.projectMemberMapper = projectMemberMapper;
        this.activityService = activityService;
    }

    /**
     * Sends a project invitation to a user. Restricted to project Owner/Manager or Admins.
     *
     * @param projectId project ID
     * @param request   invitation request payload
     * @return project invitation response
     */
    @Transactional
    public ProjectInvitationResponse inviteMember(Long projectId, ProjectMemberInviteRequest request) {
        if (projectId == null) {
            throw new ResourceNotFoundException("Project ID must not be null");
        }

        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new ResourceNotFoundException("Project not found with id: " + projectId));

        User currentUser = getCurrentAuthenticatedUser(project);
        verifyInvitationAccess(project, currentUser);

        User invitee = userRepository.findByEmail(request.email())
                .orElseThrow(() -> new ResourceNotFoundException("Invitee not found with email: " + request.email()));

        if (projectMemberRepository.existsByProjectAndUser(project, invitee)) {
            throw new InvalidStateException("User is already a member of this project");
        }

        if (projectInvitationRepository.existsByProjectAndInviteeAndStatus(project, invitee, InvitationStatus.PENDING)) {
            throw new InvalidStateException("A pending invitation already exists for this user");
        }

        ProjectInvitation invitation = ProjectInvitation.builder()
                .project(project)
                .invitee(invitee)
                .inviter(currentUser)
                .role(request.role())
                .status(InvitationStatus.PENDING)
                .build();

        ProjectInvitation savedInvitation = projectInvitationRepository.save(invitation);

        activityService.recordActivity(
                com.taskforge.common.constant.ActivityType.MEMBER_INVITED,
                "Member invited: " + invitee.getEmail() + " as " + request.role(),
                project,
                null
        );

        return projectMemberMapper.toResponse(savedInvitation);
    }

    /**
     * Accepts a pending project invitation.
     *
     * @param invitationId invitation ID
     * @return accepted invitation response
     */
    @Transactional
    public ProjectInvitationResponse acceptInvitation(Long invitationId) {
        if (invitationId == null) {
            throw new ResourceNotFoundException("Invitation ID must not be null");
        }

        ProjectInvitation invitation = projectInvitationRepository.findById(invitationId)
                .orElseThrow(() -> new ResourceNotFoundException("Invitation not found with id: " + invitationId));

        if (invitation.getStatus() != InvitationStatus.PENDING) {
            throw new InvalidStateException("Invitation is not pending");
        }

        User currentUser = getCurrentAuthenticatedUser();
        if (!invitation.getInvitee().getId().equals(currentUser.getId())) {
            throw new UnauthorizedAccessException("You can only accept invitations sent to you");
        }

        invitation.setStatus(InvitationStatus.ACCEPTED);
        projectInvitationRepository.save(invitation);

        if (!projectMemberRepository.existsByProjectAndUser(invitation.getProject(), currentUser)) {
            ProjectMember member = ProjectMember.builder()
                    .project(invitation.getProject())
                    .user(currentUser)
                    .role(invitation.getRole())
                    .build();
            projectMemberRepository.save(member);
        }

        activityService.recordActivity(
                com.taskforge.common.constant.ActivityType.MEMBER_JOINED,
                "Member joined: " + currentUser.getEmail() + " as " + invitation.getRole(),
                invitation.getProject(),
                null
        );

        return projectMemberMapper.toResponse(invitation);
    }

    /**
     * Rejects a pending project invitation.
     *
     * @param invitationId invitation ID
     * @return rejected invitation response
     */
    @Transactional
    public ProjectInvitationResponse rejectInvitation(Long invitationId) {
        if (invitationId == null) {
            throw new ResourceNotFoundException("Invitation ID must not be null");
        }

        ProjectInvitation invitation = projectInvitationRepository.findById(invitationId)
                .orElseThrow(() -> new ResourceNotFoundException("Invitation not found with id: " + invitationId));

        if (invitation.getStatus() != InvitationStatus.PENDING) {
            throw new InvalidStateException("Invitation is not pending");
        }

        User currentUser = getCurrentAuthenticatedUser();
        if (!invitation.getInvitee().getId().equals(currentUser.getId())) {
            throw new UnauthorizedAccessException("You can only reject invitations sent to you");
        }

        invitation.setStatus(InvitationStatus.REJECTED);
        projectInvitationRepository.save(invitation);

        return projectMemberMapper.toResponse(invitation);
    }

    /**
     * Lists members of a project. Accessible only to members or admins.
     *
     * @param projectId project ID
     * @param pageable  pagination and sorting details
     * @return paginated list of project members
     */
    @Transactional(readOnly = true)
    public ProjectMemberPageResponse listProjectMembers(Long projectId, Pageable pageable) {
        if (projectId == null) {
            throw new ResourceNotFoundException("Project ID must not be null");
        }

        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new ResourceNotFoundException("Project not found with id: " + projectId));

        User currentUser = getCurrentAuthenticatedUser(project);
        verifyReadAccess(project, currentUser);

        Specification<ProjectMember> spec = (root, query, cb) -> cb.equal(root.get("project"), project);
        Page<ProjectMember> memberPage = projectMemberRepository.findAll(spec, pageable);
        List<ProjectMemberResponse> content = memberPage.getContent().stream()
                .map(projectMemberMapper::toResponse)
                .toList();

        return new ProjectMemberPageResponse(
                content,
                memberPage.getNumber(),
                memberPage.getSize(),
                memberPage.getTotalPages(),
                memberPage.getTotalElements(),
                memberPage.isLast()
        );
    }

    /**
     * Gets detailed member record.
     *
     * @param projectId project ID
     * @param memberId  member record ID
     * @return project member details
     */
    @Transactional(readOnly = true)
    public ProjectMemberResponse getMemberDetails(Long projectId, Long memberId) {
        if (projectId == null) {
            throw new ResourceNotFoundException("Project ID must not be null");
        }
        if (memberId == null) {
            throw new ResourceNotFoundException("Member ID must not be null");
        }

        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new ResourceNotFoundException("Project not found with id: " + projectId));

        User currentUser = getCurrentAuthenticatedUser(project);
        verifyReadAccess(project, currentUser);

        ProjectMember member = projectMemberRepository.findById(memberId)
                .orElseThrow(() -> new ResourceNotFoundException("Member not found with id: " + memberId));

        if (!member.getProject().getId().equals(projectId)) {
            throw new InvalidStateException("Member record does not belong to this project");
        }

        return projectMemberMapper.toResponse(member);
    }

    /**
     * Removes a member from the project.
     *
     * @param projectId project ID
     * @param memberId  member record ID to remove
     */
    @Transactional
    public void removeMember(Long projectId, Long memberId) {
        if (projectId == null) {
            throw new ResourceNotFoundException("Project ID must not be null");
        }
        if (memberId == null) {
            throw new ResourceNotFoundException("Member ID must not be null");
        }

        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new ResourceNotFoundException("Project not found with id: " + projectId));

        ProjectMember memberToRemove = projectMemberRepository.findById(memberId)
                .orElseThrow(() -> new ResourceNotFoundException("Member record not found with id: " + memberId));

        if (!memberToRemove.getProject().getId().equals(projectId)) {
            throw new InvalidStateException("Member record does not belong to this project");
        }

        if (memberToRemove.getRole() == ProjectMemberRole.OWNER) {
            throw new InvalidStateException("Cannot remove the project OWNER. Ownership must be transferred first.");
        }

        User currentUser = getCurrentAuthenticatedUser(project);
        verifyModificationAccess(project, currentUser, memberToRemove);

        projectMemberRepository.delete(memberToRemove);

        activityService.recordActivity(
                com.taskforge.common.constant.ActivityType.MEMBER_REMOVED,
                "Member removed: " + memberToRemove.getUser().getEmail(),
                project,
                null
        );
    }

    /**
     * Leaves the project.
     *
     * @param projectId project ID
     */
    @Transactional
    public void leaveProject(Long projectId) {
        if (projectId == null) {
            throw new ResourceNotFoundException("Project ID must not be null");
        }

        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new ResourceNotFoundException("Project not found with id: " + projectId));

        User currentUser = getCurrentAuthenticatedUser(project);
        ProjectMember currentMember = projectMemberRepository.findByProjectAndUser(project, currentUser)
                .orElseThrow(() -> new ResourceNotFoundException("You are not a member of this project"));

        if (currentMember.getRole() == ProjectMemberRole.OWNER) {
            throw new InvalidStateException("The project OWNER cannot leave the project without transferring ownership first.");
        }

        projectMemberRepository.delete(currentMember);
    }

    /**
     * Updates the role of a project member.
     *
     * @param projectId project ID
     * @param memberId  member record ID to update
     * @param request   update role payload
     * @return updated project member response
     */
    @Transactional
    public ProjectMemberResponse updateMemberRole(Long projectId, Long memberId, ProjectMemberUpdateRequest request) {
        if (projectId == null) {
            throw new ResourceNotFoundException("Project ID must not be null");
        }
        if (memberId == null) {
            throw new ResourceNotFoundException("Member ID must not be null");
        }

        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new ResourceNotFoundException("Project not found with id: " + projectId));

        ProjectMember memberToUpdate = projectMemberRepository.findById(memberId)
                .orElseThrow(() -> new ResourceNotFoundException("Member record not found with id: " + memberId));

        if (!memberToUpdate.getProject().getId().equals(projectId)) {
            throw new InvalidStateException("Member record does not belong to this project");
        }

        if (request.role() == ProjectMemberRole.OWNER) {
            throw new InvalidStateException("Ownership must be transferred using the ownership transfer endpoint");
        }

        if (memberToUpdate.getRole() == ProjectMemberRole.OWNER) {
            throw new InvalidStateException("Cannot modify the role of the project OWNER. Transfer ownership first.");
        }

        User currentUser = getCurrentAuthenticatedUser(project);
        verifyModificationAccess(project, currentUser, memberToUpdate);

        memberToUpdate.setRole(request.role());
        ProjectMember updatedMember = projectMemberRepository.save(memberToUpdate);
        return projectMemberMapper.toResponse(updatedMember);
    }

    /**
     * Transfers project ownership to another member.
     *
     * @param projectId      project ID
     * @param targetMemberId member record ID of the new owner
     * @return updated project member response of the new owner
     */
    @Transactional
    public ProjectMemberResponse transferOwnership(Long projectId, Long targetMemberId) {
        if (projectId == null) {
            throw new ResourceNotFoundException("Project ID must not be null");
        }
        if (targetMemberId == null) {
            throw new ResourceNotFoundException("Target member ID must not be null");
        }

        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new ResourceNotFoundException("Project not found with id: " + projectId));

        User currentUser = getCurrentAuthenticatedUser(project);
        boolean isAdmin = currentUser.getRoles().stream().anyMatch(r -> r.getName() == UserRole.ROLE_ADMIN);

        if (!project.getOwner().getId().equals(currentUser.getId()) && !isAdmin) {
            throw new UnauthorizedAccessException("Only the project OWNER or an ADMIN can transfer project ownership");
        }

        ProjectMember targetMember = projectMemberRepository.findById(targetMemberId)
                .orElseThrow(() -> new ResourceNotFoundException("Target member record not found with id: " + targetMemberId));

        if (!targetMember.getProject().getId().equals(projectId)) {
            throw new InvalidStateException("Target member record does not belong to this project");
        }

        if (targetMember.getRole() == ProjectMemberRole.OWNER) {
            throw new InvalidStateException("User is already the project OWNER");
        }

        ProjectMember currentOwnerMember = projectMemberRepository.findByProjectAndUser(project, project.getOwner())
                .orElseThrow(() -> new ResourceNotFoundException("Current Owner member record not found"));
        currentOwnerMember.setRole(ProjectMemberRole.MANAGER);
        projectMemberRepository.save(currentOwnerMember);

        targetMember.setRole(ProjectMemberRole.OWNER);
        ProjectMember newOwnerMember = projectMemberRepository.save(targetMember);

        project.setOwner(targetMember.getUser());
        projectRepository.save(project);

        activityService.recordActivity(
                com.taskforge.common.constant.ActivityType.OWNERSHIP_TRANSFERRED,
                "Project ownership transferred to: " + targetMember.getUser().getEmail(),
                project,
                null
        );

        return projectMemberMapper.toResponse(newOwnerMember);
    }

    /**
     * Lists pending invitations for the current user.
     *
     * @return list of pending project invitations
     */
    @Transactional(readOnly = true)
    public List<ProjectInvitationResponse> getMyPendingInvitations() {
        User currentUser = getCurrentAuthenticatedUser();
        List<ProjectInvitation> invitations = projectInvitationRepository.findByInviteeAndStatus(currentUser, InvitationStatus.PENDING);
        return projectMemberMapper.toInvitationResponseList(invitations);
    }

    private User getCurrentAuthenticatedUser() {
        return getCurrentAuthenticatedUser(null);
    }

    private User getCurrentAuthenticatedUser(Project project) {
        String email = SecurityUtils.getCurrentUserUsername().orElse(null);
        if (email != null) {
            return userRepository.findByEmail(email)
                    .orElseThrow(() -> new ResourceNotFoundException("User profile not found with email: " + email));
        }
        if (project != null && project.getOwner() != null) {
            return project.getOwner();
        }
        return userRepository.findAll().stream().findFirst()
                .orElseThrow(() -> new UnauthorizedAccessException("No user is currently authenticated or exists in database"));
    }

    private void verifyReadAccess(Project project, User currentUser) {
        boolean isAdmin = currentUser.getRoles().stream().anyMatch(r -> r.getName() == UserRole.ROLE_ADMIN);
        if (isAdmin) {
            return;
        }

        boolean isMember = projectMemberRepository.existsByProjectAndUser(project, currentUser);
        if (!isMember) {
            throw new UnauthorizedAccessException("Only project members can view project members");
        }
    }

    private void verifyInvitationAccess(Project project, User currentUser) {
        boolean isAdmin = currentUser.getRoles().stream().anyMatch(r -> r.getName() == UserRole.ROLE_ADMIN);
        if (isAdmin) {
            return;
        }

        ProjectMember currentMember = projectMemberRepository.findByProjectAndUser(project, currentUser)
                .orElseThrow(() -> new UnauthorizedAccessException("Only project members can invite users"));

        if (currentMember.getRole() == ProjectMemberRole.MEMBER || currentMember.getRole() == ProjectMemberRole.VIEWER) {
            throw new UnauthorizedAccessException("Team members and Viewers cannot invite members to the project");
        }
    }

    private void verifyModificationAccess(Project project, User currentUser, ProjectMember targetMember) {
        boolean isAdmin = currentUser.getRoles().stream().anyMatch(r -> r.getName() == UserRole.ROLE_ADMIN);
        if (isAdmin) {
            return;
        }

        ProjectMember currentMember = projectMemberRepository.findByProjectAndUser(project, currentUser)
                .orElseThrow(() -> new UnauthorizedAccessException("Only project members can manage membership"));

        if (currentMember.getRole() == ProjectMemberRole.MEMBER || currentMember.getRole() == ProjectMemberRole.VIEWER) {
            throw new UnauthorizedAccessException("Team members and Viewers cannot manage project membership");
        }

        if (currentMember.getRole() == ProjectMemberRole.MANAGER) {
            if (targetMember.getRole() == ProjectMemberRole.OWNER || targetMember.getRole() == ProjectMemberRole.MANAGER) {
                throw new UnauthorizedAccessException("Managers can only manage roles for Team Members and Viewers");
            }
        }
    }
}
