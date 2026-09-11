package com.taskforge.module.calendar.service;

import com.taskforge.common.exception.ResourceNotFoundException;
import com.taskforge.module.calendar.dto.CalendarEventsResponse;
import com.taskforge.module.task.dto.TaskResponse;
import com.taskforge.module.task.entity.Task;
import com.taskforge.module.task.mapper.TaskMapper;
import com.taskforge.module.task.repository.TaskRepository;
import com.taskforge.module.user.entity.User;
import com.taskforge.module.user.repository.UserRepository;
import com.taskforge.security.ProjectAuthorizationService;
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
    private final ProjectAuthorizationService projectAuthorizationService;

    public CalendarService(
            TaskRepository taskRepository,
            UserRepository userRepository,
            TaskMapper taskMapper,
            ProjectAuthorizationService projectAuthorizationService
    ) {
        this.taskRepository = taskRepository;
        this.userRepository = userRepository;
        this.taskMapper = taskMapper;
        this.projectAuthorizationService = projectAuthorizationService;
    }

    /**
     * Today's tasks for specified user ID (or current authenticated user).
     * Timezone: Uses system default LocalDate.now() with start/end boundary at today's single date.
     */
    @Transactional(readOnly = true)
    public CalendarEventsResponse getTodayTasks(Long userId) {
        User user = resolveUser(userId);
        LocalDate today = LocalDate.now();

        List<Task> tasks = taskRepository.findCalendarTasksByDate(user, today);
        List<TaskResponse> taskResponses = taskMapper.toResponseList(tasks);
        return new CalendarEventsResponse(taskResponses);
    }

    /**
     * Weekly tasks for specified user ID (or current authenticated user).
     * Timezone: Uses system default LocalDate.now().
     * Boundaries: Inclusive from MONDAY of current week to SUNDAY of current week.
     */
    @Transactional(readOnly = true)
    public CalendarEventsResponse getWeeklyTasks(Long userId) {
        User user = resolveUser(userId);
        LocalDate today = LocalDate.now();
        LocalDate startOfWeek = today.with(TemporalAdjusters.previousOrSame(DayOfWeek.MONDAY));
        LocalDate endOfWeek = today.with(TemporalAdjusters.nextOrSame(DayOfWeek.SUNDAY));

        List<Task> tasks = taskRepository.findCalendarTasksBetweenDates(user, startOfWeek, endOfWeek);
        List<TaskResponse> taskResponses = taskMapper.toResponseList(tasks);
        return new CalendarEventsResponse(taskResponses);
    }

    /**
     * Monthly tasks for specified user ID (or current authenticated user).
     * Timezone: Uses system default LocalDate.now().
     * Boundaries: Inclusive from 1st day of current month to last day of current month.
     */
    @Transactional(readOnly = true)
    public CalendarEventsResponse getMonthlyTasks(Long userId) {
        User user = resolveUser(userId);
        LocalDate today = LocalDate.now();
        LocalDate startOfMonth = today.with(TemporalAdjusters.firstDayOfMonth());
        LocalDate endOfMonth = today.with(TemporalAdjusters.lastDayOfMonth());

        List<Task> tasks = taskRepository.findCalendarTasksBetweenDates(user, startOfMonth, endOfMonth);
        List<TaskResponse> taskResponses = taskMapper.toResponseList(tasks);
        return new CalendarEventsResponse(taskResponses);
    }

    /**
     * Upcoming deadlines for specified user ID (or current authenticated user).
     * Timezone: Uses system default LocalDate.now().
     * Boundaries: Inclusive from today forward (status != DONE), sorted ascending by dueDate.
     */
    @Transactional(readOnly = true)
    public CalendarEventsResponse getUpcomingDeadlines(Long userId) {
        User user = resolveUser(userId);
        LocalDate today = LocalDate.now();

        List<Task> tasks = taskRepository.findUpcomingDeadlines(user, today);
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

    public User getCurrentAuthenticatedUser() {
        return projectAuthorizationService.getAuthenticatedUser();
    }
}
