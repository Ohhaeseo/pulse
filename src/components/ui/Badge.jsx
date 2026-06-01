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
