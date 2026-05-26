---
name: frontend-dev
description: >
  PULSE 프론트엔드 구현 작업을 명시적으로 요청받았을 때 사용. `/frontend-dev` 명령
  또는 사용자가 "frontend-dev로", "이 skill로 구현" 같은 명시적 호출을 했을 때만
  활성화. 일반 구현 요청에는 자동 호출되지 않음.
---

# Frontend Developer

## Purpose

Implement focused React changes that follow the existing PULSE architecture and visual system.

## Default Context

- App routes: `src/App.jsx`.
- Layout shells: `src/components/layout/*`.
- Feature surfaces: `src/features/*`, `src/pages/*`.
- Tokens and constants: `tailwind.config.js`, `src/constants/index.js`, `src/styles/globals.css`.
- Product/design docs: `MD/tech.md`, `MD/design_guide.md`, `prd.md`.
- **API 계약 변경 시 `references/api-contracts.md`를 먼저 읽으십시오.**

## Implementation Rules

- Read nearby code before editing.
- Reuse existing components, tokens, Korean copy tone, and layout conventions.
- Check `package.json` before importing any third-party package; do not assume `framer-motion`, `lucide-react`, `gsap`, charts, maps, or utility libraries are available.
- Keep changes scoped; avoid broad refactors unless required.
- Treat user, review, influencer, store, and AI text as untrusted.
- For heavy routes, maps, charts, 3D, and animation, consider lazy loading or isolated components.
- Build all visible UI states that the workflow can naturally enter: loading, empty, error, disabled, hover, focus-visible, active/pressed, and success/confirmation.
- Prefer CSS grid for reliable multi-column layouts; avoid brittle flex percentage math.
- Use `min-h-dvh` / `min-h-[100dvh]` for viewport-height sections instead of `h-screen` when mobile browser chrome can affect layout.
- Animate only `transform` and `opacity` for routine UI motion; avoid `transition-all` and layout-affecting animation of `top`, `left`, `width`, or `height`.
- Isolate expensive or continuous Framer Motion, GSAP, Lenis, Three.js, chart, and map work in leaf components with cleanup in `useEffect`.
- For bundle-heavy routes, maps, charts, 3D, video assets, or long lists, measure first where possible and prefer the smallest performance fix: route lazy loading, deferred initialization, stable media dimensions, explicit animation properties, or isolated memoized leaf components.
- Avoid running grain/noise/backdrop filters on scrolling containers, and consider pagination or virtualization for roughly 50+ visible rows/items.
- Use Lucide or the repo's existing icon family for controls; do not use emoji as structural UI icons or alt text.
- Do not touch `.env` contents or generated `dist/` unless explicitly requested.

## PULSE UI Quality Defaults

- Operational dashboards: density 6–8, low decoration, inline metrics, dividers, tables, charts, and only necessary cards.
- Landing/auth/presentation surfaces: density 4–6, stronger visual signature, but still anchored in PULSE blue, white, orange, and Pretendard.
- One primary CTA per screen or panel; secondary actions must be visually subordinate.
- Korean labels must wrap cleanly; prefer shorter 존댓말 copy and visible labels over placeholder-only inputs.
- Use semantic Tailwind tokens from `tailwind.config.js`; external design-system suggestions must be translated into PULSE tokens before implementation.

## Workflow

1. Locate route/component ownership.
2. Identify data and prop contracts. For new or changed APIs, read `references/api-contracts.md` first.
3. For visible design work, read `MD/design_guide.md` for PULSE visual rules and token reference. Translate all decisions into PULSE tokens from `tailwind.config.js` before implementing.
4. Implement the smallest coherent change.
5. Run relevant checks:
   - `npm run lint`
   - `npm run build` when source/runtime behavior changed
   - browser QA for visible UI changes.
6. Report changed files, behavior, and verification.

## Output Contract

- List of changed files with one-line purpose each.
- Behavior summary (what works now that did not before).
- Verification commands executed and their results.
- Known gaps and follow-ups.
