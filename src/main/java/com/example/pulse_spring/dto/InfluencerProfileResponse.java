package com.example.pulse_spring.dto;

import com.example.pulse_spring.domain.InfluencerProfile;
import lombok.Builder;
import lombok.Getter;

import java.math.BigDecimal;
import java.util.List;

@Getter
@Builder
public class InfluencerProfileResponse {
    private Long id;
    private Long userId;
    private String email;
    private String displayName;
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
    private List<String> niches;
    private List<String> keywords;
    private List<String> activityAreas;
    private List<String> audienceKeywords;

    public static InfluencerProfileResponse from(InfluencerProfile profile) {
        return InfluencerProfileResponse.builder()
                .id(profile.getId())
                .userId(profile.getUser().getId())
                .email(profile.getUser().getEmail())
                .displayName(profile.getDisplayName())
                .bio(profile.getBio())
                .location(profile.getLocation())
                .profileImageUrl(profile.getProfileImageUrl())
                .instagramUrl(profile.getInstagramUrl())
                .youtubeUrl(profile.getYoutubeUrl())
                .instagramFollowers(profile.getInstagramFollowers())
                .youtubeSubscribers(profile.getYoutubeSubscribers())
                .avgViews(profile.getAvgViews())
                .engagementRate(profile.getEngagementRate())
                .minBudget(profile.getMinBudget())
                .verified(profile.isVerified())
                .niches(profile.getNiches())
                .keywords(profile.getKeywords())
                .activityAreas(profile.getActivityAreas())
                .audienceKeywords(profile.getAudienceKeywords())
                .build();
    }
}
