package com.taskforge.module.calendar.service;

import com.taskforge.common.constant.TaskStatus;
import com.taskforge.module.calendar.dto.CalendarEventsResponse;
import com.taskforge.module.task.entity.Task;
import com.taskforge.module.task.mapper.TaskMapper;
import com.taskforge.module.task.repository.TaskRepository;
import com.taskforge.module.user.entity.User;
import com.taskforge.module.user.repository.UserRepository;
import com.taskforge.security.ProjectAuthorizationService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;

import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.temporal.TemporalAdjusters;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.anyList;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

class CalendarServiceTest {

    private CalendarService calendarService;

    @Mock
    private TaskRepository taskRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private TaskMapper taskMapper;

    @Mock
    private ProjectAuthorizationService projectAuthorizationService;

    private User authUser;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
        calendarService = new CalendarService(
                taskRepository,
                userRepository,
                taskMapper,
                projectAuthorizationService
        );

        authUser = new User();
        authUser.setId(100L);
        authUser.setEmail("calendaruser@test.com");

        when(projectAuthorizationService.getAuthenticatedUser()).thenReturn(authUser);
    }

    @Test
    void getTodayTasks_ShouldQueryDatabaseForTodayDate() {
        LocalDate today = LocalDate.now();
        Task task = new Task();
        task.setId(1L);
        task.setDueDate(today);

        when(taskRepository.findCalendarTasksByDate(authUser, today)).thenReturn(List.of(task));
        when(taskMapper.toResponseList(anyList())).thenReturn(List.of());

        CalendarEventsResponse response = calendarService.getTodayTasks(null);

        assertNotNull(response);
        verify(taskRepository).findCalendarTasksByDate(authUser, today);
        verify(projectAuthorizationService).getAuthenticatedUser();
    }

    @Test
    void getWeeklyTasks_ShouldQueryDatabaseForMondayToSundayRange() {
        LocalDate today = LocalDate.now();
        LocalDate expectedStart = today.with(TemporalAdjusters.previousOrSame(DayOfWeek.MONDAY));
        LocalDate expectedEnd = today.with(TemporalAdjusters.nextOrSame(DayOfWeek.SUNDAY));

        when(taskRepository.findCalendarTasksBetweenDates(eq(authUser), eq(expectedStart), eq(expectedEnd)))
                .thenReturn(List.of());
        when(taskMapper.toResponseList(anyList())).thenReturn(List.of());

        CalendarEventsResponse response = calendarService.getWeeklyTasks(null);

        assertNotNull(response);
        verify(taskRepository).findCalendarTasksBetweenDates(authUser, expectedStart, expectedEnd);
    }

    @Test
    void getMonthlyTasks_ShouldQueryDatabaseForMonthBounds() {
        LocalDate today = LocalDate.now();
        LocalDate expectedStart = today.with(TemporalAdjusters.firstDayOfMonth());
        LocalDate expectedEnd = today.with(TemporalAdjusters.lastDayOfMonth());

        when(taskRepository.findCalendarTasksBetweenDates(eq(authUser), eq(expectedStart), eq(expectedEnd)))
                .thenReturn(List.of());
        when(taskMapper.toResponseList(anyList())).thenReturn(List.of());

        CalendarEventsResponse response = calendarService.getMonthlyTasks(null);

        assertNotNull(response);
        verify(taskRepository).findCalendarTasksBetweenDates(authUser, expectedStart, expectedEnd);
    }

    @Test
    void getUpcomingDeadlines_ShouldQueryUpcomingNonDoneTasks() {
        LocalDate today = LocalDate.now();
        Task t1 = new Task();
        t1.setId(5L);
        t1.setDueDate(today.plusDays(1));
        t1.setStatus(TaskStatus.IN_PROGRESS);

        when(taskRepository.findUpcomingDeadlines(authUser, today)).thenReturn(List.of(t1));
        when(taskMapper.toResponseList(anyList())).thenReturn(List.of());

        CalendarEventsResponse response = calendarService.getUpcomingDeadlines(null);

        assertNotNull(response);
        verify(taskRepository).findUpcomingDeadlines(authUser, today);
    }

    @Test
    void getTodayTasks_WithSpecificUserId_ShouldResolveUser() {
        User targetUser = new User();
        targetUser.setId(200L);

        when(userRepository.findById(200L)).thenReturn(Optional.of(targetUser));
        when(taskRepository.findCalendarTasksByDate(eq(targetUser), any(LocalDate.class))).thenReturn(List.of());
        when(taskMapper.toResponseList(anyList())).thenReturn(List.of());

        CalendarEventsResponse response = calendarService.getTodayTasks(200L);

        assertNotNull(response);
        verify(userRepository).findById(200L);
        verify(taskRepository).findCalendarTasksByDate(eq(targetUser), any(LocalDate.class));
    }
}
