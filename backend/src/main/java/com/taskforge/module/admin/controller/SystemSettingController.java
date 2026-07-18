package com.taskforge.module.admin.controller;

import com.taskforge.common.api.ApiResponse;
import com.taskforge.common.exception.ResourceNotFoundException;
import com.taskforge.common.exception.UnauthorizedAccessException;
import com.taskforge.common.constant.UserRole;
import com.taskforge.module.admin.entity.SystemSetting;
import com.taskforge.module.admin.repository.SystemSettingRepository;
import com.taskforge.module.user.entity.User;
import com.taskforge.module.user.repository.UserRepository;
import com.taskforge.security.SecurityUtils;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@Tag(name = "System Settings API", description = "Endpoints for managing application settings")
public class SystemSettingController {

    private final SystemSettingRepository systemSettingRepository;
    private final UserRepository userRepository;

    public SystemSettingController(SystemSettingRepository systemSettingRepository, UserRepository userRepository) {
        this.systemSettingRepository = systemSettingRepository;
        this.userRepository = userRepository;
    }

    private void verifyAdmin() {
        String email = SecurityUtils.getCurrentUserUsername().orElse(null);
        User user;
        if (email != null) {
            user = userRepository.findByEmail(email)
                    .orElseThrow(() -> new ResourceNotFoundException("User profile not found"));
        } else {
            user = userRepository.findAll().stream().findFirst()
                    .orElseThrow(() -> new UnauthorizedAccessException("Not authenticated"));
        }

        boolean isAdmin = user.getRoles().stream()
                .anyMatch(r -> r.getName() == UserRole.ROLE_ADMIN);
        if (!isAdmin) {
            throw new UnauthorizedAccessException("Admin role required");
        }
    }

    @GetMapping("/settings/public")
    @Operation(summary = "Get public system settings")
    public ResponseEntity<ApiResponse<Map<String, String>>> getPublicSettings() {
        Map<String, String> publicSettings = new HashMap<>();
        publicSettings.put("appName", getSettingValue("appName", "TaskForge AI"));
        publicSettings.put("logoUrl", getSettingValue("logoUrl", ""));
        publicSettings.put("defaultLanguage", getSettingValue("defaultLanguage", "en"));
        publicSettings.put("maintenanceMode", getSettingValue("maintenanceMode", "false"));
        return ResponseEntity.ok(ApiResponse.success(publicSettings));
    }

    @GetMapping("/admin/settings")
    @Operation(summary = "Get all system settings (Admin)")
    public ResponseEntity<ApiResponse<Map<String, String>>> getAdminSettings() {
        verifyAdmin();
        Map<String, String> settings = new HashMap<>();
        List<SystemSetting> all = systemSettingRepository.findAll();
        for (SystemSetting s : all) {
            settings.put(s.getKey(), s.getValue());
        }
        // Defaults if empty
        settings.putIfAbsent("appName", "TaskForge AI");
        settings.putIfAbsent("logoUrl", "");
        settings.putIfAbsent("theme", "dark");
        settings.putIfAbsent("defaultLanguage", "en");
        settings.putIfAbsent("maintenanceMode", "false");
        settings.putIfAbsent("notificationSettings", "true");
        return ResponseEntity.ok(ApiResponse.success(settings));
    }

    @PutMapping("/admin/settings")
    @Operation(summary = "Update system settings (Admin)")
    @org.springframework.transaction.annotation.Transactional
    public ResponseEntity<ApiResponse<Void>> updateAdminSettings(@RequestBody Map<String, String> payload) {
        verifyAdmin();
        for (Map.Entry<String, String> entry : payload.entrySet()) {
            SystemSetting setting = systemSettingRepository.findByKey(entry.getKey())
                    .orElseGet(() -> {
                        SystemSetting s = new SystemSetting();
                        s.setKey(entry.getKey());
                        return s;
                    });
            setting.setValue(entry.getValue());
            systemSettingRepository.save(setting);
        }
        return ResponseEntity.ok(ApiResponse.success(null, "Settings updated successfully"));
    }

    private String getSettingValue(String key, String defaultValue) {
        return systemSettingRepository.findByKey(key)
                .map(SystemSetting::getValue)
                .orElse(defaultValue);
    }
}
