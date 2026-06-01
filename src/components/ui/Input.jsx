import React, { useState } from 'react';

export default function Input({
  label,
  placeholder,
  value,
  onChange,
  error,
  hint,
  type = 'text',
  disabled = false,
  required = false,
  autoComplete,
  className = '',
  inputClassName = '',
  ...props
}) {
  const [focused, setFocused] = useState(false);

  const borderColor = error
    ? 'border-error'
    : focused
      ? 'border-primary'
      : 'border-neutral-200';

  return (
    <div className={`flex flex-col gap-1.5 ${className}`}>
      {label && (
        <label className="text-body-6 text-text-main">
          {label}
          {required && <span className="text-error ml-0.5">*</span>}
        </label>
      )}
      <input
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        disabled={disabled}
        autoComplete={autoComplete}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        className={[
          'w-full bg-transparent border-b-2 py-3 px-0',
          'text-body-4 text-text-main placeholder:text-neutral-400',
          'outline-none transition-colors duration-200',
          'disabled:opacity-40 disabled:cursor-not-allowed',
          borderColor,
          inputClassName,
        ].join(' ')}
        {...props}
      />
      {error && <p className="text-error text-caption">{error}</p>}
      {hint && !error && <p className="text-neutral-400 text-caption">{hint}</p>}
    </div>
  );
}
