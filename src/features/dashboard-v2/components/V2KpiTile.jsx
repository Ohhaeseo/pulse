import React, { useEffect } from 'react';
import { ArrowUp, ArrowDown, Minus } from 'lucide-react';
import { motion, useMotionValue, useTransform, animate } from 'framer-motion';

const V2KpiTile = ({
    label,
    currentValue,
    unit = '',
    compareText,
    compareStatus,
    state = 'default', // 'default' | 'loading' | 'empty' | 'error'
    baseTime = '방금 전',
    source,  // e.g. "네이버 검색"
    period,  // e.g. "이번 주"
}) => {
    const count = useMotionValue(0);
    const numericValue = typeof currentValue === 'string' ? parseFloat(currentValue.replace(/,/g, '')) || 0 : Number(currentValue) || 0;
    const rounded = useTransform(count, (latest) => Math.round(latest).toLocaleString());

    useEffect(() => {
        if (state === 'default' && numericValue > 0) {
            const controls = animate(count, numericValue, { duration: 1.5, ease: "easeOut" });
            return controls.stop;
        }

        count.set(numericValue);
    }, [numericValue, state, count]);

    if (state === 'loading') {
        return (
            <div className="flex flex-col gap-1 w-32 animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-16 mb-1"></div>
                <div className="h-8 bg-gray-200 rounded w-24"></div>
            </div>
        );
    }

    if (state === 'error') {
        return (
            <div className="flex flex-col gap-1 w-32">
                <p className="text-[14px] text-gray-500 font-medium">{label}</p>
                <p className="text-[24px] font-bold text-gray-400" title="연동 오류">연동 오류</p>
            </div>
        );
    }

    if (state === 'empty') {
        return (
            <div className="flex flex-col gap-1 w-32">
                <p className="text-[14px] text-gray-500 font-medium">{label}</p>
                <p className="text-[24px] font-bold text-gray-400">-</p>
            </div>
        );
    }

    const renderCompareStatus = () => {
        if (!compareText) return null;

        // Using Primary Main for 'up' instead of Red
        // Using Primary Inactive/Border for 'down' instead of Blue/Green, keeping the professional tone
        const statusColors = {
            up: 'text-[#002B7A] bg-[#002B7A1A]',
            down: 'text-[#002B7A99] bg-[#F5F7FA]',
            neutral: 'text-gray-500 bg-gray-50'
        };

        const Icon = compareStatus === 'up' ? ArrowUp : compareStatus === 'down' ? ArrowDown : Minus;

        return (
            <div className={`flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[12px] font-bold ${statusColors[compareStatus] || statusColors.neutral}`}>
                <Icon size={12} strokeWidth={3} />
                <span>{compareText}</span>
            </div>
        );
    };

    return (
        <div className="flex flex-col items-start gap-1 group relative cursor-default">
            <div className="flex items-center gap-1">
                <p className="text-[14px] text-gray-500 font-medium">{label}</p>
                {period && <span className="text-[13px] text-gray-400">· {period}</span>}
            </div>
            <div className="flex items-end gap-2">
                <div className="flex items-baseline gap-[1px]">
                    <motion.p className="text-[24px] font-bold text-[#191F28] leading-none tracking-tight">
                        {rounded}
                    </motion.p>
                    {unit && (
                        <span className="text-[15px] font-bold text-[#191F28]">{unit}</span>
                    )}
                </div>
                {renderCompareStatus()}
            </div>

            {source && (
                <p className="text-[11px] text-gray-400">{source}</p>
            )}

            {/* Tooltip for Base Time */}
            <div className="absolute top-full left-0 mt-2 whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
                <div className="bg-[#191F28] text-white text-[11px] px-2 py-1 rounded shadow-lg font-medium">
                    수집 시간: {baseTime} 기준
                </div>
            </div>
        </div>
    );
};

export default V2KpiTile;
