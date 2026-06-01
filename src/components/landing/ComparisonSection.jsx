import React from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { X, Check } from 'lucide-react';

const COMPARISONS = [
    { bad: '매일 몇 시간씩 SNS 고민', good: 'AI가 오늘 올릴 콘텐츠 방향을 제안' },
    { bad: '편집 기술 없으면 영상 불가', good: '사진 업로드만으로 숏폼 영상 완성' },
    { bad: '손님이 뭘 좋아하는지 감이 없음', good: '리뷰 기반 손님 페르소나 즉시 파악' },
    { bad: '어디에 광고해야 할지 몰라 낭비', good: '타겟 기반으로 효율적인 홍보 실행' },
    { bad: '홍보 성과를 알 수가 없음', good: '대시보드에서 성과 한눈에 확인' },
];

const listV = {
    hidden: {},
    show: { transition: { staggerChildren: 0.08, delayChildren: 0.15 } },
};
const rowV = {
    hidden: { opacity: 0, y: 12 },
    show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] } },
};

const ComparisonSection = () => {
    const shouldAnimate = !useReducedMotion();

    const listProps = shouldAnimate
        ? { variants: listV, initial: 'hidden', whileInView: 'show', viewport: { once: true, margin: '-60px' } }
        : {};
    const rowProps = shouldAnimate ? { variants: rowV } : {};

    return (
        <section className="py-32 px-6 bg-white">
            <div className="max-w-[1200px] mx-auto">
                {/* 헤드라인 */}
                <motion.div
                    initial={shouldAnimate ? { opacity: 0, y: 24 } : false}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: '-80px' }}
                    transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                    className="mb-16 text-center"
                >
                    <h2 className="text-[40px] md:text-[52px] font-bold text-text-main tracking-tight break-keep leading-[1.2]">
                        혼자 할 때와<br />PULSE와 함께할 때
                    </h2>
                    <p className="mt-5 text-[18px] md:text-[20px] text-neutral-600 break-keep">
                        같은 하루, 결과는 완전히 달라집니다.
                    </p>
                </motion.div>

                {/* 비대칭 카드 */}
                <div className="grid lg:grid-cols-2 gap-6 lg:gap-8 items-start">
                    {/* 혼자 카드 — 가라앉은 */}
                    <motion.div
                        initial={shouldAnimate ? { opacity: 0, y: 20 } : false}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, margin: '-60px' }}
                        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                        className="rounded-[24px] border border-neutral-200 bg-neutral-100 p-7 lg:p-8"
                    >
                        <div className="mb-7">
                            <p className="text-head-5 text-neutral-500">혼자 마케팅</p>
                        </div>

                        <motion.ul {...listProps} className="flex flex-col gap-4">
                            {COMPARISONS.map((item) => (
                                <motion.li {...rowProps} key={item.bad} className="flex items-center gap-3">
                                    <span className="w-7 h-7 rounded-full bg-neutral-200 grid place-items-center flex-shrink-0">
                                        <X size={16} className="text-neutral-400" strokeWidth={2.5} />
                                    </span>
                                    <p className="text-body-2 text-neutral-500 break-keep">{item.bad}</p>
                                </motion.li>
                            ))}
                        </motion.ul>
                    </motion.div>

                    {/* PULSE 카드 — 떠오른 강조 */}
                    <motion.div
                        initial={shouldAnimate ? { opacity: 0, y: 20 } : false}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, margin: '-60px' }}
                        transition={{ duration: 0.5, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
                        className="relative overflow-hidden rounded-[24px] bg-primary shadow-soft p-7 lg:p-8 lg:-translate-y-6"
                    >
                        {/* ambient 장식 — 단 1개 */}
                        <div aria-hidden="true" className="absolute inset-0 pointer-events-none">
                            <div className="absolute -top-1/3 -right-[10%] w-[360px] h-[360px] rounded-full bg-white/[0.06] blur-[90px]" />
                        </div>

                        <div className="relative z-10">
                            <div className="flex items-center gap-2.5 mb-7">
                                <span className="w-7 h-7 rounded-full bg-white border border-neutral-200 grid place-items-center flex-shrink-0 overflow-hidden">
                                    <img
                                        src={`${import.meta.env.BASE_URL}PULSE_LOGO.png`}
                                        alt="PULSE"
                                        className="w-4 h-4 object-contain"
                                    />
                                </span>
                                <p className="text-head-5 text-white">PULSE와 함께</p>
                            </div>

                            <motion.ul {...listProps} className="flex flex-col gap-4">
                                {COMPARISONS.map((item) => (
                                    <motion.li {...rowProps} key={item.good} className="flex items-center gap-3">
                                        <span className="w-7 h-7 rounded-full bg-success grid place-items-center flex-shrink-0">
                                            <Check size={16} className="text-white" strokeWidth={3} />
                                        </span>
                                        <p className="text-body-2 font-medium text-white break-keep">{item.good}</p>
                                    </motion.li>
                                ))}
                            </motion.ul>
                        </div>
                    </motion.div>
                </div>

                {/* payoff */}
                <motion.p
                    initial={shouldAnimate ? { opacity: 0, y: 16 } : false}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: '-40px' }}
                    transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                    className="mt-8 lg:mt-4 text-center text-[22px] md:text-[28px] font-bold text-text-main break-keep"
                >
                    마케팅에 쓰던 <span className="text-neutral-400 line-through">하루 3시간</span>, 이제{' '}
                    <span className="text-point">5분</span>이면 끝.
                </motion.p>
            </div>
        </section>
    );
};

export default ComparisonSection;
