package com.example.pulse_spring.service;

import com.example.pulse_spring.config.JwtTokenProvider;
import com.example.pulse_spring.domain.*;
import com.example.pulse_spring.dto.LoginRequest;
import com.example.pulse_spring.dto.LoginResponse;
import com.example.pulse_spring.dto.CurrentUserProfileResponse;
import com.example.pulse_spring.dto.SignupRequest;
import com.example.pulse_spring.dto.SignupResponse;
import com.example.pulse_spring.dto.UserStoreResponse;
import com.example.pulse_spring.repository.ShopRepository;
import com.example.pulse_spring.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/*
 * [AuthService]
 * 
 * 이 클래스는 회원 인증/인가와 관련된 핵심 서비스입니다.
 * 
 * 주요 역할:
 * - 회원가입(signup): 사용자의 이메일, 비밀번호 등 정보를 받아 유저와 상점 정보를 저장하고,
 *   가입시 토큰(JWT)과 완료 메시지를 담은 SignupResponse를 반환합니다.
 *   만약 가게 업종이 기타(ETC)일 경우 상세 업종 정보도 체크합니다.
 * - 로그인(login): 이메일과 비밀번호로 로그인 시도를 처리하고, 로그인 성공 시 토큰을 담은 LoginResponse를 반환합니다.
 * - FastAPI 요청: 회원가입 시 등록한 상점 정보로 외부 FastAPI에 비동기 데이터 분석 요청을 보냅니다.
 * 
 * 팀원 참고:
 * - UserRepository, ShopRepository를 이용해 DB와 연동하며, 
 *   Spring Security의 PasswordEncoder로 비밀번호 암호화, JwtTokenProvider로 토큰을 관리합니다.
 * - 회원 인증 도메인에서 공통적으로 사용될 서비스이므로, 추후 인증/인가 확장이나 리팩터링 시에도 참고하시기 바랍니다.
 * - Exception 메시지 및 유효성 검증 로직은 프론트와 협의하여 필요에 따라 확장 가능합니다.
 */

@Service
@RequiredArgsConstructor
public class AuthService {
    private final UserRepository userRepository;
    private final ShopRepository shopRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider jwtTokenProvider;
    private final FastApiClient fastApiClient;
    private final KakaoLocalClient kakaoLocalClient;

    @Transactional
    public SignupResponse signup(SignupRequest request) {
        // 1. 비밀번호와 비밀번호 확인이 같은지 검증
        if (!request.getPassword().equals(request.getPasswordConfirm())) {
            throw new IllegalArgumentException("비밀번호가 일치하지 않습니다.");
        }
        // 2. 이메일 중복 체크
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new IllegalArgumentException("이미 가입된 이메일입니다.");
        }

        // 3. User 엔티티 생성 및 저장
        User user = User.builder()
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .name(request.getName())
                .phone(request.getPhone())
                .isPrivacyAgreed(request.isPrivacyAgreed())
                .build();
        userRepository.save(user);

        // 4. Shop 엔티티 생성 전 ETC 업종일 때 customCategory 필요 여부 검증
        SignupRequest.ShopInfoDto info = request.getShopInfo();
        if (info.getCategory() == Category.ETC
                && (info.getCustomCategory() == null || info.getCustomCategory().isBlank())) {
            throw new IllegalArgumentException("기타 업종 선택 시 상세 업종을 입력해야 합니다.");
        }

        Shop shop = Shop.builder()
                .user(user)
                .name(info.getName())
                .address(info.getAddress())
                .category(info.getCategory())
                .customCategory(info.getCategory() == Category.ETC ? info.getCustomCategory() : null)
                .status(Shop.AnalysisStatus.PENDING)
                .build();
        kakaoLocalClient.geocodeAddress(shop.getAddress())
                .ifPresent(coordinates -> shop.updateCoordinates(
                        coordinates.getLatitude(),
                        coordinates.getLongitude()
                ));
        shopRepository.save(shop);

        // 5. FastAPI로 상점 데이터 분석 비동기 요청 보내기
        String keyword = (shop.getCategory() == Category.ETC) ? shop.getCustomCategory()
                : shop.getCategory().getDescription();
        String analysisTaskId = fastApiClient.sendAnalysisRequest(shop.getId(), shop.getName(), shop.getAddress(), keyword);

        // 6. 가입 완료 후 JWT 토큰 생성 및 반환
        String token = jwtTokenProvider.createToken(user.getEmail());
        return SignupResponse.of("가입이 완료되었습니다.", token, analysisTaskId);
    }

    public LoginResponse login(LoginRequest request) {
        // 1. 이메일로 유저 조회 (없으면 예외)
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new IllegalArgumentException("가입되지 않은 이메일입니다."));

        // 2. 비밀번호 검증
        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new IllegalArgumentException("비밀번호가 일치하지 않습니다.");
        }
        // 3. 로그인 성공 시 토큰 생성 및 반환
        String token = jwtTokenProvider.createToken(user.getEmail());
        return LoginResponse.of(token);
    }

    @Transactional(readOnly = true)
    public CurrentUserProfileResponse getCurrentProfile(String userEmail) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new IllegalArgumentException("가입되지 않은 사용자입니다."));

        Shop shop = shopRepository.findByUserEmail(userEmail)
                .orElseThrow(() -> new IllegalStateException("사장님 가게 정보를 찾을 수 없습니다."));

        return CurrentUserProfileResponse.builder()
                .email(user.getEmail())
                .ownerName(user.getName())
                .shopName(shop.getName())
                .shopAddress(shop.getAddress())
                .build();
    }

    @Transactional
    public UserStoreResponse getCurrentStore(String userEmail) {
        Shop shop = shopRepository.findByUserEmail(userEmail)
                .orElseThrow(() -> new IllegalStateException("?ъ옣??媛寃??뺣낫瑜?李얠쓣 ???놁뒿?덈떎."));

        if (shop.getLatitude() == null || shop.getLongitude() == null) {
            kakaoLocalClient.geocodeAddress(shop.getAddress())
                    .ifPresent(coordinates -> shop.updateCoordinates(
                            coordinates.getLatitude(),
                            coordinates.getLongitude()
                    ));
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
}
