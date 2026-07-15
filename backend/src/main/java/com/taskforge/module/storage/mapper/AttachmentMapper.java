package com.taskforge.module.storage.mapper;

import com.taskforge.module.storage.dto.AttachmentResponse;
import com.taskforge.module.storage.entity.Attachment;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

import java.util.List;

@Mapper(componentModel = "spring")
public interface AttachmentMapper {

    @Mapping(target = "taskId", source = "task.id")
    @Mapping(target = "projectId", source = "project.id")
    @Mapping(target = "uploadedById", source = "uploadedBy.id")
    @Mapping(target = "uploadedByName", expression = "java(attachment.getUploadedBy().getFirstName() + \" \" + attachment.getUploadedBy().getLastName())")
    AttachmentResponse toResponse(Attachment attachment);

    List<AttachmentResponse> toResponseList(List<Attachment> attachments);
}
