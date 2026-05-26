import React from 'react';

const INTENSITY_CONFIG = {
    high: { icon: '🔥', color: 'text-orange-600', bg: 'bg-orange-50' },
    medium: { icon: '📈', color: 'text-blue-600', bg: 'bg-blue-50' },
    low: { icon: '📊', color: 'text-gray-500', bg: 'bg-gray-50' },
};

const V2TodaySignalCard = ({ data }) => {
    if (!data) return null;
    const { state = 'default', source, period, keyword, signal, intensity = 'medium' } = data;
    const cfg = INTENSITY_CONFIG[intensity] || INTENSITY_CONFIG.medium;

    if (state === 'empty' || state === 'first_time') {
        return (
            <div className="flex flex-col items-start gap-1">
                <p className="text-[14px] text-gray-500 font-medium">오늘의 기회 신호</p>
                {source && <p className="text-[11px] text-gray-400">{source}</p>}
                <p className="text-[22px] font-bold text-gray-300">-</p>
            </div>
        );
    }

    if (state === 'error') {
        return (
            <div className="flex flex-col items-start gap-1">
                <p className="text-[14px] text-gray-500 font-medium">오늘의 기회 신호</p>
                <p className="text-[17px] font-bold text-gray-400">연동 오류</p>
            </div>
        );
    }

    return (
        <div className="flex flex-col items-start gap-1 group relative cursor-default">
            <div className="flex items-center gap-1">
                <p className="text-[14px] text-gray-500 font-medium">오늘의 기회 신호</p>
                {period && <span className="text-[13px] text-gray-400">· {period}</span>}
            </div>

            <div className="flex items-center gap-2">
                <span className="text-[22px] font-bold text-[#191F28] tracking-tight">
                    {keyword}
                </span>
                <span
                    className={`flex items-center gap-1 px-2 py-0.5 rounded-md text-[12px] font-bold ${cfg.color} ${cfg.bg}`}
                >
                    {cfg.icon} {signal}
                </span>
            </div>

            {source && (
                <p className="text-[11px] text-gray-400">{source}</p>
            )}

            {/* Tooltip */}
            <div className="absolute top-full left-0 mt-2 whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
                <div className="bg-[#191F28] text-white text-[11px] px-2 py-1 rounded shadow-lg font-medium">
                    출처: {source}
                </div>
            </div>
        </div>
    );
};

export default V2TodaySignalCard;
