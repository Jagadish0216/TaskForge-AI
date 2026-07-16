package com.taskforge.module.ai.service;

import com.taskforge.module.ai.constant.AIIntent;
import org.springframework.stereotype.Component;

import java.util.regex.Pattern;

@Component
public class IntentDetector {

    // Keywords/phrases indicating NEW_PROJECT request
    private static final Pattern NEW_PROJECT_PATTERN = Pattern.compile(
            ".*\\b(build|create|generate|develop|design|make|setup|set up|spin up|construct)\\b.*\\b(system|crm|lms|erp|platform|app|application|portal|service|database|management|parking|banking|e-commerce|ecommerce|store|shop|tool|website|project|solution|software|dashboard|api)\\b.*" +
            "|^(build|create|generate|develop|design|make|setup|set up|spin up|construct)\\s+a(n)?\\s+.*" +
            "|^(build|create|generate|develop|design|make|setup|set up|spin up|construct)\\s+[a-z0-9_ -]+$",
            Pattern.CASE_INSENSITIVE
    );

    // Keywords/phrases indicating PROJECT_CHAT request
    private static final Pattern PROJECT_CHAT_PATTERN = Pattern.compile(
            ".*\\b(my project|current project|active project|this project|our project|project progress|project status|project health|project risk|project risks|project summary|summarize project|sprint|sprint plan|plan sprint|backlog|pending tasks|pending task|overdue|overdue tasks|completed tasks|what should i work on|show tasks|list tasks|generate documentation|document my project|project metrics|task status|health score|how is my project|how is current project)\\b.*",
            Pattern.CASE_INSENSITIVE
    );

    public AIIntent detectIntent(String prompt) {
        if (prompt == null || prompt.isBlank()) {
            return AIIntent.GENERAL_CHAT;
        }

        String lowerPrompt = prompt.trim().toLowerCase();

        // 1. Check for GENERAL_CHAT questions (explanations, definitions, greetings)
        if (lowerPrompt.startsWith("explain how") || lowerPrompt.startsWith("how to") || 
            lowerPrompt.startsWith("what is") || lowerPrompt.startsWith("explain ") || 
            lowerPrompt.startsWith("difference between") || lowerPrompt.equals("hello") || lowerPrompt.equals("hi")) {
            
            // Unless it explicitly asks about active workspace project
            if (PROJECT_CHAT_PATTERN.matcher(lowerPrompt).matches()) {
                return AIIntent.PROJECT_CHAT;
            }
            return AIIntent.GENERAL_CHAT;
        }

        // 2. Check for NEW_PROJECT intent
        if (NEW_PROJECT_PATTERN.matcher(lowerPrompt).matches()) {
            // Exclude requests asking about existing project status/docs/summary
            if (!lowerPrompt.contains("my project") && !lowerPrompt.contains("current project") &&
                !lowerPrompt.contains("existing project") && !lowerPrompt.contains("documentation") &&
                !lowerPrompt.contains("sprint")) {
                return AIIntent.NEW_PROJECT;
            }
        }

        // 3. Check for PROJECT_CHAT intent
        if (PROJECT_CHAT_PATTERN.matcher(lowerPrompt).matches()) {
            return AIIntent.PROJECT_CHAT;
        }

        // 4. Default fallback to GENERAL_CHAT
        return AIIntent.GENERAL_CHAT;
    }
}
