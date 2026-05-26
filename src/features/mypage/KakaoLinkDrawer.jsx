import React, { useState, useEffect } from 'react';
import { X, MessageSquare, Check, CheckCircle, Loader2, Info } from 'lucide-react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { Drawer } from '../../components/ui/Drawer';

const BENEFITS = [
    '고객 문의 응답률 자동 집계',
    '채널 팔로워 추이 분석',
    'AI 마케팅 정확도 향상',
];

function KakaoStep1() {
    return (
        <div className="space-y-6">
            <div className="flex justify-center pt-2">
                <div className="w-16 h-16 rounded-full bg-primary-tint flex items-center justify-center">
                    <MessageSquare size={32} className="text-primary" />
                </div>
            </div>
            <p className="text-body-7 text-text-main/70 leading-relaxed text-center">
                카카오 채널을 연동하면 고객 메시지와 방문 현황을 PULSE에서 함께 분석할 수 있어요.
            </p>
            <ul className="space-y-3">
                {BENEFITS.map((b) => (
                    <li key={b} className="flex items-center gap-3">
                        <span className="w-5 h-5 rounded-full bg-primary-tint flex items-center justify-center shrink-0">
                            <Check size={11} className="text-primary" />
                        </span>
                        <span className="text-body-7 text-text-main">{b}</span>
                    </li>
                ))}
            </ul>
        </div>
    );
}

function KakaoStep2({ isAuthenticating, kakaoError, onAuth }) {
    return (
        <div className="space-y-5">
            <p className="text-body-7 text-text-main/70 leading-relaxed">
                카카오 채널 관리자 계정으로 인증이 필요합니다. 아래 버튼을 누르면 카카오 로그인 창이 열립니다.
            </p>

            <div className="flex items-start gap-2.5 p-3.5 bg-bg-page rounded-xl">
                <Info size={14} className="text-primary-inactive mt-0.5 shrink-0" />
                <p className="text-caption text-text-main/60 leading-relaxed">
                    가게의 카카오 채널 관리자 권한이 있는 계정으로 로그인해 주세요.
                </p>
            </div>

            {kakaoError && (
                <div className="px-4 py-3 bg-warning/10 rounded-xl text-body-7 text-warning">
                    {kakaoError}
                </div>
            )}

            {isAuthenticating ? (
                <div className="flex items-center justify-center gap-2 py-4 text-body-7 text-text-main/50">
                    <Loader2 size={16} className="animate-spin" />
                    카카오 인증을 기다리는 중입니다...
                </div>
            ) : (
                <button
                    onClick={onAuth}
                    className="w-full py-3 rounded-xl text-btn-main
                               bg-[#FEE500] text-[#3C1E1E]
                               transition-opacity hover:opacity-90
                               focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FEE500]/40"
                >
                    카카오로 인증하기
                </button>
            )}

            <button className="w-full text-caption text-text-main/30 hover:text-primary-inactive transition-colors text-center">
                인증 창이 열리지 않나요?
            </button>
        </div>
    );
}

function KakaoStep3() {
    return (
        <div className="flex flex-col items-center gap-3 py-6 text-center">
            <CheckCircle size={40} className="text-success" />
            <p className="text-head-5 text-text-main">카카오 채널 연동이 완료되었습니다!</p>
            <p className="text-body-7 text-text-main/50">이제 PULSE에서 카카오 채널 데이터를 분석할 수 있어요.</p>
            <div className="mt-2 px-3 py-1.5 bg-bg-page rounded-lg">
                <p className="text-caption text-text-main/50">@kakaochannel</p>
            </div>
        </div>
    );
}

export function KakaoLinkDrawer({ isOpen, onClose, onSuccess }) {
    const shouldReduceMotion = useReducedMotion();
    const [step, setStep] = useState(1);
    const [isAuthenticating, setIsAuthenticating] = useState(false);
    const [kakaoError, setKakaoError] = useState('');

    useEffect(() => {
        if (isOpen) {
            setStep(1);
            setIsAuthenticating(false);
            setKakaoError('');
        }
    }, [isOpen]);

    const handleKakaoAuth = async () => {
        setIsAuthenticating(true);
        setKakaoError('');
        try {
            // OAuth 카카오 인증 시뮬레이션 (실제 구현 시 OAuth 팝업으로 교체)
            await new Promise((res) => setTimeout(res, 1500));
            setStep(3);
        } catch {
            setKakaoError('연동 처리 중 오류가 발생했어요. 잠시 후 다시 시도해 주세요.');
        } finally {
            setIsAuthenticating(false);
        }
    };

    const handleBack = () => {
        if (step === 2) setStep(1);
        else onClose();
    };

    const handleComplete = () => {
        onSuccess?.();
        onClose();
    };

    const stepVariants = shouldReduceMotion
        ? { hidden: { opacity: 0 }, visible: { opacity: 1 }, exit: { opacity: 0 } }
        : {
            hidden: { opacity: 0, x: 20 },
            visible: { opacity: 1, x: 0 },
            exit: { opacity: 0, x: -20 },
          };

    return (
        <Drawer isOpen={isOpen} onClose={step < 3 ? onClose : handleComplete} ariaLabelledBy="kakao-link-drawer-title">
            {/* Header */}
            <div className="px-6 py-5 border-b border-gray-100 shrink-0">
                <div className="flex items-center justify-between mb-3">
                    <h2 id="kakao-link-drawer-title" className="text-head-5 text-text-main">
                        카카오 채널 연동
                    </h2>
                    <button
                        onClick={step < 3 ? onClose : handleComplete}
                        aria-label="카카오 채널 연동 닫기"
                        className="w-8 h-8 flex items-center justify-center rounded-lg
                                   hover:bg-bg-page transition-colors
                                   focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary/20"
                    >
                        <X size={18} className="text-text-main/40" />
                    </button>
                </div>
                {/* 진행 인디케이터 */}
                <div className="flex items-center gap-2">
                    <p className="text-caption text-text-main/40 shrink-0">{step} / 3단계</p>
                    <div className="flex-1 h-1 bg-bg-page rounded-full overflow-hidden">
                        <div
                            className="h-full bg-primary rounded-full transition-[width] duration-300"
                            style={{ width: `${(step / 3) * 100}%` }}
                        />
                    </div>
                </div>
            </div>

            {/* Body — step 전환 */}
            <div className="flex-1 overflow-y-auto relative">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={step}
                        variants={stepVariants}
                        initial="hidden"
                        animate="visible"
                        exit="exit"
                        transition={{ type: 'tween', duration: 0.2 }}
                        className="px-6 py-5"
                    >
                        {step === 1 && <KakaoStep1 />}
                        {step === 2 && (
                            <KakaoStep2
                                isAuthenticating={isAuthenticating}
                                kakaoError={kakaoError}
                                onAuth={handleKakaoAuth}
                            />
                        )}
                        {step === 3 && <KakaoStep3 />}
                    </motion.div>
                </AnimatePresence>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-100 shrink-0">
                {step < 3 && (
                    <button
                        onClick={handleBack}
                        className="px-5 py-2.5 rounded-lg text-btn-main
                                   text-primary-inactive hover:text-primary hover:bg-primary-tint
                                   transition-colors focus-visible:outline-none
                                   focus-visible:ring-1 focus-visible:ring-primary/20"
                    >
                        {step === 1 ? '취소' : '이전'}
                    </button>
                )}
                {step === 1 && (
                    <button
                        onClick={() => setStep(2)}
                        className="px-5 py-2.5 rounded-lg text-btn-main
                                   bg-primary text-white
                                   transition-opacity hover:opacity-90
                                   focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
                    >
                        계속하기
                    </button>
                )}
                {step === 2 && (
                    <button
                        onClick={handleKakaoAuth}
                        disabled={isAuthenticating}
                        className="px-5 py-2.5 rounded-lg text-btn-main
                                   bg-primary text-white
                                   transition-opacity hover:opacity-90
                                   focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40
                                   disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                        {isAuthenticating ? '인증 중...' : '카카오로 인증하기'}
                    </button>
                )}
                {step === 3 && (
                    <button
                        onClick={handleComplete}
                        className="px-5 py-2.5 rounded-lg text-btn-main
                                   bg-primary text-white
                                   transition-opacity hover:opacity-90
                                   focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
                    >
                        확인
                    </button>
                )}
            </div>
        </Drawer>
    );
}
