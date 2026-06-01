/**
 * PULSE Input — 표준 입력창 컴포넌트
 *
 * 실제 구현 위치: src/components/ui/Input.jsx
 *
 * 스타일: 하단 border만 (토스 스타일, 박스형 아님)
 * 규칙:
 *   - placeholder: text-neutral-400
 *   - 포커스: border-primary
 *   - 에러: border-error + 에러 메시지
 *   - transition-all 금지 → transition-colors 명시
 */
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
          'text-body-4 text-text-main',
          'placeholder:text-neutral-400',
          'outline-none transition-colors duration-200',
          'disabled:opacity-40 disabled:cursor-not-allowed',
          borderColor,
          inputClassName,
        ].join(' ')}
        {...props}
      />

      {error && (
        <p className="text-error text-caption">{error}</p>
      )}
      {hint && !error && (
        <p className="text-neutral-400 text-caption">{hint}</p>
      )}
    </div>
  );
}

/**
 * 사용 예시:
 *
 * <Input
 *   label="가게 이름"
 *   placeholder="예: 범계 로데오점"
 *   value={storeName}
 *   onChange={(e) => setStoreName(e.target.value)}
 *   required
 * />
 *
 * <Input
 *   label="이메일"
 *   type="email"
 *   error="올바른 이메일 형식을 입력해주세요."
 * />
 *
 * <Input
 *   label="비밀번호"
 *   type="password"
 *   hint="8자 이상, 영문·숫자 포함"
 * />
 */
