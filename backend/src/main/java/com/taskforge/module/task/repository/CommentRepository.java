package com.taskforge.module.task.repository;

import com.taskforge.module.task.entity.Comment;
import com.taskforge.module.task.entity.Task;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CommentRepository extends JpaRepository<Comment, Long> {
    List<Comment> findByTask(Task task);
    List<Comment> findByTaskAndDeletedFalse(Task task);

    @Query("SELECT c FROM Comment c JOIN FETCH c.author WHERE c.deleted = false AND " +
           "c.task.project.id IN :projectIds AND " +
           "LOWER(c.content) LIKE LOWER(CONCAT('%', :keyword, '%'))")
    List<Comment> searchByKeyword(@Param("keyword") String keyword,
                                  @Param("projectIds") List<Long> projectIds);
}
