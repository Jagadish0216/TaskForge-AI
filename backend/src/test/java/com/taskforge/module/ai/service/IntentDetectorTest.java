package com.taskforge.module.ai.service;

import com.taskforge.module.ai.constant.AIIntent;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.ValueSource;

import static org.junit.jupiter.api.Assertions.assertEquals;

class IntentDetectorTest {

    private IntentDetector intentDetector;

    @BeforeEach
    void setUp() {
        intentDetector = new IntentDetector();
    }

    @ParameterizedTest
    @ValueSource(strings = {
            "Build Hospital Management System",
            "Build a Hospital Management System",
            "Create a CRM",
            "Generate an Inventory Management System",
            "Build an IoT Smart Parking System",
            "Create an LMS",
            "Develop a Food Delivery Platform",
            "Generate a Banking Application",
            "Build a Banking System",
            "Can you build a Hospital Management System",
            "I want to create a CRM",
            "Please generate a food delivery app"
    })
    void testNewProjectIntent(String prompt) {
        AIIntent intent = intentDetector.detectIntent(prompt);
        assertEquals(AIIntent.NEW_PROJECT, intent, "Expected NEW_PROJECT intent for prompt: " + prompt);
    }

    @ParameterizedTest
    @ValueSource(strings = {
            "Summarize my project",
            "How is my project progressing?",
            "What should I work on next?",
            "Analyze project risks",
            "Plan next sprint",
            "Show pending tasks",
            "Generate documentation",
            "How is my current project doing?"
    })
    void testProjectChatIntent(String prompt) {
        AIIntent intent = intentDetector.detectIntent(prompt);
        assertEquals(AIIntent.PROJECT_CHAT, intent, "Expected PROJECT_CHAT intent for prompt: " + prompt);
    }

    @ParameterizedTest
    @ValueSource(strings = {
            "Hello",
            "Explain Agile",
            "What is Scrum?",
            "What is RBAC?",
            "Difference between JWT and Sessions",
            "Explain Agile methodology"
    })
    void testGeneralChatIntent(String prompt) {
        AIIntent intent = intentDetector.detectIntent(prompt);
        assertEquals(AIIntent.GENERAL_CHAT, intent, "Expected GENERAL_CHAT intent for prompt: " + prompt);
    }
}
