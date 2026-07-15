package com.taskforge.module.ai.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.taskforge.common.exception.InvalidStateException;
import jakarta.annotation.PostConstruct;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.http.client.SimpleClientHttpRequestFactory;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;
import org.springframework.web.client.HttpStatusCodeException;
import org.springframework.web.client.ResourceAccessException;
import org.springframework.web.client.RestTemplate;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * Production-grade Gemini AI Provider with automatic model fallback, retry logic with exponential backoff,
 * request validation, detailed diagnostics, and clean error handling.
 */
@Component
public class GeminiProvider {

    private static final Logger log = LoggerFactory.getLogger(GeminiProvider.class);

    private final ObjectMapper objectMapper;
    private RestTemplate restTemplate;

    public GeminiProvider(ObjectMapper objectMapper) {
        this.objectMapper = objectMapper;
    }

    @Value("${gemini.api.key:}")
    private String apiKey;

    @Value("${gemini.model:gemini-3.5-flash}")
    private String defaultModel;

    @Value("${gemini.models:gemini-3.5-flash,gemini-3.5-flash-lite,gemini-3.5-nano}")
    private String configuredModelsString;

    @Value("${gemini.retry.maxAttempts:3}")
    private int maxAttempts;

    @Value("${gemini.retry.initialDelay:1000}")
    private long initialDelayMs;

    @Value("${gemini.connect.timeout:15000}")
    private int connectTimeoutMs;

    @Value("${gemini.read.timeout:60000}")
    private int readTimeoutMs;

    private List<String> fallbackModelsList = new ArrayList<>();

    @PostConstruct
    public void init() {
        SimpleClientHttpRequestFactory factory = new SimpleClientHttpRequestFactory();
        factory.setConnectTimeout(connectTimeoutMs);
        factory.setReadTimeout(readTimeoutMs);
        this.restTemplate = new RestTemplate(factory);

        fallbackModelsList = new ArrayList<>();
        if (StringUtils.hasText(configuredModelsString)) {
            Arrays.stream(configuredModelsString.split(","))
                    .map(String::trim)
                    .filter(StringUtils::hasText)
                    .forEach(m -> {
                        if (!fallbackModelsList.contains(m)) {
                            fallbackModelsList.add(m);
                        }
                    });
        }
        if (fallbackModelsList.isEmpty()) {
            if (StringUtils.hasText(defaultModel)) {
                fallbackModelsList.add(defaultModel.trim());
            }
            fallbackModelsList.add("gemini-3.5-flash-lite");
            fallbackModelsList.add("gemini-3.5-nano");
        }

        log.info("Gemini Provider initialized successfully");
        log.info("Configured Fallback Models: {}", fallbackModelsList);
        log.info("Max Retries Per Model: {}, Initial Delay: {}ms", maxAttempts, initialDelayMs);
        log.info("Connect Timeout: {}ms, Read Timeout: {}ms", connectTimeoutMs, readTimeoutMs);
        if (StringUtils.hasText(apiKey)) {
            log.info("API Key: Loaded Successfully");
        } else {
            log.warn("API Key: Missing or Not Configured");
        }
    }

    public String generateResponse(String prompt) {
        return generateContent(prompt, false);
    }

    public String generateJson(String prompt) {
        return generateContent(prompt, true);
    }

    private String generateContent(String prompt, boolean requireJson) {
        // Validate request parameters before sending
        validateRequest(prompt);

        Map<String, Object> requestBody = buildPayload(prompt, requireJson);

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        HttpEntity<Map<String, Object>> entity = new HttpEntity<>(requestBody, headers);

        int totalModels = fallbackModelsList.size();

        for (int mIndex = 0; mIndex < totalModels; mIndex++) {
            String activeModel = fallbackModelsList.get(mIndex);
            String redactedUrl = String.format(
                    "https://generativelanguage.googleapis.com/v1beta/models/%s:generateContent",
                    activeModel
            );
            String fullUrl = String.format(
                    "https://generativelanguage.googleapis.com/v1beta/models/%s:generateContent?key=%s",
                    activeModel, apiKey.trim()
            );

            log.info("Using model: {}", activeModel);

            int attempts = 0;
            long currentDelay = Math.max(initialDelayMs, 1000L);

            while (attempts < maxAttempts) {
                attempts++;
                long startTime = System.currentTimeMillis();

                try {
                    ResponseEntity<String> response = restTemplate.exchange(fullUrl, HttpMethod.POST, entity, String.class);
                    long latency = System.currentTimeMillis() - startTime;

                    if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
                        JsonNode rootNode = objectMapper.readTree(response.getBody());
                        JsonNode candidatesNode = rootNode.path("candidates");
                        if (candidatesNode.isArray() && candidatesNode.size() > 0) {
                            JsonNode textNode = candidatesNode.get(0).path("content").path("parts").get(0).path("text");
                            String responseText = textNode.asText("");
                            log.info("Success! Latency: {} ms (model: {})", latency, activeModel);
                            if (requireJson) {
                                return sanitizeJsonText(responseText);
                            }
                            return responseText;
                        }
                    }
                    log.warn("Gemini returned HTTP 200 on attempt {}/{} for model {} but response payload was empty.",
                            attempts, maxAttempts, activeModel);

                } catch (HttpStatusCodeException ex) {
                    long latency = System.currentTimeMillis() - startTime;
                    HttpStatusCode status = ex.getStatusCode();
                    String responseBody = ex.getResponseBodyAsString();
                    HttpHeaders responseHeaders = ex.getResponseHeaders();

                    log.error("Gemini API Error -> HTTP {} received on Attempt {} for model {}", status.value(), attempts, activeModel);
                    log.error("Endpoint: {}, Latency: {} ms", redactedUrl, latency);
                    log.error("Response Headers: {}", responseHeaders);
                    log.error("Response Body: {}", responseBody);

                    boolean isRetryable = status.value() == 429 || status.value() == 500 || status.value() == 502 || status.value() == 503 || status.value() == 504;

                    if (isRetryable && attempts < maxAttempts) {
                        log.warn("Retry {} (waiting {}ms)...", attempts, currentDelay);
                        sleep(currentDelay);
                        currentDelay *= 2; // Exponential backoff (1s -> 2s -> 4s)
                        continue;
                    }

                    // Non-retryable status or retries exhausted for this model
                    log.warn("Attempts exhausted or non-retryable HTTP status {} for model {}", status.value(), activeModel);
                    break; // break out of inner attempt loop to try next model

                } catch (ResourceAccessException ex) {
                    long latency = System.currentTimeMillis() - startTime;
                    log.error("Gemini Network / Timeout Error on Attempt {} for model {}: {}", attempts, activeModel, ex.getMessage());
                    log.error("Endpoint: {}, Latency: {} ms", redactedUrl, latency);

                    if (attempts < maxAttempts) {
                        log.warn("Retry {} (waiting {}ms)...", attempts, currentDelay);
                        sleep(currentDelay);
                        currentDelay *= 2;
                        continue;
                    }
                    log.warn("Network timeout retries exhausted for model {}", activeModel);
                    break;

                } catch (InvalidStateException ex) {
                    throw ex;
                } catch (Exception ex) {
                    long latency = System.currentTimeMillis() - startTime;
                    log.error("Unexpected error communicating with model {} after {} ms: {}", activeModel, latency, ex.getMessage(), ex);
                    break;
                }
            }

            // If current activeModel failed after maxAttempts or non-retryable error, log model switch
            if (mIndex < totalModels - 1) {
                String nextModel = fallbackModelsList.get(mIndex + 1);
                log.warn("All attempts failed for model {}. Switching to model {}", activeModel, nextModel);
            }
        }

        // All models failed! Return clean, friendly user-facing exception
        log.error("All configured Gemini models failed after retries and fallbacks.");
        throw new InvalidStateException("Google Gemini is temporarily busy. Please try again in a few moments.");
    }

    private void validateRequest(String prompt) {
        if (!StringUtils.hasText(apiKey)) {
            log.error("Gemini Request Validation Failed: API key missing");
            throw new InvalidStateException("Gemini API key is not configured. Please set GEMINI_API_KEY environment variable or application property.");
        }
        if (!StringUtils.hasText(prompt)) {
            log.error("Gemini Request Validation Failed: Prompt empty");
            throw new InvalidStateException("Prompt cannot be empty.");
        }
    }

    private Map<String, Object> buildPayload(String prompt, boolean requireJson) {
        Map<String, Object> requestBody = new HashMap<>();

        List<Map<String, Object>> contents = new ArrayList<>();
        Map<String, Object> contentMap = new HashMap<>();
        contentMap.put("role", "user");

        List<Map<String, String>> parts = new ArrayList<>();
        Map<String, String> partMap = new HashMap<>();
        partMap.put("text", prompt);
        parts.add(partMap);

        contentMap.put("parts", parts);
        contents.add(contentMap);
        requestBody.put("contents", contents);

        Map<String, Object> generationConfig = new HashMap<>();
        generationConfig.put("temperature", 0.2);
        if (requireJson) {
            generationConfig.put("responseMimeType", "application/json");
        }
        requestBody.put("generationConfig", generationConfig);

        return requestBody;
    }

    private void sleep(long millis) {
        try {
            Thread.sleep(millis);
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
        }
    }

    private String sanitizeJsonText(String text) {
        if (text == null) return "{}";
        String cleaned = text.trim();
        if (cleaned.startsWith("```json")) {
            cleaned = cleaned.substring(7);
        } else if (cleaned.startsWith("```")) {
            cleaned = cleaned.substring(3);
        }
        if (cleaned.endsWith("```")) {
            cleaned = cleaned.substring(0, cleaned.length() - 3);
        }
        return cleaned.trim();
    }
}
