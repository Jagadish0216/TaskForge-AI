package com.taskforge.module.project.entity;

import com.taskforge.common.constant.ProjectMemberRole;
import com.taskforge.common.entity.BaseEntity;
import com.taskforge.module.user.entity.User;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import java.util.Objects;

@Entity
@Table(
        name = "project_members",
        uniqueConstraints = @UniqueConstraint(
                name = "uk_project_user",
                columnNames = {"project_id", "user_id"}
        )
)
public class ProjectMember extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotNull
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "project_id", nullable = false)
    private Project project;

    @NotNull
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @NotNull
    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    private ProjectMemberRole role;

    public ProjectMember() {}

    public ProjectMember(Long id, Project project, User user, ProjectMemberRole role) {
        this.id = id;
        this.project = project;
        this.user = user;
        this.role = role;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Project getProject() { return project; }
    public void setProject(Project project) { this.project = project; }

    public User getUser() { return user; }
    public void setUser(User user) { this.user = user; }

    public ProjectMemberRole getRole() { return role; }
    public void setRole(ProjectMemberRole role) { this.role = role; }

    public static ProjectMemberBuilder builder() {
        return new ProjectMemberBuilder();
    }

    public static class ProjectMemberBuilder {
        private Long id;
        private Project project;
        private User user;
        private ProjectMemberRole role;

        public ProjectMemberBuilder id(Long id) { this.id = id; return this; }
        public ProjectMemberBuilder project(Project project) { this.project = project; return this; }
        public ProjectMemberBuilder user(User user) { this.user = user; return this; }
        public ProjectMemberBuilder role(ProjectMemberRole role) { this.role = role; return this; }

        public ProjectMember build() {
            return new ProjectMember(id, project, user, role);
        }
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        ProjectMember member = (ProjectMember) o;
        return Objects.equals(id, member.id);
    }

    @Override
    public int hashCode() {
        return Objects.hash(id);
    }
}
