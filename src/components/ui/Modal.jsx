import React, { useEffect } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { useFocusTrap } from '../../hooks/useFocusTrap';

export function Modal({ isOpen, onClose, ariaLabelledBy, children, panelClassName = 'w-[480px]' }) {
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

    const backdropVariants = {
        hidden: { opacity: 0 },
        visible: { opacity: 1 },
        exit: { opacity: 0 },
    };

    const panelVariants = shouldReduceMotion
        ? { hidden: { opacity: 0 }, visible: { opacity: 1 }, exit: { opacity: 0 } }
        : {
            hidden: { opacity: 0, scale: 0.96, y: 8 },
            visible: { opacity: 1, scale: 1, y: 0 },
            exit: { opacity: 0, scale: 0.96, y: 8 },
          };

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    variants={backdropVariants}
                    initial="hidden"
                    animate="visible"
                    exit="exit"
                    transition={{ duration: 0.2 }}
                    className="fixed inset-0 bg-black/40 z-[80] flex items-center justify-center p-4"
                    onClick={onClose}
                >
                    <motion.div
                        ref={containerRef}
                        role="dialog"
                        aria-modal="true"
                        aria-labelledby={ariaLabelledBy}
                        variants={panelVariants}
                        initial="hidden"
                        animate="visible"
                        exit="exit"
                        transition={{ type: 'tween', duration: 0.2 }}
                        onClick={(e) => e.stopPropagation()}
                        className={`${panelClassName} max-w-[90vw] bg-bg-card rounded-[24px] shadow-soft overflow-hidden`}
                    >
                        {children}
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
