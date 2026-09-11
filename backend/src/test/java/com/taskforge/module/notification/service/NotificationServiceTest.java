package com.taskforge.module.notification.service;

import com.taskforge.common.exception.ResourceNotFoundException;
import com.taskforge.module.notification.mapper.NotificationMapper;
import com.taskforge.module.notification.repository.NotificationPreferenceRepository;
import com.taskforge.module.notification.repository.NotificationRepository;
import com.taskforge.module.user.entity.User;
import com.taskforge.module.user.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class NotificationServiceTest {

    private NotificationService notificationService;

    @Mock
    private NotificationRepository notificationRepository;

    @Mock
    private NotificationPreferenceRepository preferenceRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private NotificationMapper notificationMapper;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
        notificationService = new NotificationService(
                notificationRepository,
                preferenceRepository,
                userRepository,
                notificationMapper
        );
    }

    @Test
    void testGetUnreadCount_Success() {
        Long userId = 1L;
        User user = new User();
        user.setId(userId);
        user.setEmail("user@example.com");

        when(userRepository.findById(userId)).thenReturn(Optional.of(user));
        when(notificationRepository.countByRecipientAndIsReadFalse(user)).thenReturn(5L);

        long unreadCount = notificationService.getUnreadCount(userId);

        assertEquals(5L, unreadCount);
        verify(userRepository).findById(userId);
        verify(notificationRepository).countByRecipientAndIsReadFalse(user);
        verify(notificationRepository, never()).findByRecipientAndIsReadFalse(any());
    }

    @Test
    void testGetUnreadCount_UserNotFound() {
        Long userId = 99L;
        when(userRepository.findById(userId)).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class, () -> notificationService.getUnreadCount(userId));
        verify(notificationRepository, never()).countByRecipientAndIsReadFalse(any());
    }
}
