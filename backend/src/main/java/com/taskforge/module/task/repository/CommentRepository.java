package com.taskforge.module.task.repository;

import com.taskforge.module.task.entity.Comment;
import com.taskforge.module.task.entity.Task;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CommentRepository extends JpaRepository<Comment, Long> {
    List<Comment> findByTask(Task task);
    List<Comment> findByTaskAndDeletedFalse(Task task);
}
