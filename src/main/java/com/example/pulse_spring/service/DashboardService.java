package com.example.pulse_spring.service;

import com.example.pulse_spring.domain.Category;
import com.example.pulse_spring.domain.Shop;
import com.example.pulse_spring.domain.StoreDismissedCard;
import com.example.pulse_spring.dto.dashboard.StoreStatusResponse;
import com.example.pulse_spring.dto.dashboard.StoreStatusResponse.*;
import com.example.pulse_spring.repository.ShopRepository;
import com.example.pulse_spring.repository.StoreDismissedCardRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.time.DayOfWeek;
import java.time.Instant;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.concurrent.CompletableFuture;
import java.util.stream.Collectors;

/**
 * 가게 현황 대시보드 집계 서비스.
 * 외부 소스(FastAPI DataLab/분석, 날씨)를 병렬 호출하고 섹션별로 독립 fallback 처리한다. (스펙 §10)
 * Instagram 의존 섹션(reelsImpact/searchTrend/trendChart)은 미연동이므로 first_time 상태로 반환한다. (스펙 §6)
 */
@Service
@RequiredArgsConstructor
public class DashboardService {
    private static final ZoneId KST = ZoneId.of("Asia/Seoul");
    private static final String[] PERSONA_EMOJIS = {"🧀", "🍷", "☕", "🔥", "🌿", "🍜"};

    private final ShopRepository shopRepository;
    private final FastApiClient fastApiClient;
    private final WeatherService weatherService;
    private final DashboardBriefService briefService;
    private final DashboardSuggestionService suggestionService;
    private final StoreDismissedCardRepository dismissedCardRepository;

    @Transactional(readOnly = true)
    public StoreStatusResponse getStoreStatus(String email, Long storeId) {
        Shop shop = resolveStore(email, storeId);
        long nowMs = System.currentTimeMillis();
        DayOfWeek dayOfWeek = Instant.now().atZone(KST).getDayOfWeek();

        // 1) 분석/날씨 병렬 시작
        CompletableFuture<Map<String, Object>> analysisF =
                CompletableFuture.supplyAsync(fastApiClient::fetchLatestAnalysis);
        CompletableFuture<String> weatherF = CompletableFuture.supplyAsync(
                () -> weatherService.resolveWeatherType(shop.getAddress(), nowMs));

        Map<String, Object> analysis = analysisF.join();

        // 2) 분석 키워드로 검색신호 호출(분석 후), 날씨는 그동안 병렬 진행
        List<String> candidates = candidatesFrom(analysis);
        String category = categoryLabel(shop);
        Map<String, Object> signal = fastApiClient.fetchSearchSignal(candidates, category);
        String weatherType = weatherF.join();

        Set<String> dismissed = dismissedSet(storeId);

        String signalKeyword = signal == null ? null : str(signal.get("keyword"));
        String signalIntensity = signal == null ? null : str(signal.get("intensity"));

        return StoreStatusResponse.builder()
                .metadata(Metadata.builder()
                        .baseTime(Instant.now().toString())
                        .storeId(String.valueOf(storeId))
                        .build())
                .reelsImpact(firstTimeReels())
                .searchTrend(firstTimeSearchTrend())
                .todaySignal(buildTodaySignal(signal))
                .todayBrief(briefService.build(weatherType, signalKeyword, signalIntensity, dayOfWeek))
                .actions(suggestionService.build(signalKeyword, signalIntensity, dayOfWeek, dismissed))
                .insights(Insights.builder()
                        .weather(weatherType == null ? null : Weather.builder().type(weatherType).build())
                        .personas(personasFrom(analysis))
                        .build())
                .trendChart(null) // Instagram 미연동 — FE가 기존 mock 차트로 폴백
                .dismissedIds(new ArrayList<>(dismissed))
                .build();
    }

    @Transactional
    public List<String> dismissCard(String email, Long storeId, String cardId) {
        resolveStore(email, storeId); // 소유권 검증
        if (cardId == null || cardId.isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "cardId가 필요합니다.");
        }
        if (!dismissedCardRepository.existsByStoreIdAndCardId(storeId, cardId)) {
            dismissedCardRepository.save(StoreDismissedCard.builder()
                    .storeId(storeId)
                    .cardId(cardId)
                    .dismissedAt(LocalDateTime.now(KST))
                    .build());
        }
        return new ArrayList<>(dismissedSet(storeId));
    }

    // ---- 내부 로직 ----

    private Shop resolveStore(String email, Long storeId) {
        Shop shop = shopRepository.findByUserEmail(email)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "STORE_NOT_FOUND"));
        if (!shop.getId().equals(storeId)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "FORBIDDEN");
        }
        return shop;
    }

    private Set<String> dismissedSet(Long storeId) {
        return dismissedCardRepository.findByStoreId(storeId).stream()
                .map(StoreDismissedCard::getCardId)
                .collect(Collectors.toCollection(java.util.LinkedHashSet::new));
    }

    private String categoryLabel(Shop shop) {
        if (shop.getCategory() == Category.ETC && shop.getCustomCategory() != null) {
            return shop.getCustomCategory();
        }
        return shop.getCategory().getDescription();
    }

    @SuppressWarnings("unchecked")
    private List<String> candidatesFrom(Map<String, Object> analysis) {
        if (analysis == null) return List.of();
        Object personas = analysis.get("personas");
        if (!(personas instanceof List<?> list)) return List.of();
        List<String> candidates = new ArrayList<>();
        for (Object p : list) {
            if (!(p instanceof Map<?, ?> persona)) continue;
            Object tags = ((Map<String, Object>) persona).get("tags");
            if (tags instanceof List<?> tagList) {
                tagList.forEach(t -> { if (t != null) candidates.add(String.valueOf(t)); });
            }
        }
        return candidates.stream().distinct().limit(8).toList();
    }

    @SuppressWarnings("unchecked")
    private List<Persona> personasFrom(Map<String, Object> analysis) {
        if (analysis == null) return List.of();
        Object personas = analysis.get("personas");
        if (!(personas instanceof List<?> list)) return List.of();
        List<Persona> result = new ArrayList<>();
        for (int i = 0; i < list.size() && result.size() < 3; i++) {
            if (!(list.get(i) instanceof Map<?, ?> p)) continue;
            Map<String, Object> persona = (Map<String, Object>) p;
            String nickname = str(persona.get("nickname"));
            String summary = str(persona.get("summary"));
            String label = (nickname != null && !nickname.isBlank()) ? nickname : firstTag(persona.get("tags"));
            result.add(Persona.builder()
                    .emoji(PERSONA_EMOJIS[result.size() % PERSONA_EMOJIS.length])
                    .label(label == null ? "단골 손님" : label)
                    .detail(summary == null ? "" : summary)
                    .build());
        }
        return result;
    }

    private String firstTag(Object tags) {
        if (tags instanceof List<?> list && !list.isEmpty() && list.get(0) != null) {
            return String.valueOf(list.get(0));
        }
        return null;
    }

    private TodaySignal buildTodaySignal(Map<String, Object> signal) {
        if (signal == null) {
            return TodaySignal.builder().state("error").source("네이버 DataLab").build();
        }
        return TodaySignal.builder()
                .state("default")
                .source(strOr(signal.get("source"), "네이버 DataLab"))
                .period(strOr(signal.get("period"), "최근 30일"))
                .keyword(str(signal.get("keyword")))
                .signal(str(signal.get("signal")))
                .intensity(strOr(signal.get("intensity"), "low"))
                .build();
    }

    private ReelsImpact firstTimeReels() {
        return ReelsImpact.builder().state("first_time").source("인스타그램").period("이번 주").build();
    }

    private SearchTrend firstTimeSearchTrend() {
        return SearchTrend.builder().state("first_time").source("인스타그램").period("이번 주").build();
    }

    private String str(Object value) {
        return value == null ? null : String.valueOf(value);
    }

    private String strOr(Object value, String fallback) {
        String s = str(value);
        return (s == null || s.isBlank()) ? fallback : s;
    }
}
