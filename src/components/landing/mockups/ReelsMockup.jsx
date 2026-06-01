import React, { useRef } from 'react';
import { motion, useReducedMotion, useInView } from 'framer-motion';
import { Zap, Crown, Coffee, ImagePlus, CheckCircle, PlayCircle } from 'lucide-react';
import Badge from '../../ui/Badge';

const VIBES = [
    { id: 'energetic', label: '에너지',  Icon: Zap,    selected: true  },
    { id: 'luxury',    label: '프리미엄', Icon: Crown,  selected: false },
    { id: 'mood',      label: '무드',     Icon: Coffee, selected: false },
];

const ReelsMockup = () => {
    const shouldAnimate = !useReducedMotion();
    const ref = useRef(null);
    const isInView = useInView(ref, { once: true });

    return (
        <div
            ref={ref}
            aria-hidden="true"
            className="bg-bg-page rounded-[24px] overflow-hidden border border-neutral-200 p-4 flex flex-col gap-3"
        >
            {/* 바이브 선택 — VideoCreator VIBES 스타일 */}
            <div>
                <p className="text-[10px] font-bold text-neutral-500 uppercase tracking-wide mb-2">바이브 선택</p>
                <div className="flex gap-2">
                    {VIBES.map(({ id, label, Icon, selected }, i) => (
                        <motion.div
                            key={id}
                            initial={shouldAnimate ? { opacity: 0, y: 6 } : false}
                            animate={isInView ? { opacity: 1, y: 0 } : {}}
                            transition={{ duration: 0.35, delay: i * 0.08, ease: [0.22, 1, 0.36, 1] }}
                            className={[
                                'flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-[12px] font-semibold',
                                selected
                                    ? 'bg-primary-tint border-primary-border text-primary'
                                    : 'bg-white border-neutral-200 text-neutral-600',
                            ].join(' ')}
                        >
                            <Icon size={11} />
                            {label}
                        </motion.div>
                    ))}
                </div>
            </div>

            {/* 사진 업로드 슬롯 3개 */}
            <div>
                <p className="text-[10px] font-bold text-neutral-500 uppercase tracking-wide mb-2">사진 업로드</p>
                <div className="grid grid-cols-3 gap-2">
                    {[0, 1, 2].map((i) => (
                        <motion.div
                            key={i}
                            initial={shouldAnimate ? { opacity: 0, scale: 0.95 } : false}
                            animate={isInView ? { opacity: 1, scale: 1 } : {}}
                            transition={{ duration: 0.35, delay: i * 0.08 + 0.2, ease: [0.22, 1, 0.36, 1] }}
                            className="bg-white border-2 border-dashed border-neutral-300 rounded-xl flex flex-col items-center justify-center gap-1 py-3"
                        >
                            <ImagePlus size={16} className="text-neutral-300" />
                            <span className="text-[9px] text-neutral-400 font-medium">사진 추가</span>
                        </motion.div>
                    ))}
                </div>
            </div>

            {/* 타겟 페르소나 */}
            <div className="flex items-center gap-2">
                <span className="text-[11px] text-neutral-500 font-medium">타겟</span>
                <div className="flex items-center gap-1 bg-primary-tint px-2.5 py-1 rounded-full border border-primary-border">
                    <CheckCircle size={10} className="text-primary" />
                    <span className="text-[11px] font-bold text-primary">30대 직장인</span>
                </div>
            </div>

            {/* 생성 진행 상태 */}
            <motion.div
                initial={shouldAnimate ? { opacity: 0 } : false}
                animate={isInView ? { opacity: 1 } : {}}
                transition={{ duration: 0.4, delay: 0.5, ease: [0.22, 1, 0.36, 1] }}
                className="bg-white rounded-xl p-3 border border-neutral-200 flex flex-col gap-2"
            >
                <div className="flex items-center justify-between">
                    <span className="text-[11px] font-semibold text-primary">AI가 영상을 만들고 있어요</span>
                    <Badge variant="point" size="sm">생성 완료</Badge>
                </div>
                {/* scaleX 진행 바 — transform 사용 ✓ */}
                <div className="bg-neutral-100 rounded-full h-2 overflow-hidden">
                    <motion.div
                        className="bg-primary h-full rounded-full origin-left"
                        initial={shouldAnimate ? { scaleX: 0 } : { scaleX: 0.82 }}
                        animate={isInView ? { scaleX: 0.82 } : {}}
                        transition={{ duration: 1.8, delay: 0.7, ease: 'easeOut' }}
                    />
                </div>
                <div className="flex items-center justify-between">
                    <span className="text-[10px] text-neutral-400">예상 완료까지 약 18초</span>
                    <span className="text-[10px] font-bold text-primary">82%</span>
                </div>
            </motion.div>

            {/* 9:16 미리보기 프레임 */}
            <motion.div
                initial={shouldAnimate ? { opacity: 0, y: 8 } : false}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.4, delay: 0.75, ease: [0.22, 1, 0.36, 1] }}
                className="flex items-center gap-3"
            >
                <div
                    className="bg-primary rounded-xl flex-shrink-0 flex items-center justify-center"
                    style={{ width: '36px', aspectRatio: '9/16' }}
                >
                    <PlayCircle size={14} className="text-white" />
                </div>
                <div>
                    <p className="text-[11px] font-bold text-text-main">숏폼 영상 완성</p>
                    <p className="text-[10px] text-neutral-400">9:16 · 30초 · 에너지 바이브</p>
                </div>
            </motion.div>
        </div>
    );
};

export default ReelsMockup;
