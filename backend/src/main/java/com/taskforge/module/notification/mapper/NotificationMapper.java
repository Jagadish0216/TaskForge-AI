package com.taskforge.module.notification.mapper;

import com.taskforge.module.notification.dto.NotificationPreferenceResponse;
import com.taskforge.module.notification.dto.NotificationResponse;
import com.taskforge.module.notification.entity.Notification;
import com.taskforge.module.notification.entity.NotificationPreference;
import org.mapstruct.Mapper;

import java.util.List;

@Mapper(componentModel = "spring")
public interface NotificationMapper {

    @org.mapstruct.Mapping(target = "isRead", source = "read")
    NotificationResponse toResponse(Notification notification);

    List<NotificationResponse> toResponseList(List<Notification> notifications);

    NotificationPreferenceResponse toPreferenceResponse(NotificationPreference preference);
}
