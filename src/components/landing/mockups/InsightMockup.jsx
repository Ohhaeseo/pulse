import React, { useRef, useEffect } from 'react';
import { motion, useReducedMotion, useInView, useMotionValue, useTransform, animate } from 'framer-motion';
import { Sparkles, Briefcase, Users, Coffee, BarChart2 } from 'lucide-react';

const PERSONAS = [
    { Icon: Briefcase, label: '30대 직장인', detail: '퇴근 후 가벼운 음식과 한잔' },
    { Icon: Users,     label: '주말 가족',   detail: '여럿이 즐기는 푸짐한 식사' },
    { Icon: Coffee,    label: '아침 직장인', detail: '빠른 아침과 테이크아웃' },
];

const STEPS = ['탐색', '방문', '식사', '기타'];

function ScoreCount({ target }) {
    const shouldAnimate = !useReducedMotion();
    const ref = useRef(null);
    const isInView = useInView(ref, { once: true });
    const count = useMotionValue(0);
    const rounded = useTransform(count, (v) => Math.round(v));

    useEffect(() => {
        if (!isInView) return;
        if (shouldAnimate) {
            const ctrl = animate(count, target, { duration: 1.5, ease: 'easeOut' });
            return ctrl.stop;
        }
        count.set(target);
    }, [isInView, shouldAnimate, count, target]);

    return <motion.span ref={ref}>{rounded}</motion.span>;
}

const InsightMockup = () => {
    const shouldAnimate = !useReducedMotion();
    const ref = useRef(null);
    const isInView = useInView(ref, { once: true });

    return (
        <div
            ref={ref}
            aria-hidden="true"
            className="bg-bg-page rounded-[24px] overflow-hidden border border-neutral-200 p-4 flex flex-col gap-3"
        >
            {/* 헤더 — PULSE 인사이트 요약 + 점수 */}
            <div className="flex items-center justify-between bg-white rounded-xl px-3 py-2.5 border border-neutral-200">
                <div className="flex items-center gap-1.5">
                    <Sparkles size={12} className="text-primary" />
                    <span className="text-[11px] font-bold text-primary">PULSE 인사이트 요약</span>
                </div>
                <div className="flex items-baseline gap-0.5">
                    <span className="text-[22px] font-bold text-primary leading-none">
                        <ScoreCount target={92} />
                    </span>
                    <span className="text-[12px] font-bold text-primary">점</span>
                </div>
            </div>

            {/* 상황 매칭도 뱃지 */}
            <div className="flex items-center gap-1.5 bg-primary-tint px-3 py-1.5 rounded-xl w-fit">
                <Sparkles size={10} className="text-point" />
                <span className="text-[11px] font-bold text-primary">상황 매칭도: 높음</span>
                <div className="ml-1 flex items-center gap-1 text-[10px] text-primary/60">
                    <BarChart2 size={10} />
                    <span>검색량 급증 중</span>
                </div>
            </div>

            {/* 페르소나 목록 — V2PersonaSummary 스타일 */}
            <div>
                <p className="text-[10px] font-bold text-primary/70 tracking-wide mb-1.5 uppercase">
                    이런 손님들이 많이 찾았어요
                </p>
                <div className="flex flex-col gap-1.5">
                    {PERSONAS.map(({ Icon, label, detail }, i) => (
                        <motion.div
                            key={label}
                            initial={shouldAnimate ? { opacity: 0, x: -10 } : false}
                            animate={isInView ? { opacity: 1, x: 0 } : {}}
                            transition={{ duration: 0.4, delay: i * 0.1 + 0.15, ease: [0.22, 1, 0.36, 1] }}
                            className="flex items-center gap-2.5 py-2 px-3 bg-blue-50/60 border border-blue-100/50 rounded-xl"
                        >
                            <div className="w-7 h-7 rounded-full bg-white flex items-center justify-center shadow-sm border border-blue-100/30 flex-shrink-0">
                                <Icon size={13} className="text-primary" />
                            </div>
                            <div className="min-w-0">
                                <p className="text-[12px] font-bold text-primary leading-tight">{label}</p>
                                <p className="text-[10px] text-primary/60 font-medium leading-tight truncate">{detail}</p>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>

            {/* 단계별 여정 */}
            <div className="grid grid-cols-4 gap-1.5">
                {STEPS.map((label, i) => (
                    <motion.div
                        key={label}
                        initial={shouldAnimate ? { opacity: 0, y: 8 } : false}
                        animate={isInView ? { opacity: 1, y: 0 } : {}}
                        transition={{ duration: 0.35, delay: i * 0.08 + 0.5, ease: [0.22, 1, 0.36, 1] }}
                        className="bg-white rounded-xl p-2 text-center border border-neutral-200"
                    >
                        <p className="text-[9px] text-neutral-400 font-bold tracking-wide">STEP{String(i + 1).padStart(2, '0')}</p>
                        <p className="text-[12px] font-bold text-primary mt-0.5">{label}</p>
                    </motion.div>
                ))}
            </div>
        </div>
    );
};

export default InsightMockup;
