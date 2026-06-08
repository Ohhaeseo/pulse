package com.example.pulse_spring.service;

import com.example.pulse_spring.domain.Category;
import com.example.pulse_spring.domain.InfluencerProfile;
import com.example.pulse_spring.domain.Shop;
import com.example.pulse_spring.domain.User;
import com.example.pulse_spring.domain.UserRole;
import com.example.pulse_spring.dto.InfluencerProfileResponse;
import com.example.pulse_spring.dto.InfluencerRecommendationDto;
import com.example.pulse_spring.dto.InfluencerRecommendationResponse;
import com.example.pulse_spring.dto.MatchBreakdownDto;
import com.example.pulse_spring.dto.StoreInsightDto;
import com.example.pulse_spring.repository.InfluencerProfileRepository;
import com.example.pulse_spring.repository.ShopRepository;
import com.example.pulse_spring.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Locale;
import java.util.Set;

@Service
@RequiredArgsConstructor
public class InfluencerRecommendationService {
    private final UserRepository userRepository;
    private final ShopRepository shopRepository;
    private final InfluencerProfileRepository influencerProfileRepository;

    @Transactional(readOnly = true)
    public InfluencerRecommendationResponse recommendForOwner(String ownerEmail) {
        User user = userRepository.findByEmail(ownerEmail)
                .orElseThrow(() -> new IllegalArgumentException("사용자를 찾을 수 없습니다."));
        if (user.getRole() != UserRole.OWNER) {
            throw new IllegalArgumentException("사장님 계정만 추천 목록을 조회할 수 있습니다.");
        }

        Shop shop = shopRepository.findByUserEmail(ownerEmail)
                .orElseThrow(() -> new IllegalStateException("가게 정보를 찾을 수 없습니다."));
        StoreInsightDto insight = buildInsight(shop);
        List<InfluencerRecommendationDto> influencers = influencerProfileRepository.findAllByOrderByIdAsc().stream()
                .map(profile -> score(profile, insight))
                .sorted((left, right) -> Integer.compare(right.getScore(), left.getScore()))
                .toList();

        return InfluencerRecommendationResponse.builder()
                .storeInsight(insight)
                .influencers(influencers)
                .build();
    }

    private StoreInsightDto buildInsight(Shop shop) {
        List<String> keywords = new ArrayList<>();
        keywords.add(categoryLabel(shop));
        keywords.addAll(categoryDefaults(shop.getCategory()));
        keywords.addAll(splitAddress(shop.getAddress()));
        if (shop.getCustomCategory() != null && !shop.getCustomCategory().isBlank()) {
            keywords.add(shop.getCustomCategory());
        }

        return StoreInsightDto.builder()
                .shopId(shop.getId())
                .shopName(shop.getName())
                .category(shop.getCategory().name())
                .address(shop.getAddress())
                .keywords(keywords.stream().distinct().toList())
                .build();
    }

    private InfluencerRecommendationDto score(InfluencerProfile profile, StoreInsightDto insight) {
        int category = categoryScore(profile, insight);
        int location = locationScore(profile, insight);
        int keyword = keywordScore(profile, insight);
        int performance = performanceScore(profile);
        int budget = budgetScore(profile);
        int total = Math.min(100, category + location + keyword + performance + budget);

        List<String> reasons = new ArrayList<>();
        if (category >= 15) {
            reasons.add("가게 업종과 콘텐츠 분야가 잘 맞습니다.");
        }
        if (location >= 12) {
            reasons.add("활동 지역이 가게 위치와 가깝습니다.");
        }
        if (keyword >= 15) {
            reasons.add("손님/가게 키워드와 인플루언서 키워드가 겹칩니다.");
        }
        if (performance >= 10) {
            reasons.add("조회수와 참여율이 안정적인 편입니다.");
        }
        if (budget >= 8) {
            reasons.add("로컬 테스트 예산으로 제안하기 좋습니다.");
        }
        if (reasons.isEmpty()) {
            reasons.add("기본 프로필 기준으로 후보에 포함되었습니다.");
        }

        return InfluencerRecommendationDto.builder()
                .influencer(InfluencerProfileResponse.from(profile))
                .score(total)
                .breakdown(MatchBreakdownDto.builder()
                        .category(category)
                        .location(location)
                        .keyword(keyword)
                        .performance(performance)
                        .budget(budget)
                        .build())
                .matchReasons(reasons)
                .build();
    }

    private int categoryScore(InfluencerProfile profile, StoreInsightDto insight) {
        Set<String> storeTokens = normalizedTokens(insight.getKeywords());
        Set<String> influencerTokens = normalizedTokens(profile.getNiches());
        influencerTokens.addAll(normalizedTokens(profile.getKeywords()));
        return hasIntersection(storeTokens, influencerTokens) ? 25 : 10;
    }

    private int locationScore(InfluencerProfile profile, StoreInsightDto insight) {
        Set<String> storeTokens = normalizedTokens(splitAddress(insight.getAddress()));
        Set<String> areaTokens = normalizedTokens(profile.getActivityAreas());
        areaTokens.addAll(normalizedTokens(List.of(profile.getLocation() == null ? "" : profile.getLocation())));
        if (hasIntersection(storeTokens, areaTokens)) {
            return 20;
        }
        return profile.getLocation() != null && !profile.getLocation().isBlank() ? 8 : 0;
    }

    private int keywordScore(InfluencerProfile profile, StoreInsightDto insight) {
        Set<String> storeTokens = normalizedTokens(insight.getKeywords());
        Set<String> influencerTokens = normalizedTokens(profile.getKeywords());
        influencerTokens.addAll(normalizedTokens(profile.getAudienceKeywords()));
        int matches = 0;
        for (String token : storeTokens) {
            if (influencerTokens.contains(token)) {
                matches++;
            }
        }
        return Math.min(30, matches * 10);
    }

    private int performanceScore(InfluencerProfile profile) {
        int followers = profile.getInstagramFollowers() == null ? 0 : profile.getInstagramFollowers();
        int views = profile.getAvgViews() == null ? 0 : profile.getAvgViews();
        double engagement = profile.getEngagementRate() == null ? 0 : profile.getEngagementRate().doubleValue();
        int score = 0;
        if (followers >= 100000 || views >= 50000) {
            score += 8;
        } else if (followers >= 50000 || views >= 20000) {
            score += 6;
        } else if (followers >= 20000 || views >= 10000) {
            score += 4;
        }
        if (engagement >= 5.0) {
            score += 7;
        } else if (engagement >= 4.0) {
            score += 5;
        } else if (engagement > 0) {
            score += 3;
        }
        return Math.min(15, score);
    }

    private int budgetScore(InfluencerProfile profile) {
        int minBudget = profile.getMinBudget() == null ? 0 : profile.getMinBudget();
        if (minBudget <= 300000) {
            return 10;
        }
        if (minBudget <= 500000) {
            return 8;
        }
        if (minBudget <= 700000) {
            return 6;
        }
        return 4;
    }

    private String categoryLabel(Shop shop) {
        if (shop.getCategory() == Category.ETC && shop.getCustomCategory() != null) {
            return shop.getCustomCategory();
        }
        return shop.getCategory().name().toLowerCase(Locale.ROOT);
    }

    private List<String> categoryDefaults(Category category) {
        return switch (category) {
            case KOREAN -> List.of("food", "한식", "국밥", "노포", "회식");
            case JAPANESE -> List.of("food", "일식", "라멘", "스시");
            case CHINESE -> List.of("food", "중식", "짜장면", "탕수육");
            case WESTERN -> List.of("food", "western", "파스타", "브런치", "데이트");
            case CAFE_DESSERT -> List.of("cafe", "dessert", "카페", "디저트", "커피");
            case BAR -> List.of("bar", "술집", "안주", "퇴근후", "친구모임");
            case ETC -> List.of("food", "로컬", "동네맛집");
        };
    }

    private List<String> splitAddress(String address) {
        if (address == null || address.isBlank()) {
            return List.of();
        }
        return List.of(address.split("\\s+"));
    }

    private Set<String> normalizedTokens(List<String> values) {
        Set<String> tokens = new HashSet<>();
        for (String value : values) {
            if (value == null) {
                continue;
            }
            String[] parts = value.toLowerCase(Locale.ROOT).split("[\\s,/]+");
            for (String part : parts) {
                if (!part.isBlank()) {
                    tokens.add(part.trim());
                }
            }
        }
        return tokens;
    }

    private boolean hasIntersection(Set<String> left, Set<String> right) {
        for (String item : left) {
            if (right.contains(item)) {
                return true;
            }
        }
        return false;
    }
}
