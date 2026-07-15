package com.taskforge.module.project.entity;

import com.taskforge.common.constant.ProjectPriority;
import com.taskforge.common.constant.ProjectStatus;
import com.taskforge.common.constant.ProjectVisibility;
import com.taskforge.common.entity.BaseEntity;
import com.taskforge.module.user.entity.User;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.time.LocalDate;
import java.util.Objects;

@Entity
@Table(name = "projects")
public class Project extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank
    @Column(nullable = false, length = 100)
    private String name;

    @NotBlank
    @Column(name = "project_key", nullable = false, unique = true, length = 20)
    private String projectKey;

    @Column(columnDefinition = "TEXT")
    private String description;

    @NotNull
    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    private ProjectStatus status;

    @NotNull
    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    private ProjectPriority priority;

    @NotNull
    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    private ProjectVisibility visibility;

    @Column(nullable = false)
    private boolean archived = false;

    @Column(name = "start_date")
    private LocalDate startDate;

    @Column(name = "end_date")
    private LocalDate endDate;

    @NotNull
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "owner_id", nullable = false)
    private User owner;

    public Project() {}

    public Project(Long id, String name, String projectKey, String description, ProjectStatus status, ProjectPriority priority, ProjectVisibility visibility, boolean archived, LocalDate startDate, LocalDate endDate, User owner) {
        this.id = id;
        this.name = name;
        this.projectKey = projectKey;
        this.description = description;
        this.status = status;
        this.priority = priority;
        this.visibility = visibility;
        this.archived = archived;
        this.startDate = startDate;
        this.endDate = endDate;
        this.owner = owner;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getProjectKey() { return projectKey; }
    public void setProjectKey(String projectKey) { this.projectKey = projectKey; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public ProjectStatus getStatus() { return status; }
    public void setStatus(ProjectStatus status) { this.status = status; }

    public ProjectPriority getPriority() { return priority; }
    public void setPriority(ProjectPriority priority) { this.priority = priority; }

    public ProjectVisibility getVisibility() { return visibility; }
    public void setVisibility(ProjectVisibility visibility) { this.visibility = visibility; }

    public boolean isArchived() { return archived; }
    public void setArchived(boolean archived) { this.archived = archived; }

    public LocalDate getStartDate() { return startDate; }
    public void setStartDate(LocalDate startDate) { this.startDate = startDate; }

    public LocalDate getEndDate() { return endDate; }
    public void setEndDate(LocalDate endDate) { this.endDate = endDate; }

    public User getOwner() { return owner; }
    public void setOwner(User owner) { this.owner = owner; }

    public static ProjectBuilder builder() {
        return new ProjectBuilder();
    }

    public static class ProjectBuilder {
        private Long id;
        private String name;
        private String projectKey;
        private String description;
        private ProjectStatus status;
        private ProjectPriority priority;
        private ProjectVisibility visibility;
        private boolean archived = false;
        private LocalDate startDate;
        private LocalDate endDate;
        private User owner;

        public ProjectBuilder id(Long id) { this.id = id; return this; }
        public ProjectBuilder name(String name) { this.name = name; return this; }
        public ProjectBuilder projectKey(String projectKey) { this.projectKey = projectKey; return this; }
        public ProjectBuilder description(String description) { this.description = description; return this; }
        public ProjectBuilder status(ProjectStatus status) { this.status = status; return this; }
        public ProjectBuilder priority(ProjectPriority priority) { this.priority = priority; return this; }
        public ProjectBuilder visibility(ProjectVisibility visibility) { this.visibility = visibility; return this; }
        public ProjectBuilder archived(boolean archived) { this.archived = archived; return this; }
        public ProjectBuilder startDate(LocalDate startDate) { this.startDate = startDate; return this; }
        public ProjectBuilder endDate(LocalDate endDate) { this.endDate = endDate; return this; }
        public ProjectBuilder owner(User owner) { this.owner = owner; return this; }

        public Project build() {
            return new Project(id, name, projectKey, description, status, priority, visibility, archived, startDate, endDate, owner);
        }
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        Project project = (Project) o;
        return Objects.equals(id, project.id);
    }

    @Override
    public int hashCode() {
        return Objects.hash(id);
    }
}
