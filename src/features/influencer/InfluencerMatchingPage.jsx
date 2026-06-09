import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, ChevronRight, Search } from 'lucide-react';
import { INFLUENCER_DATA, CATEGORIES, filterInfluencersByCategory } from '../../data/mockInfluencers';
import InfluencerList from './InfluencerList';
import UpgradePrompt from './UpgradePrompt';
import InfluencerDetailModal from './InfluencerDetailModal';
import OwnerSentProposals from './OwnerSentProposals';
import { fetchLatestAnalysisData } from '../insight/api/analysisApi';
import {
    buildStoreInsightFromAnalysisData,
    getLocalStoreProfile,
    scoreInfluencers,
} from './influencerMatchingUtils';
import { fetchInfluencerRecommendations } from './influencerApi';

export default function InfluencerMatchingPage() {
    const navigate = useNavigate();
    const CURRENT_USER_PLAN = 'Pro';
    const [selectedCategory, setSelectedCategory] = useState('전체');
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedInfluencer, setSelectedInfluencer] = useState(null);
    const [storeInsight, setStoreInsight] = useState(() => getLocalStoreProfile());
    const [apiInfluencers, setApiInfluencers] = useState(null);

    useEffect(() => {
        let ignore = false;

        // 추천 목록(Spring)과 손님분석(DeepSeek)을 함께 불러와,
        // Spring 점수를 손님분석 키워드 + 부분일치 기준으로 재계산한다.
        Promise.all([
            fetchInfluencerRecommendations().catch(() => null),
            fetchLatestAnalysisData().catch(() => null),
        ]).then(([recommendation, analysisData]) => {
            if (ignore) return;

            const insight = analysisData
                ? buildStoreInsightFromAnalysisData(analysisData)
                : getLocalStoreProfile();
            setStoreInsight(insight);

            if (recommendation?.influencers?.length) {
                // 원본 목록만 저장하고, 점수는 아래 useMemo에서 손님분석 인사이트로 계산한다.
                setApiInfluencers(recommendation.influencers);
            }
        });

        return () => {
            ignore = true;
        };
    }, []);

    // storeInsight가 갱신되면(예: 분석 결과 도착) 재점수도 반영한다.
    const scoredInfluencers = useMemo(
        () => (apiInfluencers
            ? scoreInfluencers(apiInfluencers, storeInsight)
            : scoreInfluencers(INFLUENCER_DATA, storeInsight)),
        [apiInfluencers, storeInsight]
    );

    if (CURRENT_USER_PLAN !== 'Pro') return <UpgradePrompt />;

    const filteredInfluencers = filterInfluencersByCategory(selectedCategory, scoredInfluencers)
        .filter((inf) => {
            const query = searchQuery.trim();
            if (!query) return true;
            return (
                inf.name.includes(query) ||
                inf.location.includes(query) ||
                inf.niche.some((tag) => tag.includes(query)) ||
                (inf.keywords || []).some((keyword) => keyword.includes(query))
            );
        })
        .sort((a, b) => b.matchScore - a.matchScore);

    return (
        <div className="flex flex-col h-full bg-[#F5F7FA] overflow-hidden">
            <div className="flex-1 w-full pl-2 pr-6 pb-6 flex gap-8 items-start min-h-0">
                <div className="hidden lg:flex w-[240px] shrink-0 flex-col gap-5 h-full overflow-hidden relative">
                    <div className="flex flex-col gap-3">
                        <div className="flex items-center justify-between px-1">
                            <h2 className="text-[20px] font-bold text-[#191F28] tracking-tight">파트너 찾기</h2>
                        </div>

                        <div className="relative">
                            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-[#8B95A1]">
                                <Search size={18} />
                            </div>
                            <input
                                type="text"
                                placeholder="이름, 지역, 키워드 검색"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full h-[48px] pl-11 pr-4 bg-white border border-[#E5E8EB] rounded-[16px] text-[15px] placeholder:text-[#B0B8C1] focus:border-[#002B7A] focus:ring-1 focus:ring-[#002B7A] transition-all shadow-sm"
                            />
                        </div>

                        <div className="flex flex-wrap gap-1.5">
                            {CATEGORIES.map((cat) => (
                                <button
                                    key={cat}
                                    onClick={() => setSelectedCategory(cat)}
                                    className={`px-3 py-1.5 rounded-xl text-[13px] font-bold transition-all ${selectedCategory === cat
                                        ? 'bg-[#191F28] text-white shadow-md transform scale-[1.02]'
                                        : 'bg-white border border-[#E5E8EB] text-[#505967] hover:bg-[#F9FAFB] hover:text-[#333D4B]'
                                    }`}
                                >
                                    {cat}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="h-[1px] bg-[#E5E8EB] w-full" />

                    <div className="bg-[#F0F4FA] rounded-[20px] p-5 border border-[#E8F3FF]">
                        <div className="flex items-center gap-2 mb-2 text-[#002B7A] font-extrabold text-[15px]">
                            <span className="w-5 h-5 flex items-center justify-center bg-[#002B7A] text-white rounded-full text-[11px] mt-0.5">?</span>
                            매칭 기준
                        </div>
                        <div className="text-[13px] text-[#505967] leading-relaxed space-y-2">
                            <p>
                                <span className="font-bold text-[#333D4B] block mb-0.5">1. 손님분석 키워드</span>
                                분석 결과의 페르소나, 리뷰 토픽, 매장 요약 키워드와 인플루언서 키워드를 비교합니다.
                            </p>
                            <p>
                                <span className="font-bold text-[#333D4B] block mb-0.5">2. 업종/지역/예산</span>
                                가게 업종, 활동 지역, 예상 단가, 성과 지표를 함께 반영합니다.
                            </p>
                        </div>
                    </div>

                    <div className="flex flex-col gap-3 px-1">
                        <div className="flex items-center gap-2 mb-1 text-[#191F28] font-bold text-[18px]">
                            <img src="/PULSE_LOGO.png" alt="PULSE" className="w-[20px] h-[20px] object-contain" />
                            현재 기준
                        </div>
                        <ul className="flex flex-col gap-3">
                            <li className="flex gap-3 items-start relative pl-1">
                                <div className="mt-1.5 w-2 h-2 rounded-full bg-[#002B7A] shrink-0" />
                                <div>
                                    <strong className="block text-[#333D4B] text-[14px] mb-0.5">{storeInsight.storeName}</strong>
                                    <span className="text-[#8B95A1] leading-relaxed text-[13px] block break-keep">
                                        {storeInsight.category} · {storeInsight.location}
                                    </span>
                                </div>
                            </li>
                            <li className="flex gap-3 items-start relative pl-1">
                                <div className="mt-1.5 w-2 h-2 rounded-full bg-[#002B7A] shrink-0" />
                                <div>
                                    <strong className="block text-[#333D4B] text-[14px] mb-0.5">추천 키워드</strong>
                                    <span className="text-[#8B95A1] leading-relaxed text-[13px] block break-keep">
                                        {storeInsight.keywords.slice(0, 5).join(', ')}
                                    </span>
                                </div>
                            </li>
                        </ul>
                    </div>
                </div>

                <div className="flex-1 min-w-0 flex flex-col gap-6 pt-2 h-full overflow-y-auto overflow-x-hidden custom-scrollbar pb-20 pr-2">
                    <div className="flex items-end justify-between border-b border-[#E5E8EB] pb-5">
                        <div className="flex items-center gap-2">
                            <h2 className="text-[22px] font-bold text-[#191F28] tracking-tight">추천 파트너</h2>
                        </div>
                        <div className="text-[14px] text-[#8B95A1] font-medium">
                            {filteredInfluencers.length}명 · AI 매칭 점수순
                        </div>
                    </div>

                    <OwnerSentProposals />

                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                        <InfluencerList
                            influencers={filteredInfluencers}
                            onViewDetail={setSelectedInfluencer}
                        />
                    </div>

                    <div className="flex justify-center items-center gap-2 mt-4 pb-10">
                        <button className="w-9 h-9 flex items-center justify-center rounded-lg bg-white border border-[#E5E8EB] text-[#8B95A1] hover:bg-[#F9FAFB] transition-colors"><ChevronLeft size={18} /></button>
                        <button className="w-9 h-9 flex items-center justify-center rounded-lg bg-[#333D4B] text-white font-bold shadow-md">1</button>
                        <button className="w-9 h-9 flex items-center justify-center rounded-lg bg-white border border-[#E5E8EB] text-[#8B95A1] hover:bg-[#F9FAFB] transition-colors"><ChevronRight size={18} /></button>
                    </div>
                </div>
            </div>

            {selectedInfluencer && (
                <InfluencerDetailModal
                    influencer={selectedInfluencer}
                    onClose={() => setSelectedInfluencer(null)}
                    onRequest={() => {
                        localStorage.setItem('selectedInfluencerForProposal', JSON.stringify(selectedInfluencer));
                        navigate(`/influencer-matching/request/${selectedInfluencer.id}`);
                    }}
                />
            )}
        </div>
    );
}
