import React, { useEffect, useRef } from 'react';
import { useReducedMotion } from 'framer-motion';

const ScrollProgress = () => {
    const shouldAnimate = !useReducedMotion();
    const barRef = useRef(null);

    useEffect(() => {
        if (!shouldAnimate || !barRef.current) return;

        const handleScroll = () => {
            const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
            const progress = scrollHeight > 0 ? window.scrollY / scrollHeight : 0;
            if (barRef.current) {
                barRef.current.style.transform = `scaleX(${progress})`;
            }
        };

        window.addEventListener('scroll', handleScroll, { passive: true });
        handleScroll();
        return () => window.removeEventListener('scroll', handleScroll);
    }, [shouldAnimate]);

    if (!shouldAnimate) return null;

    return (
        <div
            ref={barRef}
            className="fixed top-0 left-0 right-0 h-[3px] bg-point origin-left z-[60]"
            style={{ transform: 'scaleX(0)' }}
        />
    );
};

export default ScrollProgress;
