package com.taskforge.module.activity.repository;

import com.taskforge.module.activity.entity.ActivityLog;
import com.taskforge.module.project.entity.Project;
import com.taskforge.module.task.entity.Task;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ActivityLogRepository extends JpaRepository<ActivityLog, Long>, JpaSpecificationExecutor<ActivityLog> {
    List<ActivityLog> findByProject(Project project);
    List<ActivityLog> findByTask(Task task);
}
