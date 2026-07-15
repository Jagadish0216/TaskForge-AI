package com.taskforge.module.notification.repository;

import com.taskforge.module.notification.entity.Notification;
import com.taskforge.module.user.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface NotificationRepository extends JpaRepository<Notification, Long>, JpaSpecificationExecutor<Notification> {
    List<Notification> findByRecipientAndIsReadFalse(User recipient);
    List<Notification> findByRecipient(User recipient);
}
