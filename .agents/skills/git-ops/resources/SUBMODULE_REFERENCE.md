# PULSE 서브모듈 레퍼런스

## 프로젝트 구조

| 서브모듈 | 로컬 경로 | 원격 URL | 역할 |
|---|---|---|---|
| **pulse_FE** | `c:\PULSE\pulse_FE` | `https://github.com/SKUnohtaekyung/pulse_FE` | React 프론트엔드 |
| **pulse_python** | `c:\PULSE\pulse_python` | `https://github.com/YJlang/pulse_python` | FastAPI AI 백엔드 |
| **pulse_spring** | `c:\PULSE\pulse_spring` | `https://github.com/YJlang/pulse_spring` | Spring Boot 메인 백엔드 |

**메인 레포**: `https://github.com/YJlang/PULSE` (`c:\PULSE`)

## 핵심 규칙

1. **2단계 커밋 필수**: 서브모듈 커밋/푸시 → 메인 레포에서 참조 업데이트 커밋/푸시
2. **Detached HEAD 주의**: `git submodule update` 후 서브모듈이 Detached HEAD가 될 수 있음 → `git checkout main`으로 복구
3. **작업 전 동기화**: 항상 `git pull` + `git submodule update --remote --merge`로 시작
4. **기본 브랜치**: 모든 서브모듈의 기본 브랜치는 `main`

## 주의사항

- ❌ 서브모듈 커밋 없이 메인 레포만 푸시하면 다른 팀원이 최신 코드를 못 받음
- ❌ `force push` 사용 금지
- ✅ 커밋 메시지는 Conventional Commits 형식 사용
- ✅ `.gitmodules` 파일 수동 편집 금지 (git submodule 명령 사용)
