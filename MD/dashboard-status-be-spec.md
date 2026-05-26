# 가게 현황 (Store Dashboard) — 백엔드 개발 명세서

> **대상 독자**: 백엔드 개발자 및 AI 코드 생성 컨텍스트  
> **프론트엔드 기준 커밋**: `dashboardV2Api.js` mock 반환값을 응답 스키마 SSOT로 사용  
> **MVP 범위**: Instagram Graph API + 네이버 DataLab API + 기상청 API  
> **MVP+1**: dismiss 서버 동기화, 인스타그램 OAuth 자동 갱신 고도화

---

## 목차

1. [아키텍처 개요](#1-아키텍처-개요)
2. [API 엔드포인트 명세](#2-api-엔드포인트-명세)
3. [응답 스키마 전체 정의](#3-응답-스키마-전체-정의)
4. [외부 API 연동 명세](#4-외부-api-연동-명세)
5. [비즈니스 로직 명세](#5-비즈니스-로직-명세)
6. [State 판단 로직](#6-state-판단-로직)
7. [날씨 타입 매핑 테이블](#7-날씨-타입-매핑-테이블)
8. [인증 & Instagram OAuth 흐름](#8-인증--instagram-oauth-흐름)
9. [Dismiss 동기화](#9-dismiss-동기화)
10. [에러 처리 & Fallback 규칙](#10-에러-처리--fallback-규칙)
11. [캐싱 정책](#11-캐싱-정책)
12. [보안 제약사항](#12-보안-제약사항)

---

## 1. 아키텍처 개요

### 전체 데이터 흐름

```
클라이언트 (React)
    │
    │  GET /api/dashboard/{storeId}/store-status
    │  Authorization: Bearer {accessToken}
    ▼
PULSE 백엔드 서버
    ├─► Instagram Graph API   →  reelsImpact, searchTrend(프로필방문), trendChart
    ├─► 네이버 DataLab API    →  todaySignal
    ├─► 기상청 / OpenWeatherMap →  insights.weather
    ├─► 자체 DB               →  storeId 검증, dismissedIds, 페르소나, 캐시
    └─► AI 텍스트 생성 (규칙 기반) →  todayBrief, aiSuggestion
```

### 처리 원칙

- **병렬 호출**: 외부 API(Instagram, DataLab, 날씨)는 `Promise.all`로 병렬 호출
- **부분 실패 허용**: 외부 API 하나가 실패해도 나머지 섹션은 정상 반환 ([§10 참조](#10-에러-처리--fallback-규칙))
- **캐시 우선**: 유효한 캐시가 있으면 외부 API를 재호출하지 않음 ([§11 참조](#11-캐싱-정책))
- **응답 시간 목표**: p95 기준 1,500ms 이내

---

## 2. API 엔드포인트 명세

### `GET /api/dashboard/{storeId}/store-status`

#### Request

| 구분 | 이름 | 타입 | 필수 | 설명 |
|---|---|---|---|---|
| Path | `storeId` | `string` | ✅ | 가게 식별자 (UUID 또는 내부 ID) |
| Header | `Authorization` | `string` | ✅ | `Bearer {accessToken}` |
| Header | `Content-Type` | `string` | — | `application/json` |

#### Response — 성공

```
HTTP 200 OK
Content-Type: application/json
```

```json
{
  "success": true,
  "data": { ... }
}
```

> `data` 필드의 전체 구조는 [§3 응답 스키마](#3-응답-스키마-전체-정의) 참조

#### Response — 에러

| HTTP 코드 | 원인 | 응답 예시 |
|---|---|---|
| `400` | storeId 형식 오류 | `{ "success": false, "error": "INVALID_STORE_ID" }` |
| `401` | 인증 토큰 없음/만료 | `{ "success": false, "error": "UNAUTHORIZED" }` |
| `403` | 본인 가게 아님 | `{ "success": false, "error": "FORBIDDEN" }` |
| `404` | 존재하지 않는 storeId | `{ "success": false, "error": "STORE_NOT_FOUND" }` |
| `500` | 서버 내부 오류 | `{ "success": false, "error": "INTERNAL_ERROR" }` |

---

## 3. 응답 스키마 전체 정의

> 아래는 프론트엔드가 기대하는 정확한 필드명과 타입 정의입니다.  
> **필드명·타입·enum 값을 정확히 지켜야** FE가 추가 수정 없이 동작합니다.

### 최상위 구조

```json
{
  "success": true,
  "data": {
    "metadata":      { ... },
    "reelsImpact":   { ... },
    "searchTrend":   { ... },
    "todaySignal":   { ... },
    "todayBrief":    [ ... ],
    "actions":       { ... },
    "insights":      { ... },
    "trendChart":    { ... },
    "dismissedIds":  [ ... ]
  }
}
```

---

### 3.1 `metadata`

```json
{
  "metadata": {
    "baseTime": "2025-05-25T09:30:00.000Z",
    "storeId":  "store_123"
  }
}
```

| 필드 | 타입 | 설명 |
|---|---|---|
| `baseTime` | `string` (ISO 8601 UTC) | 데이터 수집 기준 시각. FE가 KST로 변환해 표시 |
| `storeId` | `string` | 요청한 storeId를 에코로 반환 |

---

### 3.2 `reelsImpact` — 이번 주 릴스 성과

```json
{
  "reelsImpact": {
    "state":  "default",
    "source": "인스타그램",
    "period": "이번 주",
    "hero": {
      "reach": {
        "value":         12430,
        "unit":          "회",
        "compareText":   "지난 주 대비 +18%",
        "compareStatus": "up"
      },
      "saves":    { "value": 531,  "unit": "명" },
      "saveRate": { "value": 4.2,  "unit": "%" },
      "comments": { "value": 87,   "unit": "건" }
    }
  }
}
```

| 필드 | 타입 | 필수 | 설명 |
|---|---|---|---|
| `state` | `"default" \| "empty" \| "first_time" \| "error"` | ✅ | [§6 State 로직](#6-state-판단-로직) 참조 |
| `source` | `string` | — | 데이터 출처 표시용 레이블 |
| `period` | `string` | — | 집계 기간 표시용 레이블 |
| `hero.reach.value` | `number` | ✅ | 이번 주 누적 도달 수 |
| `hero.reach.compareText` | `string` | — | 예: `"지난 주 대비 +18%"` |
| `hero.reach.compareStatus` | `"up" \| "down" \| "neutral"` | — | 전주 대비 방향 |
| `hero.saves.value` | `number` | — | 이번 주 누적 저장 수 |
| `hero.saveRate.value` | `number` | — | 저장률 (소수점 1자리) |
| `hero.comments.value` | `number` | — | 이번 주 누적 댓글 수 |

> **FE Fallback 순서**: `hero.primaryMetric` → `hero.reach` → `hero.saves`  
> `primaryMetric` 필드는 선택 사항. MVP에서는 반환하지 않아도 됩니다.

---

### 3.3 `searchTrend` — 프로필 방문 수

```json
{
  "searchTrend": {
    "state":         "default",
    "source":        "인스타그램",
    "period":        "이번 주",
    "value":         "5,210",
    "unit":          "회",
    "compareText":   "지난 주보다 +23%",
    "compareStatus": "up"
  }
}
```

| 필드 | 타입 | 설명 |
|---|---|---|
| `value` | `string \| number` | 프로필 방문 수. 천 단위 콤마 포함 문자열 또는 숫자 모두 허용 |
| `state` | `"default" \| "empty" \| "error"` | |
| `compareStatus` | `"up" \| "down" \| "neutral"` | |

> **데이터 소스**: Instagram Graph API `profile_views` ([§4.1 참조](#41-instagram-graph-api))

---

### 3.4 `todaySignal` — 오늘의 기회 신호

```json
{
  "todaySignal": {
    "state":     "default",
    "source":    "네이버 DataLab",
    "period":    "이번 주",
    "keyword":   "타코야키",
    "signal":    "검색 증가",
    "intensity": "high"
  }
}
```

| 필드 | 타입 | 설명 |
|---|---|---|
| `keyword` | `string` | 가게 업종과 연관된 트렌드 검색어 |
| `signal` | `string` | 예: `"검색 증가"`, `"검색 감소"`, `"신규 트렌드"` |
| `intensity` | `"high" \| "medium" \| "low"` | 신호 강도. FE 배지 색상 결정에 사용 |

> **intensity 판단 기준**  
> - `high`: 전주 대비 검색량 +30% 이상  
> - `medium`: +10% 이상 ~ +30% 미만  
> - `low`: +10% 미만 또는 감소

---

### 3.5 `todayBrief` — 오늘의 가게 요약

```json
{
  "todayBrief": [
    { "text": "오늘 흐린 날씨, 이번 주 ",  "isHighlight": false },
    { "text": "릴스 도달수가 꾸준히 오르고 있어요. ", "isHighlight": true },
    { "text": "지금이 업로드하기 딱 좋은 타이밍이에요! ☁️", "isHighlight": false }
  ]
}
```

| 필드 | 타입 | 설명 |
|---|---|---|
| `text` | `string` | 표시할 문장 조각. 이어 붙이면 완성된 문장 |
| `isHighlight` | `boolean` | `true`이면 FE가 굵고 파란색으로 강조 표시 |

> **생성 규칙**: 날씨 상태 + 인스타 도달 추세 조합으로 서버에서 규칙 기반 문장 생성  
> 예시 조합 로직은 [§5.4 참조](#54-todaybrief-생성-규칙)

---

### 3.6 `actions` — 추천 액션

```json
{
  "actions": {
    "aiSuggestion": {
      "id":         "sug_002",
      "evidence":   "소식 안 올린 지 5일째",
      "confidence": "high",
      "content":    "소식이 없으니 단골 손님들이 궁금해할 때예요. 릴스 하나 올려서 손님들의 발길을 다시 돌려볼까요?",
      "ctaLabel":   "주말용 추천 릴스 만들기 🎬",
      "isNew":      true
    },
    "operational": [
      {
        "id":          "opt_003",
        "title":       "저장률 감소",
        "description": "이번 주 릴스 저장률이 지난 주보다 낮아졌어요. 문구 강조형 콘텐츠로 바꿔보는 건 어떨까요?",
        "ctaLabel":    "문구 강조 템플릿 보기 📝",
        "urgency":     "medium"
      }
    ]
  }
}
```

#### `aiSuggestion` 필드

| 필드 | 타입 | 필수 | 설명 |
|---|---|---|---|
| `id` | `string` | ✅ | 카드 dismiss 추적용 고유 ID. 동일 조건에서는 동일 ID 반환 |
| `evidence` | `string` | ✅ | 추천 근거 한 줄. 예: `"소식 안 올린 지 5일째"` |
| `confidence` | `"high" \| "medium" \| "low"` | ✅ | 추천 신뢰도 |
| `content` | `string` | ✅ | 사장님에게 보여줄 본문 메시지 |
| `ctaLabel` | `string` | ✅ | CTA 버튼 텍스트 |
| `isNew` | `boolean` | ✅ | 세션 첫 노출 여부. FE가 펄스 애니메이션 결정에 사용 |

> `aiSuggestion`이 없으면 키 자체를 생략하거나 `null` 반환 → FE가 조건부 렌더링

#### `operational` 배열

| 필드 | 타입 | 필수 | 설명 |
|---|---|---|---|
| `id` | `string` | ✅ | dismiss 추적용 고유 ID |
| `title` | `string` | ✅ | 카드 제목 |
| `description` | `string` | — | 상세 설명 |
| `ctaLabel` | `string` | ✅ | 버튼 텍스트 |
| `urgency` | `"high" \| "medium" \| "low"` | ✅ | `high`이면 FE가 빨간 아이콘 표시 |

> **제약**: `operational` 배열은 최대 2개까지만 반환. 우선순위는 `urgency` 내림차순

---

### 3.7 `insights` — 인사이트

```json
{
  "insights": {
    "weather": {
      "type": "cloudy"
    },
    "personas": [
      {
        "emoji":  "🧀",
        "label":  "치즈폭탄",
        "detail": "이번 주 릴스 댓글에서 자주 언급된 키워드예요"
      },
      {
        "emoji":  "🍷",
        "label":  "분위기 좋은",
        "detail": "인스타그램 도달 기준 반응이 높은 고객 유형이에요"
      }
    ]
  }
}
```

| 필드 | 타입 | 설명 |
|---|---|---|
| `weather.type` | `string` | 날씨 타입 코드. 허용값 목록은 [§7 참조](#7-날씨-타입-매핑-테이블) |
| `personas` | `array` | 최대 2개. 순서가 곧 표시 순서 |
| `personas[].emoji` | `string` | 이모지 1개 |
| `personas[].label` | `string` | 페르소나 이름 (10자 이내 권장) |
| `personas[].detail` | `string` | 한 줄 설명 (30자 이내 권장) |

---

### 3.8 `trendChart` — 계정 도달수 추이

```json
{
  "trendChart": {
    "title": "릴스 업로드 전후 도달수 변화 📈",
    "seriesData": [
      { "name": "D-3",    "value": 80  },
      { "name": "D-2",    "value": 90  },
      { "name": "D-1",    "value": 85  },
      { "name": "업로드", "value": 160 },
      { "name": "D+1",    "value": 155 },
      { "name": "D+2",    "value": 180 },
      { "name": "D+3",    "value": 210 }
    ]
  }
}
```

| 필드 | 타입 | 설명 |
|---|---|---|
| `title` | `string` | 차트 상단 제목 |
| `seriesData[].name` | `string` | X축 레이블. `"업로드"` 값이 있으면 FE가 빨간 기준선 표시 |
| `seriesData[].value` | `number` | 해당 날짜의 계정 도달 수 |

> **구성 방법**: 최근 업로드된 릴스 날짜를 기준점(`"업로드"`)으로 삼아 전후 각 3일 데이터 반환.  
> 업로드가 없으면 최근 7일 날짜를 `"월", "화" ... "일"` 형태로 반환해도 됩니다.

---

### 3.9 `dismissedIds`

```json
{
  "dismissedIds": ["sug_001", "opt_001"]
}
```

- MVP: 빈 배열 `[]` 반환 (FE가 localStorage로 직접 관리)
- MVP+1: 서버 DB에서 해당 storeId의 dismiss 이력 반환

---

## 4. 외부 API 연동 명세

### 4.1 Instagram Graph API

**목적**: `reelsImpact`, `searchTrend`, `trendChart` 데이터 수집

#### 인증

```
GET https://graph.instagram.com/v19.0/{endpoint}
    ?access_token={instagram_user_access_token}
```

필요 권한 스코프: `instagram_basic`, `instagram_manage_insights`  
계정 조건: Instagram 비즈니스 또는 크리에이터 계정 필요

---

#### 4.1.1 이번 주 미디어 인사이트 (reelsImpact)

**Step 1**: 이번 주 미디어 목록 조회

```
GET https://graph.instagram.com/v19.0/{ig-user-id}/media
    ?fields=id,timestamp,media_type
    &access_token={token}
```

**Step 2**: 각 미디어 인사이트 조회 (REEL 타입만 필터)

```
GET https://graph.instagram.com/v19.0/{media-id}/insights
    ?metric=reach,saved,comments_count
    &access_token={token}
```

**집계 로직**:
```
이번 주 = 월요일 00:00 KST ~ 일요일 23:59 KST
reach_total    = Σ reach        (이번 주 REEL 전체)
saves_total    = Σ saved        (이번 주 REEL 전체)
comments_total = Σ comments_count
saveRate       = round(saves_total / reach_total * 100, 1)
```

**전주 대비 계산**:
```
compareStatus = reach_this_week > reach_last_week ? "up" : reach_this_week < reach_last_week ? "down" : "neutral"
compareText   = "지난 주 대비 {부호}{차이}%"
```

---

#### 4.1.2 프로필 방문 수 (searchTrend)

```
GET https://graph.instagram.com/v19.0/{ig-user-id}/insights
    ?metric=profile_views
    &period=week
    &access_token={token}
```

반환값 `data[0].values[0].value`를 `searchTrend.value`로 사용

---

#### 4.1.3 일별 도달수 (trendChart)

```
GET https://graph.instagram.com/v19.0/{ig-user-id}/insights
    ?metric=reach
    &period=day
    &since={unix_timestamp_7일전}
    &until={unix_timestamp_오늘}
    &access_token={token}
```

반환된 `data[0].values` 배열을 최근 업로드 릴스 날짜 기준으로 D-3 ~ D+3으로 재배열

---

#### 4.1.4 마지막 게시일 (aiSuggestion evidence)

```
GET https://graph.instagram.com/v19.0/{ig-user-id}/media
    ?fields=timestamp
    &limit=1
    &access_token={token}
```

`data[0].timestamp`와 현재 시각 차이(일)를 계산:
```
days_since_last_post = floor((now - last_post_timestamp) / 86400)
evidence = "소식 안 올린 지 {N}일째"
```

---

#### Rate Limit

| 구분 | 제한 |
|---|---|
| 기본 | 200 calls/hour per token |
| 인사이트 | 동일 |
| 초과 시 | `429 Too Many Requests` → 캐시된 값 반환 |

---

### 4.2 네이버 DataLab 검색어 트렌드 API

**목적**: `todaySignal` (업종 연관 키워드 트렌드)

```
POST https://openapi.naver.com/v1/datalab/search
Content-Type: application/json
X-Naver-Client-Id: {client_id}
X-Naver-Client-Secret: {client_secret}
```

**Request Body**:
```json
{
  "startDate": "2025-05-18",
  "endDate":   "2025-05-25",
  "timeUnit":  "week",
  "keywordGroups": [
    {
      "groupName": "타코야키",
      "keywords": ["타코야키", "타꼬야끼"]
    }
  ]
}
```

> **키워드 선정 로직**: 가게 업종 카테고리(DB에서 조회)에 매핑된 트렌드 키워드 사전 활용  
> 예: 업종=`"일식"` → 키워드 후보: `["타코야키", "라멘", "돈카츠", ...]`  
> 검색량 증가율이 가장 높은 키워드를 `todaySignal.keyword`로 반환

**intensity 판단**:
```
ratio = (이번 주 검색량 - 지난 주 검색량) / 지난 주 검색량 * 100
intensity = ratio >= 30 ? "high" : ratio >= 10 ? "medium" : "low"
```

---

### 4.3 기상청 단기예보 API (또는 OpenWeatherMap)

**목적**: `insights.weather.type`

#### 옵션 A — 기상청 Open API (무료, 국내 정확도 높음)

```
GET https://apis.data.go.kr/1360000/VilageFcstInfoService_2.0/getVilageFcst
    ?serviceKey={공공데이터포털_API_KEY}
    &pageNo=1
    &numOfRows=12
    &dataType=JSON
    &base_date={YYYYMMDD}
    &base_time=0500
    &nx={격자_X}
    &ny={격자_Y}
```

> 가게 위치(위도/경도)를 기상청 격자 좌표(nx, ny)로 변환하는 함수 필요  
> 변환 공식: [기상청 격자 변환 알고리즘](https://www.kma.go.kr/download_01/OpenAPI_guide.pdf) 참조

#### 옵션 B — OpenWeatherMap (REST, 글로벌 지원)

```
GET https://api.openweathermap.org/data/2.5/weather
    ?lat={위도}
    &lon={경도}
    &appid={API_KEY}
    &units=metric
    &lang=kr
```

#### 날씨 코드 → PULSE weatherType 매핑은 [§7 참조](#7-날씨-타입-매핑-테이블)

---

## 5. 비즈니스 로직 명세

### 5.1 saveRate 계산

```
saveRate = round(saves_total / reach_total * 100, 1)
```

- `reach_total`이 0이면 `saveRate = 0`
- 소수점 1자리 반올림

---

### 5.2 전주 대비 증감률 계산

```python
def compare_metric(this_week: int, last_week: int) -> dict:
    if last_week == 0:
        return {"compareText": None, "compareStatus": "neutral"}

    rate = round((this_week - last_week) / last_week * 100)
    sign = "+" if rate > 0 else ""
    status = "up" if rate > 0 else ("down" if rate < 0 else "neutral")

    return {
        "compareText":   f"지난 주 대비 {sign}{rate}%",
        "compareStatus": status
    }
```

---

### 5.3 aiSuggestion 생성 규칙

규칙 기반 룰테이블. 조건을 위에서부터 순서대로 평가하여 첫 번째 매칭된 규칙 사용.

| 우선순위 | 조건 | `evidence` | `content` | `confidence` |
|---|---|---|---|---|
| 1 | 마지막 게시일로부터 7일 이상 경과 | `"소식 안 올린 지 {N}일째"` | `"오랫동안 소식이 없었네요. 손님들이 기다리고 있어요. 릴스 하나 올려볼까요?"` | `"high"` |
| 2 | 마지막 게시일로부터 3~6일 경과 | `"소식 안 올린 지 {N}일째"` | `"소식이 없으니 단골 손님들이 궁금해할 때예요. 릴스 하나 올려서 손님들의 발길을 다시 돌려볼까요?"` | `"high"` |
| 3 | 저장률이 전주 대비 20% 이상 감소 | `"저장률이 {N}% 감소했어요"` | `"이번 주 릴스 반응이 조금 낮아졌어요. 문구를 바꿔서 새로운 콘텐츠를 올려볼까요?"` | `"medium"` |
| 4 | 트렌드 키워드 intensity=high | `"{키워드} 검색이 늘고 있어요"` | `"요즘 {키워드} 검색이 많아지고 있어요. 지금 릴스를 올리면 더 많은 손님 눈에 띌 거예요!"` | `"medium"` |
| 5 | 금요일 또는 토요일 (주말 직전) | `"주말이 다가오고 있어요"` | `"주말 손님을 미리 불러볼까요? 지금 업로드가 주말 방문으로 이어질 수 있어요."` | `"medium"` |

> 조건이 하나도 매칭되지 않으면 `aiSuggestion: null` 반환

**`isNew` 판단**:
```
isNew = (aiSuggestion.id가 DB의 viewed_suggestions 테이블에 없음)
```

**`ctaLabel` 생성**:
- 주말(금·토): `"주말용 추천 릴스 만들기 🎬"`
- 평일: `"추천 릴스 만들기 🎬"`

---

### 5.4 todayBrief 생성 규칙

날씨 상태와 인스타 도달 추세를 조합하여 3-segment 문장 생성.

| 날씨 | 도달 추세 | 생성 문장 예시 |
|---|---|---|
| 비/흐림 | 상승 | `["오늘 ", "비 오는 날씨에도 도달수가 오르고 있어요. ", "배달 메뉴를 강조한 릴스가 효과적일 수 있어요! 🌧️"]` |
| 맑음 | 상승 | `["오늘 맑은 날씨, 이번 주 ", "릴스 도달수가 꾸준히 오르고 있어요. ", "지금이 업로드하기 딱 좋은 타이밍이에요! ☀️"]` |
| 흐림 | 상승 | `["오늘 흐린 날씨, 이번 주 ", "릴스 도달수가 꾸준히 오르고 있어요. ", "지금이 업로드하기 딱 좋은 타이밍이에요! ☁️"]` |
| 비/흐림 | 하락 | `["오늘 흐린 날씨예요. ", "이번 주 도달수가 조금 낮아졌어요. ", "따뜻한 실내 분위기를 담은 릴스를 올려보는 건 어떨까요? ☁️"]` |
| 맑음 | 하락 | `["오늘 좋은 날씨지만 ", "이번 주 도달수가 낮아지고 있어요. ", "야외 분위기를 담은 영상이 반응을 되살릴 수 있어요! ☀️"]` |

**도달 추세 판단**:
```
trend_rate = (이번 주 누적 reach - 지난 주 누적 reach) / 지난 주 누적 reach
trend = "상승" if trend_rate > 0 else "하락"
```

**segment 구조**:
```json
[
  { "text": "...",  "isHighlight": false },
  { "text": "...",  "isHighlight": true  },
  { "text": "...",  "isHighlight": false }
]
```
항상 3개 segment. 가운데(index 1)가 `isHighlight: true`.

---

### 5.5 operational 카드 노출 조건

| 조건 | `title` | `description` | `urgency` |
|---|---|---|---|
| 이번 주 저장률이 지난 주 대비 15% 이상 감소 | `"저장률 감소"` | `"이번 주 릴스 저장률이 지난 주보다 낮아졌어요. 문구 강조형 콘텐츠로 바꿔보는 건 어떨까요?"` | `"medium"` |
| 마지막 릴스 업로드로부터 14일 이상 경과 | `"오랜 공백"` | `"2주째 새 콘텐츠가 없어요. 꾸준한 업로드가 알고리즘 노출에 중요해요."` | `"high"` |
| 댓글 수가 전주 대비 30% 이상 감소 | `"댓글 반응 감소"` | `"이번 주 릴스 댓글이 줄었어요. 질문형 자막으로 참여를 유도해보세요."` | `"medium"` |

> - 조건 중 최대 2개까지만 반환 (urgency 높은 순)
> - `dismissedIds`에 포함된 id는 제외하고 반환

---

## 6. State 판단 로직

각 섹션의 `state` 필드 값 결정 기준입니다.

### `reelsImpact.state`

```
first_time : storeId의 Instagram 계정이 연동되지 않음
empty      : 계정 연동됨 + 이번 주 릴스 게시물 없음
error      : Instagram API 호출 실패
default    : 정상 데이터 있음
```

### `searchTrend.state`

```
empty  : profile_views 데이터 없음 (신규 계정)
error  : API 호출 실패
default: 정상
```

### `todaySignal.state`

```
empty      : 연관 키워드 데이터 없음
first_time : DataLab API 미연동 또는 업종 미설정
error      : API 호출 실패
default    : 정상
```

---

## 7. 날씨 타입 매핑 테이블

FE `WEATHER_TYPES`에 정의된 허용 값입니다. 정확히 이 값만 반환해야 합니다.

| `weather.type` 값 | 한국어 | 기상청 하늘상태(SKY) | 기상청 강수형태(PTY) | OpenWeatherMap `weather.id` 범위 |
|---|---|---|---|---|
| `clear_day` | 맑음(낮) | 1 | 0 | 800 (낮) |
| `clear_night` | 맑음(밤) | 1 | 0 | 800 (밤) |
| `partly_cloudy_day` | 구름 조금(낮) | 3 | 0 | 801–802 (낮) |
| `partly_cloudy_night` | 구름 조금(밤) | 3 | 0 | 801–802 (밤) |
| `cloudy` | 흐림 | 4 | 0 | 803–804 |
| `rain` | 비 | — | 1 | 500–531 |
| `drizzle` | 이슬비 | — | — | 300–321 |
| `shower` | 소나기 | — | 4 | 520–522 |
| `snow` | 눈 | — | 3 | 600–622 |
| `sleet` | 진눈깨비 | — | 2 | 611–616 |
| `thunderstorm` | 뇌우 | — | — | 200–232 |
| `fog` | 안개 | — | — | 701–771 |

**낮/밤 구분 기준**: 일출·일몰 시각 기준 (위치 기반 계산). 단순화 시 06:00–19:00을 낮으로 처리 가능.

**기본값(fallback)**: 매핑 실패 시 `"clear_day"` 반환

---

## 8. 인증 & Instagram OAuth 흐름

### 8.1 PULSE 자체 인증

모든 API 요청에 PULSE JWT 토큰 검증 필요.

```
Authorization: Bearer {pulse_access_token}
```

**서버 처리 순서**:
1. JWT 서명 검증
2. 토큰 만료 확인
3. `token.storeId === path.storeId` 인가 확인 (본인 가게만 조회 가능)

---

### 8.2 Instagram OAuth 2.0 흐름

#### 연동 URL 생성

```
https://api.instagram.com/oauth/authorize
  ?client_id={INSTAGRAM_APP_ID}
  &redirect_uri={REDIRECT_URI}
  &scope=instagram_basic,instagram_manage_insights
  &response_type=code
```

#### 코드 → 토큰 교환

```
POST https://api.instagram.com/oauth/access_token
Body:
  client_id={INSTAGRAM_APP_ID}
  client_secret={INSTAGRAM_APP_SECRET}
  grant_type=authorization_code
  redirect_uri={REDIRECT_URI}
  code={code}
```

#### 장기 토큰 교환 (60일 유효)

```
GET https://graph.instagram.com/access_token
  ?grant_type=ig_exchange_token
  &client_secret={INSTAGRAM_APP_SECRET}
  &access_token={short_lived_token}
```

#### 토큰 갱신 (만료 전 주기적 실행)

```
GET https://graph.instagram.com/refresh_access_token
  ?grant_type=ig_refresh_token
  &access_token={long_lived_token}
```

> - 갱신 시점: 만료 7일 전 cron job으로 자동 갱신
> - 저장: DB에 암호화 저장 (AES-256 이상)
> - 미연동 상태: `reelsImpact.state = "first_time"` 반환

---

## 9. Dismiss 동기화

### MVP — FE localStorage 기반 (현재 구현)

- FE가 dismiss 시 localStorage에 저장
- BE는 `dismissedIds: []` 빈 배열 반환
- FE에서 localStorage 값과 서버 응답을 병합 처리

### MVP+1 — 서버 DB 동기화

#### dismiss 저장 API

```
POST /api/dashboard/{storeId}/dismiss
Body: { "cardId": "sug_002" }
Response: { "success": true }
```

#### 응답에 포함

```json
{ "dismissedIds": ["sug_001", "sug_002"] }
```

**DB 스키마 (참고)**:

```sql
CREATE TABLE store_dismissed_cards (
  id         BIGINT PRIMARY KEY AUTO_INCREMENT,
  store_id   VARCHAR(64)  NOT NULL,
  card_id    VARCHAR(64)  NOT NULL,
  dismissed_at DATETIME   NOT NULL DEFAULT NOW(),
  UNIQUE KEY uq_store_card (store_id, card_id)
);
```

**만료 정책**: dismiss 이력은 30일 후 자동 삭제 (동일 카드 재노출 가능)

---

## 10. 에러 처리 & Fallback 규칙

### 원칙: 외부 API 실패 시 섹션별 독립 fallback

전체 응답이 실패(`500`)하는 것이 아니라 해당 섹션만 `state: "error"`로 반환합니다.

| 외부 API 실패 | 영향 범위 | Fallback 처리 |
|---|---|---|
| Instagram API 전체 실패 | `reelsImpact`, `searchTrend`, `trendChart` | 해당 섹션 `state: "error"`, 나머지 정상 반환 |
| Instagram API 부분 실패 (인사이트만) | `reelsImpact.hero` | `hero: null`, `state: "empty"` |
| 네이버 DataLab 실패 | `todaySignal` | `state: "error"` |
| 기상청 API 실패 | `insights.weather` | `weather: null` (FE가 날씨 섹션 미표시) |

### 타임아웃 설정

```
Instagram API:    3,000ms
DataLab API:      2,000ms
기상청 API:       2,000ms
전체 응답 목표:   1,500ms (캐시 히트 기준)
```

### 응답 예시 — 부분 실패

```json
{
  "success": true,
  "data": {
    "reelsImpact":  { "state": "error" },
    "searchTrend":  { "state": "error" },
    "todaySignal":  { "state": "default", "keyword": "타코야키", ... },
    "insights":     { "weather": { "type": "rain" }, "personas": [...] },
    ...
  }
}
```

---

## 11. 캐싱 정책

| 데이터 섹션 | 캐시 TTL | 캐시 키 | 비고 |
|---|---|---|---|
| `reelsImpact` | 1시간 | `dashboard:{storeId}:reels` | Instagram rate limit 고려 |
| `searchTrend` | 1시간 | `dashboard:{storeId}:profile_views` | 동일 |
| `trendChart` | 6시간 | `dashboard:{storeId}:trend` | 일별 데이터 |
| `todaySignal` | 24시간 | `dashboard:{storeId}:signal` | DataLab 주간 단위 |
| `insights.weather` | 1시간 | `weather:{nx}:{ny}` | 가게 위치 기준 |
| `insights.personas` | 24시간 | `dashboard:{storeId}:personas` | 리뷰 분석 결과 |
| `aiSuggestion` | 6시간 | `dashboard:{storeId}:suggestion` | 자주 바뀌지 않음 |

**캐시 저장소**: Redis 권장  
**캐시 무효화**: 사용자가 수동 새로고침(refresh) 요청 시 해당 storeId 캐시 전체 삭제

---

## 12. 보안 제약사항

### 환경변수 관리 (절대 코드에 하드코딩 금지)

```env
# Instagram
INSTAGRAM_APP_ID=
INSTAGRAM_APP_SECRET=

# 네이버 DataLab
NAVER_CLIENT_ID=
NAVER_CLIENT_SECRET=

# 기상청
KMA_API_KEY=

# DB 암호화
ENCRYPTION_KEY=

# JWT
JWT_SECRET=
JWT_EXPIRES_IN=
```

### 인가 체크 (필수)

```python
# 요청한 토큰의 storeId와 path storeId가 일치해야 함
if token.store_id != path_store_id:
    raise ForbiddenError("FORBIDDEN")
```

### Instagram 토큰 저장

- DB 저장 시 AES-256으로 암호화
- 응답에 토큰 절대 포함 금지
- 로그에 토큰 출력 금지

### 입력 검증

- `storeId`: UUID 또는 내부 ID 형식 regex 검증 후 DB 조회
- 사용자가 제어하는 모든 입력값은 SQL injection / NoSQL injection 방어 처리

---

## 부록 — FE 연결 시 교체 위치

`src/features/dashboard-v2/services/dashboardV2Api.js`

```javascript
// 현재 mock
export const fetchDashboardData = async (storeId = 'store_123', isRefresh = false) => {
    return new Promise((resolve) => { /* mock */ });
};

// BE 연결 후 교체
export const fetchDashboardData = async (storeId) => {
    const res = await fetch(`/api/dashboard/${storeId}/store-status`, {
        headers: {
            'Authorization': `Bearer ${getAccessToken()}`,
            'Content-Type': 'application/json',
        },
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return res.json();
};
```

> `isRefresh` 파라미터는 mock 전용. BE 연결 시 제거하고 FE 호출부(`StatusV2Page.jsx`)도 함께 수정.
