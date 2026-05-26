import React from 'react';
import WeatherAnimation from '../../dashboard/components/WeatherAnimation';
import { WEATHER_TYPES } from '../../dashboard/weatherData';

const V2WeatherWidget = ({ weatherType = 'clear_day' }) => {
    // Graceful fallback if weatherType is invalid
    const currentWeather = WEATHER_TYPES[weatherType] || WEATHER_TYPES['clear_day'];
    const WeatherIcon = currentWeather.icon;

    return (
        <div
            className={`relative overflow-hidden rounded-[14px] bg-gradient-to-br ${currentWeather.gradient} px-4 py-3 text-white shadow-[0_4px_12px_rgba(0,0,0,0.08)] border border-white/20 backdrop-blur-md flex flex-col justify-between h-full`}
        >
            {/* Background Animation Layer */}
            <div className="absolute inset-0 z-0 opacity-70 mix-blend-overlay">
                <WeatherAnimation animation={currentWeather.animation} />
            </div>

            {/* Label */}
            <h3 className="relative z-10 text-[11px] font-bold opacity-80 tracking-wide drop-shadow-sm flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-white/80 animate-pulse" />
                오늘 상권 날씨
            </h3>

            {/* Icon + 날씨명 */}
            <div className="relative z-10 flex items-end justify-between mt-1">
                <div className="flex flex-col gap-1">
                    <p className="text-[16px] font-bold leading-none drop-shadow-md">{currentWeather.label}</p>
                    <span className="text-[10px] font-medium px-2 py-0.5 bg-white/20 border border-white/30 backdrop-blur-sm rounded-full self-start">
                        {currentWeather.detail || "유동인구 보통"}
                    </span>
                </div>
                <WeatherIcon size={28} className="text-white drop-shadow-md opacity-90" strokeWidth={1.5} />
            </div>
        </div>
    );
};

export default V2WeatherWidget;
