# PULSE 랜딩 페이지 전면 리디자인 — 구현 스펙

> **작성일**: 2026-06-01  
> **상태**: 최종 확정 (코드 작업 전 이 문서를 완전히 읽을 것)  
> **북극성**: 제품 가치 전달 — "사장님이 PULSE가 뭘 해주는지 즉시 이해"  
> **기준 문서**: `MD/about_pulse.md`, `MD/design_guide.md`, `.claude/skills/pulse-design/SKILL.md`

---

## 0. 작업 시작 전 필수 절차 (Pre-flight)

### 0.1 반드시 먼저 읽을 파일
```
1. .claude/skills/pulse-design/SKILL.md   ← 디자인 바이블. 이 파일 없이 코드 작성 금지
2. tailwind.config.js                      ← 토큰 확인 (neutral, error 이미 존재)
3. src/components/ui/Button.jsx            ← 재사용 컴포넌트
4. src/components/ui/Badge.jsx             ← 재사용 컴포넌트
5. src/pages/LandingPage.jsx               ← 현재 구조 파악
```

### 0.2 절대 수정 금지 파일
```
- src/features/auth/ThreeBackground.jsx   (position, scale prop만 허용)
- src/components/ui/Button.jsx
- src/components/ui/Badge.jsx
- src/components/ui/Input.jsx
- dist/ 디렉터리 전체
- .env 파일
```

### 0.3 애니메이션 제약 (CLAUDE.md 강제 규칙)
```
✅ animate 허용: transform (translate, scale, rotate), opacity
❌ animate 금지: width, height, top, left, padding, margin, borderRadius (GSAP scrub 제외)
❌ transition-all 금지 → transition-colors, transition-transform, transition-opacity 각각 명시
❌ 무한 루프 애니메이션 금지 (rotate 360은 1회성만, loading spinner 예외)
✅ 모든 motion 컴포넌트에 useReducedMotion() 분기 필수
✅ GSAP ScrollTrigger scrub 애니메이션: borderRadius + clipPath는 GPU 가속, layout 비영향이므로 허용
```

### 0.4 색상 사용 규칙
```
Primary:       bg-primary / text-primary (#002B7A)
Point (CTA):   bg-point / text-point (#FF5A36CC) — 핵심 CTA 버튼에만
Neutral:       bg-neutral-50 ~ text-neutral-900
배경:          bg-bg-page (#F5F7FA) / bg-white / bg-neutral-50
텍스트:        text-text-main (#191F28) / text-neutral-600 / text-neutral-400

❌ 임의 Hex 직접 입력 금지 (style={{ color: '#...' }})
❌ 외부 팔레트 (slate, zinc, gray) 직접 사용 금지
⚠️  Feature 좌측 패널 opacity 변화: bg-primary/85, bg-primary/70 등 Tailwind opacity 수식어 사용
```

---

## 1. 최종 섹션 구조 (스크롤 순서)

| 순서 | 섹션 | 파일 | 배경 | 상태 |
|---|---|---|---|---|
| — | ScrollProgress | `ScrollProgress.jsx` (신규) | primary 3px 바 | 신규 |
| — | Header | `Header.jsx` (수정) | white/90 blur | 수정 |
| 1 | Hero | `HeroSection.jsx` (수정) | bg-bg-page | 수정 |
| 2 | Problem | `ProblemSection.jsx` (수정) | bg-neutral-50 | 라이트로 전환 |
| 3 | Showcase | `ShowcaseSection.jsx` (신규) | bg-white | 신규 |
| 4 | Feature | `FeatureSection.jsx` (전면 재구성) | left:primary / right:white | 전면 재구성 |
| 5 | HowItWorks | `HowItWorksSection.jsx` (수정) | bg-neutral-50 | 유지+소폭수정 |
| 6 | Comparison | `ComparisonSection.jsx` (신규) | bg-white | 신규 |
| 7 | Trust | `SocialProofSection.jsx` (재작성) | bg-neutral-50 | 전면 재작성 |
| 8 | FAQ | `FAQSection.jsx` (수정) | bg-white | 애니메이션 수정 |
| 9 | CTA | `CTASection.jsx` (수정) | bg-primary | 수정 |
| — | Footer | `Footer.jsx` (유지) | bg-neutral-50 | 무수정 |

---

## 2. 신규 생성 파일 목록

```
src/components/landing/ScrollProgress.jsx
src/components/landing/ShowcaseSection.jsx
src/components/landing/ComparisonSection.jsx
src/components/landing/mockups/InsightMockup.jsx
src/components/landing/mockups/ReelsMockup.jsx
src/components/landing/mockups/DashboardMockup.jsx
src/components/landing/mockups/ReviewMockup.jsx
src/components/landing/mockups/InfluencerMockup.jsx
src/components/landing/mockups/index.js
```

---

## 3. 섹션별 상세 스펙

---

### 3.0 ScrollProgress

**파일**: `src/components/landing/ScrollProgress.jsx`  
**위치**: `LandingPage.jsx`에서 `<Header />` 위에 마운트

**구현 스펙**:
```jsx
// window.scrollY / (document.documentElement.scrollHeight - window.innerHeight) 로 0~1 계산
// position: fixed, top: 0, left: 0, right: 0, z-index: 60 (header z-50 위)
// height: 3px
// background: bg-primary
// transform: scaleX(progress), transformOrigin: left
// transition 없음 — requestAnimationFrame 또는 scroll 이벤트로 직접 업데이트
// useReducedMotion() → true면 렌더하지 않음
```

---

### 3.1 Header (수정)

**파일**: `src/components/landing/Header.jsx`

**변경사항**: 현재 코드 유지, 아래만 확인
- `sticky top-0 z-50` 유지
- `bg-white/90 backdrop-blur-sm border-b border-neutral-200` 유지
- 로그인 버튼(`variant="ghost"`) + 회원가입 버튼(`variant="primary"`) 항상 표시 — 조건부 숨김 없음
- 모바일에서도 두 버튼 모두 표시 (`flex items-center gap-3` 유지)
- 로고 클릭 → `navigate('/')` 유지

**반응형**:
- Mobile: 로고 + 버튼 2개 (gap-2로 좁힘)
- 버튼 텍스트: 모바일에서 "로그인" / "시작하기"로 축약 검토 (현재 텍스트 유지도 무방)

---

### 3.2 HeroSection (수정)

**파일**: `src/components/landing/HeroSection.jsx`

**배경**: `bg-bg-page`  
**높이**: `min-h-dvh` (h-screen 금지)

**레이아웃**: `grid grid-cols-1 md:grid-cols-2 gap-12 items-center`

**좌측 콘텐츠**:

```
H1 (text-[64px] md:text-[88px] font-bold leading-[1.1] tracking-tight break-keep text-text-main):
  "고객 분석부터 홍보 영상까지,"
  "PULSE가 사장님 대신 해드립니다."
  → "PULSE가" 단어만 text-primary로 강조

부제 (text-[18px] md:text-[20px] font-medium text-neutral-600 leading-relaxed break-keep):
  "외식업 사장님을 위한 AI 마케팅 자동화 플랫폼."
  "손님을 알고, 영상을 만들고, 성과를 확인합니다."

CTA 버튼 (flex flex-wrap gap-4):
  1. Button size="lg" variant="primary" → "무료로 시작하기" → navigate('/signup')
  2. Button size="lg" variant="ghost" → "더 알아보기" → scrollIntoView('#problem-section')
```

**우측 콘텐츠** (현재 빈 div → AI 인사이트 카드 목업 추가):
```jsx
// ThreeBackground는 absolute inset-0 z-0로 유지 (수정 금지)
// 우측 div에 z-10 relative로 미니 카드 추가

// AI 인사이트 카드 목업 (entrance 1회 애니메이션)
<motion.div
  initial={shouldAnimate ? { opacity: 0, y: 32, scale: 0.96 } : false}
  animate={{ opacity: 1, y: 0, scale: 1 }}
  transition={{ duration: 0.6, delay: 0.8, ease: [0.22, 1, 0.36, 1] }}
  className="hidden md:block bg-white/90 backdrop-blur-sm rounded-[24px] p-6 shadow-soft border border-neutral-200"
>
  // 내용: PULSE AI 인사이트 미니 카드
  // "AI 오늘의 제안" + Sparkles 아이콘
  // "퇴근길 직장인 타겟 영상을 만들어보세요!"
  // 하단: 3개 mini stat (방문자 +12%, 검색량 +8%, 영상 3개)
  // bg-primary 액센트 색상, 오렌지 수치 강조
</motion.div>
```

**애니메이션**:
- H1: Split text stagger (단어 단위, 기존 AnimatedLine 유지)
- 부제: opacity 0→1, y 16→0, delay = totalWords * 0.07 + 0.1
- CTA: opacity 0→1, y 16→0, delay = totalWords * 0.07 + 0.2
- AI 카드: opacity 0→1, y 32→0, scale 0.96→1, delay 0.8s (1회 entrance)
- 모두 `useReducedMotion()` 분기

**반응형**:
- Mobile: single column, H1 48px, AI 카드 hidden (md:block)
- Tablet+: 2 column grid

---

### 3.3 ProblemSection (수정)

**파일**: `src/components/landing/ProblemSection.jsx`

**배경**: `bg-neutral-50` ← 기존 `bg-primary` 에서 변경 (다크 제거)  
**여백**: `py-32 px-6`

**헤드라인** (`text-[36px] md:text-[52px] font-bold text-text-main leading-[1.2] tracking-tight break-keep`):
```
"사장님은 마케팅이 필요한 걸 아십니다.
다만 실행할 여력이 없을 뿐입니다."
```

**서브** (`text-[18px] text-neutral-600 break-keep`):
```
"마케팅 지식, 시간, 비용, 신뢰할 전문가. 네 가지가 모두 부족합니다."
```

**카드 4개** (`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mt-16`):

각 카드: `bg-white rounded-[24px] p-8 shadow-soft border border-neutral-200`

```
카드 1 — 시간
  아이콘: Clock (Lucide, 24px, text-primary)
  수치: "하루 10시간+"
  수치색: text-primary text-[40px] font-bold
  레이블: "평균 근무 시간"  text-body-6 text-text-main
  공감 멘트: "장사 끝나면 기진맥진인데, 마케팅은 언제 해요?"
  멘트색: text-body-7 text-neutral-600 leading-relaxed
  출처 캡션: "소상공인시장진흥공단 실태조사 기반" text-caption text-neutral-400 mt-3

카드 2 — 비용
  아이콘: DollarSign (Lucide, 24px, text-primary)
  수치: "최대 30%"
  레이블: "플랫폼 수수료 부담"
  공감 멘트: "돈 버는 건지 플랫폼 좋으라고 하는 건지 모르겠어요."
  출처: "배달 플랫폼 수수료 현황 기반"

카드 3 — 전문성
  아이콘: AlertTriangle (Lucide, 24px, text-primary)
  수치: "10명 중 8명"
  레이블: "SNS 운영 어렵다고 응답"
  공감 멘트: "사진·편집·문구까지, 저 혼자서는 도저히 못 해요."
  출처: "자영업자 디지털 마케팅 실태조사 기반"

카드 4 — 신뢰
  아이콘: ShieldAlert (Lucide, 24px, text-primary)  ← 기존 TrendingUp 교체
  수치: "매년 증가"
  레이블: "광고 대행 사기 피해"
  공감 멘트: "믿고 맡길 데가 없으니 혼자 다 감당해야 해요."
  출처: "공정거래위원회 소비자 피해 현황 기반"
```

**애니메이션**:
- 헤드라인: whileInView opacity 0→1, y 24→0, viewport once: true
- 카드: whileInView stagger (delay i * 0.08), opacity 0→1, y 20→0
- `useReducedMotion()` 분기

**반응형**:
- Mobile: 1열
- sm (640px): 2열
- lg (1024px): 4열

---

### 3.4 ShowcaseSection (신규)

**파일**: `src/components/landing/ShowcaseSection.jsx`

**배경**: `bg-white`  
**여백**: `py-24` (헤드라인) + 이미지 섹션 여백 없음 (풀블리드 확장)

#### 3.4.1 구조

```
Section (bg-white)
├── 헤드라인 (max-w-[1200px] mx-auto px-6 mb-16)
│   └── H2: "사장님의 하루가 달라집니다."
│
├── 메인 이미지 컨테이너 (showcase-clip-container)
│   ├── 이미지: public/showcase-main.webp
│   └── 후킹 멘트 오버레이 (absolute, image 하단 28%)
│
├── 서브 이미지 3개 (max-w-[1200px] mx-auto px-6 mt-8)
│   ├── sub1: public/showcase-sub1.webp
│   ├── sub2: public/showcase-sub2.webp
│   └── sub3: public/showcase-sub3.webp
│
└── 하단 텍스트 (max-w-[760px] mx-auto px-6 mt-16)
    ├── "손님이 늘고, 영상이 퍼지고, 성과가 쌓입니다."
    └── "잘하지 않아도 됩니다. PULSE가 돌아가면 홍보는 알아서 됩니다."
```

#### 3.4.2 헤드라인

```
H2 (text-[40px] md:text-[56px] font-bold text-text-main leading-[1.2] tracking-tight break-keep):
  "사장님의 하루가"
  "달라집니다."
→ 좌정렬 (text-left)
→ whileInView entrance: opacity 0→1, y 24→0
```

#### 3.4.3 메인 이미지 — 토스 스크롤 확장 효과

```jsx
// 이미지가 없을 경우: bg-neutral-200 + 동일 aspect-ratio placeholder 사용
// 이미지 경로: /showcase-main.webp (public 폴더)

// HTML 구조
<div ref={showcaseRef} className="showcase-clip-container relative w-full overflow-hidden">
  <img
    src={`${import.meta.env.BASE_URL}showcase-main.webp`}
    alt="사장님이 카페에서 PULSE 대시보드를 확인하는 모습"
    className="w-full object-cover"
    style={{ aspectRatio: '16/9' }}
    onError={(e) => {
      e.target.style.display = 'none';
      // placeholder div 표시
    }}
  />
  // 후킹 멘트 오버레이
  <div className="absolute bottom-[28%] left-0 right-0 flex justify-center">
    <motion.div
      initial={shouldAnimate ? { opacity: 0, y: 16 } : false}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
      className="bg-black/40 backdrop-blur-sm rounded-[24px] px-8 py-4"
    >
      <p className="text-[18px] md:text-[22px] font-bold text-white text-center break-keep">
        사장님 대신 마케팅이 돌아가고 있습니다
      </p>
    </motion.div>
  </div>
</div>

// GSAP ScrollTrigger — LandingPage.jsx의 useEffect 내 또는 ShowcaseSection 내부 useEffect
// (GSAP는 이미 LandingPage에서 import됨. 섹션 내 useEffect에서 추가 등록 가능)
useEffect(() => {
  if (!showcaseRef.current || shouldAnimate === false) return;

  const anim = gsap.fromTo(
    showcaseRef.current,
    { clipPath: 'inset(0 12% round 24px)' },
    {
      clipPath: 'inset(0 0% round 0px)',
      ease: 'none',
      scrollTrigger: {
        trigger: showcaseRef.current,
        start: 'top 85%',
        end: 'center 30%',
        scrub: 1.5,
      },
    }
  );

  return () => {
    anim.scrollTrigger?.kill();
    anim.kill();
  };
}, [shouldAnimate]);
```

**이미지 없을 때 Placeholder**:
```jsx
// showcase-main.webp 없을 때
<div
  className="w-full bg-gradient-to-br from-primary-tint to-neutral-100"
  style={{ aspectRatio: '16/9' }}
>
  <div className="w-full h-full flex items-center justify-center">
    <p className="text-neutral-400 text-body-6">showcase-main.webp를 public/에 추가하세요</p>
  </div>
</div>
```

#### 3.4.4 서브 이미지 3개

```jsx
// grid grid-cols-1 md:grid-cols-3 gap-4 mt-8 max-w-[1200px] mx-auto px-6

// 각 이미지
[
  { src: 'showcase-sub1.webp', alt: 'AI 손님 분석 화면', label: '손님 분석 AI' },
  { src: 'showcase-sub2.webp', alt: '음식 촬영 장면', label: '홍보 영상 제작' },
  { src: 'showcase-sub3.webp', alt: '손님들이 카페로 들어오는 장면', label: '가게 성과' },
]

// 각 서브 이미지 애니메이션 (framer-motion)
<motion.div
  initial={shouldAnimate ? { opacity: 0, y: 40 } : false}
  whileInView={{ opacity: 1, y: 0 }}
  viewport={{ once: true, margin: '-60px' }}
  transition={{ duration: 0.6, delay: index * 0.12, ease: [0.22, 1, 0.36, 1] }}
  className="rounded-[24px] overflow-hidden aspect-[4/3]"
>
  <img src={...} alt={...} className="w-full h-full object-cover" />
</motion.div>
```

#### 3.4.5 하단 스크롤 페이드 텍스트

```
// GSAP ScrollTrigger scrub (opacity + y — transform/opacity만 사용 ✓)
// 텍스트가 viewport 진입 시 연한 상태(opacity 0.08)에서 진하게(opacity 1) 변함

텍스트 1 (text-[28px] md:text-[40px] font-bold text-text-main break-keep):
  "손님이 늘고, 영상이 퍼지고,
  성과가 쌓입니다."

텍스트 2 (text-[16px] md:text-[18px] text-neutral-600 leading-relaxed break-keep mt-4):
  "잘하지 않아도 됩니다.
  PULSE가 돌아가면 홍보는 알아서 됩니다."

// GSAP 구현
const textRefs = [text1Ref, text2Ref];
textRefs.forEach((ref, i) => {
  gsap.fromTo(ref.current,
    { opacity: 0.08, y: 28 },
    {
      opacity: 1, y: 0,
      scrollTrigger: {
        trigger: ref.current,
        start: 'top 92%',
        end: 'top 48%',
        scrub: 1,
      }
    }
  );
});
```

**반응형**:
- Mobile: 이미지 clip-path 확장 비활성 (shouldAnimate 조건과 별도로, 모바일 뷰포트에서는 clipPath 시작값도 `inset(0 0% round 0px)` 로 시작)
- 서브 이미지: 1열 (모바일), 3열 (md+)

---

### 3.5 FeatureSection (전면 재구성 — 카카오 스타일)

**파일**: `src/components/landing/FeatureSection.jsx`

**전체 구조**: 2열 고정 분할 (좌측 sticky + 우측 스크롤)

#### 3.5.1 기능 데이터 (순서 변경, 좌측 배경 opacity 5단계)

```javascript
const FEATURES = [
  {
    id: 'insight',
    badge: '손님 분석',
    badgeVariant: 'primary',
    icon: Users,
    title: '손님이 뭘 좋아하는지\nAI가 파악합니다.',
    description: '주변 상권 데이터와 리뷰를 분석해 손님 페르소나와 마케팅 포인트를 도출합니다. 어떤 메뉴를 누구에게 어떻게 알릴지 정확히 알려드립니다.',
    points: ['주변 상권·유동인구·키워드 분석', '리뷰 기반 페르소나·니즈 도출', '마케팅 포인트 자동 추출'],
    leftBg: 'bg-primary',          // opacity 1.0 — 가장 진한 네이비
    MockupComponent: InsightMockup,
  },
  {
    id: 'reels',
    badge: '홍보 영상 만들기',
    badgeVariant: 'primary',
    icon: PlayCircle,
    title: '사진을 업로드하면\n숏폼 영상 완성.',
    description: '분석된 인사이트를 반영해 AI가 음악, 자막, 장면 구성까지 자동으로 만들어드립니다. 편집 기술이 전혀 없어도 됩니다.',
    points: ['페르소나 기반 영상 스타일 자동 설정', '음악·자막·장면 구성 AI 제안', '9:16 숏폼 영상 원스톱 생성'],
    leftBg: 'bg-primary/85',       // opacity 0.85
    MockupComponent: ReelsMockup,
  },
  {
    id: 'dashboard',
    badge: '가게 현황',
    badgeVariant: 'primary',
    icon: LayoutDashboard,
    title: '성과 확인 후\n다음 행동을 알려드립니다.',
    description: '검색량·방문·영상 성과를 한눈에 보고, AI가 지금 당장 해야 할 구체적인 미션을 제안합니다.',
    points: ['검색량·방문·영상 성과 통합 확인', 'AI 추천 미션 (다음 행동) 제시', '홍보 루프 지속 유지'],
    leftBg: 'bg-primary/70',       // opacity 0.70
    MockupComponent: DashboardMockup,
  },
  {
    id: 'review',
    badge: '리뷰 관리 & 답변',
    badgeVariant: 'neutral',
    icon: MessageSquare,
    title: '리뷰 모니터링부터\nAI 답변 제안까지.',
    description: '고객 리뷰를 감정 분석하고, 맥락에 맞는 답변을 AI가 제안해 고객 소통을 효율화합니다.',
    points: ['리뷰 실시간 모니터링', '감정 분석 및 핵심 키워드 추출', 'AI 맞춤 답변 제안'],
    leftBg: 'bg-primary/55',       // opacity 0.55
    MockupComponent: ReviewMockup,
  },
  {
    id: 'influencer',
    badge: '인플루언서 매칭',
    badgeVariant: 'point',
    icon: Star,
    title: '가게에 딱 맞는\n인플루언서를 연결합니다.',
    description: '가게 특성과 손님 페르소나에 맞는 인플루언서를 추천하고, 협찬 매칭까지 도와드립니다.',
    points: ['가게 특성 기반 인플루언서 추천', '협찬 조건 조율 및 매칭 지원', '홍보 효과 사후 분석'],
    leftBg: 'bg-primary/40',       // opacity 0.40 — 가장 연한
    MockupComponent: InfluencerMockup,
    isPro: true,
  },
];
```

#### 3.5.2 Intersection Observer 기반 활성 상태 관리

```javascript
// 각 우측 섹션에 ref 배열 연결
// useIntersectionObserver: threshold 0.5로 50% 이상 보일 때 active
// activeIndex state가 변하면 → 좌측 패널 배경색 transition-colors duration-700
```

#### 3.5.3 좌측 패널 (Sticky, 카카오 스타일)

```jsx
// 구조: Section 전체가 flex, 좌측은 sticky
<div className="sticky top-0 h-dvh flex-shrink-0 w-[280px] md:w-[320px] flex flex-col justify-center px-10 md:px-12"
  style={{ /* leftBg는 inline style로 적용 불가 — Tailwind 클래스만 사용 */}}
  // ⚠️ leftBg는 FEATURES[activeIndex].leftBg 클래스로 동적 적용
  // className에 leftBg 삽입: className={`sticky top-0 ... ${FEATURES[activeIndex].leftBg} transition-colors duration-700`}
>
  // 섹션 레이블
  <p className="text-[11px] font-bold text-white/40 tracking-[0.25em] uppercase mb-8">
    PULSE 기능
  </p>

  // 네비게이션 목록
  {FEATURES.map((f, i) => {
    const isActive = activeIndex === i;
    return (
      <button
        key={f.id}
        onClick={() => scrollToFeature(i)}
        className={[
          'flex items-center gap-3 text-left py-3 w-full',
          'transition-opacity duration-300',
          isActive ? 'opacity-100' : 'opacity-40 hover:opacity-70',
        ].join(' ')}
      >
        // 화살표 (활성 시만 표시)
        {isActive && (
          <ChevronRight size={16} className="text-white flex-shrink-0" />
        )}
        {!isActive && <div className="w-4 flex-shrink-0" />}

        // 기능명
        <span className={[
          'break-keep',
          isActive
            ? 'text-[16px] font-bold text-white'
            : 'text-[15px] font-medium text-white',
        ].join(' ')}>
          {f.badge}
          {f.isPro && (
            <span className="ml-2 text-[10px] bg-white/20 text-white px-2 py-0.5 rounded-full">Pro</span>
          )}
        </span>
      </button>
    );
  })}
</div>
```

#### 3.5.4 우측 패널 (스크롤 콘텐츠)

```jsx
// 우측: flex-1 bg-white
// 각 기능 섹션: min-h-dvh flex items-center px-12 md:px-16 py-20

{FEATURES.map((f, i) => (
  <div
    key={f.id}
    ref={featureRefs[i]}
    className="min-h-dvh flex items-center px-10 md:px-16 py-20 bg-white"
  >
    <div className="max-w-[600px]">
      // Badge
      <Badge variant={f.badgeVariant} size="md" icon={f.icon} className="mb-5">
        {f.badge}
      </Badge>

      // H3
      <h3 className="text-[28px] md:text-[36px] font-semibold text-text-main leading-[1.3] break-keep mb-4 whitespace-pre-line">
        {f.title}
      </h3>

      // Description
      <p className="text-body-4 text-neutral-600 leading-relaxed break-keep mb-6">
        {f.description}
      </p>

      // Points
      <ul className="flex flex-col gap-2 mb-10">
        {f.points.map(p => (
          <li key={p} className="flex items-center gap-2 text-body-7 text-neutral-600">
            <span className="w-1.5 h-1.5 rounded-full bg-primary flex-shrink-0" />
            {p}
          </li>
        ))}
      </ul>

      // CSS 목업 컴포넌트
      <f.MockupComponent />
    </div>
  </div>
))}
```

#### 3.5.5 Feature 헤드라인 (섹션 상단)

```
// Feature 섹션 전체를 감싸는 wrapper 위에 별도 헤드라인 섹션 추가
// bg-white, py-24, max-w-[1200px]

H2: "사장님이 직접 하실 필요 없어요."
서브: "분석부터 영상 제작, 성과 관리까지 — PULSE가 다 해드립니다."
```

**반응형**:
- Mobile (< 768px):
  - 좌측 sticky 패널 → `w-full h-auto py-4 sticky top-[57px]` (header 아래 고정)
  - 좌측 패널 내용: horizontal scrollable nav tabs (flex-row overflow-x-auto)
  - 우측: `min-h-auto py-16` (전체 높이 불필요)
- Tablet (768px-1024px): 좌측 `w-[240px]`
- Desktop (1024px+): 좌측 `w-[320px]`

---

### 3.6 HowItWorksSection (소폭 수정)

**파일**: `src/components/landing/HowItWorksSection.jsx`

**배경**: `bg-neutral-50` (유지)

**변경사항**: 기존 구조 유지, 아래만 수정
- `transition`이 있는 곳 확인 후 `transition-all` 제거
- 루프 뱃지의 `rotate: 360` — 기존 코드 확인, 이미 1회성이면 유지

**유지 사항**: STEPS 3개, Connector, 루프 뱃지, 모든 애니메이션 기존 그대로

---

### 3.7 ComparisonSection (신규)

**파일**: `src/components/landing/ComparisonSection.jsx`

**배경**: `bg-white`  
**여백**: `py-32 px-6`

**헤드라인**:
```
H2 (text-[40px] md:text-[52px] font-bold text-text-main tracking-tight break-keep):
  "혼자 할 때와"
  "PULSE와 함께할 때"
```

**대비표 레이아웃** (`grid grid-cols-1 md:grid-cols-2 gap-0 mt-16 rounded-[24px] overflow-hidden border border-neutral-200`):

```
┌───────────────────────┬───────────────────────┐
│  혼자 마케팅          │  PULSE와 함께          │
│  (bg-neutral-50)      │  (bg-white)            │
├───────────────────────┼───────────────────────┤
│ ✕ 매일 3시간 SNS 고민 │ ✓ AI가 콘텐츠 방향 제안│
│ ✕ 편집 전문가 필요    │ ✓ 사진 업로드만으로 영상│
│ ✕ 손님 파악 불가      │ ✓ 리뷰 기반 페르소나    │
│ ✕ 광고비 낭비         │ ✓ 타겟 기반 홍보        │
│ ✕ 성과 측정 어려움    │ ✓ 대시보드 한눈에 확인  │
└───────────────────────┴───────────────────────┘
```

**구체 구현**:
```jsx
// 좌측 헤더: "혼자 마케팅" — text-neutral-600 font-semibold, bg-neutral-100 p-6
// 우측 헤더: "PULSE와 함께" — text-primary font-bold, bg-primary-tint p-6

// 비교 항목 5개
const COMPARISONS = [
  { bad: '매일 몇 시간씩 SNS 고민', good: 'AI가 오늘 올릴 콘텐츠 방향을 제안' },
  { bad: '편집 기술 없으면 영상 불가', good: '사진 업로드만으로 숏폼 영상 완성' },
  { bad: '손님이 뭘 좋아하는지 감이 없음', good: '리뷰 기반 손님 페르소나 즉시 파악' },
  { bad: '어디에 광고해야 할지 몰라 낭비', good: '타겟 기반으로 효율적인 홍보 실행' },
  { bad: '홍보 성과를 알 수가 없음', good: '대시보드에서 성과 한눈에 확인' },
];

// 각 행: grid grid-cols-2
// 좌측 셀: X 아이콘(text-neutral-400) + text-body-4 text-neutral-600, bg-neutral-50, border-b border-r border-neutral-200 p-5
// 우측 셀: ✓ 아이콘(text-success) + text-body-4 text-primary, bg-white, border-b border-neutral-200 p-5
```

**하단 포지셔닝 문구** (`mt-16 text-center`):
```
p (text-[18px] md:text-[22px] font-semibold text-text-main break-keep):
  "PULSE는 홍보 도구가 아닙니다."

p (text-[16px] text-neutral-600 mt-2):
  "사장님 가게의 마케팅 운영체제입니다."
```

**애니메이션**:
- 헤드라인: whileInView opacity 0→1, y 24→0
- 대비표 전체: whileInView opacity 0→1, y 20→0, delay 0.2s
- 각 행: stagger delay (i * 0.05)

**반응형**:
- Mobile: 2열 그리드 유지 (각 셀 텍스트 줄어들어도 의미 전달 가능)
- 텍스트가 너무 길면 모바일에서 `text-body-7`로 축소

---

### 3.8 Trust (SocialProofSection 재작성)

**파일**: `src/components/landing/SocialProofSection.jsx`

> ⚠️ 기존 코드 전면 교체. 가상 수치(1200명+, 27%)·가상 후기(박민수·김지영·최현우) 전부 삭제.

**배경**: `bg-neutral-50`  
**여백**: `py-32 px-6`

**헤드라인**:
```
H2 (text-[40px] md:text-[52px] font-bold text-text-main tracking-tight break-keep text-center):
  "믿고 시작하셔도 됩니다."

서브 (text-[18px] text-neutral-400 text-center break-keep):
  "PULSE가 어떻게 작동하는지, 무엇이 안전한지 투명하게 알려드립니다."
```

**신뢰 카드 3개** (`grid grid-cols-1 md:grid-cols-3 gap-6 mt-16`):

```
카드 1 — 데이터 기반 분석
  아이콘: BarChart2 (Lucide, 32px, text-primary)
  제목: "실제 데이터로 분석합니다"
  설명: "네이버·카카오 리뷰와 카카오 상권 데이터를
        AI가 분석해 손님 인사이트를 만듭니다.
        추측이 아닌 데이터 기반입니다."
  기술 뱃지: "BERTopic 분석 · 카카오 로컬 API · LLM 인사이트"
  → text-caption text-neutral-400 mt-4

카드 2 — 무료 시작
  아이콘: Gift (Lucide, 32px, text-primary)
  제목: "카드 없이 무료로 시작"
  설명: "기본 손님 분석과 홍보 영상 제작 기능은
        무료로 제공됩니다. 신용카드 정보 없이
        지금 바로 시작하세요."
  하이라이트: "기본 플랜 영구 무료" — text-primary font-bold

카드 3 — 안전한 정보 보호
  아이콘: Shield (Lucide, 32px, text-primary)
  제목: "사장님 정보는 안전합니다"
  설명: "가게 이름과 분석 결과는 외부에 공유되지 않습니다.
        개인정보는 서비스 운영 목적으로만 사용되며
        제3자에게 제공되지 않습니다."
```

**카드 스타일**: `bg-white rounded-[24px] p-8 shadow-soft border border-neutral-200`

**애니메이션**: whileInView stagger (delay i * 0.1), opacity 0→1, y 20→0

---

### 3.9 FAQSection (수정)

**파일**: `src/components/landing/FAQSection.jsx`

**배경**: `bg-white` (기존 bg-neutral-50에서 변경 — 교차 리듬 맞춤)  
**콘텐츠**: 기존 4개 FAQ 유지

**변경사항**: 애니메이션 height → grid-rows 트릭으로 교체

```jsx
// 기존: height: 0 → 'auto' (CLAUDE.md 위반 — height animate 금지)
// 수정: grid-rows-[0fr] → grid-rows-[1fr] transition (CSS grid trick)

// FAQItem 내부
<div className={[
  'grid transition-[grid-template-rows] duration-300 ease-out',
  isOpen ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]',
].join(' ')}>
  <div className="overflow-hidden">
    <p className="pb-6 text-body-4 text-neutral-600 leading-relaxed">
      {answer}
    </p>
  </div>
</div>

// ⚠️ AnimatePresence + height: 0/'auto' 방식 제거
// framer-motion 의존성 유지하되 height animation은 CSS grid-rows로 대체
// ChevronDown rotate: 기존 transition-transform 유지 ✓
```

---

### 3.10 CTASection (수정)

**파일**: `src/components/landing/CTASection.jsx`

**배경**: `bg-primary` (유일한 풀 다크 섹션)  
**여백**: `py-40 px-6`

**헤드라인** (`text-[40px] md:text-[56px] font-bold text-white leading-[1.2] tracking-tight break-keep text-center`):
```
"지금 바로 우리 가게 마케팅을
시작해보세요."
```

**서브카피** (`text-[16px] md:text-[18px] text-white/70 text-center break-keep mb-4`):
```
"PULSE는 홍보 도구가 아닙니다."
```
```
"사장님 가게의 마케팅 운영체제입니다."
(text-white font-semibold)
```

**CTA 버튼**:
```jsx
// 기존: size="lg" variant="primary" + 임의 className="text-[20px] px-14 py-6 h-auto" ← 삭제
// 수정: size="lg" variant="point" (오렌지 — 다크 배경 위 핵심 CTA)
// className은 shadow-xl만 추가 (shadow-xl은 CTA 버튼 1개에만 허용)
<Button size="lg" variant="point" className="shadow-xl" onClick={() => navigate('/signup')}>
  PULSE 시작하기
</Button>
```

**배경 장식**: 기존 blur orb → 단 1개로 축소 (bg-white/5 blur-[100px] 원 하나만 유지)

---

## 4. CSS 목업 컴포넌트 상세 스펙

> **위치**: `src/components/landing/mockups/`  
> **공통 규칙**: PULSE 토큰만, Lucide 아이콘만, 무한 루프 없음, aria-hidden="true" (장식용)

---

### 4.1 InsightMockup.jsx

```jsx
// 전체: bg-bg-page rounded-[24px] overflow-hidden border border-neutral-200
// aspect-[16/10] — 이미지와 동일 비율

// 좌측 스트립 (w-1/3 bg-primary p-4 flex flex-col gap-2)
// - "분석 결과" text-[10px] text-white/50 uppercase tracking-wide mb-2
// - 페르소나 목록 3개:
//   활성: bg-white/15 rounded-xl px-3 py-2 text-[12px] font-bold text-white
//   비활성: px-3 py-2 text-[12px] text-white/50
//   ["30대 퇴근족", "주말 가족", "아침 직장인"]
// - 활성 항목 왼쪽에 ChevronRight size={10} text-white

// 우측 (flex-1 bg-white p-5 flex flex-col gap-3)
// - Badge variant="primary" size="sm": "30대 퇴근족"
// - H: "퇴근 후 시원한 맥주를 원합니다" text-[14px] font-bold text-text-main
// - 미니 바 차트 (4개 bars):
//   div.flex.gap-1.items-end.h-14
//   bars: bg-primary rounded-sm, 높이 varying (40%, 60%, 90%, 75%)
//   width: flex-1
// - CTA 미니: bg-primary-tint text-primary text-[11px] font-semibold px-3 py-1.5 rounded-xl
//   "이 손님으로 영상 만들기 →"
```

---

### 4.2 ReelsMockup.jsx

```jsx
// 전체: mx-auto bg-neutral-900 rounded-[24px] overflow-hidden relative
// 비율: aspect-[9/16] max-h-[280px] — 9:16 숏폼 프레임

// 배경 그라디언트 (CSS only, 이미지 X):
// background: linear-gradient(160deg, #1a2a4a 0%, #002B7A 50%, #1a0a00 100%)

// 상단 오버레이
// - 좌상: "PULSE Reels" text-[10px] text-white/60
// - 우상: Badge variant="point" size="sm" → "생성 완료"

// 중앙: Play 버튼 circle
// - w-12 h-12 bg-white/20 rounded-full flex items-center justify-center
// - PlayCircle size={24} text-white

// 하단 프로그레스
// - "Scene 2 / 3" text-[10px] text-white/70
// - 3개 dot 진행표시: active=bg-white, inactive=bg-white/30, w-4 h-1 rounded-full
// - 오렌지 밑줄 accent: bg-point h-0.5 w-full opacity-60
```

---

### 4.3 DashboardMockup.jsx

```jsx
// 전체: bg-bg-page rounded-[24px] overflow-hidden border border-neutral-200
// aspect-[16/10] p-4

// KPI 스트립 (grid grid-cols-3 gap-2 mb-3)
// 각 KPI: bg-white rounded-xl p-2 text-center
//   - 숫자: text-[16px] font-bold text-primary
//   - 레이블: text-[10px] text-neutral-400
//   - ["방문자 +12%", "검색량 +8%", "영상 저장 23회"]

// AI 제안 카드 (bg-white rounded-[24px] p-3 shadow-sm border border-primary-border)
//   - 헤더: Sparkles size={12} text-primary + "AI 오늘의 제안" text-[11px] text-primary font-semibold
//   - 내용: "비 오는 날엔 배달 강조 영상을 만들어보세요!" text-[12px] text-text-main font-medium mt-1
//   - 버튼: "영상 만들기" bg-point text-white text-[10px] px-3 py-1 rounded-xl mt-2

// 미니 트렌드 차트 (h-16 flex items-end gap-1 mt-2)
// 7개 bars representing Mon-Sun
// 높이 varying: [40, 55, 45, 70, 85, 90, 75]% of h-16
// bg-primary/20 default, bg-primary active (마지막 2개)
// rounded-sm w-full
```

---

### 4.4 ReviewMockup.jsx

```jsx
// 전체: bg-white rounded-[24px] overflow-hidden border border-neutral-200
// aspect-[16/10] p-4

// 리뷰 아이템 1 (긍정)
// - 상단: ★★★★★ 5개 (Star size={10} fill="#D97706" color="#D97706")
// - 텍스트: '"치킨이 진짜 바삭하고 양도 많아요! 또 올게요."' text-[11px] text-neutral-600 mt-1
// - 감정 뱃지: Badge variant="success" size="sm" → "긍정"
// - AI 답글 영역 (bg-neutral-50 rounded-xl p-2 mt-2)
//   - "AI 답글 초안" text-[10px] text-neutral-400 mb-1
//   - '"소중한 리뷰 감사합니다! 다음에도 바삭한 치킨으로 모시겠습니다 :)"'
//     text-[11px] text-neutral-700
//   - "답글 등록" 버튼: border border-primary-border text-primary text-[10px] px-2 py-0.5 rounded-lg mt-1

// divider border-b border-neutral-100 my-3

// 리뷰 아이템 2 (부정, 일부만 보임)
// - ★★★☆☆ 3개 full, 2개 outline
// - 텍스트: '"배달이 좀 늦었어요. 음식은 맛있었는데..."' text-[11px] text-neutral-600
// - 감정 뱃지: Badge variant="warning" size="sm" → "개선 필요"
// - AI 답글 영역 (bg-neutral-50, 상단만 살짝 보이도록 overflow-hidden)
```

---

### 4.5 InfluencerMockup.jsx

```jsx
// 전체: bg-bg-page rounded-[24px] overflow-hidden border border-neutral-200
// aspect-[16/10] p-4

// 상단: "Pro" Badge variant="point" + 필터 chips
// 필터: ["지역", "업종", "팔로워 수"] — Badge variant="neutral" size="sm" 가로 나열

// 인플루언서 카드 grid (grid grid-cols-2 gap-2 mt-3)
// 카드 2개 표시 (나머지는 잘림으로 암시)
// 각 카드 (bg-white rounded-xl p-3 shadow-sm)
//   - 상단: w-8 h-8 rounded-full bg-primary-tint 아바타
//   - 이름: text-[12px] font-semibold text-text-main
//   - 팔로워: "12.4K 팔로워" text-caption text-neutral-400
//   - 카테고리: Badge variant="neutral" size="sm" → "맛집리뷰"
//   - 버튼: "매칭 요청" bg-point text-white text-[10px] px-2 py-1 rounded-lg mt-2 w-full text-center
```

---

### 4.6 mockups/index.js

```javascript
export { default as InsightMockup } from './InsightMockup';
export { default as ReelsMockup } from './ReelsMockup';
export { default as DashboardMockup } from './DashboardMockup';
export { default as ReviewMockup } from './ReviewMockup';
export { default as InfluencerMockup } from './InfluencerMockup';
```

---

## 5. LandingPage.jsx 수정 사항

```jsx
// 추가 import
import ScrollProgress from '../components/landing/ScrollProgress';
import ShowcaseSection from '../components/landing/ShowcaseSection';
import ComparisonSection from '../components/landing/ComparisonSection';
// SolutionSection import 제거 (파일 삭제됨)

// 렌더 순서 (main 내부)
<ScrollProgress />          // Header 위에 absolute fixed
<Header />
<main>
  <HeroSection />
  <ProblemSection />
  <ShowcaseSection />
  <FeatureSection />
  <HowItWorksSection />
  <ComparisonSection />
  <SocialProofSection />    // Trust로 재작성된 파일
  <FAQSection />
  <CTASection />
</main>
<Footer />

// useEffect: Lenis + GSAP 초기화 — 기존 코드 유지
// globals.css override (h-full overflow-hidden 해제) — 기존 코드 유지
```

---

## 6. 반응형 브레이크포인트 가이드

| 브레이크포인트 | 너비 | Tailwind prefix | 주요 변경 |
|---|---|---|---|
| Mobile | 375–767px | (base) | 단일 컬럼, Hero H1 48px, Feature 탭 수평 |
| Tablet | 768–1023px | `md:` | 2열 그리드, Feature 좌측 240px |
| Desktop | 1024–1279px | `lg:` | Feature 좌측 280px, 4열 카드 |
| Wide | 1280px+ | `xl:` | max-w-[1200px] 컨테이너 중앙 |

### 6.1 모바일 핵심 처리 목록

```
Hero:
  - H1: text-[48px] (md: text-[88px])
  - AI 카드: hidden md:block
  - ThreeBackground: scale 조정 검토 (현재 scale=1.2)

Problem:
  - 카드 grid: grid-cols-1 sm:grid-cols-2 lg:grid-cols-4

Showcase:
  - clip-path 확장: 모바일에서 비활성 (window.innerWidth < 768 체크)
  - 서브 이미지: grid-cols-1 md:grid-cols-3

Feature:
  - 좌측 패널: sticky top-[57px] (header 높이) h-auto w-full
  - 좌측 내부: flex-row overflow-x-auto gap-2 py-3 px-4
  - 각 nav item: whitespace-nowrap flex-shrink-0 py-2 px-4
  - 우측: min-h-[80vh] (dvh 대신)

Comparison:
  - 비교표: 좌우 셀 텍스트 text-body-7 (font-size 14px)

FAQ:
  - max-w-[800px] → max-w-full on mobile

CTA:
  - H2: text-[32px] md:text-[56px]
```

---

## 7. 이미지 자산 관리

### 7.1 파일 경로 (public/ 폴더)

```
public/showcase-main.webp   (메인 히어로, 16:9)
public/showcase-sub1.webp   (AI 분석 화면, 4:3)
public/showcase-sub2.webp   (음식 촬영, 4:3)
public/showcase-sub3.webp   (손님 입장, 16:9 or 4:3)
```

### 7.2 이미지 미제공 시 Placeholder

```jsx
// 각 이미지에 onError handler 필수
// Showcase 메인: bg-gradient-to-br from-primary-tint to-neutral-100 + aspect-[16/9]
// Showcase 서브: bg-neutral-200 + aspect-[4/3] + "이미지 준비 중" text-neutral-400 text-caption

// 이미지 alt 텍스트 (한국어, 접근성)
showcase-main: "카페에서 PULSE 대시보드를 확인하는 사장님"
showcase-sub1: "스마트폰으로 AI 손님 분석 결과를 보는 장면"
showcase-sub2: "음식을 스마트폰으로 촬영해 홍보 영상을 만드는 장면"
showcase-sub3: "손님들이 카페로 들어오는 장면"
```

---

## 8. Skill & Subagent 사용 가이드

### 8.1 pulse-design Skill

**활성화 시점**: 구현 세션 시작 직후, 첫 번째 파일 작성 전  
**명령어**: `/pulse-design`  
**목적**: 색상·타이포·간격·컴포넌트·애니메이션 규칙 전체 로드

```
반드시 로드 후 확인할 항목:
§1.1 허용 색상 목록
§2.1 랜딩 타이포그래피 규격 (Hero: 72~96px, H2: 40~56px)
§3.1 섹션 여백 (py-32 기본, py-40 Hero/CTA)
§4.1 Button 규격 (size/variant)
§5.2 승인된 애니메이션 목록
§7 AI처럼 보이지 않기 20가지
§8 자가점검 체크리스트
```

### 8.2 ui-ux-reviewer Subagent

**도구**: `Agent(subagent_type="ui-ux-reviewer")`  
**권한**: Read, Glob, Grep (수정 불가)

**호출 타이밍 — 3배치**:

```
배치 1 (Header + ScrollProgress + Hero + Problem 완료 후):
  검토 대상 파일:
  - src/components/landing/Header.jsx
  - src/components/landing/ScrollProgress.jsx
  - src/components/landing/HeroSection.jsx
  - src/components/landing/ProblemSection.jsx
  체크 포인트:
  - H1 크기 64px(mobile) / 88px(desktop) 이상인지
  - ThreeBackground 내부 수정 없는지
  - useReducedMotion() 분기 모든 motion에 적용되는지
  - break-keep 한국어 표제에 있는지

배치 2 (ShowcaseSection + FeatureSection 완료 후):
  검토 대상 파일:
  - src/components/landing/ShowcaseSection.jsx
  - src/components/landing/FeatureSection.jsx
  - src/components/landing/mockups/ 전체
  체크 포인트:
  - GSAP scrub animation이 transition-all 없이 구현됐는지
  - Feature 좌측 Intersection Observer 올바른지
  - 목업 컴포넌트에 emoji 아이콘 없는지
  - 박스 중첩 없는지
  - Feature 모바일 레이아웃 (수평 탭) 구조 올바른지

배치 3 (HowItWorks + Comparison + Trust + FAQ + CTA 완료 후):
  검토 대상 파일: 위 5개 컴포넌트
  체크 포인트:
  - FAQ grid-rows 애니메이션 올바른지
  - CTA Button size 토큰 사용 (임의 py-6 h-auto 제거됐는지)
  - Trust 섹션 가상 수치·가상 인물 없는지
  - point 색상이 CTA 버튼 외에 남용되지 않는지
```

**ui-ux-reviewer에게 전달할 프롬프트 예시**:
```
PULSE 랜딩 리디자인 배치 1 검토 요청.
검토 파일: [파일 목록]
참조: tailwind.config.js, CLAUDE.md
중점 확인:
1. 정보 계층 (H1→H2→body 크기 대비)
2. break-keep 한국어 표제 적용 여부
3. useReducedMotion() 분기 누락 여부
4. transition-all 사용 여부
5. 한국어 텍스트가 버튼·카드에서 잘리지 않는지
```

### 8.3 pulse-visual-qa Subagent

**도구**: `Agent(subagent_type="pulse-visual-qa")`  
**전제조건**: 
1. 모든 섹션 구현 완료
2. `npm run lint` 통과
3. `npm run build` 통과
4. ui-ux-reviewer 3배치 모두 완료

**확인 뷰포트** (순서대로):
```
1. 1440×900   — 랜딩 전체 스크롤 확인
2. 1280×800   — compact desktop
3. 1024×768   — tablet landscape
4. 390×844    — iPhone 14 Pro
5. 375×812    — iPhone SE
```

**특별 확인 항목**:
```
[ ] GSAP clip-path 확장이 스크롤을 막지 않음
[ ] Lenis smooth scroll + GSAP ScrollTrigger 충돌 없음
[ ] Feature 좌측 sticky 패널이 header와 겹치지 않음
[ ] ThreeBackground가 Hero에서 정상 렌더
[ ] showcase-main.webp placeholder가 표시됨 (이미지 없을 때)
[ ] 스크롤 시 하단 텍스트 opacity 변화 동작
[ ] Console 에러 0개
[ ] 모바일에서 Feature 탭 수평 스크롤 가능
[ ] CTA 버튼 클릭 → /signup 이동
[ ] Header 로그인/회원가입 버튼 항상 표시
[ ] prefers-reduced-motion 시 애니메이션 비활성
```

---

## 9. 구현 순서 (권장)

```
Phase 1 — 기반 작업 (의존성 없음)
  1-1. ScrollProgress.jsx 신규 작성
  1-2. Header.jsx 검토 및 소폭 수정
  1-3. LandingPage.jsx 섹션 순서 재배치 (import 정리)

Phase 2 — Hero + Problem (비교적 간단한 수정)
  2-1. HeroSection.jsx — AI 카드 목업 추가
  2-2. ProblemSection.jsx — 라이트 배경 전환 + 카피 교체

→ ui-ux-reviewer 배치 1 호출

Phase 3 — ShowcaseSection (GSAP 복잡)
  3-1. ShowcaseSection.jsx 신규 작성
  3-2. GSAP clip-path scrub 애니메이션 구현
  3-3. 서브 이미지 + 하단 텍스트 scrub 구현
  3-4. 이미지 placeholder 처리

Phase 4 — FeatureSection + 목업 (가장 복잡)
  4-1. mockups/ 폴더 + index.js 생성
  4-2. InsightMockup.jsx 작성
  4-3. ReelsMockup.jsx 작성
  4-4. DashboardMockup.jsx 작성
  4-5. ReviewMockup.jsx 작성
  4-6. InfluencerMockup.jsx 작성
  4-7. FeatureSection.jsx 전면 재구성 (카카오 스타일)

→ ui-ux-reviewer 배치 2 호출

Phase 5 — 나머지 섹션
  5-1. HowItWorksSection.jsx 소폭 수정
  5-2. ComparisonSection.jsx 신규 작성
  5-3. SocialProofSection.jsx 전면 재작성 (Trust)
  5-4. FAQSection.jsx grid-rows 애니메이션 교체
  5-5. CTASection.jsx 수정

→ ui-ux-reviewer 배치 3 호출

Phase 6 — 통합 검증
  6-1. npm run lint
  6-2. npm run build
  6-3. pulse-visual-qa 호출 (5개 뷰포트 전체)
```

---

## 10. 자가점검 체크리스트 (구현 후)

### 색상
- [ ] 모든 색이 tailwind.config.js 토큰 사용 (임의 Hex 없음)
- [ ] `style={{ color: '#...' }}` 없음
- [ ] point 색상이 CTA 버튼에만 사용됨
- [ ] Feature 좌측 opacity는 Tailwind `/` 수식어 사용

### 타이포그래피
- [ ] Hero H1: 최소 48px (mobile), 88px (desktop)
- [ ] 한국어 표제 전체에 `break-keep` 있음
- [ ] 임의 크기 (`text-[17px]` 등) 없음

### 레이아웃
- [ ] `h-screen` 없음 (`min-h-dvh` 사용)
- [ ] 박스 중첩 없음
- [ ] Feature 우측 `overflow-hidden` 강제 (landing이므로 대시보드 규칙 적용 불필요, 단 중첩 카드 없을 것)

### 컴포넌트
- [ ] 버튼이 모두 `<Button>` 컴포넌트 사용 (임의 `<button>` 없음)
- [ ] 버튼 size가 lg/md/sm 중 하나
- [ ] 라운드가 24px/12px/8px/full 중 하나

### 애니메이션
- [ ] `transition-all` 없음 (전체 Grep으로 확인)
- [ ] 모든 `<motion.*>`에 `useReducedMotion()` 분기 있음
- [ ] 무한 루프 없음 (rotate 360은 1회성 확인)
- [ ] GSAP 애니메이션에서 scrub 해제 cleanup 있음

### 카피 / 콘텐츠
- [ ] 가상 수치 없음 (1200명+, 27%, 1분 등)
- [ ] 가상 후기 인물 없음
- [ ] Problem 카드 출처 캡션 있음

### 이미지
- [ ] 모든 `<img>`에 `onError` handler
- [ ] 모든 이미지에 한국어 alt 텍스트
- [ ] ThreeBackground.jsx 내부 수정 없음

### 최종
- [ ] `npm run lint` — 0 warnings
- [ ] `npm run build` — 성공
- [ ] 1440×900 전체 스크롤 이상 없음
- [ ] 390px 모바일 레이아웃 확인
