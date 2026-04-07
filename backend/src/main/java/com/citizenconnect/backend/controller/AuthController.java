package com.citizenconnect.backend.controller;

import com.citizenconnect.backend.dto.auth.AuthResponse;
import com.citizenconnect.backend.dto.auth.LoginRequest;
import com.citizenconnect.backend.dto.auth.RegisterRequest;
import com.citizenconnect.backend.entity.AppUser;
import com.citizenconnect.backend.entity.Role;
import com.citizenconnect.backend.entity.UserStatus;
import com.citizenconnect.backend.repository.UserRepository;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDateTime;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final UserRepository userRepository;

    @PostMapping("/register")
    public AuthResponse register(@Valid @RequestBody RegisterRequest request) {
        userRepository.findByEmailIgnoreCase(request.email()).ifPresent(existing -> {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Email already registered.");
        });

        AppUser user = userRepository.save(AppUser.builder()
                .name(request.name())
                .email(request.email())
                .password(request.password())
                .role(toRole(request.role()))
                .status(UserStatus.ACTIVE)
                .createdAt(LocalDateTime.now())
                .build());

        return toAuthResponse(user);
    }

    @PostMapping("/login")
    public AuthResponse login(@Valid @RequestBody LoginRequest request) {
        AppUser user = userRepository.findByEmailIgnoreCase(request.email())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid credentials."));

        if (!user.getPassword().equals(request.password()) || user.getRole() != toRole(request.role())) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid credentials.");
        }

        if (user.getStatus() == UserStatus.SUSPENDED) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Account is suspended.");
        }

        return toAuthResponse(user);
    }

    private AuthResponse toAuthResponse(AppUser user) {
        return new AuthResponse(
                user.getId(),
                user.getName(),
                user.getEmail(),
                fromRole(user.getRole()),
                user.getStatus().name().toLowerCase()
        );
    }

    private Role toRole(String role) {
        return switch (role.toLowerCase()) {
            case "citizen" -> Role.CITIZEN;
            case "politician" -> Role.POLITICIAN;
            case "moderator" -> Role.MODERATOR;
            case "admin" -> Role.ADMIN;
            default -> throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid role.");
        };
    }

    private String fromRole(Role role) {
        return role.name().toLowerCase();
    }
}
