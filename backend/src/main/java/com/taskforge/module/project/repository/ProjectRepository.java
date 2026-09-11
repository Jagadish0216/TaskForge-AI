package com.taskforge.module.project.repository;

import com.taskforge.common.dto.MonthlyCount;
import com.taskforge.module.project.entity.Project;
import com.taskforge.module.user.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
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

    // --- Dashboard aggregate methods ---

    long countByIdInAndStatus(List<Long> ids, com.taskforge.common.constant.ProjectStatus status);

    // --- Admin aggregate methods ---

    long countByArchivedTrue();
    long countByAiGeneratedTrue();

    /**
     * Projection for project count grouped by priority.
     */
    interface ProjectPriorityCount {
        String getPriority();
        long getCount();
    }

    @Query("SELECT p.priority AS priority, COUNT(p) AS count FROM Project p GROUP BY p.priority")
    List<ProjectPriorityCount> countAllByPriorityGrouped();

    /**
     * Monthly project creation counts for a time range (admin analytics trend).
     * Uses Hibernate YEAR/MONTH extensions — compatible with H2 (MySQL mode) and MySQL.
     */
    @Query("SELECT YEAR(p.createdAt) AS year, MONTH(p.createdAt) AS month, COUNT(p) AS count " +
           "FROM Project p WHERE p.createdAt >= :start AND p.createdAt < :end " +
           "GROUP BY YEAR(p.createdAt), MONTH(p.createdAt)")
    List<MonthlyCount> countCreatedByMonth(@Param("start") LocalDateTime start,
                                           @Param("end") LocalDateTime end);
}
