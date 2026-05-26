import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { Sparkles, PlayCircle, BarChart2 } from 'lucide-react';

const V2AiSuggestionCard = ({
    id,
    evidence,
    confidence = 'high',
    content,
    ctaText,
    onCta,
    onHide,
    onWhy,
    isNew = false,
}) => {
    const [isVisible, setIsVisible] = useState(true);
    const [isPulsing, setIsPulsing] = useState(false);
    const shouldAnimate = !useReducedMotion();

    // 신규 펄스: isNew===true + sessionStorage에 미기록 시 0.5s × 1회만 실행
    useEffect(() => {
        if (!id || !shouldAnimate || !isNew) return;
        if (sessionStorage.getItem(`seen:${id}`)) return;
        setIsPulsing(true);
        const timer = setTimeout(() => {
            setIsPulsing(false);
            sessionStorage.setItem(`seen:${id}`, '1');
        }, 500);
        return () => clearTimeout(timer);
    }, [id, isNew, shouldAnimate]);

    const handleHide = (e) => {
        e.stopPropagation();
        setIsVisible(false);
        if (onHide) {
            setTimeout(() => onHide(id), 400);
        }
    };

    const confidenceLabel =
        confidence === 'high' ? '높음' : confidence === 'medium' ? '보통' : '낮음';

    return (
        <AnimatePresence>
            {isVisible && (
                <motion.div
                    initial={shouldAnimate ? { opacity: 0, scale: 0.95 } : false}
                    animate={{
                        opacity: 1,
                        scale: isPulsing ? [1, 1.015, 1] : 1,
                    }}
                    exit={{ opacity: 0, x: 100, height: 0, margin: 0, overflow: 'hidden' }}
                    transition={{ duration: 0.3 }}
                    className="bg-[#002B7A] rounded-[24px] p-6 shadow-lg text-white relative overflow-hidden flex flex-col gap-4 shrink-0"
                >
                    {/* Static background glow — no infinite animation */}
                    <div className="absolute top-[-50%] right-[-10%] w-64 h-64 bg-[#8FB6FF] rounded-full blur-[80px] pointer-events-none opacity-20" />

                    {/* Header */}
                    <div className="flex justify-between items-start relative z-10 w-full shrink-0">
                        <div className="flex items-center gap-2 flex-wrap">
                            <div className="flex items-center gap-1 bg-white/10 px-2.5 py-1 rounded-md border border-white/20">
                                <Sparkles size={12} className="text-[#FF5A36]" />
                                <span className="text-[12px] font-bold text-white tracking-wide">
                                    상황 매칭도: {confidenceLabel}
                                </span>
                            </div>
                            <div className="text-[12px] text-blue-100 font-medium flex items-center gap-1">
                                <BarChart2 size={12} />
                                {evidence}
                            </div>
                        </div>

                        <div className="flex items-center gap-3 shrink-0 ml-2">
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    if (onWhy) onWhy();
                                }}
                                className="text-[12px] text-white/60 hover:text-white transition-colors font-medium border-b border-transparent hover:border-white/60"
                            >
                                AI의 추천 이유
                            </button>
                            <button
                                onClick={handleHide}
                                className="text-[12px] text-white/60 hover:text-white transition-colors font-medium border-b border-transparent hover:border-white/60"
                            >
                                오늘은 그만 볼래요
                            </button>
                        </div>
                    </div>

                    {/* Body */}
                    <div className="relative z-10">
                        <p className="text-[17px] font-bold leading-[150%] break-keep">
                            {content}
                        </p>
                    </div>

                    {/* CTA — shimmer·infinite pulse 제거, hover만 유지 */}
                    <div className="mt-2 relative z-10 w-full">
                        <motion.button
                            onClick={(e) => {
                                e.stopPropagation();
                                if (onCta) onCta();
                            }}
                            whileHover={shouldAnimate ? { scale: 1.02 } : {}}
                            whileTap={shouldAnimate ? { scale: 0.98 } : {}}
                            className="bg-[#FF5A36] text-white px-5 py-3 rounded-xl font-bold text-[16px] flex items-center justify-center gap-2 w-full hover:opacity-90 transition-opacity"
                        >
                            <PlayCircle size={20} strokeWidth={2.5} />
                            <span>{ctaText}</span>
                        </motion.button>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default V2AiSuggestionCard;
