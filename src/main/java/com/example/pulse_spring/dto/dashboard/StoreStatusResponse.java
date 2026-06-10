package com.example.pulse_spring.dto.dashboard;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Builder;
import lombok.Getter;

import java.util.List;

/**
 * 가게 현황 대시보드 응답의 data 페이로드.
 * 필드명/enum 값은 FE 스펙(dashboard-status-be-spec.md §3)과 1:1로 일치시킨다.
 * (FE: dashboardV2Api.js mock 반환값이 SSOT)
 */
@Getter
@Builder
@JsonInclude(JsonInclude.Include.NON_NULL)
public class StoreStatusResponse {

    private final Metadata metadata;
    private final ReelsImpact reelsImpact;
    private final SearchTrend searchTrend;
    private final TodaySignal todaySignal;
    private final List<BriefSegment> todayBrief;
    private final Actions actions;
    private final Insights insights;
    private final TrendChart trendChart;
    private final List<String> dismissedIds;

    @Getter
    @Builder
    public static class Metadata {
        private final String baseTime; // ISO 8601 UTC
        private final String storeId;
    }

    @Getter
    @Builder
    @JsonInclude(JsonInclude.Include.NON_NULL)
    public static class ReelsImpact {
        private final String state;   // default | empty | first_time | error
        private final String source;
        private final String period;
        private final Hero hero;
    }

    @Getter
    @Builder
    @JsonInclude(JsonInclude.Include.NON_NULL)
    public static class Hero {
        private final Metric reach;
        private final Metric saves;
        private final Metric saveRate;
        private final Metric comments;
    }

    @Getter
    @Builder
    @JsonInclude(JsonInclude.Include.NON_NULL)
    public static class Metric {
        private final Object value;
        private final String unit;
        private final String compareText;
        private final String compareStatus; // up | down | neutral
    }

    @Getter
    @Builder
    @JsonInclude(JsonInclude.Include.NON_NULL)
    public static class SearchTrend {
        private final String state;
        private final String source;
        private final String period;
        private final Object value;
        private final String unit;
        private final String compareText;
        private final String compareStatus;
    }

    @Getter
    @Builder
    @JsonInclude(JsonInclude.Include.NON_NULL)
    public static class TodaySignal {
        private final String state;
        private final String source;
        private final String period;
        private final String keyword;
        private final String signal;
        private final String intensity; // high | medium | low
    }

    @Getter
    @Builder
    public static class BriefSegment {
        private final String text;
        // 필드명을 highlight로 두어 Lombok getter(isHighlight())와 implicit name이 일치 → 단일 프로퍼티.
        // @JsonProperty로 와이어명을 스펙의 "isHighlight"로 강제.
        @JsonProperty("isHighlight")
        private final boolean highlight;
    }

    @Getter
    @Builder
    @JsonInclude(JsonInclude.Include.NON_NULL)
    public static class Actions {
        private final AiSuggestion aiSuggestion; // null이면 FE가 미노출
        private final List<Operational> operational;
    }

    @Getter
    @Builder
    @JsonInclude(JsonInclude.Include.NON_NULL)
    public static class AiSuggestion {
        private final String id;
        private final String evidence;
        private final String confidence; // high | medium | low
        private final String content;
        private final String ctaLabel;
        @JsonProperty("isNew")
        private final boolean markedNew;
    }

    @Getter
    @Builder
    public static class Operational {
        private final String id;
        private final String title;
        private final String description;
        private final String ctaLabel;
        private final String urgency; // high | medium | low
    }

    @Getter
    @Builder
    @JsonInclude(JsonInclude.Include.NON_NULL)
    public static class Insights {
        private final Weather weather; // 실패 시 null
        private final List<Persona> personas;
    }

    @Getter
    @Builder
    public static class Weather {
        private final String type; // §7 weatherType
    }

    @Getter
    @Builder
    public static class Persona {
        private final String emoji;
        private final String label;
        private final String detail;
    }

    @Getter
    @Builder
    public static class TrendChart {
        private final String title;
        private final List<SeriesPoint> seriesData;
    }

    @Getter
    @Builder
    public static class SeriesPoint {
        private final String name;
        private final Number value;
    }
}
