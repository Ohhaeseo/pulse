package com.example.pulse_spring.service;

import com.example.pulse_spring.config.JwtTokenProvider;
import com.example.pulse_spring.domain.Category;
import com.example.pulse_spring.domain.InfluencerProfile;
import com.example.pulse_spring.domain.Shop;
import com.example.pulse_spring.domain.User;
import com.example.pulse_spring.domain.UserRole;
import com.example.pulse_spring.dto.CurrentUserProfileResponse;
import com.example.pulse_spring.dto.InfluencerProfileResponse;
import com.example.pulse_spring.dto.InfluencerSignupRequest;
import com.example.pulse_spring.dto.LoginRequest;
import com.example.pulse_spring.dto.LoginResponse;
import com.example.pulse_spring.dto.SignupRequest;
import com.example.pulse_spring.dto.SignupResponse;
import com.example.pulse_spring.dto.UserStoreResponse;
import com.example.pulse_spring.repository.InfluencerProfileRepository;
import com.example.pulse_spring.repository.ShopRepository;
import com.example.pulse_spring.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class AuthService {
    private final UserRepository userRepository;
    private final ShopRepository shopRepository;
    private final InfluencerProfileRepository influencerProfileRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider jwtTokenProvider;
    private final FastApiClient fastApiClient;
    private final KakaoLocalClient kakaoLocalClient;
    private final SocialStatsService socialStatsService;

    @Transactional
    public SignupResponse signup(SignupRequest request) {
        validatePassword(request.getPassword(), request.getPasswordConfirm());

        Optional<User> existingUser = userRepository.findByEmail(request.getEmail());
        if (existingUser.isPresent()) {
            return reuseExistingOwnerSignup(existingUser.get(), request);
        }

        User user = User.builder()
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .name(request.getName())
                .phone(request.getPhone())
                .isPrivacyAgreed(request.isPrivacyAgreed())
                .role(UserRole.OWNER)
                .build();
        userRepository.save(user);

        Shop shop = createShop(user, request.getShopInfo());
        String analysisTaskId = requestAnalysis(shop);

        String token = jwtTokenProvider.createToken(user.getEmail(), user.getRole());
        return SignupResponse.of("가입이 완료되었습니다.", token, analysisTaskId, user);
    }

    private SignupResponse reuseExistingOwnerSignup(User user, SignupRequest request) {
        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new IllegalArgumentException("이미 가입된 이메일입니다. 기존 비밀번호로 로그인해주세요.");
        }
        if (user.getRole() != UserRole.OWNER) {
            throw new IllegalArgumentException("이미 인플루언서 계정으로 가입된 이메일입니다.");
        }

        Shop shop = shopRepository.findByUserEmail(user.getEmail())
                .orElseGet(() -> createShop(user, request.getShopInfo()));
        String analysisTaskId = requestAnalysis(shop);

        String token = jwtTokenProvider.createToken(user.getEmail(), user.getRole());
        return SignupResponse.of("이미 가입된 계정으로 로그인했습니다.", token, analysisTaskId, user);
    }

    private Shop createShop(User user, SignupRequest.ShopInfoDto info) {
        SignupRequest.ShopInfoDto safeInfo = info == null ? new SignupRequest.ShopInfoDto() : info;
        String shopName = blankToDefault(safeInfo.getName(), user.getName() + "의 가게");
        String shopAddress = blankToDefault(safeInfo.getAddress(), "주소 미입력");
        Category category = parseCategory(safeInfo.getCategory());
        String customCategory = category == Category.ETC ? blankToDefault(safeInfo.getCustomCategory(), "기타") : null;

        Shop shop = Shop.builder()
                .user(user)
                .name(shopName)
                .address(shopAddress)
                .category(category)
                .customCategory(customCategory)
                .status(Shop.AnalysisStatus.PENDING)
                .build();
        applyCoordinates(shop);
        return shopRepository.save(shop);
    }

    private void applyCoordinates(Shop shop) {
        kakaoLocalClient.geocodeAddress(shop.getAddress())
                .ifPresent(coordinates -> shop.updateCoordinates(
                        coordinates.getLatitude(),
                        coordinates.getLongitude()
                ));
    }

    private String requestAnalysis(Shop shop) {
        String keyword = shop.getCategory() == Category.ETC
                ? shop.getCustomCategory()
                : shop.getCategory().getDescription();
        return fastApiClient.sendAnalysisRequest(
                shop.getId(),
                shop.getName(),
                shop.getAddress(),
                keyword
        );
    }

    @Transactional
    public SignupResponse signupInfluencer(InfluencerSignupRequest request) {
        validatePassword(request.getPassword(), request.getPasswordConfirm());

        Optional<User> existingUser = userRepository.findByEmail(request.getEmail());
        if (existingUser.isPresent()) {
            return reuseExistingInfluencerSignup(existingUser.get(), request);
        }

        User user = User.builder()
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .name(request.getName())
                .phone(request.getPhone())
                .isPrivacyAgreed(request.isPrivacyAgreed())
                .role(UserRole.INFLUENCER)
                .build();
        userRepository.save(user);

        createInfluencerProfile(user, request);

        String token = jwtTokenProvider.createToken(user.getEmail(), user.getRole());
        return SignupResponse.of("인플루언서 가입이 완료되었습니다.", token, null, user);
    }

    private SignupResponse reuseExistingInfluencerSignup(User user, InfluencerSignupRequest request) {
        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new IllegalArgumentException("이미 가입된 이메일입니다. 기존 비밀번호로 로그인해주세요.");
        }
        if (user.getRole() != UserRole.INFLUENCER) {
            throw new IllegalArgumentException("이미 사장님 계정으로 가입된 이메일입니다.");
        }

        influencerProfileRepository.findByUserEmail(user.getEmail())
                .orElseGet(() -> createInfluencerProfile(user, request));

        String token = jwtTokenProvider.createToken(user.getEmail(), user.getRole());
        return SignupResponse.of("이미 가입된 인플루언서 계정으로 로그인했습니다.", token, null, user);
    }

    private InfluencerProfile createInfluencerProfile(User user, InfluencerSignupRequest request) {
        InfluencerSignupRequest.ProfileDto input = Optional.ofNullable(request.getProfile())
                .orElseGet(InfluencerSignupRequest.ProfileDto::new);
        SocialStatsService.SocialStats socialStats = socialStatsService.fetch(
                input.getInstagramUrl(),
                input.getYoutubeUrl()
        );

        InfluencerProfile profile = InfluencerProfile.builder()
                .user(user)
                .displayName(blankToDefault(input.getDisplayName(), user.getName()))
                .bio(input.getBio())
                .location(input.getLocation())
                .profileImageUrl(input.getProfileImageUrl())
                .instagramUrl(input.getInstagramUrl())
                .youtubeUrl(input.getYoutubeUrl())
                .instagramFollowers(defaultIntOr(input.getInstagramFollowers(), socialStats.instagramFollowers()))
                .youtubeSubscribers(defaultIntOr(input.getYoutubeSubscribers(), socialStats.youtubeSubscribers()))
                .avgViews(defaultInt(input.getAvgViews()))
                .engagementRate(BigDecimal.valueOf(input.getEngagementRate() == null ? 0.0 : input.getEngagementRate()))
                .minBudget(input.getMinBudget() == null ? 0 : input.getMinBudget())
                .verified(false)
                .niches(defaultList(input.getNiches()))
                .keywords(defaultList(input.getKeywords()))
                .activityAreas(defaultList(input.getActivityAreas()))
                .audienceKeywords(defaultList(input.getAudienceKeywords()))
                .build();
        return influencerProfileRepository.save(profile);
    }

    public LoginResponse login(LoginRequest request) {
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new IllegalArgumentException("가입되지 않은 이메일입니다."));

        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new IllegalArgumentException("비밀번호가 일치하지 않습니다.");
        }

        String token = jwtTokenProvider.createToken(user.getEmail(), user.getRole());
        return LoginResponse.of(token, user);
    }

    @Transactional(readOnly = true)
    public CurrentUserProfileResponse getCurrentProfile(String userEmail) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new IllegalArgumentException("가입되지 않은 사용자입니다."));

        if (user.getRole() == UserRole.INFLUENCER) {
            InfluencerProfile profile = influencerProfileRepository.findByUserEmail(userEmail)
                    .orElse(null);
            return CurrentUserProfileResponse.builder()
                    .email(user.getEmail())
                    .name(user.getName())
                    .role(user.getRole())
                    .influencerProfile(profile == null ? null : InfluencerProfileResponse.from(profile))
                    .build();
        }

        Shop shop = shopRepository.findByUserEmail(userEmail).orElse(null);
        return CurrentUserProfileResponse.builder()
                .email(user.getEmail())
                .name(user.getName())
                .role(user.getRole())
                .ownerName(user.getName())
                .shopName(shop == null ? null : shop.getName())
                .shopAddress(shop == null ? null : shop.getAddress())
                .shopCategory(shop == null ? null : shop.getCategory().name())
                .build();
    }

    @Transactional
    public UserStoreResponse getCurrentStore(String userEmail) {
        Shop shop = shopRepository.findByUserEmail(userEmail)
                .orElseThrow(() -> new IllegalStateException("등록된 매장 정보가 없습니다."));

        if (shop.getLatitude() == null || shop.getLongitude() == null) {
            applyCoordinates(shop);
        }

        return UserStoreResponse.builder()
                .id(shop.getId())
                .name(shop.getName())
                .address(shop.getAddress())
                .category(shop.getCategory().name())
                .categoryLabel(shop.getCategory().getDescription())
                .customCategory(shop.getCustomCategory())
                .lat(shop.getLatitude())
                .lng(shop.getLongitude())
                .build();
    }

    private void validatePassword(String password, String passwordConfirm) {
        if (!password.equals(passwordConfirm)) {
            throw new IllegalArgumentException("비밀번호가 일치하지 않습니다.");
        }
    }

    private Category parseCategory(String value) {
        if (value == null || value.isBlank()) {
            return Category.KOREAN;
        }

        String normalized = value.trim();
        String upper = normalized.toUpperCase();

        try {
            return Category.valueOf(upper);
        } catch (IllegalArgumentException ignored) {
            // Accept labels from the frontend as well as enum names.
        }

        if (normalized.contains("한식") || upper.contains("KOREAN")) return Category.KOREAN;
        if (normalized.contains("일식") || upper.contains("JAPANESE")) return Category.JAPANESE;
        if (normalized.contains("중식") || upper.contains("CHINESE")) return Category.CHINESE;
        if (normalized.contains("양식") || upper.contains("WESTERN")) return Category.WESTERN;
        if (normalized.contains("카페") || normalized.contains("디저트") || upper.contains("CAFE")) return Category.CAFE_DESSERT;
        if (normalized.contains("주점") || normalized.contains("술") || upper.contains("BAR")) return Category.BAR;
        if (normalized.contains("기타") || upper.contains("ETC")) return Category.ETC;

        return Category.KOREAN;
    }

    private String blankToDefault(String value, String fallback) {
        return value == null || value.isBlank() ? fallback : value;
    }

    private int defaultInt(Integer value) {
        return value == null ? 0 : value;
    }

    private int defaultIntOr(Integer value, int fallback) {
        return value == null || value == 0 ? fallback : value;
    }

    private List<String> defaultList(List<String> value) {
        return value == null ? List.of() : value;
    }
}
