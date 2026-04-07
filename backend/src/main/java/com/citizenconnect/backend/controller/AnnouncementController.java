package com.citizenconnect.backend.controller;

import com.citizenconnect.backend.dto.announcement.CreateAnnouncementRequest;
import com.citizenconnect.backend.entity.Announcement;
import com.citizenconnect.backend.repository.AnnouncementRepository;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/api/announcements")
@RequiredArgsConstructor
public class AnnouncementController {

    private final AnnouncementRepository announcementRepository;

    @GetMapping
    public List<Announcement> getAll() {
        return announcementRepository.findAllByOrderByCreatedAtDesc();
    }

    @PostMapping
    public Announcement create(@Valid @RequestBody CreateAnnouncementRequest request) {
        Announcement announcement = Announcement.builder()
                .title(request.title())
                .content(request.content())
                .category(request.category())
                .authorName(request.authorName())
                .createdAt(LocalDateTime.now())
                .build();

        return announcementRepository.save(announcement);
    }
}
