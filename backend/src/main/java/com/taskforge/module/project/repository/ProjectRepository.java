package com.taskforge.module.project.repository;

import com.taskforge.module.project.entity.Project;
import com.taskforge.module.user.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ProjectRepository extends JpaRepository<Project, Long>, JpaSpecificationExecutor<Project> {
    List<Project> findByOwner(User owner);
    long countByOwner(User owner);
    Optional<Project> findByProjectKey(String projectKey);
    boolean existsByProjectKey(String projectKey);
}
