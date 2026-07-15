package com.taskforge.module.task.mapper;

import com.taskforge.module.task.dto.CommentResponse;
import com.taskforge.module.task.entity.Comment;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

import java.util.List;

@Mapper(componentModel = "spring")
public interface CommentMapper {

    @Mapping(target = "taskId", source = "task.id")
    @Mapping(target = "authorId", source = "author.id")
    @Mapping(target = "authorName", expression = "java(comment.getAuthor().getFirstName() + \" \" + comment.getAuthor().getLastName())")
    @Mapping(target = "authorEmail", source = "author.email")
    @Mapping(target = "parentCommentId", source = "parentComment.id")
    CommentResponse toResponse(Comment comment);

    List<CommentResponse> toResponseList(List<Comment> comments);

    @Mapping(target = "editedById", source = "editedBy.id")
    @Mapping(target = "editedByName", expression = "java(history.getEditedBy().getFirstName() + \" \" + history.getEditedBy().getLastName())")
    com.taskforge.module.task.dto.CommentHistoryResponse toHistoryResponse(com.taskforge.module.task.entity.CommentHistory history);

    List<com.taskforge.module.task.dto.CommentHistoryResponse> toHistoryResponseList(List<com.taskforge.module.task.entity.CommentHistory> histories);
}
