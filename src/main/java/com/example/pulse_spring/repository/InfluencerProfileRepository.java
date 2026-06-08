package com.example.pulse_spring.repository;

import com.example.pulse_spring.domain.InfluencerProfile;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface InfluencerProfileRepository extends JpaRepository<InfluencerProfile, Long> {
    Optional<InfluencerProfile> findByUserEmail(String email);

    boolean existsByUserEmail(String email);

    List<InfluencerProfile> findAllByOrderByIdAsc();
}
