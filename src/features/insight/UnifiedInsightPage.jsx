import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, Users, Sparkles, AlertCircle, ChevronRight, Trophy, Clock, TrendingUp, Film, Loader2 } from 'lucide-react';
import JourneyMapSection from './JourneyMapSection';
import ReelCreationModal from './components/ReelCreationModal';

const FASTAPI_URL = import.meta.env.VITE_FASTAPI_BASE_URL || 'http://127.0.0.1:8000/api';
const USE_MOCK_ANALYSIS = import.meta.env.VITE_USE_MOCK_ANALYSIS === 'true';

// ─── 목업 데이터 (API 연결 실패 시 fallback) ────────────────────────────────
// API 응답 구조와 동일하게 유지해야 합니다.
const MOCK_ANALYSIS_DATA = {
    store_name: '범계 로데오점',
    store_summary: '범계역 로데오거리의 대표 맛집. 직장인 점심과 저녁 회식 수요가 높으며 재방문율이 높은 가게입니다.',
    average_rating: 4.5,
    total_reviews: 128,
    personas: [
        {
            id: 1,
            nickname: '시원한 국물파',
            summary: '해장이 필요한 직장인, 시원한 국물 맛집을 찾아요',
            img: 'https://api.dicebear.com/7.x/adventurer/svg?seed=hangover',
            tags: ['30대', '직장인', '해장'],
            overall_comment: '해장 수요가 높은 고객층으로 국물 메뉴 퀄리티와 속도가 핵심입니다. 이 그룹을 잡으면 평일 오전 매출이 올라갑니다.',
            action_recommendation: '"10분 완성 해장국" 릴스를 제작해 월요일 아침에 업로드하세요. 공유율이 높아집니다.',
            journey: {
                explore: {
                    action: '"범계 해장국 맛집" 키워드로 네이버 지도 검색',
                    thought: '어제 너무 마셨는데... 빨리 속 풀어줄 곳이 필요해.',
                    type: 'neutral',
                    painPoint: '검색 결과에 가게 사진과 메뉴가 불명확해 선택이 어려움',
                    opportunity: '네이버 플레이스에 해장 메뉴 대표 사진을 등록하면 클릭률이 올라갑니다.'
                },
                visit: {
                    action: '출근 전 8시 30분에 방문',
                    thought: '줄이 없네! 바로 앉을 수 있겠다.',
                    type: 'good',
                    opportunity: '오전 시간대 방문 고객에게 "얼리버드 사이드 메뉴" 서비스를 제공하면 충성도가 높아집니다.'
                },
                eat: {
                    action: '순댓국 + 공깃밥 주문, 빠른 서빙 기대',
                    thought: '국물이 진하고 뜨끈해서 딱 좋다. 역시 여기야.',
                    type: 'good',
                    opportunity: '"단골 순댓국" 사진 콘텐츠를 만들어 리뷰 작성을 유도하세요.'
                },
                share: {
                    action: '지인에게 "여기 해장은 여기" 카톡 공유',
                    thought: '나처럼 고생하는 친구한테 알려줘야지.',
                    type: 'good',
                    opportunity: '"영수증 리뷰" 이벤트로 공유 행동을 공식화하면 신규 유입이 늘어납니다.'
                }
            }
        },
        {
            id: 2,
            nickname: '가성비 직장인',
            summary: '빠른 점심이 필요한 직장인, 가성비와 속도를 중시해요',
            img: 'https://api.dicebear.com/7.x/adventurer/svg?seed=worker',
            tags: ['20-30대', '점심', '가성비'],
            overall_comment: '점심 피크타임 회전율이 핵심입니다. 이 그룹은 대기 시간에 매우 민감하며, 한 번 만족하면 고정 단골이 됩니다.',
            action_recommendation: '"5분 안에 나오는 점심" 특선을 만들고, 테이블 QR 주문을 도입해보세요.',
            journey: {
                explore: {
                    action: '동료와 함께 "오늘 뭐 먹지" 카톡 상의 후 결정',
                    thought: '12시 30분까지 돌아와야 하는데... 빠른 데 어디 없나?',
                    type: 'neutral',
                    opportunity: '"10분 이내 제공 보장" 안내판을 가게 앞에 붙이면 선택받을 확률이 높아집니다.'
                },
                visit: {
                    action: '12시 5분 방문, 줄 서서 대기',
                    thought: '사람이 많네. 빨리 앉을 수 있을지 모르겠다.',
                    type: 'pain',
                    painPoint: '입구에 대기 인원 안내가 없어 불안감을 느낌',
                    opportunity: '"현재 대기 0명" 실시간 보드를 설치하면 이탈률을 줄일 수 있습니다.'
                },
                eat: {
                    action: '제육볶음 세트 주문, 10분 내 수령',
                    thought: '양도 많고 맛도 있네. 가격 대비 완전 만족!',
                    type: 'good',
                    opportunity: '대표 세트 메뉴를 SNS에 #가성비점심 태그와 함께 노출하세요.'
                },
                share: {
                    action: '팀 단체 카톡에 "여기 완전 좋다" 공유',
                    thought: '다음에 팀원들이랑 같이 와야겠다.',
                    type: 'good',
                    opportunity: '"단체 방문 쿠폰" 발행으로 그룹 방문을 유도하세요.'
                }
            }
        },
        {
            id: 3,
            nickname: '미식가 커플',
            summary: '데이트 맛집을 찾는 커플, 분위기와 플레이팅을 중시해요',
            img: 'https://api.dicebear.com/7.x/adventurer/svg?seed=couple',
            tags: ['20-30대', '커플', '데이트'],
            overall_comment: '인스타그램 노출이 핵심입니다. 이 그룹이 올리는 사진 1장이 신규 고객 10명 이상을 데려올 수 있습니다.',
            action_recommendation: '포토존 하나만 만들어도 인스타 바이럴이 폭발합니다. 대표 메뉴 플레이팅을 개선하세요.',
            journey: {
                explore: {
                    action: '인스타그램에서 "범계 데이트 맛집" 검색',
                    thought: '사진이 예쁘고 분위기 좋은 곳이면 좋겠다.',
                    type: 'good',
                    opportunity: '인스타 해시태그 #범계맛집 #데이트맛집을 프로필에 적극 활용하세요.'
                },
                visit: {
                    action: '저녁 7시에 예약 없이 방문',
                    thought: '분위기 있어 보이는데 자리가 있을지 모르겠다.',
                    type: 'neutral',
                    painPoint: '예약 시스템이 없어 발걸음을 돌릴 뻔함',
                    opportunity: '네이버 예약 연동으로 커플 고객 이탈을 막으세요.'
                },
                eat: {
                    action: '시그니처 메뉴 주문 후 사진 촬영',
                    thought: '플레이팅이 예쁘다! 인스타에 올려야지.',
                    type: 'good',
                    opportunity: '"인스타 감성 세트" 메뉴를 만들고 포토존 조명을 설치하세요.'
                },
                share: {
                    action: '인스타그램에 가게 태그 후 업로드',
                    thought: '친구들한테도 자랑하고 싶다!',
                    type: 'good',
                    opportunity: '리포스팅 이벤트 운영으로 자발적 바이럴을 만드세요.'
                }
            }
        }
    ]
};

const DEFAULT_JOURNEY = {
    explore: {
        label: '탐색',
        action: '리뷰와 매장 정보를 확인합니다.',
        thought: '방문 전에 필요한 정보를 찾고 있습니다.',
        type: 'neutral',
        touchpoint: '검색/지도',
        painPoint: null,
        opportunity: '대표 메뉴와 위치 정보를 명확히 보여주세요.'
    },
    visit: {
        label: '방문',
        action: '매장을 방문하고 입장합니다.',
        thought: '기대했던 경험과 실제 매장을 비교합니다.',
        type: 'neutral',
        touchpoint: '매장 입구',
        painPoint: null,
        opportunity: '첫인상을 좋게 만드는 안내가 필요합니다.'
    },
    eat: {
        label: '식사',
        action: '메뉴를 주문하고 식사합니다.',
        thought: '맛, 양, 가격을 함께 판단합니다.',
        type: 'neutral',
        touchpoint: '테이블/메뉴',
        painPoint: null,
        opportunity: '만족 포인트를 리뷰로 남기기 쉽게 만들어주세요.'
    },
    share: {
        label: '공유',
        action: '경험을 지인이나 SNS에 공유합니다.',
        thought: '다시 방문하거나 추천할지 결정합니다.',
        type: 'neutral',
        touchpoint: '리뷰/SNS',
        painPoint: null,
        opportunity: '공유할 만한 사진 포인트와 혜택을 제공하세요.'
    }
};

const normalizePersona = (persona, index) => {
    const fallback = MOCK_ANALYSIS_DATA.personas[index % MOCK_ANALYSIS_DATA.personas.length];
    const journey = persona?.journey || {};

    return {
        id: persona?.id ?? index + 1,
        nickname: persona?.nickname || fallback.nickname || `대표 고객 ${index + 1}`,
        summary: persona?.summary || fallback.summary || '리뷰 기반 대표 고객 그룹입니다.',
        img: persona?.img || fallback.img || `https://api.dicebear.com/7.x/adventurer/svg?seed=persona-${index + 1}`,
        tags: Array.isArray(persona?.tags) && persona.tags.length ? persona.tags : (fallback.tags || ['고객분석']),
        overall_comment: persona?.overall_comment || fallback.overall_comment || '리뷰 기반 분석 총평을 준비 중입니다.',
        action_recommendation: persona?.action_recommendation || fallback.action_recommendation || '대표 메뉴와 방문 이유를 더 명확히 노출해보세요.',
        journey: {
            explore: { ...DEFAULT_JOURNEY.explore, ...(journey.explore || {}) },
            visit: { ...DEFAULT_JOURNEY.visit, ...(journey.visit || {}) },
            eat: { ...DEFAULT_JOURNEY.eat, ...(journey.eat || {}) },
            share: { ...DEFAULT_JOURNEY.share, ...(journey.share || {}) },
        }
    };
};

const normalizeAnalysisData = (data) => {
    const sourcePersonas = Array.isArray(data?.personas) && data.personas.length
        ? data.personas
        : MOCK_ANALYSIS_DATA.personas;
    const personas = sourcePersonas.slice(0, 3).map(normalizePersona);

    return {
        ...MOCK_ANALYSIS_DATA,
        ...data,
        personas,
    };
};

export default function UnifiedInsightPage({ onNavigate }) {
    // API에서 가져온 분석 데이터
    const [analysisData, setAnalysisData] = useState(null);
    const [personas, setPersonas] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // ID 'local' 제거 - 첫 번째 페르소나를 기본으로 선택
    const [selectedId, setSelectedId] = useState(null);

    // API에서 페르소나 데이터 가져오기
    useEffect(() => {
        const fetchAnalysisData = async () => {
            try {
                setLoading(true);
                setError(null);

                const storedTaskId = localStorage.getItem('analysisTaskId');
                let response = null;

                if (storedTaskId) {
                    response = await fetch(`${FASTAPI_URL}/analysis/result/${storedTaskId}`);

                    if (!response.ok && response.status !== 400 && response.status !== 404) {
                        throw new Error(`분석 결과를 불러오지 못했습니다. (${response.status})`);
                    }
                }

                if (!response || !response.ok) {
                    response = await fetch(`${FASTAPI_URL}/analysis/latest`);
                }

                if (!response.ok) {
                    if (USE_MOCK_ANALYSIS) {
                        console.warn(`[InsightPage] 분석 결과 조회 실패(${response.status}) → 목업 데이터 사용`);
                        setAnalysisData(MOCK_ANALYSIS_DATA);
                        setPersonas(MOCK_ANALYSIS_DATA.personas);
                        return;
                    }

                    if (response.status === 404) {
                        throw new Error('아직 분석 결과가 없습니다. 회원가입 후 리뷰 수집과 분석이 완료되면 표시됩니다.');
                    }

                    throw new Error(`분석 결과를 불러오지 못했습니다. (${response.status})`);
                }

                const data = await response.json();
                console.log('📊 분석 데이터 로드 완료:', data);

                const normalizedData = normalizeAnalysisData(data);
                setAnalysisData(normalizedData);
                setPersonas(normalizedData.personas);
            } catch (err) {
                if (USE_MOCK_ANALYSIS) {
                    console.warn('[InsightPage] API 연결 실패 → 목업 데이터 사용:', err.message);
                    setAnalysisData(MOCK_ANALYSIS_DATA);
                    setPersonas(MOCK_ANALYSIS_DATA.personas);
                } else {
                    setError(err.message || '분석 데이터를 불러오지 못했습니다.');
                }
            } finally {
                setLoading(false);
            }
        };

        fetchAnalysisData();
    }, []);

    // 페르소나 로드 완료 시 첫 번째 페르소나 자동 선택
    useEffect(() => {
        if (personas.length > 0 && selectedId === null) {
            setSelectedId(personas[0].id);
        }
    }, [personas]);

    // Helper to find persona if ID is a number
    const selectedPersona = typeof selectedId === 'number'
        ? personas.find(p => p.id === selectedId)
        : null;

    // Mapping for Promotion Page (ID 기반 동적 매핑)
    return (
        <div className="flex flex-1 overflow-hidden bg-[#F5F7FA] p-5 gap-5 font-sans h-full min-h-0 text-[#191F28]">

            {/* Loading State */}
            {loading && (
                <div className="flex-1 flex items-center justify-center">
                    <div className="text-center">
                        <Loader2 size={40} className="text-[#002B7A] animate-spin mx-auto mb-4" />
                        <p className="text-[#8B95A1] font-medium">AI 분석 데이터를 불러오는 중...</p>
                    </div>
                </div>
            )}

            {/* Error State */}
            {!loading && error && (
                <div className="flex-1 flex items-center justify-center">
                    <div className="text-center bg-white rounded-[24px] p-8 shadow-sm border border-[#E5E8EB] max-w-md">
                        <AlertCircle size={48} className="text-[#FF5A36] mx-auto mb-4" />
                        <h3 className="text-[18px] font-bold text-[#191F28] mb-2">데이터 로드 실패</h3>
                        <p className="text-[#8B95A1] text-[14px] mb-4">{error}</p>
                        <button
                            onClick={() => window.location.reload()}
                            className="px-4 py-2 bg-[#002B7A] text-white rounded-xl text-sm font-bold hover:bg-[#001F5C] transition-colors"
                        >
                            다시 시도
                        </button>
                    </div>
                </div>
            )}

            {/* Main Content - only show when data is loaded */}
            {!loading && !error && (
                <>
                    {/* [LEFT PANE] Unified List (Flex 0.35) */}
                    <div className="flex-[0_0_35%] min-w-0 flex flex-col min-h-0 gap-4">

                        {/* 1. Brief Summary Card */}
                        <div className="bg-white rounded-[24px] p-6 shadow-[0_2px_12px_rgba(0,0,0,0.03)] border border-[#E5E8EB] shrink-0">
                            <div className="flex items-center gap-2 mb-3">
                                <Trophy size={18} className="text-[#FFB300]" />
                                <span className="text-[#8B95A1] font-bold text-xs uppercase tracking-wider">AI Insight</span>
                            </div>
                            <h2 className="text-[22px] font-bold leading-[1.3] text-[#191F28] mb-1">
                                <span className="bg-gradient-to-r from-[#002B7A] to-blue-500 bg-clip-text text-transparent">{analysisData?.store_name || '가게'}</span>의<br />
                                고객 분석이 완료되었어요.
                            </h2>
                            {analysisData?.store_summary && (
                                <p className="text-[13px] text-[#8B95A1] mt-2 leading-relaxed">
                                    {analysisData.store_summary}
                                </p>
                            )}
                            {analysisData && (
                                <div className="flex gap-3 mt-3">
                                    <span className="px-2.5 py-1 bg-blue-50 text-[#002B7A] text-[11px] font-bold rounded-full border border-blue-100">
                                        ⭐ 평균 {analysisData.average_rating}점
                                    </span>
                                    <span className="px-2.5 py-1 bg-blue-50 text-[#002B7A] text-[11px] font-bold rounded-full border border-blue-100">
                                        📝 리뷰 {analysisData.total_reviews}개 분석
                                    </span>
                                </div>
                            )}
                        </div>

                        {/* 2. Scrollable List (Unified: Market + Personas) */}
                        <div className="flex-1 bg-white rounded-[24px] shadow-[0_2px_12px_rgba(0,0,0,0.03)] border border-[#E5E8EB] overflow-hidden flex flex-col">
                            <div className="p-5 border-b border-[#F2F4F6] shrink-0">
                                <h3 className="text-[16px] font-bold text-[#191F28]">분석 리포트 목록</h3>
                            </div>
                            <div className="flex-1 overflow-y-auto scrollbar-hide p-2">

                                {/* Personas Items */}
                                {personas.map(persona => (
                                    <div
                                        key={persona.id}
                                        onClick={() => setSelectedId(persona.id)}
                                        className={`p-4 mb-2 rounded-[20px] cursor-pointer transition-all border group ${selectedId === persona.id
                                            ? 'bg-[#E8F3FF] border-[#002B7A] shadow-sm'
                                            : 'bg-white border-transparent hover:bg-[#F5F7FA] hover:border-[#E5E8EB]'
                                            }`}
                                    >
                                        <div className="flex items-center gap-4">
                                            <div className={`w-12 h-12 rounded-[16px] overflow-hidden shrink-0 border ${selectedId === persona.id ? 'border-[#002B7A]/20' : 'border-[#F5F7FA]'}`}>
                                                <img src={persona.img} alt={persona.nickname} className="w-full h-full object-cover" />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex justify-between items-center mb-0.5">
                                                    <h4 className={`text-[16px] font-bold truncate ${selectedId === persona.id ? 'text-[#002B7A]' : 'text-[#333D4B]'}`}>
                                                        {persona.nickname}
                                                    </h4>
                                                    {selectedId === persona.id && (
                                                        <ChevronRight size={16} className="text-[#002B7A]" />
                                                    )}
                                                </div>
                                                <p className="text-[13px] text-[#8B95A1] truncate">{persona.summary}</p>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* [RIGHT PANE] Detail View (Flex 0.65) */}
                    <div className="flex-[1_1_65%] min-w-0 flex flex-col min-h-0">
                        <AnimatePresence mode="wait">

                            {/* Persona Detail */}
                            {selectedPersona && (
                                <motion.div
                                    key={selectedPersona.id}
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -20 }}
                                    transition={{ duration: 0.2 }}
                                    className="flex-1 flex flex-col gap-4 overflow-y-auto scrollbar-hide pb-10"
                                >
                                    <div className="bg-white rounded-[32px] p-8 shadow-[0_4px_24px_rgba(0,0,0,0.04)] border border-[#E5E8EB]">
                                        {/* Header */}
                                        <div className="flex justify-between items-start mb-8">
                                            <div className="flex items-center gap-5">
                                                <div className="w-20 h-20 rounded-[28px] overflow-hidden border border-[#E5E8EB] shadow-sm">
                                                    <img src={selectedPersona.img} alt={selectedPersona.nickname} className="w-full h-full object-cover" />
                                                </div>
                                                <div>
                                                    <div className="flex gap-2 mb-2">
                                                        {selectedPersona.tags.map(tag => (
                                                            <span key={tag} className="px-2 py-1 bg-[#F2F4F6] text-[#4E5968] text-[12px] font-bold rounded-lg">#{tag}</span>
                                                        ))}
                                                    </div>
                                                    <h1 className="text-[28px] font-bold text-[#191F28] leading-tight mb-1">{selectedPersona.nickname}</h1>
                                                    <p className="text-[#6B7684] font-medium">{selectedPersona.summary}</p>
                                                </div>
                                            </div>

                                            {/* [NEW] Action Button for AI Reel */}
                                            <button
                                                onClick={() => {
                                                    onNavigate('promotion', {
                                                        personaId: selectedPersona?.id,
                                                        title: `[${selectedPersona?.nickname}] 맞춤 홍보 영상`
                                                    });
                                                }}
                                                className="px-5 py-3 bg-[#FF5A36] hover:bg-[#E0492A] text-white rounded-xl text-[14px] font-bold shadow-lg shadow-orange-100 flex items-center gap-2 transition-all transform hover:scale-105"
                                            >
                                                <Film size={18} />
                                                이 손님 맞춤 릴스 제작
                                            </button>
                                        </div>

                                        {/* Journey Map */}
                                        <div className="mb-0">
                                            <h3 className="text-[18px] font-bold text-[#191F28] mb-4 flex items-center gap-2">
                                                <MapPin size={20} className="text-[#333D4B]" />
                                                고객 여정 지도
                                            </h3>
                                            <JourneyMapSection persona={selectedPersona} />
                                        </div>
                                    </div>
                                </motion.div>
                            )}

                        </AnimatePresence>
                    </div>
                </>
            )}
        </div>
    );
}
