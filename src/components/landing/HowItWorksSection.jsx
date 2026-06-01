import React, { useRef } from 'react';
import { motion, useReducedMotion, useInView } from 'framer-motion';
import { Users, PlayCircle, LayoutDashboard, RefreshCw } from 'lucide-react';

const STEPS = [
    {
        num: '01',
        icon: Users,
        title: '손님 분석',
        description: '상권 데이터와 리뷰를 AI가 분석해 손님 페르소나와 마케팅 포인트를 도출합니다.',
        color: 'bg-primary-tint',
        iconColor: 'text-primary',
    },
    {
        num: '02',
        icon: PlayCircle,
        title: '홍보 영상 만들기',
        description: '인사이트를 반영해 AI가 사진으로 숏폼 영상을 자동 제작합니다.',
        color: 'bg-point-bg',
        iconColor: 'text-point',
    },
    {
        num: '03',
        icon: LayoutDashboard,
        title: '가게 현황',
        description: '성과를 확인하고 AI가 다음 홍보 미션을 제안해 루프를 이어갑니다.',
        color: 'bg-primary-tint',
        iconColor: 'text-primary',
    },
];

const Connector = ({ delay, shouldAnimate }) => (
    <div className="hidden md:flex items-center justify-center w-12 flex-shrink-0 mt-[-60px]">
        <svg width="40" height="2" viewBox="0 0 40 2" fill="none">
            <motion.line
                x1="0" y1="1" x2="40" y2="1"
                stroke="#002B7A"
                strokeOpacity="0.2"
                strokeWidth="2"
                strokeDasharray="4 3"
                initial={shouldAnimate ? { pathLength: 0 } : {}}
                whileInView={{ pathLength: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay, ease: 'easeOut' }}
            />
        </svg>
    </div>
);

const StepCard = ({ step, index, shouldAnimate }) => {
    const { num, icon: Icon, title, description, color, iconColor } = step;

    return (
        <motion.div
            initial={shouldAnimate ? { opacity: 0, y: 32 } : false}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-60px' }}
            transition={{ duration: 0.5, delay: index * 0.15, ease: [0.22, 1, 0.36, 1] }}
            className="flex-1 relative"
        >
            <span className="absolute top-4 right-6 text-[80px] font-bold text-text-main/5 leading-none select-none pointer-events-none">
                {num}
            </span>

            <div className="bg-white rounded-[24px] p-8 shadow-soft border border-neutral-200 h-full flex flex-col">
                <div className={`w-14 h-14 rounded-xl ${color} flex items-center justify-center mb-6`}>
                    <Icon size={28} className={iconColor} />
                </div>

                <span className="text-[12px] font-bold text-neutral-300 tracking-[0.15em] uppercase mb-3">
                    Step {num}
                </span>

                <h3 className="text-[22px] font-bold text-text-main mb-3">{title}</h3>
                <p className="text-body-7 text-neutral-600 leading-relaxed break-keep">{description}</p>
            </div>
        </motion.div>
    );
};

const HowItWorksSection = () => {
    const shouldAnimate = !useReducedMotion();
    const loopRef = useRef(null);
    const loopInView = useInView(loopRef, { once: true });

    return (
        <section className="py-32 px-6 bg-neutral-50">
            <div className="max-w-[1200px] mx-auto">
                <motion.div
                    initial={shouldAnimate ? { opacity: 0, y: 24 } : false}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: '-80px' }}
                    transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                    className="text-center mb-20"
                >
                    <h2 className="text-[40px] md:text-[52px] font-bold text-text-main tracking-tight break-keep mb-4">
                        3단계가 하나의 루프로 이어집니다.
                    </h2>
                    <p className="text-[18px] text-neutral-400 break-keep">
                        분석 → 영상 → 성과 → 다시 분석. 선순환이 매출을 키웁니다.
                    </p>
                </motion.div>

                <div className="flex flex-col md:flex-row items-stretch gap-6 md:gap-0">
                    {STEPS.map((step, i) => (
                        <React.Fragment key={step.num}>
                            <StepCard step={step} index={i} shouldAnimate={shouldAnimate} />
                            {i < STEPS.length - 1 && (
                                <Connector delay={i * 0.15 + 0.3} shouldAnimate={shouldAnimate} />
                            )}
                        </React.Fragment>
                    ))}
                </div>

                <div ref={loopRef} className="mt-12 flex justify-center">
                    <motion.div
                        initial={shouldAnimate ? { opacity: 0, scale: 0.9 } : false}
                        animate={loopInView ? { opacity: 1, scale: 1 } : {}}
                        transition={{ duration: 0.5, delay: 0.6, ease: [0.22, 1, 0.36, 1] }}
                        className="flex items-center gap-3 px-6 py-3.5 bg-white border border-primary-border rounded-full shadow-sm"
                    >
                        <motion.div
                            animate={loopInView && shouldAnimate ? { rotate: 360 } : {}}
                            transition={{ duration: 1.2, delay: 1, ease: 'easeOut' }}
                        >
                            <RefreshCw size={16} className="text-primary" />
                        </motion.div>
                        <p className="text-body-6 text-primary">
                            가게 현황의 <span className="font-bold">다음 행동 제안</span>이 다시 영상 제작으로 이어지는 선순환
                        </p>
                    </motion.div>
                </div>
            </div>
        </section>
    );
};

export default HowItWorksSection;
