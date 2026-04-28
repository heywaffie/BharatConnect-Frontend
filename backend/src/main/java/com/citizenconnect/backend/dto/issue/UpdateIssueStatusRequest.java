package com.citizenconnect.backend.dto.issue;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;

public record UpdateIssueStatusRequest(
        @NotBlank @Pattern(regexp = "pending|in-progress|resolved") String status
) {
}
