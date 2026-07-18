package com.taskforge.module.project.repository;

import com.taskforge.module.project.entity.Project;
import com.taskforge.module.project.entity.ProjectMessage;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ProjectMessageRepository extends JpaRepository<ProjectMessage, Long> {
    List<ProjectMessage> findByProjectOrderByCreatedAtAsc(Project project);
    long countByProject(Project project);
}
