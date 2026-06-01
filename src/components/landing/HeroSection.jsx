import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, useReducedMotion } from 'framer-motion';
import Button from '../ui/Button';
import ThreeBackground from '../../features/auth/ThreeBackground';

const LINE1 = '분석부터 영상제작까지';
const LINE2 = 'PULSE가 해드립니다';

const AnimatedLine = ({ words, baseDelay, shouldAnimate }) => (
    <>
        {words.map((word, i) => (
            <motion.span
                key={`${baseDelay}-${i}`}
                initial={shouldAnimate ? { opacity: 0, y: 28 } : false}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                    duration: 0.55,
                    delay: baseDelay + i * 0.07,
                    ease: [0.22, 1, 0.36, 1],
                }}
                className="inline-block mr-[0.22em]"
            >
                {word === 'PULSE가' ? (
                    <span className="inline-flex items-end gap-0">
                        <img
                            src={`${import.meta.env.BASE_URL}PULSE_Logo_full.png`}
                            alt="PULSE"
                            className="h-[76px] md:h-[116px] w-auto flex-shrink-0"
                        />
                        <span className="text-text-main leading-none translate-y-[-10px] md:translate-y-[-16px]">가</span>
                    </span>
                ) : word}
            </motion.span>
        ))}
    </>
);

const HeroSection = () => {
    const navigate = useNavigate();
    const shouldAnimate = !useReducedMotion();

    const words1 = LINE1.split(' ');
    const words2 = LINE2.split(' ');
    const totalWords = words1.length + words2.length;

    return (
        <section className="relative min-h-dvh flex items-center px-6 overflow-hidden bg-bg-page">
            <div className="absolute inset-0 z-0">
                <ThreeBackground position={[2.5, 0, 0]} scale={1.2} />
            </div>

            <div className="relative z-10 max-w-[1200px] mx-auto w-full grid grid-cols-1 md:grid-cols-2 gap-12 items-center py-10 md:py-16 lg:py-24">
                <div className="text-left">
                    <h1 className="text-[36px] md:text-[64px] font-bold leading-[1.1] tracking-tight text-text-main break-keep mb-6">
                        <span className="block">
                            <AnimatedLine words={words1} baseDelay={0} shouldAnimate={shouldAnimate} />
                        </span>
                        <span className="flex items-end flex-wrap leading-none gap-x-[0.22em]">
                            <AnimatedLine words={words2} baseDelay={words1.length * 0.07 + 0.05} shouldAnimate={shouldAnimate} />
                        </span>
                    </h1>

                    <motion.p
                        initial={shouldAnimate ? { opacity: 0, y: 16 } : false}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: totalWords * 0.07 + 0.1, ease: [0.22, 1, 0.36, 1] }}
                        className="text-[18px] md:text-[20px] mb-10 font-medium text-neutral-600 leading-relaxed break-keep"
                    >
                        외식업 자영업자를 위한 고객 분석 기반 홍보 실행 플랫폼
                    </motion.p>

                    <motion.div
                        initial={shouldAnimate ? { opacity: 0, y: 16 } : false}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: totalWords * 0.07 + 0.2, ease: [0.22, 1, 0.36, 1] }}
                        className="flex flex-wrap gap-4"
                    >
                        <Button size="lg" variant="primary" onClick={() => navigate('/signup')}>
                            무료로 시작하기
                        </Button>
                        <Button
                            size="lg"
                            variant="ghost"
                            onClick={() => document.getElementById('problem-section')?.scrollIntoView({ behavior: 'smooth' })}
                        >
                            더 알아보기
                        </Button>
                    </motion.div>
                </div>

            </div>
        </section>
    );
};

export default HeroSection;
