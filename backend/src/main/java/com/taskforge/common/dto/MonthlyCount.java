package com.taskforge.common.dto;

/**
 * Shared projection for monthly aggregation queries (GROUP BY YEAR, MONTH).
 * Used by UserRepository, ProjectRepository, and TaskRepository analytics.
 */
public interface MonthlyCount {
    int getYear();
    int getMonth();
    long getCount();
}
