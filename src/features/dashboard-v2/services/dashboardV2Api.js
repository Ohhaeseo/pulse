/**
 * GET /api/dashboard/{storeId}/store-status
 *
 * @param {string}  storeId   - 가게 식별자 (BE 연결 시 필수, 현재 mock)
 * @param {boolean} isRefresh - 수동 새로고침 여부 (mock 전용 — BE 연결 시 제거)
 *
 * BE 연결 시 교체 예시:
 *   const res = await fetch(`/api/dashboard/${storeId}/store-status`, {
 *     headers: { Authorization: `Bearer ${getAccessToken()}` },
 *   });
 *   return res.json();
 *
 * 응답 스키마 전체는 dashboardV2Api.js mock 반환값을 SSOT로 참조.
 * metadata.baseTime은 ISO 8601 UTC 문자열로 반환.
 */
export const fetchDashboardData = async (storeId = 'store_123', isRefresh = false) => {
    return new Promise((resolve) => {
        setTimeout(() => {
            const baseTime = new Date().toISOString();
            const reachVal = isRefresh
                ? 12000 + Math.floor(Math.random() * 1000)
                : 12430;
            const searchVal = isRefresh
                ? (5100 + Math.floor(Math.random() * 300)).toLocaleString()
                : '5,210';

            resolve({
                success: true,
                data: {
                    metadata: { baseTime, storeId: 'store_123' },
                    reelsImpact: {
                        state: 'default',
                        source: '인스타그램',
                        period: '이번 주',
                        hero: {
                            // primaryMetric은 선택 필드. FE fallback: primaryMetric → reach → saves
                            reach: {
                                value: reachVal,
                                unit: '회',
                                compareText: '지난 주 대비 +18%',
                                compareStatus: 'up',
                            },
                            saves: { value: 531, unit: '명' },
                            saveRate: { value: 4.2, unit: '%' },
                            comments: { value: 87, unit: '건' },
                        },
                    },
                    searchTrend: {
                        state: 'default',
                        source: '인스타그램',
                        period: '이번 주',
                        value: searchVal,
                        unit: '회',
                        compareText: '지난 주보다 +23%',
                        compareStatus: 'up',
                    },
                    todaySignal: {
                        state: 'default',
                        source: '네이버 DataLab',
                        period: '이번 주',
                        keyword: '타코야키',
                        signal: '검색 증가',
                        intensity: 'high',
                    },
                    todayBrief: [
                        { text: '오늘 흐린 날씨, 이번 주 ', isHighlight: false },
                        { text: '릴스 도달수가 꾸준히 오르고 있어요. ', isHighlight: true },
                        {
                            text: '지금이 업로드하기 딱 좋은 타이밍이에요! ☁️',
                            isHighlight: false,
                        },
                    ],
                    actions: {
                        aiSuggestion: {
                            id: 'sug_002',
                            evidence: '소식 안 올린 지 5일째',
                            confidence: 'high',
                            content:
                                '소식이 없으니 단골 손님들이 궁금해할 때예요. 릴스 하나 올려서 손님들의 발길을 다시 돌려볼까요?',
                            ctaLabel: '주말용 추천 릴스 만들기 🎬',
                            isNew: true,
                        },
                        operational: [
                            {
                                id: 'opt_003',
                                title: '저장률 감소',
                                description:
                                    '이번 주 릴스 저장률이 지난 주보다 낮아졌어요. 문구 강조형 콘텐츠로 바꿔보는 건 어떨까요?',
                                ctaLabel: '문구 강조 템플릿 보기 📝',
                                urgency: 'medium',
                            },
                        ],
                    },
                    insights: {
                        weather: { type: isRefresh ? ['cloudy', 'rain', 'clear_day', 'partly_cloudy_day'][Math.floor(Math.random() * 4)] : 'cloudy' },
                        personas: [
                            { emoji: '🧀', label: '치즈폭탄', detail: '이번 주 릴스 댓글에서 자주 언급된 키워드예요' },
                            { emoji: '🍷', label: '분위기 좋은', detail: '인스타그램 도달 기준 반응이 높은 고객 유형이에요' },
                        ],
                    },
                    trendChart: {
                        title: '릴스 업로드 전후 도달수 변화 📈',
                        seriesData: [
                            { name: 'D-3', value: 80 },
                            { name: 'D-2', value: 90 },
                            { name: 'D-1', value: 85 },
                            { name: '업로드', value: 160 },
                            { name: 'D+1', value: 155 },
                            { name: 'D+2', value: 180 },
                            { name: 'D+3', value: 210 },
                        ],
                    },
                    // BE 연동 시: GET /api/dashboard/{storeId}/trend-detail 로 교체
                    trendChartDetail: {
                        period: {
                            startDate: '2026-04-26',
                            endDate: '2026-05-23',
                        },
                        dailySeries: [
                            { date: '2026-04-26', reach: 280 },
                            { date: '2026-04-27', reach: 320 },
                            { date: '2026-04-28', reach: 310 },
                            { date: '2026-04-29', reach: 290 },
                            { date: '2026-04-30', reach: 750 },
                            { date: '2026-05-01', reach: 620 },
                            { date: '2026-05-02', reach: 480 },
                            { date: '2026-05-03', reach: 350 },
                            { date: '2026-05-04', reach: 310 },
                            { date: '2026-05-05', reach: 330 },
                            { date: '2026-05-06', reach: 290 },
                            { date: '2026-05-07', reach: 820 },
                            { date: '2026-05-08', reach: 680 },
                            { date: '2026-05-09', reach: 510 },
                            { date: '2026-05-10', reach: 380 },
                            { date: '2026-05-11', reach: 340 },
                            { date: '2026-05-12', reach: 360 },
                            { date: '2026-05-13', reach: 310 },
                            { date: '2026-05-14', reach: 890 },
                            { date: '2026-05-15', reach: 740 },
                            { date: '2026-05-16', reach: 560 },
                            { date: '2026-05-17', reach: 420 },
                            { date: '2026-05-18', reach: 380 },
                            { date: '2026-05-19', reach: 410 },
                            { date: '2026-05-20', reach: 350 },
                            { date: '2026-05-21', reach: 860 },
                            { date: '2026-05-22', reach: 700 },
                            { date: '2026-05-23', reach: 530 },
                        ],
                        reelsContribution: [
                            {
                                id: 'reel_2026_0521',
                                title: '신메뉴 소개 릴스',
                                postedAt: '2026-05-21',
                                reach: 4200,
                                contributionRate: 36,
                            },
                            {
                                id: 'reel_2026_0514',
                                title: '주말 특별 세트 홍보',
                                postedAt: '2026-05-14',
                                reach: 3840,
                                contributionRate: 33,
                            },
                            {
                                id: 'reel_2026_0507',
                                title: '단골 손님 인터뷰',
                                postedAt: '2026-05-07',
                                reach: 3620,
                                contributionRate: 31,
                            },
                        ],
                        peakDay: {
                            dayOfWeek: '목요일',
                            avgReach: 830,
                            insightText: '이번 기간에는 목요일 반응이 가장 높았어요.',
                        },
                    },
                    dismissedIds: [],
                },
            });
        }, 800);
    });
};

// MVP: localStorage 기반 dismiss (MVP+1에서 서버 동기화 추가 예정)
const DISMISS_STORAGE_KEY = 'pulse_dismissed_ids';

export const getLocalDismissedIds = () => {
    try {
        return JSON.parse(localStorage.getItem(DISMISS_STORAGE_KEY) || '[]');
    } catch {
        return [];
    }
};

export const saveLocalDismissedId = (id) => {
    const ids = getLocalDismissedIds();
    if (!ids.includes(id)) {
        localStorage.setItem(DISMISS_STORAGE_KEY, JSON.stringify([...ids, id]));
    }
};
