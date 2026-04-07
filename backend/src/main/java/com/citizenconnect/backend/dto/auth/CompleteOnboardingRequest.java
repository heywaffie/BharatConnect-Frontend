package com.citizenconnect.backend.dto.auth;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

public record CompleteOnboardingRequest(
        @NotBlank @Email String email,
        @NotBlank String name
) {
}
