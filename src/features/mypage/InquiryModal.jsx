import React, { useState, useEffect } from 'react';
import { X, CheckCircle } from 'lucide-react';
import { Modal } from '../../components/ui/Modal';

const INQUIRY_TYPES = ['이용 문의', '결제 및 플랜', '기능 오류', '연동 문제', '기타'];

export function InquiryModal({ isOpen, onClose, userEmail }) {
    const [inquiryType, setInquiryType] = useState('');
    const [content, setContent] = useState('');
    const [errors, setErrors] = useState({});
    const [isSending, setIsSending] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);
    const [apiError, setApiError] = useState(false);

    useEffect(() => {
        if (isOpen) {
            setInquiryType('');
            setContent('');
            setErrors({});
            setIsSending(false);
            setIsSuccess(false);
            setApiError(false);
        }
    }, [isOpen]);

    const validate = () => {
        const errs = {};
        if (!inquiryType) errs.type = true;
        if (content.trim().length < 10) errs.content = true;
        setErrors(errs);
        return Object.keys(errs).length === 0;
    };

    const handleSubmit = async () => {
        if (!validate()) return;
        setIsSending(true);
        setApiError(false);
        try {
            // API 미확정 — 시뮬레이션
            await new Promise((res) => setTimeout(res, 800));
            setIsSuccess(true);
        } catch {
            setApiError(true);
        } finally {
            setIsSending(false);
        }
    };

    const handleClose = () => {
        onClose();
    };

    return (
        <Modal isOpen={isOpen} onClose={handleClose} ariaLabelledBy="inquiry-modal-title">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
                <div>
                    <h2 id="inquiry-modal-title" className="text-head-5 text-text-main">
                        1:1 문의
                    </h2>
                    <p className="text-caption text-text-main/40 mt-0.5">
                        확인 후 1~2 영업일 내 이메일로 답변 드립니다.
                    </p>
                </div>
                <button
                    onClick={handleClose}
                    aria-label="1:1 문의 닫기"
                    className="w-8 h-8 flex items-center justify-center rounded-lg
                               hover:bg-bg-page transition-colors
                               focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary/20"
                >
                    <X size={18} className="text-text-main/40" />
                </button>
            </div>

            {/* Body */}
            {!isSuccess ? (
                <div className="px-6 py-5 space-y-4">
                    {apiError && (
                        <div className="px-4 py-3 bg-warning/10 rounded-xl text-body-7 text-warning">
                            문의 전송에 실패했어요. 잠시 후 다시 시도해 주세요.
                        </div>
                    )}

                    {/* 이메일 표시 (읽기 전용) */}
                    <div className="px-3.5 py-2.5 bg-bg-page rounded-xl">
                        <p className="text-caption text-text-main/40">
                            {userEmail || '이메일 정보 없음'}으로 답변 드립니다.
                        </p>
                    </div>

                    {/* 문의 유형 */}
                    <div className="space-y-1.5">
                        <label className="text-body-6 text-text-main block">문의 유형</label>
                        <select
                            value={inquiryType}
                            onChange={(e) => setInquiryType(e.target.value)}
                            className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200
                                       text-body-7 text-text-main bg-bg-card
                                       focus:outline-none focus:ring-2 focus:ring-primary/20
                                       focus:border-primary/40 transition-colors appearance-none"
                        >
                            <option value="">문의 유형을 선택해 주세요</option>
                            {INQUIRY_TYPES.map((t) => (
                                <option key={t}>{t}</option>
                            ))}
                        </select>
                        {errors.type && (
                            <p className="text-caption text-warning">문의 유형을 선택해 주세요.</p>
                        )}
                    </div>

                    {/* 문의 내용 */}
                    <div className="space-y-1.5">
                        <label className="text-body-6 text-text-main block">문의 내용</label>
                        <textarea
                            rows={5}
                            value={content}
                            onChange={(e) => setContent(e.target.value)}
                            className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200
                                       text-body-7 text-text-main bg-bg-card resize-none
                                       focus:outline-none focus:ring-2 focus:ring-primary/20
                                       focus:border-primary/40 transition-colors
                                       placeholder:text-text-main/30"
                            placeholder="불편하셨던 점을 자세히 적어주시면 더 정확하게 도와드릴 수 있어요."
                        />
                        {errors.content && (
                            <p className="text-caption text-warning">내용을 10자 이상 입력해 주세요.</p>
                        )}
                    </div>
                </div>
            ) : (
                <div
                    className="px-6 py-10 flex flex-col items-center gap-3"
                    role="status"
                    aria-live="polite"
                >
                    <CheckCircle size={40} className="text-success" />
                    <p className="text-head-5 text-text-main">문의가 접수되었습니다.</p>
                    <p className="text-body-7 text-text-main/50">1~2 영업일 이내에 답변 드릴게요.</p>
                </div>
            )}

            {/* Footer */}
            <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-100">
                {!isSuccess ? (
                    <>
                        <button
                            onClick={handleClose}
                            className="px-5 py-2.5 rounded-lg text-btn-main
                                       text-primary-inactive hover:text-primary hover:bg-primary-tint
                                       transition-colors focus-visible:outline-none
                                       focus-visible:ring-1 focus-visible:ring-primary/20"
                        >
                            닫기
                        </button>
                        <button
                            onClick={handleSubmit}
                            disabled={isSending}
                            className="px-5 py-2.5 rounded-lg text-btn-main
                                       bg-point text-white
                                       transition-opacity hover:opacity-90
                                       focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-point/40
                                       disabled:opacity-40 disabled:cursor-not-allowed"
                        >
                            {isSending ? '전송 중...' : '문의 보내기'}
                        </button>
                    </>
                ) : (
                    <button
                        onClick={handleClose}
                        className="px-5 py-2.5 rounded-lg text-btn-main
                                   bg-primary text-white
                                   transition-opacity hover:opacity-90
                                   focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
                    >
                        확인
                    </button>
                )}
            </div>
        </Modal>
    );
}
