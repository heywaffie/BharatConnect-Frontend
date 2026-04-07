package com.citizenconnect.backend.dto.feedback;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;

public record CreateFeedbackRequest(
        @Min(1) @Max(5) Integer rating,
        @NotBlank String feedback,
        @NotBlank String category,
        @NotBlank String authorName,
        @NotBlank @Email String email
) {
}
