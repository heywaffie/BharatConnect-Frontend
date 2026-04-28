package com.citizenconnect.backend.controller;

import com.citizenconnect.backend.dto.admin.UpdateUserRoleRequest;
import com.citizenconnect.backend.dto.admin.UpdateUserStatusRequest;
import com.citizenconnect.backend.entity.AppUser;
import com.citizenconnect.backend.entity.UserStatus;
import com.citizenconnect.backend.repository.UserRepository;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
public class AdminController {

    private final UserRepository userRepository;

    @Value("${app.admin.email:ashokvibes@gmail.com}")
    private String adminEmail;

    @GetMapping("/users")
    public List<AppUser> getUsers(@RequestParam String requesterEmail) {
        assertAdmin(requesterEmail);
        return userRepository.findAllOrderByCreatedAtDesc();
    }

    @PatchMapping("/users/{userId}/status")
    public AppUser updateUserStatus(@PathVariable Long userId,
                                    @RequestParam String requesterEmail,
                                    @Valid @RequestBody UpdateUserStatusRequest request) {
        assertAdmin(requesterEmail);

        AppUser user = userRepository.findById(userId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found."));

        if (isAdminEmail(user.getEmail())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Cannot change admin status.");
        }

        int changed = userRepository.updateUserStatusById(userId, toUserStatus(request.status()).name());
        if (changed == 0) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found.");
        }

        return userRepository.findById(userId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found."));
    }

    @PatchMapping("/users/{userId}/role")
    public AppUser updateUserRole(@PathVariable Long userId,
                                  @RequestParam String requesterEmail,
                                  @Valid @RequestBody UpdateUserRoleRequest request) {
        assertAdmin(requesterEmail);

        AppUser user = userRepository.findById(userId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found."));

        if (isAdminEmail(user.getEmail())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Cannot change admin role.");
        }

        int changed = userRepository.updateUserRoleById(userId, toRoleValue(request.role()));
        if (changed == 0) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found.");
        }

        return userRepository.findById(userId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found."));
    }

    private UserStatus toUserStatus(String status) {
        return switch (status.toLowerCase()) {
            case "active" -> UserStatus.ACTIVE;
            case "suspended" -> UserStatus.SUSPENDED;
            default -> throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid user status.");
        };
    }

    private String toRoleValue(String role) {
        return switch (role.toLowerCase()) {
            case "citizen" -> "CITIZEN";
            case "politician" -> "POLITICIAN";
            case "moderator" -> "MODERATOR";
            default -> throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid role.");
        };
    }

    private void assertAdmin(String requesterEmail) {
        if (!isAdminEmail(requesterEmail)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Only admin can access this endpoint.");
        }
    }

    private boolean isAdminEmail(String email) {
        return email != null && email.trim().equalsIgnoreCase(adminEmail);
    }
}
