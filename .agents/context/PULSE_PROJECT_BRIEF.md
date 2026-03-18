# PULSE Project Brief For Agents

기준일: 2026-03-18

이 문서는 `C:\PULSE` 모노레포의 현재 구현 상태를 빠르게 파악하기 위한 작업용 브리핑이다.
문서와 코드가 충돌하면 항상 실제 코드(`pulse_FE`, `pulse_spring`, `pulse_python`)를 우선한다.

## 1. 제품 한 줄 요약

PULSE는 소상공인을 위한 AI 마케팅 운영 도구다.
핵심 루프는 다음과 같다.

1. 가게 정보를 받고 리뷰/상권 데이터를 수집한다.
2. 고객 페르소나와 고객 여정, 상권 인사이트를 분석한다.
3. 그 결과를 바탕으로 리뷰 답변, 홍보 콘텐츠, 다음 액션을 제안한다.

## 2. 저장소 구조

- `pulse_FE`: React + Vite 프론트엔드
- `pulse_spring`: Spring Boot 메인 백엔드
- `pulse_python`: FastAPI 기반 AI/크롤링 서버
- `business`: 사업계획서 및 제안 문서
- `.agents/skills`: 저장소 전용 스킬

Git 서브모듈:

- `pulse_FE`
- `pulse_spring`
- `pulse_python`

## 3. 현재 아키텍처 요약

현재 실제로 가장 잘 이어진 흐름은 아래와 같다.

1. 프론트 회원가입에서 가게명/주소/업종/이메일 등을 입력한다.
2. Spring이 사용자와 가게를 저장하고 FastAPI 분석 작업을 요청한다.
3. FastAPI가 네이버/카카오 리뷰를 수집하고 MongoDB에 결과를 저장한다.
4. 프론트의 손님 분석 탭이 최신 분석 결과를 조회해 페르소나와 고객 여정을 보여준다.
5. 프론트의 리뷰 관리 탭이 실제 리뷰와 답변 생성 기능을 조회한다.

완전하지 않은 영역:

- 대시보드 V2 일부
- 영상 생성
- 인플루언서 매칭
- 구독/결제
- 일부 로그인 주변 UX

## 4. 서브모듈별 현재 상태

### 4.1 Frontend (`pulse_FE`)

기술 스택:

- React 18
- Vite
- Tailwind CSS
- React Router
- Framer Motion

현재 특징:

- UI 완성도는 높고 화면 수도 많다.
- 과거에는 mock 중심 화면이 많았지만, 현재는 손님 분석과 리뷰 관리가 실제 API와 연결되어 있다.
- 중요한 전제: 현재 프론트의 UI 구조와 디자인은 불변이다. 백엔드와 데이터 형태를 프론트에 맞추는 것이 기본 원칙이다.

주요 화면 상태:

- `회원가입`: 실제 Spring API 연동
- `로그인`: 실제 Spring API 연동
- `손님 분석`: 실제 FastAPI 분석 결과 연동
- `상권 분석`: Kakao Maps 기반 계산 로직은 있으나 사용자 가게와의 연결은 추가 정리가 필요
- `리뷰 관리 & 답변`: 이번 작업으로 실제 데이터 기반으로 연결 완료

### 4.2 Spring Boot (`pulse_spring`)

역할:

- 사용자/가게 정보 저장
- JWT 기반 인증 처리
- FastAPI와 프론트 사이의 메인 API 계층
- 리뷰 관리용 설정/템플릿 저장

현재 핵심 기능:

- `/api/auth/signup`
- `/api/auth/login`
- JWT 검증 필터 기반 인증
- 리뷰 관리 컨텍스트/설정/템플릿/답변 생성 프록시 API

리뷰 관리 관련 새 API:

- `GET /api/review-management/context`
- `PUT /api/review-management/settings`
- `POST /api/review-management/templates`
- `PUT /api/review-management/templates/{templateId}`
- `DELETE /api/review-management/templates/{templateId}`
- `POST /api/review-management/replies/generate`

저장 구조:

- MySQL/JPA로 사용자, 가게, 리뷰 답변 설정, 저장된 템플릿 저장

### 4.3 Python AI Server (`pulse_python`)

역할:

- 네이버/카카오 리뷰 크롤링
- 리뷰 분석
- 페르소나 및 고객 여정 생성
- 리뷰 답변 생성
- MongoDB 저장/조회

현재 핵심 기능:

- 리뷰 수집
- BERTopic 기반 토픽 분석
- OpenAI 기반 페르소나/여정/리뷰답변 생성
- 분석 결과 최신 조회
- 리뷰 최신 스냅샷 조회

주요 API:

- `POST /api/analyze`
- `GET /api/analysis/latest`
- `GET /api/reviews/latest`
- `POST /api/reviews/replies/generate`

Mongo 저장 전략:

- `analysis_results`: 분석 결과
- `raw_reviews`: 작업 단위 메타데이터
- `raw_review_snapshots`: 가게별 최신 raw review 스냅샷

핵심 원칙:

- raw review 전체 배열을 작업마다 중복 저장하지 않는다.
- 가게 기준 최신 스냅샷 1개를 유지하고, 작업 문서에는 필요한 메타데이터만 둔다.
- 이렇게 해야 실제 서비스 시 저장 비용과 조회 비용이 과도하게 커지지 않는다.

## 5. 이번까지 복구/구현된 핵심 기능

### 5.1 인증 및 분석 흐름

- 실제 회원가입/로그인 복구
- 가입 후 분석 작업 ID 저장 및 손님 분석 탭 연동
- 로그아웃 시 토큰/분석 작업 상태 정리

### 5.2 손님 분석

- 실제 리뷰 기반 분석 결과 표시
- 페르소나 카드 구조를 mock 시절과 동일하게 유지
- 대표 페르소나는 항상 3개가 내려가도록 보장

### 5.3 리뷰 관리 & 답변

이번 작업 기준 상태:

- mock 리뷰 제거
- 실제 네이버/카카오 리뷰 표시
- 리뷰 출처가 사용자 입장에서 명확히 보이도록 source badge 제공
- 빠른 설정 값이 실제 답변 생성 프롬프트에 반영
- 예외 케이스 설정이 실제 답변 생성에 반영
- 저장된 템플릿 CRUD를 Spring/MySQL에 영속화
- 브라우저 E2E로 실제 답변 생성/템플릿 저장/수정/삭제 검증 완료

현재 리뷰 관리 탭의 실제 연결 흐름:

1. FE `리뷰 관리 & 답변`
2. Spring `review-management` API
3. FastAPI `reviews/latest`, `reviews/replies/generate`
4. Mongo 최신 리뷰 스냅샷 / OpenAI 답변 생성

## 6. 작업 시 주의할 점

### 6.1 프론트엔드 불변 규칙

- 프론트의 UI 구조와 디자인은 사용자가 직접 요청하지 않는 한 바꾸지 않는다.
- 레이아웃, 간격, 타이포, 색, 컴포넌트 구조를 백엔드 편의 때문에 변경하지 않는다.
- 필요한 경우 API 응답 구조를 프론트 mock 구조에 맞춘다.

### 6.2 문서보다 코드 우선

- 사업계획서나 기획 문서에는 미래 계획이 섞여 있다.
- 실제 구현 판단은 항상 코드 기준으로 다시 확인한다.

### 6.3 리뷰 데이터 관련 원칙

- 리뷰 데이터는 거짓이면 안 된다.
- 네이버와 카카오는 반드시 구분해서 보여준다.
- 실제 저장 시 raw review를 보존하되, 중복 스냅샷 폭증은 막아야 한다.

## 7. 반복적으로 부딪힌 이슈

- Windows 콘솔에서는 Python 로그가 `cp949` 문제를 일으킬 수 있다.
- Spring에서 한글 쿼리 파라미터를 FastAPI로 프록시할 때 double-encoding이 발생할 수 있다.
- `BERTopic`은 리뷰 수가 적거나 분포가 애매하면 토픽 수가 적게 나올 수 있다.
- 손님 분석 응답은 성공 시 항상 mock-era 구조와 호환되어야 한다.
- 리뷰 관리 요약 수치는 실제 리뷰 데이터에 기반해야 하며, 임의의 카테고리 수치를 만들면 안 된다.

## 8. 다음 작업자가 빠르게 봐야 할 파일

Frontend:

- `pulse_FE/src/features/auth/api/authApi.js`
- `pulse_FE/src/features/insight/UnifiedInsightPage.jsx`
- `pulse_FE/src/features/reviewManagement/ReviewManagementPage.jsx`
- `pulse_FE/src/features/reviewManagement/api/reviewManagementApi.js`

Spring:

- `pulse_spring/src/main/java/com/example/pulse_spring/config/SecurityConfig.java`
- `pulse_spring/src/main/java/com/example/pulse_spring/config/JwtAuthenticationFilter.java`
- `pulse_spring/src/main/java/com/example/pulse_spring/controller/ReviewManagementController.java`
- `pulse_spring/src/main/java/com/example/pulse_spring/service/ReviewManagementService.java`
- `pulse_spring/src/main/java/com/example/pulse_spring/service/FastApiClient.java`

Python:

- `pulse_python/app/api/endpoints.py`
- `pulse_python/app/services/crawler_service.py`
- `pulse_python/app/services/mongo_service.py`
- `pulse_python/app/services/llm_service.py`
- `pulse_python/app/schemas/dtos.py`

## 9. Update 2026-03-19

- Review crawling now refreshes against snapshot version `4`.
- Naver crawling was fixed by resolving the real place detail page first and then parsing review cards from the DOM on `/review/visitor`.
- Current verified live result for `바람난 얼큰 수제비 범계점` is `100 reviews total`:
  - `Naver 80`
  - `Kakao 20`
- Spring review-management context now serves the latest `up to 30 reviews per source`, then merges and sorts them by latest date for the frontend.
- The `리뷰 관리 & 답변` tab no longer generates replies from the first visible review only.
- Verified behavior:
  - click a review card in `리뷰관리`
  - move to `빠른 설정`
  - AI reply generation uses that selected review
  - the generated reply card shows the same selected review on the left side
- Important implementation notes:
  - keep raw review snapshots in Mongo per store, not duplicated per request
  - never fabricate Naver/Kakao platform counts or review text
  - on Windows, detached Spring `bootRun` should be started without stdout/stderr redirection because Gradle can fail on console handle detection
