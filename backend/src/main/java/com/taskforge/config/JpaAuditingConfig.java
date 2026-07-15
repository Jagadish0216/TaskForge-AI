package com.taskforge.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.domain.AuditorAware;
import com.taskforge.security.SecurityUtils;

import java.util.Optional;

@Configuration
public class JpaAuditingConfig {

    @Bean
    public AuditorAware<String> auditorProvider() {
        return () -> {
            return Optional.of(SecurityUtils.getCurrentUserUsername().orElse("SYSTEM"));
        };
    }
}
