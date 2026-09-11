package com.taskforge.module.user.repository;

import com.taskforge.common.dto.MonthlyCount;
import com.taskforge.module.user.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long>, JpaSpecificationExecutor<User> {
    Optional<User> findByEmail(String email);
    boolean existsByEmail(String email);
    long countByEnabledTrueAndDeletedFalse();

    @Query("SELECT u FROM User u WHERE u.deleted = false AND u.enabled = true AND " +
           "(LOWER(u.email) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
           "LOWER(u.firstName) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
           "LOWER(u.lastName) LIKE LOWER(CONCAT('%', :keyword, '%')))")
    List<User> searchByKeyword(@Param("keyword") String keyword);

    /**
     * Monthly user registration counts for a time range (admin analytics trend).
     * Uses Hibernate YEAR/MONTH extensions — compatible with H2 (MySQL mode) and MySQL.
     */
    @Query("SELECT YEAR(u.createdAt) AS year, MONTH(u.createdAt) AS month, COUNT(u) AS count " +
           "FROM User u WHERE u.createdAt >= :start AND u.createdAt < :end " +
           "GROUP BY YEAR(u.createdAt), MONTH(u.createdAt)")
    List<MonthlyCount> countCreatedByMonth(@Param("start") LocalDateTime start,
                                           @Param("end") LocalDateTime end);
}
