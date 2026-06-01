import React, { useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { ChevronDown } from 'lucide-react';

const FAQS = [
    {
        question: '정말 무료로 사용할 수 있나요?',
        answer: '네, 기본적인 손님 분석과 홍보 영상 제작 기능은 무료로 제공됩니다. 더 심층적인 분석이나 전문가 매칭 서비스가 필요하실 때 유료 플랜을 고려해보세요.',
    },
    {
        question: '마케팅을 전혀 몰라도 괜찮나요?',
        answer: '물론입니다! PULSE는 마케팅 지식이 없는 사장님들을 위해 만들어졌습니다. 복잡한 용어 없이 쉬운 말로 설명해드리고, 무엇을 해야 할지 딱 집어 알려드립니다.',
    },
    {
        question: '영상 편집 기술이 없어도 되나요?',
        answer: '네, 사진만 찍어서 올리시면 됩니다. AI가 트렌디한 스타일로 만들어드립니다.',
    },
    {
        question: '어떤 업종에서 사용할 수 있나요?',
        answer: '현재는 외식업(식당, 카페, 주점 등)에 최적화되어 있습니다. 추후 미용, 피트니스 등 다양한 업종으로 확대될 예정입니다.',
    },
];

const FAQItem = ({ question, answer }) => {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <div className="border-b border-neutral-200 last:border-none">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="w-full py-6 flex justify-between items-center text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 rounded-lg"
            >
                <span className="text-[18px] font-bold text-text-main break-keep">{question}</span>
                <ChevronDown
                    size={20}
                    className={`text-neutral-400 flex-shrink-0 ml-4 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}
                />
            </button>

            {/* CSS grid-rows 트릭 — height animate 금지 대체 */}
            <div
                className={[
                    'grid transition-[grid-template-rows] duration-300 ease-out',
                    isOpen ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]',
                ].join(' ')}
            >
                <div className="overflow-hidden">
                    <p className="pb-6 text-body-4 text-neutral-600 leading-relaxed">
                        {answer}
                    </p>
                </div>
            </div>
        </div>
    );
};

const FAQSection = () => {
    const shouldAnimate = !useReducedMotion();

    return (
        <section className="py-32 px-6 bg-neutral-50">
            <div className="max-w-[800px] mx-auto">
                <motion.div
                    initial={shouldAnimate ? { opacity: 0, y: 24 } : false}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: '-80px' }}
                    transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                    className="text-center mb-16"
                >
                    <h2 className="text-[40px] md:text-[52px] font-bold text-text-main tracking-tight mb-4 break-keep">
                        궁금한 점이 있으신가요?
                    </h2>
                    <p className="text-[18px] text-neutral-400 break-keep">
                        사장님들이 자주 묻는 질문들을 모았습니다.
                    </p>
                </motion.div>

                <div className="bg-white rounded-[24px] p-8 md:p-12 shadow-soft border border-neutral-200">
                    {FAQS.map((faq) => (
                        <FAQItem key={faq.question} {...faq} />
                    ))}
                </div>
            </div>
        </section>
    );
};

export default FAQSection;
