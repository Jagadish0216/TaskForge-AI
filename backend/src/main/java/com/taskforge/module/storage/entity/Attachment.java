package com.taskforge.module.storage.entity;

import com.taskforge.common.entity.BaseEntity;
import com.taskforge.module.project.entity.Project;
import com.taskforge.module.task.entity.Task;
import com.taskforge.module.user.entity.User;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.util.Objects;

@Entity
@Table(name = "attachments")
public class Attachment extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank
    @Column(name = "file_name", nullable = false, length = 255)
    private String fileName;

    @Column(name = "file_type", length = 100)
    private String fileType;

    @NotNull
    @Column(name = "file_size", nullable = false)
    private Long fileSize;

    @NotBlank
    @Column(name = "file_path", nullable = false, length = 512)
    private String filePath;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "task_id")
    private Task task;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "project_id")
    private Project project;

    @NotNull
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "uploaded_by_id", nullable = false)
    private User uploadedBy;

    public Attachment() {}

    public Attachment(Long id, String fileName, String fileType, Long fileSize, String filePath, Task task, Project project, User uploadedBy) {
        this.id = id;
        this.fileName = fileName;
        this.fileType = fileType;
        this.fileSize = fileSize;
        this.filePath = filePath;
        this.task = task;
        this.project = project;
        this.uploadedBy = uploadedBy;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getFileName() { return fileName; }
    public void setFileName(String fileName) { this.fileName = fileName; }

    public String getFileType() { return fileType; }
    public void setFileType(String fileType) { this.fileType = fileType; }

    public Long getFileSize() { return fileSize; }
    public void setFileSize(Long fileSize) { this.fileSize = fileSize; }

    public String getFilePath() { return filePath; }
    public void setFilePath(String filePath) { this.filePath = filePath; }

    public Task getTask() { return task; }
    public void setTask(Task task) { this.task = task; }

    public Project getProject() { return project; }
    public void setProject(Project project) { this.project = project; }

    public User getUploadedBy() { return uploadedBy; }
    public void setUploadedBy(User uploadedBy) { this.uploadedBy = uploadedBy; }

    public static AttachmentBuilder builder() {
        return new AttachmentBuilder();
    }

    public static class AttachmentBuilder {
        private Long id;
        private String fileName;
        private String fileType;
        private Long fileSize;
        private String filePath;
        private Task task;
        private Project project;
        private User uploadedBy;

        public AttachmentBuilder id(Long id) { this.id = id; return this; }
        public AttachmentBuilder fileName(String fileName) { this.fileName = fileName; return this; }
        public AttachmentBuilder fileType(String fileType) { this.fileType = fileType; return this; }
        public AttachmentBuilder fileSize(Long fileSize) { this.fileSize = fileSize; return this; }
        public AttachmentBuilder filePath(String filePath) { this.filePath = filePath; return this; }
        public AttachmentBuilder task(Task task) { this.task = task; return this; }
        public AttachmentBuilder project(Project project) { this.project = project; return this; }
        public AttachmentBuilder uploadedBy(User uploadedBy) { this.uploadedBy = uploadedBy; return this; }

        public Attachment build() {
            return new Attachment(id, fileName, fileType, fileSize, filePath, task, project, uploadedBy);
        }
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        Attachment that = (Attachment) o;
        return Objects.equals(id, that.id);
    }

    @Override
    public int hashCode() {
        return Objects.hash(id);
    }
}
