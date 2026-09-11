package com.taskforge.module.task.repository;

import com.taskforge.common.constant.TaskStatus;
import com.taskforge.module.project.entity.Project;
import com.taskforge.module.task.entity.Task;
import com.taskforge.module.user.entity.User;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface TaskRepository extends JpaRepository<Task, Long>, JpaSpecificationExecutor<Task> {
    @EntityGraph(attributePaths = {"assignee", "project", "project.owner", "assignedBy"})
    List<Task> findByProject(Project project);

    long countByProject(Project project);
    long countByProjectAndStatus(Project project, TaskStatus status);
    long countByProjectAndStatusNot(Project project, TaskStatus status);
    long countByProjectAndStatusNotAndDueDateBefore(Project project, TaskStatus status, LocalDate date);

    List<Task> findByAssignee(User assignee);
    long countByAssignee(User assignee);
    long countByAssigneeAndStatus(User assignee, TaskStatus status);
    long countByAssigneeAndStatusNotAndDueDateBefore(User assignee, TaskStatus status, LocalDate date);

    long countByStatus(TaskStatus status);

    @Query("SELECT COALESCE(SUM(t.estimatedHours), 0) FROM Task t WHERE t.assignee = :assignee")
    Double sumEstimatedHoursByAssignee(@Param("assignee") User assignee);

    @Query("SELECT COALESCE(SUM(t.actualHours), 0) FROM Task t WHERE t.assignee = :assignee")
    Double sumActualHoursByAssignee(@Param("assignee") User assignee);

    @EntityGraph(attributePaths = {"assignee", "project", "project.owner", "assignedBy"})
    List<Task> findByProjectAndUpdatedAtGreaterThanEqual(Project project, LocalDateTime updatedAt);

    @EntityGraph(attributePaths = {"assignee", "project", "project.owner", "assignedBy"})
    @Query("SELECT t FROM Task t WHERE t.dueDate = :dueDate AND (t.assignee = :user OR t.project.owner = :user)")
    List<Task> findCalendarTasksByDate(@Param("user") User user, @Param("dueDate") LocalDate dueDate);

    @EntityGraph(attributePaths = {"assignee", "project", "project.owner", "assignedBy"})
    @Query("SELECT t FROM Task t WHERE t.dueDate BETWEEN :startDate AND :endDate AND (t.assignee = :user OR t.project.owner = :user)")
    List<Task> findCalendarTasksBetweenDates(@Param("user") User user, @Param("startDate") LocalDate startDate, @Param("endDate") LocalDate endDate);

    @EntityGraph(attributePaths = {"assignee", "project", "project.owner", "assignedBy"})
    @Query("SELECT t FROM Task t WHERE t.status <> com.taskforge.common.constant.TaskStatus.DONE AND t.dueDate >= :fromDate AND (t.assignee = :user OR t.project.owner = :user) ORDER BY t.dueDate ASC")
    List<Task> findUpcomingDeadlines(@Param("user") User user, @Param("fromDate") LocalDate fromDate);

    @EntityGraph(attributePaths = {"assignee", "project", "project.owner", "assignedBy"})
    @Query("SELECT t FROM Task t WHERE t.project.id IN :projectIds AND " +
           "(LOWER(t.title) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
           "LOWER(t.description) LIKE LOWER(CONCAT('%', :keyword, '%')))")
    List<Task> searchByKeyword(@Param("keyword") String keyword,
                               @Param("projectIds") List<Long> projectIds);

    /**
     * Projection interface for per-project task count aggregation.
     */
    interface ProjectTaskSummary {
        Long getProjectId();
        long getTotalCount();
        long getDoneCount();
    }

    @Query("SELECT t.project.id AS projectId, COUNT(t) AS totalCount, " +
           "SUM(CASE WHEN t.status = com.taskforge.common.constant.TaskStatus.DONE THEN 1 ELSE 0 END) AS doneCount " +
           "FROM Task t WHERE t.project.id IN :projectIds GROUP BY t.project.id")
    List<ProjectTaskSummary> countTaskSummaryByProjects(@Param("projectIds") List<Long> projectIds);
}
