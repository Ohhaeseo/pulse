package com.example.pulse_spring.repository;

import com.example.pulse_spring.domain.InfluencerProposal;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface InfluencerProposalRepository extends JpaRepository<InfluencerProposal, Long> {
    List<InfluencerProposal> findByShopIdOrderByCreatedAtDesc(Long shopId);

    List<InfluencerProposal> findByInfluencerUserEmailOrderByCreatedAtDesc(String email);

    Optional<InfluencerProposal> findByIdAndInfluencerUserEmail(Long id, String email);

    Optional<InfluencerProposal> findByIdAndShopId(Long id, Long shopId);
}
