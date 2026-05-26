import React, { useMemo } from 'react';
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip as RechartsTooltip,
    ReferenceArea,
    ResponsiveContainer,
} from 'recharts';
import { Info } from 'lucide-react';

/**
 * 28일 일별 도달수 라인차트.
 * period.endDate 기준 해당 주(월~endDate)를 은은하게 음영 강조.
 */
const V2TrendDetailChart = ({ dailySeries = [], period = {} }) => {
    // endDate가 속한 주의 월요일 계산
    const thisWeekStart = useMemo(() => {
        if (!period.endDate) return null;
        const d = new Date(period.endDate);
        const day = d.getDay(); // 0=Sun, 1=Mon...
        const diff = day === 0 ? -6 : 1 - day;
        const monday = new Date(d);
        monday.setDate(d.getDate() + diff);
        return monday.toISOString().split('T')[0];
    }, [period.endDate]);

    const formatXTick = (dateStr) => {
        const parts = dateStr.split('-');
        return `${parseInt(parts[1])}/${parseInt(parts[2])}`;
    };

    const formatTooltipLabel = (dateStr) => {
        const parts = dateStr.split('-').map(Number);
        return `${parts[1]}월 ${parts[2]}일`;
    };

    if (!dailySeries.length) {
        return (
            <div className="flex flex-col items-center justify-center h-[180px] gap-2">
                <Info size={20} className="text-gray-300" />
                <p className="text-[13px] text-gray-400">
                    데이터가 쌓이고 있어요. 2주 후부터 추이를 볼 수 있어요.
                </p>
            </div>
        );
    }

    return (
        <div className="w-full h-[190px]">
            <ResponsiveContainer width="100%" height="100%">
                <LineChart
                    data={dailySeries}
                    margin={{ top: 5, right: 8, left: -20, bottom: 0 }}
                >
                    {/* 이번 주 구간 음영 */}
                    {thisWeekStart && period.endDate && (
                        <ReferenceArea
                            x1={thisWeekStart}
                            x2={period.endDate}
                            fill="#002B7A"
                            fillOpacity={0.06}
                            ifOverflow="visible"
                        />
                    )}
                    <CartesianGrid
                        strokeDasharray="3 3"
                        vertical={false}
                        stroke="#E5E7EB"
                    />
                    <XAxis
                        dataKey="date"
                        tickFormatter={formatXTick}
                        interval={6}
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: '#9CA3AF', fontSize: 11, fontWeight: 500 }}
                        dy={8}
                    />
                    <YAxis
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: '#9CA3AF', fontSize: 11, fontWeight: 500 }}
                        tickFormatter={(v) => v >= 1000 ? `${(v / 1000).toFixed(1)}k` : v}
                    />
                    <RechartsTooltip
                        contentStyle={{
                            borderRadius: '8px',
                            border: 'none',
                            boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                            fontSize: '12px',
                            fontWeight: 600,
                            color: '#191F28',
                        }}
                        cursor={{ stroke: '#002B7A', strokeWidth: 1, strokeDasharray: '4 4' }}
                        formatter={(value) => [`${value.toLocaleString()}회`, '도달수']}
                        labelFormatter={formatTooltipLabel}
                    />
                    <Line
                        type="monotone"
                        dataKey="reach"
                        stroke="#002B7A"
                        strokeWidth={2}
                        dot={false}
                        activeDot={{
                            r: 5,
                            fill: '#FF5A36',
                            stroke: '#FFFFFF',
                            strokeWidth: 2,
                        }}
                    />
                </LineChart>
            </ResponsiveContainer>
        </div>
    );
};

export default V2TrendDetailChart;
