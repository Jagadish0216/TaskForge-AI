package com.taskforge.module.calendar.service;

import com.taskforge.common.constant.TaskStatus;
import com.taskforge.common.exception.ResourceNotFoundException;
import com.taskforge.common.exception.UnauthorizedAccessException;
import com.taskforge.module.calendar.dto.CalendarEventsResponse;
import com.taskforge.module.task.dto.TaskResponse;
import com.taskforge.module.task.entity.Task;
import com.taskforge.module.task.mapper.TaskMapper;
import com.taskforge.module.task.repository.TaskRepository;
import com.taskforge.module.user.entity.User;
import com.taskforge.module.user.repository.UserRepository;
import com.taskforge.security.SecurityUtils;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.temporal.TemporalAdjusters;
import java.util.List;
@Service
public class CalendarService {

    private final TaskRepository taskRepository;
    private final UserRepository userRepository;
    private final TaskMapper taskMapper;

    public CalendarService(
            TaskRepository taskRepository,
            UserRepository userRepository,
            TaskMapper taskMapper
    ) {
        this.taskRepository = taskRepository;
        this.userRepository = userRepository;
        this.taskMapper = taskMapper;
    }

    @Transactional(readOnly = true)
    public CalendarEventsResponse getTodayTasks(Long userId) {
        User user = resolveUser(userId);
        LocalDate today = LocalDate.now();

        List<Task> tasks = taskRepository.findAll().stream()
                .filter(t -> t.getDueDate() != null && t.getDueDate().equals(today))
                .filter(t -> isUserRelated(t, user))
                .toList();

        List<TaskResponse> taskResponses = taskMapper.toResponseList(tasks);
        return new CalendarEventsResponse(taskResponses);
    }

    @Transactional(readOnly = true)
    public CalendarEventsResponse getWeeklyTasks(Long userId) {
        User user = resolveUser(userId);
        LocalDate today = LocalDate.now();
        LocalDate startOfWeek = today.with(TemporalAdjusters.previousOrSame(DayOfWeek.MONDAY));
        LocalDate endOfWeek = today.with(TemporalAdjusters.nextOrSame(DayOfWeek.SUNDAY));

        List<Task> tasks = taskRepository.findAll().stream()
                .filter(t -> t.getDueDate() != null && !t.getDueDate().isBefore(startOfWeek) && !t.getDueDate().isAfter(endOfWeek))
                .filter(t -> isUserRelated(t, user))
                .toList();

        List<TaskResponse> taskResponses = taskMapper.toResponseList(tasks);
        return new CalendarEventsResponse(taskResponses);
    }

    @Transactional(readOnly = true)
    public CalendarEventsResponse getMonthlyTasks(Long userId) {
        User user = resolveUser(userId);
        LocalDate today = LocalDate.now();
        LocalDate startOfMonth = today.with(TemporalAdjusters.firstDayOfMonth());
        LocalDate endOfMonth = today.with(TemporalAdjusters.lastDayOfMonth());

        List<Task> tasks = taskRepository.findAll().stream()
                .filter(t -> t.getDueDate() != null && !t.getDueDate().isBefore(startOfMonth) && !t.getDueDate().isAfter(endOfMonth))
                .filter(t -> isUserRelated(t, user))
                .toList();

        List<TaskResponse> taskResponses = taskMapper.toResponseList(tasks);
        return new CalendarEventsResponse(taskResponses);
    }

    @Transactional(readOnly = true)
    public CalendarEventsResponse getUpcomingDeadlines(Long userId) {
        User user = resolveUser(userId);
        LocalDate today = LocalDate.now();

        List<Task> tasks = taskRepository.findAll().stream()
                .filter(t -> t.getStatus() != TaskStatus.DONE && t.getDueDate() != null && !t.getDueDate().isBefore(today))
                .filter(t -> isUserRelated(t, user))
                .sorted((t1, t2) -> t1.getDueDate().compareTo(t2.getDueDate()))
                .toList();

        List<TaskResponse> taskResponses = taskMapper.toResponseList(tasks);
        return new CalendarEventsResponse(taskResponses);
    }

    private User resolveUser(Long userId) {
        if (userId != null) {
            return userRepository.findById(userId)
                    .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));
        }
        return getCurrentAuthenticatedUser();
    }

    private boolean isUserRelated(Task task, User user) {
        // Task assignee matches user OR task belongs to a project owned by user
        boolean isAssignee = task.getAssignee() != null && task.getAssignee().getId().equals(user.getId());
        boolean isOwner = task.getProject().getOwner().getId().equals(user.getId());
        return isAssignee || isOwner;
    }

    public User getCurrentAuthenticatedUser() {
        String email = SecurityUtils.getCurrentUserUsername().orElse(null);
        if (email != null) {
            return userRepository.findByEmail(email)
                    .orElseThrow(() -> new ResourceNotFoundException("User profile not found with email: " + email));
        }
        return userRepository.findAll().stream().findFirst()
                .orElseThrow(() -> new UnauthorizedAccessException("No user is currently authenticated or exists in database"));
    }
}
