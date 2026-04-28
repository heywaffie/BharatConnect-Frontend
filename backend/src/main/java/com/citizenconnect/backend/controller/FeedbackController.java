package com.citizenconnect.backend.controller;

import com.citizenconnect.backend.dto.feedback.CreateFeedbackRequest;
import com.citizenconnect.backend.entity.Feedback;
import com.citizenconnect.backend.repository.FeedbackRepository;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/api/feedback")
@RequiredArgsConstructor
public class FeedbackController {

    private final FeedbackRepository feedbackRepository;

    @GetMapping
    public List<Feedback> getAll() {
        return feedbackRepository.findAllByOrderByCreatedAtDesc();
    }

    @PostMapping
    public Feedback create(@Valid @RequestBody CreateFeedbackRequest request) {
        Feedback feedback = Feedback.builder()
                .rating(request.rating())
                .feedback(request.feedback())
                .category(request.category())
                .authorName(request.authorName())
                .email(request.email())
                .createdAt(LocalDateTime.now())
                .build();

        return feedbackRepository.save(feedback);
    }
}
