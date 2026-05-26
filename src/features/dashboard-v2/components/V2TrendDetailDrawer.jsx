import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { X, TrendingUp } from 'lucide-react';
import { useFocusTrap } from '../../../hooks/useFocusTrap';
import V2TrendDetailChart from './V2TrendDetailChart';
import V2ReelsContributionList from './V2ReelsContributionList';

const formatPeriod = (startDate, endDate) => {
    if (!startDate || !endDate) return '';
    const [, sm, sd] = startDate.split('-').map(Number);
    const [, em, ed] = endDate.split('-').map(Number);
    return `${sm}월 ${sd}일 ~ ${em}월 ${ed}일`;
};

/**
 * "자세히 보기" slide-in drawer.
 * StatusV2Page(position:relative + overflow-hidden) 내에서 absolute로 렌더링.
 * 사이드바를 침범하지 않고 main content area만 덮음.
 */
const DrawerPanel = ({ data, onClose }) => {
    const shouldReduceMotion = useReducedMotion();
    const [isMobile, setIsMobile] = useState(
        () => typeof window !== 'undefined' && window.innerWidth < 768
    );
    const trapRef = useFocusTrap(true, onClose);

    useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth < 768);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const backdropVariants = {
        hidden: { opacity: 0 },
        visible: { opacity: 1 },
        exit: { opacity: 0 },
    };

    const panelVariants = shouldReduceMotion
        ? { hidden: { opacity: 0 }, visible: { opacity: 1 }, exit: { opacity: 0 } }
        : isMobile
            ? {
                hidden: { y: '100%', opacity: 0 },
                visible: { y: 0, opacity: 1 },
                exit: { y: '100%', opacity: 0 },
            }
            : {
                hidden: { x: '100%', opacity: 0 },
                visible: { x: 0, opacity: 1 },
                exit: { x: '100%', opacity: 0 },
            };

    const transition = { duration: shouldReduceMotion ? 0.15 : 0.28, ease: [0.4, 0, 0.2, 1] };

    const period = data?.period ?? {};
    const dailySeries = data?.dailySeries ?? [];
    const reels = data?.reelsContribution ?? [];
    const peakDay = data?.peakDay ?? null;
    const periodLabel = formatPeriod(period.startDate, period.endDate);

    return (
        <>
            {/* Backdrop */}
            <motion.div
                className="absolute inset-0 z-40 bg-black/30"
                variants={backdropVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
                transition={{ duration: shouldReduceMotion ? 0.1 : 0.2 }}
                onClick={onClose}
                aria-hidden="true"
            />

            {/* Panel */}
            <motion.div
                ref={trapRef}
                id="trend-detail-drawer"
                role="dialog"
                aria-modal="true"
                aria-labelledby="drawer-title"
                className={[
                    'absolute z-50 bg-white overflow-y-auto',
                    // mobile: full-width bottom sheet
                    'bottom-0 left-0 right-0 rounded-t-[24px]',
                    'h-[85dvh]',
                    // desktop: right-side panel (overrides mobile)
                    'md:top-0 md:right-0 md:bottom-0 md:left-auto md:h-auto',
                    'md:w-[480px] xl:w-[560px]',
                    'md:rounded-l-[24px] md:rounded-tr-none md:rounded-br-none',
                    'bg-bg-card',
                ].join(' ')}
                style={{ boxShadow: '0 8px 40px rgba(0,43,122,0.18)' }}
                variants={panelVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
                transition={transition}
            >
                {/* ── Header ── */}
                <div className="flex items-start justify-between gap-3 px-6 pt-6 pb-4 shrink-0 border-b border-primary-tint">
                    <div>
                        <h2
                            id="drawer-title"
                            className="text-[16px] font-bold text-[#191F28] leading-snug"
                        >
                            계정 도달 상세
                        </h2>
                        {periodLabel && (
                            <p className="text-[12px] text-primary-inactive mt-0.5">{periodLabel}</p>
                        )}
                    </div>
                    <button
                        onClick={onClose}
                        aria-label="도달 상세 닫기"
                        className="p-1.5 rounded-lg text-gray-400 hover:text-[#191F28] hover:bg-[#F5F7FA] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#002B7A] focus-visible:ring-offset-1"
                    >
                        <X size={18} />
                    </button>
                </div>

                {/* ── Sections ── */}
                <div className="flex flex-col gap-6 px-6 py-5">

                    {/* Section 1: 4주 도달 추이 */}
                    <section>
                        <h3 className="text-[13px] font-bold text-gray-400 tracking-wide flex items-center gap-2 mb-3">
                            <span className="w-1.5 h-1.5 rounded-full bg-[#002B7A]" />
                            최근 4주 도달 추이
                        </h3>
                        <V2TrendDetailChart dailySeries={dailySeries} period={period} />
                        {period.endDate && (
                            <p className="text-[11px] text-gray-400 mt-2 text-right">
                                음영 구간 = 최근 1주
                            </p>
                        )}
                    </section>

                    {/* 구분선 */}
                    <div className="w-full h-px bg-primary-tint shrink-0" />

                    {/* Section 2: 릴스별 도달 */}
                    <section>
                        <h3 className="text-[13px] font-bold text-gray-400 tracking-wide flex items-center gap-2 mb-3">
                            <span className="w-1.5 h-1.5 rounded-full bg-[#FF5A36]" />
                            최근 릴스별 도달
                        </h3>
                        <V2ReelsContributionList reels={reels} />
                    </section>

                    {/* 구분선 */}
                    {peakDay && <div className="w-full h-px bg-gray-100 shrink-0" />}

                    {/* Section 3: 피크 요일 인사이트 */}
                    {peakDay && (
                        <section>
                            <h3 className="text-[13px] font-bold text-gray-400 tracking-wide flex items-center gap-2 mb-3">
                                <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                                피크 요일 인사이트
                            </h3>
                            <div className="flex items-start gap-3 p-3.5 bg-[#F5F7FA] rounded-xl">
                                <TrendingUp
                                    size={18}
                                    className="text-[#002B7A] shrink-0 mt-0.5"
                                    aria-hidden="true"
                                />
                                <p className="text-[13px] font-medium text-[#191F28] leading-relaxed">
                                    {peakDay.insightText}
                                </p>
                            </div>
                        </section>
                    )}

                    {/* 하단 여백 (모바일에서 홈 인디케이터 공간) */}
                    <div className="h-4 md:h-2 shrink-0" />
                </div>
            </motion.div>
        </>
    );
};

// data=null이어도 drawer shell을 열고 내부에서 빈 상태를 처리
const V2TrendDetailDrawer = ({ isOpen, onClose, data }) => (
    <AnimatePresence>
        {isOpen && (
            <DrawerPanel key="trend-detail-drawer" data={data} onClose={onClose} />
        )}
    </AnimatePresence>
);

export default V2TrendDetailDrawer;
