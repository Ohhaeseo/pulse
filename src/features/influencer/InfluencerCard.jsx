import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Info, MapPin, Play, Star, Users, Zap } from 'lucide-react';

export default function InfluencerCard({ influencer, onViewDetail }) {
    const navigate = useNavigate();
    const [showTooltip, setShowTooltip] = useState(false);
    const breakdown = influencer.matchBreakdown || {};

    const goToRequest = () => {
        localStorage.setItem('selectedInfluencerForProposal', JSON.stringify(influencer));
        navigate(`/influencer-matching/request/${influencer.id}`);
    };

    const formatNumber = (num) => {
        if (!num) return '0';
        if (num >= 10000) return `${(num / 10000).toFixed(num % 10000 === 0 ? 0 : 1)}만`;
        return num.toLocaleString();
    };

    return (
        <div className="bg-white rounded-xl border border-[#F2F4F6] shadow-sm hover:shadow-lg transition-shadow duration-200 group flex flex-col h-full relative z-10 hover:z-20 p-6 gap-5">
            <div className="flex gap-3 items-start">
                <div className="w-[48px] h-[48px] rounded-full p-[1.5px] bg-gradient-to-tr from-[#002B7A] to-[#4070F4] shrink-0">
                    <img
                        src={influencer.profileImage}
                        alt={influencer.name}
                        className="w-full h-full rounded-full object-cover border-2 border-white"
                    />
                </div>
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 flex-wrap mb-0.5">
                        <h3 className="text-[20px] font-bold text-[#191F28] leading-tight">{influencer.name}</h3>
                        <div className="relative shrink-0">
                            <div className="flex items-center gap-0.5 bg-[#FF5A361A] text-[#FF5A36CC] px-1.5 py-0.5 rounded-md text-[11px] font-bold border border-[#FF5A3633] leading-none">
                                <Zap size={11} fill="currentColor" />
                                {influencer.matchScore}%
                                <button
                                    type="button"
                                    className="cursor-help opacity-70 hover:opacity-100 transition-opacity"
                                    onMouseEnter={() => setShowTooltip(true)}
                                    onMouseLeave={() => setShowTooltip(false)}
                                >
                                    <Info size={11} />
                                </button>
                            </div>

                            <div className={`absolute left-0 top-[calc(100%+8px)] w-[260px] bg-white text-[#191F28] border border-[#E5E8EB] shadow-xl rounded-xl p-4 z-[100] transition-opacity duration-200 pointer-events-none text-left font-normal ${showTooltip ? 'opacity-100 visible' : 'opacity-0 invisible'}`}>
                                <h4 className="text-[13px] font-bold mb-3 text-[#002B7A] flex items-center gap-1.5 border-b border-[#F2F4F6] pb-2">
                                    <Star size={14} className="text-[#002B7A]" />
                                    매칭 점수 구성
                                </h4>
                                <div className="flex flex-col gap-2 text-[12px] text-[#4E5968]">
                                    <ScoreRow label="업종" value={breakdown.category} max={25} />
                                    <ScoreRow label="지역" value={breakdown.location} max={20} />
                                    <ScoreRow label="키워드" value={breakdown.keyword} max={30} />
                                    <ScoreRow label="성과" value={breakdown.performance} max={15} />
                                    <ScoreRow label="예산" value={breakdown.budget} max={10} />
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="text-[13px] text-[#8B95A1] flex items-center gap-1 font-medium">
                        <MapPin size={12} className="text-[#8B95A1] shrink-0" />
                        <span>{influencer.location.split(' ')[1] || influencer.location}</span>
                        <span className="w-[3px] h-[3px] rounded-full bg-[#D1D6DB] shrink-0" />
                        <span className="text-[#4E5968]">{influencer.niche[0]}</span>
                    </div>
                </div>
            </div>

            <div className="flex flex-wrap gap-1.5">
                {influencer.keywords.slice(0, 3).map((tag) => (
                    <span key={tag} className="px-2.5 py-1 bg-[#F5F7FA] text-[#505967] text-[13px] font-medium rounded-full">
                        #{tag}
                    </span>
                ))}
                {influencer.keywords.length > 3 && (
                    <span className="px-2 py-1 bg-[#F5F7FA] text-[#8B95A1] text-[13px] font-medium rounded-full">
                        +{influencer.keywords.length - 3}
                    </span>
                )}
            </div>

            <div className="flex flex-col gap-1.5 min-h-[48px]">
                {(influencer.matchReasons || []).slice(0, 2).map((reason) => (
                    <p key={reason} className="text-[12px] text-[#4E5968] leading-relaxed line-clamp-1">
                        {reason}
                    </p>
                ))}
            </div>

            <div className="h-[1px] bg-[#F2F4F6] w-full" />

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

            <div className="mt-auto flex gap-2 pt-2">
                <button
                    className="flex-1 h-[44px] rounded-lg border border-[#E5E8EB] bg-white text-[#4E5968] text-[15px] font-bold hover:bg-[#F9FAFB] transition-colors"
                    onClick={() => onViewDetail(influencer)}
                >
                    프로필 상세
                </button>
                <button
                    onClick={goToRequest}
                    className="flex-[1.5] h-[44px] rounded-lg bg-[#002B7A] text-white text-[15px] font-bold hover:bg-[#002B7AE6] transition-colors flex items-center justify-center gap-1.5"
                >
                    제안하기
                    <ArrowRight size={16} />
                </button>
            </div>
        </div>
    );
}

function ScoreRow({ label, value = 0, max }) {
    const percent = Math.round((value / max) * 100);
    return (
        <div>
            <div className="flex justify-between items-center mb-1">
                <span className="font-bold text-[#333D4B]">{label}</span>
                <span className="font-bold text-[#002B7A]">{value}/{max}</span>
            </div>
            <div className="w-full h-1.5 bg-[#F2F4F6] rounded-full overflow-hidden">
                <div className="h-full bg-[#002B7A] rounded-full" style={{ width: `${Math.max(percent, 8)}%` }} />
            </div>
        </div>
    );
}
