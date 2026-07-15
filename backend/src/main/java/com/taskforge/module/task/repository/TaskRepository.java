package com.taskforge.module.task.repository;

import com.taskforge.module.project.entity.Project;
import com.taskforge.module.task.entity.Task;
import com.taskforge.module.user.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TaskRepository extends JpaRepository<Task, Long>, JpaSpecificationExecutor<Task> {
    List<Task> findByProject(Project project);
    long countByProject(Project project);
    long countByProjectAndStatus(Project project, com.taskforge.common.constant.TaskStatus status);
    long countByProjectAndStatusNot(Project project, com.taskforge.common.constant.TaskStatus status);
    long countByProjectAndStatusNotAndDueDateBefore(Project project, com.taskforge.common.constant.TaskStatus status, java.time.LocalDate date);
    List<Task> findByAssignee(User assignee);
    long countByAssignee(User assignee);
    long countByAssigneeAndStatus(User assignee, com.taskforge.common.constant.TaskStatus status);
}
