package com.citizenconnect.backend.repository;

import com.citizenconnect.backend.entity.Issue;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface IssueRepository extends JpaRepository<Issue, Long> {
    List<Issue> findByReporterEmailIgnoreCaseOrderByCreatedAtDesc(String email);
    List<Issue> findAllByOrderByCreatedAtDesc();
}
