import React, { useRef, useEffect } from 'react';
import { motion, useReducedMotion, useInView, useMotionValue, useTransform, animate } from 'framer-motion';
import { Sparkles, PlayCircle, BarChart2, ArrowUpRight } from 'lucide-react';

const KPI = [
    { label: '검색량', value: 1284, unit: '회', cmp: '+12%' },
    { label: '방문자', value: 847,  unit: '명', cmp: '+8%' },
    { label: '영상 저장', value: 23, unit: '회', cmp: '+5%' },
];

const BAR_HEIGHTS = [38, 52, 44, 70, 84, 90, 72];

function CountUp({ target, unit }) {
    const shouldAnimate = !useReducedMotion();
    const ref = useRef(null);
    const isInView = useInView(ref, { once: true });
    const count = useMotionValue(0);
    const rounded = useTransform(count, (v) => Math.round(v).toLocaleString());

    useEffect(() => {
        if (!isInView) return;
        if (shouldAnimate) {
            const ctrl = animate(count, target, { duration: 1.5, ease: 'easeOut' });
            return ctrl.stop;
        }
        count.set(target);
    }, [isInView, shouldAnimate, count, target]);

    return (
        <span ref={ref} className="flex items-baseline gap-[2px]">
            <motion.span className="text-[20px] font-bold text-text-main leading-none tracking-tight">{rounded}</motion.span>
            <span className="text-[13px] font-bold text-text-main">{unit}</span>
        </span>
    );
}

const DashboardMockup = () => {
    const shouldAnimate = !useReducedMotion();
    const ref = useRef(null);
    const isInView = useInView(ref, { once: true });

    return (
        <div
            ref={ref}
            aria-hidden="true"
            className="bg-bg-page rounded-[24px] overflow-hidden border border-neutral-200 p-4 flex flex-col gap-3"
        >
            {/* KPI 타일 3개 — V2KpiTile 스타일 */}
            <div className="grid grid-cols-3 gap-2">
                {KPI.map((k, i) => (
                    <motion.div
                        key={k.label}
                        initial={shouldAnimate ? { opacity: 0, y: 8 } : false}
                        animate={isInView ? { opacity: 1, y: 0 } : {}}
                        transition={{ duration: 0.4, delay: i * 0.1, ease: [0.22, 1, 0.36, 1] }}
                        className="bg-white rounded-xl p-2.5 flex flex-col gap-1 border border-neutral-200"
                    >
                        <p className="text-[11px] text-neutral-500 font-medium">{k.label}</p>
                        <CountUp target={k.value} unit={k.unit} />
                        <div className="flex items-center gap-0.5 px-1.5 py-0.5 rounded bg-primary-tint w-fit">
                            <ArrowUpRight size={10} strokeWidth={3} className="text-primary" />
                            <span className="text-[10px] font-bold text-primary">{k.cmp}</span>
                        </div>
                    </motion.div>
                ))}
            </div>

            {/* AI 제안 카드 — V2AiSuggestionCard 스타일 (compact) */}
            <motion.div
                initial={shouldAnimate ? { opacity: 0, y: 8 } : false}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.45, delay: 0.35, ease: [0.22, 1, 0.36, 1] }}
                className="bg-primary rounded-[24px] p-4 relative overflow-hidden"
            >
                {/* 배경 glow — static, 무한 루프 없음 */}
                <div className="absolute top-[-40%] right-[-5%] w-32 h-32 bg-white/10 rounded-full blur-[40px] pointer-events-none" />

                <div className="relative z-10 flex flex-col gap-3">
                    <div className="flex items-center gap-2 flex-wrap">
                        <div className="flex items-center gap-1 bg-white/10 px-2 py-1 rounded-lg border border-white/20">
                            <Sparkles size={10} className="text-point" />
                            <span className="text-[10px] font-bold text-white tracking-wide">상황 매칭도: 높음</span>
                        </div>
                        <div className="flex items-center gap-1 text-[10px] text-white/60">
                            <BarChart2 size={10} />
                            <span>검색량 급증 중</span>
                        </div>
                    </div>

                    <p className="text-[13px] font-bold text-white leading-snug break-keep">
                        비 오는 날엔 따뜻한 메뉴 영상을 지금 만들어보세요
                    </p>

                    <div className="flex items-center justify-center gap-2 bg-point px-3 py-2 rounded-xl">
                        <PlayCircle size={14} className="text-white" strokeWidth={2.5} />
                        <span className="text-[12px] font-bold text-white">지금 영상 만들기</span>
                    </div>
                </div>
            </motion.div>

            {/* 7일 트렌드 바차트 — scaleY 애니메이션 */}
            <div className="bg-white rounded-xl p-3 border border-neutral-200">
                <p className="text-[10px] text-neutral-400 font-bold mb-2 tracking-wide uppercase">주간 방문 트렌드</p>
                <div className="flex items-end gap-1" style={{ height: '48px' }}>
                    {BAR_HEIGHTS.map((h, i) => (
                        <motion.div
                            key={i}
                            className={`flex-1 rounded-sm origin-bottom ${i >= 5 ? 'bg-primary' : 'bg-primary/20'}`}
                            style={{ height: `${h}%` }}
                            initial={shouldAnimate ? { scaleY: 0 } : false}
                            animate={isInView ? { scaleY: 1 } : {}}
                            transition={{ duration: 0.5, delay: i * 0.06 + 0.5, ease: [0.22, 1, 0.36, 1] }}
                        />
                    ))}
                </div>
            </div>
        </div>
    );
};

export default DashboardMockup;
