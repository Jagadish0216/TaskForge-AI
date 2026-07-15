package com.taskforge.module.storage.controller;

import com.taskforge.common.api.ApiResponse;
import com.taskforge.module.storage.dto.AttachmentResponse;
import com.taskforge.module.storage.service.AttachmentService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/attachments")
@Tag(name = "Attachment Management", description = "Endpoints for uploading, listing, and downloading file attachments")
public class AttachmentController {

    private final AttachmentService attachmentService;

    public AttachmentController(AttachmentService attachmentService) {
        this.attachmentService = attachmentService;
    }

    @PostMapping(value = "/upload", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @Operation(summary = "Upload attachment", description = "Uploads a physical file and associates it with a task and/or project")
    public ResponseEntity<ApiResponse<AttachmentResponse>> uploadAttachment(
            @RequestParam("file") MultipartFile file,
            @RequestParam(value = "taskId", required = false) Long taskId,
            @RequestParam(value = "projectId", required = false) Long projectId) {
        AttachmentResponse response = attachmentService.uploadAttachment(file, taskId, projectId);
        return ResponseEntity.ok(ApiResponse.success(response, "Attachment uploaded successfully"));
    }

    @GetMapping("/{id}/download")
    @Operation(summary = "Download attachment file", description = "Downloads the physical file content for the given attachment metadata ID")
    public ResponseEntity<Resource> downloadAttachmentFile(@PathVariable Long id) {
        Resource resource = attachmentService.downloadAttachmentFile(id);
        AttachmentResponse metadata = attachmentService.getAttachmentMetadata(id);
        return ResponseEntity.ok()
                .contentType(MediaType.parseMediaType(metadata.fileType() != null ? metadata.fileType() : "application/octet-stream"))
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + metadata.fileName() + "\"")
                .body(resource);
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get attachment metadata", description = "Returns metadata details of a specific attachment")
    public ResponseEntity<ApiResponse<AttachmentResponse>> getAttachmentMetadata(@PathVariable Long id) {
        AttachmentResponse response = attachmentService.getAttachmentMetadata(id);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete attachment", description = "Deletes metadata and deletes physical file from storage")
    public ResponseEntity<ApiResponse<Void>> deleteAttachment(@PathVariable Long id) {
        attachmentService.deleteAttachment(id);
        return ResponseEntity.ok(ApiResponse.success(null, "Attachment deleted successfully"));
    }

    @GetMapping("/task/{taskId}")
    @Operation(summary = "List task attachments", description = "Returns all attachments associated with a specific task ID")
    public ResponseEntity<ApiResponse<List<AttachmentResponse>>> getAttachmentsByTask(@PathVariable Long taskId) {
        List<AttachmentResponse> response = attachmentService.getAttachmentsByTask(taskId);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @GetMapping("/project/{projectId}")
    @Operation(summary = "List project attachments", description = "Returns all attachments associated with a specific project ID")
    public ResponseEntity<ApiResponse<List<AttachmentResponse>>> getAttachmentsByProject(@PathVariable Long projectId) {
        List<AttachmentResponse> response = attachmentService.getAttachmentsByProject(projectId);
        return ResponseEntity.ok(ApiResponse.success(response));
    }
}
