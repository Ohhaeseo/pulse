---
name: doc-exporter
description: >
  마크다운 문서를 Word(DOCX) 또는 PDF로 변환합니다.
  사용자가 "Word로 변환", "PDF로 뽑아줘", "문서 내보내기", "docx", "export" 등의
  키워드를 사용할 때 활성화됩니다.
---

# Document Exporter Skill

마크다운(.md) 파일을 Word(DOCX) 또는 PDF 형식으로 변환하는 스킬입니다.

## 사전 요구사항

- **pandoc**이 설치되어 있어야 합니다.
- 설치되어 있지 않으면 `scripts/install_pandoc.ps1`을 먼저 실행하세요.

## 워크플로

### 1. pandoc 설치 확인

변환 요청을 받으면 먼저 pandoc 설치 여부를 확인합니다:

```powershell
pandoc --version
```

설치되어 있지 않으면:
```powershell
powershell -ExecutionPolicy Bypass -File "<skill_path>/scripts/install_pandoc.ps1"
```

### 2. Word(DOCX) 변환

사용자가 Word/DOCX 변환을 요청하면:

```powershell
powershell -ExecutionPolicy Bypass -File "<skill_path>/scripts/convert.ps1" -InputFile "<파일경로>" -Format "docx"
```

### 3. PDF 변환

사용자가 PDF 변환을 요청하면:

```powershell
powershell -ExecutionPolicy Bypass -File "<skill_path>/scripts/convert.ps1" -InputFile "<파일경로>" -Format "pdf"
```

> [!NOTE]
> PDF 변환은 추가로 **MiKTeX** 또는 **wkhtmltopdf**가 필요할 수 있습니다.
> PDF 변환이 실패하면 HTML 경유 방식(--pdf-engine=wkhtmltopdf)을 시도합니다.

### 4. 결과 보고

변환 완료 후 **출력 파일의 절대 경로**를 사용자에게 알려주세요.

## 제약사항

- ❌ 원본 마크다운 파일을 수정하거나 삭제하지 마세요
- ✅ 출력 파일은 원본과 같은 디렉토리에 같은 이름으로 저장합니다 (확장자만 변경)
- ✅ 한글 폰트 지원을 위해 `--pdf-engine-opt` 옵션을 적절히 사용합니다
