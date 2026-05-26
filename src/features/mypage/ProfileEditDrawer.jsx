import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { Drawer } from '../../components/ui/Drawer';

const TONE_OPTIONS = ['친근한', '감성적인', '트렌디한', '고급스러운', '유쾌한', '편안한'];
const STORE_TYPES = ['이자카야', '한식', '카페', '양식', '중식', '기타'];

export function ProfileEditDrawer({ isOpen, onClose, initialData, onSave }) {
    // 초기값을 initialData로 설정 — useState 빈값 vs initialData 비교 타이밍 버그 방지
    const [storeName, setStoreName] = useState(() => initialData?.storeName ?? '');
    const [storeType, setStoreType] = useState(() => initialData?.storeType ?? '');
    const [tones, setTones] = useState(() => [...(initialData?.tones ?? [])]);
    const [keywords, setKeywords] = useState(() => [...(initialData?.keywords ?? [])]);
    const [keywordInput, setKeywordInput] = useState('');
    const [errors, setErrors] = useState({});
    const [toneOverflow, setToneOverflow] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [apiError, setApiError] = useState(false);
    const [showLeaveConfirm, setShowLeaveConfirm] = useState(false);

    useEffect(() => {
        if (isOpen) {
            setStoreName(initialData?.storeName ?? '');
            setStoreType(initialData?.storeType ?? '');
            setTones([...(initialData?.tones ?? [])]);
            setKeywords([...(initialData?.keywords ?? [])]);
            setKeywordInput('');
            setErrors({});
            setToneOverflow(false);
            setIsSaving(false);
            setApiError(false);
            setShowLeaveConfirm(false);
        }
    }, [isOpen]);

    // initialData(props)와 직접 비교 — 저장 후 최신값이 반영됨
    const isDirty = () =>
        storeName !== (initialData?.storeName ?? '') ||
        storeType !== (initialData?.storeType ?? '') ||
        JSON.stringify(tones) !== JSON.stringify(initialData?.tones ?? []) ||
        JSON.stringify(keywords) !== JSON.stringify(initialData?.keywords ?? []);

    const handleClose = () => {
        if (showLeaveConfirm) {
            setShowLeaveConfirm(false);
            return;
        }
        if (isDirty()) {
            setShowLeaveConfirm(true);
        } else {
            onClose();
        }
    };

    const toggleTone = (tone) => {
        if (tones.includes(tone)) {
            setTones((prev) => prev.filter((t) => t !== tone));
            setToneOverflow(false);
        } else {
            if (tones.length >= 3) {
                setToneOverflow(true);
                return;
            }
            setTones((prev) => [...prev, tone]);
            setToneOverflow(false);
        }
    };

    const handleKeywordKeyDown = (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            const val = keywordInput.trim();
            if (!val || keywords.length >= 8) return;
            if (!keywords.includes(val)) setKeywords((prev) => [...prev, val]);
            setKeywordInput('');
        }
    };

    const removeKeyword = (kw) => {
        setKeywords((prev) => prev.filter((k) => k !== kw));
    };

    const validate = () => {
        const errs = {};
        if (!storeName.trim()) errs.name = true;
        if (tones.length === 0) errs.tones = true;
        if (keywords.length === 0) errs.keywords = true;
        setErrors(errs);
        return Object.keys(errs).length === 0;
    };

    const handleSave = async () => {
        if (!validate()) return;
        setIsSaving(true);
        setApiError(false);
        try {
            await onSave?.({ storeName, storeType, tones, keywords });
            onClose();
        } catch {
            setApiError(true);
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <Drawer isOpen={isOpen} onClose={handleClose} ariaLabelledBy="profile-edit-drawer-title">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100 shrink-0">
                <h2 id="profile-edit-drawer-title" className="text-head-5 text-text-main">
                    가게 AI 프로필 수정
                </h2>
                <button
                    onClick={handleClose}
                    aria-label="가게 AI 프로필 수정 닫기"
                    className="w-8 h-8 flex items-center justify-center rounded-lg
                               hover:bg-bg-page transition-colors
                               focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary/20"
                >
                    <X size={18} className="text-text-main/40" />
                </button>
            </div>

            {/* Body */}
            <div className="flex-1 overflow-y-auto px-6 py-5 space-y-6">
                {apiError && (
                    <div className="px-4 py-3 bg-warning/10 rounded-xl text-body-7 text-warning">
                        저장 중 오류가 발생했어요. 잠시 후 다시 시도해 주세요.
                    </div>
                )}

                {/* 가게 이름 */}
                <div className="space-y-1.5">
                    <label className="text-body-6 text-text-main block">가게 이름</label>
                    <input
                        type="text"
                        value={storeName}
                        onChange={(e) => setStoreName(e.target.value)}
                        onBlur={() => {
                            if (!storeName.trim()) setErrors((prev) => ({ ...prev, name: true }));
                            else setErrors((prev) => ({ ...prev, name: false }));
                        }}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200
                                   text-body-7 text-text-main bg-bg-card
                                   focus:outline-none focus:ring-2 focus:ring-primary/20
                                   focus:border-primary/40 transition-colors
                                   placeholder:text-text-main/30"
                        placeholder="예: 범계 로데오점"
                    />
                    {errors.name && (
                        <p className="text-caption text-warning">가게 이름을 입력해 주세요.</p>
                    )}
                </div>

                {/* 가게 유형 */}
                <div className="space-y-1.5">
                    <label className="text-body-6 text-text-main block">가게 유형</label>
                    <select
                        value={storeType}
                        onChange={(e) => setStoreType(e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200
                                   text-body-7 text-text-main bg-bg-card
                                   focus:outline-none focus:ring-2 focus:ring-primary/20
                                   focus:border-primary/40 transition-colors appearance-none"
                    >
                        <option value="">유형을 선택해 주세요</option>
                        {STORE_TYPES.map((t) => (
                            <option key={t}>{t}</option>
                        ))}
                    </select>
                </div>

                {/* 브랜드 분위기 */}
                <div className="space-y-2">
                    <label className="text-body-6 text-text-main block">
                        브랜드 분위기
                        <span className="text-caption text-text-main/40 ml-1.5">최대 3개</span>
                    </label>
                    <div className="flex flex-wrap gap-2">
                        {TONE_OPTIONS.map((tone) => (
                            <button
                                key={tone}
                                type="button"
                                onClick={() => toggleTone(tone)}
                                className={`px-3 py-1.5 rounded-full text-body-7
                                            transition-colors focus-visible:outline-none
                                            focus-visible:ring-1 focus-visible:ring-primary/20
                                            ${tones.includes(tone)
                                                ? 'bg-primary text-white'
                                                : 'bg-bg-page text-text-main/50 hover:bg-primary-tint hover:text-primary'
                                            }`}
                            >
                                {tone}
                            </button>
                        ))}
                    </div>
                    {toneOverflow && (
                        <p className="text-caption text-warning">최대 3개까지 선택할 수 있어요.</p>
                    )}
                    {errors.tones && !toneOverflow && (
                        <p className="text-caption text-warning">분위기를 1개 이상 선택해 주세요.</p>
                    )}
                </div>

                {/* 키워드 태그 입력 */}
                <div className="space-y-2">
                    <label className="text-body-6 text-text-main block">
                        주력 메뉴 키워드
                        <span className="text-caption text-text-main/40 ml-1.5">최대 8개</span>
                    </label>
                    <div
                        className="flex flex-wrap gap-1.5 p-3 rounded-xl border border-gray-200
                                   focus-within:ring-2 focus-within:ring-primary/20
                                   focus-within:border-primary/40 transition-colors min-h-[52px]"
                    >
                        {keywords.map((kw) => (
                            <span
                                key={kw}
                                className="flex items-center gap-1 px-2.5 py-1
                                           bg-bg-page text-body-7 text-text-main/60 rounded-lg"
                            >
                                {kw}
                                <button
                                    type="button"
                                    onClick={() => removeKeyword(kw)}
                                    aria-label={`'${kw}' 키워드 삭제`}
                                    className="text-text-main/30 hover:text-text-main/60 transition-colors"
                                >
                                    <X size={12} />
                                </button>
                            </span>
                        ))}
                        <input
                            value={keywordInput}
                            onChange={(e) => setKeywordInput(e.target.value)}
                            onKeyDown={handleKeywordKeyDown}
                            placeholder={keywords.length === 0 ? '키워드 입력 후 Enter' : ''}
                            className="flex-1 min-w-[120px] text-body-7 text-text-main
                                       bg-transparent outline-none placeholder:text-text-main/30"
                        />
                    </div>
                    {keywords.length >= 8 && (
                        <p className="text-caption text-warning">키워드는 최대 8개까지 입력할 수 있어요.</p>
                    )}
                    {errors.keywords && keywords.length === 0 && (
                        <p className="text-caption text-warning">키워드를 1개 이상 입력해 주세요.</p>
                    )}
                </div>
            </div>

            {/* Footer — normal or leave confirm */}
            <div className="px-6 py-4 border-t border-gray-100 shrink-0">
                {showLeaveConfirm ? (
                    <div className="space-y-3">
                        <div>
                            <p className="text-body-7 text-text-main">저장하지 않은 내용이 있어요.</p>
                            <p className="text-caption text-text-main/50 mt-0.5">
                                지금 나가면 입력한 내용이 사라져요.
                            </p>
                        </div>
                        <div className="flex items-center justify-end gap-3">
                            <button
                                onClick={() => setShowLeaveConfirm(false)}
                                className="px-5 py-2.5 rounded-lg text-btn-main
                                           text-primary-inactive hover:text-primary hover:bg-primary-tint
                                           transition-colors focus-visible:outline-none
                                           focus-visible:ring-1 focus-visible:ring-primary/20"
                            >
                                계속 수정하기
                            </button>
                            <button
                                onClick={() => { setShowLeaveConfirm(false); onClose(); }}
                                className="px-5 py-2.5 rounded-lg text-btn-main
                                           text-text-main/50 hover:text-text-main hover:bg-bg-page
                                           transition-colors focus-visible:outline-none
                                           focus-visible:ring-1 focus-visible:ring-primary/20"
                            >
                                그냥 나가기
                            </button>
                        </div>
                    </div>
                ) : (
                    <div className="flex items-center justify-end gap-3">
                        <button
                            onClick={handleClose}
                            className="px-5 py-2.5 rounded-lg text-btn-main
                                       text-primary-inactive hover:text-primary hover:bg-primary-tint
                                       transition-colors focus-visible:outline-none
                                       focus-visible:ring-1 focus-visible:ring-primary/20"
                        >
                            취소
                        </button>
                        <button
                            onClick={handleSave}
                            disabled={isSaving}
                            className="px-5 py-2.5 rounded-lg text-btn-main
                                       bg-point text-white
                                       transition-opacity hover:opacity-90
                                       focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-point/40
                                       disabled:opacity-40 disabled:cursor-not-allowed"
                        >
                            {isSaving ? '저장 중...' : '저장하기'}
                        </button>
                    </div>
                )}
            </div>
        </Drawer>
    );
}
