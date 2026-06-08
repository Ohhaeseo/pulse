package com.example.pulse_spring.domain;

import jakarta.persistence.CollectionTable;
import jakarta.persistence.Column;
import jakarta.persistence.ElementCollection;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.OneToOne;
import jakarta.persistence.Table;
import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "influencer_profiles")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor
@Builder
public class InfluencerProfile {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false, unique = true)
    private User user;

    @Column(nullable = false)
    private String displayName;

    @Column(length = 1000)
    private String bio;

    private String location;
    private String profileImageUrl;
    private String instagramUrl;
    private String youtubeUrl;
    private Integer instagramFollowers;
    private Integer youtubeSubscribers;
    private Integer avgViews;
    private BigDecimal engagementRate;
    private Integer minBudget;
    private boolean verified;

    @ElementCollection
    @CollectionTable(name = "influencer_niches", joinColumns = @JoinColumn(name = "profile_id"))
    @Column(name = "niche")
    @Builder.Default
    private List<String> niches = new ArrayList<>();

    @ElementCollection
    @CollectionTable(name = "influencer_keywords", joinColumns = @JoinColumn(name = "profile_id"))
    @Column(name = "keyword")
    @Builder.Default
    private List<String> keywords = new ArrayList<>();

    @ElementCollection
    @CollectionTable(name = "influencer_activity_areas", joinColumns = @JoinColumn(name = "profile_id"))
    @Column(name = "area")
    @Builder.Default
    private List<String> activityAreas = new ArrayList<>();

    @ElementCollection
    @CollectionTable(name = "influencer_audience_keywords", joinColumns = @JoinColumn(name = "profile_id"))
    @Column(name = "keyword")
    @Builder.Default
    private List<String> audienceKeywords = new ArrayList<>();

    @Builder.Default
    private LocalDateTime createdAt = LocalDateTime.now();
}
