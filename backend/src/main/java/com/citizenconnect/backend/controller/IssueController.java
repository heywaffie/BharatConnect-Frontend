package com.citizenconnect.backend.controller;

import com.citizenconnect.backend.dto.issue.AddIssueResponseRequest;
import com.citizenconnect.backend.dto.issue.CreateIssueRequest;
import com.citizenconnect.backend.dto.issue.UpdateIssueStatusRequest;
import com.citizenconnect.backend.entity.AppUser;
import com.citizenconnect.backend.entity.Issue;
import com.citizenconnect.backend.entity.IssueResponse;
import com.citizenconnect.backend.entity.IssueStatus;
import com.citizenconnect.backend.repository.IssueRepository;
import com.citizenconnect.backend.repository.UserRepository;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/api/issues")
@RequiredArgsConstructor
public class IssueController {

    private final IssueRepository issueRepository;
    private final UserRepository userRepository;

    @GetMapping
    public List<Issue> getAllIssues() {
        return issueRepository.findAllByOrderByCreatedAtDesc();
    }

    @GetMapping("/mine")
    public List<Issue> getMyIssues(@RequestParam String email) {
        return issueRepository.findByReporterEmailIgnoreCaseOrderByCreatedAtDesc(email);
    }

    @PostMapping
    public Issue createIssue(@Valid @RequestBody CreateIssueRequest request) {
        AppUser reporter = userRepository.findByEmailIgnoreCase(request.reporterEmail())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "Reporter not found."));

        Issue issue = Issue.builder()
                .title(request.title())
                .description(request.description())
                .category(request.category())
                .location(request.location())
                .status(IssueStatus.PENDING)
                .upvotes(0)
                .reporter(reporter)
                .createdAt(LocalDateTime.now())
                .build();

        return issueRepository.save(issue);
    }

    @PatchMapping("/{issueId}/status")
    public Issue updateIssueStatus(@PathVariable Long issueId,
                                   @Valid @RequestBody UpdateIssueStatusRequest request) {
        Issue issue = issueRepository.findById(issueId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Issue not found."));

        issue.setStatus(toIssueStatus(request.status()));
        return issueRepository.save(issue);
    }

    @PostMapping("/{issueId}/upvote")
    public Issue upvoteIssue(@PathVariable Long issueId) {
        Issue issue = issueRepository.findById(issueId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Issue not found."));

        issue.setUpvotes(issue.getUpvotes() + 1);
        return issueRepository.save(issue);
    }

    @PostMapping("/{issueId}/responses")
    public Issue addResponse(@PathVariable Long issueId,
                             @Valid @RequestBody AddIssueResponseRequest request) {
        Issue issue = issueRepository.findById(issueId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Issue not found."));

        issue.getResponses().add(IssueResponse.builder()
                .message(request.message())
                .authorName(request.authorName())
                .createdAt(LocalDateTime.now())
                .issue(issue)
                .build());

        return issueRepository.save(issue);
    }

    private IssueStatus toIssueStatus(String status) {
        return switch (status.toLowerCase()) {
            case "pending" -> IssueStatus.PENDING;
            case "in-progress" -> IssueStatus.IN_PROGRESS;
            case "resolved" -> IssueStatus.RESOLVED;
            default -> throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid issue status.");
        };
    }
}
