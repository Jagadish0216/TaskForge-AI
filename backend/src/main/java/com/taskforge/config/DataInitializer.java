package com.taskforge.config;

import com.taskforge.common.constant.UserRole;
import com.taskforge.module.user.entity.Role;
import com.taskforge.module.user.repository.RoleRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.util.Arrays;

/**
 * Component to seed system database values (like roles) on application startup.
 */
@Component
public class DataInitializer implements CommandLineRunner {

    private static final Logger log = LoggerFactory.getLogger(DataInitializer.class);
    private final RoleRepository roleRepository;

    public DataInitializer(RoleRepository roleRepository) {
        this.roleRepository = roleRepository;
    }

    @Override
    public void run(String... args) {
        log.info("Initializing baseline system roles...");
        Arrays.stream(UserRole.values()).forEach(userRole -> {
            if (roleRepository.findByName(userRole).isEmpty()) {
                Role role = new Role();
                role.setName(userRole);
                roleRepository.save(role);
                log.info("Seeded role: {}", userRole);
            }
        });
        log.info("System roles initialization complete.");
    }
}
