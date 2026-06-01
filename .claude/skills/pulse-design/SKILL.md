---
name: pulse-design
description: >
  PULSE 전체 화면 디자인 기준서. 새 화면을 만들거나 기존 화면을 리디자인할 때 반드시 먼저 읽을 것.
  색상·타이포·간격·컴포넌트·애니메이션 기준 전체 포함. 전문 UI/UX 디자이너 수준의 결과물을 위한 지침.
  `/pulse-design` 명령 또는 "pulse-design으로", "디자인 스킬 써서" 등 명시 호출 시 활성화.
---

# PULSE Design System — Full Designer's Brief

## 목표

AI가 만든 것처럼 보이는 뻔한 UI를 방지하고, 토스·당근마켓 수준의 세련되고 통일성 있는 전문 디자인을 만든다.
이 스킬은 `MD/design_guide.md`와 함께 읽는다. 충돌 시 **이 스킬이 우선**한다.

---

## 0. 작업 시작 전 필수 체크 (Pre-flight)

1. `tailwind.config.js`에 `neutral`과 `error` 토큰이 있는지 확인 → 없으면 §1.3 보고 먼저 추가
2. 작업 대상 화면 유형 파악 → §6 참조
3. `src/components/ui/` 기존 컴포넌트 확인 후 재사용
4. `src/features/auth/ThreeBackground.jsx` — **내부 코드 수정 절대 금지** (position·scale prop만 조정 허용)

---

## 1. 색상 시스템 (Color System)

### 1.1 써도 되는 색 — 완전 목록

**Primary (파랑 — 신뢰·브랜드)**

| Tailwind 클래스 | Hex | 용도 |
|---|---|---|
| `bg-primary` / `text-primary` | #002B7A | 로고, 헤드라인, 메인 CTA 배경, 사이드바 |
| `text-primary-sub` | #002B7ACC | 어두운 배경 위 보조 텍스트 |
| `text-primary-inactive` | #002B7A99 | 비활성 아이콘·텍스트 |
| `border-primary-border` | #002B7A66 | 비활성 버튼 테두리 |
| `bg-primary-tint` | #002B7A1A | 배지 배경, 연한 강조 영역 |
| `bg-primary-stripe` | #002B7A0D | 테이블 교차 행 배경 |

**Point (주황 — 행동 유도)**

| Tailwind 클래스 | Hex | 용도 |
|---|---|---|
| `bg-point` | #FF5A36CC | **핵심 CTA 버튼만** (회원가입, 생성, 실행) |
| `bg-point-bg` | #FF5A361A | 오렌지 배지 배경 |
| `bg-point-hover` | #FF5A3633 | 오렌지 버튼 호버 |

**Neutral (회색 — 구분·보조)**

| Tailwind 클래스 | Hex | 용도 |
|---|---|---|
| `bg-neutral-50` | #FAFAFA | 섹션 배경, 아주 연한 구분 |
| `bg-neutral-100` / `border-neutral-100` | #F5F5F5 | 태그 배경 |
| `border-neutral-200` | #E5E5E5 | 구분선, 카드 테두리 |
| `bg-neutral-300` | #D4D4D4 | 비활성 요소 배경 |
| `text-neutral-400` | #A3A3A3 | placeholder, 힌트 텍스트 |
| `text-neutral-600` | #525252 | 보조 본문 텍스트 |
| `text-neutral-900` | #171717 | 진한 텍스트 (text-main 대체 불가) |

**배경·텍스트 기본**

| Tailwind 클래스 | Hex | 용도 |
|---|---|---|
| `bg-bg-page` | #F5F7FA | 전체 페이지 배경 |
| `bg-white` / `bg-bg-card` | #FFFFFF | 카드·모달 배경 |
| `text-text-main` | #191F28 | 기본 본문·제목 |

**상태 색상**

| Tailwind 클래스 | Hex | 용도 |
|---|---|---|
| `text-success` / `bg-success` | #059669 | 성공, 완료 상태 |
| `text-warning` | #D97706 | 경고 |
| `text-error` / `border-error` | #DC2626 | 에러, 입력 오류 |

---

### 1.2 절대 사용 금지 색상

```
❌ text-red-500, bg-red-50        → text-error 사용
❌ text-blue-600, bg-blue-50      → text-primary / bg-primary-tint 사용
❌ text-gray-400, bg-gray-100     → text-neutral-400 / bg-neutral-100 사용
❌ text-slate-*, text-zinc-*      → neutral 토큰 사용
❌ #4B5563, #6B7280 등 Hex 직접 입력 → className으로만 참조
❌ style={{ color: '#...' }}      → className으로만 적용
❌ 보라색 계열 전반               → PULSE 브랜드 외부 색상
❌ text-[#002B7A] 같은 임의 Hex  → text-primary 사용
```

**차트·외부 라이브러리 색상 처리 — 반드시 상수로 관리**

```js
// src/constants/index.js에 추가 후 import
export const CHART_COLORS = {
  primary:   '#002B7A',
  secondary: '#8FB6FF',
  success:   '#059669',
  warning:   '#D97706',
  error:     '#DC2626',
  grid:      '#E5E5E5',   // neutral-200
  label:     '#A3A3A3',   // neutral-400
};
```

---

### 1.3 tailwind.config.js에 추가해야 할 토큰

작업 시작 전 아래 항목이 없으면 반드시 추가:

```js
// theme.extend.colors 안에 추가
neutral: {
  50:  '#FAFAFA',
  100: '#F5F5F5',
  200: '#E5E5E5',
  300: '#D4D4D4',
  400: '#A3A3A3',
  600: '#525252',
  900: '#171717',
},
error: '#DC2626',
```

---

## 2. 타이포그래피 (Typography)

**전략: 토스·당근 스타일 — 크고 두껍게, 계층이 명확하게**
폰트: Pretendard Variable 고정. 다른 폰트 추가 금지.

### 2.1 랜딩 페이지 전용 (임팩트 우선)

| 역할 | 적용 클래스 | 크기 | 굵기 |
|---|---|---|---|
| Hero H1 | `text-[72px] md:text-[96px] font-bold leading-[1.1] tracking-tight break-keep` | 72~96px | 700 |
| Section H2 | `text-[40px] md:text-[56px] font-bold leading-[1.2] tracking-tight break-keep` | 40~56px | 700 |
| Sub H3 | `text-[28px] md:text-[36px] font-semibold leading-[1.3] break-keep` | 28~36px | 600 |
| Lead (부제목) | `text-[18px] md:text-[20px] font-medium leading-relaxed break-keep` | 18~20px | 500 |
| Body | `text-body-4` | 16px | 400 |
| Caption | `text-caption` | 12px | 400 |

### 2.2 대시보드·기능 화면 (토큰 사용)

`text-head-1` ~ `text-head-5`, `text-body-1` ~ `text-body-7`, `text-caption` 클래스만 사용.
임의 크기(`text-[17px]`) 금지 — 필요하면 tailwind.config.js에 토큰 추가 후 사용.

### 2.3 핵심 원칙

- 한국어 표제에 `break-keep` 필수
- Hero 표제 기본 색: `text-text-main`, 브랜드 강조 단어만 `text-primary`
- bold(700) 요소는 한 화면에 3개 이하
- letter-spacing: 표제 `-0.02em` (tracking-tight) 고정

---

## 3. 간격 시스템 (Spacing)

### 3.1 랜딩 페이지 섹션 여백 (토스·당근 스타일 — 넉넉하게)

```
섹션 상하: py-32 (128px) 기본 / py-40 (160px) Hero·CTA
컨테이너: max-w-[1200px] mx-auto px-6
섹션 내 요소 간격: gap-8 md:gap-12
```

### 3.2 컴포넌트 내부 여백

| 요소 | 패딩 | Gap |
|---|---|---|
| 메인 카드 | `p-8` 큰 카드 / `p-6` 일반 | — |
| 내부 그룹 | `p-4` | `gap-3` |
| 섹션 내 카드들 | — | `gap-6 md:gap-8` |

### 3.3 Border Radius (라운드값)

| 값 | 사용 위치 |
|---|---|
| `rounded-[24px]` | 메인 카드, 모달, 큰 컨테이너 |
| `rounded-xl` (12px) | 버튼, 배지, 내부 카드 |
| `rounded-lg` (8px) | 작은 배지, 소형 요소 |
| `rounded-full` | 아바타, 원형 버튼, pill 배지 |

**금지:** 위 목록 외 임의 라운드값 (6px, 10px, 16px, 20px, 32px 등)

### 3.4 그림자

| 클래스 | 용도 |
|---|---|
| `shadow-soft` | 메인 카드 (PULSE 정의 그림자) |
| `shadow-sm` | 서브 카드, 배지 |
| `shadow-none` | 배경 구분만 있는 요소 |

`shadow-xl`, `shadow-2xl`은 CTA 버튼 1개에만 허용.

---

## 4. 컴포넌트 표준

### 4.1 Button — `.claude/skills/pulse-design/snippets/Button.jsx`

```
크기:
  lg  → h-11 (44px) px-8  text-btn-main   기본 CTA, 모바일 터치 최소
  md  → h-10 (40px) px-6  text-btn-sub    보조 행동
  sm  → h-8  (32px) px-4  text-caption    테이블 내, compact

variant:
  primary   → bg-primary text-white           핵심 CTA
  point     → bg-point text-white             생성·실행 행동 (릴스, 저장)
  secondary → bg-primary-tint text-primary    보조 행동
  ghost     → border border-primary-border    취소, 더보기
  danger    → bg-error text-white             삭제, 위험 행동

라운드: rounded-xl 고정
hover: transition-colors + transition-transform 각각 명시 (transition-all 금지)
disabled: opacity-40 cursor-not-allowed
loading: 스피너 아이콘 (무한 루프 예외)
```

### 4.2 Badge — `.claude/skills/pulse-design/snippets/Badge.jsx`

```
primary  → bg-primary-tint text-primary      기본 태그
point    → bg-point-bg text-point            행동 유도 태그
success  → bg-success/10 text-success        완료, 활성
warning  → bg-warning/10 text-warning        주의
neutral  → bg-neutral-100 text-neutral-600   비활성, 날짜, 메타

크기: sm(px-2 py-0.5 text-caption) / md(px-2.5 py-1 text-body-7)
라운드: rounded-lg (각형) 또는 rounded-full (pill)
```

### 4.3 Input — `.claude/skills/pulse-design/snippets/Input.jsx`

```
스타일: 하단 border만 (토스 스타일, 박스형 아님)
기본:   border-b-2 border-neutral-200
포커스: border-primary
에러:   border-error + text-error 힌트 텍스트
placeholder: text-neutral-400
label:  text-body-6 text-text-main
```

### 4.4 Card

```jsx
// Strong Box — 메인 (화면당 최대 3개)
<div className="bg-white rounded-[24px] p-8 shadow-soft">

// Soft Box — 서브 (화면당 최대 6개)
<div className="bg-neutral-50 rounded-xl p-6">

// 박스 없이 섹션 나누기 (박스 대체 우선 사용)
<div className="border-t border-neutral-200 pt-6">
```

**박스 중첩 절대 금지. Strong Box 한 화면 최대 3개.**

---

## 5. 애니메이션 가이드 (Animation Guide)

### 5.1 전체 원칙

```
주 라이브러리: framer-motion
랜딩 전용 추가: GSAP + ScrollTrigger (이미 설치됨)
지속시간: 진입 0.3s~0.5s / 오버레이 0.2s / 숫자 카운터 1.5s
easing: [0.22, 1, 0.36, 1] (커스텀 ease-out) 권장
useReducedMotion(): 모든 motion 컴포넌트에 필수 적용 (§5.5 참조)
```

**animate 허용 속성:** `transform`, `opacity` 만
**animate 금지 속성:** `width`, `height`, `top`, `left`, `padding`, `margin`
**전환 클래스:** `transition-all` 금지 → `transition-colors`, `transition-transform`, `transition-opacity` 각각 명시

---

### 5.2 승인된 애니메이션 — 랜딩 페이지

#### ① Split Text Stagger — Hero 표제 전용

단어 단위로 쪼개서 아래에서 솟아오르는 효과. 가장 임팩트 크고 토스 스타일과 맞음.

```jsx
// framer-motion 방식
const words = title.split(' ');
return (
  <h1>
    {words.map((word, i) => (
      <motion.span
        key={i}
        initial={shouldAnimate ? { opacity: 0, y: 24 } : false}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: i * 0.06, ease: [0.22, 1, 0.36, 1] }}
        className="inline-block mr-[0.25em]"
      >
        {word}
      </motion.span>
    ))}
  </h1>
);
```

#### ② Text Reveal — 스크롤 시 섹션 헤드라인 등장

```jsx
<motion.h2
  initial={shouldAnimate ? { opacity: 0, y: 24 } : false}
  whileInView={{ opacity: 1, y: 0 }}
  viewport={{ once: true, margin: '-80px' }}
  transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
/>
```

#### ③ Number Counter — 통계 숫자 카운트업

화면에 들어올 때 0에서 목표값까지 1.5초 동안 올라감. 신뢰 지표 섹션에 사용.

```jsx
import { useMotionValue, useTransform, animate, useInView } from 'framer-motion';

function CountUp({ target, suffix = '' }) {
  const shouldAnimate = !useReducedMotion();
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });
  const count = useMotionValue(0);
  const rounded = useTransform(count, (v) => Math.round(v).toLocaleString());

  useEffect(() => {
    if (isInView && shouldAnimate) {
      animate(count, target, { duration: 1.5, ease: 'easeOut' });
    } else if (isInView) {
      count.set(target);
    }
  }, [isInView]);

  return <motion.span ref={ref}>{rounded}{suffix}</motion.span>;
}
```

#### ④ Lenis Smooth Scroll — 전역 (이미 구현됨)

`LandingPage.jsx`에 구현 완료. 유지. `ScrollTrigger.update` 연결 유지.

#### ⑤ Bento Grid — Feature 섹션 레이아웃 패턴

애니메이션보다 레이아웃 패턴. 크기가 다른 카드를 CSS Grid로 배치하고, 각 카드는 stagger로 등장.

```jsx
// 2열 Bento 예시 (기능 소개 섹션)
<div className="grid grid-cols-1 md:grid-cols-2 gap-6 auto-rows-[280px]">
  <div className="md:row-span-2 rounded-[24px] ...">  {/* 큰 카드 */}
  <div className="rounded-[24px] ...">                {/* 작은 카드 */}
  <div className="rounded-[24px] ...">                {/* 작은 카드 */}
</div>
```

#### ⑥ SVG Path Drawing — How It Works 연결선 (선택)

GSAP ScrollTrigger + `stroke-dashoffset`. 선 굵기 1px, 색상 `border-neutral-200`. 과하면 제거.

---

### 5.3 금지 애니메이션

```
❌ Magnetic Cursor (자석 커서)
❌ Grain Noise / Noise Overlay     — CLAUDE.md 규칙 위반
❌ Cinematic Preloader             — 전환율 직결 타격
❌ RGB Glitch / Kinetic Typography — 브랜드와 불일치
❌ Particle Text, Constellation, Flow Field
❌ Gravity Physics, Water Ripple
❌ Velocity Skew, Mask Reveal
❌ 3D Rolling Text
❌ 무한 루프 (infinite glow, shimmer, pulse) — 로딩 spinner 예외
❌ Theme Transition (배경 반전)     — PULSE 톤 일관성 깨짐
```

---

### 5.4 2025-2026 추가 추천 패턴

**Stacked Scroll Cards** — How It Works 단계를 카드가 위로 쌓이며 올라오는 방식으로 표현. Raycast·Framer 스타일.

```jsx
// GSAP ScrollTrigger pin + stagger 방식
// 각 카드가 pin된 상태에서 다음 카드가 위로 올라와 쌓임
// 구현 복잡도 높음 — 랜딩 리디자인 시 Feature 또는 How It Works에만 적용
```

**Scroll Progress Bar** — 페이지 상단에 스크롤 진행률 표시하는 얇은 선 (primary 색상).

---

### 5.5 useReducedMotion 적용 — 모든 animation 컴포넌트 필수

```jsx
import { useReducedMotion } from 'framer-motion';

function AnimatedComponent() {
  const shouldAnimate = !useReducedMotion();

  return (
    <motion.div
      initial={shouldAnimate ? { opacity: 0, y: 20 } : false}
      animate={{ opacity: 1, y: 0 }}
      transition={shouldAnimate ? { duration: 0.4, ease: [0.22, 1, 0.36, 1] } : { duration: 0 }}
    />
  );
}
```

---

## 6. 화면 유형별 레이아웃 패턴

### 6.1 랜딩 페이지 (밀도 4~6)

```
전체 배경: bg-bg-page
섹션 배경 교차: bg-white ↔ bg-neutral-50 ↔ bg-bg-page (단색, 그라디언트 남발 금지)
헤더: sticky top-0 z-50 bg-white/90 backdrop-blur-sm (고정 메뉴)
섹션 여백: py-32 기본 / py-40 Hero·CTA / py-24 소형 섹션
컨테이너: max-w-[1200px] mx-auto px-6
```

**권장 섹션 순서:**
1. Hero — 대형 표제 + CTA 2개 + ThreeBackground (우측)
2. Problem — 사장님 공감 고민 3가지
3. Feature — Bento Grid 기능 소개 (실제 화면 스크린샷 포함)
4. How It Works — 4단계 (Stacked Cards 또는 Step 순서)
5. Social Proof — Number Counter 지표 + 후기 3개
6. FAQ — 아코디언 Q&A
7. CTA — 최종 행동 유도 (single CTA)
8. Footer

**ThreeBackground 규칙:**
- Hero 우측 배치: `position` prop으로만 조정
- 크기 조정: `scale` prop으로만
- `ThreeBackground.jsx` 내부 코드 수정 절대 금지

**`h-screen` 금지 → `min-h-dvh` 사용**

### 6.2 대시보드 (밀도 6~8)

```
배경: bg-bg-page
카드: bg-white shadow-soft
Strong Box 최대 3개 (Hero 1 + AI primary 1 + Operational 최대 2)
좌측 pane: overflow-hidden 강제 (overflow-y-auto 절대 금지)
No Scroll: 1440×900, 1280×800 양쪽 무스크롤 확인
```

### 6.3 인증 페이지 (밀도 4~5)

```
Split 50:50 (좌: ThreeBackground 브랜드 / 우: 폼)
우측: bg-white p-12
ThreeBackground: 좌측 전체 (기존 구현 유지)
```

### 6.4 마이페이지 (밀도 5~6)

```
Strong Box 최대 3개 (기존 규칙 유지)
모바일 반응형 필수
배너 금지
```

---

## 7. "AI처럼 보이지 않기" — 금지 패턴 20가지

**색상**
1. ❌ 보라색 그라디언트 + 흰 텍스트 — 가장 흔한 AI 디자인
2. ❌ 모든 섹션에 배경 그라디언트 — 단색·미세 톤 차이만
3. ❌ 같은 색을 3가지 방식으로 표현 — 토큰 하나로 통일

**레이아웃**
4. ❌ 모든 섹션에 동일한 좌우 교차 블록 — 레이아웃 변화 필요
5. ❌ 카드 남발 (화면당 4개+) — Strong Box 3개 이하
6. ❌ 카드 안에 카드 중첩 — 절대 금지
7. ❌ 모든 요소 가운데 정렬 — 좌정렬과 혼합으로 리듬 생성

**타이포그래피**
8. ❌ Hero 표제가 너무 작음 (32px 이하) — 최소 64px
9. ❌ 모든 텍스트 같은 굵기 — 굵기 대비 필요
10. ❌ 긴 서술형 부제목 — 짧고 임팩트 있게 (1~2줄)

**버튼·인터랙션**
11. ❌ 한 섹션에 CTA 버튼 3개+ — 최대 2개
12. ❌ 모든 버튼이 primary — 주 행동만 primary, 나머지는 ghost
13. ❌ hover 효과 없음 — 모든 클릭 요소에 시각적 반응 필수

**애니메이션**
14. ❌ 모든 요소에 fade-in — 표제·핵심 요소만
15. ❌ 애니메이션 1초+ — 0.3~0.5초 이내
16. ❌ 무한 반짝임·펄스 — 완전 금지

**이미지·아이콘**
17. ❌ 이모지를 UI 아이콘으로 — Lucide만
18. ❌ "이미지 영역" placeholder — 실제 스크린샷 또는 CSS UI 컴포넌트
19. ❌ 아이콘 크기 제각각 — 동일 컨텍스트에서 16px / 20px / 24px 통일

**일관성**
20. ❌ 섹션마다 다른 색·폰트·라운드값 — 이 스킬 규칙 처음부터 끝까지 동일 적용

---

## 8. 작업 후 자가점검 체크리스트

**색상**
- [ ] 모든 색이 §1.1 허용 목록 안에 있는가?
- [ ] `style={{ color: '#...' }}`가 없는가?
- [ ] 차트 색상이 `CHART_COLORS` 상수로 관리되는가?

**타이포그래피**
- [ ] Hero 표제가 최소 64px(모바일) / 80px+(데스크탑)인가?
- [ ] 임의 크기(`text-[17px]`)를 쓰지 않았는가?
- [ ] 한국어 표제에 `break-keep`이 있는가?

**레이아웃**
- [ ] Strong Box가 3개 이하인가?
- [ ] 박스 중첩이 없는가?
- [ ] 대시보드라면 좌측 pane이 `overflow-hidden`인가?
- [ ] `h-screen` 대신 `min-h-dvh`를 썼는가?

**컴포넌트**
- [ ] 버튼 높이가 44px / 40px / 32px 중 하나인가?
- [ ] 라운드값이 24px / 12px / 8px / full 중 하나인가?
- [ ] 버튼 hover에 `transition-all` 대신 개별 transition을 썼는가?

**애니메이션**
- [ ] 모든 motion 컴포넌트에 `useReducedMotion()`이 있는가?
- [ ] `transition-all`을 쓰지 않았는가?
- [ ] 무한 루프 애니메이션이 없는가?
- [ ] 승인된 애니메이션(§5.2) 외 다른 효과를 쓰지 않았는가?

**최종**
- [ ] `npm run lint` 통과
- [ ] `npm run build` 통과
- [ ] 1440×900, 1280×800 양쪽에서 UI 확인 (랜딩은 스크롤 허용)

---

## 9. 파일 경로 빠른 참조

```
디자인 토큰:        tailwind.config.js
색상 상수:          src/constants/index.js
전역 스타일:        src/styles/globals.css
디자인 가이드:      MD/design_guide.md
공통 UI 컴포넌트:   src/components/ui/
3D 배경 (수정 금지): src/features/auth/ThreeBackground.jsx
버튼 표준:          .claude/skills/pulse-design/snippets/Button.jsx
배지 표준:          .claude/skills/pulse-design/snippets/Badge.jsx
입력창 표준:        .claude/skills/pulse-design/snippets/Input.jsx
```
