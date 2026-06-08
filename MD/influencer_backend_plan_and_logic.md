# Influencer Backend Plan And Logic

## 1. 기존 인증 구조 확인

- 기존 `User`, `Shop`, `AuthService`, `JwtTokenProvider`, `SecurityConfig` 흐름을 유지했다.
- 사장님 회원가입 `/api/auth/signup`은 기존 프론트 호환을 위해 그대로 둔다.

## 2. 역할 모델 추가

- `UserRole`을 추가했다.
- 역할은 `OWNER`, `INFLUENCER` 두 가지다.
- `User.role` 기본값은 `OWNER`로 두어 기존 사장님 가입 흐름이 깨지지 않게 했다.

## 3. JWT 역할 클레임 추가

- JWT에 `role` 클레임을 담는다.
- 필터는 `ROLE_OWNER`, `ROLE_INFLUENCER` 권한을 만들지만 URL별 강한 차단은 넣지 않았다.
- 로컬 개발 우선이라 서비스 내부에서 필요한 수준의 역할 체크만 한다.

## 4. 인증 응답 확장

- `LoginResponse`, `SignupResponse`에 `user` 정보를 추가했다.
- 프론트가 로그인 직후 `role`을 보고 사장님 대시보드 또는 인플루언서 대시보드로 이동할 수 있다.

## 5. 인플루언서 프로필 도메인 추가

- `InfluencerProfile`을 추가했다.
- 저장 필드: 표시명, 소개, 지역, 이미지 URL, 인스타/유튜브 링크, 팔로워, 평균 조회수, 참여율, 최소 예산, 분야, 키워드, 활동 지역, 팔로워 키워드.

## 6. 인플루언서 회원가입 API 추가

- `POST /api/auth/signup/influencer`
- 사장님 가입처럼 토큰을 바로 발급한다.
- 가게 분석 요청은 보내지 않는다.

## 7. 현재 사용자 프로필 응답 확장

- `GET /api/auth/me`가 역할을 함께 반환한다.
- 사장님이면 가게 정보, 인플루언서면 인플루언서 프로필을 반환한다.

## 8. 개발용 인플루언서 50명 시드

- `DevInfluencerSeedDataLoader`를 추가했다.
- 앱 시작 시 인플루언서 프로필이 50명 미만이면 `creator01@pulse.test`부터 `creator50@pulse.test`까지 생성한다.
- 기본 비밀번호는 `Password123!`이다.
- 이미 같은 이메일이 있으면 건너뛰므로 중복 계정이 생기지 않는다.

## 9. 추천 기준 생성

- 현재 Spring에는 분석 결과 저장 도메인이 아직 명확히 연결되어 있지 않으므로, 우선 `Shop` 정보로 매칭 기준을 만든다.
- 기준 데이터: 업종, 주소 토큰, 커스텀 업종, 업종별 기본 키워드.

## 10. 추천 점수 계산

- `InfluencerRecommendationService`에서 100점 만점으로 계산한다.
- 카테고리 25점, 지역 20점, 키워드 30점, 성과 15점, 예산 10점이다.
- 각 항목 점수와 추천 사유를 같이 내려준다.

## 11. 추천 API 추가

- `GET /api/influencers/recommendations`
- 사장님 계정의 가게 기준으로 모든 인플루언서를 점수순 정렬해 반환한다.
- 인플루언서 계정으로 호출하면 서비스에서 거절한다.

## 12. 제안 도메인 추가

- `InfluencerProposal`과 `ProposalStatus`를 추가했다.
- 상태는 `PENDING`, `ACCEPTED`, `REJECTED`, `CANCELED`다.

## 13. 제안 API 추가

- `POST /api/influencer-proposals`: 사장님이 인플루언서에게 제안 생성
- `GET /api/influencer-proposals/owner`: 사장님이 보낸 제안 목록
- `GET /api/influencer-proposals/inbox`: 인플루언서 받은 제안 목록
- `PATCH /api/influencer-proposals/{proposalId}/status`: 인플루언서가 수락/거절

## 14. 프론트 연결

- 로그인 응답의 `user.role`을 보고 이동 경로를 나눈다.
- 인플루언서 회원가입 화면은 `/auth/signup/influencer`를 호출한다.
- 매칭 페이지는 Spring 추천 API가 성공하면 DB 인플루언서를 사용하고, 실패하면 기존 목데이터로 fallback한다.

## 15. 검증

- Spring: `gradlew.bat clean build -x test --console=plain` 성공
- Spring tests: `gradlew.bat test --console=plain` 성공
- Frontend: `npm.cmd run build` 성공

## Local Security Note

지금 구현은 로컬 개발용이다. Spring Security에서 URL을 역할별로 강하게 막기보다, JWT에 역할을 담고 서비스 메서드에서 필요한 곳만 확인한다. 나중에 실제 배포 구조로 갈 때는 `SecurityConfig`에서 URL 단위 권한, refresh token, 비밀번호 정책, 이메일 인증, rate limit을 분리해서 추가하면 된다.
