package com.citizenconnect.backend.repository;

import com.citizenconnect.backend.entity.AppUser;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

public interface UserRepository extends JpaRepository<AppUser, Long> {
    Optional<AppUser> findByEmailIgnoreCase(String email);

    @Query(value = "SELECT * FROM users ORDER BY created_at DESC", nativeQuery = true)
    List<AppUser> findAllOrderByCreatedAtDesc();

    @Modifying
    @Transactional
    @Query(value = "UPDATE users SET status = :status WHERE id = :userId", nativeQuery = true)
    int updateUserStatusById(@Param("userId") Long userId, @Param("status") String status);

    @Modifying
    @Transactional
    @Query(value = "UPDATE users SET role = :role WHERE id = :userId", nativeQuery = true)
    int updateUserRoleById(@Param("userId") Long userId, @Param("role") String role);

    @Modifying
    @Transactional
    @Query(value = "UPDATE users SET role = :role WHERE email = :email", nativeQuery = true)
    int updateRoleByEmail(@Param("email") String email, @Param("role") String role);
}
