import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export function Toast({ message, duration = 4000, onDismiss }) {
    useEffect(() => {
        if (!message) return;
        const timer = setTimeout(onDismiss, duration);
        return () => clearTimeout(timer);
    }, [message, duration, onDismiss]);

    return (
        <AnimatePresence>
            {message && (
                <motion.div
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 16 }}
                    transition={{ type: 'tween', duration: 0.2 }}
                    className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[90]
                               px-4 py-3 bg-text-main text-white rounded-xl
                               text-body-7 shadow-soft whitespace-nowrap pointer-events-none"
                    role="status"
                    aria-live="polite"
                >
                    {message}
                </motion.div>
            )}
        </AnimatePresence>
    );
}
