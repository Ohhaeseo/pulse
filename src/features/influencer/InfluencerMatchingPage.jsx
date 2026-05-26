import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, TrendingUp, ChevronLeft, ChevronRight } from 'lucide-react';
import { INFLUENCER_DATA, CATEGORIES, filterInfluencersByCategory } from '../../data/mockInfluencers';
import FilterBar from './FilterBar';
import InfluencerList from './InfluencerList';
import UpgradePrompt from './UpgradePrompt';
import InfluencerDetailModal from './InfluencerDetailModal';
import { Send, MessageSquare } from 'lucide-react';

export default function InfluencerMatchingPage({ initialParams }) {
    const navigate = useNavigate();
    const CURRENT_USER_PLAN = "Pro";
    const [selectedCategory, setSelectedCategory] = useState("전체");
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedInfluencer, setSelectedInfluencer] = useState(null);

    if (CURRENT_USER_PLAN !== "Pro") return <UpgradePrompt />;

    const filteredInfluencers = filterInfluencersByCategory(selectedCategory)
        .filter(inf =>
            inf.name.includes(searchQuery) ||
            inf.niche.some(tag => tag.includes(searchQuery)) ||
            inf.location.includes(searchQuery)
        )
        .sort((a, b) => b.matchScore - a.matchScore);

    return (
        <div className="flex flex-col h-full bg-[#F5F7FA] overflow-hidden">

            {/* Main Layout: Left Sidebar + Right Feed 
                Padding Logic: 
                - DashboardLayout gives p-6 (24px).
                - Header.jsx has pl-2 (8px). Total indent = 32px.
                - We use pl-2 here to match Header's text alignment exactly ("범" alignment).
            */}
            <div className="flex-1 w-full pl-2 pr-6 pb-6 flex gap-8 items-start min-h-0">

                {/* [LEFT] Sticky Sidebar - fixed width so sidebar hover doesn't reflow */}
                <div className="hidden lg:flex w-[240px] shrink-0 flex-col gap-5 h-full overflow-hidden relative">

                    {/* Search & Filter Section */}
                    <div className="flex flex-col gap-3">
                        <div className="flex items-center justify-between px-1">
                            <h2 className="text-[20px] font-bold text-[#191F28] tracking-tight">파트너 찾기</h2>
                        </div>

                        {/* Search Input */}
                        <div className="relative">
                            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-[#8B95A1]">
                                <Search size={18} />
                            </div>
                            <input
                                type="text"
                                placeholder="키워드 검색"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full h-[48px] pl-11 pr-4 bg-white border border-[#E5E8EB] rounded-[16px] text-[15px] placeholder:text-[#B0B8C1] focus:border-[#002B7A] focus:ring-1 focus:ring-[#002B7A] transition-all shadow-sm"
                            />
                        </div>

                        {/* Categories (Vertical/Wrap) */}
                        <div className="flex flex-wrap gap-1.5">
                            {CATEGORIES.map((cat) => (
                                <button
                                    key={cat}
                                    onClick={() => setSelectedCategory(cat)}
                                    className={`px-3 py-1.5 rounded-xl text-[13px] font-bold transition-all ${selectedCategory === cat
                                        ? "bg-[#191F28] text-white shadow-md transform scale-[1.02]"
                                        : "bg-white border border-[#E5E8EB] text-[#505967] hover:bg-[#F9FAFB] hover:text-[#333D4B]"
                                        }`}
                                >
                                    {cat}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="h-[1px] bg-[#E5E8EB] w-full"></div>

                    {/* 1. Usage Guide (Now First) - Compact Padding */}
                    <div className="bg-[#F0F4FA] rounded-[20px] p-5 border border-[#E8F3FF]">
                        <div className="flex items-center gap-2 mb-2 text-[#002B7A] font-extrabold text-[15px]">
                            <span className="w-5 h-5 flex items-center justify-center bg-[#002B7A] text-white rounded-full text-[11px] mt-0.5">?</span>
                            이렇게 활용하세요
                        </div>
                        <div className="text-[13px] text-[#505967] leading-relaxed space-y-2">
                            <p>
                                <span className="font-bold text-[#333D4B] block mb-0.5">1. 먼저 제안하기</span>
                                마음에 드는 인플루언서에게 먼저 제안을 보내보세요. 응답률이 2배 높아집니다.
                            </p>
                            <p>
                                <span className="font-bold text-[#333D4B] block mb-0.5">2. 구체적인 조건</span>
                                제공 가능한 메뉴나 원고료 조건을 상세히 적을수록 좋습니다.
                            </p>
                        </div>
                    </div>

                    {/* 2. Smart Guide (Now Second) - Compact Gap */}
                    <div className="flex flex-col gap-3 px-1">
                        <div className="flex items-center gap-2 mb-1 text-[#191F28] font-bold text-[18px]">
                            <img src="/PULSE_LOGO.png" alt="PULSE" className="w-[20px] h-[20px] object-contain" />
                            매칭 성공 가이드
                        </div>
                        <ul className="flex flex-col gap-3"> {/* Compact gap */}
                            <li className="flex gap-3 items-start relative pl-1">
                                <div className="mt-1.5 w-2 h-2 rounded-full bg-[#002B7A] shrink-0"></div>
                                <div>
                                    <strong className="block text-[#333D4B] text-[14px] mb-0.5">매칭 적합도 분석</strong>
                                    <span className="text-[#8B95A1] leading-relaxed text-[13px] block break-keep">우리 가게의 핵심 타겟과 잘 맞는 파트너인지 매칭 점수로 편리하게 확인해보세요.</span>
                                </div>
                            </li>
                            <li className="flex gap-3 items-start relative pl-1">
                                <div className="mt-1.5 w-2 h-2 rounded-full bg-[#002B7A] shrink-0"></div>
                                <div>
                                    <strong className="block text-[#333D4B] text-[14px] mb-0.5">AI 제안서 작성</strong>
                                    <span className="text-[#8B95A1] leading-relaxed text-[13px] block break-keep">"제안하기" 클릭 시 AI가 초안을 써드립니다.</span>
                                </div>
                            </li>
                        </ul>
                    </div>
                </div>

                {/* [RIGHT] Feed Area - flex-1 fills remaining space */}
                <div className="flex-1 min-w-0 flex flex-col gap-6 pt-2 h-full overflow-y-auto overflow-x-hidden custom-scrollbar pb-20 pr-2">

                    {/* Feed Header (No Count) */}
                    <div className="flex items-end justify-between border-b border-[#E5E8EB] pb-5">
                        <div className="flex items-center gap-2">
                            <h2 className="text-[22px] font-bold text-[#191F28] tracking-tight">추천 파트너</h2>
                        </div>
                        <div className="text-[14px] text-[#8B95A1] font-medium">
                            AI 매칭 점수순
                        </div>
                    </div>

                    {/* Influencer Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                        <InfluencerList
                            influencers={filteredInfluencers}
                            onViewDetail={setSelectedInfluencer}
                        />
                    </div>

                    {/* Pagination */}
                    <div className="flex justify-center items-center gap-2 mt-4 pb-10">
                        <button className="w-9 h-9 flex items-center justify-center rounded-lg bg-white border border-[#E5E8EB] text-[#8B95A1] hover:bg-[#F9FAFB] transition-colors"><ChevronLeft size={18} /></button>
                        <button className="w-9 h-9 flex items-center justify-center rounded-lg bg-[#333D4B] text-white font-bold shadow-md">1</button>
                        <button className="w-9 h-9 flex items-center justify-center rounded-lg bg-white border border-[#E5E8EB] text-[#505967] hover:bg-[#F9FAFB] transition-colors font-medium">2</button>
                        <button className="w-9 h-9 flex items-center justify-center rounded-lg bg-white border border-[#E5E8EB] text-[#505967] hover:bg-[#F9FAFB] transition-colors font-medium">3</button>
                        <button className="w-9 h-9 flex items-center justify-center rounded-lg bg-white border border-[#E5E8EB] text-[#505967] hover:bg-[#F9FAFB] transition-colors font-medium">4</button>
                        <button className="w-9 h-9 flex items-center justify-center rounded-lg bg-white border border-[#E5E8EB] text-[#505967] hover:bg-[#F9FAFB] transition-colors font-medium">5</button>
                        <button className="w-9 h-9 flex items-center justify-center rounded-lg bg-white border border-[#E5E8EB] text-[#8B95A1] hover:bg-[#F9FAFB] transition-colors"><ChevronRight size={18} /></button>
                    </div>
                </div>
            </div>

            {/* Profile Detail Modal */}
            {selectedInfluencer && (
                <InfluencerDetailModal
                    influencer={selectedInfluencer}
                    onClose={() => setSelectedInfluencer(null)}
                    onRequest={() => navigate(`/influencer-matching/request/${selectedInfluencer.id}`)}
                />
            )}
        </div>
    );
}
