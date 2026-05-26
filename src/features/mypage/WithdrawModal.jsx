import React, { useState, useEffect } from 'react';
import { AlertTriangle, X as XIcon, ChevronRight } from 'lucide-react';
import { Modal } from '../../components/ui/Modal';

const CONSEQUENCES = [
    '쌓아온 모든 분석 데이터와 AI 프로필이 영구 삭제됩니다',
    '남은 구독 기간은 환불 없이 즉시 종료됩니다',
    'Instagram · Naver Place · 카카오 채널 연동이 모두 해제됩니다',
    '탈퇴 후 30일간 동일 이메일로 재가입이 불가합니다',
];

export function WithdrawModal({ isOpen, onClose, onWithdraw, onManageSubscription }) {
    const [confirmed, setConfirmed] = useState(false);
    const [isWithdrawing, setIsWithdrawing] = useState(false);

    useEffect(() => {
        if (!isOpen) {
            setConfirmed(false);
            setIsWithdrawing(false);
        }
    }, [isOpen]);

    const handleWithdraw = async () => {
        if (!confirmed) return;
        setIsWithdrawing(true);
        try {
            await onWithdraw?.();
        } finally {
            setIsWithdrawing(false);
        }
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            ariaLabelledBy="withdraw-modal-title"
            panelClassName="w-[440px]"
        >
            {/* Header */}
            <div className="px-6 pt-6 pb-4 border-b border-gray-100 flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-warning/10 flex items-center justify-center shrink-0">
                    <AlertTriangle size={18} className="text-warning" />
                </div>
                <div>
                    <h2 id="withdraw-modal-title" className="text-head-5 text-text-main">
                        정말 탈퇴하시겠어요?
                    </h2>
                    <p className="text-caption text-text-main/60 mt-0.5">
                        탈퇴 전 아래 내용을 꼭 확인해 주세요
                    </p>
                </div>
            </div>

            {/* Body */}
            <div className="px-6 py-5 space-y-4">
                {/* 탈퇴 시 잃게 되는 것들 */}
                <ul className="space-y-2.5" aria-label="탈퇴 시 주의사항">
                    {CONSEQUENCES.map((item) => (
                        <li key={item} className="flex items-start gap-2.5">
                            <XIcon
                                size={13}
                                className="text-warning shrink-0 mt-0.5"
                                strokeWidth={2.5}
                                aria-hidden="true"
                            />
                            <span className="text-body-7 text-text-main/70 leading-snug">{item}</span>
                        </li>
                    ))}
                </ul>

                {/* 사용자 잡기 — retention CTA */}
                <div
                    className="p-4 bg-primary-tint rounded-xl space-y-2"
                    role="region"
                    aria-label="탈퇴 전 대안 안내"
                >
                    <p className="text-body-6 text-primary font-semibold leading-snug">
                        잠깐, 사장님! 지금까지 쌓아온 분석이 모두 사라져요
                    </p>
                    <p className="text-caption text-text-main/60 leading-relaxed">
                        탈퇴 대신 구독을 일시 정지하면 분석 데이터와 AI 프로필이
                        안전하게 보존돼요. 언제든 돌아오시면 바로 이어서 사용할 수 있어요.
                    </p>
                    <button
                        onClick={() => onManageSubscription?.()}
                        className="flex items-center gap-1 text-body-7 font-semibold text-primary
                                   hover:opacity-70 transition-opacity mt-1
                                   focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary/20 rounded"
                    >
                        구독 관리하기
                        <ChevronRight size={13} />
                    </button>
                </div>

                {/* 의도 확인 체크박스 */}
                <label className="flex items-start gap-2.5 cursor-pointer group">
                    <input
                        type="checkbox"
                        checked={confirmed}
                        onChange={(e) => setConfirmed(e.target.checked)}
                        className="mt-0.5 w-4 h-4 rounded cursor-pointer shrink-0 accent-warning"
                        aria-label="탈퇴 내용 확인"
                    />
                    <span className="text-caption text-text-main/60 leading-snug group-hover:text-text-main/80 transition-colors">
                        위 내용을 모두 확인했으며, 탈퇴를 진행합니다.
                    </span>
                </label>
            </div>

            {/* Footer */}
            <div className="flex gap-2 px-6 pb-6 pt-4 border-t border-gray-100">
                <button
                    onClick={onClose}
                    className="flex-1 py-2.5 rounded-xl text-btn-main
                               text-text-main/50 bg-bg-page
                               hover:bg-gray-100 transition-colors
                               focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary/20"
                >
                    취소
                </button>
                <button
                    onClick={handleWithdraw}
                    disabled={!confirmed || isWithdrawing}
                    className="flex-1 py-2.5 rounded-xl text-btn-main
                               bg-text-main text-white
                               hover:opacity-80 transition-opacity
                               disabled:opacity-30 disabled:cursor-not-allowed
                               focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-text-main/40"
                >
                    {isWithdrawing ? '처리 중...' : '그래도 탈퇴할게요'}
                </button>
            </div>
        </Modal>
    );
}
