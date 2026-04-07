package com.citizenconnect.backend.controller;

import com.citizenconnect.backend.dto.auth.AuthResponse;
import com.citizenconnect.backend.dto.auth.CompleteOnboardingRequest;
import com.citizenconnect.backend.dto.auth.GoogleAuthRequest;
import com.citizenconnect.backend.dto.auth.LoginRequest;
import com.citizenconnect.backend.dto.auth.RegisterRequest;
import com.citizenconnect.backend.entity.AppUser;
import com.citizenconnect.backend.entity.Role;
import com.citizenconnect.backend.entity.UserStatus;
import com.citizenconnect.backend.repository.UserRepository;
import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.web.client.RestClientException;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDateTime;
import java.util.UUID;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final UserRepository userRepository;

    @Value("${app.google.client-id:}")
    private String googleClientId;

    @Value("${app.admin.email:ashokvibes@gmail.com}")
    private String adminEmail;

    @PostMapping("/register")
    public AuthResponse register(@Valid @RequestBody RegisterRequest request) {
        userRepository.findByEmailIgnoreCase(request.email()).ifPresent(existing -> {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Email already registered.");
        });

        AppUser user = userRepository.save(AppUser.builder()
                .name(request.name())
                .email(request.email())
                .password(request.password())
                .role(resolveRoleByEmail(request.email()))
                .status(UserStatus.ACTIVE)
                .onboardingCompleted(false)
                .createdAt(LocalDateTime.now())
                .build());

        return toAuthResponse(user);
    }

    @PostMapping("/login")
    public AuthResponse login(@Valid @RequestBody LoginRequest request) {
        AppUser user = userRepository.findByEmailIgnoreCase(request.email())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid credentials."));

        if (!user.getPassword().equals(request.password())) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid credentials.");
        }

        if (user.getStatus() == UserStatus.SUSPENDED) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Account is suspended.");
        }

        if (isAdminEmail(user.getEmail()) && user.getRole() != Role.ADMIN) {
            userRepository.updateRoleByEmail(user.getEmail(), Role.ADMIN.name());
            user = userRepository.findById(user.getId())
                    .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found."));
        }

        return toAuthResponse(user);
    }

    @PostMapping("/google")
    public AuthResponse googleLogin(@Valid @RequestBody GoogleAuthRequest request) {
        if (googleClientId == null || googleClientId.isBlank()) {
            throw new ResponseStatusException(HttpStatus.SERVICE_UNAVAILABLE, "Google login is not configured.");
        }

        GoogleTokenInfo tokenInfo = verifyGoogleToken(request.idToken());
        if (tokenInfo == null || tokenInfo.email() == null || tokenInfo.email().isBlank()) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid Google token.");
        }
        if (!googleClientId.equals(tokenInfo.aud())) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Google token audience mismatch.");
        }
        if (!"true".equalsIgnoreCase(tokenInfo.emailVerified())) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Google email is not verified.");
        }

        AppUser user = userRepository.findByEmailIgnoreCase(tokenInfo.email())
                .map(existing -> {
                    if (existing.getStatus() == UserStatus.SUSPENDED) {
                        throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Account is suspended.");
                    }
                    if (isAdminEmail(existing.getEmail()) && existing.getRole() != Role.ADMIN) {
                        userRepository.updateRoleByEmail(existing.getEmail(), Role.ADMIN.name());
                        return userRepository.findById(existing.getId()).orElse(existing);
                    }
                    return existing;
                })
                .orElseGet(() -> userRepository.save(AppUser.builder()
                        .name(resolveName(tokenInfo))
                        .email(tokenInfo.email())
                        .password("GOOGLE_AUTH_" + UUID.randomUUID())
                        .role(resolveRoleByEmail(tokenInfo.email()))
                        .status(UserStatus.ACTIVE)
                        .onboardingCompleted(false)
                        .createdAt(LocalDateTime.now())
                        .build()));

        return toAuthResponse(user);
    }

    @PostMapping("/onboarding")
    public AuthResponse completeOnboarding(@Valid @RequestBody CompleteOnboardingRequest request) {
        AppUser user = userRepository.findByEmailIgnoreCase(request.email())
            .orElseGet(() -> userRepository.save(AppUser.builder()
                .name(request.name().trim())
                .email(request.email().trim())
                .password("ONBOARDING_AUTH_" + UUID.randomUUID())
                .role(resolveRoleByEmail(request.email()))
                .status(UserStatus.ACTIVE)
                .onboardingCompleted(false)
                .createdAt(LocalDateTime.now())
                .build()));

        if (user.getStatus() == UserStatus.SUSPENDED) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Account is suspended.");
        }

        user.setName(request.name().trim());
        user.setPhoneNumber(request.phoneNumber().trim());
        user.setOnboardingCompleted(true);

        return toAuthResponse(userRepository.save(user));
    }

    private GoogleTokenInfo verifyGoogleToken(String idToken) {
        String url = "https://oauth2.googleapis.com/tokeninfo?id_token=" + idToken;
        try {
            RestTemplate restTemplate = new RestTemplate();
            return restTemplate.getForObject(url, GoogleTokenInfo.class);
        } catch (RestClientException ex) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid Google token.");
        }
    }

    private String resolveName(GoogleTokenInfo tokenInfo) {
        if (tokenInfo.name() != null && !tokenInfo.name().isBlank()) {
            return tokenInfo.name();
        }
        String email = tokenInfo.email();
        if (email == null || email.isBlank()) {
            return "Google User";
        }
        int atIndex = email.indexOf('@');
        return atIndex > 0 ? email.substring(0, atIndex) : email;
    }

    private AuthResponse toAuthResponse(AppUser user) {
        return new AuthResponse(
                user.getId(),
                user.getName(),
                user.getEmail(),
                user.getPhoneNumber(),
                fromRole(user.getRole()),
                user.getStatus().name().toLowerCase(),
                user.isOnboardingCompleted()
        );
    }

    private Role resolveRoleByEmail(String email) {
        return isAdminEmail(email) ? Role.ADMIN : Role.CITIZEN;
    }

    private boolean isAdminEmail(String email) {
        return email != null && email.trim().equalsIgnoreCase(adminEmail);
    }

    private String fromRole(Role role) {
        return role.name().toLowerCase();
    }

    private record GoogleTokenInfo(
            String aud,
            String email,
            String name,
            @JsonProperty("email_verified") String emailVerified
    ) {
    }
}
