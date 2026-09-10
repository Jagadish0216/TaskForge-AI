package com.taskforge.module.auth.controller;

import com.taskforge.common.api.ApiResponse;
import com.taskforge.module.auth.dto.*;
import com.taskforge.module.auth.service.AuthenticationService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

/**
 * REST controller exposing endpoints for User Registration, Authentication, Token Refresh, and Logout.
 */
@RestController
@RequestMapping("/auth")
@Tag(name = "Authentication Module", description = "Endpoints for managing user authentication, JWT tokens, and credentials")
public class AuthenticationController {

    private final AuthenticationService authenticationService;

    public AuthenticationController(AuthenticationService authenticationService) {
        this.authenticationService = authenticationService;
    }

    /**
     * Registers a new user.
     *
     * @param request the registration details
     * @return the profile of the registered user wrapped in ApiResponse
     */
    @PostMapping("/register")
    @Operation(summary = "Register a new user", description = "Creates a new user profile with selected roles in the system.")
    public ResponseEntity<ApiResponse<CurrentUserResponse>> register(@Valid @RequestBody RegisterRequest request) {
        CurrentUserResponse response = authenticationService.register(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(response, "User registered successfully"));
    }

    /**
     * Authenticates user credentials and issues JWT access & refresh tokens.
     *
     * @param request the login credentials
     * @return auth response containing user details and JWT tokens wrapped in ApiResponse
     */
    @PostMapping("/login")
    @Operation(summary = "Authenticate user", description = "Verifies email and password, returning JWT access and refresh tokens.")
    public ResponseEntity<ApiResponse<AuthResponse>> login(@Valid @RequestBody LoginRequest request) {
        AuthResponse response = authenticationService.login(request);
        return ResponseEntity.ok(ApiResponse.success(response, "Login Successful"));
    }

    /**
     * Refreshes JWT access token using a valid refresh token.
     *
     * @param request the refresh token payload
     * @return auth response containing new JWT access and refresh tokens
     */
    @PostMapping("/refresh")
    @Operation(summary = "Refresh JWT Access Token", description = "Issues a new JWT access token using a valid JWT refresh token.")
    public ResponseEntity<ApiResponse<AuthResponse>> refresh(@Valid @RequestBody RefreshTokenRequest request) {
        AuthResponse response = authenticationService.refreshToken(request.refreshToken());
        return ResponseEntity.ok(ApiResponse.success(response, "Token refreshed successfully"));
    }

    /**
     * Validates a JWT token.
     *
     * @param token Bearer token string
     * @return current user profile if valid
     */
    @GetMapping("/validate")
    @Operation(summary = "Validate JWT Token", description = "Verifies if the provided JWT token is valid and returns user profile.")
    public ResponseEntity<ApiResponse<CurrentUserResponse>> validate(@RequestParam("token") String token) {
        CurrentUserResponse response = authenticationService.validateToken(token);
        return ResponseEntity.ok(ApiResponse.success(response, "Token is valid"));
    }

    /**
     * Logs out the user.
     *
     * @return success wrapped in ApiResponse
     */
    @PostMapping("/logout")
    @Operation(summary = "Logout user", description = "Discards user authentication session.")
    public ResponseEntity<ApiResponse<Void>> logout() {
        authenticationService.logout();
        return ResponseEntity.ok(ApiResponse.success(null, "Logout successful"));
    }

    /**
     * Retrieves currently authenticated user profile.
     *
     * @return user profile details wrapped in ApiResponse
     */
    @GetMapping("/me")
    @Operation(summary = "Get current authenticated user profile", description = "Retrieves the currently authenticated user's details.")
    public ResponseEntity<ApiResponse<CurrentUserResponse>> me() {
        CurrentUserResponse response = authenticationService.getCurrentUser();
        return ResponseEntity.ok(ApiResponse.success(response, "User profile retrieved successfully"));
    }

    /**
     * Changes user password.
     *
     * @param request password change payload
     * @return success wrapped in ApiResponse
     */
    @PostMapping("/change-password")
    @Operation(summary = "Change user password", description = "Modifies current user password. Requires valid original credentials.")
    public ResponseEntity<ApiResponse<Void>> changePassword(@Valid @RequestBody ChangePasswordRequest request) {
        authenticationService.changePassword(request);
        return ResponseEntity.ok(ApiResponse.success(null, "Password updated successfully"));
    }
}
