import React from 'react';
import { ArrowRight, Award, ExternalLink, MapPin, Star, X } from 'lucide-react';

export default function InfluencerDetailModal({ influencer, onClose, onRequest }) {
    if (!influencer) return null;

    const breakdown = influencer.matchBreakdown || {};
    const tags = influencer.tags || influencer.niche || influencer.keywords || [];
    const keywords = influencer.keywords?.length ? influencer.keywords : tags;
    const followers = influencer.followers || 0;
    const instagramFollowers = influencer.instagramFollowers || followers;
    const youtubeSubscribers = influencer.youtubeSubscribers || 0;
    const avgViews = influencer.avgViews || 0;
    const rating = influencer.rating || influencer.engagementRate || '-';
    const bio = influencer.bio || '등록된 소개가 없습니다.';
    const estimatedBudget = influencer.minBudget
        ? `${influencer.minBudget.toLocaleString()}원부터`
        : '협의 가능';

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-[24px] max-w-5xl w-full max-h-[90vh] overflow-hidden shadow-2xl flex flex-col md:flex-row relative">
                <button
                    type="button"
                    onClick={onClose}
                    className="absolute top-5 right-5 z-20 p-2 bg-white/80 hover:bg-white rounded-full backdrop-blur-md transition-all text-[#4B5563] hover:text-[#191F28]"
                    aria-label="닫기"
                >
                    <X size={22} />
                </button>

                <div className="md:w-[320px] bg-[#F9FAFB] border-r border-[#F2F4F6] flex flex-col overflow-hidden shrink-0">
                    <div className="p-8 flex flex-col items-center text-center border-b border-[#F2F4F6] bg-white">
                        <div className="relative mb-4">
                            <div className="w-[120px] h-[120px] rounded-full p-1 bg-gradient-to-tr from-[#FF5A36] to-[#002B7A]">
                                <img
                                    src={influencer.profileImage}
                                    alt={influencer.name}
                                    className="w-full h-full rounded-full object-cover border-4 border-white"
                                />
                            </div>
                        </div>
                        <h2 className="text-[24px] font-extrabold text-[#191F28] tracking-tight mb-1">
                            {influencer.name}
                        </h2>
                        <div className="flex items-center gap-1.5 text-[#505967] text-[14px] font-medium mb-3">
                            <MapPin size={14} />
                            {influencer.location || '지역 미입력'}
                        </div>
                        <div className="flex flex-wrap justify-center gap-1.5">
                            {tags.slice(0, 5).map((tag) => (
                                <span key={tag} className="px-2.5 py-1 bg-[#F2F4F6] text-[#4B5563] text-[12px] font-semibold rounded-md">
                                    {tag}
                                </span>
                            ))}
                        </div>
                    </div>

                    <div className="p-6 grid grid-cols-2 gap-4">
                        <Stat label="팔로워" value={followers.toLocaleString()} />
                        <Stat label="평점" value={rating} icon={<Star size={14} className="fill-[#FFB800] text-[#FFB800]" />} />
                        <Stat label="평균 조회" value={avgViews.toLocaleString()} />
                        <Stat label="예산" value={estimatedBudget} />
                        <div className="col-span-2 bg-[#E8F3FF] p-4 rounded-2xl flex items-center justify-between border border-[#CFE5FF]">
                            <div className="flex flex-col">
                                <span className="text-[11px] text-[#002B7A] font-bold opacity-80">매칭 적합도</span>
                                <span className="text-[24px] font-extrabold text-[#002B7A]">{influencer.matchScore || 0}%</span>
                            </div>
                            <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-[#002B7A] shadow-sm">
                                <Award size={20} />
                            </div>
                        </div>
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto custom-scrollbar bg-white flex flex-col">
                    <div className="p-8 pb-32">
                        <section className="mb-8">
                            <SectionTitle color="#002B7A">AI 매칭 분석</SectionTitle>
                            <div className="bg-[#F9FAFB] rounded-[20px] p-6 border border-[#F2F4F6]">
                                <div className="grid grid-cols-2 md:grid-cols-5 gap-2 mb-5">
                                    <Score label="업종" value={breakdown.category} max={25} />
                                    <Score label="지역" value={breakdown.location} max={20} />
                                    <Score label="키워드" value={breakdown.keyword} max={30} />
                                    <Score label="성과" value={breakdown.performance} max={15} />
                                    <Score label="예산" value={breakdown.budget} max={10} />
                                </div>
                                <div className="flex flex-col gap-2">
                                    {(influencer.matchReasons || ['등록된 매칭 사유가 없습니다.']).map((reason) => (
                                        <p key={reason} className="text-[15px] text-[#4B5563] leading-relaxed">
                                            {reason}
                                        </p>
                                    ))}
                                </div>
                            </div>
                        </section>

                        <section className="mb-8">
                            <SectionTitle color="#FF5A36">채널 바로가기</SectionTitle>
                            <div className="flex flex-col gap-3">
                                {influencer.instagramUrl && (
                                    <ChannelLink
                                        href={influencer.instagramUrl}
                                        label="Instagram 프로필"
                                        meta={`팔로워 ${instagramFollowers.toLocaleString()}명`}
                                    />
                                )}
                                {influencer.youtubeUrl && (
                                    <ChannelLink
                                        href={influencer.youtubeUrl}
                                        label="YouTube 채널"
                                        meta={`구독자 ${youtubeSubscribers.toLocaleString()}명`}
                                    />
                                )}
                                {!influencer.instagramUrl && !influencer.youtubeUrl && (
                                    <p className="text-[14px] text-[#8B95A1]">등록된 채널 링크가 없습니다.</p>
                                )}
                            </div>
                        </section>

                        <section className="mb-8">
                            <SectionTitle color="#333D4B">소개</SectionTitle>
                            <p className="text-[16px] text-[#4B5563] leading-relaxed whitespace-pre-line">
                                {bio}
                            </p>
                        </section>

                        <section>
                            <SectionTitle color="#333D4B">주요 키워드</SectionTitle>
                            <div className="flex flex-wrap gap-2">
                                {keywords.map((keyword) => (
                                    <span key={keyword} className="px-3 py-1.5 rounded-full bg-[#F5F7FA] text-[#505967] text-[13px] font-bold">
                                        #{keyword}
                                    </span>
                                ))}
                            </div>
                        </section>
                    </div>

                    <div className="absolute bottom-0 left-0 md:left-[320px] right-0 p-6 bg-white border-t border-[#F2F4F6] flex items-center justify-between z-10">
                        <div className="flex flex-col">
                            <span className="text-[12px] text-[#8B95A1] font-medium">예상 비용</span>
                            <span className="text-[18px] font-bold text-[#191F28]">{estimatedBudget}</span>
                        </div>
                        <button
                            type="button"
                            onClick={onRequest}
                            className="flex items-center gap-2 px-8 py-3.5 bg-[#002B7A] text-white text-[16px] font-bold rounded-xl hover:bg-[#002B7AE6] transition-all shadow-md active:scale-95"
                        >
                            제안 보내기 <ArrowRight size={18} />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

function SectionTitle({ color, children }) {
    return (
        <h3 className="text-[18px] font-bold text-[#191F28] mb-3 flex items-center gap-2">
            <span className="w-1.5 h-6 rounded-full" style={{ backgroundColor: color }} />
            {children}
        </h3>
    );
}

function Stat({ label, value, icon }) {
    return (
        <div className="flex flex-col items-center bg-white p-4 rounded-2xl border border-[#F2F4F6] shadow-sm">
            <span className="text-[12px] text-[#8B95A1] font-bold mb-1">{label}</span>
            <span className="text-[18px] font-extrabold text-[#191F28] flex items-center gap-1 text-center">
                {icon}
                {value}
            </span>
        </div>
    );
}

function Score({ label, value = 0, max }) {
    const safeValue = Number.isFinite(Number(value)) ? Number(value) : 0;
    return (
        <div className="bg-white rounded-xl border border-[#F2F4F6] p-3">
            <p className="text-[12px] text-[#8B95A1] font-bold mb-1">{label}</p>
            <p className="text-[16px] text-[#191F28] font-extrabold">{safeValue}/{max}</p>
        </div>
    );
}

function ChannelLink({ href, label, meta }) {
    return (
        <a
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full h-[56px] bg-[#F9FAFB] border border-[#E5E8EB] hover:border-[#002B7A] rounded-xl flex items-center justify-between px-5 transition-all group"
        >
            <div className="flex flex-col">
                <span className="text-[15px] font-bold text-[#191F28] group-hover:text-[#002B7A] transition-colors">{label}</span>
                <span className="text-[12px] text-[#4E5968] font-medium">{meta}</span>
            </div>
            <ExternalLink size={18} className="text-[#8B95A1] group-hover:text-[#002B7A]" />
        </a>
    );
}
