---
name: pulse-security-hardening
description: >
  `/security` 명령 또는 보안 검토 요청 시 사용. auth, 환경변수, Kakao/OpenAI/Gemini/VEO
  연동, 파일·이미지 업로드, 사용자 입력, 리뷰 텍스트, AI 프롬프트 페이로드, 라우트
  보호, .env 추적 여부, XSS, prompt/data boundary 안전성을 점검. 수동 호출 전용.
---

# Pulse Security Hardening

## Overview

PULSE는 외부 API, 지도 키, 리뷰 텍스트, 이미지 업로드, AI 생성 요청, 인증 우회 플래그를 다루므로 프론트엔드 변경에도 보안 경계가 있습니다. 이 skill은 그 경계를 명시적으로 검토할 때 사용합니다.

## Always Check

- `.env`는 commit되지 않고, 콘솔/로그/문서에 출력되지 않아야 한다.
- `.env.example`은 placeholder만 포함한다.
- `VITE_BYPASS_AUTH`와 dev quick-login 플래그는 production에서 안전하다고 가정하지 않는다.
- Kakao API key, AI provider key는 모두 환경변수로만 주입한다.
- 사용자가 입력한 리뷰 텍스트, 프롬프트, 가게명, 인플루언서 프로필 필드는 untrusted data로 취급한다.
- `dangerouslySetInnerHTML`은 사용자·AI 생성 콘텐츠에 사용하지 않는다. 정당한 사유와 sanitize 없이는 금지.
- 외부 API 응답은 중요한 UI 결정에 사용하기 전에 shape를 검증한다.

## Workflow

1. 경계(boundary)를 식별한다:
   - auth / session
   - env / config
   - 3rd-party API
   - user input
   - AI 생성 콘텐츠
   - upload / media
2. 구현 코드와 `.env.example`을 검사한다. `.env` 본문은 사용자가 명시 요청하고 위험을 이해한 경우가 아니면 읽지 않는다.
3. 명백한 leak 패턴을 검색한다:
   - `api_key`, `secret`, `token`, `password`, `KAKAO`, `OPENAI`, `GEMINI`, `VEO`
4. 렌더링과 form handling에서 XSS·validation 이슈를 확인한다.
5. 적절한 경우 의존성·보안 점검을 실행한다:
   - `npm audit`
6. 발견사항은 파일 경로와 줄 번호와 함께 severity를 명시해 보고한다.

## PULSE-Specific Findings to Flag

- `.env`가 git에 tracking되고 있는 경우
- 라우트 보호가 프론트엔드 state에만 의존하는 경우
- AI 프롬프트 텍스트에 동의 없이 사적인 가게 데이터가 포함된 경우
- public assets 또는 build output에 secret이 포함된 경우
- proposal accept 토큰이 불필요하게 렌더링·로깅되는 경우
- 지도/검색 API 오류 메시지가 raw provider response를 사용자에게 노출하는 경우

## Output Contract

- High-risk finding을 먼저 보고한다.
- 각 finding은 영향(impact), 증거(evidence/파일:라인), 수정(fix), 검증 명령(verification command)을 포함한다.
- 보안 이슈를 요약 안에 묻지 않는다.
