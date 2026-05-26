import React from 'react';

const V2PersonaSummary = ({ personas = [] }) => {
    if (!personas || personas.length === 0) return null;

    return (
        <div className="flex flex-col gap-1.5">
            <h3 className="text-[12px] font-bold text-[#002B7A]/70 tracking-wide flex items-center gap-1">
                이런 손님들이 많이 찾았어요
            </h3>

            <div className="flex flex-col gap-1">
                {personas.map((persona, index) => (
                    <div
                        key={index}
                        className="flex items-center gap-2.5 py-2 px-3 bg-blue-50/50 hover:bg-blue-50 border border-blue-100/50 rounded-xl group cursor-pointer transition-colors"
                    >
                        <div className="w-7 h-7 rounded-full bg-white flex items-center justify-center shrink-0 shadow-sm border border-blue-100/30 text-sm group-hover:scale-110 transition-transform">
                            {persona.emoji}
                        </div>
                        <div className="flex flex-col justify-center min-w-0 flex-1">
                            <h4 className="text-[13px] font-bold text-[#002B7A] leading-tight">
                                {persona.label}
                            </h4>
                            <p className="text-[11px] text-[#002B7A]/65 truncate font-medium leading-tight">
                                {persona.detail}
                            </p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default V2PersonaSummary;
