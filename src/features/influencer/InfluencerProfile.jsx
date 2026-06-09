import React, { useEffect, useMemo, useState } from 'react';
import { User, Instagram, Youtube, Hash, Edit3, CheckCircle2, Camera } from 'lucide-react';
import { fetchCurrentProfile } from '../auth/api/authApi';

const EMPTY_PROFILE = {
    name: '',
    email: '',
    bio: '',
    joinDate: '',
    instagram: '',
    youtube: '',
    profileImage: '',
    tags: [],
    instagramFollowers: 0,
    youtubeSubscribers: 0,
    avgViews: 0,
    stats: {
        accepted: 0,
        totalEarned: 0,
        pending: 0,
    },
};

const formatNumber = (value) => {
    const number = Number(value || 0);
    if (number >= 10000) return `${(number / 10000).toFixed(number % 10000 === 0 ? 0 : 1)}만`;
    return number.toLocaleString();
};

// niches + keywords를 합치되 #프리픽스를 정규화하고 대소문자 무시로 중복을 제거한다.
const buildUniqueTags = (...lists) => {
    const seen = new Set();
    const result = [];
    lists.flat().forEach((raw) => {
        const trimmed = String(raw || '').trim();
        if (!trimmed) return;
        const tag = trimmed.startsWith('#') ? trimmed : `#${trimmed}`;
        const key = tag.toLowerCase();
        if (seen.has(key)) return;
        seen.add(key);
        result.push(tag);
    });
    return result;
};

const mapProfile = (profile) => {
    const influencer = profile?.influencerProfile || {};

    return {
        ...EMPTY_PROFILE,
        name: influencer.displayName || profile?.name || '',
        email: profile?.email || influencer.email || '',
        bio: influencer.bio || '',
        joinDate: influencer.createdAt ? influencer.createdAt.slice(0, 10) : '',
        instagram: influencer.instagramUrl || '',
        youtube: influencer.youtubeUrl || '',
        profileImage: influencer.profileImageUrl || '',
        tags: buildUniqueTags(influencer.niches, influencer.keywords),
        instagramFollowers: influencer.instagramFollowers || 0,
        youtubeSubscribers: influencer.youtubeSubscribers || 0,
        avgViews: influencer.avgViews || 0,
    };
};

export default function InfluencerProfile() {
    const [data, setData] = useState(EMPTY_PROFILE);
    const [editingTag, setEditingTag] = useState('');
    const [isEditMode, setIsEditMode] = useState(false);
    const [saved, setSaved] = useState(false);

    useEffect(() => {
        let ignore = false;
        fetchCurrentProfile()
            .then((profile) => {
                if (!ignore && profile?.role === 'INFLUENCER') {
                    setData(mapProfile(profile));
                }
            })
            .catch((error) => console.warn('Influencer profile load failed:', error));
        return () => {
            ignore = true;
        };
    }, []);

    const stats = useMemo(() => ([
        { label: '수락한 제안', value: data.stats.accepted, unit: '건', color: 'text-[#002B7A]' },
        { label: '대기중인 제안', value: data.stats.pending, unit: '건', color: 'text-[#FF5A36]' },
        { label: '누적 원고료', value: data.stats.totalEarned.toLocaleString(), unit: '원', color: 'text-[#191F28]' },
    ]), [data.stats]);

    const handleAddTag = (event) => {
        if (event.key !== 'Enter' || !editingTag.trim()) return;
        const tag = editingTag.startsWith('#') ? editingTag.trim() : `#${editingTag.trim()}`;
        if (!data.tags.includes(tag)) {
            setData(prev => ({ ...prev, tags: [...prev.tags, tag] }));
        }
        setEditingTag('');
    };

    const handleRemoveTag = (tag) => {
        setData(prev => ({ ...prev, tags: prev.tags.filter(item => item !== tag) }));
    };

    const handleSave = () => {
        setSaved(true);
        setIsEditMode(false);
        setTimeout(() => setSaved(false), 2500);
    };

    return (
        <div className="flex-1 flex flex-col gap-5 mt-3 overflow-y-auto custom-scrollbar pb-6">
            <div className="bg-white rounded-[24px] border border-[#E5E8EB] p-8 flex items-start gap-6">
                <div className="relative shrink-0">
                    <div className="w-20 h-20 rounded-full bg-gradient-to-br from-[#002B7A] to-[#4A7FD4] flex items-center justify-center shadow-md overflow-hidden">
                        {data.profileImage ? (
                            <img src={data.profileImage} alt={data.name || '프로필 사진'} className="w-full h-full object-cover" />
                        ) : (
                            <User size={36} className="text-white" />
                        )}
                    </div>
                    {isEditMode && (
                        <button className="absolute -bottom-1 -right-1 w-7 h-7 bg-white border border-[#E5E8EB] rounded-full flex items-center justify-center shadow-sm hover:bg-[#F2F4F6] transition-colors">
                            <Camera size={14} className="text-[#4E5968]" />
                        </button>
                    )}
                </div>

                <div className="flex-1 min-w-0">
                    {isEditMode ? (
                        <div className="flex flex-col gap-3">
                            <input
                                value={data.name}
                                onChange={event => setData(prev => ({ ...prev, name: event.target.value }))}
                                className="text-[22px] font-bold text-[#191F28] border-b-2 border-[#002B7A] outline-none bg-transparent w-full"
                            />
                            <textarea
                                value={data.bio}
                                onChange={event => setData(prev => ({ ...prev, bio: event.target.value }))}
                                rows={2}
                                className="text-[15px] text-[#4E5968] border border-[#E5E8EB] rounded-[10px] p-2 outline-none resize-none bg-[#F9FAFB] focus:border-[#002B7A] transition-colors"
                            />
                        </div>
                    ) : (
                        <>
                            <h2 className="text-[22px] font-bold text-[#191F28]">{data.name || '인플루언서 프로필'}</h2>
                            <p className="text-[14px] text-[#8B95A1] mt-0.5">{data.email || '이메일 정보 없음'}</p>
                            <p className="text-[15px] text-[#4E5968] mt-2 leading-relaxed">
                                {data.bio || '가입 시 입력한 소개 문구가 여기에 표시됩니다.'}
                            </p>
                            {data.joinDate && <p className="text-[12px] text-[#8B95A1] mt-2">가입일: {data.joinDate}</p>}
                        </>
                    )}
                </div>

                <div className="shrink-0 flex items-center gap-2">
                    {isEditMode ? (
                        <>
                            <button onClick={() => setIsEditMode(false)} className="px-4 py-2 text-[14px] text-[#4E5968] font-bold border border-[#D1D6DB] rounded-[10px] hover:bg-[#F9FAFB] transition-colors">취소</button>
                            <button onClick={handleSave} className="px-4 py-2 text-[14px] text-white font-bold bg-[#002B7A] rounded-[10px] hover:bg-[#001F5C] transition-colors">저장</button>
                        </>
                    ) : (
                        <button onClick={() => setIsEditMode(true)} className="flex items-center gap-1.5 px-4 py-2 text-[14px] text-[#002B7A] font-bold border border-[#CFE5FF] bg-[#E8F3FF] rounded-[10px] hover:bg-[#D8ECFF] transition-colors">
                            <Edit3 size={14} /> 편집
                        </button>
                    )}
                    {saved && (
                        <div className="flex items-center gap-1 text-[14px] text-[#002B7A] font-bold">
                            <CheckCircle2 size={16} /> 저장됨
                        </div>
                    )}
                </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
                {stats.map(stat => (
                    <div key={stat.label} className="bg-white rounded-[20px] border border-[#E5E8EB] p-6 flex flex-col gap-1">
                        <p className="text-[13px] text-[#8B95A1] font-medium">{stat.label}</p>
                        <p className={`text-[28px] font-bold ${stat.color}`}>
                            {stat.value}<span className="text-[16px] font-medium text-[#8B95A1] ml-1">{stat.unit}</span>
                        </p>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-3 gap-4">
                <MetricCard label="Instagram 팔로워" value={formatNumber(data.instagramFollowers)} />
                <MetricCard label="YouTube 구독자" value={formatNumber(data.youtubeSubscribers)} />
                <MetricCard label="평균 조회수" value={formatNumber(data.avgViews)} />
            </div>

            <div className="bg-white rounded-[24px] border border-[#E5E8EB] p-6 flex flex-col gap-5">
                <h3 className="text-[18px] font-bold text-[#191F28]">채널 정보</h3>
                <ChannelRow
                    icon={<Instagram size={20} className="text-white" />}
                    iconClassName="bg-gradient-to-br from-[#E1306C] to-[#FCAF45]"
                    label="Instagram"
                    value={data.instagram}
                    placeholder="@your_handle"
                    isEditMode={isEditMode}
                    onChange={value => setData(prev => ({ ...prev, instagram: value }))}
                />
                <ChannelRow
                    icon={<Youtube size={20} className="text-white" />}
                    iconClassName="bg-[#FF0000]"
                    label="YouTube"
                    value={data.youtube}
                    placeholder="채널 URL을 입력하세요"
                    isEditMode={isEditMode}
                    onChange={value => setData(prev => ({ ...prev, youtube: value }))}
                />
            </div>

            <div className="bg-white rounded-[24px] border border-[#E5E8EB] p-6 flex flex-col gap-4">
                <h3 className="text-[18px] font-bold text-[#191F28] flex items-center gap-2"><Hash size={18} /> 활동 분야</h3>
                <div className="flex flex-wrap gap-2">
                    {data.tags.length === 0 && !isEditMode && (
                        <span className="text-[14px] text-[#8B95A1]">가입 시 입력한 분야와 키워드가 여기에 표시됩니다.</span>
                    )}
                    {data.tags.map(tag => (
                        <span key={tag} className="flex items-center gap-1.5 px-3 py-1.5 bg-[#F0F5FF] text-[#002B7A] font-bold text-[14px] rounded-full border border-[#CFE5FF]">
                            {tag}
                            {isEditMode && (
                                <button onClick={() => handleRemoveTag(tag)} className="text-[#8B95A1] hover:text-[#4E5968]">x</button>
                            )}
                        </span>
                    ))}
                    {isEditMode && (
                        <input
                            value={editingTag}
                            onChange={event => setEditingTag(event.target.value)}
                            onKeyDown={handleAddTag}
                            placeholder="+ 태그 추가 (Enter)"
                            className="px-3 py-1.5 border border-dashed border-[#CFE5FF] rounded-full text-[14px] text-[#8B95A1] outline-none bg-transparent focus:border-[#002B7A] transition-colors min-w-[120px]"
                        />
                    )}
                </div>
            </div>
        </div>
    );
}

function MetricCard({ label, value }) {
    return (
        <div className="bg-white rounded-[20px] border border-[#E5E8EB] p-5 flex flex-col gap-1">
            <p className="text-[13px] text-[#8B95A1] font-medium">{label}</p>
            <p className="text-[24px] font-bold text-[#191F28]">{value}</p>
        </div>
    );
}

function ChannelRow({ icon, iconClassName, label, value, placeholder, isEditMode, onChange }) {
    return (
        <div className="flex items-center gap-4">
            <div className={`w-10 h-10 rounded-[10px] flex items-center justify-center shrink-0 ${iconClassName}`}>
                {icon}
            </div>
            <div className="flex-1 min-w-0">
                <p className="text-[13px] text-[#8B95A1] font-medium">{label}</p>
                {isEditMode ? (
                    <input
                        value={value}
                        onChange={event => onChange(event.target.value)}
                        placeholder={placeholder}
                        className="text-[15px] text-[#191F28] font-medium border-b border-[#E5E8EB] outline-none w-full bg-transparent focus:border-[#002B7A] transition-colors"
                    />
                ) : (
                    <p className="text-[15px] text-[#191F28] font-medium">{value || '연결된 채널이 없습니다.'}</p>
                )}
            </div>
        </div>
    );
}
