package com.taskforge.common.api;

import java.time.LocalDateTime;
import java.util.Map;

public record ApiResponse<T>(
    boolean success,
    String message,
    T data,
    Map<String, String> errors,
    LocalDateTime timestamp
) {
    public static <T> ApiResponse<T> success(T data, String message) {
        return new ApiResponse<>(true, message, data, null, LocalDateTime.now());
    }

    public static <T> ApiResponse<T> success(T data) {
        return success(data, "Operation completed successfully");
    }

    public static <T> ApiResponse<T> error(String message, Map<String, String> errors) {
        return new ApiResponse<>(false, message, null, errors, LocalDateTime.now());
    }

    public static <T> ApiResponse<T> error(String message) {
        return error(message, null);
    }
}
