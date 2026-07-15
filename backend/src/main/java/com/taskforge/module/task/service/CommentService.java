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
    private final CommentMapper commentMapper;
    private final ActivityService activityService;
    private final NotificationService notificationService;

    public CommentService(
            CommentRepository commentRepository,
            CommentHistoryRepository commentHistoryRepository,
            TaskRepository taskRepository,
            UserRepository userRepository,
            CommentMapper commentMapper,
            ActivityService activityService,
            NotificationService notificationService
    ) {
        this.commentRepository = commentRepository;
        this.commentHistoryRepository = commentHistoryRepository;
        this.taskRepository = taskRepository;
        this.userRepository = userRepository;
        this.commentMapper = commentMapper;
        this.activityService = activityService;
        this.notificationService = notificationService;
    }

    @Transactional
    public CommentResponse createComment(CommentCreateRequest request) {
        Task task = taskRepository.findById(request.taskId())
                .orElseThrow(() -> new ResourceNotFoundException("Task not found with id: " + request.taskId()));

        User author = getCurrentAuthenticatedUser(task.getProject());

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

        // Record Activity
        activityService.recordActivity(
                ActivityType.COMMENT_ADDED,
                "Comment added by " + author.getEmail() + " on task: " + task.getTitle(),
                task.getProject(),
                task
        );

        // Parse Mentions
        parseAndNotifyMentions(request.content(), author, task);

        // Notify Assignee
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
        Comment comment = commentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Comment not found with id: " + id));

        if (comment.isDeleted()) {
            throw new InvalidStateException("Cannot update a deleted comment");
        }

        User currentUser = getCurrentAuthenticatedUser(comment.getTask().getProject());
        if (!comment.getAuthor().getId().equals(currentUser.getId())) {
            throw new UnauthorizedAccessException("You can only edit comments you authored");
        }

        // Save History
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
        Comment comment = commentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Comment not found with id: " + id));

        User currentUser = getCurrentAuthenticatedUser(comment.getTask().getProject());
        boolean isOwner = comment.getTask().getProject().getOwner().getId().equals(currentUser.getId());
        boolean isAuthor = comment.getAuthor().getId().equals(currentUser.getId());

        if (!isAuthor && !isOwner) {
            throw new UnauthorizedAccessException("You do not have permission to delete this comment");
        }

        // Soft delete
        comment.setDeleted(true);
        commentRepository.save(comment);
    }

    @Transactional(readOnly = true)
    public Page<CommentResponse> searchComments(CommentSearchRequest searchRequest, Pageable pageable) {
        List<Comment> comments;
        if (searchRequest.taskId() != null) {
            Task task = taskRepository.findById(searchRequest.taskId())
                    .orElseThrow(() -> new ResourceNotFoundException("Task not found with id: " + searchRequest.taskId()));
            if (searchRequest.includeDeleted() != null && searchRequest.includeDeleted()) {
                comments = commentRepository.findByTask(task);
            } else {
                comments = commentRepository.findByTaskAndDeletedFalse(task);
            }
        } else {
            comments = commentRepository.findAll();
        }

        // Filter keyword locally to keep logic simple and SOLID
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
        Comment comment = commentRepository.findById(commentId)
                .orElseThrow(() -> new ResourceNotFoundException("Comment not found with id: " + commentId));
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

    private User getCurrentAuthenticatedUser(com.taskforge.module.project.entity.Project project) {
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
