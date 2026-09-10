package com.taskforge.module.task.service;

import com.taskforge.common.constant.ActivityType;
import com.taskforge.common.constant.NotificationType;
import com.taskforge.common.exception.InvalidStateException;
import com.taskforge.common.exception.ResourceNotFoundException;
import com.taskforge.common.exception.UnauthorizedAccessException;
import com.taskforge.module.activity.service.ActivityService;
import com.taskforge.module.notification.service.NotificationService;
import com.taskforge.module.task.dto.*;
import com.taskforge.module.task.entity.Comment;
import com.taskforge.module.task.entity.CommentHistory;
import com.taskforge.module.task.entity.Task;
import com.taskforge.module.task.mapper.CommentMapper;
import com.taskforge.module.task.repository.CommentHistoryRepository;
import com.taskforge.module.task.repository.CommentRepository;
import com.taskforge.module.project.repository.ProjectMemberRepository;
import com.taskforge.module.task.repository.TaskRepository;
import com.taskforge.module.user.entity.User;
import com.taskforge.module.user.repository.UserRepository;
import com.taskforge.security.SecurityUtils;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

@Service
public class CommentService {

    private final CommentRepository commentRepository;
    private final CommentHistoryRepository commentHistoryRepository;
    private final TaskRepository taskRepository;
    private final UserRepository userRepository;
    private final ProjectMemberRepository projectMemberRepository;
    private final CommentMapper commentMapper;
    private final ActivityService activityService;
    private final NotificationService notificationService;

    public CommentService(
            CommentRepository commentRepository,
            CommentHistoryRepository commentHistoryRepository,
            TaskRepository taskRepository,
            UserRepository userRepository,
            ProjectMemberRepository projectMemberRepository,
            CommentMapper commentMapper,
            ActivityService activityService,
            NotificationService notificationService
    ) {
        this.commentRepository = commentRepository;
        this.commentHistoryRepository = commentHistoryRepository;
        this.taskRepository = taskRepository;
        this.userRepository = userRepository;
        this.projectMemberRepository = projectMemberRepository;
        this.commentMapper = commentMapper;
        this.activityService = activityService;
        this.notificationService = notificationService;
    }

    @Transactional
    public CommentResponse createComment(CommentCreateRequest request) {
        if (request.taskId() == null) {
            throw new InvalidStateException("Task ID must not be null");
        }

        Task task = taskRepository.findById(request.taskId())
                .orElseThrow(() -> new ResourceNotFoundException("Task not found with id: " + request.taskId()));

        User author = getCurrentAuthenticatedUser();
        verifyProjectWriteAccess(task.getProject(), author);

        Comment parent = null;
        if (request.parentCommentId() != null) {
            parent = commentRepository.findById(request.parentCommentId())
                    .orElseThrow(() -> new ResourceNotFoundException("Parent comment not found with id: " + request.parentCommentId()));
            if (!parent.getTask().getId().equals(task.getId())) {
                throw new InvalidStateException("Parent comment does not belong to the same task");
            }
        }

        Comment comment = Comment.builder()
                .content(request.content())
                .task(task)
                .author(author)
                .parentComment(parent)
                .deleted(false)
                .edited(false)
                .build();

        Comment savedComment = commentRepository.save(comment);

        activityService.recordActivity(
                ActivityType.COMMENT_ADDED,
                "Comment added by " + author.getEmail() + " on task: " + task.getTitle(),
                task.getProject(),
                task
        );

        parseAndNotifyMentions(request.content(), author, task);

        if (task.getAssignee() != null && !task.getAssignee().getId().equals(author.getId())) {
            notificationService.createNotification(
                    task.getAssignee(),
                    "New comment on task " + task.getTitle(),
                    author.getFirstName() + " " + author.getLastName() + " commented: " + request.content(),
                    NotificationType.COMMENT_ADDED
            );
        }

        return commentMapper.toResponse(savedComment);
    }

    @Transactional
    public CommentResponse updateComment(Long id, CommentUpdateRequest request) {
        if (id == null) {
            throw new ResourceNotFoundException("Comment ID must not be null");
        }

        Comment comment = commentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Comment not found with id: " + id));

        if (comment.isDeleted()) {
            throw new InvalidStateException("Cannot update a deleted comment");
        }

        User currentUser = getCurrentAuthenticatedUser();
        verifyProjectWriteAccess(comment.getTask().getProject(), currentUser);

        if (!comment.getAuthor().getId().equals(currentUser.getId())) {
            throw new UnauthorizedAccessException("You can only edit comments you authored");
        }

        CommentHistory history = CommentHistory.builder()
                .comment(comment)
                .oldContent(comment.getContent())
                .editedAt(LocalDateTime.now())
                .editedBy(currentUser)
                .build();
        commentHistoryRepository.save(history);

        comment.setContent(request.content());
        comment.setEdited(true);
        Comment updatedComment = commentRepository.save(comment);

        return commentMapper.toResponse(updatedComment);
    }

    @Transactional
    public void deleteComment(Long id) {
        if (id == null) {
            throw new ResourceNotFoundException("Comment ID must not be null");
        }

        Comment comment = commentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Comment not found with id: " + id));

        User currentUser = getCurrentAuthenticatedUser();
        boolean isAdmin = currentUser.getRoles().stream().anyMatch(r -> r.getName() == com.taskforge.common.constant.UserRole.ROLE_ADMIN);
        boolean isAuthor = comment.getAuthor().getId().equals(currentUser.getId());

        com.taskforge.module.project.entity.ProjectMember member = projectMemberRepository.findByProjectAndUser(comment.getTask().getProject(), currentUser).orElse(null);
        boolean isProjectManager = member != null && (member.getRole() == com.taskforge.common.constant.ProjectMemberRole.OWNER || member.getRole() == com.taskforge.common.constant.ProjectMemberRole.MANAGER);

        if (!isAuthor && !isProjectManager && !isAdmin) {
            throw new UnauthorizedAccessException("You do not have permission to delete this comment");
        }

        comment.setDeleted(true);
        commentRepository.save(comment);
    }

    @Transactional(readOnly = true)
    public Page<CommentResponse> searchComments(CommentSearchRequest searchRequest, Pageable pageable) {
        User currentUser = getCurrentAuthenticatedUser();
        List<Comment> comments;

        if (searchRequest.taskId() != null) {
            Task task = taskRepository.findById(searchRequest.taskId())
                    .orElseThrow(() -> new ResourceNotFoundException("Task not found with id: " + searchRequest.taskId()));
            verifyProjectReadAccess(task.getProject(), currentUser);

            if (searchRequest.includeDeleted() != null && searchRequest.includeDeleted()) {
                comments = commentRepository.findByTask(task);
            } else {
                comments = commentRepository.findByTaskAndDeletedFalse(task);
            }
        } else {
            comments = commentRepository.findAll().stream()
                    .filter(c -> isProjectMemberOrAdmin(c.getTask().getProject(), currentUser))
                    .toList();
        }

        if (StringUtils.hasText(searchRequest.keyword())) {
            String keyword = searchRequest.keyword().toLowerCase();
            comments = comments.stream()
                    .filter(c -> c.getContent().toLowerCase().contains(keyword))
                    .toList();
        }

        int start = (int) pageable.getOffset();
        int end = Math.min((start + pageable.getPageSize()), comments.size());

        List<Comment> sublist = new ArrayList<>();
        if (start < comments.size()) {
            sublist = comments.subList(start, end);
        }

        List<CommentResponse> responseList = commentMapper.toResponseList(sublist);
        return new PageImpl<>(responseList, pageable, comments.size());
    }

    @Transactional(readOnly = true)
    public List<com.taskforge.module.task.dto.CommentHistoryResponse> getCommentHistory(Long commentId) {
        if (commentId == null) {
            throw new ResourceNotFoundException("Comment ID must not be null");
        }

        Comment comment = commentRepository.findById(commentId)
                .orElseThrow(() -> new ResourceNotFoundException("Comment not found with id: " + commentId));

        User currentUser = getCurrentAuthenticatedUser();
        verifyProjectReadAccess(comment.getTask().getProject(), currentUser);

        List<CommentHistory> history = commentHistoryRepository.findByCommentOrderByEditedAtDesc(comment);
        return commentMapper.toHistoryResponseList(history);
    }

    private void parseAndNotifyMentions(String content, User author, Task task) {
        Pattern pattern = Pattern.compile("@([a-zA-Z0-9_!#$%&'*+/=?`{|}~^-]+(?:\\.[a-zA-Z0-9_!#$%&'*+/=?`{|}~^-]+)*@[a-zA-Z0-9-]+(?:\\.[a-zA-Z0-9-]+)*)");
        Matcher matcher = pattern.matcher(content);
        while (matcher.find()) {
            String email = matcher.group(1);
            userRepository.findByEmail(email).ifPresent(mentionedUser -> {
                if (!mentionedUser.getId().equals(author.getId())) {
                    notificationService.createNotification(
                            mentionedUser,
                            "You were mentioned in a comment",
                            author.getFirstName() + " " + author.getLastName() + " mentioned you in task: " + task.getTitle(),
                            NotificationType.COMMENT_ADDED
                    );
                }
            });
        }
    }

    private User getCurrentAuthenticatedUser() {
        String email = SecurityUtils.getCurrentUserUsername()
                .orElseThrow(() -> new UnauthorizedAccessException("No user is currently authenticated"));
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User profile not found with email: " + email));
    }

    private void verifyProjectReadAccess(com.taskforge.module.project.entity.Project project, User user) {
        if (isProjectMemberOrAdmin(project, user)) {
            return;
        }
        throw new UnauthorizedAccessException("You do not have permission to access comments in this project");
    }

    private void verifyProjectWriteAccess(com.taskforge.module.project.entity.Project project, User user) {
        boolean isAdmin = user.getRoles().stream().anyMatch(r -> r.getName() == com.taskforge.common.constant.UserRole.ROLE_ADMIN);
        if (isAdmin) {
            return;
        }

        com.taskforge.module.project.entity.ProjectMember member = projectMemberRepository.findByProjectAndUser(project, user)
                .orElseThrow(() -> new UnauthorizedAccessException("You do not have permission to access comments in this project"));

        if (member.getRole() == com.taskforge.common.constant.ProjectMemberRole.VIEWER) {
            throw new UnauthorizedAccessException("Viewers have read-only access to this project");
        }
    }

    private boolean isProjectMemberOrAdmin(com.taskforge.module.project.entity.Project project, User user) {
        boolean isAdmin = user.getRoles().stream().anyMatch(r -> r.getName() == com.taskforge.common.constant.UserRole.ROLE_ADMIN);
        if (isAdmin) {
            return true;
        }
        return projectMemberRepository.existsByProjectAndUser(project, user);
    }
}
