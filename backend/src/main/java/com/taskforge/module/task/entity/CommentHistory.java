package com.taskforge.module.task.entity;

import com.taskforge.common.entity.BaseEntity;
import com.taskforge.module.user.entity.User;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.time.LocalDateTime;
import java.util.Objects;

@Entity
@Table(name = "comment_histories")
public class CommentHistory extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotNull
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "comment_id", nullable = false)
    private Comment comment;

    @NotBlank
    @Column(nullable = false, columnDefinition = "TEXT")
    private String oldContent;

    @NotNull
    @Column(name = "edited_at", nullable = false)
    private LocalDateTime editedAt;

    @NotNull
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "edited_by_id", nullable = false)
    private User editedBy;

    public CommentHistory() {}

    public CommentHistory(Long id, Comment comment, String oldContent, LocalDateTime editedAt, User editedBy) {
        this.id = id;
        this.comment = comment;
        this.oldContent = oldContent;
        this.editedAt = editedAt;
        this.editedBy = editedBy;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Comment getComment() { return comment; }
    public void setComment(Comment comment) { this.comment = comment; }

    public String getOldContent() { return oldContent; }
    public void setOldContent(String oldContent) { this.oldContent = oldContent; }

    public LocalDateTime getEditedAt() { return editedAt; }
    public void setEditedAt(LocalDateTime editedAt) { this.editedAt = editedAt; }

    public User getEditedBy() { return editedBy; }
    public void setEditedBy(User editedBy) { this.editedBy = editedBy; }

    public static CommentHistoryBuilder builder() {
        return new CommentHistoryBuilder();
    }

    public static class CommentHistoryBuilder {
        private Long id;
        private Comment comment;
        private String oldContent;
        private LocalDateTime editedAt;
        private User editedBy;

        public CommentHistoryBuilder id(Long id) { this.id = id; return this; }
        public CommentHistoryBuilder comment(Comment comment) { this.comment = comment; return this; }
        public CommentHistoryBuilder oldContent(String oldContent) { this.oldContent = oldContent; return this; }
        public CommentHistoryBuilder editedAt(LocalDateTime editedAt) { this.editedAt = editedAt; return this; }
        public CommentHistoryBuilder editedBy(User editedBy) { this.editedBy = editedBy; return this; }

        public CommentHistory build() {
            return new CommentHistory(id, comment, oldContent, editedAt, editedBy);
        }
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        CommentHistory that = (CommentHistory) o;
        return Objects.equals(id, that.id);
    }

    @Override
    public int hashCode() {
        return Objects.hash(id);
    }
}
