package com.taskforge.module.activity.entity;

import com.taskforge.common.constant.ActivityType;
import com.taskforge.common.entity.BaseEntity;
import com.taskforge.module.project.entity.Project;
import com.taskforge.module.task.entity.Task;
import com.taskforge.module.user.entity.User;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.util.Objects;

@Entity
@Table(name = "activity_logs")
public class ActivityLog extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotNull
    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 50)
    private ActivityType type;

    @NotBlank
    @Column(nullable = false, columnDefinition = "TEXT")
    private String description;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "project_id")
    private Project project;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "task_id")
    private Task task;

    @NotNull
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    public ActivityLog() {}

    public ActivityLog(Long id, ActivityType type, String description, Project project, Task task, User user) {
        this.id = id;
        this.type = type;
        this.description = description;
        this.project = project;
        this.task = task;
        this.user = user;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public ActivityType getType() { return type; }
    public void setType(ActivityType type) { this.type = type; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public Project getProject() { return project; }
    public void setProject(Project project) { this.project = project; }

    public Task getTask() { return task; }
    public void setTask(Task task) { this.task = task; }

    public User getUser() { return user; }
    public void setUser(User user) { this.user = user; }

    public static ActivityLogBuilder builder() {
        return new ActivityLogBuilder();
    }

    public static class ActivityLogBuilder {
        private Long id;
        private ActivityType type;
        private String description;
        private Project project;
        private Task task;
        private User user;

        public ActivityLogBuilder id(Long id) { this.id = id; return this; }
        public ActivityLogBuilder type(ActivityType type) { this.type = type; return this; }
        public ActivityLogBuilder description(String description) { this.description = description; return this; }
        public ActivityLogBuilder project(Project project) { this.project = project; return this; }
        public ActivityLogBuilder task(Task task) { this.task = task; return this; }
        public ActivityLogBuilder user(User user) { this.user = user; return this; }

        public ActivityLog build() {
            return new ActivityLog(id, type, description, project, task, user);
        }
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        ActivityLog that = (ActivityLog) o;
        return Objects.equals(id, that.id);
    }

    @Override
    public int hashCode() {
        return Objects.hash(id);
    }

    @Override
    public String toString() {
        return "ActivityLog{" +
                "id=" + id +
                ", type=" + type +
                ", description='" + description + '\'' +
                '}';
    }
}
