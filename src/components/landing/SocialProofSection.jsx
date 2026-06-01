import React from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { BarChart2, Gift, Shield } from 'lucide-react';

const TRUST_CARDS = [
    {
        icon: BarChart2,
        title: '실제 데이터로 분석합니다',
        description: '네이버·카카오 리뷰와 카카오 상권 데이터를 AI가 분석해 손님 인사이트를 만듭니다. 추측이 아닌 데이터 기반입니다.',
        badge: 'BERTopic 분석 · 카카오 로컬 API · LLM 인사이트',
        highlight: null,
    },
    {
        icon: Gift,
        title: '카드 없이 무료로 시작',
        description: '기본 손님 분석과 홍보 영상 제작 기능은 무료로 제공됩니다. 신용카드 정보 없이 지금 바로 시작하세요.',
        badge: null,
        highlight: '기본 플랜 영구 무료',
    },
    {
        icon: Shield,
        title: '사장님 정보는 안전합니다',
        description: '가게 이름과 분석 결과는 외부에 공유되지 않습니다. 개인정보는 서비스 운영 목적으로만 사용되며 제3자에게 제공되지 않습니다.',
        badge: null,
        highlight: null,
    },
];

const SocialProofSection = () => {
    const shouldAnimate = !useReducedMotion();

    return (
        <section className="py-32 px-6 bg-neutral-50">
            <div className="max-w-[1200px] mx-auto">
                {/* 헤드라인 */}
                <motion.div
                    initial={shouldAnimate ? { opacity: 0, y: 24 } : false}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: '-80px' }}
                    transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                    className="text-center mb-16"
                >
                    <h2 className="text-[40px] md:text-[52px] font-bold text-text-main tracking-tight break-keep">
                        믿고 시작하셔도 됩니다.
                    </h2>
                    <p className="text-[18px] text-neutral-400 mt-4 break-keep">
                        PULSE가 어떻게 작동하는지, 무엇이 안전한지 투명하게 알려드립니다.
                    </p>
                </motion.div>

                {/* 신뢰 카드 3개 */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {TRUST_CARDS.map((card, i) => (
                        <motion.div
                            key={card.title}
                            initial={shouldAnimate ? { opacity: 0, y: 20 } : false}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.5, delay: i * 0.1, ease: [0.22, 1, 0.36, 1] }}
                            className="bg-white rounded-[24px] p-8 shadow-soft border border-neutral-200 flex flex-col"
                        >
                            <div className="w-14 h-14 rounded-xl bg-primary-tint flex items-center justify-center mb-6">
                                <card.icon size={32} className="text-primary" />
                            </div>

                            <h3 className="text-[20px] font-bold text-text-main mb-3 break-keep">
                                {card.title}
                            </h3>

                            <p className="text-body-4 text-neutral-600 leading-relaxed break-keep flex-1">
                                {card.description}
                            </p>

                            {card.badge && (
                                <p className="text-caption text-neutral-400 mt-4">{card.badge}</p>
                            )}

                            {card.highlight && (
                                <p className="text-body-6 text-primary font-bold mt-4">{card.highlight}</p>
                            )}
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default SocialProofSection;
