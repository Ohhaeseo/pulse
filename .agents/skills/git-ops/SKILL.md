---
name: git-ops
description: >
  PULSE 모노레포의 Git 상태 확인, 커밋/푸시, pull 동기화, 서브모듈 관리를 자동화합니다.
  사용자가 "git 상태", "커밋", "푸시", "풀", "동기화", "서브모듈" 등의 키워드를 사용하거나
  코드 변경 후 저장소 관리를 요청할 때 활성화됩니다.
---

# Git Operations Skill

PULSE 프로젝트는 3개 서브모듈(`pulse_FE`, `pulse_python`, `pulse_spring`)로 구성된 모노레포입니다.
서브모듈 작업은 **반드시 2단계 커밋**(서브모듈 → 메인 레포 참조 업데이트)이 필요합니다.

## 프로젝트 구조

```
PULSE (메인 레포: c:\PULSE)
├── pulse_FE/          → https://github.com/SKUnohtaekyung/pulse_FE
├── pulse_python/      → https://github.com/YJlang/pulse_python
└── pulse_spring/      → https://github.com/YJlang/pulse_spring
```

상세 정보는 `resources/SUBMODULE_REFERENCE.md`를 참조하세요.

---

## 워크플로

### 1. 상태 점검 (Status Check)

사용자가 Git 상태 확인을 요청하면:

1. **스크립트 실행**: `scripts/check_status.ps1`을 실행합니다.
   ```powershell
   powershell -ExecutionPolicy Bypass -File "<skill_path>/scripts/check_status.ps1"
   ```
2. **결과 해석**: 출력을 읽고 사용자에게 보고합니다.
   - 🟢 Clean: 변경사항 없음
   - 🟡 Modified: 커밋되지 않은 변경사항 있음
   - 🔴 Detached HEAD: 브랜치가 아닌 특정 커밋을 가리킴 (복구 필요)

### 2. 커밋 & 푸시 (Smart Commit & Push)

사용자가 커밋/푸시를 요청하면:

1. **사전 확인**: `check_status.ps1`로 어떤 서브모듈에 변경이 있는지 확인합니다.
2. **커밋 메시지 확인**: 사용자가 커밋 메시지를 제공하지 않았으면 변경 내용을 분석하여 Conventional Commits 형식의 메시지를 제안합니다.
3. **스크립트 실행**: 확인받은 메시지로 `scripts/sync_all.ps1`을 실행합니다.
   ```powershell
   powershell -ExecutionPolicy Bypass -File "<skill_path>/scripts/sync_all.ps1" -CommitMessage "feat: update analysis pipeline"
   ```
4. **결과 보고**: 각 서브모듈과 메인 레포의 커밋/푸시 결과를 보고합니다.

> [!CAUTION]
> **`sync_all.ps1`을 실행하기 전에 반드시 사용자에게 확인을 받으세요.**
> 변경된 서브모듈 목록과 커밋 메시지를 보여주고 승인을 받은 후 실행합니다.

### 3. Pull & 동기화 (Pull & Sync)

사용자가 최신 상태로 동기화를 요청하면:

1. **스크립트 실행**: `scripts/pull_all.ps1`을 실행합니다.
   ```powershell
   powershell -ExecutionPolicy Bypass -File "<skill_path>/scripts/pull_all.ps1"
   ```
2. **결과 보고**: 각 서브모듈의 업데이트 결과를 보고합니다.
3. **충돌 감지**: 충돌이 발생하면 사용자에게 알리고 해결을 돕습니다.

### 4. 브랜치 관리 (Branch Management)

사용자가 브랜치 관련 작업을 요청하면:

- **상태 확인**: 각 서브모듈의 현재 브랜치를 확인합니다.
  ```powershell
  git -C c:\PULSE\pulse_FE branch --show-current
  git -C c:\PULSE\pulse_python branch --show-current
  git -C c:\PULSE\pulse_spring branch --show-current
  ```
- **Detached HEAD 복구**: Detached HEAD를 발견하면 자동 복구합니다.
  ```powershell
  git -C c:\PULSE\<submodule> checkout main
  git -C c:\PULSE\<submodule> pull
  ```
- **브랜치 생성/전환**: 사용자가 요청하는 서브모듈에서 브랜치 작업을 수행합니다.

### 5. 문제 해결 (Troubleshooting)

일반적인 문제 패턴과 자동 해결:

| 문제 | 해결 명령 |
|---|---|
| 서브모듈이 올바른 커밋을 가리키지 않음 | `git submodule update --init --recursive` |
| 새로운 서브모듈이 추가됨 | `git pull origin main && git submodule update --init --recursive` |
| 서브모듈 내부 변경사항 커밋 안 됨 | 2단계 커밋 워크플로 안내 |
| Detached HEAD | `git checkout main && git pull` |

---

## 제약사항

- ❌ **사용자 확인 없이 `push`하지 마세요** — 항상 변경사항을 보여주고 승인 후 실행
- ❌ **`force push`는 절대 사용하지 마세요** — 데이터 손실 위험
- ❌ **`git reset --hard`는 사용자 명시적 요청 없이 사용하지 마세요**
- ✅ **2단계 커밋을 항상 준수하세요** — 서브모듈 커밋 → 메인 레포 참조 업데이트
- ✅ **Detached HEAD를 발견하면 즉시 경고하세요**
- ✅ **커밋 메시지는 Conventional Commits 형식을 사용하세요**

## 출력 형식

상태 보고 시 다음 형식을 사용하세요:

```markdown
# 🔍 PULSE Git Status Report

| 모듈 | 브랜치 | 상태 | 변경 파일 |
|---|---|---|---|
| **PULSE** (메인) | `main` | 🟢 Clean | 0 |
| **pulse_FE** | `main` | 🟡 Modified | 3 |
| **pulse_python** | `main` | 🟢 Clean | 0 |
| **pulse_spring** | `main` | 🔴 Detached HEAD | 2 |
```
