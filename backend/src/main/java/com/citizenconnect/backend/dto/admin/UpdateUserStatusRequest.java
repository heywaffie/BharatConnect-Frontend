package com.citizenconnect.backend.dto.admin;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;

public record UpdateUserStatusRequest(
        @NotBlank @Pattern(regexp = "active|suspended") String status
) {
}
