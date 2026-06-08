# 인플루언서 매칭 Mock 로직 구현 문서

## 목적

이번 구현은 실제 인플루언서 API가 붙기 전, 사장님이 회원가입/로그인 후 인플루언서 매칭 페이지에 진입했을 때 다음을 확인하기 위한 프론트 mock 단계입니다.

- 인플루언서 50명이 안정적으로 로딩되는지
- 손님분석 결과 키워드와 인플루언서 키워드가 매칭 점수에 반영되는지
- 분석 결과가 없을 때도 가입/로컬 가게 정보 기준으로 추천이 끊기지 않는지
- 카드와 상세 모달에서 점수와 추천 이유가 자연스럽게 보이는지

## 수정 파일

### `src/data/mockInfluencers.js`

기존 12명 수준의 mock 데이터를 50명 mock 풀로 확장했습니다.

데이터를 50개 객체로 직접 나열하지 않고, 10개 seed profile을 기반으로 50명을 생성합니다. 이렇게 한 이유는 이후 카테고리, 지역, 팔로워 수, 평균 조회수, 단가 같은 필드를 쉽게 조정하기 위해서입니다.

각 인플루언서에는 다음 필드가 포함됩니다.

- `id`
- `name`
- `profileImage`
- `niche`
- `location`
- `activityArea`
- `keywords`
- `audienceKeywords`
- `followerBase`
- `instagramFollowers`
- `youtubeSubscribers`
- `avgViews`
- `engagementRate`
- `minBudget`
- `matchScore`
- `matchReasons`

### `src/features/influencer/influencerMatchingUtils.js`

매칭 점수 계산 로직을 새 파일로 분리했습니다.

핵심 함수는 다음과 같습니다.

- `getLocalStoreProfile()`
  - `localStorage.userProfile`
  - `localStorage.user`
  - `localStorage.pulseStoreProfileDraft`
  - 위 값이 없으면 fallback 가게 정보를 사용합니다.

- `buildStoreInsightFromAnalysisData(analysisData)`
  - 손님분석 결과의 `store_name`, `store_summary`, `personas`, `keywords`, `reviewTopics`를 매칭용 가게 인사이트로 변환합니다.

- `keywordSimilarity(storeKeywords, influencerKeywords)`
  - 손님분석 키워드와 인플루언서 키워드를 정규화한 뒤 포함 관계 기반으로 유사도를 계산합니다.

- `calculateInfluencerMatch(storeInsight, influencer)`
  - 업종, 지역, 키워드, 성과, 예산 점수를 합산해 `matchScore`를 만듭니다.

- `scoreInfluencers(influencers, storeInsight)`
  - 전체 인플루언서 목록에 점수와 추천 이유를 붙이고 점수순으로 정렬합니다.

## 점수 계산 방식

총점은 100점입니다.

| 항목 | 최대 점수 | 설명 |
|---|---:|---|
| 업종 | 25 | 가게 업종과 인플루언서 `niche` 일치 여부 |
| 지역 | 20 | 가게 주소의 구 단위와 인플루언서 활동 지역 일치 여부 |
| 키워드 | 30 | 손님분석 키워드, 페르소나 키워드, 리뷰 토픽과 인플루언서 키워드 유사도 |
| 성과 | 15 | 평균 조회수와 참여율 |
| 예산 | 10 | 가게 제안 예산과 인플루언서 최소 단가 적합도 |

## 손님분석 결과 사용 방식

매칭 페이지는 먼저 FastAPI 분석 결과를 조회합니다.

```text
analysisTaskId 있음 -> /analysis/result/{analysisTaskId}
없거나 실패 -> /analysis/latest
둘 다 실패 -> localStorage/fallback 가게 정보 사용
```

분석 결과가 있으면 다음 값들이 키워드로 합쳐집니다.

- `store_summary`에서 추출한 주요 단어
- `keywords`
- `review_topics` 또는 `reviewTopics`
- `personas[].name`
- `personas[].title`
- `personas[].summary`
- `personas[].keywords`

분석 결과가 없으면 회원가입 때 저장한 `pulseStoreProfileDraft`와 로그인 프로필을 기준으로 추천합니다.

## 매칭 페이지 동작

### `src/features/influencer/InfluencerMatchingPage.jsx`

페이지 진입 시 다음 순서로 동작합니다.

1. 기본 가게 정보 fallback 생성
2. FastAPI 손님분석 결과 조회 시도
3. 분석 결과가 있으면 가게 인사이트로 변환
4. 50명 mock 인플루언서에 점수 계산
5. `matchScore` 높은 순으로 정렬
6. 카테고리/검색어 필터 적용
7. 카드 목록 렌더링

검색 대상은 다음입니다.

- 인플루언서 이름
- 위치
- 카테고리
- 키워드

## 카드/상세 모달 표시

### `src/features/influencer/InfluencerCard.jsx`

카드에는 다음을 표시합니다.

- 이름
- 지역
- 대표 카테고리
- 매칭 점수
- 주요 키워드
- 추천 이유 1~2개
- 총 팔로워
- 평균 조회수

점수 옆 `Info` 아이콘 hover 시 업종/지역/키워드/성과/예산별 세부 점수를 보여줍니다.

### `src/features/influencer/InfluencerDetailModal.jsx`

상세 모달에는 다음을 표시합니다.

- 프로필 요약
- 매칭 점수
- 항목별 점수
- 추천 이유 전체
- Instagram/YouTube 링크
- 소개
- 주요 키워드
- 예상 단가

## 회원가입 정보 fallback

### `src/features/auth/components/SignupForm.jsx`

사장님 회원가입 시 입력한 가게명, 업종, 주소를 `localStorage.pulseStoreProfileDraft`에 저장합니다.

이 값은 실제 분석 결과가 아직 없을 때 인플루언서 매칭 페이지의 fallback 기준으로 사용됩니다.

## 현재 한계

- 인플루언서 데이터는 실제 API/DB가 아니라 프론트 mock입니다.
- 키워드 유사도는 임베딩이 아니라 문자열 포함 관계 기반입니다.
- 손님분석 결과 필드는 현재 가능한 여러 이름을 폭넓게 받아들이도록 처리했습니다.
- 실제 서비스 단계에서는 Spring에서 인플루언서/제안 상태를 저장하고, FastAPI 또는 별도 추천 API가 점수 계산을 담당하는 구조로 옮기는 것이 좋습니다.

## 검증 시나리오

1. 사장님 회원가입에서 아무 가게나 입력합니다.
2. 로그인 후 `/influencer-matching`으로 이동합니다.
3. 인플루언서 50명이 표시되는지 확인합니다.
4. 점수가 높은 순서대로 정렬되는지 확인합니다.
5. 카테고리 필터를 눌러 목록이 줄어드는지 확인합니다.
6. 키워드 검색이 동작하는지 확인합니다.
7. 카드의 점수 tooltip과 상세 모달의 추천 이유를 확인합니다.
8. 제안하기 버튼이 `/influencer-matching/request/{id}`로 이동하는지 확인합니다.
