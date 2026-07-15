package com.taskforge.security;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpSession;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;

import java.util.Optional;

public class SecurityUtils {

    private SecurityUtils() {
        // Private constructor to prevent instantiation
    }

    public static Optional<String> getCurrentUserUsername() {
        ServletRequestAttributes attributes = (ServletRequestAttributes) RequestContextHolder.getRequestAttributes();
        if (attributes != null) {
            HttpServletRequest request = attributes.getRequest();
            // 1. Try to read from current Http Session
            HttpSession session = request.getSession(false);
            if (session != null) {
                String email = (String) session.getAttribute("userEmail");
                if (email != null) {
                    return Optional.of(email);
                }
            }
            // 2. Try to read from X-User-Email header (for direct Swagger testing)
            String headerEmail = request.getHeader("X-User-Email");
            if (headerEmail != null && !headerEmail.isBlank()) {
                return Optional.of(headerEmail);
            }
        }
        return Optional.empty();
    }
}
