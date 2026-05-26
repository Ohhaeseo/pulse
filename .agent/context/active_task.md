# 🚀 Active Task Context

**Current Goal:** Technical architecture for Unified Store Dashboard defined.
**Current Status:** `planner` has completed JSON task decomposition. 정본 PRD는 `prd-store-dashboard.md`이고, 본 plan의 JSON technical_tasks(14개, MVP/MVP+1w/Backlog 라벨)와 API 계약은 planner 메시지에 인라인으로 기록되어 있습니다.

**Strict Constraints:**
- PRD §7.2 골격 규칙 엄수: 좌측 pane `overflow-hidden` 강제(기존 v2의 `overflow-y-auto`는 변경 대상), 카드당 강조 숫자 1개 이하, 모든 수치 옆 `source` 라벨(14pt gray-500) 노출.
- 동시 노출 카드 상한: Hero 1 + AI primary 1 + Operational 최대 2.
- AI 카드 모션은 entrance 1회 + 신규성 펄스(0.5s × 1회, `isNew===true`일 때만). infinite glow/shimmer/blur 루프는 모두 제거. `useReducedMotion()` 분기 필수 + sessionStorage `seen:{id}`로 재실행 차단.
- `MD/design_guide.md` 토큰(Pretendard Variable, blue/white/orange) 외 절대 사용 불가.
- No Scroll Policy: 1440×900, 1280×800 두 해상도에서 좌·우 pane 모두 무스크롤.
- 라우팅 정본은 `/dashboard`. `/store/status-v2`는 `<Navigate to="/dashboard" replace />`.
- 사이드바 메뉴 ID는 단일 `'status'`로 통일(label "가게 현황"). `DashboardLayout`의 `'home'`/`'status-v2'` 두 분기를 통합.
- Operational 트리거 룰 평가는 **BE 책임**. FE는 응답의 `actions.operational[]`(0~2개)을 렌더만 한다.
- 디스미스 영속화는 **서버 정본 + localStorage 낙관적 캐시**. `POST /api/dashboard/{storeId}/dismiss` 비동기 호출, 응답 전 로컬에서 즉시 hide, 다음 fetch의 `data.dismissedIds`로 reconcile.
- v1 `src/features/dashboard/` 디렉터리는 라우팅 통합(T08) 스모크 테스트 통과 후 제거(T09).
- 사용자-facing 카피는 한국어 존댓말.
- `.env`, API 토큰, 키 노출/문서화 금지.
- 본 plan은 `prd-store-dashboard.md`만 정본으로 한다. 기존 `prd.md`(인플루언서 v2.1)와 `current_plan.md`(인플루언서 양면 루프 v3.0)는 별도 워크스트림이므로 **절대 덮어쓰지 말 것**.

## API 계약 요약 (자세한 스키마는 planner 메시지의 JSON 예시 참조)
- 1순위 endpoint: `GET /api/dashboard/{storeId}/store-status`
- 응답 키: `metadata`, `searchTrend`, `reelsImpact`, `todaySignal`, `actions.aiSuggestion`, `actions.operational[]`, `dismissedIds`
- 각 위젯은 `state: 'default' | 'first_time' | 'empty' | 'loading' | 'error'`와 `source`, `period` 필드를 포함.
- 디스미스 endpoint: `POST /api/dashboard/{storeId}/dismiss` body `{dismissibleId, dismissedAt}`.

## Parked Track
- 인플루언서 양면 루프 v3.0 작업은 `.agent/context/current_plan.md`에 5개 우선순위로 보존되어 있으며, 가게 현황 통합 완료 후 또는 병행 가능 시점에 다시 active로 승격합니다.
- 인플루언서 PRD는 `prd.md`에 그대로 유지됩니다.

## Next Immediate Action
**Target Agent:** `frontend-dev`
**Instruction:** planner JSON `technical_tasks`를 MVP 우선순위 의존 순서로 구현하십시오. 의존 그래프:
1. **T01** `dashboardV2Api.js` 응답 스키마 재정의(mock 포함, 위 API 계약 요약대로) →
2. 병렬: **T02** `V2ReelsImpactHero.jsx` 신규 / **T03** `V2TodaySignalCard.jsx` 신규 / **T04** `V2KpiTile.jsx` source·period 확장 / **T05** `V2TodayBrief.jsx` 카피 톤 흡수 / **T06** `V2AiSuggestionCard.jsx` 모션 재정비 →
3. **T07** `StatusV2Page.jsx` + `V2Skeleton.jsx` 재구성(좌측 `overflow-hidden`, Hero 단독 row, Facts 좌측에 ①+③, Actions 우측) →
4. **T08** 라우팅·Sidebar 통합 →
5. **T09** v1 `src/features/dashboard/` 디렉터리 제거 →
6. **T10** 디스미스 영속화 →
7. **T11** 빈/first_time/error 상태 카피 와이어업 →
8. **T12** 검증(unit + integration + lint/typecheck/build + 두 해상도 무스크롤 + `prefers-reduced-motion` 확인).

첫 번째 task(T01)부터 시작하고, 각 task 완료 시 `npm run lint`/`typecheck`/`build` 게이트로 회귀를 막으십시오. T09(v1 제거)는 T08 통합 후 통합 페이지가 정상 렌더되는 것을 확인한 다음에만 실행하십시오.
