package com.taskforge.module.storage.service;

import com.taskforge.common.constant.ActivityType;
import com.taskforge.common.exception.ResourceNotFoundException;
import com.taskforge.common.exception.UnauthorizedAccessException;
import com.taskforge.module.activity.service.ActivityService;
import com.taskforge.module.project.entity.Project;
import com.taskforge.module.project.repository.ProjectRepository;
import com.taskforge.module.storage.dto.AttachmentResponse;
import com.taskforge.module.storage.entity.Attachment;
import com.taskforge.module.storage.mapper.AttachmentMapper;
import com.taskforge.module.storage.repository.AttachmentRepository;
import com.taskforge.module.task.entity.Task;
import com.taskforge.module.task.repository.TaskRepository;
import com.taskforge.module.user.entity.User;
import com.taskforge.module.user.repository.UserRepository;
import com.taskforge.security.SecurityUtils;
import org.springframework.core.io.Resource;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@Service
public class AttachmentService {

    private final AttachmentRepository attachmentRepository;
    private final ProjectRepository projectRepository;
    private final TaskRepository taskRepository;
    private final UserRepository userRepository;
    private final StorageService storageService;
    private final AttachmentMapper attachmentMapper;
    private final ActivityService activityService;

    public AttachmentService(
            AttachmentRepository attachmentRepository,
            ProjectRepository projectRepository,
            TaskRepository taskRepository,
            UserRepository userRepository,
            StorageService storageService,
            AttachmentMapper attachmentMapper,
            ActivityService activityService
    ) {
        this.attachmentRepository = attachmentRepository;
        this.projectRepository = projectRepository;
        this.taskRepository = taskRepository;
        this.userRepository = userRepository;
        this.storageService = storageService;
        this.attachmentMapper = attachmentMapper;
        this.activityService = activityService;
    }

    @Transactional
    public AttachmentResponse uploadAttachment(MultipartFile file, Long taskId, Long projectId) {
        Project project = null;
        if (projectId != null) {
            project = projectRepository.findById(projectId)
                    .orElseThrow(() -> new ResourceNotFoundException("Project not found with id: " + projectId));
        }

        Task task = null;
        if (taskId != null) {
            task = taskRepository.findById(taskId)
                    .orElseThrow(() -> new ResourceNotFoundException("Task not found with id: " + taskId));
            if (project == null) {
                project = task.getProject();
            }
        }

        User uploader = getCurrentAuthenticatedUser(project);

        String uniqueName = storageService.store(file);

        Attachment attachment = Attachment.builder()
                .fileName(file.getOriginalFilename())
                .fileType(file.getContentType())
                .fileSize(file.getSize())
                .filePath(uniqueName)
                .task(task)
                .project(project)
                .uploadedBy(uploader)
                .build();

        Attachment savedAttachment = attachmentRepository.save(attachment);

        activityService.recordActivity(
                ActivityType.ATTACHMENT_UPLOADED,
                "Attachment uploaded: " + file.getOriginalFilename() + (task != null ? " on task: " + task.getTitle() : ""),
                project,
                task
        );

        return attachmentMapper.toResponse(savedAttachment);
    }

    @Transactional(readOnly = true)
    public Resource downloadAttachmentFile(Long id) {
        if (id == null) {
            throw new ResourceNotFoundException("Attachment ID must not be null");
        }

        Attachment attachment = attachmentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Attachment not found with id: " + id));
        return storageService.loadAsResource(attachment.getFilePath());
    }

    @Transactional(readOnly = true)
    public AttachmentResponse getAttachmentMetadata(Long id) {
        if (id == null) {
            throw new ResourceNotFoundException("Attachment ID must not be null");
        }

        Attachment attachment = attachmentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Attachment not found with id: " + id));
        return attachmentMapper.toResponse(attachment);
    }

    @Transactional
    public void deleteAttachment(Long id) {
        if (id == null) {
            throw new ResourceNotFoundException("Attachment ID must not be null");
        }

        Attachment attachment = attachmentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Attachment not found with id: " + id));

        storageService.delete(attachment.getFilePath());

        attachmentRepository.delete(attachment);
    }

    @Transactional(readOnly = true)
    public List<AttachmentResponse> getAttachmentsByTask(Long taskId) {
        if (taskId == null) {
            throw new ResourceNotFoundException("Task ID must not be null");
        }

        Task task = taskRepository.findById(taskId)
                .orElseThrow(() -> new ResourceNotFoundException("Task not found with id: " + taskId));
        List<Attachment> list = attachmentRepository.findByTask(task);
        return attachmentMapper.toResponseList(list);
    }

    @Transactional(readOnly = true)
    public List<AttachmentResponse> getAttachmentsByProject(Long projectId) {
        if (projectId == null) {
            throw new ResourceNotFoundException("Project ID must not be null");
        }

        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new ResourceNotFoundException("Project not found with id: " + projectId));
        List<Attachment> list = attachmentRepository.findByProject(project);
        return attachmentMapper.toResponseList(list);
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
}
