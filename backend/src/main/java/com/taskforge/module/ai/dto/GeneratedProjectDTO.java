package com.taskforge.module.ai.dto;

import java.util.List;

public record GeneratedProjectDTO(
    String projectName,
    String description,
    List<ModuleDTO> modules,
    List<String> milestones
) {
    public record ModuleDTO(
        String name,
        String description,
        List<TaskDTO> tasks
    ) {}

    public record TaskDTO(
        String title,
        String description,
        String priority,
        Integer estimatedHours
    ) {}
}
