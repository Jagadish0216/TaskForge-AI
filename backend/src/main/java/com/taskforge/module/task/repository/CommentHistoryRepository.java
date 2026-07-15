package com.taskforge.module.task.repository;

import com.taskforge.module.task.entity.Comment;
import com.taskforge.module.task.entity.CommentHistory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CommentHistoryRepository extends JpaRepository<CommentHistory, Long> {
    List<CommentHistory> findByCommentOrderByEditedAtDesc(Comment comment);
}
