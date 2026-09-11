package com.taskforge.module.task.repository;

import com.taskforge.common.constant.TaskStatus;
import com.taskforge.common.dto.MonthlyCount;
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

    // --- Dashboard aggregate queries (project-scoped) ---

    long countByProjectIdIn(List<Long> projectIds);

    long countByProjectIdInAndStatus(List<Long> projectIds, TaskStatus status);

    long countByProjectIdInAndStatusNotAndDueDateBefore(List<Long> projectIds, TaskStatus status, LocalDate date);

    /**
     * Projection for task count grouped by status within a set of projects.
     */
    interface TaskStatusCount {
        String getStatus();
        long getCount();
    }

    @Query("SELECT t.status AS status, COUNT(t) AS count FROM Task t WHERE t.project.id IN :projectIds GROUP BY t.status")
    List<TaskStatusCount> countByStatusGroupedForProjects(@Param("projectIds") List<Long> projectIds);

    /**
     * Upcoming deadlines for a set of projects — scoped, ordered, limited.
     */
    @EntityGraph(attributePaths = {"assignee", "project", "project.owner", "assignedBy"})
    @Query("SELECT t FROM Task t WHERE t.project.id IN :projectIds " +
           "AND t.status <> com.taskforge.common.constant.TaskStatus.DONE " +
           "AND t.dueDate IS NOT NULL AND t.dueDate >= :today " +
           "ORDER BY t.dueDate ASC")
    List<Task> findUpcomingDeadlinesForProjects(@Param("projectIds") List<Long> projectIds,
                                                @Param("today") LocalDate today,
                                                org.springframework.data.domain.Pageable pageable);

    /**
     * Projection for team productivity: completed tasks grouped by assignee full name.
     */
    interface TeamProductivityEntry {
        String getAssigneeName();
        long getCount();
    }

    /**
     * Returns completed task counts grouped by assignee full name for a set of projects.
     * Excludes tasks with no assignee.
     */
    @Query("SELECT CONCAT(t.assignee.firstName, ' ', t.assignee.lastName) AS assigneeName, COUNT(t) AS count " +
           "FROM Task t WHERE t.project.id IN :projectIds " +
           "AND t.status = com.taskforge.common.constant.TaskStatus.DONE " +
           "AND t.assignee IS NOT NULL " +
           "GROUP BY t.assignee.id, t.assignee.firstName, t.assignee.lastName")
    List<TeamProductivityEntry> countDoneTasksGroupedByAssignee(@Param("projectIds") List<Long> projectIds);

    // --- Admin aggregate queries (global) ---

    /**
     * Count overdue tasks system-wide (admin stats).
     */
    @Query("SELECT COUNT(t) FROM Task t WHERE t.status <> :status AND t.dueDate IS NOT NULL AND t.dueDate < :today")
    long countOverdueTasks(@Param("status") TaskStatus status, @Param("today") LocalDate today);

    /**
     * Task count grouped by status for the entire system (admin stats).
     */
    @Query("SELECT t.status AS status, COUNT(t) AS count FROM Task t GROUP BY t.status")
    List<TaskStatusCount> countAllByStatusGrouped();

    /**
     * Monthly task creation counts for a time range (admin analytics trend).
     * Uses Hibernate YEAR/MONTH extensions — compatible with H2 (MySQL mode) and MySQL.
     */
    @Query("SELECT YEAR(t.createdAt) AS year, MONTH(t.createdAt) AS month, COUNT(t) AS count " +
           "FROM Task t WHERE t.createdAt >= :start AND t.createdAt < :end " +
           "GROUP BY YEAR(t.createdAt), MONTH(t.createdAt)")
    List<MonthlyCount> countCreatedByMonth(@Param("start") LocalDateTime start,
                                           @Param("end") LocalDateTime end);
}
