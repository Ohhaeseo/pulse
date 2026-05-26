# PULSE 마이페이지 — 인터랙션 개발 스펙

**작성일**: 2026-05-26  
**대상 파일**: `src/features/mypage/MyPage.jsx` + 신규 공유 컴포넌트  
**기획 출처**: product-manager 분석 + ui-ux-reviewer 분석 통합  
**개발 진입 전제**: 이 문서가 확정된 단일 참조 소스. 수정 최소화 목표.

---

## 0. 통합 결정 사항 (두 분석의 차이점 해소)

| 인터랙션 | product-manager | ui-ux-reviewer | 채택 결정 + 이유 |
|---|---|---|---|
| 로그아웃 | 확인 모달 (Center Modal) | 인라인 2-step | **인라인 2-step** — 짧은 확인에 포커스 트랩 오버레이는 과잉. PULSE 안티패턴 #8 명시 회피 |
| 카카오 연동 컨테이너 | Center Modal (3-step) | Right Drawer (2-step) | **Right Drawer + 3-step** — Drawer가 step 전환 시 높이 고정에 유리. OAuth 콘텐츠는 product-manager 안 채택 |
| 1:1 문의 | Center Modal (인앱 폼) | 외부 링크 또는 Center Modal | **Center Modal (인앱 폼)** — 컨텍스트 이탈 없이 접수 가능 |
| 이용 가이드 | 새 탭 + 미확정 시 Toast | 새 탭 | **새 탭 + 미확정 시 Toast** — 자동 소멸 Toast는 중요 액션 아니므로 허용 |
| 수정하기 | Right Drawer | Right Drawer | **Right Drawer** — 양쪽 일치 |
| 플랜 관리 | setActiveMenu('subscription') | setActiveMenu('subscription') | **페이지 이동** — 양쪽 일치 |

---

## 1. 전역 설계 원칙

### 1-1. 절대 금지 패턴 (AI 디자인 클리셰 목록)

이 문서의 모든 인터랙션은 아래 패턴을 의도적으로 회피하여 설계되었다.

| # | 안티패턴 | 대안 |
|---|---|---|
| 1 | 관리 화면 전체 너비 오렌지 CTA (`w-full bg-[#FF5A36]`) | 적절한 크기의 `px-5 py-2.5 bg-point` 버튼 |
| 2 | 단순 확인에 Full-page overlay | 인라인 2-step 또는 소형 Modal |
| 3 | 자동 닫힘 Toast (중요 액션 후) | 사용자 명시 확인 후 닫기 |
| 4 | Bounce spring animation | `type: 'tween', duration ≤ 0.3s` |
| 5 | 아이콘 전용 버튼 (레이블 없음) | 아이콘 + 텍스트 레이블 병행 |
| 6 | 중첩 로딩 스피너 카드 오버레이 | 버튼 텍스트 "저장 중..." 변경 |
| 7 | Glassmorphism `backdrop-blur` 남용 | 단순 `bg-black/40` 오버레이 |
| 8 | Bottom Sheet (데스크탑 SaaS) | Right Drawer 또는 Center Modal |
| 9 | 박스 중첩 (card-in-card) | 타이포 + 디바이더로 구분 |
| 10 | `transition-all` | `transition-colors`, `transition-opacity` 개별 명시 |

### 1-2. 공통 컴포넌트 구조

6개 인터랙션에서 추출된 재사용 컴포넌트. 개발 전 선행 구현 필요.

```
src/components/ui/
  Drawer.jsx          — Right slide-over (width, children, isOpen, onClose props)
  Modal.jsx           — Center overlay (size: 'sm'|'md', children, isOpen, onClose props)
  ConfirmInline.jsx   — 인라인 2-step 확인 패턴
  Toast.jsx           — 경량 피드백 (message, duration, onDismiss props)
```

### 1-3. PULSE 디자인 토큰 참조

```
컬러:
  primary          #002B7A      — 버튼 배경, 로고, 헤드라인
  primary-inactive #002B7A99   — 비활성 텍스트/아이콘
  primary-tint     #002B7A1A   — hover 배경, 배지 배경
  point            #FF5A36CC   — 핵심 CTA 전용 (저장/연동/전송)
  bg-page          #F5F7FA     — 전체 배경
  bg-card          #FFFFFF     — 카드/모달 배경
  text-main        #191F28     — 기본 텍스트
  warning          #D97706     — 경고 (error 토큰 미정의)

타이포:
  text-head-5      20px/600    — 드로어/모달 제목
  text-btn-main    16px/600    — 버튼 텍스트
  text-body-5      14px/700    — 강조 레이블
  text-body-6      14px/600    — 필드 레이블
  text-body-7      14px/400    — 보조 텍스트
  text-caption     12px/400    — 부가 정보, 에러 메시지

라운드:
  rounded-[24px]   — 메인 컨테이너 (Drawer, Modal 패널)
  rounded-xl       — 내부 카드 (12px)
  rounded-lg       — 버튼, 배지 (8px)
```

### 1-4. 공통 모션 스펙

```javascript
// 모든 인터랙션에서 useReducedMotion() 분기 필수
const shouldReduceMotion = useReducedMotion();

// Right Drawer
const drawerVariants = shouldReduceMotion
  ? { hidden: { opacity: 0 }, visible: { opacity: 1 }, exit: { opacity: 0 } }
  : { hidden: { x: '100%' }, visible: { x: 0 }, exit: { x: '100%' } };
const drawerTransition = { type: 'tween', duration: 0.25 };

// Center Modal
const modalVariants = shouldReduceMotion
  ? { hidden: { opacity: 0 }, visible: { opacity: 1 }, exit: { opacity: 0 } }
  : { hidden: { opacity: 0, scale: 0.96, y: 8 }, visible: { opacity: 1, scale: 1, y: 0 }, exit: { opacity: 0, scale: 0.96, y: 8 } };
const modalTransition = { type: 'tween', duration: 0.2 };

// Backdrop
const backdropVariants = { hidden: { opacity: 0 }, visible: { opacity: 1 }, exit: { opacity: 0 } };
```

### 1-5. 공통 접근성 패턴

```
- Drawer/Modal: role="dialog", aria-modal="true", aria-labelledby=[id]
- useFocusTrap: src/hooks/useFocusTrap.js (기존 파일 활용)
- ESC 키: onClose 또는 dirty state Confirm 경유
- 배경 오버레이 클릭: ESC와 동일 처리
- 배경 스크롤 잠금: open 시 document.body에 overflow-hidden 적용, close 시 해제
- 초기 포커스: Drawer/Modal 열릴 때 첫 번째 인터랙티브 요소 자동 포커스
```

---

## 2. 인터랙션 1: "수정하기 →" — 가게 AI 프로필 편집

### 2-1. 패턴: Right Drawer

**선택 이유**: 기존 카드의 읽기 값(가게명·카테고리·톤앤매너·키워드)을 배경에서 비교하면서 편집 가능. Center Modal은 폼 길이 때문에 스크롤 발생.

### 2-2. 사용자 플로우

```
[가게 AI 프로필 카드] "수정하기 →" 클릭
    ↓
Right Drawer 열림 (우측에서 슬라이드 진입)
배경 오버레이 bg-black/40 표시
body overflow-hidden 적용
첫 번째 필드("가게 이름") 자동 포커스
    ↓
[드로어 내용]
  ┌─ 헤더: "가게 AI 프로필 수정" + X 닫기 버튼
  ├─ 가게 이름 (text input)
  ├─ 가게 유형 (select dropdown)
  ├─ 브랜드 분위기 (최대 3개 토글 선택)
  └─ 주력 메뉴 키워드 (태그 입력, 최대 8개)
  [저장하기] [취소]
    ↓                              ↓ (취소/ESC/오버레이)
변경사항 없음: 즉시 닫힘         변경사항 있음:
                                   ConfirmDialog 진입
                                   "나가기" → 닫힘
                                   "계속 수정" → 드로어 유지
    ↓ (저장하기)
버튼 → "저장 중..." + disabled
    ↓ [API 성공]                  ↓ [API 실패]
Drawer 닫힘                      드로어 유지
카드 데이터 즉시 업데이트         드로어 상단 에러 배너
```

### 2-3. 한국어 카피

| 위치 | 텍스트 |
|---|---|
| 드로어 제목 | 가게 AI 프로필 수정 |
| 닫기 버튼 aria | 가게 AI 프로필 수정 닫기 |
| 가게 이름 레이블 | 가게 이름 |
| 가게 이름 placeholder | 예: 범계 로데오점 |
| 가게 유형 레이블 | 가게 유형 |
| 가게 유형 placeholder | 유형을 선택해 주세요 |
| 브랜드 분위기 레이블 | 브랜드 분위기 (최대 3개) |
| 브랜드 분위기 초과 | 최대 3개까지 선택할 수 있어요. |
| 키워드 레이블 | 주력 메뉴 키워드 (최대 8개) |
| 키워드 placeholder | 키워드 입력 후 Enter |
| 키워드 초과 | 키워드는 최대 8개까지 입력할 수 있어요. |
| 저장 버튼 | 저장하기 |
| 저장 중 버튼 | 저장 중... |
| 취소 버튼 | 취소 |
| 미저장 이탈 제목 | 저장하지 않은 내용이 있어요. |
| 미저장 이탈 부제 | 지금 나가면 입력한 내용이 사라져요. |
| 나가기 버튼 | 그냥 나가기 |
| 계속 버튼 | 계속 수정하기 |

### 2-4. 에러 상태

| 에러 케이스 | 메시지 | 표시 위치 | 시점 |
|---|---|---|---|
| 가게 이름 공백 | 가게 이름을 입력해 주세요. | 해당 필드 하단 인라인 | blur 또는 submit |
| 브랜드 분위기 0개 | 분위기를 1개 이상 선택해 주세요. | 해당 섹션 하단 인라인 | submit |
| 키워드 0개 | 키워드를 1개 이상 입력해 주세요. | 해당 섹션 하단 인라인 | submit |
| API 500/네트워크 | 저장 중 오류가 발생했어요. 잠시 후 다시 시도해 주세요. | 드로어 Body 상단 인라인 배너 | submit |

에러 표시 스타일:
```
text-caption text-warning
<!-- text-error 토큰 미정의 → text-warning (#D97706) 사용 -->
```

### 2-5. 컴포넌트 Tailwind 스펙

```jsx
{/* DrawerPanel */}
<motion.div
  role="dialog"
  aria-modal="true"
  aria-labelledby="profile-edit-drawer-title"
  className="fixed right-0 top-0 bottom-0 z-[80]
             w-[480px] max-w-[90vw]
             bg-bg-card flex flex-col
             shadow-soft overflow-hidden"
>
  {/* DrawerHeader */}
  <div className="flex items-center justify-between px-6 py-5
                  border-b border-gray-100 shrink-0">
    <h2 id="profile-edit-drawer-title"
        className="text-head-5 text-text-main">
      가게 AI 프로필 수정
    </h2>
    <button aria-label="가게 AI 프로필 수정 닫기"
            className="w-8 h-8 flex items-center justify-center
                       rounded-lg hover:bg-bg-page transition-colors
                       focus-visible:outline-none focus-visible:ring-1
                       focus-visible:ring-primary/20">
      <X size={18} className="text-text-main/40" />
    </button>
  </div>

  {/* DrawerBody */}
  <div className="flex-1 overflow-y-auto px-6 py-5 space-y-6">
    {/* 에러 배너 (API 실패 시만 표시) */}
    {apiError && (
      <div className="px-4 py-3 bg-warning/10 rounded-xl
                      text-body-7 text-warning">
        저장 중 오류가 발생했어요. 잠시 후 다시 시도해 주세요.
      </div>
    )}

    {/* 가게 이름 */}
    <div className="space-y-1.5">
      <label className="text-body-6 text-text-main">가게 이름</label>
      <input
        type="text"
        className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200
                   text-body-4 text-text-main bg-bg-card
                   focus:outline-none focus:ring-2 focus:ring-primary/20
                   focus:border-primary/40 transition-colors
                   placeholder:text-text-main/30"
        placeholder="예: 범계 로데오점"
      />
      {/* 에러 인라인 */}
      {errors.name && (
        <p className="text-caption text-warning">가게 이름을 입력해 주세요.</p>
      )}
    </div>

    {/* 가게 유형 */}
    <div className="space-y-1.5">
      <label className="text-body-6 text-text-main">가게 유형</label>
      <select
        className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200
                   text-body-4 text-text-main bg-bg-card
                   focus:outline-none focus:ring-2 focus:ring-primary/20
                   focus:border-primary/40 transition-colors appearance-none">
        <option value="">유형을 선택해 주세요</option>
        <option>이자카야</option>
        <option>한식</option>
        <option>카페</option>
        <option>양식</option>
        <option>중식</option>
        <option>기타</option>
      </select>
    </div>

    {/* 브랜드 분위기 */}
    <div className="space-y-2">
      <label className="text-body-6 text-text-main">
        브랜드 분위기
        <span className="text-caption text-text-main/40 ml-1.5">최대 3개</span>
      </label>
      <div className="flex flex-wrap gap-2">
        {TONE_OPTIONS.map((tone) => (
          <button
            key={tone}
            onClick={() => toggleTone(tone)}
            className={`px-3 py-1.5 rounded-full text-body-7
                        transition-colors focus-visible:outline-none
                        focus-visible:ring-1 focus-visible:ring-primary/20
                        ${selected.includes(tone)
                          ? 'bg-primary text-white'
                          : 'bg-bg-page text-text-main/50 hover:bg-primary-tint hover:text-primary'
                        }`}
          >
            {tone}
          </button>
        ))}
      </div>
      {toneOverflow && (
        <p className="text-caption text-warning">최대 3개까지 선택할 수 있어요.</p>
      )}
    </div>

    {/* 키워드 태그 입력 */}
    <div className="space-y-2">
      <label className="text-body-6 text-text-main">
        주력 메뉴 키워드
        <span className="text-caption text-text-main/40 ml-1.5">최대 8개</span>
      </label>
      <div className="flex flex-wrap gap-1.5 p-3 rounded-xl border border-gray-200
                      focus-within:ring-2 focus-within:ring-primary/20
                      focus-within:border-primary/40 transition-colors min-h-[52px]">
        {keywords.map((kw) => (
          <span key={kw}
                className="flex items-center gap-1 px-2.5 py-1
                           bg-bg-page text-body-7 text-text-main/60
                           rounded-lg">
            {kw}
            <button
              onClick={() => removeKeyword(kw)}
              aria-label={`'${kw}' 키워드 삭제`}
              className="text-text-main/30 hover:text-text-main/60 transition-colors">
              <X size={12} />
            </button>
          </span>
        ))}
        <input
          placeholder={keywords.length === 0 ? '키워드 입력 후 Enter' : ''}
          className="flex-1 min-w-[120px] text-body-7 text-text-main
                     bg-transparent outline-none placeholder:text-text-main/30"
          onKeyDown={handleKeywordKeyDown}
        />
      </div>
    </div>
  </div>

  {/* DrawerFooter */}
  <div className="flex items-center justify-end gap-3 px-6 py-4
                  border-t border-gray-100 shrink-0">
    <button
      onClick={handleClose}
      className="px-5 py-2.5 rounded-lg text-btn-main
                 text-primary-inactive hover:text-primary hover:bg-primary-tint
                 transition-colors focus-visible:outline-none
                 focus-visible:ring-1 focus-visible:ring-primary/20">
      취소
    </button>
    <button
      onClick={handleSave}
      disabled={isSaving}
      className="px-5 py-2.5 rounded-lg text-btn-main
                 bg-point text-white
                 transition-opacity hover:opacity-90
                 focus-visible:outline-none focus-visible:ring-2
                 focus-visible:ring-point/40
                 disabled:opacity-40 disabled:cursor-not-allowed">
      {isSaving ? '저장 중...' : '저장하기'}
    </button>
  </div>
</motion.div>
```

### 2-6. MyPage.jsx 변경 사항

```javascript
// 추가할 state
const [isProfileEditOpen, setIsProfileEditOpen] = useState(false);

// 버튼에 onClick 연결
<button onClick={() => setIsProfileEditOpen(true)} ...>
  수정하기 →
</button>

// AnimatePresence로 드로어 래핑
<AnimatePresence>
  {isProfileEditOpen && <ProfileEditDrawer onClose={() => setIsProfileEditOpen(false)} />}
</AnimatePresence>
```

---

## 3. 인터랙션 2: "플랜 관리 →" — 구독 페이지 이동

### 3-1. 패턴: 내부 페이지 이동 (`setActiveMenu('subscription')`)

**선택 이유**: `SubscriptionPage` 기존 페이지 활용. 모달/드로어로 수용 불가한 복잡한 플랜 비교 레이아웃.

### 3-2. 사용자 플로우

```
[멤버십&크레딧 카드] "플랜 관리 →" 클릭
    ↓
setActiveMenu('subscription') 호출
DashboardLayout → SubscriptionPage 렌더링
    ↓
SubscriptionPage 상단: "← 마이페이지로 돌아가기" 버튼 (현재 미구현 → 추가 필요)
    ↓ [플랜 변경 성공]              ↓ [취소 또는 뒤로]
setActiveMenu('mypage') 자동 이동  사이드바 "마이페이지" 클릭
마이페이지 카드 플랜명 업데이트      또는 뒤로 가기 버튼
```

### 3-3. MyPage.jsx 변경 사항

```javascript
// onNavigate prop 추가
const MyPage = ({ onNavigate }) => {
  ...
  <button onClick={() => onNavigate?.('subscription')} ...>
    플랜 관리 →
  </button>
}

// DashboardLayout.jsx에서 prop 전달
<MyPage onNavigate={handleNavigate} />
```

### 3-4. SubscriptionPage 수정 사항 (별도 파일)

```jsx
// SubscriptionPage.jsx 상단에 추가
<button
  onClick={() => onNavigate?.('mypage')}
  className="flex items-center gap-1.5 text-body-7 text-primary-inactive
             hover:text-primary transition-colors mb-4">
  <ChevronLeft size={14} />
  마이페이지로 돌아가기
</button>
```

---

## 4. 인터랙션 3: "1:1 문의" — 고객 지원 접수

### 4-1. 패턴: Center Modal (인앱 폼)

**선택 이유**: 마이페이지 컨텍스트 이탈 없이 문의 접수. 3개 필드(유형·내용·이메일 확인) → Center Modal에 적합한 단순 폼.

### 4-2. 사용자 플로우

```
[footer] "1:1 문의" 클릭 (현재 <a href="#"> → <button>으로 변경)
    ↓
Center Modal 열림 (bg-black/40 오버레이 + 패널 scale-in)
배경 스크롤 잠금
첫 번째 필드("문의 유형") 자동 포커스
    ↓
[모달 내용]
  ┌─ 제목: "1:1 문의"
  ├─ 부제: "확인 후 1~2 영업일 내 이메일로 답변 드립니다."
  ├─ 이메일 표시 (읽기 전용): "[로그인 이메일]로 답변 드립니다."
  ├─ 문의 유형 (select)
  └─ 문의 내용 (textarea, 최소 10자)
  [닫기] [문의 보내기]
    ↓ (문의 보내기)
버튼 → "전송 중..." + disabled
    ↓ [성공]                          ↓ [실패]
폼 → 성공 메시지 뷰로 전환          에러 배너 표시
CheckCircle + "문의가 접수되었습니다."  버튼 재활성화
"확인" 클릭 → 모달 닫힘
```

### 4-3. 한국어 카피

| 위치 | 텍스트 |
|---|---|
| 모달 제목 | 1:1 문의 |
| 부제 | 확인 후 1~2 영업일 내 이메일로 답변 드립니다. |
| 이메일 안내 | [이메일 주소]로 답변 드립니다. |
| 문의 유형 placeholder | 문의 유형을 선택해 주세요 |
| 문의 유형 선택지 | 이용 문의 / 결제 및 플랜 / 기능 오류 / 연동 문제 / 기타 |
| 문의 내용 레이블 | 문의 내용 |
| 내용 placeholder | 불편하셨던 점을 자세히 적어주시면 더 정확하게 도와드릴 수 있어요. |
| 전송 버튼 | 문의 보내기 |
| 전송 중 버튼 | 전송 중... |
| 닫기 버튼 | 닫기 |
| 성공 제목 | 문의가 접수되었습니다. |
| 성공 부제 | 1~2 영업일 이내에 답변 드릴게요. |
| 성공 확인 버튼 | 확인 |

### 4-4. 에러 상태

| 에러 케이스 | 메시지 | 위치 | 시점 |
|---|---|---|---|
| 문의 유형 미선택 | 문의 유형을 선택해 주세요. | 필드 하단 인라인 | submit |
| 내용 10자 미만 | 내용을 10자 이상 입력해 주세요. | 필드 하단 인라인 | submit |
| API 오류 | 문의 전송에 실패했어요. 잠시 후 다시 시도해 주세요. | 모달 상단 에러 배너 | submit |

### 4-5. 컴포넌트 Tailwind 스펙

```jsx
{/* 오버레이 */}
<motion.div
  className="fixed inset-0 bg-black/40 z-[80]
             flex items-center justify-center p-4"
  onClick={handleClose}
>
  {/* ModalPanel */}
  <motion.div
    role="dialog"
    aria-modal="true"
    aria-labelledby="inquiry-modal-title"
    onClick={(e) => e.stopPropagation()}
    className="relative w-[480px] max-w-[90vw]
               bg-bg-card rounded-[24px]
               shadow-soft overflow-hidden"
  >
    {/* ModalHeader */}
    <div className="flex items-center justify-between px-6 py-5
                    border-b border-gray-100">
      <div>
        <h2 id="inquiry-modal-title"
            className="text-head-5 text-text-main">1:1 문의</h2>
        <p className="text-caption text-text-main/40 mt-0.5">
          확인 후 1~2 영업일 내 이메일로 답변 드립니다.
        </p>
      </div>
      <button aria-label="1:1 문의 닫기"
              className="w-8 h-8 flex items-center justify-center
                         rounded-lg hover:bg-bg-page transition-colors
                         focus-visible:outline-none focus-visible:ring-1
                         focus-visible:ring-primary/20">
        <X size={18} className="text-text-main/40" />
      </button>
    </div>

    {/* ModalBody */}
    {!isSuccess ? (
      <div className="px-6 py-5 space-y-4">
        {/* 이메일 표시 */}
        <div className="px-3.5 py-2.5 bg-bg-page rounded-xl">
          <p className="text-caption text-text-main/40">
            {userEmail}로 답변 드립니다.
          </p>
        </div>

        {/* 문의 유형 */}
        <div className="space-y-1.5">
          <label className="text-body-6 text-text-main">문의 유형</label>
          <select className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200
                             text-body-7 text-text-main bg-bg-card
                             focus:outline-none focus:ring-2 focus:ring-primary/20
                             focus:border-primary/40 transition-colors appearance-none">
            <option value="">문의 유형을 선택해 주세요</option>
            <option>이용 문의</option>
            <option>결제 및 플랜</option>
            <option>기능 오류</option>
            <option>연동 문제</option>
            <option>기타</option>
          </select>
          {errors.type && <p className="text-caption text-warning">문의 유형을 선택해 주세요.</p>}
        </div>

        {/* 문의 내용 */}
        <div className="space-y-1.5">
          <label className="text-body-6 text-text-main">문의 내용</label>
          <textarea
            rows={5}
            className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200
                       text-body-7 text-text-main bg-bg-card resize-none
                       focus:outline-none focus:ring-2 focus:ring-primary/20
                       focus:border-primary/40 transition-colors
                       placeholder:text-text-main/30"
            placeholder="불편하셨던 점을 자세히 적어주시면 더 정확하게 도와드릴 수 있어요."
          />
          {errors.content && <p className="text-caption text-warning">내용을 10자 이상 입력해 주세요.</p>}
        </div>
      </div>
    ) : (
      /* 성공 상태 */
      <div className="px-6 py-10 flex flex-col items-center gap-3"
           role="status" aria-live="polite">
        <CheckCircle size={40} className="text-success" />
        <p className="text-head-5 text-text-main">문의가 접수되었습니다.</p>
        <p className="text-body-7 text-text-main/50">1~2 영업일 이내에 답변 드릴게요.</p>
      </div>
    )}

    {/* ModalFooter */}
    <div className="flex items-center justify-end gap-3 px-6 py-4
                    border-t border-gray-100">
      {!isSuccess ? (
        <>
          <button onClick={handleClose}
                  className="px-5 py-2.5 rounded-lg text-btn-main
                             text-primary-inactive hover:text-primary hover:bg-primary-tint
                             transition-colors focus-visible:outline-none
                             focus-visible:ring-1 focus-visible:ring-primary/20">
            닫기
          </button>
          <button onClick={handleSubmit} disabled={isSending}
                  className="px-5 py-2.5 rounded-lg text-btn-main
                             bg-point text-white
                             transition-opacity hover:opacity-90
                             focus-visible:outline-none focus-visible:ring-2
                             focus-visible:ring-point/40
                             disabled:opacity-40 disabled:cursor-not-allowed">
            {isSending ? '전송 중...' : '문의 보내기'}
          </button>
        </>
      ) : (
        <button onClick={handleClose}
                className="px-5 py-2.5 rounded-lg text-btn-main
                           bg-primary text-white
                           transition-opacity hover:opacity-90
                           focus-visible:outline-none focus-visible:ring-2
                           focus-visible:ring-primary/40">
          확인
        </button>
      )}
    </div>
  </motion.div>
</motion.div>
```

---

## 5. 인터랙션 4: "이용 가이드" — 외부 가이드 링크

### 5-1. 패턴: 새 탭 열기 (`target="_blank"`)

**선택 이유**: 가이드는 외부 콘텐츠(Notion, 헬프센터). 새 탭으로 열면 PULSE 화면 컨텍스트 유지.

### 5-2. 사용자 플로우

```
[footer] "이용 가이드" 클릭
    ↓ [URL 확정 시]              ↓ [URL 미확정 시]
새 탭 열림 → 가이드 페이지       Toast 표시: "이용 가이드를 준비 중입니다."
                                (4초 후 자동 소멸 — 중요 액션 아님으로 허용)
```

### 5-3. 컴포넌트 Tailwind 스펙

```jsx
{/* URL 확정 시 */}
<a
  href="https://help.pulse.kr"   {/* 확정 URL로 교체 */}
  target="_blank"
  rel="noopener noreferrer"
  aria-label="서비스 이용 가이드 (새 탭에서 열림)"
  className="flex-1 flex items-center justify-center gap-1.5
             py-2 rounded-lg hover:bg-bg-page transition-colors group
             focus-visible:outline-none focus-visible:ring-1
             focus-visible:ring-primary/20"
>
  <FileText size={14} className="text-text-main/25 group-hover:text-primary
                                  transition-colors shrink-0" />
  <span className="text-body-7 text-text-main/40 group-hover:text-primary
                   transition-colors">이용 가이드</span>
  <ExternalLink size={11} className="text-text-main/20 group-hover:text-primary/50
                                      transition-colors shrink-0" />
</a>

{/* URL 미확정 시 임시 처리 */}
<button
  onClick={handleGuideClick}
  aria-label="서비스 이용 가이드"
  className="..."  {/* 동일 스타일 */}
>
  ...
</button>
```

---

## 6. 인터랙션 5: "로그아웃" — 인라인 2-step 확인

### 6-1. 패턴: Inline 2-step (버튼 → 확인 행)

**선택 이유**: Full-page overlay나 Center Modal은 "로그아웃 확인"처럼 단순한 행동에 과도하다(안티패턴 #2, #8). Footer bar 내에서 버튼 → 확인 행으로 교체하는 인라인 방식이 SaaS 맥락에 적합.

### 6-2. 사용자 플로우

```
[footer] "로그아웃" 클릭
    ↓
Footer 내 로그아웃 버튼 영역이 확인 행으로 전환
"로그아웃 하시겠어요? [로그아웃] [취소]"
    ↓ (로그아웃)              ↓ (취소 또는 ESC)
logout() → localStorage 초기화  버튼 원상 복귀
navigate('/login')
```

### 6-3. 컴포넌트 Tailwind 스펙

```jsx
const [logoutConfirming, setLogoutConfirming] = useState(false);

{/* Footer bar 내 로그아웃 영역 */}
{!logoutConfirming ? (
  <button
    onClick={() => setLogoutConfirming(true)}
    className="flex-1 flex items-center justify-center gap-1.5
               py-2 rounded-lg hover:bg-bg-page transition-colors group
               focus-visible:outline-none focus-visible:ring-1
               focus-visible:ring-primary/20"
    aria-label="로그아웃"
  >
    <LogOut size={14} className="text-text-main/25 group-hover:text-primary-inactive
                                  transition-colors shrink-0" />
    <span className="text-body-7 text-text-main/40 group-hover:text-primary-inactive
                     transition-colors">로그아웃</span>
  </button>
) : (
  <motion.div
    initial={shouldReduceMotion ? { opacity: 1 } : { opacity: 0 }}
    animate={{ opacity: 1 }}
    transition={{ duration: 0.15 }}
    className="flex-1 flex items-center justify-between gap-2
               py-1 px-2.5 rounded-lg bg-bg-page"
    role="group"
    aria-label="로그아웃 확인"
  >
    <span className="text-caption text-text-main/60 shrink-0">
      로그아웃 하시겠어요?
    </span>
    <div className="flex items-center gap-1.5">
      <button
        onClick={() => setLogoutConfirming(false)}
        aria-label="로그아웃 취소"
        className="px-2.5 py-1 text-caption text-text-main/50
                   rounded hover:bg-gray-200 transition-colors
                   focus-visible:outline-none focus-visible:ring-1
                   focus-visible:ring-primary/20"
      >
        취소
      </button>
      <button
        onClick={handleLogout}
        aria-label="로그아웃 확인"
        className="px-2.5 py-1 text-caption font-semibold
                   text-primary-inactive hover:text-primary
                   rounded hover:bg-primary-tint transition-colors
                   focus-visible:outline-none focus-visible:ring-1
                   focus-visible:ring-primary/20"
      >
        로그아웃
      </button>
    </div>
  </motion.div>
)}
```

**주의**: 로그아웃 확인 버튼에 `point` (오렌지) 금지. 파괴적 행동(세션 종료)에 행동 유도 컬러는 UX상 혼란.

### 6-4. ESC 키 처리

```javascript
useEffect(() => {
  if (!logoutConfirming) return;
  const handler = (e) => {
    if (e.key === 'Escape') setLogoutConfirming(false);
  };
  document.addEventListener('keydown', handler);
  return () => document.removeEventListener('keydown', handler);
}, [logoutConfirming]);
```

---

## 7. 인터랙션 6: "연동하기 >" — 카카오 채널 연동

### 7-1. 패턴: Right Drawer + 3-step OAuth 플로우

**선택 이유**: Center Modal은 step 전환 시 높이가 유동적으로 변해 UX가 불안정하다. Right Drawer는 높이가 고정(`h-full`)되어 step 전환 시 레이아웃 흔들림 없음. OAuth 콘텐츠는 3-step (안내 → 카카오 인증 → 완료).

### 7-2. 사용자 플로우

```
[PlatformRow — 카카오 채널] "연동하기 >" 클릭
    ↓
Right Drawer 열림
━━━━━━━━━━━━━━━━━━━━
[STEP 1/3] 연동 안내
━━━━━━━━━━━━━━━━━━━━
헤더: "카카오 채널 연동" + 진행 바 (33%)
  - MessageSquare 아이콘 (32px, text-primary)
  - 안내 문구 + 혜택 리스트 (Check 아이콘 3개)
[계속하기] [취소]
    ↓
━━━━━━━━━━━━━━━━━━━━
[STEP 2/3] 카카오 인증
━━━━━━━━━━━━━━━━━━━━
헤더: "카카오 채널 연동" + 진행 바 (66%)
  - 안내 문구
  - Info 아이콘 + 주의 사항
[카카오로 인증하기] → 팝업/새 탭 열림
인증 대기 중: "카카오 인증을 기다리는 중입니다..." (Loader2 스피너)
[이전] [취소]
    ↓ [인증 성공]              ↓ [인증 실패]
━━━━━━━━━━━━━━━━━━━━   에러 메시지 + 재시도
[STEP 3/3] 연동 완료
━━━━━━━━━━━━━━━━━━━━
헤더: "카카오 채널 연동" + 진행 바 (100%)
  - CheckCircle (40px, text-success)
  - "카카오 채널 연동이 완료되었습니다!"
  - "@[채널명]" 연동 확인
[확인] → Drawer 닫힘
PlatformRow 카카오 상태 → 'collecting' 갱신
```

### 7-3. 한국어 카피

| 위치 | 텍스트 |
|---|---|
| 드로어 제목 | 카카오 채널 연동 |
| 1단계 안내 | 카카오 채널을 연동하면 고객 메시지와 방문 현황을 PULSE에서 함께 분석할 수 있어요. |
| 1단계 혜택 1 | 고객 문의 응답률 자동 집계 |
| 1단계 혜택 2 | 채널 팔로워 추이 분석 |
| 1단계 혜택 3 | AI 마케팅 정확도 향상 |
| 1단계 계속 버튼 | 계속하기 |
| 2단계 안내 | 카카오 채널 관리자 계정으로 인증이 필요합니다. 아래 버튼을 누르면 카카오 로그인 창이 열립니다. |
| 2단계 주의 사항 | 가게의 카카오 채널 관리자 권한이 있는 계정으로 로그인해 주세요. |
| 2단계 인증 버튼 | 카카오로 인증하기 |
| 2단계 대기 메시지 | 카카오 인증을 기다리는 중입니다... |
| 2단계 팝업 차단 도움말 | 인증 창이 열리지 않나요? |
| 3단계 제목 | 카카오 채널 연동이 완료되었습니다! |
| 3단계 부제 | 이제 PULSE에서 카카오 채널 데이터를 분석할 수 있어요. |
| 3단계 확인 버튼 | 확인 |
| 이전 단계 버튼 | 이전 |
| 취소 버튼 | 취소 |

### 7-4. 에러 상태

| 에러 케이스 | 메시지 | 위치 |
|---|---|---|
| 팝업 차단 | 브라우저 팝업 차단이 활성화되어 있어요. 주소창에서 팝업 허용 후 다시 시도해 주세요. | Step 2 인라인 |
| 관리자 권한 없는 계정 | 카카오 채널 관리자 계정이 아니에요. 관리자 계정으로 다시 시도해 주세요. | Step 2 인라인 |
| 사용자가 인증 취소 | 인증이 취소되었어요. 연동을 원하시면 다시 시도해 주세요. | Step 2 인라인 |
| 이미 연동된 채널 | 이미 다른 PULSE 계정에 연동된 채널이에요. | Step 2 인라인 |
| 서버 오류 | 연동 처리 중 오류가 발생했어요. 잠시 후 다시 시도해 주세요. | Step 2 인라인 |

### 7-5. 컴포넌트 Tailwind 스펙

```jsx
{/* DrawerPanel — 수정하기와 동일 기반 */}
<motion.div className="fixed right-0 top-0 bottom-0 z-[80]
                       w-[480px] max-w-[90vw]
                       bg-bg-card flex flex-col
                       shadow-soft overflow-hidden">

  {/* DrawerHeader */}
  <div className="px-6 py-5 border-b border-gray-100 shrink-0">
    <div className="flex items-center justify-between mb-3">
      <h2 className="text-head-5 text-text-main">카카오 채널 연동</h2>
      <button aria-label="카카오 채널 연동 닫기" className="...">
        <X size={18} className="text-text-main/40" />
      </button>
    </div>
    {/* 진행 인디케이터 */}
    <div className="flex items-center gap-2">
      <p className="text-caption text-text-main/40">{step} / 3단계</p>
      <div className="flex-1 h-1 bg-bg-page rounded-full overflow-hidden">
        <div
          className="h-full bg-primary rounded-full transition-[width] duration-300"
          style={{ width: `${(step / 3) * 100}%` }}
        />
      </div>
    </div>
  </div>

  {/* DrawerBody - Step 전환 */}
  <AnimatePresence mode="wait">
    <motion.div
      key={step}
      initial={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, x: -20 }}
      transition={{ type: 'tween', duration: 0.2 }}
      className="flex-1 overflow-y-auto px-6 py-5"
    >
      {step === 1 && <KakaoStep1 />}
      {step === 2 && <KakaoStep2 />}
      {step === 3 && <KakaoStep3 />}
    </motion.div>
  </AnimatePresence>

  {/* DrawerFooter */}
  <div className="flex items-center justify-end gap-3 px-6 py-4
                  border-t border-gray-100 shrink-0">
    {step < 3 && (
      <button onClick={handleBack}
              className="px-5 py-2.5 rounded-lg text-btn-main
                         text-primary-inactive hover:text-primary hover:bg-primary-tint
                         transition-colors focus-visible:outline-none
                         focus-visible:ring-1 focus-visible:ring-primary/20">
        {step === 1 ? '취소' : '이전'}
      </button>
    )}
    {step === 1 && (
      <button onClick={() => setStep(2)}
              className="px-5 py-2.5 rounded-lg text-btn-main
                         bg-primary text-white
                         transition-opacity hover:opacity-90
                         focus-visible:outline-none focus-visible:ring-2
                         focus-visible:ring-primary/40">
        계속하기
      </button>
    )}
    {step === 2 && (
      <button onClick={handleKakaoAuth} disabled={isAuthenticating}
              className="px-5 py-2.5 rounded-lg text-btn-main
                         bg-primary text-white
                         transition-opacity hover:opacity-90
                         focus-visible:outline-none focus-visible:ring-2
                         focus-visible:ring-primary/40
                         disabled:opacity-40 disabled:cursor-not-allowed">
        {isAuthenticating ? '인증 중...' : '카카오로 인증하기'}
      </button>
    )}
    {step === 3 && (
      <button onClick={handleComplete}
              className="px-5 py-2.5 rounded-lg text-btn-main
                         bg-primary text-white
                         transition-opacity hover:opacity-90
                         focus-visible:outline-none focus-visible:ring-2
                         focus-visible:ring-primary/40">
        확인
      </button>
    )}
  </div>
</motion.div>
```

**Step 3 완료 후 PlatformRow 상태 갱신:**
```javascript
// MyPage에서 platforms state 관리
const [platforms, setPlatforms] = useState(PLATFORMS);

const handleKakaoLinkSuccess = () => {
  setPlatforms(prev =>
    prev.map(p =>
      p.id === 'kakao' ? { ...p, handle: '@연동된채널명', status: 'collecting' } : p
    )
  );
  setIsKakaoDrawerOpen(false);
};
```

---

## 8. 구현 순서 (의존성 기반)

```
Phase 1: 공유 인프라 (독립 구현 가능)
  ├─ src/components/ui/Drawer.jsx        — Right Drawer 기반
  ├─ src/components/ui/Modal.jsx         — Center Modal 기반
  └─ src/components/ui/Toast.jsx         — 경량 피드백

Phase 2: 단순 인터랙션 (Phase 1 완료 후)
  ├─ 로그아웃 인라인 2-step              — MyPage.jsx 내 state만
  ├─ 플랜 관리 페이지 이동               — onNavigate prop 추가
  └─ 이용 가이드 새 탭 링크              — href 교체

Phase 3: 복잡 인터랙션 (Phase 1 완료 후)
  ├─ 1:1 문의 Modal                      — Modal.jsx 활용
  ├─ 수정하기 Drawer                     — Drawer.jsx 활용
  └─ 카카오 연동 Drawer                  — Drawer.jsx + step state
```

---

## 9. 동반 수정 필요 사항 (ui-ux-reviewer 발견 버그)

### Severity 3 (즉시 수정)
- `MyPage.jsx:265, 274` — `href="#"` → `<button>` 변환 (1:1 문의, 이용 가이드)

### Severity 2 (인터랙션 구현 시 함께 수정)
- `MyPage.jsx:92` — `focus-visible:ring-[#FF5A36]/30` → `focus-visible:ring-point/30` (토큰 사용)
- `Sidebar.jsx:57, 95, 103, 121` — `transition-all` → `transition-[width]`, `transition-colors`, `transition-opacity` 등 개별 명시 (CLAUDE.md 위반)

### Severity 1 (여유 시 수정)
- `MyPage.jsx:88` — `text-[12px]` → `text-caption`
- "수정하기 →", "플랜 관리 →" 유니코드 화살표 → `<ChevronRight size={12} />` Lucide 아이콘

---

## 10. 미확정 사항 (개발 전 PM 확인 필요)

| 사항 | 결정 필요 내용 |
|---|---|
| 1:1 문의 수신 API | 인앱 폼 POST 엔드포인트 또는 외부 서비스(Zendesk, 채널톡) URL |
| 이용 가이드 URL | Notion 문서 또는 헬프센터 URL |
| 카카오 OAuth 클라이언트 ID | 카카오 개발자 콘솔 등록 필요 |
| error 색 토큰 | `tailwind.config.js`에 `error: '#DC2626'` 등 토큰 추가 여부 |
| 수정하기 API | AI 프로필 저장 PUT/PATCH 엔드포인트 |
