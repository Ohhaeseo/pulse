import React from 'react';
import { motion } from 'framer-motion';

const Pulse = ({ className }) => (
    <div className={`bg-gray-200 animate-pulse rounded-md ${className}`} />
);

const V2Skeleton = () => (
    <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.3 }}
        className="flex-1 flex flex-col md:flex-row gap-6 min-h-0 mt-2"
    >
        {/* Left Pane */}
        <div className="flex-[1.4] flex flex-col gap-4 overflow-hidden">
            {/* Hero */}
            <Pulse className="w-full h-[120px] rounded-[24px]" />

            {/* KPI strip */}
            <div className="flex items-start gap-6 xl:gap-10">
                <div className="flex flex-col gap-2">
                    <Pulse className="w-20 h-4 rounded" />
                    <Pulse className="w-28 h-8 rounded" />
                    <Pulse className="w-16 h-3 rounded" />
                </div>
                <div className="w-px h-12 bg-gray-200 mt-1" />
                <div className="flex flex-col gap-2">
                    <Pulse className="w-24 h-4 rounded" />
                    <Pulse className="w-20 h-7 rounded" />
                    <Pulse className="w-16 h-3 rounded" />
                </div>
            </div>

            {/* Personas */}
            <div className="flex flex-col gap-2">
                <Pulse className="w-24 h-4 rounded" />
                <Pulse className="w-full h-10 rounded-lg" />
                <Pulse className="w-full h-10 rounded-lg" />
            </div>

            {/* Weather */}
            <Pulse className="w-full h-[80px] rounded-[16px]" />

            {/* Trend chart */}
            <div className="flex-1 min-h-0 flex flex-col gap-2">
                <Pulse className="w-40 h-5 rounded" />
                <Pulse className="flex-1 rounded-[16px]" style={{ minHeight: '120px' }} />
            </div>
        </div>

        {/* Right Pane */}
        <div className="flex-1 md:flex-none md:w-[480px] bg-white rounded-t-[24px] rounded-bl-[24px] border border-gray-100 shadow-sm flex flex-col gap-4 p-6 shrink-0 overflow-hidden">
            <div className="flex flex-col gap-2 py-1">
                <Pulse className="w-1/3 h-4 rounded" />
                <Pulse className="w-full h-5 rounded" />
                <Pulse className="w-4/5 h-5 rounded" />
            </div>
            <div className="w-full h-px bg-gray-100" />
            <Pulse className="w-full h-[180px] rounded-[24px]" />
            <Pulse className="w-full h-[80px] rounded-xl" />
        </div>
    </motion.div>
);

export default V2Skeleton;
