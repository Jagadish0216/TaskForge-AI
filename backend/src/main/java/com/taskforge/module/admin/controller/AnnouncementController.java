package com.taskforge.module.admin.controller;

import com.taskforge.common.api.ApiResponse;
import com.taskforge.common.exception.ResourceNotFoundException;
import com.taskforge.common.exception.UnauthorizedAccessException;
import com.taskforge.common.constant.UserRole;
import com.taskforge.module.admin.entity.Announcement;
import com.taskforge.module.admin.repository.AnnouncementRepository;
import com.taskforge.module.user.entity.User;
import com.taskforge.module.user.repository.UserRepository;
import com.taskforge.security.SecurityUtils;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@Tag(name = "Announcements API", description = "System-wide announcements for users and admin management")
@org.springframework.transaction.annotation.Transactional(readOnly = true)
public class AnnouncementController {

    private final AnnouncementRepository announcementRepository;
    private final UserRepository userRepository;

    public AnnouncementController(AnnouncementRepository announcementRepository, UserRepository userRepository) {
        this.announcementRepository = announcementRepository;
        this.userRepository = userRepository;
    }

    private User getAuthenticatedUser() {
        String email = SecurityUtils.getCurrentUserUsername()
                .orElseThrow(() -> new UnauthorizedAccessException("Authentication required"));
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + email));
    }

    private void verifyAdmin() {
        User user = getAuthenticatedUser();
        boolean isAdmin = user.getRoles().stream()
                .anyMatch(r -> r.getName() == UserRole.ROLE_ADMIN);
        if (!isAdmin) {
            throw new UnauthorizedAccessException("Admin role required");
        }
    }

    // --- USER ACCESSIBLE ---
    @GetMapping("/announcements/active")
    @Operation(summary = "Get active announcements for users")
    public ResponseEntity<ApiResponse<List<Announcement>>> getActiveAnnouncements() {
        return ResponseEntity.ok(ApiResponse.success(announcementRepository.findByActiveTrueOrderByCreatedAtDesc()));
    }

    // --- ADMIN ACCESSIBLE ---
    @GetMapping("/admin/announcements")
    @Operation(summary = "List all announcements (Admin)")
    public ResponseEntity<ApiResponse<List<Announcement>>> getAllAnnouncements() {
        verifyAdmin();
        return ResponseEntity.ok(ApiResponse.success(announcementRepository.findAllByOrderByCreatedAtDesc()));
    }

    @PostMapping("/admin/announcements")
    @Operation(summary = "Create an announcement (Admin)")
    @org.springframework.transaction.annotation.Transactional
    public ResponseEntity<ApiResponse<Announcement>> createAnnouncement(@RequestBody Announcement announcement) {
        verifyAdmin();
        User admin = getAuthenticatedUser();
        announcement.setAuthor(admin);
        Announcement saved = announcementRepository.save(announcement);
        return ResponseEntity.ok(ApiResponse.success(saved, "Announcement created successfully"));
    }

    @PutMapping("/admin/announcements/{id}")
    @Operation(summary = "Update an announcement (Admin)")
    @org.springframework.transaction.annotation.Transactional
    public ResponseEntity<ApiResponse<Announcement>> updateAnnouncement(@PathVariable Long id, @RequestBody Announcement payload) {
        verifyAdmin();
        Announcement announcement = announcementRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Announcement not found"));
        announcement.setTitle(payload.getTitle());
        announcement.setContent(payload.getContent());
        announcement.setActive(payload.isActive());
        Announcement saved = announcementRepository.save(announcement);
        return ResponseEntity.ok(ApiResponse.success(saved, "Announcement updated successfully"));
    }

    @DeleteMapping("/admin/announcements/{id}")
    @Operation(summary = "Delete an announcement (Admin)")
    @org.springframework.transaction.annotation.Transactional
    public ResponseEntity<ApiResponse<Void>> deleteAnnouncement(@PathVariable Long id) {
        verifyAdmin();
        Announcement announcement = announcementRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Announcement not found"));
        announcementRepository.delete(announcement);
        return ResponseEntity.ok(ApiResponse.success(null, "Announcement deleted successfully"));
    }
}
