package com.example.pulse_spring.domain;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "influencer_proposals")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor
@Builder
public class InfluencerProposal {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "shop_id", nullable = false)
    private Shop shop;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "influencer_profile_id", nullable = false)
    private InfluencerProfile influencer;

    private String campaignType;
    private Integer budget;
    private boolean provideFood;
    private LocalDate desiredDate;
    private String contact;

    @Column(length = 1000)
    private String message;

    @Column(length = 500)
    private String acceptedMessage;

    @Column(length = 500)
    private String rejectionReason;

    @Enumerated(EnumType.STRING)
    @Builder.Default
    private ProposalStatus status = ProposalStatus.PENDING;

    @Builder.Default
    private LocalDateTime createdAt = LocalDateTime.now();

    private LocalDateTime respondedAt;

    @Builder.Default
    private LocalDateTime updatedAt = LocalDateTime.now();

    public void changeStatus(ProposalStatus status) {
        this.status = status;
        this.updatedAt = LocalDateTime.now();
        this.respondedAt = LocalDateTime.now();
    }

    public void accept(String acceptedMessage) {
        this.status = ProposalStatus.ACCEPTED;
        this.acceptedMessage = acceptedMessage;
        this.updatedAt = LocalDateTime.now();
        this.respondedAt = LocalDateTime.now();
    }

    public void reject(String rejectionReason) {
        this.status = ProposalStatus.REJECTED;
        this.rejectionReason = rejectionReason;
        this.updatedAt = LocalDateTime.now();
        this.respondedAt = LocalDateTime.now();
    }

    public void cancel() {
        this.status = ProposalStatus.CANCELED;
        this.updatedAt = LocalDateTime.now();
        this.respondedAt = LocalDateTime.now();
    }
}
