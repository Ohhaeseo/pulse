package com.example.pulse_spring.service;

import com.example.pulse_spring.dto.dashboard.StoreStatusResponse.BriefSegment;
import org.springframework.stereotype.Service;

import java.time.DayOfWeek;
import java.util.List;

/**
 * 오늘의 가게 요약(todayBrief) 규칙 기반 생성. (스펙 §5.4)
 * 항상 3-segment, 가운데(index 1)가 isHighlight=true.
 *
 * Instagram 도달 추세 입력이 아직 없으므로, 현재 가용 입력
 * (날씨 + DataLab 신호 intensity + 요일)으로 문장을 구성한다.
 * 인스타 연동 후 도달 추세 분기를 추가/승격한다.
 */
@Service
public class DashboardBriefService {

    public List<BriefSegment> build(String weatherType, String signalKeyword, String signalIntensity, DayOfWeek dayOfWeek) {
        String weatherLead = weatherLead(weatherType);
        boolean weekend = dayOfWeek == DayOfWeek.FRIDAY || dayOfWeek == DayOfWeek.SATURDAY;

        // 1순위: 검색 신호 급증
        if ("high".equals(signalIntensity) && signalKeyword != null && !signalKeyword.isBlank()) {
            return segments(
                    weatherLead,
                    "‘" + signalKeyword + "’ 검색이 부쩍 늘고 있어요. ",
                    "지금 관련 콘텐츠를 올리면 더 많은 손님을 만날 수 있어요! 🔥"
            );
        }
        // 2순위: 주말 임박
        if (weekend) {
            return segments(
                    weatherLead,
                    "주말이 코앞으로 다가왔어요. ",
                    "미리 콘텐츠를 준비해 주말 방문으로 이어가 보세요. ☀️"
            );
        }
        // 기본
        return segments(
                weatherLead,
                "오늘도 가게 현황을 살펴봤어요. ",
                "꾸준한 기록이 단골을 만듭니다. ✨"
        );
    }

    private String weatherLead(String weatherType) {
        if (weatherType == null) {
            return "오늘 하루, ";
        }
        return switch (weatherType) {
            case "rain", "shower", "drizzle" -> "오늘은 비 소식이 있어요. ";
            case "snow", "sleet" -> "오늘은 눈 소식이 있어요. ";
            case "cloudy" -> "오늘은 흐린 날씨예요. ";
            case "thunderstorm" -> "오늘은 천둥번개가 칠 수 있어요. ";
            case "fog" -> "오늘은 안개가 끼었어요. ";
            case "clear_day", "clear_night" -> "오늘은 맑은 날씨예요. ";
            default -> "오늘 하루, ";
        };
    }

    private List<BriefSegment> segments(String a, String b, String c) {
        return List.of(
                BriefSegment.builder().text(a).highlight(false).build(),
                BriefSegment.builder().text(b).highlight(true).build(),
                BriefSegment.builder().text(c).highlight(false).build()
        );
    }
}
