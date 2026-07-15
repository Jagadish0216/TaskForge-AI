package com.taskforge.module.notification.service;

import com.taskforge.common.constant.NotificationType;
import com.taskforge.common.exception.ResourceNotFoundException;
import com.taskforge.common.exception.UnauthorizedAccessException;
import com.taskforge.module.notification.dto.NotificationPreferenceResponse;
import com.taskforge.module.notification.dto.NotificationPreferenceUpdateRequest;
import com.taskforge.module.notification.dto.NotificationResponse;
import com.taskforge.module.notification.entity.Notification;
import com.taskforge.module.notification.entity.NotificationPreference;
import com.taskforge.module.notification.mapper.NotificationMapper;
import com.taskforge.module.notification.repository.NotificationPreferenceRepository;
import com.taskforge.module.notification.repository.NotificationRepository;
import com.taskforge.module.user.entity.User;
import com.taskforge.module.user.repository.UserRepository;
import com.taskforge.security.SecurityUtils;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class NotificationService {

    private final NotificationRepository notificationRepository;
    private final NotificationPreferenceRepository preferenceRepository;
    private final UserRepository userRepository;
    private final NotificationMapper notificationMapper;

    public NotificationService(
            NotificationRepository notificationRepository,
            NotificationPreferenceRepository preferenceRepository,
            UserRepository userRepository,
            NotificationMapper notificationMapper
    ) {
        this.notificationRepository = notificationRepository;
        this.preferenceRepository = preferenceRepository;
        this.userRepository = userRepository;
        this.notificationMapper = notificationMapper;
    }

    @Transactional
    public void createNotification(User recipient, String title, String message, NotificationType type) {
        NotificationPreference preference = getOrCreatePreference(recipient);
        boolean shouldSend = switch (type) {
            case TASK_ASSIGNED -> preference.isTaskAssigned();
            case COMMENT_ADDED -> preference.isCommentMention(); // We use commentMention for comment related notifications
            case PROJECT_INVITATION -> preference.isProjectInvitation();
            case TASK_OVERDUE -> preference.isTaskDeadline(); // We use taskDeadline for task overdue/deadlines
            default -> true;
        };

        if (shouldSend) {
            Notification notification = Notification.builder()
                    .recipient(recipient)
                    .title(title)
                    .message(message)
                    .type(type)
                    .isRead(false)
                    .build();
            notificationRepository.save(notification);
        }
    }

    @Transactional
    public void markAsRead(Long id) {
        Notification notification = notificationRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Notification not found with id: " + id));
        notification.setRead(true);
        notificationRepository.save(notification);
    }

    @Transactional
    public void markAllAsRead(Long userId) {
        User recipient = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));
        List<Notification> unread = notificationRepository.findByRecipientAndIsReadFalse(recipient);
        unread.forEach(n -> n.setRead(true));
        notificationRepository.saveAll(unread);
    }

    @Transactional(readOnly = true)
    public long getUnreadCount(Long userId) {
        User recipient = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));
        return notificationRepository.findByRecipientAndIsReadFalse(recipient).size();
    }

    @Transactional(readOnly = true)
    public Page<NotificationResponse> getNotifications(Long userId, Pageable pageable) {
        User recipient = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));
        Page<Notification> page = notificationRepository.findAll(
                (root, query, cb) -> cb.equal(root.get("recipient"), recipient),
                pageable
        );
        return page.map(notificationMapper::toResponse);
    }

    @Transactional
    public NotificationPreferenceResponse getPreferences(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));
        NotificationPreference preference = getOrCreatePreference(user);
        return notificationMapper.toPreferenceResponse(preference);
    }

    @Transactional
    public NotificationPreferenceResponse updatePreferences(Long userId, NotificationPreferenceUpdateRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));
        NotificationPreference preference = getOrCreatePreference(user);

        if (request.taskAssigned() != null) {
            preference.setTaskAssigned(request.taskAssigned());
        }
        if (request.commentMention() != null) {
            preference.setCommentMention(request.commentMention());
        }
        if (request.projectInvitation() != null) {
            preference.setProjectInvitation(request.projectInvitation());
        }
        if (request.taskDeadline() != null) {
            preference.setTaskDeadline(request.taskDeadline());
        }

        NotificationPreference saved = preferenceRepository.save(preference);
        return notificationMapper.toPreferenceResponse(saved);
    }

    private NotificationPreference getOrCreatePreference(User user) {
        return preferenceRepository.findByUser(user)
                .orElseGet(() -> {
                    NotificationPreference newPref = NotificationPreference.builder()
                            .user(user)
                            .taskAssigned(true)
                            .commentMention(true)
                            .projectInvitation(true)
                            .taskDeadline(true)
                            .build();
                    return preferenceRepository.save(newPref);
                });
    }

    public User getCurrentAuthenticatedUser() {
        String email = SecurityUtils.getCurrentUserUsername().orElse(null);
        if (email != null) {
            return userRepository.findByEmail(email)
                    .orElseThrow(() -> new ResourceNotFoundException("User profile not found with email: " + email));
        }
        return userRepository.findAll().stream().findFirst()
                .orElseThrow(() -> new UnauthorizedAccessException("No user is currently authenticated or exists in database"));
    }
}
