package com.taskforge.module.auth.controller;

import com.taskforge.common.api.ApiResponse;
import com.taskforge.module.auth.dto.AuthResponse;
import com.taskforge.module.auth.dto.GoogleLoginRequest;
import com.taskforge.module.auth.service.AuthenticationService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

/**
 * Controller exposing Google OAuth 2.0 authentication endpoints.
 */
@RestController
@RequestMapping("/auth")
@Tag(name = "Google OAuth Authentication", description = "Endpoints for Google OAuth 2.0 authentication and session establishment")
public class GoogleAuthController {

    private final AuthenticationService authenticationService;

    public GoogleAuthController(AuthenticationService authenticationService) {
        this.authenticationService = authenticationService;
    }

    /**
     * Authenticates a user using Google OAuth 2.0 ID Token and establishes an HTTP Session.
     *
     * @param request     Google ID Token request
     * @param httpRequest current servlet request
     * @return auth response wrapped in ApiResponse
     */
    @PostMapping("/google")
    @Operation(summary = "Authenticate with Google OAuth 2.0", description = "Verifies Google ID Token and establishes user session.")
    public ResponseEntity<ApiResponse<AuthResponse>> googleLogin(
            @Valid @RequestBody GoogleLoginRequest request,
            HttpServletRequest httpRequest) {
        AuthResponse response = authenticationService.googleLogin(request.idToken(), httpRequest);
        return ResponseEntity.ok(ApiResponse.success(response, "Google Sign-In Successful"));
    }
}
