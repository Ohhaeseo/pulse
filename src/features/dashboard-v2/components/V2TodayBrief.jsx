import React from 'react';

const V2TodayBrief = ({
    highlightedSegments = [],
    state = 'default' // 'default' | 'loading'
}) => {
    if (state === 'loading') {
        return (
            <div className="flex flex-col gap-2 w-full animate-pulse my-2">
                <div className="h-5 bg-gray-200 rounded w-full"></div>
                <div className="h-5 bg-gray-200 rounded w-4/5"></div>
            </div>
        );
    }

    if (!highlightedSegments || highlightedSegments.length === 0) {
        return (
            <div className="py-2">
                <p className="text-[15px] text-gray-400 font-medium">
                    💡 오늘의 가게 요약 정보를 준비 중이에요.
                </p>
            </div>
        );
    }

    return (
        <div className="py-2">
            <p className="text-[17px] font-medium text-[#191F28] leading-[160%] break-keep">
                💡{' '}
                {highlightedSegments.map((segment, index) => (
                    <span
                        key={index}
                        className={segment.isHighlight ? 'font-bold text-[#002B7A]' : ''}
                    >
                        {segment.text}
                    </span>
                ))}
            </p>
        </div>
    );
};

export default V2TodayBrief;
