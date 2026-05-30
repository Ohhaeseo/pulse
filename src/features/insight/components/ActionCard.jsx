/**
 * ActionCard Component
 * 실행 액션 카드 - CTA 버튼 포함
 */

import React from 'react';
import { Sparkles, ChevronRight } from 'lucide-react';

export default function ActionCard({ action, index }) {
    const handleCTAClick = () => {
        console.log('CTA 클릭:', action.cta.action, action.cta.payload);
        // TODO: 실제 액션 핸들러 구현
    };

    return (
        <div data-testid="map-insight-action-card" className="bg-gradient-to-br from-blue-50 to-white rounded-xl p-5 border border-blue-100 shadow-sm hover:shadow-md transition-shadow">
            {/* 헤더 */}
            <div className="flex items-start gap-3 mb-3">
                <div className="w-8 h-8 bg-[#002B7A] rounded-lg flex items-center justify-center shrink-0">
                    <span className="text-white font-bold text-[14px]">{index + 1}</span>
                </div>
                <div className="flex-1">
                    <h4 className="text-[16px] font-bold text-[#191F28] mb-1">{action.title}</h4>
                    <p className="text-[14px] text-gray-600 leading-relaxed">{action.why}</p>
                </div>
            </div>

            {/* TODO 리스트 */}
            <div className="mb-4 pl-11">
                <ul className="space-y-1.5">
                    {action.todo.map((item, i) => (
                        <li key={i} className="text-[14px] text-[#191F28] flex items-start gap-2 leading-relaxed">
                            <span className="text-[#002B7A] font-bold shrink-0">•</span>
                            <span>{item}</span>
                        </li>
                    ))}
                </ul>
            </div>

            {/* CTA 버튼 */}
            <button
                onClick={handleCTAClick}
                className="w-full bg-[#FF5A36CC] hover:bg-[#FF5A36] text-white py-3 rounded-lg font-bold text-[15px] transition-all flex items-center justify-center gap-2 group shadow-sm hover:shadow-md"
            >
                <Sparkles size={16} className="group-hover:rotate-12 transition-transform" />
                <span>{action.cta.label}</span>
                <ChevronRight size={16} className="group-hover:translate-x-1 transition-transform" />
            </button>
        </div>
    );
}
