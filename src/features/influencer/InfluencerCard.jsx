import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin, Zap, Star, ArrowRight, Info, Users, Play } from 'lucide-react';

/**
 * InfluencerCard (Data-driven Premium Version v2)
 * 포트폴리오 이미지를 제거하고 인스타/유튜브 수치 위주의 데이터 시각화를 강화
 */
export default function InfluencerCard({ influencer, onViewDetail }) {
    const navigate = useNavigate();
    const [showTooltip, setShowTooltip] = useState(false);

    // 툴팁에서 사용할 예시 상점 데이터 
    const storeInfo = {
        tags: ['#데이트', '#모던', '#하이볼', '#감성', '#신상맛집'],
        targetAge: 20,
        targetGender: 'female',
        address: '서울 강남구 역삼동'
    };

    // Jaccard Similarity 로직 유지
    const storeTags = storeInfo.tags;
    const infTags = influencer.keywords || [];
    const intersection = storeTags.filter(tag => infTags.includes(tag)).length;
    const union = new Set([...storeTags, ...infTags]).size;
    const tagMatchPercent = union === 0 ? 0 : Math.round((intersection / union) * 100);

    const storeGu = storeInfo.address.split(' ')[1] || '';
    const isAreaMatch = (influencer.activityArea || []).includes(storeGu);

    const isDemographicMatch = influencer.followerBase &&
        storeInfo.targetAge >= influencer.followerBase.age[0] && storeInfo.targetAge <= influencer.followerBase.age[1] &&
        (influencer.followerBase.gender === 'all' || influencer.followerBase.gender === storeInfo.targetGender);

    const formatNumber = (num) => {
        if (!num) return "0";
        if (num >= 10000) return (num / 10000).toFixed(num % 10000 === 0 ? 0 : 1) + '만';
        return num.toLocaleString();
    };

    return (
        <div className="bg-white rounded-xl border border-[#F2F4F6] shadow-sm hover:shadow-lg transition-shadow duration-200 group flex flex-col h-full relative z-10 hover:z-20 p-6 gap-5">
            
            {/* 1. Header: Avatar & Name */}
            <div className="flex gap-3 items-start">
                <div className="w-[48px] h-[48px] rounded-full p-[1.5px] bg-gradient-to-tr from-[#002B7A] to-[#4070F4] shrink-0">
                    <img
                        src={influencer.profileImage}
                        alt={influencer.name}
                        className="w-full h-full rounded-full object-cover border-2 border-white"
                    />
                </div>
                <div className="flex-1 min-w-0">
                    {/* Name + Badge — badge wraps to next line when space is tight */}
                    <div className="flex items-center gap-1.5 flex-wrap mb-0.5">
                        <h3 className="text-[20px] font-bold text-[#191F28] leading-tight">{influencer.name}</h3>

                        {/* Match Score Badge — compact size, never truncates name */}
                        <div className="relative shrink-0">
                            <div className="flex items-center gap-0.5 bg-[#FF5A361A] text-[#FF5A36CC] px-1.5 py-0.5 rounded-md text-[11px] font-bold border border-[#FF5A3633] leading-none">
                                <Zap size={11} fill="currentColor" />
                                {influencer.matchScore}%
                                <div
                                    className="cursor-help opacity-70 hover:opacity-100 transition-opacity"
                                    onMouseEnter={() => setShowTooltip(true)}
                                    onMouseLeave={() => setShowTooltip(false)}
                                >
                                    <Info size={11} />
                                </div>
                            </div>

                            {/* Tooltip */}
                            <div className={`absolute left-0 top-[calc(100%+8px)] w-[240px] bg-white text-[#191F28] border border-[#E5E8EB] shadow-xl rounded-xl p-4 z-[100] transition-opacity duration-200 pointer-events-none text-left font-normal ${showTooltip ? 'opacity-100 visible' : 'opacity-0 invisible'}`}>
                                <h4 className="text-[13px] font-bold mb-3 text-[#002B7A] flex items-center gap-1.5 border-b border-[#F2F4F6] pb-2">
                                    <Star size={14} className="text-[#002B7A]" />
                                    AI 매장 적합도 분석
                                </h4>
                                <div className="flex flex-col gap-3">
                                    <div>
                                        <div className="flex justify-between items-center mb-1.5">
                                            <span className="text-[12px] font-bold text-[#333D4B]">우리 매장 적합률</span>
                                            <span className="text-[12px] font-bold text-[#002B7A]">{tagMatchPercent}%</span>
                                        </div>
                                        <div className="w-full h-1.5 bg-[#F2F4F6] rounded-full overflow-hidden">
                                            <div className="h-full bg-[#002B7A] rounded-full" style={{ width: `${Math.max(tagMatchPercent, 10)}%` }}></div>
                                        </div>
                                    </div>
                                    <div className="flex flex-col gap-2 mt-1">
                                        <div className="flex items-center gap-2">
                                            <div className={`w-1.5 h-1.5 rounded-full ${isAreaMatch ? 'bg-[#FF5A36CC]' : 'bg-[#D1D6DB]'}`}></div>
                                            <span className="text-[12px] text-[#4E5968] leading-none">활동 지역 일치 <strong className="text-[#333D4B]">({storeGu})</strong></span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <div className={`w-1.5 h-1.5 rounded-full ${isDemographicMatch ? 'bg-[#FF5A36CC]' : 'bg-[#D1D6DB]'}`}></div>
                                            <span className="text-[12px] text-[#4E5968] leading-none">타겟 고객 일치 <strong className="text-[#333D4B]">({storeInfo.targetAge}대)</strong></span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Location */}
                    <div className="text-[13px] text-[#8B95A1] flex items-center gap-1 font-medium">
                        <MapPin size={12} className="text-[#8B95A1] shrink-0" />
                        <span>{influencer.location.split(" ")[1] || influencer.location}</span>
                        <span className="w-[3px] h-[3px] rounded-full bg-[#D1D6DB] shrink-0"></span>
                        <span className="text-[#4E5968]">{influencer.niche[0]}</span>
                    </div>
                </div>
            </div>

            {/* 2. Body: Tags */}
            <div className="flex flex-wrap gap-1.5">
                {influencer.keywords.slice(0, 3).map((tag, idx) => (
                    <span key={idx} className="px-2.5 py-1 bg-[#F5F7FA] text-[#505967] text-[13px] font-medium rounded-full">
                        {tag}
                    </span>
                ))}
                {influencer.keywords.length > 3 && (
                    <span className="px-2 py-1 bg-[#F5F7FA] text-[#8B95A1] text-[13px] font-medium rounded-full">
                        +{influencer.keywords.length - 3}
                    </span>
                )}
            </div>

            <div className="h-[1px] bg-[#F2F4F6] w-full"></div>

            {/* 3. Stats Board (Premium Data Visualization) */}
            <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col bg-[#F5F7FA] rounded-lg p-3">
                    <div className="flex items-center gap-1.5 mb-1">
                        <Users size={14} className="text-[#002B7A]" />
                        <span className="text-[12px] font-medium text-[#4E5968]">총 팔로워</span>
                    </div>
                    <span className="text-[17px] font-bold text-[#191F28]">{formatNumber(influencer.followers)}</span>
                </div>
                <div className="flex flex-col bg-[#F5F7FA] rounded-lg p-3">
                    <div className="flex items-center gap-1.5 mb-1">
                        <Play size={14} className="text-[#FF5A36CC]" />
                        <span className="text-[12px] font-medium text-[#4E5968]">평균 조회수</span>
                    </div>
                    <span className="text-[17px] font-bold text-[#191F28]">{formatNumber(influencer.avgViews)}</span>
                </div>
            </div>

            {/* 4. Footer: Buttons (Fitts's Law applied: 44px height) */}
            <div className="mt-auto flex gap-2 pt-2">
                <button
                    className="flex-1 h-[44px] rounded-lg border border-[#E5E8EB] bg-white text-[#4E5968] text-[15px] font-bold hover:bg-[#F9FAFB] transition-colors"
                    onClick={() => onViewDetail(influencer)}
                >
                    프로필 상세
                </button>
                <button
                    onClick={() => navigate(`/influencer-matching/request/${influencer.id}`)}
                    className="flex-[1.5] h-[44px] rounded-lg bg-[#002B7A] text-white text-[15px] font-bold hover:bg-[#002B7AE6] transition-colors flex items-center justify-center gap-1.5"
                >
                    제안하기
                    <ArrowRight size={16} />
                </button>
            </div>
        </div>
    );
}
