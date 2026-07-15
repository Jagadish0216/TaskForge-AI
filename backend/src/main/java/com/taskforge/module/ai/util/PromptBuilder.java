package com.taskforge.module.ai.util;

public class PromptBuilder {

    public static String buildGenerateProjectPrompt(String promptText) {
        return """
            You are an expert software project manager and system architect.
            The user wants to generate a complete, real project structure for: "%s".
            
            Return strictly valid JSON matching this exact JSON schema:
            {
              "projectName": "Name of the Project",
              "description": "Comprehensive project scope description...",
              "technologyStack": ["React", "Spring Boot", "MySQL"],
              "modules": [
                {
                  "name": "Module Name",
                  "description": "Module purpose...",
                  "tasks": [
                    {
                      "title": "Clear Task Title",
                      "description": "Actionable task requirements",
                      "priority": "HIGH",
                      "estimatedHours": 8
                    }
                  ]
                }
              ],
              "milestones": ["Milestone 1", "Milestone 2"]
            }

            Rules:
            1. Priority must be one of: LOW, MEDIUM, HIGH, URGENT.
            2. Estimated hours must be a positive integer between 2 and 40.
            3. Include 2 to 4 modules, each containing 2 to 4 concrete tasks.
            4. Respond ONLY with valid JSON. Do not include markdown formatting or explanations.
            """.formatted(promptText);
    }

    public static String buildProjectChatPrompt(String userMessage, String projectContext) {
        return """
            You are TaskForge AI, an intelligent project management assistant.
            Here is the current real project and workspace data from the database:
            ----------------------------------------
            %s
            ----------------------------------------
            
            User Question: %s

            Instructions:
            - Answer the user concisely based on the real workspace data provided above.
            - If details are missing from context, answer based on best project management practices while noting current database metrics.
            """.formatted(projectContext, userMessage);
    }

    public static String buildSprintPlanPrompt(String projectContext, String sprintGoal) {
        return """
            You are an Agile Sprint Master. Analyze this project backlog from the database:
            ----------------------------------------
            %s
            ----------------------------------------
            Goal / Focus: %s

            Output strictly valid JSON with this structure:
            {
              "sprintGoal": "Clear sprint goal",
              "storyPoints": 30,
              "sprintTasks": [
                {
                  "title": "Task title",
                  "priority": "HIGH",
                  "estimatedHours": 6,
                  "reasoning": "Why included in sprint"
                }
              ],
              "risks": ["Risk 1", "Risk 2"],
              "recommendations": ["Recommendation 1", "Recommendation 2"]
            }

            Respond ONLY with valid JSON.
            """.formatted(projectContext, (sprintGoal != null && !sprintGoal.isBlank()) ? sprintGoal : "Maximize feature delivery and resolve high priority items");
    }

    public static String buildRiskAnalysisPrompt(String projectContext) {
        return """
            You are a Senior Project Risk Audit Analyst. Evaluate these real database performance metrics for the project:
            ----------------------------------------
            %s
            ----------------------------------------

            Output strictly valid JSON with this structure:
            {
              "healthScore": 85,
              "risks": [
                {
                  "level": "HIGH",
                  "issue": "Concise risk summary",
                  "impact": "Potential impact on delivery"
                }
              ],
              "recommendations": [
                "Actionable mitigation step 1",
                "Actionable mitigation step 2"
              ]
            }

            Rules:
            - Calculate healthScore between 0 and 100 based on overdue tasks, completion ratios, and task density.
            - Respond ONLY with valid JSON.
            """.formatted(projectContext);
    }

    public static String buildDocumentationPrompt(String docType, String projectContext) {
        return """
            You are a Technical Writer. Generate professional Markdown documentation for this project:
            Doc Type: %s
            Project Details & Metadata:
            ----------------------------------------
            %s
            ----------------------------------------

            Instructions:
            - Format in clean Markdown with clear headings, badges, setup instructions, and code blocks where applicable.
            """.formatted(docType, projectContext);
    }
}
