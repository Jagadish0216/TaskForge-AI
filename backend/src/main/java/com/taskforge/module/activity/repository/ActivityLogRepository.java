package com.taskforge.module.activity.repository;

import com.taskforge.module.activity.entity.ActivityLog;
import com.taskforge.module.project.entity.Project;
import com.taskforge.module.task.entity.Task;
import com.taskforge.module.user.entity.User;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ActivityLogRepository extends JpaRepository<ActivityLog, Long>, JpaSpecificationExecutor<ActivityLog> {
    List<ActivityLog> findByProject(Project project);
    List<ActivityLog> findByTask(Task task);
    List<ActivityLog> findByUser(User user);

    /**
     * Returns recent activity logs scoped to a user's visible projects.
     * Logs with no project (system-level) are always included.
     */
    @Query("SELECT a FROM ActivityLog a WHERE (a.project IS NULL OR a.project.id IN :projectIds) ORDER BY a.createdAt DESC")
    List<ActivityLog> findRecentForProjects(@Param("projectIds") List<Long> projectIds, Pageable pageable);
}
