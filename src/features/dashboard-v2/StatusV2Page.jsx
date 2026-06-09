import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { RefreshCw, AlertTriangle } from 'lucide-react';
import {
    fetchDashboardData,
    getLocalDismissedIds,
    saveLocalDismissedId,
} from './services/dashboardV2Api';
import { fetchLatestAnalysisData } from '../insight/api/analysisApi';
import { buildStoreInsightFromAnalysisData, getLocalStoreProfile } from '../influencer/influencerMatchingUtils';

const FASTAPI_URL = import.meta.env.VITE_FASTAPI_BASE_URL || 'http://127.0.0.1:8000/api';
import V2Skeleton from './components/V2Skeleton';
import V2ReelsImpactHero from './components/V2ReelsImpactHero';
import V2TodaySignalCard from './components/V2TodaySignalCard';
import V2KpiTile from './components/V2KpiTile';
import V2TodayBrief from './components/V2TodayBrief';
import V2ActionCard from './components/V2ActionCard';
import V2AiSuggestionCard from './components/V2AiSuggestionCard';
import V2PersonaSummary from './components/V2PersonaSummary';
import V2WeatherWidget from './components/V2WeatherWidget';
import V2TrendChart from './components/V2TrendChart';
import V2ErrorBoundary from './components/V2ErrorBoundary';
import V2TrendDetailDrawer from './components/V2TrendDetailDrawer';

// ISO 8601 UTC → KST 표시 포맷
const formatBaseTime = (isoString) => {
    if (!isoString) return '업데이트 시간 확인 불가';
    try {
        const date = new Date(isoString);
        if (isNaN(date.getTime())) return '업데이트 시간 확인 불가';

        const now = new Date();
        const diffMins = Math.floor((now - date) / 60000);

        if (diffMins < 1) return '방금 전';
        if (diffMins < 60) return `업데이트 ${diffMins}분 전`;

        const kstOffset = 9 * 60 * 60 * 1000;
        const kst = new Date(date.getTime() + kstOffset);
        const nowKst = new Date(now.getTime() + kstOffset);

        const y = kst.getUTCFullYear();
        const m = kst.getUTCMonth() + 1;
        const d = kst.getUTCDate();
        const hh = String(kst.getUTCHours()).padStart(2, '0');
        const mm = String(kst.getUTCMinutes()).padStart(2, '0');

        const isToday =
            nowKst.getUTCFullYear() === y &&
            nowKst.getUTCMonth() + 1 === m &&
            nowKst.getUTCDate() === d;

        return isToday ? `${hh}:${mm} 기준` : `${m}월 ${d}일 ${hh}:${mm} 기준`;
    } catch {
        return '업데이트 시간 확인 불가';
    }
};

const LOADING_TIPS = [
    '요즘 뜨는 주변 상권 해시태그를 분석하고 있어요 🔍',
    '오늘의 날씨와 유동인구 데이터를 확인 중이에요 ☀️',
    '우리 가게 방문 손님 데이터를 가져오는 중이에요 🏃‍♂️',
    '가장 효율적인 마케팅 액션을 고민 중이에요 🤔',
];

// 손님분석 페르소나 표시용 이모지 팔레트 (콘텐츠 장식용, 순환 배정)
const PERSONA_EMOJIS = ['🙋', '🍽️', '☕', '✨', '💬', '🛍️'];

const StatusV2Page = ({ onNavigate }) => {
    const shouldReduceMotion = useReducedMotion();
    const [data, setData] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);
    const [loadingTip, setLoadingTip] = useState('');
    const [error, setError] = useState(null);
    const [dismissedIds, setDismissedIds] = useState(() => getLocalDismissedIds());

    // 로딩 지연 안내
    const [delayWarning, setDelayWarning] = useState(false);
    const [retryVisible, setRetryVisible] = useState(false);

    const loadData = useCallback(async (isRefreshAction = false) => {
        if (isRefreshAction) {
            setIsRefreshing(true);
            setLoadingTip(LOADING_TIPS[Math.floor(Math.random() * LOADING_TIPS.length)]);
        } else {
            setIsLoading(true);
            setDelayWarning(false);
            setRetryVisible(false);
        }
        setError(null);

        try {
            // storeId: 실제 연동 시 인증 컨텍스트(userProfile 등)에서 주입
            const response = await fetchDashboardData('store_123', isRefreshAction);
            if (response.success) {
                // 손님 페르소나 위젯은 실제 손님분석(DeepSeek) 결과로 교체 (best-effort).
                let analysis = null;
                try {
                    analysis = await fetchLatestAnalysisData();
                } catch {
                    /* 분석 결과 없음 — mock 페르소나 유지 */
                }
                if (analysis?.personas?.length && response.data.insights) {
                    response.data.insights.personas = analysis.personas.slice(0, 3).map((persona, index) => ({
                        emoji: PERSONA_EMOJIS[index % PERSONA_EMOJIS.length],
                        label: persona.nickname || persona.tags?.[0] || '단골 손님',
                        detail: persona.summary || (persona.tags || []).join(', '),
                    }));
                }

                // '오늘의 기회 신호'는 네이버 DataLab 검색어 트렌드로 교체 (best-effort).
                // 후보 키워드는 손님분석 키워드(없으면 가게 업종 기반)에서 추출한다.
                try {
                    const insight = analysis
                        ? buildStoreInsightFromAnalysisData(analysis)
                        : getLocalStoreProfile();
                    const signalResponse = await fetch(`${FASTAPI_URL}/insights/search-signal`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            candidates: insight?.keywords || [],
                            category: insight?.category || '',
                        }),
                    });
                    if (signalResponse.ok) {
                        const signal = await signalResponse.json();
                        response.data.todaySignal = { state: 'default', ...signal };
                    }
                } catch {
                    /* DataLab 미연동/오류 — mock 신호 유지 */
                }

                // 서버 dismissedIds와 localStorage 병합 (서버 정본 우선, MVP+1 연동 대비)
                const serverDismissed = response.data.dismissedIds || [];
                const localDismissed = getLocalDismissedIds();
                const merged = [...new Set([...serverDismissed, ...localDismissed])];
                setDismissedIds(merged);
                setData(response.data);
            }
        } catch (err) {
            setError('가게 데이터를 불러오지 못했어요.');
            console.error('Dashboard API Error:', err);
        } finally {
            setIsLoading(false);
            setIsRefreshing(false);
        }
    }, []);

    useEffect(() => {
        loadData();
    }, [loadData]);

    // 3초 후 지연 안내, 10초 후 재시도 CTA
    useEffect(() => {
        if (!isLoading) {
            setDelayWarning(false);
            setRetryVisible(false);
            return;
        }
        const t1 = setTimeout(() => setDelayWarning(true), 3000);
        const t2 = setTimeout(() => setRetryVisible(true), 10000);
        return () => {
            clearTimeout(t1);
            clearTimeout(t2);
        };
    }, [isLoading]);

    const handleDismiss = useCallback((id) => {
        if (!id) return;
        saveLocalDismissedId(id);
        setDismissedIds((prev) => [...new Set([...prev, id])]);
    }, []);

    const baseTimeLabel =
        data?.metadata?.baseTime ? formatBaseTime(data.metadata.baseTime) : null;

    const visibleOperational = (data?.actions?.operational || []).filter(
        (op) => !dismissedIds.includes(op.id)
    );
    const aiSuggestion = data?.actions?.aiSuggestion;
    const showAi = aiSuggestion && !dismissedIds.includes(aiSuggestion.id);

    return (
        <div className={`flex flex-col h-full overflow-hidden bg-[#F5F7FA] relative pt-2${isDrawerOpen ? ' md:rounded-[24px]' : ''}`}>

            {/* 페이지 헤더: 마지막 업데이트 시간 + 새로고침 */}
            <div className="flex items-center justify-end mb-2 shrink-0">
                <button
                    onClick={() => !isRefreshing && loadData(true)}
                    disabled={isRefreshing}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-full border shadow-sm transition-colors duration-200 text-[12px] font-bold tracking-wide
                        ${isRefreshing
                            ? 'bg-gray-100 border-gray-200 text-gray-400 cursor-not-allowed'
                            : 'bg-[#EBF1FF] hover:bg-[#DCE6FF] border-[#C2D6FF] hover:border-[#99BDFC] hover:shadow-md text-[#002B7A] cursor-pointer'
                        }`}
                >
                    <span>{baseTimeLabel || '업데이트 중'}</span>
                    <RefreshCw
                        size={14}
                        className={isRefreshing
                            ? 'animate-spin'
                            : shouldReduceMotion ? '' : 'hover:rotate-180 transition-transform duration-500'
                        }
                    />
                </button>
            </div>

            {/* 새로고침 토스트 */}
            <AnimatePresence>
                {isRefreshing && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 20 }}
                        className="absolute bottom-8 left-1/2 -translate-x-1/2 z-[100] bg-gray-900/80 backdrop-blur-md text-white px-6 py-3 rounded-full shadow-2xl flex items-center gap-3 border border-gray-700/50"
                    >
                        <RefreshCw size={16} className="animate-spin text-blue-400" />
                        <span className="text-[13px] font-bold tracking-wide">{loadingTip}</span>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* 로딩 지연 안내 토스트 (3초 후 표시) */}
            <AnimatePresence>
                {isLoading && delayWarning && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 20 }}
                        className="absolute bottom-8 left-1/2 -translate-x-1/2 z-[100] bg-gray-900/80 backdrop-blur-md text-white px-6 py-3 rounded-full shadow-2xl flex items-center gap-3 border border-gray-700/50"
                    >
                        <span className="text-[13px] font-medium">
                            데이터를 불러오는 중이에요. 잠시만 기다려 주세요.
                        </span>
                        {retryVisible && (
                            <button
                                onClick={() => loadData()}
                                className="ml-2 px-3 py-1 bg-white text-gray-900 rounded-full text-[12px] font-bold hover:bg-gray-100 transition-colors shrink-0"
                            >
                                다시 불러오기
                            </button>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>

            {/* 메인 콘텐츠 영역 */}
            <AnimatePresence mode="wait">

                {/* 로딩: 스켈레톤 */}
                {isLoading && <V2Skeleton key="skeleton" />}

                {/* 오류 상태 */}
                {!isLoading && error && (
                    <motion.div
                        key="error"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        className="flex-1 flex gap-6 mt-2 min-h-0"
                    >
                        {/* Left — 에러 메시지 */}
                        <div className="flex-[1.4] flex flex-col items-center justify-center gap-4 overflow-hidden min-h-0">
                            <AlertTriangle size={40} className="text-orange-400" />
                            <p className="text-[18px] font-bold text-[#191F28]">
                                가게 데이터를 불러오지 못했어요.
                            </p>
                            <p className="text-[14px] text-gray-500">
                                연결 상태를 확인한 뒤 다시 시도해 주세요.
                            </p>
                            <button
                                onClick={() => loadData()}
                                className="mt-2 bg-[#FF5A36] text-white px-6 py-2.5 rounded-xl font-bold text-[15px] hover:opacity-90 transition-opacity"
                            >
                                다시 시도
                            </button>
                        </div>

                        {/* Right — ghost 카드 */}
                        <div className="flex-1 md:flex-none md:w-[480px] bg-white rounded-t-[24px] rounded-bl-[24px] border border-gray-100 shadow-sm flex flex-col p-6 overflow-hidden shrink-0">
                            <div className="flex flex-col gap-3">
                                <div className="h-5 bg-gray-100 rounded w-1/3 animate-pulse" />
                                <div className="h-[160px] bg-gray-100 rounded-[24px] animate-pulse" />
                                <div className="h-[80px] bg-gray-100 rounded-xl animate-pulse" />
                            </div>
                        </div>
                    </motion.div>
                )}

                {/* 정상 데이터 */}
                {!isLoading && !error && data && (
                    <motion.div
                        key="content"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.4 }}
                        className="flex-1 flex flex-col md:flex-row gap-6 mt-2 min-h-0"
                    >
                        {/* -------------------------------------------------------- */}
                        {/* LEFT PANE — Facts                                        */}
                        {/* 1440×900·1280×800에서는 스크롤 없음, 소형 화면에서는 허용  */}
                        {/* -------------------------------------------------------- */}
                        <div className="flex-[1.4] flex flex-col gap-4 overflow-y-auto scrollbar-hide pr-2 min-h-0">

                            {/* Hero — 단독 row */}
                            <V2ReelsImpactHero
                                data={data.reelsImpact}
                                onCta={() => onNavigate && onNavigate('promotion')}
                            />

                            {/* KPI Strip: ① 검색 노출 · ③ 오늘의 기회 신호 */}
                            <div className="flex flex-wrap xl:flex-nowrap items-start gap-6 xl:gap-10 shrink-0">
                                <V2KpiTile
                                    label="프로필 방문"
                                    currentValue={data.searchTrend.value}
                                    unit={data.searchTrend.unit}
                                    compareText={data.searchTrend.compareText}
                                    compareStatus={data.searchTrend.compareStatus}
                                    source={data.searchTrend.source}
                                    period={data.searchTrend.period}
                                    baseTime={data.metadata.baseTime}
                                    state={data.searchTrend.state}
                                />
                                <div className="w-px h-12 bg-gray-200 mt-1 hidden xl:block" />
                                <V2TodaySignalCard data={data.todaySignal} />
                            </div>

                            {/* 구분선 */}
                            <div className="w-full h-px bg-gray-200 shrink-0" />

                            {/* 날씨 + 페르소나 — 가로 한 줄 배치로 세로 공간 절약 */}
                            {(data.insights?.weather || data.insights?.personas?.length > 0) && (
                                <div className="flex gap-3 shrink-0 items-stretch">
                                    {data.insights?.weather && (
                                        <div className="flex-[3] min-w-0">
                                            <V2ErrorBoundary>
                                                <V2WeatherWidget weatherType={data.insights.weather.type} />
                                            </V2ErrorBoundary>
                                        </div>
                                    )}
                                    {data.insights?.personas?.length > 0 && (
                                        <div className="flex-[7] min-w-0">
                                            <V2PersonaSummary personas={data.insights.personas} />
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* 트렌드 차트 — 남은 공간을 flex-1로 채움 */}
                            {data.trendChart && (
                                <div className="flex-1 min-h-0">
                                    <V2TrendChart
                                        title={data.trendChart.title}
                                        seriesData={data.trendChart.seriesData}
                                        lineDataKey="value"
                                        onDetailClick={() => setIsDrawerOpen(true)}
                                        isDetailOpen={isDrawerOpen}
                                    />
                                </div>
                            )}
                        </div>

                        {/* -------------------------------------------------------- */}
                        {/* RIGHT PANE — Actions                                     */}
                        {/* 1440×900·1280×800에서는 스크롤 없음, 소형 화면에서는 허용  */}
                        {/* -------------------------------------------------------- */}
                        <div className="flex-1 md:flex-none md:w-[480px] bg-white rounded-t-[24px] rounded-bl-[24px] border border-gray-100 shadow-sm flex flex-col p-6 overflow-y-auto scrollbar-hide shrink-0">

                            {/* Today Brief */}
                            <div className="mb-4 shrink-0">
                                <h2 className="text-[14px] font-bold text-gray-400 tracking-wide flex items-center gap-2 mb-2">
                                    <span className="w-2 h-2 rounded-full bg-blue-500" />
                                    오늘의 우리 가게 요약 💡
                                </h2>
                                <V2TodayBrief
                                    highlightedSegments={data.todayBrief}
                                />
                            </div>

                            <div className="w-full h-px bg-gray-100 my-2 shrink-0" />

                            {/* Actions */}
                            <div className="flex flex-col gap-4 flex-1 min-h-0">
                                <h2 className="text-[14px] font-bold text-gray-400 tracking-wide flex items-center gap-2 shrink-0">
                                    <span className="w-2 h-2 rounded-full bg-[#FF5A36]" />
                                    지금 당장 해볼까요? ⚡
                                </h2>

                                {/* AI 제안 — 1개, dismiss 가능 */}
                                {showAi && (
                                    <V2AiSuggestionCard
                                        id={aiSuggestion.id}
                                        evidence={aiSuggestion.evidence}
                                        confidence={aiSuggestion.confidence}
                                        content={aiSuggestion.content}
                                        ctaText={aiSuggestion.ctaLabel}
                                        isNew={aiSuggestion.isNew}
                                        onHide={handleDismiss}
                                        onCta={() => onNavigate && onNavigate('promotion')}
                                    />
                                )}

                                {/* Operational 카드 — 0~2개, BE 평가 결과만 렌더 */}
                                {visibleOperational.map((op) => (
                                    <V2ActionCard
                                        key={op.id}
                                        urgency={op.urgency}
                                        title={op.title}
                                        description={op.description}
                                        ctaText={op.ctaLabel}
                                        onAction={() =>
                                            onNavigate && onNavigate('promotion')
                                        }
                                    />
                                ))}

                                {/* Actions가 모두 dismiss된 경우 */}
                                {!showAi && visibleOperational.length === 0 && (
                                    <p className="text-[14px] text-gray-400 font-medium py-4 text-center">
                                        오늘 추천할 액션을 준비 중이에요.
                                    </p>
                                )}
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Drawer — StatusV2Page(relative+overflow-hidden) 내에서 absolute 렌더링
                backdrop + panel 모두 main content area로 격리, 사이드바 미침범 */}
            <V2TrendDetailDrawer
                isOpen={isDrawerOpen}
                onClose={() => setIsDrawerOpen(false)}
                data={data?.trendChartDetail ?? null}
            />
        </div>
    );
};

export default StatusV2Page;
