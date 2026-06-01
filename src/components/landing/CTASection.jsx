import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, useReducedMotion } from 'framer-motion';
import { Sparkles, ArrowRight, PlayCircle, CloudRain } from 'lucide-react';
import Button from '../ui/Button';

const listV = {
    hidden: {},
    show: { transition: { staggerChildren: 0.35, delayChildren: 0.1 } },
};
const bubbleV = {
    hidden: { opacity: 0, y: 14 },
    show: { opacity: 1, y: 0, transition: { duration: 0.45, ease: [0.22, 1, 0.36, 1] } },
};

// PULSE AI 아바타 — 흰 배경 원 + PULSE 로고 마크
const AiAvatar = () => (
    <div className="w-7 h-7 rounded-full bg-white border border-neutral-200 grid place-items-center flex-shrink-0 overflow-hidden">
        <img
            src={`${import.meta.env.BASE_URL}PULSE_LOGO.png`}
            alt="PULSE"
            className="w-4 h-4 object-contain"
        />
    </div>
);

const CTASection = () => {
    const navigate = useNavigate();
    const shouldAnimate = !useReducedMotion();

    const listProps = shouldAnimate
        ? { variants: listV, initial: 'hidden', whileInView: 'show', viewport: { once: true, margin: '-80px' } }
        : {};
    const bubbleProps = shouldAnimate ? { variants: bubbleV } : {};

    return (
        <section className="relative overflow-hidden bg-primary py-24 md:py-32 px-6">
            {/* ambient 장식 — 단 1개 */}
            <div aria-hidden="true" className="absolute inset-0 pointer-events-none">
                <div className="absolute -top-1/4 -right-[10%] w-[620px] h-[620px] rounded-full bg-white/[0.05] blur-[120px]" />
            </div>

            <div className="relative z-10 max-w-[1200px] mx-auto grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
                {/* 좌측 — 카피 + CTA */}
                <motion.div
                    initial={shouldAnimate ? { opacity: 0, y: 24 } : false}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: '-80px' }}
                    transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                    className="text-center lg:text-left"
                >
                    <span className="inline-flex items-center gap-1.5 mb-6 px-3 py-1.5 rounded-full bg-white/10 border border-white/15 text-white">
                        <Sparkles size={14} className="text-point" />
                        <span className="text-caption font-bold tracking-wide">AI 추천 미션</span>
                    </span>

                    <h2 className="text-[34px] md:text-[48px] font-bold text-white leading-[1.18] tracking-tight break-keep mb-5">
                        사장님은 <span className="text-point">‘OK’</span>만 하세요.
                        <br />
                        PULSE가 먼저 제안합니다.
                    </h2>

                    <p className="text-[16px] md:text-[19px] text-white/70 leading-relaxed break-keep mb-9 max-w-[460px] mx-auto lg:mx-0">
                        날씨·상권·검색 흐름을 읽고, 지금 해야 할 마케팅을 AI가 먼저 건넵니다.
                    </p>

                    <div className="flex flex-col items-center lg:items-start gap-4">
                        <Button
                            size="lg"
                            variant="point"
                            className="shadow-xl w-full sm:w-auto"
                            onClick={() => navigate('/signup')}
                        >
                            무료로 시작하기
                            <ArrowRight size={18} strokeWidth={2.5} />
                        </Button>
                        <p className="text-[13px] text-white/55">
                            이미 PULSE를 쓰고 계신가요?{' '}
                            <button
                                type="button"
                                onClick={() => navigate('/login')}
                                className="text-white font-semibold underline underline-offset-2 hover:text-point transition-colors duration-200"
                            >
                                로그인
                            </button>
                        </p>
                    </div>
                </motion.div>

                {/* 우측 — AI 채팅 카드 */}
                <div className="w-full max-w-[440px] mx-auto lg:ml-auto lg:mr-0">
                    <div className="bg-white rounded-[24px] shadow-soft p-5">
                        {/* 헤더 */}
                        <div className="flex items-center gap-2.5 pb-3 mb-4 border-b border-neutral-200">
                            <AiAvatar />
                            <div>
                                <p className="text-body-6 text-text-main leading-tight">PULSE AI</p>
                                <p className="text-[11px] text-success font-medium flex items-center gap-1">
                                    <span className="w-1.5 h-1.5 rounded-full bg-success inline-block" />
                                    실시간 제안 중
                                </p>
                            </div>
                        </div>

                        {/* 말풍선 시퀀스 */}
                        <motion.div {...listProps} className="flex flex-col gap-3">
                            {/* 1. AI — 날씨 감지 */}
                            <motion.div {...bubbleProps} className="flex items-start gap-2">
                                <AiAvatar />
                                <div className="bg-neutral-100 text-text-main text-[13px] leading-snug rounded-xl px-3.5 py-2.5 max-w-[82%] break-keep">
                                    <span className="inline-flex items-center gap-1 text-neutral-400 font-semibold mb-1">
                                        <CloudRain size={13} className="text-primary" />
                                        날씨 감지
                                    </span>
                                    <br />
                                    사장님, 오늘 저녁부터 비 소식이 있어요.
                                </div>
                            </motion.div>

                            {/* 2. AI — 미션 카드 */}
                            <motion.div {...bubbleProps} className="flex items-start gap-2">
                                <AiAvatar />
                                <div className="bg-primary rounded-xl p-3.5 max-w-[88%] text-white">
                                    <span className="inline-flex items-center gap-1 bg-white/10 border border-white/20 px-2 py-0.5 rounded-lg mb-2">
                                        <Sparkles size={11} className="text-point" />
                                        <span className="text-[10px] font-bold tracking-wide">상황 매칭도 높음</span>
                                    </span>
                                    <p className="text-[13px] font-semibold leading-snug break-keep mb-3">
                                        비 오는 날엔 따뜻한 메뉴 영상이 잘 나가요. 지금 만들어 둘까요?
                                    </p>
                                    <div className="flex items-center justify-center gap-1.5 bg-point rounded-xl py-2">
                                        <PlayCircle size={14} strokeWidth={2.5} className="text-white" />
                                        <span className="text-[12px] font-bold text-white">지금 영상 만들기</span>
                                    </div>
                                </div>
                            </motion.div>

                            {/* 3. 사장님 — 전송 말풍선 */}
                            <motion.div {...bubbleProps} className="flex justify-end">
                                <div className="bg-primary text-white text-[13px] leading-snug rounded-xl px-3.5 py-2.5 max-w-[78%] break-keep">
                                    좋아요, 만들어 주세요.
                                </div>
                            </motion.div>

                            {/* 4. AI — 마무리 */}
                            <motion.div {...bubbleProps} className="flex items-start gap-2">
                                <AiAvatar />
                                <div className="bg-neutral-100 text-text-main text-[13px] leading-snug rounded-xl px-3.5 py-2.5 max-w-[82%] break-keep">
                                    완성되면 바로 알려드릴게요. 성과도 제가 챙길게요.
                                </div>
                            </motion.div>
                        </motion.div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default CTASection;
