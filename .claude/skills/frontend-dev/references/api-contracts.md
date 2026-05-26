# PULSE API Contracts Reference

> `frontend-dev` skill의 supporting file. API 계약을 신규 정의하거나 변경할 때
> 먼저 이 문서를 읽고, 입력·출력·오류·로딩·권한 상태를 명확히 한 뒤 구현에 들어갑니다.

## Overview

PULSE 프론트엔드와 Spring Boot / FastAPI / 외부 API 사이의 계약을 먼저 정의합니다. 구현보다 입력·출력·오류·로딩·권한 상태를 먼저 명확히 해야 병렬 개발과 QA가 쉬워집니다.

## Contract Surfaces

| 도메인 | 경로 |
|---|---|
| Auth / Profile | `src/features/auth/api/*` |
| Dashboard V2 | `src/features/dashboard-v2/services/*` |
| Insight / Kakao | `src/features/insight/api/*`, `src/api/kakaoLocal.js`, `src/utils/kakaoMapLoader.js` |
| Review Management | `src/features/reviewManagement/api/*` |
| Promotion / Video | `src/features/promotion/promotionApi.js` |
| Influencer Proposals | `src/features/influencer/*` |
| Route-level props | `src/App.jsx`, layout components |

## Workflow

1. 호출자(caller)와 가장 가까운 기존 API 모듈을 읽는다.
2. 코드 작성 전에 다음을 먼저 정의한다:
   - endpoint 또는 모듈 함수
   - HTTP method
   - request params / body 스키마
   - response 스키마
   - error 스키마
   - 인증 요구사항 (token, role)
   - UI 상태: loading / empty / error / unauthorized / not found
3. 기존 필드를 깨는 변경(breaking change)보다 **추가(additive)** 변경을 선호한다.
4. 오류 의미(semantic)를 정규화한다:
   - validation
   - unauthenticated
   - unauthorized
   - not found
   - provider unavailable
   - unknown
5. 외부 API 응답은 UI 결정에 사용하기 전에 형상(shape) 검증을 거친다.

## PULSE Conventions

- API wrapper 함수는 feature-level `api/` 또는 `services/` 모듈에만 둔다.
- UI 컴포넌트는 provider-specific URL을 직접 조립하지 않는다.
- 계약 예시에 시크릿이나 provider 키를 하드코딩하지 않는다.
- 리스트 데이터는 페이지네이션을 포함하거나, MVP 단계에서 생략하는 경우 명시 주석을 남긴다.
- 제안(proposal) 토큰은 route param 외 위치에 노출하지 않는다. 로깅도 금지.

## Output Contract (계약서 작성 시)

계약 문서나 코멘트를 작성할 때 다음 항목을 반드시 포함합니다:

- 계약 테이블 (endpoint, method, request, response, error)
- 영향 받는 파일 목록
- 호환성 위험 (기존 호출자에 미치는 영향)
- 필요한 테스트·QA 항목
