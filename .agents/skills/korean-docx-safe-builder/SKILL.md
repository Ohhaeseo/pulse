---
name: korean-docx-safe-builder
description: Use when creating or editing Korean-language DOCX files in this repo, especially proposal and evidence documents. Prevent encoding corruption, template overwrite mistakes, and unverified layout changes.
---

# 한글-docx-안전생성

한글 사업계획서와 증빙 `.docx`를 안전하게 생성하기 위한 skill입니다.

## 목표

- 한글 깨짐 방지
- 템플릿 보존
- 생성 후 검증 자동화

## 작업 원칙

1. 한글 `.docx` 생성은 `python-docx`를 우선 사용합니다.
2. PowerShell here-string, echo, shell redirection으로 한글 문서를 직접 생성하지 않습니다.
3. 원본 템플릿은 덮어쓰지 말고 출력본을 별도 파일로 저장합니다.
4. 생성 후에는 문서를 다시 열어 핵심 텍스트와 표 셀을 검증합니다.
5. 렌더링 툴이 없으면 시각적 레이아웃 리스크를 명시합니다.

## 이 repo에서 우선 활용할 스크립트

- `business/build_plan_docx.py`
- `business/build_appendix2_docx.py`

## 체크 항목

- 파일명이 의도한 출력본인지
- 한글 문자열이 정상 저장되었는지
- 표 셀 매핑이 어긋나지 않았는지
- 존댓말 문체가 유지되었는지

## 금지

- 템플릿 원본 수정
- 검증 없이 생성본 전달
