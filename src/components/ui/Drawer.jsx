import React, { useEffect } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { useFocusTrap } from '../../hooks/useFocusTrap';

export function Drawer({ isOpen, onClose, ariaLabelledBy, children }) {
    const shouldReduceMotion = useReducedMotion();
    const containerRef = useFocusTrap(isOpen, onClose);

    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
            return () => {
                document.body.style.overflow = '';
            };
        }
    }, [isOpen]);

    const variants = shouldReduceMotion
        ? { hidden: { opacity: 0 }, visible: { opacity: 1 }, exit: { opacity: 0 } }
        : { hidden: { x: '100%' }, visible: { x: 0 }, exit: { x: '100%' } };

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="fixed inset-0 bg-black/40 z-[79]"
                        onClick={onClose}
                        aria-hidden="true"
                    />
                    <motion.div
                        ref={containerRef}
                        role="dialog"
                        aria-modal="true"
                        aria-labelledby={ariaLabelledBy}
                        variants={variants}
                        initial="hidden"
                        animate="visible"
                        exit="exit"
                        transition={{ type: 'tween', duration: 0.25 }}
                        className="fixed right-0 top-0 bottom-0 z-[80]
                                   w-[480px] max-w-[90vw]
                                   bg-bg-card flex flex-col shadow-soft overflow-hidden
                                   rounded-l-[24px]"
                    >
                        {children}
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
