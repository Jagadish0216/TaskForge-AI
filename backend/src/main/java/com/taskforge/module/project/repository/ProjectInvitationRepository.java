package com.taskforge.module.project.repository;

import com.taskforge.common.constant.InvitationStatus;
import com.taskforge.module.project.entity.Project;
import com.taskforge.module.project.entity.ProjectInvitation;
import com.taskforge.module.user.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ProjectInvitationRepository extends JpaRepository<ProjectInvitation, Long> {
    Optional<ProjectInvitation> findByProjectAndInviteeAndStatus(Project project, User invitee, InvitationStatus status);
    boolean existsByProjectAndInviteeAndStatus(Project project, User invitee, InvitationStatus status);
    List<ProjectInvitation> findByInviteeAndStatus(User invitee, InvitationStatus status);
    List<ProjectInvitation> findByProjectAndStatus(Project project, InvitationStatus status);
    List<ProjectInvitation> findByProject(Project project);
}
