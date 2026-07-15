package com.taskforge.module.notification.entity;

import com.taskforge.module.user.entity.User;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import java.util.Objects;

@Entity
@Table(name = "notification_preferences")
public class NotificationPreference {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotNull
    @OneToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", unique = true, nullable = false)
    private User user;

    @Column(name = "task_assigned", nullable = false)
    private boolean taskAssigned = true;

    @Column(name = "comment_mention", nullable = false)
    private boolean commentMention = true;

    @Column(name = "project_invitation", nullable = false)
    private boolean projectInvitation = true;

    @Column(name = "task_deadline", nullable = false)
    private boolean taskDeadline = true;

    public NotificationPreference() {}

    public NotificationPreference(Long id, User user, boolean taskAssigned, boolean commentMention, boolean projectInvitation, boolean taskDeadline) {
        this.id = id;
        this.user = user;
        this.taskAssigned = taskAssigned;
        this.commentMention = commentMention;
        this.projectInvitation = projectInvitation;
        this.taskDeadline = taskDeadline;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public User getUser() { return user; }
    public void setUser(User user) { this.user = user; }

    public boolean isTaskAssigned() { return taskAssigned; }
    public void setTaskAssigned(boolean taskAssigned) { this.taskAssigned = taskAssigned; }

    public boolean isCommentMention() { return commentMention; }
    public void setCommentMention(boolean commentMention) { this.commentMention = commentMention; }

    public boolean isProjectInvitation() { return projectInvitation; }
    public void setProjectInvitation(boolean projectInvitation) { this.projectInvitation = projectInvitation; }

    public boolean isTaskDeadline() { return taskDeadline; }
    public void setTaskDeadline(boolean taskDeadline) { this.taskDeadline = taskDeadline; }

    public static NotificationPreferenceBuilder builder() {
        return new NotificationPreferenceBuilder();
    }

    public static class NotificationPreferenceBuilder {
        private Long id;
        private User user;
        private boolean taskAssigned = true;
        private boolean commentMention = true;
        private boolean projectInvitation = true;
        private boolean taskDeadline = true;

        public NotificationPreferenceBuilder id(Long id) { this.id = id; return this; }
        public NotificationPreferenceBuilder user(User user) { this.user = user; return this; }
        public NotificationPreferenceBuilder taskAssigned(boolean taskAssigned) { this.taskAssigned = taskAssigned; return this; }
        public NotificationPreferenceBuilder commentMention(boolean commentMention) { this.commentMention = commentMention; return this; }
        public NotificationPreferenceBuilder projectInvitation(boolean projectInvitation) { this.projectInvitation = projectInvitation; return this; }
        public NotificationPreferenceBuilder taskDeadline(boolean taskDeadline) { this.taskDeadline = taskDeadline; return this; }

        public NotificationPreference build() {
            return new NotificationPreference(id, user, taskAssigned, commentMention, projectInvitation, taskDeadline);
        }
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        NotificationPreference that = (NotificationPreference) o;
        return Objects.equals(id, that.id);
    }

    @Override
    public int hashCode() {
        return Objects.hash(id);
    }
}
