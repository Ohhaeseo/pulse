package com.example.pulse_spring.service;

import com.example.pulse_spring.dto.dashboard.StoreStatusResponse.Actions;
import com.example.pulse_spring.dto.dashboard.StoreStatusResponse.AiSuggestion;
import com.example.pulse_spring.dto.dashboard.StoreStatusResponse.Operational;
import org.springframework.stereotype.Service;

import java.time.DayOfWeek;
import java.util.ArrayList;
import java.util.List;
import java.util.Set;

/**
 * 추천 액션(aiSuggestion + operational) 규칙 기반 생성. (스펙 §5.3 / §5.5)
 *
 * 현재 가용 입력(DataLab 신호 intensity + 요일)으로 발화 가능한 룰만 활성화한다.
 * Instagram 의존 룰(마지막 게시일/저장률/도달/댓글)은 인스타 연동 후 추가한다.
 * dismissedIds에 포함된 카드는 제외한다. 동일 조건 → 동일 id(스펙 요구).
 */
@Service
public class DashboardSuggestionService {

    public Actions build(String signalKeyword, String signalIntensity, DayOfWeek dayOfWeek, Set<String> dismissedIds) {
        boolean weekend = dayOfWeek == DayOfWeek.FRIDAY || dayOfWeek == DayOfWeek.SATURDAY;
        boolean hasKeyword = signalKeyword != null && !signalKeyword.isBlank();

        AiSuggestion ai = null;

        // 룰 #4: 트렌드 키워드 검색 급증
        if ("high".equals(signalIntensity) && hasKeyword && !dismissedIds.contains("sug_trend")) {
            ai = AiSuggestion.builder()
                    .id("sug_trend")
                    .evidence("‘" + signalKeyword + "’ 검색이 뜨고 있어요")
                    .confidence("medium")
                    .content("요즘 ‘" + signalKeyword + "’ 검색이 많아지고 있어요. 지금 릴스를 올리면 더 많은 손님의 눈길을 끌 수 있어요!")
                    .ctaLabel(weekend ? "주말용 추천 릴스 만들기 🎬" : "추천 릴스 만들기 🎬")
                    .markedNew(true)
                    .build();
        }
        // 룰 #5: 주말 임박 (트렌드 룰이 없을 때)
        if (ai == null && weekend && !dismissedIds.contains("sug_weekend")) {
            ai = AiSuggestion.builder()
                    .id("sug_weekend")
                    .evidence("주말이 다가오고 있어요")
                    .confidence("medium")
                    .content("주말 손님을 미리 불러볼까요? 지금 업로드가 주말 방문으로 이어질 수 있어요.")
                    .ctaLabel("주말용 추천 릴스 만들기 🎬")
                    .markedNew(true)
                    .build();
        }

        List<Operational> operational = new ArrayList<>();

        // 운영 카드: 검색 신호가 살아있을 때 트렌드 반영 제안
        if (("high".equals(signalIntensity) || "medium".equals(signalIntensity)) && hasKeyword
                && !dismissedIds.contains("opt_trend")) {
            operational.add(Operational.builder()
                    .id("opt_trend")
                    .title("트렌드 키워드 반영")
                    .description("‘" + signalKeyword + "’ 관심이 오르고 있어요. 메뉴 소개나 해시태그에 활용해 보세요.")
                    .ctaLabel("키워드 활용 팁 보기 📈")
                    .urgency("medium")
                    .build());
        }
        // 운영 카드: 주말 준비
        if (weekend && !dismissedIds.contains("opt_weekend")) {
            operational.add(Operational.builder()
                    .id("opt_weekend")
                    .title("주말 콘텐츠 준비")
                    .description("주말은 방문이 몰리는 시기예요. 미리 한 편 올려 두면 노출에 유리해요.")
                    .ctaLabel("주말 템플릿 보기 🗓️")
                    .urgency("low")
                    .build());
        }

        // 스펙 §5.5: operational 최대 2개
        if (operational.size() > 2) {
            operational = operational.subList(0, 2);
        }

        return Actions.builder()
                .aiSuggestion(ai)
                .operational(operational)
                .build();
    }
}
