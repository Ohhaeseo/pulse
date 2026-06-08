package com.example.pulse_spring.dto;

import com.example.pulse_spring.domain.InfluencerProposal;
import com.example.pulse_spring.domain.ProposalStatus;
import lombok.Builder;
import lombok.Getter;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Getter
@Builder
public class InfluencerProposalResponse {
    private Long id;
    private Long shopId;
    private String shopName;
    private String shopAddress;
    private Long influencerProfileId;
    private String influencerName;
    private String campaignType;
    private Integer budget;
    private boolean provideFood;
    private LocalDate desiredDate;
    private String contact;
    private String message;
    private String acceptedMessage;
    private String rejectionReason;
    private ProposalStatus status;
    private LocalDateTime createdAt;
    private LocalDateTime respondedAt;
    private LocalDateTime updatedAt;

    public static InfluencerProposalResponse from(InfluencerProposal proposal) {
        return InfluencerProposalResponse.builder()
                .id(proposal.getId())
                .shopId(proposal.getShop().getId())
                .shopName(proposal.getShop().getName())
                .shopAddress(proposal.getShop().getAddress())
                .influencerProfileId(proposal.getInfluencer().getId())
                .influencerName(proposal.getInfluencer().getDisplayName())
                .campaignType(proposal.getCampaignType())
                .budget(proposal.getBudget())
                .provideFood(proposal.isProvideFood())
                .desiredDate(proposal.getDesiredDate())
                .contact(proposal.getContact())
                .message(proposal.getMessage())
                .acceptedMessage(proposal.getAcceptedMessage())
                .rejectionReason(proposal.getRejectionReason())
                .status(proposal.getStatus())
                .createdAt(proposal.getCreatedAt())
                .respondedAt(proposal.getRespondedAt())
                .updatedAt(proposal.getUpdatedAt())
                .build();
    }
}
