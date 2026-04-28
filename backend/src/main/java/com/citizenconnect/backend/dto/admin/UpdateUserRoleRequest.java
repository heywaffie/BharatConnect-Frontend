package com.citizenconnect.backend.dto.admin;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;

public record UpdateUserRoleRequest(
        @NotBlank @Pattern(regexp = "citizen|politician|moderator") String role
) {
}
