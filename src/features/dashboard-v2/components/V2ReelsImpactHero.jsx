import React, { useEffect } from 'react';
import { ArrowUp, ArrowDown, Minus } from 'lucide-react';
import { motion, useMotionValue, useTransform, animate } from 'framer-motion';

// FE fallback: hero.primaryMetric → reach → saves
const resolvePrimary = (hero) => {
    if (!hero) return null;
    const key = hero.primaryMetric || 'reach';
    return hero[key] || hero.reach || hero.saves || null;
};

const StatusBadge = ({ compareText, compareStatus }) => {
    if (!compareText) return null;
    const colors = {
        up: 'text-[#002B7A] bg-[#002B7A1A]',
        down: 'text-[#002B7A99] bg-[#F5F7FA]',
        neutral: 'text-gray-500 bg-gray-50',
    };
    const Icon =
        compareStatus === 'up' ? ArrowUp : compareStatus === 'down' ? ArrowDown : Minus;
    return (
        <div
            className={`flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[12px] font-bold ${colors[compareStatus] || colors.neutral}`}
        >
            <Icon size={12} strokeWidth={3} />
            <span>{compareText}</span>
        </div>
    );
};

const AnimatedNumber = ({ value = 0 }) => {
    const count = useMotionValue(0);
    const rounded = useTransform(count, (v) => Math.round(v).toLocaleString());
    useEffect(() => {
        const controls = animate(count, value, { duration: 1.5, ease: 'easeOut' });
        return controls.stop;
    }, [value, count]);
    return <motion.span>{rounded}</motion.span>;
};

const V2ReelsImpactHero = ({ data, onCta }) => {
    if (!data) return null;
    const { state = 'default', source, period, hero } = data;

    if (state === 'first_time') {
        return (
            <div className="bg-white rounded-[24px] border border-gray-100 shadow-sm p-6 flex flex-col gap-3 shrink-0">
                <div className="flex items-center gap-2">
                    <div className="w-1 h-4 bg-[#002B7A] rounded-full shrink-0" />
                    <span className="text-[14px] font-bold text-[#191F28]">이번 주 릴스 성과</span>
                </div>
                <p className="text-[17px] font-medium text-[#191F28] leading-[160%] break-keep">
                    릴스를 첫 번째로 올리면 도달 수와 저장 수를<br />
                    실시간으로 여기서 확인할 수 있어요.
                </p>
                <button
                    onClick={onCta}
                    className="self-start mt-1 bg-[#FF5A36] text-white px-5 py-2.5 rounded-xl font-bold text-[15px] flex items-center gap-2 hover:opacity-90 transition-opacity"
                >
                    릴스 올리기 →
                </button>
            </div>
        );
    }

    if (state === 'empty') {
        return (
            <div className="bg-white rounded-[24px] border border-gray-100 shadow-sm p-6 shrink-0">
                <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                        <div className="w-1 h-4 bg-[#002B7A] rounded-full shrink-0" />
                        <span className="text-[14px] font-bold text-[#191F28]">이번 주 릴스 성과</span>
                    </div>
                    {source && <span className="text-[14px] text-gray-500">{source}</span>}
                </div>
                <p className="text-[15px] text-gray-400 font-medium">
                    이번 주 데이터가 아직 집계 중이에요. 내일 다시 확인해 보세요.
                </p>
            </div>
        );
    }

    if (state === 'error') {
        return (
            <div className="bg-white rounded-[24px] border border-red-100 shadow-sm p-6 shrink-0">
                <div className="flex items-center gap-2 mb-2">
                    <div className="w-1 h-4 bg-red-400 rounded-full shrink-0" />
                    <span className="text-[14px] font-bold text-[#191F28]">이번 주 릴스 성과</span>
                </div>
                <p className="text-[15px] text-gray-400 font-medium">
                    데이터를 불러오지 못했어요. 잠시 후 다시 시도해 주세요.
                </p>
            </div>
        );
    }

    // default state
    const primary = resolvePrimary(hero);
    const numericValue =
        typeof primary?.value === 'number' ? primary.value : 0;

    return (
        <div className="bg-white rounded-[24px] border border-gray-100 shadow-sm p-6 flex flex-col gap-3 shrink-0">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <div className="w-1 h-4 bg-[#002B7A] rounded-full shrink-0" />
                    <span className="text-[14px] font-bold text-[#191F28]">이번 주 릴스 성과</span>
                    {period && (
                        <span className="text-[13px] text-gray-400">· {period}</span>
                    )}
                </div>
                {source && (
                    <span className="text-[14px] text-gray-500">{source}</span>
                )}
            </div>

            {/* Primary Metric — 도달 수 고정 (MVP) */}
            <div className="flex flex-col gap-1">
                <span className="text-[13px] text-gray-500 font-medium">도달 수</span>
                <div className="flex items-end gap-2">
                    <div className="flex items-baseline gap-[2px]">
                        <span className="text-[32px] font-bold text-[#191F28] leading-none tracking-tight">
                            <AnimatedNumber value={numericValue} />
                        </span>
                        {primary?.unit && (
                            <span className="text-[18px] font-bold text-[#191F28]">
                                {primary.unit}
                            </span>
                        )}
                    </div>
                    <StatusBadge
                        compareText={primary?.compareText}
                        compareStatus={primary?.compareStatus}
                    />
                </div>
            </div>

            {/* Secondary Metrics */}
            {hero && (
                <div className="flex items-center gap-3 flex-wrap text-[14px] text-gray-500 font-medium">
                    {hero.saves && (
                        <span>
                            저장{' '}
                            <span className="text-[#191F28] font-bold">
                                {typeof hero.saves.value === 'number'
                                    ? hero.saves.value.toLocaleString()
                                    : hero.saves.value}
                                {hero.saves.unit}
                            </span>
                        </span>
                    )}
                    {hero.saves && hero.saveRate && (
                        <span className="text-gray-300">·</span>
                    )}
                    {hero.saveRate && (
                        <span>
                            저장률{' '}
                            <span className="text-[#191F28] font-bold">
                                {hero.saveRate.value}
                                {hero.saveRate.unit}
                            </span>
                        </span>
                    )}
                    {hero.saveRate && hero.comments && (
                        <span className="text-gray-300">·</span>
                    )}
                    {hero.comments && (
                        <span>
                            댓글{' '}
                            <span className="text-[#191F28] font-bold">
                                {typeof hero.comments.value === 'number'
                                    ? hero.comments.value.toLocaleString()
                                    : hero.comments.value}
                                {hero.comments.unit}
                            </span>
                        </span>
                    )}
                </div>
            )}
        </div>
    );
};

export default V2ReelsImpactHero;
