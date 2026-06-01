import React from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { DollarSign, Clock, AlertTriangle, ShieldAlert } from 'lucide-react';

const STATS = [
    {
        icon: Clock,
        value: '하루 10시간+',
        label: '평균 근무 시간',
        sub: '장사 끝나면 기진맥진인데, 마케팅은 언제 해요?',
        source: '소상공인시장진흥공단 실태조사 기반',
    },
    {
        icon: DollarSign,
        value: '최대 30%',
        label: '플랫폼 수수료 부담',
        sub: '돈 버는 건지 플랫폼 좋으라고 하는 건지 모르겠어요.',
        source: '배달 플랫폼 수수료 현황 기반',
    },
    {
        icon: AlertTriangle,
        value: '10명 중 8명',
        label: 'SNS 운영 어렵다고 응답',
        sub: '사진·편집·문구까지 저 혼자서는 도저히 못 해요.',
        source: '자영업자 디지털 마케팅 실태조사 기반',
    },
    {
        icon: ShieldAlert,
        value: '매년 증가',
        label: '광고 대행 사기 피해',
        sub: '믿고 맡길 데가 없으니 혼자 다 감당해야 해요.',
        source: '공정거래위원회 소비자 피해 현황 기반',
    },
];

const StatCard = ({ icon: Icon, value, label, sub, source, delay }) => {
    const shouldAnimate = !useReducedMotion();
    return (
        <motion.div
            initial={shouldAnimate ? { opacity: 0, y: 20 } : false}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay, ease: [0.22, 1, 0.36, 1] }}
            className="bg-white rounded-2xl p-7 shadow-soft border border-neutral-200 flex flex-col"
        >
            {/* 아이콘 */}
            <div className="w-9 h-9 rounded-xl bg-primary-tint flex items-center justify-center mb-5">
                <Icon size={18} className="text-primary" />
            </div>

            {/* 공감 멘트 — 카드의 주인공 */}
            <p className="text-body-2 text-text-main leading-relaxed break-keep flex-1 mb-5">
                "{sub}"
            </p>

            {/* 구분선 + 수치 */}
            <div className="border-t border-neutral-100 pt-4">
                <p className="text-[28px] font-bold text-primary leading-none mb-1">{value}</p>
                <p className="text-body-7 text-neutral-600">{label}</p>
            </div>

            {/* 출처 */}
            <p className="text-caption text-neutral-400 mt-3">{source}</p>
        </motion.div>
    );
};

const ProblemSection = () => {
    const shouldAnimate = !useReducedMotion();

    return (
        <section id="problem-section" className="py-24 px-6 bg-neutral-50">
            <div className="max-w-[1200px] mx-auto">
                <motion.div
                    initial={shouldAnimate ? { opacity: 0, y: 24 } : false}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: '-80px' }}
                    transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
                    className="mb-12"
                >
                    <h2 className="text-[36px] md:text-[52px] font-bold text-text-main leading-[1.2] tracking-tight break-keep mb-5">
                        <span className="block text-[24px] md:text-[36px] font-semibold text-neutral-500 mb-2">
                            사장님은 마케팅이 필요한 걸 아십니다.
                        </span>
                        다만 실행할 여력이 없을 뿐입니다.
                    </h2>
                    <p className="text-[18px] text-neutral-600 break-keep">
                        마케팅 지식, 시간, 비용, 신뢰할 전문가. 네 가지가 모두 부족합니다.
                    </p>
                </motion.div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                    {STATS.map((stat, i) => (
                        <StatCard key={stat.label} {...stat} delay={i * 0.08} />
                    ))}
                </div>
            </div>
        </section>
    );
};

export default ProblemSection;
