package com.example.pulse_spring.dto;

import lombok.Builder;
import lombok.Getter;

import java.util.List;

@Getter
@Builder
public class InfluencerRecommendationResponse {
    private StoreInsightDto storeInsight;
    private List<InfluencerRecommendationDto> influencers;
}
