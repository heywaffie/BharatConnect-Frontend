package com.citizenconnect.backend.dto.announcement;

import jakarta.validation.constraints.NotBlank;

public record CreateAnnouncementRequest(
        @NotBlank String title,
        @NotBlank String content,
        @NotBlank String category,
        @NotBlank String authorName
) {
}
