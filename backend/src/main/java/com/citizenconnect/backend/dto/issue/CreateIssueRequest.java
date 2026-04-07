package com.citizenconnect.backend.dto.issue;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

public record CreateIssueRequest(
        @NotBlank String title,
        @NotBlank String description,
        @NotBlank String category,
        @NotBlank String location,
        @NotBlank @Email String reporterEmail
) {
}
