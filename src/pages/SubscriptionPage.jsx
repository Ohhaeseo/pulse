import React, { useState } from 'react';
import { ChevronLeft } from 'lucide-react';
import Header from '../components/layout/Header';
import PricingCard from '../components/subscription/PricingCard';
import FaqSection from '../components/subscription/FaqSection';

const SubscriptionPage = ({ onNavigate }) => {
    const [isYearly, setIsYearly] = useState(false);

    // Plan Data (Content SSOT: subscription_model.md)
    const plans = [
        {
            id: 'basic',
            title: 'Basic',
            price: '0',
            priceYearly: '0',
            description: '부담 없이 시작하는 우리 가게 마케팅의 첫걸음',
            features: [
                '매장 현황 대시보드',
                '우리 동네 상권 요약',
                '월 1회 홍보 영상 무료 제작 (Watermark)',
                '사장님 커뮤니티 "장사 노하우" 열람'
            ],
            isPopular: false
        },
        {
            id: 'growth',
            title: 'Growth',
            price: '29,000',
            priceYearly: '23,200', // 20% Off
            description: '단골 손님을 만들고 관리하는 실속형 플랜',
            features: [
                '모든 Basic 기능 포함',
                '무제한 손님 마음 읽기 (페르소나)',
                'AI 마케팅 코치 무제한 질문',
                'AI 리뷰 답글 자동 생성',
                '월 5회 고화질 영상 제작 (FHD)',
                '단골 쿠폰 발송 기능 (알림톡)'
            ],
            isPopular: true // Highlights this card
        },
        {
            id: 'pro',
            title: 'Pro',
            price: '59,000',
            priceYearly: '47,200',
            description: '공격적인 확장을 위한 전문가 매칭 및 통합 관리',
            features: [
                '모든 Growth 기능 포함',
                '지역 푸드 인플루언서 매칭 지원 (수수료 0%)',
                '무제한 4K 초고화질 영상 제작',
                '경쟁 업체 상세 분석 리포트',
                '다점포(2개 이상) 통합 관리 대시보드'
            ],
            isPopular: false
        }
    ];

    const handleSelectPlan = (planId) => {
        if (planId === 'expert') {
            // Pro Plan logic
            alert("Pro 플랜 가입 페이지로 이동합니다. (준비 중)");
        } else {
            alert(`${planId.toUpperCase()} 플랜이 선택되었습니다.`);
        }
    };

    return (
        <div className="flex flex-col h-full bg-[#F5F7FA] overflow-y-auto">
            {/* Header */}
            <div className="p-6 pb-0">
                {onNavigate && (
                    <button
                        onClick={() => onNavigate('mypage')}
                        className="flex items-center gap-1.5 text-body-7 text-primary-inactive
                                   hover:text-primary transition-colors mb-4
                                   focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary/20 rounded"
                    >
                        <ChevronLeft size={14} />
                        마이페이지로 돌아가기
                    </button>
                )}
                <Header title="구독 요금제 관리" />
            </div>

            <div className="flex flex-col items-center justify-center py-12 px-4">
                {/* Title Section */}
                <div className="text-center mb-12">
                    <h2 className="text-[32px] font-bold text-[#191F28] mb-4">
                        사장님에게 딱 맞는 요금제를 선택하세요
                    </h2>
                    <p className="text-[16px] text-gray-500">
                        숨겨진 비용 없이, 성장에 필요한 기능만 담았습니다.
                    </p>

                    {/* Billing Toggle (Monthly / Yearly) */}
                    <div className="mt-8 flex items-center justify-center gap-3">
                        <span className={`text-[15px] font-medium transition-colors ${!isYearly ? 'text-[#191F28]' : 'text-gray-400'}`}>
                            월간 결제
                        </span>

                        <button
                            onClick={() => setIsYearly(!isYearly)}
                            className={`relative w-14 h-8 rounded-full transition-colors duration-300 ${isYearly ? 'bg-[#FF5A36]' : 'bg-gray-300'}`}
                        >
                            <div className={`absolute top-1 left-1 bg-white w-6 h-6 rounded-full shadow-sm transition-transform duration-300 ${isYearly ? 'translate-x-6' : 'translate-x-0'}`} />
                        </button>

                        <span className={`text-[15px] font-medium transition-colors flex items-center gap-1.5 ${isYearly ? 'text-[#191F28]' : 'text-gray-400'}`}>
                            연간 결제
                            {/* Bouncing Discount Badge */}
                            <span className="text-[12px] font-bold text-[#FF5A36] bg-[#FF5A361A] px-2 py-0.5 rounded-full animate-bounce">
                                20% OFF
                            </span>
                        </span>
                    </div>
                </div>

                {/* Pricing Cards Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl w-full items-start">
                    {plans.map((plan) => (
                        <PricingCard
                            key={plan.id}
                            {...plan}
                            isYearly={isYearly}
                            onSelect={() => handleSelectPlan(plan.id)}
                        />
                    ))}
                </div>

                {/* Social Proof (Trust Text) */}
                <div className="mt-12 text-center">
                    <p className="text-[14px] text-gray-400">
                        이미 <span className="text-[#002B7A] font-bold">5,120명의 사장님</span>이 Growth 플랜으로 매출 성장을 경험하고 있습니다.
                    </p>
                </div>

                {/* FAQ Section */}
                <FaqSection />

            </div>
        </div>
    );
};

export default SubscriptionPage;
