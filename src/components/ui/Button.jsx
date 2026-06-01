import React from 'react';
import { motion, useReducedMotion } from 'framer-motion';

const SIZE = {
  lg: 'h-11 px-8 text-btn-main',
  md: 'h-10 px-6 text-btn-sub',
  sm: 'h-8 px-4 text-caption font-semibold',
};

const VARIANT = {
  primary:   'bg-primary text-white hover:bg-primary-hover',
  point:     'bg-point text-white hover:bg-point-hover',
  secondary: 'bg-primary-tint text-primary hover:bg-primary-border',
  ghost:     'border border-primary-border text-primary hover:bg-primary-tint',
  danger:    'bg-error text-white hover:opacity-90',
};

export default function Button({
  children,
  size = 'lg',
  variant = 'primary',
  disabled = false,
  loading = false,
  onClick,
  type = 'button',
  className = '',
  ...props
}) {
  const shouldAnimate = !useReducedMotion();

  return (
    <motion.button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      whileHover={shouldAnimate && !disabled ? { scale: 1.02 } : {}}
      whileTap={shouldAnimate && !disabled ? { scale: 0.98 } : {}}
      transition={{ duration: 0.15 }}
      className={[
        'inline-flex items-center justify-center gap-2 rounded-xl font-pretendard',
        'transition-colors duration-200',
        'disabled:opacity-40 disabled:cursor-not-allowed',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2',
        SIZE[size],
        VARIANT[variant],
        className,
      ].join(' ')}
      {...props}
    >
      {loading ? (
        <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
      ) : children}
    </motion.button>
  );
}
