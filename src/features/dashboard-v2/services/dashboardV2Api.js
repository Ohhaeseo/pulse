/**
 * 가게 현황 대시보드 API 클라이언트.
 *
 * 실데이터: Spring `GET /api/dashboard/{storeId}/store-status` (집계)
 *   - todaySignal(네이버 DataLab), insights(weather/personas), todayBrief, actions, dismissedIds
 * Instagram 의존 섹션(reelsImpact/searchTrend/trendChart)은 아직 미연동이라
 *   서버가 state:"first_time"(또는 생략)으로 내려주며, 데모 완결성을 위해 mock 시각자료로 폴백한다.
 *   → Instagram Graph API 연동 시 서버가 실데이터(state:"default")를 내려주면 자동 교체된다.
 * 토큰이 없거나 호출 실패 시에도 mock으로 graceful 폴백한다.
 */
import { getToken } from '../../auth/api/authApi';

const SPRING_API_BASE_URL = import.meta.env.VITE_SPRING_API_BASE_URL || 'http://localhost:8080/api';

const authHeaders = () => {
    const token = getToken();
    return {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };
};

// 인증 사용자의 실제 storeId 조회 (GET /api/v1/users/me/store → data.id)
const resolveStoreId = async () => {
    try {
        const res = await fetch(`${SPRING_API_BASE_URL}/v1/users/me/store`, { headers: authHeaders() });
        if (!res.ok) return null;
        const body = await res.json();
        return body?.data?.id ?? null;
    } catch {
        return null;
    }
};

const isFirstTime = (section) => !section || section.state === 'first_time' || section.state === 'error';
const hasActions = (actions) => !!(actions && (actions.aiSuggestion || (actions.operational || []).length));

// 서버 실데이터를 mock 위에 병합. Instagram 섹션은 first_time이면 mock 시각자료 유지.
const mergeWithMock = (server, mock) => ({
    ...mock,
    ...server,
    metadata: server.metadata || mock.metadata,
    reelsImpact: isFirstTime(server.reelsImpact) ? mock.reelsImpact : server.reelsImpact,
    searchTrend: isFirstTime(server.searchTrend) ? mock.searchTrend : server.searchTrend,
    todaySignal: server.todaySignal?.state === 'error' ? mock.todaySignal : (server.todaySignal || mock.todaySignal),
    todayBrief: server.todayBrief?.length ? server.todayBrief : mock.todayBrief,
    actions: hasActions(server.actions) ? server.actions : mock.actions,
    insights: {
        weather: server.insights?.weather ?? mock.insights.weather,
        personas: server.insights?.personas?.length ? server.insights.personas : mock.insights.personas,
    },
    trendChart: server.trendChart || mock.trendChart,
    trendChartDetail: server.trendChartDetail || mock.trendChartDetail,
    dismissedIds: server.dismissedIds || [],
});

/**
 * GET /api/dashboard/{storeId}/store-status
 * @param {number|string|null} storeId - 미지정 시 /me/store로 자동 해석
 * @param {boolean} isRefresh - 수동 새로고침 여부(mock 폴백 시 살짝 변동)
 */
export const fetchDashboardData = async (storeId = null, isRefresh = false) => {
    const token = getToken();
    const mock = buildMockData(isRefresh);

    // 미인증/개발 바이패스 → mock
    if (!token || token === 'dev-bypass-token') {
        return { success: true, data: mock };
    }

    try {
        const id = storeId ?? (await resolveStoreId());
        if (!id) return { success: true, data: mock };

        const res = await fetch(`${SPRING_API_BASE_URL}/dashboard/${id}/store-status`, {
            headers: authHeaders(),
        });
        if (!res.ok) return { success: true, data: mock };

        const body = await res.json();
        if (!body?.success || !body?.data) return { success: true, data: mock };

        return { success: true, data: mergeWithMock(body.data, mock) };
    } catch (err) {
        console.warn('[dashboard] 실시간 데이터 호출 실패 — mock 폴백', err);
        return { success: true, data: mock };
    }
};

// 추천 카드 dismiss 서버 영속화 (POST /api/dashboard/{storeId}/dismiss). 실패 시 false.
export const dismissCardOnServer = async (storeId, cardId) => {
    const token = getToken();
    if (!token || token === 'dev-bypass-token' || !storeId) return false;
    try {
        const res = await fetch(`${SPRING_API_BASE_URL}/dashboard/${storeId}/dismiss`, {
            method: 'POST',
            headers: authHeaders(),
            body: JSON.stringify({ cardId }),
        });
        return res.ok;
    } catch {
        return false;
    }
};

export { resolveStoreId };

// ─────────────────────────────────────────────────────────────────────────────
// Instagram 미연동 구간 동안 시각자료를 채우는 mock (reels/searchTrend/trendChart 위주).
// 실데이터가 들어오는 섹션은 mergeWithMock에서 서버값으로 덮어쓴다.
function buildMockData(isRefresh = false) {
    const baseTime = new Date().toISOString();
    const reachVal = isRefresh ? 12000 + Math.floor(Math.random() * 1000) : 12430;
    const searchVal = isRefresh ? (5100 + Math.floor(Math.random() * 300)).toLocaleString() : '5,210';

    return {
        metadata: { baseTime, storeId: 'store_123' },
        reelsImpact: {
            state: 'default',
            source: '인스타그램',
            period: '이번 주',
            hero: {
                reach: { value: reachVal, unit: '회', compareText: '지난 주 대비 +18%', compareStatus: 'up' },
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
            { text: '지금이 업로드하기 딱 좋은 타이밍이에요! ☁️', isHighlight: false },
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
            weather: { type: 'cloudy' },
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
        trendChartDetail: {
            period: { startDate: '2026-04-26', endDate: '2026-05-23' },
            dailySeries: [
                { date: '2026-04-26', reach: 280 }, { date: '2026-04-27', reach: 320 },
                { date: '2026-04-28', reach: 310 }, { date: '2026-04-29', reach: 290 },
                { date: '2026-04-30', reach: 750 }, { date: '2026-05-01', reach: 620 },
                { date: '2026-05-02', reach: 480 }, { date: '2026-05-03', reach: 350 },
                { date: '2026-05-04', reach: 310 }, { date: '2026-05-05', reach: 330 },
                { date: '2026-05-06', reach: 290 }, { date: '2026-05-07', reach: 820 },
                { date: '2026-05-08', reach: 680 }, { date: '2026-05-09', reach: 510 },
                { date: '2026-05-10', reach: 380 }, { date: '2026-05-11', reach: 340 },
                { date: '2026-05-12', reach: 360 }, { date: '2026-05-13', reach: 310 },
                { date: '2026-05-14', reach: 890 }, { date: '2026-05-15', reach: 740 },
                { date: '2026-05-16', reach: 560 }, { date: '2026-05-17', reach: 420 },
                { date: '2026-05-18', reach: 380 }, { date: '2026-05-19', reach: 410 },
                { date: '2026-05-20', reach: 350 }, { date: '2026-05-21', reach: 860 },
                { date: '2026-05-22', reach: 700 }, { date: '2026-05-23', reach: 530 },
            ],
            reelsContribution: [
                { id: 'reel_2026_0521', title: '신메뉴 소개 릴스', postedAt: '2026-05-21', reach: 4200, contributionRate: 36 },
                { id: 'reel_2026_0514', title: '주말 특별 세트 홍보', postedAt: '2026-05-14', reach: 3840, contributionRate: 33 },
                { id: 'reel_2026_0507', title: '단골 손님 인터뷰', postedAt: '2026-05-07', reach: 3620, contributionRate: 31 },
            ],
            peakDay: { dayOfWeek: '목요일', avgReach: 830, insightText: '이번 기간에는 목요일 반응이 가장 높았어요.' },
        },
        dismissedIds: [],
    };
}

// localStorage 기반 dismiss (서버 동기화 실패 시 폴백 + 서버 정본과 병합)
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
