package com.taskforge.module.project.controller;

import com.taskforge.common.api.ApiResponse;
import com.taskforge.module.project.dto.ProjectMessageRequest;
import com.taskforge.module.project.dto.ProjectMessageResponse;
import com.taskforge.module.project.service.ProjectMessageService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/projects/{projectId}/messages")
@Tag(name = "Project Discussion API", description = "Endpoints for sharing messages inside projects")
public class ProjectMessageController {

    private final ProjectMessageService projectMessageService;

    public ProjectMessageController(ProjectMessageService projectMessageService) {
        this.projectMessageService = projectMessageService;
    }

    @GetMapping
    @Operation(summary = "Get list of all project discussion messages")
    public ResponseEntity<ApiResponse<List<ProjectMessageResponse>>> getMessages(@PathVariable Long projectId) {
        List<ProjectMessageResponse> messages = projectMessageService.getMessages(projectId);
        return ResponseEntity.ok(ApiResponse.success(messages));
    }

    @PostMapping
    @Operation(summary = "Post a new discussion message inside a project")
    public ResponseEntity<ApiResponse<ProjectMessageResponse>> postMessage(
            @PathVariable Long projectId,
            @Valid @RequestBody ProjectMessageRequest request) {
        ProjectMessageResponse msg = projectMessageService.postMessage(projectId, request);
        return ResponseEntity.ok(ApiResponse.success(msg, "Message posted successfully"));
    }

    @PutMapping("/{messageId}")
    @Operation(summary = "Edit an existing discussion message inside a project")
    public ResponseEntity<ApiResponse<ProjectMessageResponse>> editMessage(
            @PathVariable Long projectId,
            @PathVariable Long messageId,
            @Valid @RequestBody ProjectMessageRequest request) {
        ProjectMessageResponse msg = projectMessageService.editMessage(projectId, messageId, request);
        return ResponseEntity.ok(ApiResponse.success(msg, "Message edited successfully"));
    }

    @DeleteMapping("/{messageId}")
    @Operation(summary = "Delete an existing discussion message inside a project")
    public ResponseEntity<ApiResponse<Void>> deleteMessage(
            @PathVariable Long projectId,
            @PathVariable Long messageId) {
        projectMessageService.deleteMessage(projectId, messageId);
        return ResponseEntity.ok(ApiResponse.success(null, "Message deleted successfully"));
    }
}
