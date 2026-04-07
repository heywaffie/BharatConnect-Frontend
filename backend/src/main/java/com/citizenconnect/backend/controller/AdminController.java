package com.citizenconnect.backend.controller;

import com.citizenconnect.backend.dto.admin.UpdateUserStatusRequest;
import com.citizenconnect.backend.entity.AppUser;
import com.citizenconnect.backend.entity.UserStatus;
import com.citizenconnect.backend.repository.UserRepository;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
public class AdminController {

    private final UserRepository userRepository;

    @GetMapping("/users")
    public List<AppUser> getUsers() {
        return userRepository.findAll();
    }

    @PatchMapping("/users/{userId}/status")
    public AppUser updateUserStatus(@PathVariable Long userId,
                                    @Valid @RequestBody UpdateUserStatusRequest request) {
        AppUser user = userRepository.findById(userId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found."));

        user.setStatus(toUserStatus(request.status()));
        return userRepository.save(user);
    }

    private UserStatus toUserStatus(String status) {
        return switch (status.toLowerCase()) {
            case "active" -> UserStatus.ACTIVE;
            case "suspended" -> UserStatus.SUSPENDED;
            default -> throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid user status.");
        };
    }
}
