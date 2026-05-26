# PRD: 가게 현황 페이지 통합 — Unified Store Dashboard (v1.0)

> **작성일**: 2026-05-24
> **버전**: 1.0
> **원본 요청**: v1 `DashboardHome`과 v2 `StatusV2Page` 두 개의 가게현황 페이지를 단일 페이지로 통합하고 최종 디자인을 확정한다.
> **SSOT 참조**: `MD/about_pulse.md` §4.3 (가게 현황), §5.4 (IA 루프), §6 (설계 원칙), §11 (디자인 시스템)
> **선행 산출물**: `product-manager` + `ux-designer` 2라운드 교차 피드백 결과 합의안

---

## 🌳 Step 1: Opportunity Solution Tree (OST)

### Desired Outcome (측정 가능 단일 목표)
**"가게 현황 페이지 진입 후 60초 내 [다음 행동] CTA(영상 만들기 / 인플루언서 매칭 / 손님 분석) 클릭률 ≥ 40%"**

- 단순 PV/체류시간이 아닌 **행동 전환률**이 PULSE 핵심 루프(`Understand → Create → Evaluate`) 유지의 KPI다.
- §6 원칙 4("Action-Centric")와 §4.3("다음 행동만 보여주는 행동 중심 대시보드")에 직접 부합.

### Opportunities (사장님 입장 고통점)

| # | Opportunity | Importance | Satisfaction | Score |
|---|---|---|---|---|
| O1 | "우리 가게가 **요즘 검색은 되고 있는지** 알 수 없어 답답하다" (§2.1) | 9 | 2 | 6.3 |
| **O2** | **"영상/마케팅을 했는데 효과가 있었는지 판단할 수 없다"** (§7 시나리오 ③) | **10** | **1** | **9.0** |
| O3 | "오늘/이번 주 무엇을 해야 할지 막막하다 — 날씨·요일·시즌별 행동 가이드가 필요하다" (§4.3) | 9 | 2 | 7.2 |
| O4 | "주변 경쟁 가게 대비 우리가 뒤처지는지 모른다" | 7 | 3 | 4.9 |
| O5 | "리뷰가 새로 달렸는지, 나쁜 리뷰가 묻혀있는지 모르겠다" | 7 | 4 | 4.2 |

### 우선순위 Top 3
**O2(콘텐츠 효과 검증) > O3(오늘의 행동 가이드) > O1(검색 노출 현황)** — 서로 다른 축(행동전환 / 외부환경 / 검색트래픽) 1개씩 커버. 단일 페이지의 No Scroll Policy에 3개 위젯으로 적합.

### Solutions 비교 및 선택

| 옵션 | 내용 | 결정 |
|---|---|---|
| A | v1 `DashboardHome` 베이스로 통합 | ❌ Hero·Weather 시각 강점은 있으나 Facts/Actions 분리 구조가 없어 Action-Centric 의도 약함 |
| B | v2 `StatusV2Page` 베이스로 통합 | △ 좌(Facts)/우(Actions) 2-pane은 핵심 가치(sev 0)지만 Hero 임팩트 부족 |
| **C** | **v2 베이스 70% + v1 Hero 카피 톤 30% 하이브리드** | ✅ v2의 Action-Centric 구조 + v1의 시그니처 카피("비 오는 날엔 파전 ☔") 흡수 |

---

## 1. Summary

v1 `DashboardHome`과 v2 `StatusV2Page` 두 개로 분기된 가게 현황 페이지를 **v2 베이스 + v1 Hero 카피 톤 30% 하이브리드** 구조로 통합한다. 노출 데이터는 사용자 고통점 Top 3에 매핑된 **검색 노출 트렌드 / 릴스 효과 / 오늘의 기회 시그널** 3종으로 한정하며, MVP에서 사용 불가한 매출·찜·외부 SNS 도달 지표는 명시적으로 제외한다. 좌(Facts)/우(Actions) 2-pane을 유지하면서 ② 릴스 효과를 단일 Hero로 승격해 §5.4 핵심 루프를 페이지 수준에서 폐쇄한다.

## 2. Contacts

| 역할 | 담당 |
|---|---|
| 클라이언트 | 외식업 사장님 (수요 측) |
| Product Manager | @product-manager |
| UI/UX | @ux-designer |
| Tech Lead (다음 단계) | @planner |
| 구현 | @frontend-dev |

## 3. Background

- 현재 코드베이스에 v1(`src/features/dashboard/`)과 v2(`src/features/dashboard-v2/`) 두 가게 현황 구현이 공존하며, `App.jsx`에서 `/dashboard`와 `/store/status-v2`로 분기되어 있다.
- v1은 시각 임팩트(Hero 카피·Weather 애니메이션)는 강하나 CTA가 분산되고 데이터 연동이 없다.
- v2는 좌(Facts)/우(Actions) 2-pane + Skeleton + AI Suggestion evidence/confidence 등 Action-Centric 구조를 갖췄으나 Hero 임팩트가 약하고, KPI 3종(검색/찜/방문) 중 일부는 MVP 단계에서 실데이터 조달이 어렵다.
- 사장님 요청: 두 페이지를 단일 페이지로 통합하고 최종 디자인을 확정한다.

## 4. Objective & Key Results (OKRs)

### Objective
가게 현황을 사장님의 마케팅 루프 시작점이자 종착점인 단일 행동 중심 페이지로 통합한다.

| KR | 지표 | 목표 | 측정 방법 |
|---|---|---|---|
| **KR-1** | Time-to-First-CTA | **≤ 60초** | 페이지 진입 → 첫 CTA 클릭까지 시간 (사용자 5명 평균) |
| **KR-2** | 다음 행동 CTA 클릭률 | **≥ 40%** | 진입 세션 중 1개 이상의 다음 행동 CTA 클릭 비율 |
| **KR-3** | UT 성공률 | **≥ 80%** | "Hero를 보고 30초 내 [영상 만들기] 클릭" UT-1 성공률 (n=5) |
| **KR-4** | 빈 상태 이탈률 | **≤ 30%** | 가입 7일 이내 사장님의 가게 현황 진입 후 이탈률 |

## 5. Market Segment(s)

**[Demand Side — 외식업 사장님]**
- 디지털 문해력 낮음(§10.1), 매장에서 PC로 업무성 도구 사용
- 마케팅 지식·시간·신뢰 모두 부족(§2.1~2.3)
- 페르소나 예시:
  - **박사장 52세, 치킨집 8년차** — 새로운 도구 진입장벽 높음, "오늘 뭐해야 돼?" 1줄 답 선호
  - **김사장 45세, 파스타집, 인스타 직접 운영** — 데이터 출처와 신뢰 근거 따져보는 타입
  - **이사장 38세, 신규 가입 3일차** — 빈 상태에서 첫 행동 진입점이 필요

## 6. Value Proposition

- **고객 니즈**: "내가 만든 영상이 효과 있었는지, 오늘은 뭘 강조해야 손님이 올지, 우리 가게가 검색은 되고 있는지를 한 화면에서 30초 안에 알고 싶다."
- **제공 가치**:
  - **Hero 단일 임팩트**: ② 릴스 효과를 큰 비율 1개로 보여줘 "내가 만든 콘텐츠가 일하고 있다"는 인과 증명.
  - **Facts/Actions 2-pane**: 사실은 좌측, 다음 행동은 우측 — 의사결정 비용 최소화.
  - **AI 신뢰 강화**: evidence + confidence + dismiss로 §2.2 "신뢰의 장벽" 해소.
  - **No Scroll**: 한 viewport에서 모든 정보 + 행동 처리.

## 7. Solution

### 7.1 노출 데이터 3종 (확정)

#### ① 검색 노출 트렌드 (Search Visibility) — 좌측 Facts
- **질문**: "오늘 우리 가게가 얼마나 검색되고 있을까?"
- **소스**: Kakao Local API + 네이버 플레이스 Playwright 크롤링
- **갱신**: 1일 1회 (새벽 배치)
- **포맷**: 절대값 1개 + 증감률 1개 ("1,250명 · 지난주 +15%")
- **CTA**: 증가 → 주말 영상 만들기 / 감소 → 손님 분석 보기
- **MVP**: 즉시 가능
- **위험**: 크롤링 차단 → IP rotation, 등록 직후 7일은 baseline 부족 → "수집 중" 카피

#### ② 릴스 효과 (Reels Impact) — Hero 단독
- **질문**: "내가 만든 영상이 효과가 있었나?"
- **소스**: 자체 DB의 VideoLog timestamp × ±7일 검색량/리뷰 신규
- **갱신**: 영상 업로드 후 D+1 ~ D+7 자동 추적
- **포맷**: 단 1개 핵심 비율 ("2.6배") 24pt orange + 미니 라인차트 (업로드 지점 강조 dot)
- **CTA**: 효과↑ → "한 편 더 만들기 🎬" / 5일 무업로드 → "새 템플릿 추천"
- **MVP**: 즉시 (proxy: PULSE 영상 생성시점) → 후속에 인스타 Graph API
- **위험**: proxy ≠ 실게시. 카피에 "PULSE 영상 만든 뒤" 명시. 영상 0개 = 빈 상태 카피로 first-time CTA 제공

#### ③ 오늘의 기회 시그널 (Today's Signal) — 우측 Insights
- **질문**: "오늘 같은 날엔 뭘 강조해야 손님이 올까?"
- **소스**: 날씨 API(1시간) + Kakao Local 인기 키워드(1일) + BERTopic 키워드-환경 매핑
- **포맷**: 이모지 + 조건 + 키워드 1줄 ("☔ 비 소식 — '파전' 검색이 평소 2.5배")
- **CTA**: "이 키워드로 즉시 영상 만들기" (§4.2.1 Context-Aware: Vibe/Title 자동 세팅)
- **MVP**: 즉시 (정적 매핑 룰 시작) → 후속에 LLM 동적 추천
- **트리거 임계치**: 강수확률 ≥ 60% / 폭염주의보 / 금요일 17시 이후 — 상위 1개만 노출
- **Fallback 카피**: "오늘은 특별한 신호가 없네요. 지난주 인기 키워드로 영상을 새로 만들어볼까요?"

#### MVP 제외 항목 (명문화)
| 항목 | 제외 사유 | 향후 |
|---|---|---|
| 매출 | POS 미연동 MVP, 인과 귀속 불명 | 후속 분기 |
| 리뷰 점수 | §4.4 리뷰관리 메뉴 책임 영역 | 메뉴별 책임 분리 유지 |
| 찜 / 외부 SNS 도달 | 인스타 Graph API 미연동 | 후속 분기 |
| 페르소나 truncate 카드 | §4.1 손님 분석 메뉴 자산, 가게현황에서는 1줄로 흡수 | 카드 자체 폐기 |

### 7.2 UI/UX 아키텍처

**Wireframe (No Scroll Policy, density 7)**
```
┌─────────────────────────────────────────────────────────────┐
│ [Header] 안녕하세요 박사장님 · 11:00 기준        [새로고침]  │  64px
├─────────────────────────────────────────────────────────────┤
│ ┌─── HERO: ② 릴스 효과 ───────────────────────────────────┐ │
│ │  업로드 후 검색 2.6배 늘었어요  📈                       │ │
│ │  ┌─ 미니 라인차트 (D-3 ~ D+3, 업로드 지점 dot) ────┐   │ │  ~200px
│ │  └────────────────────────────────────────────────┘   │ │
│ │  [한 편 더 만들기 🎬]  ← Primary CTA (orange)            │ │
│ └──────────────────────────────────────────────────────────┘ │
├──────────────────────────┬──────────────────────────────────┤
│ Facts (flex 1.4)         │ Actions (flex 1.0, max-w 480)    │
│                          │                                  │
│ KPI strip (inline)       │ [Today Brief — 1줄 hero copy]    │
│ ① 검색 1,250  ▲ 15%      │                                  │
│ ─ divider ─              │ ─ AI Suggestion (primary, 1) ─   │
│ ③ ☔ "파전" 2.5배         │   evidence + confidence + dismiss│
│ [이 키워드로 만들기]      │                                  │
│ ─ divider ─              │ ─ Operational (secondary, 0~2)─  │
│ Weather + 키워드칩        │   인플루언서/리뷰/저장유도 등    │
└──────────────────────────┴──────────────────────────────────┘
```

**골격 규칙**
- 좌측 pane `overflow-hidden` 강제 (v2의 `overflow-y-auto` → 변경)
- 카드당 강조 숫자 1개 초과 금지
- 모든 수치 옆 신뢰 라벨 14pt gray-500 ("최근 7일, Kakao Local 기준") — 데이터 스펙에 `source` 필드 필수
- AI 카드 모션: entrance 1회 + 신규성 펄스(0.5s × 1회). infinite glow 폐기, `prefers-reduced-motion` 분기

### 7.3 Copy Rule 1.0

| 영역 | 숫자 | 서술형 |
|---|---|---|
| Hero (②) | 핵심 비율 1개 ("2.6배") 24pt orange | 1줄 ("업로드 후 검색 늘었어요") 16pt gray-700 |
| Facts (①) | 절대값 + 증감률 ("1,250명" + "+15%") | 14pt sub ("지난주보다") |
| Signal (③) | 0~1개 ("2.5배") | 이모지 + 조건 + 키워드 |

원칙: **한 카드당 강조 숫자 1개 이하**. 사장님은 "비교 가능한 숫자 1개 + 왜인지 1줄"만 처리 가능.

### 7.4 빈 상태 / 신뢰도 정책

| 데이터 | First-time (≤ 7일) | No-data | CTA (필수) |
|---|---|---|---|
| ① 검색 | "7일간 데이터 모으는 중 🔍" | "아직 가게 등록 직후예요" | [가게 정보 보강하기] |
| ② 릴스 | "첫 영상을 올리면 효과를 보여드릴게요" | "5일째 새 영상이 없어요" (nudge, 비난 톤 금지) | [3분 만에 영상 만들기 🎬] |
| ③ 시그널 | "오늘은 특별한 기회 신호가 없어요 ☀️" | (정상 상태) | [어제 키워드 보기] |

원칙: 빈 상태도 CTA 1개 필수. "데이터 없음"으로 끝나면 페이지 죽음.

### 7.5 AI / Operational Action 정책

- **카드 상한**: AI primary 1 + Operational 최대 2 = 총 3개
- **디스미스**: 24h 롤링 (자정 리셋 X — 새벽 가게 불공정)
- **3회 연속 디스미스**: 같은 제안은 7일 cooldown
- **Operational 트리거 예시**:
  - 릴스 저장률 직전 7일 대비 −30% → "저장 유도형 템플릿"
  - 외부 신호 임계 초과 → "오늘 ○○ 메뉴 강조"

### 7.6 Assumptions (검증 필요)

- A1: 사장님은 Hero의 "2.6배" 1개 숫자만으로 영상 효과를 판단할 수 있다 → UT-2 verbal probe로 검증.
- A2: 네이버 플레이스 크롤링은 IP rotation으로 안정 운영 가능하다 → 백엔드 PoC 필요.
- A3: "5일째 새 영상이 없어요" nudge가 비난으로 들리지 않는다 → UT-3 카피 인지 검증.
- A4: 24h 롤링 디스미스가 새벽 가게에 공정하다 → 실 사용 로그 분석 후 조정.

## 8. Release Timeline

| 시점 | 데이터 / 기능 |
|---|---|
| **MVP (D0)** | ① 7일 검색량 추이 + 전주 대비 % / ② 최근 영상 1개의 저장·도달·공유 (proxy) / ③ 날씨+요일 단일 카드, 정적 매핑 / 좌(Facts)/우(Actions) 2-pane / Hero ② 단독 / AI 카드 evidence·confidence·dismiss |
| **MVP+1주** | ① 상위 키워드 3개 노출 / ② 업로드별 비교 top3 / ③ 시즌·이벤트 캘린더 결합 |
| **후속 분기** | ① 키워드→방문 funnel / ② 페르소나별 segmentation + 인스타 Graph API 연동 / ③ 지역 트렌드 실시간 + LLM 동적 추천 / 매출·리뷰 점수 통합 검토 |

---

## 9. User Stories (INVEST & Acceptance Criteria)

### Story 1 — Hero 릴스 효과
**As a** 외식업 사장님,
**I want to** 가게 현황에 진입하자마자 내가 만든 영상이 효과가 있었는지 한 화면에서 보고,
**so that** 같은 흐름을 한 편 더 만들지 결정할 수 있다.

- AC1: 페이지 진입 시 Hero 영역에 최근 영상의 ±7일 비교 비율 1개("N.N배")가 24pt orange로 노출된다.
- AC2: Hero에 미니 라인차트(D-3 ~ D+3)가 표시되고 업로드 시점이 dot으로 강조된다.
- AC3: [한 편 더 만들기 🎬] Primary CTA 클릭 시 `promotion` 페이지로 이동하며 Context(vibe/title)가 전달된다.
- AC4: 영상 0개 사장님은 "첫 영상을 올리면 효과를 보여드릴게요" 빈 상태 + [3분 만에 영상 만들기 🎬] CTA를 본다.
- AC5: 모든 수치 옆에 "최근 7일, PULSE 영상 기준" source 라벨이 14pt gray-500으로 노출된다.

### Story 2 — Facts (검색 노출 트렌드)
**As a** 외식업 사장님,
**I want to** 우리 가게가 요즘 얼마나 검색되는지 한 줄로 확인하고,
**so that** 트래픽 변화를 인지하고 다음 행동을 선택할 수 있다.

- AC1: 좌측 KPI strip에 절대값 1개 + 증감률 1개가 인라인으로 노출된다 (no box).
- AC2: 증감 방향에 따라 CTA 라벨이 달라진다 (증가→영상 만들기 / 감소→손님 분석).
- AC3: 등록 7일 이내인 가게는 "7일간 데이터 모으는 중 🔍" 빈 상태로 대체된다.
- AC4: 데이터 소스(Kakao Local / 네이버 플레이스)가 source 라벨에 명시된다.

### Story 3 — Today's Signal
**As a** 외식업 사장님,
**I want to** 오늘 날씨·요일에 맞춰 어떤 메뉴/키워드를 강조해야 하는지 1줄로 추천받고,
**so that** 영상 제작을 망설이지 않고 시작할 수 있다.

- AC1: 외부 신호(강수확률 ≥60% / 폭염 / 금 17시+) 중 상위 1개가 이모지+조건+키워드 형식으로 노출된다.
- AC2: [이 키워드로 즉시 영상 만들기] CTA 클릭 시 `promotion`으로 이동하며 vibe/title이 자동 세팅된다.
- AC3: 신호가 없는 날은 "오늘은 특별한 신호가 없네요. 지난주 인기 키워드로 영상을 새로 만들어볼까요?" fallback 카피 + CTA를 본다.
- AC4: 동일 신호 3회 연속 디스미스 시 7일 cooldown.

### Story 4 — Action 카드 (AI Suggestion)
**As a** 외식업 사장님,
**I want to** AI 제안에 근거와 신뢰도가 함께 표시되고 원할 때 숨길 수 있어,
**so that** AI를 신뢰하면서도 피로하지 않게 사용할 수 있다.

- AC1: AI primary 카드는 동시 노출 1개로 제한되고, Operational secondary 카드는 최대 2개까지다.
- AC2: 각 AI 카드에 evidence("소식 안 올린 지 5일째") + confidence("높음/보통/낮음") + [오늘은 그만 볼래요] 디스미스가 노출된다.
- AC3: 디스미스는 24h 롤링이며, 같은 제안 3회 연속 디스미스 시 7일 cooldown.
- AC4: 카드 entrance 모션은 1회 + 신규성 펄스(0.5s × 1회)이며, `prefers-reduced-motion` 시 모두 정지한다.

### Story 5 — 통합 라우팅 / v1 폐기
**As a** 운영자,
**I want** v1 `/dashboard`와 v2 `/store/status-v2`가 단일 경로로 통합되고,
**so that** 사용자가 다른 화면으로 분기되지 않는다.

- AC1: 단일 라우트(예: `/dashboard`)가 정본이 되며, 다른 경로는 redirect로 처리된다.
- AC2: `App.jsx` 라우트와 사이드바 menuId가 단일 값으로 통일된다.
- AC3: `src/features/dashboard/` 디렉터리가 코드베이스에서 제거된다.
- AC4: `npm run lint && npm run typecheck && npm run build` 모두 통과한다.

### Story 6 — UT 검증 (KR 직접 검증)
**As a** PM,
**I want to** MVP 출시 후 2주 내 사장님 5명 대상 UT를 진행하고,
**so that** KR(60초 내 CTA 클릭률 ≥ 40%, UT-1 성공률 ≥ 80%)을 검증할 수 있다.

- AC1: UT-1 (60초 CTA 검증), UT-2 (의사결정 신뢰 검증), UT-3 (빈 상태 회복 검증) 시나리오 3개를 실행한다.
- AC2: 각 UT마다 페르소나·시작/완료·측정 지표·관찰 가설이 정의된 문서가 사전 작성된다.
- AC3: UT 결과는 PRD v1.1로 회귀하여 카피·임계치를 조정한다.

---

## 10. 미해결 / 사장님 결정 필요 (Open Questions)

1. **라우팅 정본 경로**: `/dashboard` vs `/store/status-v2` 중 정본 선택, 나머지는 redirect 처리.
2. **사이드바 메뉴 ID 통일**: `'home'` / `'status-v2'` → 단일 값(예: `'status'`)으로 정리할지.
3. **AI Suggestion 신규성 펄스**: 0.5s × 1회 미세 펄스 채택 여부.
4. **인스타 Graph API 연동 ETA**: ②의 proxy → 실데이터 전환 시점.
5. **빈 상태 nudge 톤** ("5일째 새 영상이 없어요"): 비난 톤으로 들리지 않는지 카피 user test 필요.

---

## 11. References

- `MD/about_pulse.md` §4.3, §5.4, §6, §7, §10.1, §11
- `MD/tech.md` (데이터 소스: Kakao Local API, Playwright 크롤링, BERTopic, MySQL/MongoDB, VideoLog 스키마)
- 현재 v1 구현: `src/features/dashboard/DashboardHome.jsx`, `src/features/dashboard/components/`, `DashboardConstants.js`, `weatherData.js`
- 현재 v2 구현: `src/features/dashboard-v2/StatusV2Page.jsx`, `src/features/dashboard-v2/components/V2*.jsx`, `src/features/dashboard-v2/services/dashboardV2Api.js`
- 디자인 토큰: `tailwind.config.js`, `src/constants/index.js`
- 라우팅: `src/App.jsx`, `src/components/layout/DashboardLayout.jsx`
