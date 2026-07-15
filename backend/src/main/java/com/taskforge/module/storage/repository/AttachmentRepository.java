package com.taskforge.module.storage.repository;

import com.taskforge.module.project.entity.Project;
import com.taskforge.module.storage.entity.Attachment;
import com.taskforge.module.task.entity.Task;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AttachmentRepository extends JpaRepository<Attachment, Long> {
    List<Attachment> findByTask(Task task);
    List<Attachment> findByProject(Project project);
}
