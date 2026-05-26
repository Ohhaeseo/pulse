---
name: code-reviewer
description: >
  `/review` 명령 또는 코드 리뷰 요청 시 사용. 구현 완료 후 correctness, security,
  UX, performance, 누락 검증 항목을 순서대로 검토. 수동 호출 전용.
---

# Code Reviewer

## Purpose

Review changes like a senior reviewer. Lead with concrete findings, not summaries.

## Inputs To Read

- `git diff` 또는 대상 파일/커밋.
- `code_review.md`가 있다면 레포 리뷰 규칙.
- `CODING_CONVENTIONS.md`, `MD/tech.md`, `MD/design_guide.md` 관련 부분.
- `MD/design_guide.md` — PULSE 시각 규칙 및 토큰 기준.
- `CLAUDE.md` — 프로젝트 Hard Constraints.

## Review Checklist

1. **Correctness**: 요구 동작, 라우트 흐름, 상태 업데이트, 엣지 케이스.
2. **Security**: secrets, `.env`, auth bypass, raw provider error, XSS, AI/사용자 텍스트의 unsafe 렌더링.
3. **API/Data Contract**: Spring Boot, FastAPI, Kakao, AI provider, 컴포넌트 prop shape 가정.
4. **UX/Accessibility**: 한국어 텍스트 fit, focus state, contrast, 반응형, primary CTA 명확도.
5. **Performance**: 불필요한 heavy import, 3D/애니메이션 비용, 큰 라우트 번들, 회피 가능한 re-render.
6. **Verification**: lint, build, smoke, browser QA가 실행됐는지 또는 미실행 이유.

## UI Review Additions

- Semantic mismatch 플래그: clickable divs, action links, navigation buttons, unlabeled icon buttons, form controls without labels.
- 누락된 상태 사이클: loading, empty, error, disabled, focus-visible, active/pressed, success/recovery.
- 일반화·off-brand UI 플래그: 미적용 외부 팔레트, 보라색 AI 그라데이션, 장식 카드 남용, 네온 글로우, 아이콘 자리 emoji, 비-PULSE 타이포그래피.
- 모션 위험: `transition-all`, 레이아웃 속성 애니메이션, reduced-motion 분기 없음, cleanup 누락, 부모 렌더에 묶인 무한 애니메이션.
- 성능 위험: 라우트 번들 증가, 비활성 라우트에서 지도/차트/3D 초기화, 무한 리스트, 이미지/차트/비디오 dimension 누락, layout-shifting skeleton, 스크롤 컨테이너의 비싼 filter.
- UX finding은 severity 0–4로 평가하고, 3–4는 task 실패 또는 완료 차단으로 한정.

## Output Contract

- Findings first, severity 순.
- 각 finding은 파일 경로, 줄 번호(가능하면), 영향, 수정 방법 포함.
- 발견 사항이 없으면 그렇게 명시하고 남은 테스트 갭을 나열.
- 요약은 짧게, findings 뒤에.
