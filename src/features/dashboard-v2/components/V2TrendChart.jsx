import React from 'react';
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip as RechartsTooltip,
    ReferenceLine
} from 'recharts';
import { ChevronRight, Info } from 'lucide-react';
import useMeasuredElement from '../../../hooks/useMeasuredElement';

const V2TrendChart = ({
    title = '최근 트렌드',
    seriesData = [],
    xAxisKey = 'name',
    lineDataKey = 'value',
    onDetailClick,
    isDetailOpen = false,
}) => {
    const chartSize = useMeasuredElement();

    if (!seriesData || seriesData.length === 0) {
        return (
            <div className="bg-white border border-gray-200 rounded-[24px] p-5 flex flex-col items-center justify-center h-[200px]">
                <Info className="text-gray-300 mb-2" size={24} />
                <p className="text-gray-500 text-[14px] font-medium">데이터가 충분히 모이지 않았어요.</p>
            </div>
        );
    }

    return (
        <div className="bg-white border border-gray-200 rounded-[24px] p-5 shadow-sm flex flex-col relative w-full h-full min-h-[160px]">
            {/* Header */}
            <div className="flex items-center justify-between mb-4 shrink-0">
                <h3 className="text-[16px] font-bold text-[#191F28] flex items-center gap-2">
                    {title}
                </h3>
                <button
                    onClick={onDetailClick}
                    aria-expanded={isDetailOpen}
                    aria-controls="trend-detail-drawer"
                    className="text-[12px] font-bold text-[#002B7A] hover:text-[#001F5C] flex items-center gap-0.5 rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#002B7A] focus-visible:ring-offset-2"
                >
                    자세히 보기 <ChevronRight size={14} />
                </button>
            </div>

            {/* Chart Area */}
            <div
                ref={chartSize.ref}
                className="flex-1 w-full min-h-0 relative z-0"
            >
                {chartSize.isReady && (
                    <LineChart
                        width={chartSize.width}
                        height={chartSize.height}
                        data={seriesData}
                        margin={{ top: 5, right: 10, left: -25, bottom: 0 }}
                    >
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                        <XAxis
                            dataKey={xAxisKey}
                            axisLine={false}
                            tickLine={false}
                            tick={{ fill: '#9CA3AF', fontSize: 11, fontWeight: 500 }}
                            dy={10}
                        />
                        <YAxis
                            axisLine={false}
                            tickLine={false}
                            tick={{ fill: '#9CA3AF', fontSize: 11, fontWeight: 500 }}
                        />
                        <RechartsTooltip
                            contentStyle={{
                                borderRadius: '8px',
                                border: 'none',
                                boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                                fontSize: '12px',
                                fontWeight: 600,
                                color: '#191F28'
                            }}
                            cursor={{ stroke: '#002B7A', strokeWidth: 1, strokeDasharray: '4 4' }}
                        />
                        <Line
                            type="monotone"
                            dataKey={lineDataKey}
                            stroke="#002B7A"
                            strokeWidth={3}
                            dot={{ r: 4, fill: '#002B7A', strokeWidth: 2, stroke: '#FFFFFF' }}
                            activeDot={{ r: 6, fill: '#FF5A36', stroke: '#FFFFFF', strokeWidth: 2 }}
                        />
                        <ReferenceLine
                            x="업로드"
                            stroke="#FF5A36"
                            strokeDasharray="3 3"
                            label={{ position: 'top', value: '릴스 업로드', fill: '#FF5A36', fontSize: 10, fontWeight: 700 }}
                        />
                    </LineChart>
                )}
            </div>
        </div>
    );
};

export default V2TrendChart;
