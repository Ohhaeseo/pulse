package com.example.pulse_spring.service;

import com.example.pulse_spring.domain.InfluencerProfile;
import com.example.pulse_spring.domain.InfluencerProposal;
import com.example.pulse_spring.domain.ProposalStatus;
import com.example.pulse_spring.domain.Shop;
import com.example.pulse_spring.domain.User;
import com.example.pulse_spring.domain.UserRole;
import com.example.pulse_spring.dto.AcceptInfluencerProposalRequest;
import com.example.pulse_spring.dto.CreateInfluencerProposalRequest;
import com.example.pulse_spring.dto.InfluencerProposalResponse;
import com.example.pulse_spring.dto.RejectInfluencerProposalRequest;
import com.example.pulse_spring.repository.InfluencerProfileRepository;
import com.example.pulse_spring.repository.InfluencerProposalRepository;
import com.example.pulse_spring.repository.ShopRepository;
import com.example.pulse_spring.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class InfluencerProposalService {
    private final UserRepository userRepository;
    private final ShopRepository shopRepository;
    private final InfluencerProfileRepository influencerProfileRepository;
    private final InfluencerProposalRepository proposalRepository;

    @Transactional
    public InfluencerProposalResponse create(String ownerEmail, CreateInfluencerProposalRequest request) {
        requireRole(ownerEmail, UserRole.OWNER);
        Shop shop = getOwnerShop(ownerEmail);
        InfluencerProfile influencer = influencerProfileRepository.findById(request.getInfluencerProfileId())
                .orElseThrow(() -> new IllegalArgumentException("Influencer profile not found."));

        InfluencerProposal proposal = InfluencerProposal.builder()
                .shop(shop)
                .influencer(influencer)
                .campaignType(blankToDefault(request.getCampaignType(), "Collaboration"))
                .budget(request.getBudget())
                .provideFood(request.isProvideFood())
                .desiredDate(request.getDesiredDate())
                .contact(request.getContact())
                .message(request.getMessage())
                .status(ProposalStatus.PENDING)
                .build();
        proposalRepository.save(proposal);

        return InfluencerProposalResponse.from(proposal);
    }

    @Transactional(readOnly = true)
    public List<InfluencerProposalResponse> ownerProposals(String ownerEmail) {
        requireRole(ownerEmail, UserRole.OWNER);
        Shop shop = getOwnerShop(ownerEmail);
        return proposalRepository.findByShopIdOrderByCreatedAtDesc(shop.getId()).stream()
                .map(InfluencerProposalResponse::from)
                .toList();
    }

    @Transactional(readOnly = true)
    public InfluencerProposalResponse ownerDetail(String ownerEmail, Long proposalId) {
        requireRole(ownerEmail, UserRole.OWNER);
        Shop shop = getOwnerShop(ownerEmail);
        InfluencerProposal proposal = proposalRepository.findByIdAndShopId(proposalId, shop.getId())
                .orElseThrow(() -> new IllegalArgumentException("Proposal not found."));
        return InfluencerProposalResponse.from(proposal);
    }

    @Transactional(readOnly = true)
    public List<InfluencerProposalResponse> inbox(String influencerEmail) {
        requireRole(influencerEmail, UserRole.INFLUENCER);
        return proposalRepository.findByInfluencerUserEmailOrderByCreatedAtDesc(influencerEmail).stream()
                .map(InfluencerProposalResponse::from)
                .toList();
    }

    @Transactional(readOnly = true)
    public InfluencerProposalResponse influencerDetail(String influencerEmail, Long proposalId) {
        requireRole(influencerEmail, UserRole.INFLUENCER);
        InfluencerProposal proposal = proposalRepository.findByIdAndInfluencerUserEmail(proposalId, influencerEmail)
                .orElseThrow(() -> new IllegalArgumentException("Proposal not found."));
        return InfluencerProposalResponse.from(proposal);
    }

    @Transactional
    public InfluencerProposalResponse updateStatus(String influencerEmail, Long proposalId, ProposalStatus status) {
        requireRole(influencerEmail, UserRole.INFLUENCER);
        InfluencerProposal proposal = proposalRepository.findByIdAndInfluencerUserEmail(proposalId, influencerEmail)
                .orElseThrow(() -> new IllegalArgumentException("Proposal not found."));
        if (status == ProposalStatus.CANCELED) {
            throw new IllegalArgumentException("Only owners can cancel proposals.");
        }
        ensurePending(proposal);
        proposal.changeStatus(status);
        return InfluencerProposalResponse.from(proposal);
    }

    @Transactional
    public InfluencerProposalResponse accept(String influencerEmail, Long proposalId, AcceptInfluencerProposalRequest request) {
        requireRole(influencerEmail, UserRole.INFLUENCER);
        InfluencerProposal proposal = proposalRepository.findByIdAndInfluencerUserEmail(proposalId, influencerEmail)
                .orElseThrow(() -> new IllegalArgumentException("Proposal not found."));
        ensurePending(proposal);
        proposal.accept(trimToNull(request == null ? null : request.getMessage()));
        return InfluencerProposalResponse.from(proposal);
    }

    @Transactional
    public InfluencerProposalResponse reject(String influencerEmail, Long proposalId, RejectInfluencerProposalRequest request) {
        requireRole(influencerEmail, UserRole.INFLUENCER);
        InfluencerProposal proposal = proposalRepository.findByIdAndInfluencerUserEmail(proposalId, influencerEmail)
                .orElseThrow(() -> new IllegalArgumentException("Proposal not found."));
        ensurePending(proposal);
        proposal.reject(trimToNull(request == null ? null : request.getReason()));
        return InfluencerProposalResponse.from(proposal);
    }

    @Transactional
    public InfluencerProposalResponse cancel(String ownerEmail, Long proposalId) {
        requireRole(ownerEmail, UserRole.OWNER);
        Shop shop = getOwnerShop(ownerEmail);
        InfluencerProposal proposal = proposalRepository.findByIdAndShopId(proposalId, shop.getId())
                .orElseThrow(() -> new IllegalArgumentException("Proposal not found."));
        ensurePending(proposal);
        proposal.cancel();
        return InfluencerProposalResponse.from(proposal);
    }

    private void requireRole(String email, UserRole role) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("User not found."));
        if (user.getRole() != role) {
            throw new IllegalArgumentException(role == UserRole.OWNER
                    ? "Only owner accounts can use this feature."
                    : "Only influencer accounts can use this feature.");
        }
    }

    private Shop getOwnerShop(String ownerEmail) {
        return shopRepository.findByUserEmail(ownerEmail)
                .orElseThrow(() -> new IllegalStateException("Shop not found."));
    }

    private void ensurePending(InfluencerProposal proposal) {
        if (proposal.getStatus() != ProposalStatus.PENDING) {
            throw new IllegalStateException("Only pending proposals can be changed.");
        }
    }

    private String trimToNull(String value) {
        if (value == null || value.isBlank()) {
            return null;
        }
        return value.trim();
    }

    private String blankToDefault(String value, String fallback) {
        if (value == null || value.isBlank()) {
            return fallback;
        }
        return value.trim();
    }
}
