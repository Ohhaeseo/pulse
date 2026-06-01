/**
 * PULSE Badge — 표준 배지 컴포넌트
 *
 * 실제 구현 위치: src/components/ui/Badge.jsx
 *
 * 규칙:
 *   - PULSE 토큰만 사용 (bg-blue-50 등 임의 색 금지)
 *   - 아이콘 사용 시 Lucide만 (이모지 금지)
 *   - 라운드: rounded-lg (각형) 또는 rounded-full (pill)
 */
import React from 'react';

const VARIANT = {
  primary: 'bg-primary-tint text-primary',
  point:   'bg-point-bg text-point',
  success: 'bg-success/10 text-success',
  warning: 'bg-warning/10 text-warning',
  neutral: 'bg-neutral-100 text-neutral-600',
  error:   'bg-error/10 text-error',
};

const SIZE = {
  sm: 'px-2 py-0.5 text-caption',
  md: 'px-2.5 py-1 text-body-7',
};

const SHAPE = {
  rounded: 'rounded-lg',
  pill:    'rounded-full',
};

export default function Badge({
  children,
  variant = 'primary',
  size = 'sm',
  shape = 'rounded',
  icon: Icon,
  className = '',
}) {
  return (
    <span
      className={[
        'inline-flex items-center gap-1 font-pretendard font-semibold',
        VARIANT[variant],
        SIZE[size],
        SHAPE[shape],
        className,
      ].join(' ')}
    >
      {Icon && <Icon size={size === 'sm' ? 10 : 12} />}
      {children}
    </span>
  );
}

/**
 * 사용 예시:
 *
 * <Badge variant="primary">손님 마음 읽기</Badge>
 * <Badge variant="point" shape="pill">NEW</Badge>
 * <Badge variant="success" size="md" icon={CheckCircle}>완료</Badge>
 * <Badge variant="neutral">2025.06.01</Badge>
 */
