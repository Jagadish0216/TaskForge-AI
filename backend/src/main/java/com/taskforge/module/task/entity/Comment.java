package com.taskforge.module.task.entity;

import com.taskforge.common.entity.BaseEntity;
import com.taskforge.module.user.entity.User;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.util.Objects;

@Entity
@Table(name = "comments")
public class Comment extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank
    @Column(nullable = false, columnDefinition = "TEXT")
    private String content;

    @NotNull
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "task_id", nullable = false)
    private Task task;

    @NotNull
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "author_id", nullable = false)
    private User author;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "parent_id")
    private Comment parentComment;

    @Column(name = "deleted", nullable = false)
    private boolean deleted = false;

    @Column(name = "edited", nullable = false)
    private boolean edited = false;

    public Comment() {}

    public Comment(Long id, String content, Task task, User author, Comment parentComment, boolean deleted, boolean edited) {
        this.id = id;
        this.content = content;
        this.task = task;
        this.author = author;
        this.parentComment = parentComment;
        this.deleted = deleted;
        this.edited = edited;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getContent() { return content; }
    public void setContent(String content) { this.content = content; }

    public Task getTask() { return task; }
    public void setTask(Task task) { this.task = task; }

    public User getAuthor() { return author; }
    public void setAuthor(User author) { this.author = author; }

    public Comment getParentComment() { return parentComment; }
    public void setParentComment(Comment parentComment) { this.parentComment = parentComment; }

    public boolean isDeleted() { return deleted; }
    public void setDeleted(boolean deleted) { this.deleted = deleted; }

    public boolean isEdited() { return edited; }
    public void setEdited(boolean edited) { this.edited = edited; }

    public static CommentBuilder builder() {
        return new CommentBuilder();
    }

    public static class CommentBuilder {
        private Long id;
        private String content;
        private Task task;
        private User author;
        private Comment parentComment;
        private boolean deleted = false;
        private boolean edited = false;

        public CommentBuilder id(Long id) { this.id = id; return this; }
        public CommentBuilder content(String content) { this.content = content; return this; }
        public CommentBuilder task(Task task) { this.task = task; return this; }
        public CommentBuilder author(User author) { this.author = author; return this; }
        public CommentBuilder parentComment(Comment parentComment) { this.parentComment = parentComment; return this; }
        public CommentBuilder deleted(boolean deleted) { this.deleted = deleted; return this; }
        public CommentBuilder edited(boolean edited) { this.edited = edited; return this; }

        public Comment build() {
            return new Comment(id, content, task, author, parentComment, deleted, edited);
        }
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        Comment comment = (Comment) o;
        return Objects.equals(id, comment.id);
    }

    @Override
    public int hashCode() {
        return Objects.hash(id);
    }
}
