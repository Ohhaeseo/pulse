import React, { useEffect, useState } from 'react';
import { Store, MapPin, Calendar, CheckCircle2, XCircle, ChevronDown, X, AlertCircle, ArrowUpDown } from 'lucide-react';
import { acceptInfluencerProposal, fetchInfluencerInbox, rejectInfluencerProposal } from './influencerApi';

const INITIAL_PROPOSALS = [
    {
        id: 1,
        storeName: '강남 미식가',
        category: '한식/고기',
        address: '서울 강남구 테헤란로 123',
        message: '안녕하세요! 새로 오픈한 프리미엄 소고기 전문점입니다. 꼭 모시고 싶습니다.',
        detailMessage: '안녕하세요, 저희 강남 미식가는 2024년 12월 오픈한 프리미엄 한우 전문점입니다. 주 타겟은 2030 직장인으로, SNS 맛집 콘텐츠에 특화된 인플루언서를 찾고 있습니다.\n\n[협찬 상세 조건]\n· 방문 후 Instagram Reels 1편 제작 (30초~1분)\n· 게시물 캡션에 해시태그 3개 이상 (#강남미식가 #강남맛집 #한우)\n· 업로드 후 1주일 이내 삭제 불가\n\n편하신 날짜로 예약해 주시면 최고의 서비스로 모시겠습니다!',
        offerPrice: 50000,
        freeMeal: '2인 코스요리 (10만원 상당)',
        date: '2025.04.10 ~ 04.20',
        deadline: '2025.04.08',
        instagram: '@kangnam_gourmet',
        status: 'pending'
    },
    {
        id: 2,
        storeName: '카페 달보드레',
        category: '카페/디저트',
        address: '서울 성동구 연무장길 45',
        message: '시그니처 디저트 신메뉴가 출시되어 초청드리고 싶습니다. 예쁜 사진 부탁드려요!',
        detailMessage: '안녕하세요! 성수동 감성 카페 달보드레입니다. 4월 신메뉴 출시를 앞두고 푸드 인플루언서 분들을 초청해 맛있는 시간 나누고 싶습니다.\n\n[협찬 상세 조건]\n· Instagram 피드 사진 3장 이상 업로드\n· 인스타 스토리 언급 2회 이상\n· 방문 후 2주 이내 업로드\n\n예쁜 공간에서 맛있는 디저트와 함께 좋은 콘텐츠 만들어요! ☕',
        offerPrice: 30000,
        freeMeal: '시그니처 디저트 2종 + 음료 2잔',
        date: '2025.04.05 ~ 04.15',
        deadline: '2025.04.03',
        instagram: '@cafe_dalbodle',
        status: 'pending'
    },
    {
        id: 3,
        storeName: '이태원 브런치 하우스',
        category: '양식/브런치',
        address: '서울 용산구 이태원로 78',
        message: '주말 브런치 바이브를 잘 살려주실 수 있을 것 같아 연락드립니다.',
        detailMessage: '이태원 브런치 하우스입니다. 주말 럭셔리 브런치 분위기를 잘 담아주실 분이 필요합니다.\n\n[협찬 상세 조건]\n· YouTube Shorts 또는 Reels 1편\n· 촬영 전 메뉴 사전 협의 가능\n· 인스타 및 유튜브 업로드 각 1회',
        offerPrice: 0,
        freeMeal: '브런치 메뉴 2종 + 칵테일 2잔',
        date: '2025.04.01 ~ 04.07',
        deadline: '2025.03.30',
        instagram: '@itaewon_brunch',
        status: 'accepted'
    },
    {
        id: 4,
        storeName: '왕십리 곱창마을',
        category: '주점/고기',
        address: '서울 성동구 왕십리로 99',
        message: '저희 곱창 진짜 맛있는데 한 번 와주세요!',
        detailMessage: '안녕하세요 왕십리 곱창마을입니다. 30년 전통의 맛을 자랑합니다. 편하게 와서 드시고 인증만 해주셔도 됩니다!',
        offerPrice: 20000,
        freeMeal: '모듬곱창 2인분 + 소주 1병',
        date: '2025.03.20 ~ 03.30',
        deadline: '2025.03.18',
        instagram: '@wangsimni_gopchang',
        status: 'rejected'
    }
];

const SORT_OPTIONS = [
    { value: 'newest', label: '최신순' },
    { value: 'price_high', label: '원고료 높은순' },
    { value: 'deadline', label: '마감 임박순' },
];

// ── 상세 모달 (Phase 1: G1) ──────────────────────────────
const mapApiProposal = (proposal) => ({
    id: proposal.id,
    storeName: proposal.shopName || '가게명 없음',
    category: proposal.campaignType || '협업 제안',
    address: proposal.shopAddress || '주소 정보 없음',
    message: proposal.message || '',
    detailMessage: proposal.message || '',
    offerPrice: proposal.budget || 0,
    freeMeal: proposal.provideFood ? '방문 시 식사 제공' : '식사 제공 없음',
    date: proposal.desiredDate || '협의',
    deadline: proposal.createdAt ? proposal.createdAt.slice(0, 10) : '협의',
    instagram: proposal.contact || '',
    status: (proposal.status || 'PENDING').toLowerCase(),
});

function ProposalDetailModal({ proposal, onClose, onAccept, onReject }) {
    if (!proposal) return null;
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            {/* Backdrop */}
            <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
            {/* Modal */}
            <div className="relative bg-white rounded-[24px] shadow-2xl w-full max-w-[600px] mx-4 overflow-hidden animate-[fadeIn_0.2s_ease]">
                {/* Header */}
                <div className="flex items-start justify-between p-6 border-b border-[#E5E8EB]">
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <span className="px-2 py-0.5 bg-[#F2F4F6] text-[#4E5968] rounded-md text-[12px] font-bold">
                                {proposal.category}
                            </span>
                        </div>
                        <h2 className="text-[22px] font-bold text-[#191F28] flex items-center gap-2">
                            <Store size={20} className="text-[#8B95A1]" />
                            {proposal.storeName}
                        </h2>
                    </div>
                    <button onClick={onClose} className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-[#F2F4F6] transition-colors">
                        <X size={20} className="text-[#8B95A1]" />
                    </button>
                </div>

                {/* Body */}
                <div className="p-6 flex flex-col gap-5 max-h-[60vh] overflow-y-auto custom-scrollbar">
                    {/* Highlights */}
                    <div className="flex flex-wrap gap-2">
                        {proposal.offerPrice > 0 && (
                            <span className="text-[14px] text-[#002B7A] font-bold bg-[#E8F3FF] px-3 py-2 rounded-lg border border-[#CFE5FF]">
                                💰 원고료 {proposal.offerPrice.toLocaleString()}원
                            </span>
                        )}
                        <span className="text-[14px] text-[#FF5A36] font-bold bg-[#FFF0ED] px-3 py-2 rounded-lg border border-[#FFE5DF]">
                            🍽️ {proposal.freeMeal}
                        </span>
                    </div>

                    {/* Details */}
                    <div className="grid grid-cols-2 gap-3 text-[14px]">
                        <div className="flex items-center gap-2 text-[#4E5968]">
                            <MapPin size={15} className="text-[#002B7A] shrink-0" />
                            <span>{proposal.address}</span>
                        </div>
                        <div className="flex items-center gap-2 text-[#4E5968]">
                            <Calendar size={15} className="text-[#002B7A] shrink-0" />
                            <span>방문 희망: {proposal.date}</span>
                        </div>
                        <div className="flex items-center gap-2 col-span-2">
                            <AlertCircle size={15} className="text-[#FF5A36] shrink-0" />
                            <span className="text-[#FF5A36] font-bold">수락 마감: {proposal.deadline}</span>
                        </div>
                    </div>

                    {/* Message */}
                    <div className="bg-[#F9FAFB] rounded-[16px] p-4 border border-[#E5E8EB]">
                        <p className="text-[13px] font-bold text-[#4E5968] mb-2">사장님 메시지</p>
                        <p className="text-[15px] text-[#191F28] leading-relaxed whitespace-pre-line">{proposal.detailMessage}</p>
                    </div>

                    {/* Instagram */}
                    <div className="flex items-center gap-2 text-[14px] text-[#8B95A1]">
                        <span className="font-bold">사장님 인스타:</span>
                        <span className="text-[#002B7A] font-bold">{proposal.instagram}</span>
                    </div>
                </div>

                {/* Footer Actions */}
                {proposal.status === 'pending' && (
                    <div className="flex gap-3 p-6 border-t border-[#E5E8EB] bg-white">
                        <button
                            onClick={() => { onReject(proposal.id); onClose(); }}
                            className="flex-1 h-[52px] bg-white border border-[#D1D6DB] text-[#4E5968] font-bold text-[16px] rounded-[14px] hover:bg-[#F9FAFB] transition-all"
                        >
                            거절하기
                        </button>
                        <button
                            onClick={() => { onAccept(proposal.id); onClose(); }}
                            className="flex-[2] h-[52px] bg-[#002B7A] text-white font-bold text-[16px] rounded-[14px] hover:bg-[#001F5C] shadow-md hover:-translate-y-0.5 transition-all"
                        >
                            수락하기 ✓
                        </button>
                    </div>
                )}
                {proposal.status !== 'pending' && (
                    <div className="p-4 border-t border-[#E5E8EB]">
                        {proposal.status === 'accepted' ? (
                            <div className="flex items-center justify-center gap-2 text-[#002B7A] bg-[#F0F5FF] py-3 rounded-[12px]">
                                <CheckCircle2 size={18} /> <span className="font-bold">수락 완료됨</span>
                            </div>
                        ) : (
                            <div className="flex items-center justify-center gap-2 text-[#8B95A1] bg-[#F2F4F6] py-3 rounded-[12px]">
                                <XCircle size={18} /> <span className="font-bold">거절 처리됨</span>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}

// ── 수락 확인 인라인 다이얼로그 (Phase 2: G2) ─────────────
function ConfirmAcceptDialog({ storeName, onConfirm, onCancel }) {
    return (
        <div className="flex flex-col items-center justify-center gap-3 w-full bg-[#F0F5FF] p-4 rounded-[14px] border border-[#CFE5FF] text-center">
            <p className="text-[14px] text-[#191F28] font-bold">
                <span className="text-[#002B7A]">{storeName}</span>의 제안을 수락할까요?
            </p>
            <p className="text-[12px] text-[#8B95A1]">수락 후 사장님께 알림이 전달됩니다.</p>
            <div className="flex gap-2 w-full">
                <button onClick={onCancel}
                    className="flex-1 h-[40px] text-[14px] text-[#4E5968] font-bold border border-[#D1D6DB] rounded-[10px] bg-white hover:bg-[#F9FAFB] transition-all">
                    취소
                </button>
                <button onClick={onConfirm}
                    className="flex-[2] h-[40px] text-[14px] text-white font-bold bg-[#002B7A] rounded-[10px] hover:bg-[#001F5C] transition-all">
                    네, 수락합니다
                </button>
            </div>
        </div>
    );
}

// ── 메인 컴포넌트 ──────────────────────────────────────────
export default function InfluencerInbox() {
    const [proposals, setProposals] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('pending');
    const [selectedProposal, setSelectedProposal] = useState(null); // G1: 상세 모달
    const [confirmId, setConfirmId] = useState(null);               // G2: 수락 확인
    const [sortBy, setSortBy] = useState('newest');                  // G4: 정렬
    const [showSortMenu, setShowSortMenu] = useState(false);

    useEffect(() => {
        let ignore = false;

        const loadInbox = async () => {
            setIsLoading(true);
            try {
                const response = await fetchInfluencerInbox();
                if (!ignore) {
                    setProposals((response || []).map(mapApiProposal));
                }
            } catch (error) {
                console.warn('Influencer inbox load failed:', error);
                if (!ignore) {
                    const token = localStorage.getItem('accessToken');
                    setProposals(token === 'dev-bypass-token' ? INITIAL_PROPOSALS : []);
                }
            } finally {
                if (!ignore) setIsLoading(false);
            }
        };

        loadInbox();
        return () => {
            ignore = true;
        };
    }, []);

    const handleUpdateStatus = async (id, newStatus) => {
        try {
            if (newStatus === 'accepted') {
                await acceptInfluencerProposal(id, '제안을 수락합니다.');
            } else {
                await rejectInfluencerProposal(id, '이번 제안은 진행이 어렵습니다.');
            }
        } catch (error) {
            console.warn('Proposal status update failed, updating local state only:', error);
        } finally {
            setProposals(prev => prev.map(p => p.id === id ? { ...p, status: newStatus } : p));
            setConfirmId(null);
        }
    };

    // G4: 정렬 로직
    const getSortedProposals = (list) => {
        return [...list].sort((a, b) => {
            if (sortBy === 'price_high') return b.offerPrice - a.offerPrice;
            if (sortBy === 'deadline') return new Date(a.deadline) - new Date(b.deadline);
            return b.id - a.id; // newest
        });
    };

    const filteredProposals = getSortedProposals(proposals.filter(p => p.status === activeTab));
    const currentSortLabel = SORT_OPTIONS.find(o => o.value === sortBy)?.label || '최신순';

    return (
        <>
            {/* G1: 상세 모달 */}
            <ProposalDetailModal
                proposal={selectedProposal}
                onClose={() => setSelectedProposal(null)}
                onAccept={(id) => handleUpdateStatus(id, 'accepted')}
                onReject={(id) => handleUpdateStatus(id, 'rejected')}
            />

            {/* [UX Fix 2] mt-4 → mt-3 으로 가볍게 */}
            <div className="flex-1 flex flex-col h-full bg-white rounded-3xl shadow-sm border border-[#E5E8EB] overflow-hidden mt-3">

                {/* Tabs + Sort */}
                <div className="flex items-center justify-between border-b border-[#E5E8EB] px-6 shrink-0">
                    <div className="flex items-center">
                        <button
                            onClick={() => setActiveTab('pending')}
                            className={`py-4 px-4 text-[16px] font-bold transition-all border-b-2 ${activeTab === 'pending' ? 'text-[#002B7A] border-[#002B7A]' : 'text-[#8B95A1] border-transparent hover:text-[#4E5968]'}`}
                        >
                            대기중인 제안 <span className="ml-1 bg-[#F2F4F6] text-[#4E5968] px-2 py-0.5 rounded-full text-[12px]">{proposals.filter(p => p.status === 'pending').length}</span>
                        </button>
                        <button
                            onClick={() => setActiveTab('accepted')}
                            className={`py-4 px-4 text-[16px] font-bold transition-all border-b-2 ${activeTab === 'accepted' ? 'text-[#002B7A] border-[#002B7A]' : 'text-[#8B95A1] border-transparent hover:text-[#4E5968]'}`}
                        >
                            수락 완료 <span className="ml-1 bg-[#E8F3FF] text-[#002B7A] px-2 py-0.5 rounded-full text-[12px]">{proposals.filter(p => p.status === 'accepted').length}</span>
                        </button>
                        <button
                            onClick={() => setActiveTab('rejected')}
                            className={`py-4 px-4 text-[16px] font-bold transition-all border-b-2 ${activeTab === 'rejected' ? 'text-[#002B7A] border-[#002B7A]' : 'text-[#8B95A1] border-transparent hover:text-[#4E5968]'}`}
                        >
                            거절/취소
                        </button>
                    </div>

                    {/* G4: 정렬 드롭다운 */}
                    <div className="relative">
                        <button
                            onClick={() => setShowSortMenu(!showSortMenu)}
                            className="flex items-center gap-1.5 px-3 py-2 text-[14px] text-[#4E5968] font-medium rounded-lg hover:bg-[#F2F4F6] transition-colors"
                        >
                            <ArrowUpDown size={14} />
                            {currentSortLabel}
                            <ChevronDown size={14} className={`transition-transform ${showSortMenu ? 'rotate-180' : ''}`} />
                        </button>
                        {showSortMenu && (
                            <div className="absolute right-0 top-full mt-1 bg-white border border-[#E5E8EB] rounded-[12px] shadow-lg z-10 overflow-hidden min-w-[140px]">
                                {SORT_OPTIONS.map(opt => (
                                    <button
                                        key={opt.value}
                                        onClick={() => { setSortBy(opt.value); setShowSortMenu(false); }}
                                        className={`w-full text-left px-4 py-3 text-[14px] transition-colors ${sortBy === opt.value ? 'text-[#002B7A] font-bold bg-[#F0F5FF]' : 'text-[#191F28] hover:bg-[#F9FAFB]'}`}
                                    >
                                        {opt.label}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* Content List */}
                {/* [UX Fix 4] gap-4 → gap-5 */}
                <div className="flex-1 overflow-y-auto custom-scrollbar p-6 bg-[#F9FAFB]">
                    {filteredProposals.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-full text-[#8B95A1]">
                            <InboxIconPlaceholder />
                            <p className="mt-4 text-[16px] font-medium">해당하는 제안이 없습니다.</p>
                        </div>
                    ) : (
                        <div className="flex flex-col gap-5">
                            {filteredProposals.map(proposal => (
                                <div
                                    key={proposal.id}
                                    className="bg-white p-6 rounded-[20px] border border-[#E5E8EB] hover:shadow-md transition-all cursor-pointer flex flex-col lg:flex-row lg:items-center justify-between gap-6"
                                    onClick={() => setSelectedProposal(proposal)}
                                >
                                    {/* Info */}
                                    <div className="flex flex-col gap-3 flex-1 min-w-0">
                                        <div className="flex items-center gap-3">
                                            <span className="px-2.5 py-1 bg-[#F2F4F6] text-[#4E5968] rounded-md text-[13px] font-bold tracking-tight shrink-0">
                                                {proposal.category}
                                            </span>
                                            <h3 className="text-[20px] font-bold text-[#191F28] flex items-center gap-2 truncate">
                                                <Store size={18} className="text-[#8B95A1] shrink-0" />
                                                {proposal.storeName}
                                            </h3>
                                        </div>

                                        <p className="text-[15px] text-[#4E5968] leading-relaxed line-clamp-1">
                                            "{proposal.message}"
                                        </p>

                                        <div className="flex flex-wrap items-center gap-2">
                                            {proposal.offerPrice > 0 && (
                                                <span className="text-[13px] text-[#002B7A] font-bold bg-[#E8F3FF] px-3 py-1 rounded-lg border border-[#CFE5FF]">
                                                    원고료 {proposal.offerPrice.toLocaleString()}원
                                                </span>
                                            )}
                                            <span className="text-[13px] text-[#FF5A36] font-bold bg-[#FFF0ED] px-3 py-1 rounded-lg border border-[#FFE5DF]">
                                                {proposal.freeMeal}
                                            </span>
                                        </div>

                                        <div className="flex items-center gap-4 text-[12px] text-[#8B95A1] font-medium">
                                            <div className="flex items-center gap-1"><MapPin size={13} /> {proposal.address}</div>
                                            <div className="flex items-center gap-1"><Calendar size={13} /> 방문: {proposal.date}</div>
                                            {proposal.status === 'pending' && (
                                                <div className="flex items-center gap-1 text-[#FF5A36] font-bold">
                                                    <AlertCircle size={13} /> 마감 {proposal.deadline}
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Actions — stop propagation so card click doesn't fire */}
                                    <div
                                        className="shrink-0 flex items-center justify-end border-t border-[#F2F4F6] pt-4 lg:pt-0 lg:border-t-0 lg:border-l lg:pl-6 min-w-[200px]"
                                        onClick={e => e.stopPropagation()}
                                    >
                                        {proposal.status === 'pending' && (
                                            confirmId === proposal.id ? (
                                                /* G2: 수락 확인 인라인 */
                                                <ConfirmAcceptDialog
                                                    storeName={proposal.storeName}
                                                    onConfirm={() => handleUpdateStatus(proposal.id, 'accepted')}
                                                    onCancel={() => setConfirmId(null)}
                                                />
                                            ) : (
                                                <div className="flex items-center gap-3 w-full">
                                                    {/* [UX Fix 3] min-w 명시 */}
                                                    <button
                                                        onClick={() => handleUpdateStatus(proposal.id, 'rejected')}
                                                        className="min-w-[72px] h-[48px] px-3 bg-white border border-[#D1D6DB] text-[#4E5968] font-bold text-[14px] rounded-[12px] hover:bg-[#F9FAFB] hover:text-[#191F28] transition-all"
                                                    >
                                                        거절
                                                    </button>
                                                    <button
                                                        onClick={() => setConfirmId(proposal.id)}
                                                        className="flex-1 h-[48px] bg-[#002B7A] text-white font-bold text-[14px] rounded-[12px] hover:bg-[#001F5C] shadow-sm hover:-translate-y-0.5 transition-all"
                                                    >
                                                        수락하기
                                                    </button>
                                                </div>
                                            )
                                        )}

                                        {proposal.status === 'accepted' && (
                                            <div className="flex flex-col items-center justify-center gap-2 w-full text-[#002B7A] bg-[#F0F5FF] p-4 rounded-[12px] border border-[#CFE5FF]">
                                                <CheckCircle2 size={26} />
                                                <span className="font-bold text-[14px]">수락 완료됨</span>
                                                <span className="text-[11px] opacity-80 text-center">곧 사장님이 DM으로<br />안내 드릴 예정입니다.</span>
                                            </div>
                                        )}

                                        {proposal.status === 'rejected' && (
                                            <div className="flex flex-col items-center justify-center gap-2 w-full text-[#8B95A1] bg-[#F2F4F6] p-4 rounded-[12px]">
                                                <XCircle size={22} />
                                                <span className="font-bold text-[14px]">거절 처리됨</span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </>
    );
}

const InboxIconPlaceholder = () => (
    <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1"
        strokeLinecap="round" strokeLinejoin="round" className="opacity-40">
        <rect x="2" y="4" width="20" height="16" rx="2" />
        <path d="M2 8h20" /><path d="M9 14h6" />
    </svg>
);
