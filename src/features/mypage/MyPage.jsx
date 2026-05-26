import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useReducedMotion } from 'framer-motion';
import {
    Share2,
    Instagram,
    MapPin,
    MessageSquare,
    ChevronRight,
    CreditCard,
    MessageCircle,
    FileText,
    LogOut,
    Lightbulb,
    Zap,
    ExternalLink,
} from 'lucide-react';
import { logout } from '../auth/api/authApi';
import { ProfileEditDrawer } from './ProfileEditDrawer';
import { InquiryModal } from './InquiryModal';
import { KakaoLinkDrawer } from './KakaoLinkDrawer';
import { LogoutModal } from './LogoutModal';
import { WithdrawModal } from './WithdrawModal';
import { Toast } from '../../components/ui/Toast';

// ─── Static config ────────────────────────────────────────────

const PLATFORM_ICONS = { instagram: Instagram, naver: MapPin, kakao: MessageSquare };

const STATUS_CFG = {
    connected:  { dot: 'bg-success',  label: '연동됨',  labelCls: 'text-success' },
    collecting: { dot: 'bg-primary',  label: '수집 중', labelCls: 'text-primary' },
};

// ─── PlatformRow ──────────────────────────────────────────────

const PlatformRow = ({ platform, onLinkClick }) => {
    const { id, name, handle, status } = platform;
    const Icon = PLATFORM_ICONS[id] ?? MessageSquare;
    const cfg = STATUS_CFG[status];
    const isUnlinked = status === 'unlinked';

    return (
        <div
            className={`flex items-center gap-3 p-3.5 rounded-xl transition-colors ${
                isUnlinked
                    ? 'border border-dashed border-gray-200 hover:border-primary/40 hover:bg-primary-tint cursor-pointer group'
                    : 'bg-bg-page'
            }`}
            onClick={isUnlinked ? onLinkClick : undefined}
        >
            <div
                className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 ${
                    isUnlinked ? 'bg-gray-100 group-hover:bg-white transition-colors' : 'bg-white shadow-sm'
                }`}
            >
                <Icon
                    size={17}
                    className={isUnlinked ? 'text-text-main/25 group-hover:text-primary transition-colors' : 'text-primary'}
                />
            </div>

            <div className="flex-1 min-w-0">
                <p className="text-body-6 text-text-main truncate">{name}</p>
                {handle && <p className="text-caption text-text-main/40 truncate">{handle}</p>}
            </div>

            {cfg ? (
                <div className="flex items-center gap-1.5 shrink-0" aria-label={`${name} 상태: ${cfg.label}`}>
                    <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${cfg.dot}`} />
                    <span className={`text-caption font-semibold tracking-tight ${cfg.labelCls}`}>{cfg.label}</span>
                </div>
            ) : (
                <button
                    onClick={(e) => { e.stopPropagation(); onLinkClick?.(); }}
                    className="shrink-0 flex items-center gap-0.5 text-caption font-bold text-point
                               hover:opacity-70 transition-opacity focus-visible:outline-none
                               focus-visible:ring-1 focus-visible:ring-point/30 rounded"
                    aria-label={`${name} 연동하기`}
                >
                    연동하기
                    <ChevronRight size={12} />
                </button>
            )}
        </div>
    );
};

// ─── Main ─────────────────────────────────────────────────────

const MyPage = ({ onNavigate, profile }) => {
    const navigate = useNavigate();
    const shouldReduceMotion = useReducedMotion();

    // profile state
    const [profileData, setProfileData] = useState({
        storeName: '범계 로데오점',
        storeType: '이자카야',
        tones: ['친근한', '감성적인', '트렌디한'],
        keywords: ['#하이볼맛집', '#숙성회', '#데이트코스', '#분위기강패', '#안주가맛있는', '#사진맛집'],
    });

    // platform state
    const [platforms, setPlatforms] = useState([
        { id: 'instagram', name: 'Instagram', handle: '@bumgye_rodeo', status: 'connected' },
        { id: 'naver',     name: 'Naver Place', handle: '범계 로데오점', status: 'collecting' },
        { id: 'kakao',     name: '카카오 채널', handle: null, status: 'unlinked' },
    ]);

    // overlay states
    const [isProfileEditOpen, setIsProfileEditOpen] = useState(false);
    const [isInquiryOpen, setIsInquiryOpen] = useState(false);
    const [isKakaoDrawerOpen, setIsKakaoDrawerOpen] = useState(false);
    const [isLogoutOpen, setIsLogoutOpen] = useState(false);
    const [isWithdrawOpen, setIsWithdrawOpen] = useState(false);

    // toast
    const [toast, setToast] = useState('');

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const handleWithdraw = async () => {
        // API 미확정 — 탈퇴 처리 후 로그아웃
        logout();
        navigate('/login');
    };

    const handleProfileSave = async (data) => {
        // API 미확정 — 낙관적 업데이트
        setProfileData(data);
    };

    const handleKakaoSuccess = () => {
        setPlatforms((prev) =>
            prev.map((p) =>
                p.id === 'kakao' ? { ...p, handle: '@kakaochannel', status: 'collecting' } : p
            )
        );
    };

    const handleGuideClick = () => {
        setToast('이용 가이드를 준비 중입니다.');
    };

    const creditUsed    = 12;
    const creditTotal   = 30;
    const creditPercent = Math.round((creditUsed / creditTotal) * 100);

    const userEmail = profile?.email ?? '';

    return (
        <>
            <div
                className={`flex flex-col h-full gap-4 overflow-y-auto md:overflow-hidden ${
                    shouldReduceMotion ? '' : 'animate-in fade-in slide-in-from-bottom-4 duration-500'
                }`}
            >
                <div className="grid grid-cols-1 md:grid-cols-3 md:grid-rows-2 gap-4 md:flex-1 md:min-h-0 pb-1 md:pb-0">

                    {/* ── Strong Box 1: Platform Connection ── */}
                    <div className="col-span-1 md:row-span-2 bg-white rounded-[24px] p-5 shadow-sm border border-gray-100 flex flex-col overflow-hidden">
                        <div className="flex items-center gap-2 mb-5 shrink-0">
                            <Share2 size={16} className="text-primary" />
                            <h3 className="text-head-5 text-text-main">플랫폼 연동</h3>
                        </div>

                        <div className="flex flex-col gap-2.5 flex-1 overflow-hidden">
                            {platforms.map((p) => (
                                <PlatformRow
                                    key={p.id}
                                    platform={p}
                                    onLinkClick={p.id === 'kakao' ? () => setIsKakaoDrawerOpen(true) : undefined}
                                />
                            ))}

                            <div className="mt-auto pt-4 border-t border-gray-100 flex items-start gap-2 shrink-0">
                                <Lightbulb size={13} className="text-primary-inactive mt-0.5 shrink-0" />
                                <p className="text-caption text-text-main/40 leading-relaxed">
                                    모든 플랫폼을 연동하면 AI 분석이 더 정확해집니다.
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* ── Strong Box 2: AI Profile ── */}
                    <div className="col-span-1 md:col-span-2 bg-white rounded-[24px] p-5 shadow-sm border border-gray-100 flex flex-col overflow-hidden">
                        <div className="flex items-center justify-between mb-4 shrink-0">
                            <div className="flex items-center gap-2">
                                <Zap size={16} className="text-primary" />
                                <h3 className="text-head-5 text-text-main">가게 AI 프로필</h3>
                            </div>
                            <button
                                onClick={() => setIsProfileEditOpen(true)}
                                className="flex items-center gap-0.5 text-body-7 text-primary-inactive
                                           hover:text-primary transition-colors focus-visible:outline-none
                                           focus-visible:ring-2 focus-visible:ring-primary/20 rounded px-1"
                                aria-label="가게 AI 프로필 수정"
                            >
                                수정하기
                                <ChevronRight size={14} />
                            </button>
                        </div>

                        <div className="flex flex-col sm:flex-row gap-5 flex-1 overflow-hidden">
                            {/* Basic info */}
                            <div className="flex-1 space-y-3.5 sm:border-r sm:border-gray-100 sm:pr-5 overflow-hidden">
                                <div>
                                    <p className="text-caption text-text-main/30 mb-1.5 tracking-[0.06em] uppercase">가게 정보</p>
                                    <p className="text-body-1 text-text-main leading-tight truncate">{profileData.storeName}</p>
                                    <p className="text-body-7 text-text-main/50 mt-0.5">{profileData.storeType}</p>
                                </div>
                                <div>
                                    <p className="text-caption text-text-main/30 mb-2 tracking-[0.06em] uppercase">브랜드 톤앤매너</p>
                                    <div className="flex flex-wrap gap-1.5">
                                        {profileData.tones.map((t) => (
                                            <span key={t} className="px-2.5 py-1 bg-primary-tint text-primary text-body-6 rounded-full">
                                                {t}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            {/* Keywords */}
                            <div className="flex-1 overflow-hidden">
                                <p className="text-caption text-text-main/30 mb-2 tracking-[0.06em] uppercase">주력 메뉴 키워드</p>
                                <div className="flex flex-wrap gap-1.5">
                                    {profileData.keywords.map((tag) => (
                                        <span key={tag} className="text-body-7 text-text-main/50 bg-bg-page px-2.5 py-1 rounded-lg">
                                            {tag}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* ── Strong Box 3: Membership + Support ── */}
                    <div className="col-span-1 md:col-span-2 bg-white rounded-[24px] p-5 shadow-sm border border-gray-100 flex flex-col overflow-hidden">
                        <div className="flex items-center gap-2 mb-4 shrink-0">
                            <CreditCard size={16} className="text-primary" />
                            <h3 className="text-head-5 text-text-main">멤버십 & 크레딧</h3>
                        </div>

                        <div className="flex-1 flex flex-col justify-between min-h-0">
                            <div className="space-y-3.5">
                                {/* Plan row */}
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <span className="bg-primary text-white text-caption px-2 py-0.5 rounded-md font-semibold">
                                            Pro Plan
                                        </span>
                                        <span className="text-body-7 text-text-main/40">이용 중</span>
                                    </div>
                                    <button
                                        onClick={() => onNavigate?.('subscription')}
                                        className="flex items-center gap-0.5 text-body-7 text-primary-inactive
                                                   hover:text-primary transition-colors focus-visible:outline-none
                                                   focus-visible:ring-1 focus-visible:ring-primary/20 rounded"
                                        aria-label="플랜 관리"
                                    >
                                        플랜 관리
                                        <ChevronRight size={14} />
                                    </button>
                                </div>

                                {/* Credit bar */}
                                <div>
                                    <div className="flex justify-between items-baseline mb-2">
                                        <span className="text-body-7 text-text-main/60">이번 달 AI 생성 횟수</span>
                                        <span className="text-body-5 text-primary">
                                            {creditUsed}
                                            <span className="text-caption text-text-main/40 font-normal"> / {creditTotal}회</span>
                                        </span>
                                    </div>
                                    <div
                                        className="w-full h-1.5 bg-bg-page rounded-full overflow-hidden"
                                        role="progressbar"
                                        aria-valuenow={creditUsed}
                                        aria-valuemax={creditTotal}
                                        aria-label={`AI 생성 횟수 ${creditUsed}/${creditTotal}회 사용`}
                                    >
                                        <div
                                            className="h-full bg-primary rounded-full"
                                            style={{ width: `${creditPercent}%` }}
                                        />
                                    </div>
                                </div>

                                {/* Billing info */}
                                <div className="flex gap-6">
                                    <div>
                                        <p className="text-caption text-text-main/40 mb-0.5">다음 결제일</p>
                                        <p className="text-body-6 text-text-main">2025. 12. 01</p>
                                    </div>
                                    <div className="w-px bg-gray-100 self-stretch" aria-hidden="true" />
                                    <div>
                                        <p className="text-caption text-text-main/40 mb-0.5">결제 수단</p>
                                        <p className="text-body-6 text-text-main">현대카드 ···· 1234</p>
                                    </div>
                                </div>
                            </div>

                            {/* Support + logout footer */}
                            <div className="pt-3.5 mt-3 pb-2 border-t border-gray-100 shrink-0">
                                <div className="flex items-center gap-1">
                                    <button
                                        onClick={() => setIsInquiryOpen(true)}
                                        className="flex-1 flex items-center justify-center gap-1.5
                                                   py-2 rounded-lg hover:bg-bg-page transition-colors group
                                                   focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary/20"
                                        aria-label="1:1 문의하기"
                                    >
                                        <MessageCircle size={14} className="text-text-main/25 group-hover:text-primary transition-colors shrink-0" />
                                        <span className="text-body-7 text-text-main/40 group-hover:text-primary transition-colors">1:1 문의</span>
                                    </button>
                                    <button
                                        onClick={handleGuideClick}
                                        className="flex-1 flex items-center justify-center gap-1.5
                                                   py-2 rounded-lg hover:bg-bg-page transition-colors group
                                                   focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary/20"
                                        aria-label="서비스 이용 가이드"
                                    >
                                        <FileText size={14} className="text-text-main/25 group-hover:text-primary transition-colors shrink-0" />
                                        <span className="text-body-7 text-text-main/40 group-hover:text-primary transition-colors">이용 가이드</span>
                                        <ExternalLink size={11} className="text-text-main/20 group-hover:text-primary/50 transition-colors shrink-0" />
                                    </button>
                                    <div className="w-px h-4 bg-gray-100 shrink-0" aria-hidden="true" />
                                    <button
                                        onClick={() => setIsLogoutOpen(true)}
                                        className="flex-1 flex items-center justify-center gap-1.5
                                                   py-2 rounded-lg hover:bg-bg-page transition-colors group
                                                   focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary/20"
                                        aria-label="로그아웃"
                                    >
                                        <LogOut size={14} className="text-text-main/25 group-hover:text-primary-inactive transition-colors shrink-0" />
                                        <span className="text-body-7 text-text-main/40 group-hover:text-primary-inactive transition-colors">로그아웃</span>
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                </div>
            </div>

            {/* Overlays */}
            <ProfileEditDrawer
                isOpen={isProfileEditOpen}
                onClose={() => setIsProfileEditOpen(false)}
                initialData={profileData}
                onSave={handleProfileSave}
            />
            <InquiryModal
                isOpen={isInquiryOpen}
                onClose={() => setIsInquiryOpen(false)}
                userEmail={userEmail}
            />
            <KakaoLinkDrawer
                isOpen={isKakaoDrawerOpen}
                onClose={() => setIsKakaoDrawerOpen(false)}
                onSuccess={handleKakaoSuccess}
            />
            <LogoutModal
                isOpen={isLogoutOpen}
                onClose={() => setIsLogoutOpen(false)}
                onConfirm={handleLogout}
                onWithdrawClick={() => { setIsLogoutOpen(false); setIsWithdrawOpen(true); }}
            />
            <WithdrawModal
                isOpen={isWithdrawOpen}
                onClose={() => setIsWithdrawOpen(false)}
                onWithdraw={handleWithdraw}
                onManageSubscription={() => { setIsWithdrawOpen(false); onNavigate?.('subscription'); }}
            />
            <Toast message={toast} onDismiss={() => setToast('')} />
        </>
    );
};

export default MyPage;
