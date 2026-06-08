package com.example.pulse_spring.dto;

import lombok.Builder;
import lombok.Getter;

import java.util.List;

@Getter
@Builder
public class InfluencerRecommendationDto {
    private InfluencerProfileResponse influencer;
    private int score;
    private MatchBreakdownDto breakdown;
    private List<String> matchReasons;
}
