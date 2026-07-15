package com.taskforge.module.project.controller;

import com.taskforge.common.api.ApiResponse;
import com.taskforge.module.project.dto.*;
import com.taskforge.module.project.service.ProjectMemberService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * REST controller exposing endpoints for Project Member Management, invitation processing, leaves, and ownership transfers.
 */
@RestController
@RequestMapping("/projects")
@Tag(name = "Project Member Management Module", description = "Endpoints for managing project member scopes, invitations, and ownership transfers")
public class ProjectMemberController {

    private final ProjectMemberService projectMemberService;

    public ProjectMemberController(ProjectMemberService projectMemberService) {
        this.projectMemberService = projectMemberService;
    }

    /**
     * Invites a new user to a project. Restricted to project Owner/Manager and Admins.
     *
     * @param projectId project ID
     * @param request   invite request payload
     * @return invitation response details wrapped in ApiResponse
     */
    @PostMapping("/{projectId}/members/invite")
    @Operation(summary = "Invite a user to the project", description = "Sends a pending project invitation to a user. Requires ADMIN or PROJECT_MANAGER role.")
    public ResponseEntity<ApiResponse<ProjectInvitationResponse>> inviteMember(
            @PathVariable Long projectId,
            @Valid @RequestBody ProjectMemberInviteRequest request) {
        ProjectInvitationResponse response = projectMemberService.inviteMember(projectId, request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(response, "Invitation sent successfully"));
    }

    /**
     * Accepts a pending project invitation.
     *
     * @param invitationId invitation database identifier
     * @return accepted invitation response details wrapped in ApiResponse
     */
    @PostMapping("/invitations/{invitationId}/accept")
    @Operation(summary = "Accept a project invitation", description = "Accepts a pending invitation, automatically registering the user as a project member.")
    public ResponseEntity<ApiResponse<ProjectInvitationResponse>> acceptInvitation(@PathVariable Long invitationId) {
        ProjectInvitationResponse response = projectMemberService.acceptInvitation(invitationId);
        return ResponseEntity.ok(ApiResponse.success(response, "Invitation accepted successfully"));
    }

    /**
     * Rejects a pending project invitation.
     *
     * @param invitationId invitation database identifier
     * @return rejected invitation response details wrapped in ApiResponse
     */
    @PostMapping("/invitations/{invitationId}/reject")
    @Operation(summary = "Reject a project invitation", description = "Rejects a pending project invitation.")
    public ResponseEntity<ApiResponse<ProjectInvitationResponse>> rejectInvitation(@PathVariable Long invitationId) {
        ProjectInvitationResponse response = projectMemberService.rejectInvitation(invitationId);
        return ResponseEntity.ok(ApiResponse.success(response, "Invitation rejected successfully"));
    }

    /**
     * Lists pending project invitations for the current user.
     *
     * @return list of pending invitations wrapped in ApiResponse
     */
    @GetMapping("/invitations/me")
    @Operation(summary = "Get own pending project invitations", description = "Retrieves all pending invitations sent to the currently authenticated user.")
    public ResponseEntity<ApiResponse<List<ProjectInvitationResponse>>> getMyInvitations() {
        List<ProjectInvitationResponse> response = projectMemberService.getMyPendingInvitations();
        return ResponseEntity.ok(ApiResponse.success(response, "Invitations retrieved successfully"));
    }

    /**
     * Lists members of a project. Restricted to members and Admins.
     *
     * @param projectId project ID
     * @param page      page number (0-indexed)
     * @param size      page size
     * @param sortBy    field to sort by
     * @param direction sort direction (ASC/DESC)
     * @return paginated list of project members wrapped in ApiResponse
     */
    @GetMapping("/{projectId}/members")
    @Operation(summary = "List project members", description = "Retrieves a paginated list of all registered project members. Accessible only to members or admins.")
    public ResponseEntity<ApiResponse<ProjectMemberPageResponse>> listProjectMembers(
            @PathVariable Long projectId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "id") String sortBy,
            @RequestParam(defaultValue = "ASC") String direction) {

        Sort sort = direction.equalsIgnoreCase("DESC") ? Sort.by(sortBy).descending() : Sort.by(sortBy).ascending();
        Pageable pageable = PageRequest.of(page, size, sort);
        ProjectMemberPageResponse response = projectMemberService.listProjectMembers(projectId, pageable);
        return ResponseEntity.ok(ApiResponse.success(response, "Project members retrieved successfully"));
    }

    /**
     * Gets detailed project member record by ID. Restricted to members and Admins.
     *
     * @param projectId project ID
     * @param memberId  member record ID
     * @return project member response details wrapped in ApiResponse
     */
    @GetMapping("/{projectId}/members/{memberId}")
    @Operation(summary = "Get project member details", description = "Retrieves detailed information of a member record. Accessible only to members or admins.")
    public ResponseEntity<ApiResponse<ProjectMemberResponse>> getMemberDetails(
            @PathVariable Long projectId,
            @PathVariable Long memberId) {
        ProjectMemberResponse response = projectMemberService.getMemberDetails(projectId, memberId);
        return ResponseEntity.ok(ApiResponse.success(response, "Member details retrieved successfully"));
    }

    /**
     * Removes a user from a project. Restricted to project Owner/Manager and Admins.
     *
     * @param projectId project ID
     * @param memberId  member record ID to remove
     * @return success response wrapped in ApiResponse
     */
    @DeleteMapping("/{projectId}/members/{memberId}")
    @Operation(summary = "Remove a project member", description = "Removes a user from the project member list. Project OWNER cannot be removed. PMs cannot remove OWNER/MANAGER. Requires ADMIN or PROJECT_MANAGER role.")
    public ResponseEntity<ApiResponse<Void>> removeMember(
            @PathVariable Long projectId,
            @PathVariable Long memberId) {
        projectMemberService.removeMember(projectId, memberId);
        return ResponseEntity.ok(ApiResponse.success(null, "Member removed successfully"));
    }

    /**
     * Voluntarily leaves a project.
     *
     * @param projectId project ID
     * @return success response wrapped in ApiResponse
     */
    @PostMapping("/{projectId}/members/leave")
    @Operation(summary = "Leave a project", description = "Voluntarily removes the current user from the project membership. Project OWNER cannot leave without transferring ownership.")
    public ResponseEntity<ApiResponse<Void>> leaveProject(@PathVariable Long projectId) {
        projectMemberService.leaveProject(projectId);
        return ResponseEntity.ok(ApiResponse.success(null, "Successfully left the project"));
    }

    /**
     * Updates the role of a project member. Restricted to project Owner/Manager and Admins.
     *
     * @param projectId project ID
     * @param memberId  member record ID to update
     * @param request   update role payload
     * @return updated project member response details wrapped in ApiResponse
     */
    @PutMapping("/{projectId}/members/{memberId}/role")
    @Operation(summary = "Update project member role", description = "Updates a member's assigned role inside a project. PMs cannot modify OWNER/MANAGER roles. Requires ADMIN or PROJECT_MANAGER role.")
    public ResponseEntity<ApiResponse<ProjectMemberResponse>> updateMemberRole(
            @PathVariable Long projectId,
            @PathVariable Long memberId,
            @Valid @RequestBody ProjectMemberUpdateRequest request) {
        ProjectMemberResponse response = projectMemberService.updateMemberRole(projectId, memberId, request);
        return ResponseEntity.ok(ApiResponse.success(response, "Member role updated successfully"));
    }

    /**
     * Transfers project ownership to another member. Restricted to current project Owner and Admins.
     *
     * @param projectId      project ID
     * @param targetMemberId member record ID of the new owner
     * @return updated project member response details of the new owner wrapped in ApiResponse
     */
    @PostMapping("/{projectId}/members/{targetMemberId}/transfer-ownership")
    @Operation(summary = "Transfer project ownership", description = "Transfers the OWNER role to another project member. Downgrades the previous owner to MANAGER. Accessible only to current project OWNER or ADMIN.")
    public ResponseEntity<ApiResponse<ProjectMemberResponse>> transferOwnership(
            @PathVariable Long projectId,
            @PathVariable Long targetMemberId) {
        ProjectMemberResponse response = projectMemberService.transferOwnership(projectId, targetMemberId);
        return ResponseEntity.ok(ApiResponse.success(response, "Project ownership transferred successfully"));
    }
}
