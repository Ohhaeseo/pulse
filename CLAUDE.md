# PULSE Frontend — Project Rules

## Project Overview

PULSE는 소상공인(식당, 카페 등)을 위한 SaaS 대시보드입니다. 프론트엔드는 React + Vite + Tailwind CSS이며, 백엔드는 Spring Boot + FastAPI 조합입니다. Kakao Maps API와 OpenAI/Gemini/VEO를 연동합니다.

## Key Paths

- 라우트 정의: `src/App.jsx`
- 레이아웃 셸: `src/components/layout/`
- 피처 단위: `src/features/<feature>/`
- 디자인 토큰: `tailwind.config.js`, `src/constants/index.js`, `src/styles/globals.css`
- 프로젝트 docs: `MD/tech.md`, `MD/design_guide.md`, `MD/PULSE.md`
- 현재 작업 컨텍스트: `.agent/context/active_task.md`
- PR 템플릿: `.github/PULL_REQUEST_TEMPLATE.md`

## Tech Stack

Vite, React 18, React Router v6, Tailwind CSS, Pretendard Variable.
외부 연동: Kakao Local API, Kakao Maps JS SDK, OpenAI / Gemini / VEO.

## Design System — Non-Negotiable

- 색상·타이포는 `tailwind.config.js`의 PULSE 토큰만 사용. 외부 팔레트 직접 사용 금지.
- 폰트는 Pretendard Variable 고정. 다른 폰트 추가 금지.
- 아이콘은 Lucide 또는 기존 레포 아이콘 패밀리. emoji를 UI 아이콘으로 사용 금지.
- 대시보드 밀도 6–8 (데이터 밀집, 장식 최소화).
- 랜딩·인증 밀도 4–6 (브랜드 표현 가능, 단 PULSE 토큰 내에서만).

## Routing Rules

- 정본 라우트: `/dashboard`
- `/store/status-v2` → `<Navigate to="/dashboard" replace />`
- 사이드바 메뉴 ID: `'status'` 단일화 (label: "가게 현황")

## Pre-Work Checklist

코드 수정 전 반드시:

1. `src/App.jsx` 라우트 구조 확인
2. 변경 대상 컴포넌트의 기존 코드 Read
3. `package.json` 확인 후 의존 라이브러리 import (가정 금지)

## Post-Implementation Verification

```sh
npm run lint
npm run build
```

UI 변경 시 1440×900, 1280×800 두 해상도에서 좌·우 pane 무스크롤 확인.

## Korean Commit / PR Rules

- 커밋 형식: `<type>: <한국어 한 줄 요약>` (Conventional Commits)
- 허용 type: `feat`, `fix`, `docs`, `style`, `refactor`, `test`, `chore`
- 커밋 메시지, PR 본문은 **반드시 한국어**
- 예시: `feat: 가게 현황 대시보드 V2 레이아웃 구현`

## Hard Constraints

- `.env` 내용, API 키, 토큰을 코드·주석·문서에 절대 노출 금지
- 사용자·AI 생성 콘텐츠에 `dangerouslySetInnerHTML` 사용 금지 (sanitize 없이)
- `dist/` 디렉터리 직접 수정 금지
- `transition-all` 사용 금지. `transform`, `opacity`만 animate
- `h-screen` 대신 `min-h-dvh` 사용 (모바일 브라우저 크롬 영향 방지)
- 무한 루프 애니메이션(infinite glow / shimmer / blur) 금지
  - AI 카드: entrance 1회 + 신규성 펄스 0.5s × 1회만 (`isNew === true` 일 때)
  - 모든 motion에 `useReducedMotion()` 분기 필수
- 좌측 pane은 `overflow-y-auto` 금지, `overflow-hidden` 강제
- 대시보드 동시 노출 카드 상한: Hero 1 + AI primary 1 + Operational 2

## Skills & Agents (Claude Code)

**Skills (slash commands)**
- `/review` — 코드 리뷰 (수동 호출)
- `/pr` — 한국어 커밋 메시지 + PR 본문 생성 (수동 호출)
- `/security` — 보안 경계 검토: auth, env, API, 사용자 입력 (수동 호출)
- `frontend-dev` skill — 명시적 호출 시에만 활성화 (`/frontend-dev`)
- `pulse-design` skill — 새 화면 제작·리디자인 시 디자인 기준 전체 제공 (`/pulse-design`). 색상·타이포·간격·컴포넌트·애니메이션 규칙 포함. tailwind.config.js neutral/error 토큰 추가 선행 필요.

**Subagents**
- `ui-ux-reviewer` — UI 구현 완료 후 독립 UX 검토, 코드 정적 분석 (read-only)
- `pulse-visual-qa` — 브라우저 실측 QA, 뷰포트·console·무스크롤 검증 (dev server 필요)
- `planner` — 새 피처 시작 전 기술 계획 분해 (read-only)
- `product-manager` — PRD 작성·갱신, OST, 사용자 스토리, 피처 우선순위 (prd.md 쓰기 가능)

Codex 병행 사용: `.agents/skills/`는 Codex 전용 구조이며 그대로 유지. Claude Code 작업에서는 `.claude/skills/`와 `.claude/agents/`만 참조.
