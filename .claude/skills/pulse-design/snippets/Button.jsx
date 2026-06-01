/**
 * PULSE Button — 표준 버튼 컴포넌트
 *
 * 사용 전 확인:
 *   - tailwind.config.js에 neutral, error 토큰이 있는지 확인
 *   - 실제 구현 위치: src/components/ui/Button.jsx
 *
 * 규칙:
 *   - hover에 transition-all 금지 → transition-colors, transition-transform 각각 명시
 *   - h-11(44px) 이상 유지 (모바일 터치 최소 크기)
 *   - useReducedMotion() 필수
 */
import React from 'react';
import { motion, useReducedMotion } from 'framer-motion';

const SIZE = {
  lg: 'h-11 px-8 text-btn-main',       // 44px — 기본 CTA
  md: 'h-10 px-6 text-btn-sub',        // 40px — 보조 행동
  sm: 'h-8  px-4 text-caption font-semibold', // 32px — compact
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
        'inline-flex items-center justify-center gap-2',
        'rounded-xl font-pretendard',
        'transition-colors transition-transform duration-200',
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

/**
 * 사용 예시:
 *
 * <Button size="lg" variant="primary" onClick={handleSignup}>
 *   무료로 시작하기
 * </Button>
 *
 * <Button size="md" variant="ghost">
 *   더 알아보기
 * </Button>
 *
 * <Button size="lg" variant="point" loading={isLoading}>
 *   릴스 만들기
 * </Button>
 */
