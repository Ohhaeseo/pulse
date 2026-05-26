import React from 'react';
import { ArrowRight, AlertCircle, PlayCircle } from 'lucide-react';

const V2ActionCard = ({
    title,
    description,
    ctaText,
    urgency = 'normal',
    onAction
}) => {
    return (
        <div
            className="bg-white border border-transparent hover:border-gray-200 rounded-xl p-5 shadow-sm hover:shadow-md transition-[border-color,box-shadow,transform] duration-300 hover:-translate-y-[2px] cursor-pointer group flex flex-col gap-3"
            onClick={onAction}
        >
            <div className="flex items-start gap-3">
                <div className={`mt-0.5 shrink-0 ${urgency === 'high' ? 'text-red-500' : 'text-[#002B7A]'}`}>
                    <AlertCircle size={20} />
                </div>
                <div className="flex flex-col gap-1">
                    <h3 className="text-[17px] font-bold text-[#191F28] leading-tight break-keep">
                        {title}
                    </h3>
                    {description && (
                        <p className="text-[14px] text-gray-500 leading-relaxed font-medium">
                            {description}
                        </p>
                    )}
                </div>
            </div>

            <div className="flex justify-end mt-1">
                <button
                    className="flex items-center gap-1.5 px-4 py-2 bg-[#F5F7FA] text-[#002B7A] text-[14px] font-bold rounded-lg group-hover:bg-[#002B7A1A] transition-colors"
                    onClick={(e) => {
                        e.stopPropagation();
                        if (onAction) onAction();
                    }}
                >
                    {ctaText}
                    <ArrowRight size={16} strokeWidth={2.5} className="group-hover:translate-x-1 transition-transform" />
                </button>
            </div>
        </div>
    );
};

export default V2ActionCard;
