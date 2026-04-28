package com.citizenconnect.backend.dto.auth;

public record AuthResponse(
        Long id,
        String name,
        String email,
        String phoneNumber,
        String role,
        String status,
        boolean onboardingCompleted
) {
}
