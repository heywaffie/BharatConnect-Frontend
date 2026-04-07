package com.citizenconnect.backend.dto.auth;

import jakarta.validation.constraints.NotBlank;

public record GoogleAuthRequest(
        @NotBlank String idToken,
        @NotBlank String role
) {
}
