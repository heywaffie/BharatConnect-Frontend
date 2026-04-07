package com.citizenconnect.backend.dto.issue;

import jakarta.validation.constraints.NotBlank;

public record AddIssueResponseRequest(
        @NotBlank String message,
        @NotBlank String authorName
) {
}
