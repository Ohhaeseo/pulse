package com.example.pulse_spring.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.util.List;

@Getter
@AllArgsConstructor
@NoArgsConstructor
public class MapInsightActionRequest {
    private Double latitude;
    private Double longitude;
    private Integer radius;
    private String category;
    private MarketSummary marketSummary;

    // 가게·손님 페르소나 컨텍스트 (FE가 채워 FastAPI LLM 프롬프트에 주입한다)
    private String storeName;
    private String storeCategory;
    private String storeAddress;
    private List<PersonaContext> personas;

    @Getter
    @AllArgsConstructor
    @NoArgsConstructor
    public static class MarketSummary {
        private Integer competitionTotal;
        private Double densityPerKm2;
        private Integer anchorScore;
        private String anchorType;
    }

    @Getter
    @AllArgsConstructor
    @NoArgsConstructor
    public static class PersonaContext {
        private String nickname;
        private String summary;
        private List<String> tags;
    }
}
