package com.taskforge.common.exception;

public class TaskForgeException extends RuntimeException {
    public TaskForgeException(String message) {
        super(message);
    }

    public TaskForgeException(String message, Throwable cause) {
        super(message, cause);
    }
}
