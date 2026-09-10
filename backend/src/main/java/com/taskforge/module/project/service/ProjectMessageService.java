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
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class ProjectMessageService {

    private final ProjectMessageRepository projectMessageRepository;
    private final ProjectRepository projectRepository;
    private final UserRepository userRepository;

    public ProjectMessageService(
            ProjectMessageRepository projectMessageRepository,
            ProjectRepository projectRepository,
            UserRepository userRepository
    ) {
        this.projectMessageRepository = projectMessageRepository;
        this.projectRepository = projectRepository;
        this.userRepository = userRepository;
    }

    private User getAuthenticatedUser() {
        String email = SecurityUtils.getCurrentUserUsername()
                .orElseThrow(() -> new UnauthorizedAccessException("No user is currently authenticated"));
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User profile not found: " + email));
    }

    @Transactional(readOnly = true)
    public List<ProjectMessageResponse> getMessages(Long projectId) {
        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new ResourceNotFoundException("Project not found: " + projectId));

        return projectMessageRepository.findByProjectOrderByCreatedAtAsc(project).stream()
                .map(this::mapToResponse)
                .toList();
    }

    @Transactional
    public ProjectMessageResponse postMessage(Long projectId, ProjectMessageRequest request) {
        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new ResourceNotFoundException("Project not found: " + projectId));
        User sender = getAuthenticatedUser();

        ProjectMessage msg = new ProjectMessage(project, sender, request.message());
        ProjectMessage saved = projectMessageRepository.save(msg);

        return mapToResponse(saved);
    }

    private ProjectMessageResponse mapToResponse(ProjectMessage msg) {
        String senderName = "";
        if (msg.getSender() != null) {
            senderName = (msg.getSender().getFirstName() != null ? msg.getSender().getFirstName() : "") + " " +
                         (msg.getSender().getLastName() != null ? msg.getSender().getLastName() : "");
            senderName = senderName.trim();
            if (senderName.isEmpty()) {
                senderName = msg.getSender().getEmail();
            }
        }

        return new ProjectMessageResponse(
                msg.getId(),
                msg.getProject().getId(),
                msg.getSender() != null ? msg.getSender().getId() : null,
                msg.getSender() != null ? msg.getSender().getEmail() : null,
                senderName,
                msg.getSender() != null ? msg.getSender().getAvatarUrl() : null,
                msg.getMessage(),
                msg.getCreatedAt(),
                msg.isEdited(),
                msg.isDeleted()
        );
    }

    @Transactional
    public ProjectMessageResponse editMessage(Long projectId, Long messageId, ProjectMessageRequest request) {
        ProjectMessage msg = projectMessageRepository.findById(messageId)
                .orElseThrow(() -> new ResourceNotFoundException("Message not found: " + messageId));
        if (!msg.getProject().getId().equals(projectId)) {
            throw new IllegalArgumentException("Message does not belong to the specified project");
        }

        User currentUser = getAuthenticatedUser();
        if (!msg.getSender().getId().equals(currentUser.getId())) {
            throw new UnauthorizedAccessException("You are not authorized to edit this message");
        }

        msg.setMessage(request.message());
        msg.setEdited(true);
        ProjectMessage saved = projectMessageRepository.save(msg);
        return mapToResponse(saved);
    }

    @Transactional
    public void deleteMessage(Long projectId, Long messageId) {
        ProjectMessage msg = projectMessageRepository.findById(messageId)
                .orElseThrow(() -> new ResourceNotFoundException("Message not found: " + messageId));
        if (!msg.getProject().getId().equals(projectId)) {
            throw new IllegalArgumentException("Message does not belong to the specified project");
        }

        User currentUser = getAuthenticatedUser();
        Project project = msg.getProject();

        boolean isSender = msg.getSender().getId().equals(currentUser.getId());
        boolean isProjectOwner = project.getOwner() != null && project.getOwner().getId().equals(currentUser.getId());
        boolean isAdmin = currentUser.getRoles().stream()
                .anyMatch(r -> r.getName() == com.taskforge.common.constant.UserRole.ROLE_ADMIN);

        if (!isSender && !isProjectOwner && !isAdmin) {
            throw new UnauthorizedAccessException("You are not authorized to delete this message");
        }

        projectMessageRepository.delete(msg);
    }
}
