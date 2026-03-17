---
name: proposal-visual-png
description: Use when creating PNG visuals for the business plan, such as business model diagrams, architecture diagrams, or proposal-ready card layouts. Use only for proposal visuals, not generic app UI mockups.
---

# 사업계획서-도식/PNG

사업계획서용 PNG 시각자료를 안정적으로 생성하기 위한 skill입니다.

## 목표

- Word 본문 폭에 맞는 비율 유지
- 카드 내부 텍스트 overflow 방지
- 재생성 가능한 스크립트 유지

## 작업 절차

1. 먼저 도식의 목적을 한 줄로 정의합니다.
2. 박스 수를 4~5개 수준으로 제한합니다.
3. 각 박스 문구를 2~3줄 이내로 압축합니다.
4. PNG는 `images/`에 저장합니다.
5. 생성 스크립트는 `business/`에 보관합니다.
6. `view_image` 등으로 결과를 직접 검수하고, overflow나 정렬 이슈가 있으면 즉시 재생성합니다.

## 이 repo에서 우선 활용할 스크립트

- `business/build_business_model_png.py`

## 품질 기준

- 텍스트가 카드 범위를 넘지 않아야 합니다.
- 제목, 캡션, 보조 패널은 좌우 균형이 맞아야 합니다.
- “보기 좋은 초안”이 아니라 “본문 삽입 가능한 결과물”을 목표로 합니다.

## 금지

- 검수 없이 PNG 결과물 전달
- 설명보다 기능이 많은 복잡한 도식
