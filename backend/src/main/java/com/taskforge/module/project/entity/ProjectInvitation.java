package com.taskforge.module.project.entity;

import com.taskforge.common.constant.InvitationStatus;
import com.taskforge.common.constant.ProjectMemberRole;
import com.taskforge.common.entity.BaseEntity;
import com.taskforge.module.user.entity.User;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import java.util.Objects;

@Entity
@Table(
        name = "project_invitations",
        uniqueConstraints = @UniqueConstraint(
                name = "uk_project_invitee_pending",
                columnNames = {"project_id", "invitee_id", "status"}
        )
)
public class ProjectInvitation extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotNull
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "project_id", nullable = false)
    private Project project;

    @NotNull
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "invitee_id", nullable = false)
    private User invitee;

    @NotNull
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "inviter_id", nullable = false)
    private User inviter;

    @NotNull
    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    private ProjectMemberRole role;

    @NotNull
    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    private InvitationStatus status = InvitationStatus.PENDING;

    public ProjectInvitation() {}

    public ProjectInvitation(Long id, Project project, User invitee, User inviter, ProjectMemberRole role, InvitationStatus status) {
        this.id = id;
        this.project = project;
        this.invitee = invitee;
        this.inviter = inviter;
        this.role = role;
        this.status = status != null ? status : InvitationStatus.PENDING;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Project getProject() { return project; }
    public void setProject(Project project) { this.project = project; }

    public User getInvitee() { return invitee; }
    public void setInvitee(User invitee) { this.invitee = invitee; }

    public User getInviter() { return inviter; }
    public void setInviter(User inviter) { this.inviter = inviter; }

    public ProjectMemberRole getRole() { return role; }
    public void setRole(ProjectMemberRole role) { this.role = role; }

    public InvitationStatus getStatus() { return status; }
    public void setStatus(InvitationStatus status) { this.status = status; }

    public static ProjectInvitationBuilder builder() {
        return new ProjectInvitationBuilder();
    }

    public static class ProjectInvitationBuilder {
        private Long id;
        private Project project;
        private User invitee;
        private User inviter;
        private ProjectMemberRole role;
        private InvitationStatus status = InvitationStatus.PENDING;

        public ProjectInvitationBuilder id(Long id) { this.id = id; return this; }
        public ProjectInvitationBuilder project(Project project) { this.project = project; return this; }
        public ProjectInvitationBuilder invitee(User invitee) { this.invitee = invitee; return this; }
        public ProjectInvitationBuilder inviter(User inviter) { this.inviter = inviter; return this; }
        public ProjectInvitationBuilder role(ProjectMemberRole role) { this.role = role; return this; }
        public ProjectInvitationBuilder status(InvitationStatus status) { this.status = status; return this; }

        public ProjectInvitation build() {
            return new ProjectInvitation(id, project, invitee, inviter, role, status);
        }
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        ProjectInvitation that = (ProjectInvitation) o;
        return Objects.equals(id, that.id);
    }

    @Override
    public int hashCode() {
        return Objects.hash(id);
    }
}
