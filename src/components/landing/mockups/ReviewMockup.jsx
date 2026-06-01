import React, { useRef } from 'react';
import { motion, useReducedMotion, useInView } from 'framer-motion';
import { Star, Camera, FileText, Sparkles } from 'lucide-react';
import Badge from '../../ui/Badge';

const REVIEWS = [
    {
        name: '박민수',
        rating: 5,
        hasPhoto: true,
        text: '치킨이 진짜 바삭하고 양도 많아요! 또 올게요.',
        keywords: ['#바삭함', '#양많음', '#재방문'],
        sentiment: 'success',
        sentimentLabel: '긍정',
        reply: '소중한 리뷰 감사합니다! 다음에도 바삭한 치킨으로 모시겠습니다 :)',
    },
    {
        name: '김지영',
        rating: 3,
        hasPhoto: false,
        text: '배달이 좀 늦었어요. 음식은 맛있었는데...',
        keywords: ['#배달지연'],
        sentiment: 'warning',
        sentimentLabel: '개선 필요',
        reply: null,
    },
];

const Stars = ({ count, size = 12 }) => (
    <div className="flex gap-0.5">
        {[...Array(5)].map((_, i) => (
            <Star
                key={i}
                size={size}
                className={i < count ? 'fill-warning text-warning' : 'text-neutral-300'}
            />
        ))}
    </div>
);

const ReviewMockup = () => {
    const shouldAnimate = !useReducedMotion();
    const ref = useRef(null);
    const isInView = useInView(ref, { once: true });

    return (
        <div
            ref={ref}
            aria-hidden="true"
            className="bg-white rounded-[24px] overflow-hidden border border-neutral-200 p-4 flex flex-col gap-3"
        >
            {/* 리뷰 1 — 긍정 */}
            <motion.div
                initial={shouldAnimate ? { opacity: 0, y: 10 } : false}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.4, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
            >
                {/* 헤더 */}
                <div className="flex items-start justify-between mb-2">
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <span className="text-[13px] font-semibold text-text-main">{REVIEWS[0].name}</span>
                            <Stars count={REVIEWS[0].rating} />
                        </div>
                        <p className="text-[10px] text-neutral-400">2024.03.15</p>
                    </div>
                    <span className="inline-flex items-center gap-1 px-2 py-1 bg-primary-tint text-primary rounded-lg text-[10px] font-medium">
                        <Camera size={10} />
                        Photo review
                    </span>
                </div>

                {/* 리뷰 텍스트 */}
                <p className="text-[12px] text-neutral-700 leading-relaxed mb-2 break-keep">
                    &ldquo;{REVIEWS[0].text}&rdquo;
                </p>

                {/* 키워드 */}
                <div className="flex gap-1 mb-2 flex-wrap">
                    {REVIEWS[0].keywords.map((kw) => (
                        <span key={kw} className="px-2 py-0.5 bg-neutral-100 text-neutral-600 rounded-lg text-[10px]">{kw}</span>
                    ))}
                </div>

                {/* AI 답글 초안 — bg-blue-50/50 */}
                <motion.div
                    initial={shouldAnimate ? { opacity: 0 } : false}
                    animate={isInView ? { opacity: 1 } : {}}
                    transition={{ duration: 0.4, delay: 0.4, ease: [0.22, 1, 0.36, 1] }}
                    className="bg-blue-50/60 rounded-xl p-2.5 border border-blue-100/50"
                >
                    <div className="flex items-center gap-1 mb-1">
                        <Sparkles size={9} className="text-primary" />
                        <p className="text-[9px] text-primary font-bold">AI 답글 초안</p>
                    </div>
                    <p className="text-[11px] text-neutral-700 leading-relaxed break-keep mb-2">
                        &ldquo;{REVIEWS[0].reply}&rdquo;
                    </p>
                    <button className="border border-primary-border text-primary text-[10px] px-2.5 py-1 rounded-lg font-medium">
                        답글 등록
                    </button>
                </motion.div>
            </motion.div>

            <div className="border-t border-neutral-100" />

            {/* 리뷰 2 — 개선 필요 */}
            <motion.div
                initial={shouldAnimate ? { opacity: 0, y: 10 } : false}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.4, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
            >
                <div className="flex items-start justify-between mb-2">
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <span className="text-[13px] font-semibold text-text-main">{REVIEWS[1].name}</span>
                            <Stars count={REVIEWS[1].rating} />
                        </div>
                        <p className="text-[10px] text-neutral-400">2024.03.14</p>
                    </div>
                    <span className="inline-flex items-center gap-1 px-2 py-1 bg-neutral-100 text-neutral-600 rounded-lg text-[10px] font-medium">
                        <FileText size={10} />
                        Text review
                    </span>
                </div>
                <p className="text-[12px] text-neutral-700 leading-relaxed mb-2 break-keep">
                    &ldquo;{REVIEWS[1].text}&rdquo;
                </p>
                <div className="flex items-center gap-2">
                    {REVIEWS[1].keywords.map((kw) => (
                        <span key={kw} className="px-2 py-0.5 bg-neutral-100 text-neutral-600 rounded-lg text-[10px]">{kw}</span>
                    ))}
                    <Badge variant="warning" size="sm">{REVIEWS[1].sentimentLabel}</Badge>
                </div>
            </motion.div>
        </div>
    );
};

export default ReviewMockup;
