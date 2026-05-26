import React from 'react';

const V2ReelsContributionList = ({ reels = [] }) => {
    if (!reels.length) {
        return (
            <p className="text-[13px] text-gray-400 text-center py-4">
                이번 기간 업로드된 릴스가 없어요.
            </p>
        );
    }

    return (
        <ol className="flex flex-col gap-4">
            {reels.map((reel, i) => (
                <li key={reel.id} className="flex items-start gap-3">
                    {/* 순위 배지 */}
                    <span
                        className={[
                            'w-6 h-6 flex items-center justify-center text-[11px] font-bold text-white rounded-full shrink-0 mt-0.5',
                            i === 0 ? 'bg-primary' : i === 1 ? 'bg-primary-sub' : 'bg-primary-inactive',
                        ].join(' ')}
                    >
                        {i + 1}
                    </span>

                    {/* 본문 */}
                    <div className="flex-1 min-w-0">
                        <div className="flex items-baseline justify-between gap-2 mb-1.5">
                            <span className="text-[13px] font-semibold text-[#191F28] truncate">
                                {reel.title}
                            </span>
                            <span className="text-[13px] font-bold text-[#002B7A] shrink-0">
                                {reel.reach.toLocaleString()}회
                            </span>
                        </div>
                        {/* 기여율 바 */}
                        <div className="h-1.5 bg-bg-page rounded-full overflow-hidden">
                            <div
                                className={[
                                    'h-full rounded-full',
                                    i === 0 ? 'bg-primary' : i === 1 ? 'bg-primary-sub' : 'bg-primary-inactive',
                                ].join(' ')}
                                style={{ width: `${reel.contributionRate}%` }}
                            />
                        </div>
                        <span className="text-[11px] text-gray-400 mt-1 block">
                            {reel.contributionRate}% 기여
                        </span>
                    </div>
                </li>
            ))}
        </ol>
    );
};

export default V2ReelsContributionList;
