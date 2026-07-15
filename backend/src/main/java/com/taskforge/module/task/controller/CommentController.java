package com.taskforge.module.task.controller;

import com.taskforge.common.api.ApiResponse;
import com.taskforge.module.task.dto.*;
import com.taskforge.module.task.entity.CommentHistory;
import com.taskforge.module.task.service.CommentService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.taskforge.module.task.mapper.CommentMapper;

import java.util.List;

@RestController
@RequestMapping("/comments")
@Tag(name = "Comment Management", description = "Endpoints for managing task comments and histories")
public class CommentController {

    private final CommentService commentService;
    private final CommentMapper commentMapper;

    public CommentController(CommentService commentService, CommentMapper commentMapper) {
        this.commentService = commentService;
        this.commentMapper = commentMapper;
    }

    @PostMapping
    @Operation(summary = "Create a comment", description = "Adds a comment to a task, supporting mentions and nested replies")
    public ResponseEntity<ApiResponse<CommentResponse>> createComment(@Valid @RequestBody CommentCreateRequest request) {
        CommentResponse response = commentService.createComment(request);
        return ResponseEntity.ok(ApiResponse.success(response, "Comment created successfully"));
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update a comment", description = "Edits comment content and logs edit history")
    public ResponseEntity<ApiResponse<CommentResponse>> updateComment(
            @PathVariable Long id,
            @Valid @RequestBody CommentUpdateRequest request) {
        CommentResponse response = commentService.updateComment(id, request);
        return ResponseEntity.ok(ApiResponse.success(response, "Comment updated successfully"));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete a comment", description = "Soft deletes a comment")
    public ResponseEntity<ApiResponse<Void>> deleteComment(@PathVariable Long id) {
        commentService.deleteComment(id);
        return ResponseEntity.ok(ApiResponse.success(null, "Comment deleted successfully"));
    }

    @PostMapping("/search")
    @Operation(summary = "Search comments", description = "Searches and filters task comments with pagination")
    public ResponseEntity<ApiResponse<Page<CommentResponse>>> searchComments(
            @RequestBody CommentSearchRequest request,
            Pageable pageable) {
        Page<CommentResponse> page = commentService.searchComments(request, pageable);
        return ResponseEntity.ok(ApiResponse.success(page));
    }

    @GetMapping("/{id}/history")
    @Operation(summary = "Get comment edit history", description = "Returns past versions of the comment sorted by edit date")
    public ResponseEntity<ApiResponse<List<CommentHistoryResponse>>> getCommentHistory(@PathVariable Long id) {
        List<CommentHistoryResponse> response = commentService.getCommentHistory(id);
        return ResponseEntity.ok(ApiResponse.success(response));
    }
}
