package com.example.pulse_spring.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@AllArgsConstructor
@NoArgsConstructor
public class MapInsightActionRequest {
    private Double latitude;
    private Double longitude;
    private Integer radius;
    private String category;
    private MarketSummary marketSummary;

    @Getter
    @AllArgsConstructor
    @NoArgsConstructor
    public static class MarketSummary {
        private Integer competitionTotal;
        private Double densityPerKm2;
        private Integer anchorScore;
        private String anchorType;
    }
}
