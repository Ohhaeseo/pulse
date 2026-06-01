import React, { useRef } from 'react';
import { motion, useReducedMotion, useInView } from 'framer-motion';
import { Zap, MapPin, ChevronDown, Users, Play } from 'lucide-react';

const INFLUENCERS = [
    {
        initials: 'JH',
        name: '맛집탐험가',
        matchScore: 87,
        platform: '인스타그램',
        followers: '12.4만',
        area: '강남',
        keywords: ['#맛집', '#카페', '#서울'],
    },
    {
        initials: 'YJ',
        name: '일상vlog',
        matchScore: 72,
        platform: '유튜브',
        followers: '8.2만',
        area: '홍대',
        keywords: ['#일상', '#음식', '#리뷰'],
    },
];

const InfluencerCard = ({ inf, delay, shouldAnimate, isInView }) => (
    <motion.div
        initial={shouldAnimate ? { opacity: 0, y: 12 } : false}
        animate={isInView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.4, delay, ease: [0.22, 1, 0.36, 1] }}
        className="bg-white rounded-xl border border-neutral-200 shadow-sm p-3 flex flex-col gap-2"
    >
        {/* 아바타 + 이름 — InfluencerCard 그라디언트 테두리 스타일 */}
        <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-full p-[1.5px] flex-shrink-0"
                style={{ background: 'linear-gradient(135deg, #002B7A, #4070F4)' }}>
                <div className="w-full h-full rounded-full bg-primary-tint flex items-center justify-center">
                    <span className="text-[10px] font-bold text-primary">{inf.initials}</span>
                </div>
            </div>
            <div className="min-w-0 flex-1">
                <p className="text-[13px] font-bold text-text-main leading-tight truncate">{inf.name}</p>
                <div className="flex items-center gap-1 mt-0.5">
                    {/* 매칭도 뱃지 — InfluencerCard 오렌지 뱃지 스타일 */}
                    <div className="flex items-center gap-0.5 bg-point-bg text-point px-1.5 py-0.5 rounded-md text-[10px] font-bold border border-point-hover">
                        <Zap size={9} fill="currentColor" />
                        {inf.matchScore}%
                    </div>
                </div>
            </div>
        </div>

        {/* 팔로워 + 지역 */}
        <div className="flex items-center gap-2 text-[10px] text-neutral-500">
            <div className="flex items-center gap-0.5">
                <Users size={9} />
                <span>{inf.followers}</span>
            </div>
            <span className="text-neutral-200">|</span>
            <div className="flex items-center gap-0.5">
                <MapPin size={9} />
                <span>{inf.area}</span>
            </div>
        </div>

        {/* 키워드 */}
        <div className="flex gap-1 flex-wrap">
            {inf.keywords.map((kw) => (
                <span key={kw} className="px-1.5 py-0.5 bg-neutral-100 text-neutral-600 rounded-lg text-[9px]">{kw}</span>
            ))}
        </div>

        {/* CTA 버튼 */}
        <button className="w-full bg-point text-white text-[10px] font-bold px-2 py-1.5 rounded-lg flex items-center justify-center gap-1">
            <Play size={9} fill="currentColor" />
            협찬 제안하기
        </button>
    </motion.div>
);

const InfluencerMockup = () => {
    const shouldAnimate = !useReducedMotion();
    const ref = useRef(null);
    const isInView = useInView(ref, { once: true });

    const FILTERS = ['지역', '업종', '팔로워'];

    return (
        <div
            ref={ref}
            aria-hidden="true"
            className="bg-bg-page rounded-[24px] overflow-hidden border border-neutral-200 p-4 flex flex-col gap-3"
        >
            {/* 필터 칩 */}
            <div className="flex gap-2 flex-wrap">
                {FILTERS.map((f, i) => (
                    <motion.div
                        key={f}
                        initial={shouldAnimate ? { opacity: 0, y: 6 } : false}
                        animate={isInView ? { opacity: 1, y: 0 } : {}}
                        transition={{ duration: 0.3, delay: i * 0.07, ease: [0.22, 1, 0.36, 1] }}
                        className="flex items-center gap-1 px-2.5 py-1 bg-white border border-neutral-200 rounded-lg text-[11px] font-medium text-neutral-600"
                    >
                        {f}
                        <ChevronDown size={10} />
                    </motion.div>
                ))}
            </div>

            {/* 인플루언서 카드 2개 */}
            <div className="grid grid-cols-2 gap-2">
                {INFLUENCERS.map((inf, i) => (
                    <InfluencerCard
                        key={inf.name}
                        inf={inf}
                        delay={i * 0.12 + 0.15}
                        shouldAnimate={shouldAnimate}
                        isInView={isInView}
                    />
                ))}
            </div>
        </div>
    );
};

export default InfluencerMockup;
