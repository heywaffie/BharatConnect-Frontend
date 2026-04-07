package com.citizenconnect.backend.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "issue_responses")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class IssueResponse {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 4000)
    private String message;

    @Column(nullable = false)
    private String authorName;

    @Column(nullable = false)
    private LocalDateTime createdAt;

    @JsonIgnore
    @ManyToOne(optional = false)
    @JoinColumn(name = "issue_id")
    private Issue issue;
}
