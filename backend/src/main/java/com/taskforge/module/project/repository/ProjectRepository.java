package com.taskforge.module.project.repository;

import com.taskforge.module.project.entity.Project;
import com.taskforge.module.user.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ProjectRepository extends JpaRepository<Project, Long>, JpaSpecificationExecutor<Project> {
    List<Project> findByOwner(User owner);
    long countByOwner(User owner);
    Optional<Project> findByProjectKey(String projectKey);
    boolean existsByProjectKey(String projectKey);

    @Query("SELECT p FROM Project p WHERE p.id IN :projectIds AND " +
           "(LOWER(p.name) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
           "LOWER(p.projectKey) LIKE LOWER(CONCAT('%', :keyword, '%')))")
    List<Project> searchByKeyword(@Param("keyword") String keyword,
                                  @Param("projectIds") List<Long> projectIds);
}
