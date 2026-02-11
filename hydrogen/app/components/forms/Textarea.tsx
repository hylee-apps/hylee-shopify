import React, {forwardRef, useId, useState} from 'react';
import {Label} from './Label';
import {HelperText} from './HelperText';

export type TextareaSize = 'default' | 'sm' | 'lg';
export type TextareaResize = 'vertical' | 'horizontal' | 'none';

export interface TextareaProps extends Omit<
  React.TextareaHTMLAttributes<HTMLTextAreaElement>,
  'size'
> {
  /** Textarea size variant */
  size?: TextareaSize;
  /** Resize behavior */
  resize?: TextareaResize;
  /** Label text */
  label?: string;
  /** Error message - shows error state and helper text */
  error?: string;
  /** Hint/helper text */
  hint?: string;
  /** Show character count (requires maxLength) */
  showCount?: boolean;
  /** Additional wrapper CSS classes */
  wrapperClassName?: string;
  /** Additional textarea CSS classes */
  className?: string;
}

const sizeStyles: Record<TextareaSize, string> = {
  default: 'px-3 py-2 text-sm',
  sm: 'px-2.5 py-1.5 text-xs',
  lg: 'px-4 py-3 text-base',
};

const resizeStyles: Record<TextareaResize, string> = {
  vertical: 'resize-y',
  horizontal: 'resize-x',
  none: 'resize-none',
};

/**
 * Textarea component - migrated from theme/snippets/textarea.liquid
 *
 * A styled textarea with optional label, character counter, and helper text.
 *
 * @example
 * <Textarea
 *   name="message"
 *   label="Message"
 *   placeholder="Enter your message"
 *   rows={4}
 *   required
 * />
 *
 * @example
 * <Textarea
 *   name="bio"
 *   label="Bio"
 *   maxLength={500}
 *   showCount
 * />
 */
export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  (
    {
      size = 'default',
      resize = 'vertical',
      rows = 4,
      label,
      error,
      hint,
      showCount = false,
      maxLength,
      required,
      disabled,
      readOnly,
      wrapperClassName,
      className,
      id: providedId,
      value,
      defaultValue,
      onChange,
      ...rest
    },
    ref,
  ) => {
    const generatedId = useId();
    const textareaId = providedId || generatedId;
    const hintId = `${textareaId}-hint`;
    const errorId = `${textareaId}-error`;

    const [charCount, setCharCount] = useState(
      () => String(value || defaultValue || '').length,
    );

    const hasError = !!error;

    const baseClasses =
      'flex w-full min-w-0 rounded-lg border bg-white text-slate-900 placeholder:text-slate-400 transition-all duration-200 outline-none min-h-[80px]';
    const focusClasses =
      'focus:border-blue-500 focus:ring-3 focus:ring-blue-500/50';
    const disabledClasses = 'disabled:pointer-events-none disabled:opacity-50';
    const errorClasses = hasError
      ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20'
      : 'border-slate-200';

    const textareaClasses = [
      baseClasses,
      sizeStyles[size],
      resizeStyles[resize],
      focusClasses,
      disabledClasses,
      errorClasses,
      className,
    ]
      .filter(Boolean)
      .join(' ');

    const wrapperClasses = ['space-y-1.5', wrapperClassName]
      .filter(Boolean)
      .join(' ');

    const describedBy = [hasError ? errorId : hint ? hintId : null]
      .filter(Boolean)
      .join(' ');

    const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      if (showCount) {
        setCharCount(e.target.value.length);
      }
      onChange?.(e);
    };

    return (
      <div className={wrapperClasses}>
        {label && (
          <Label htmlFor={textareaId} required={required} error={hasError}>
            {label}
          </Label>
        )}

        {hint && !hasError && (
          <HelperText id={hintId} type="muted">
            {hint}
          </HelperText>
        )}

        <textarea
          ref={ref}
          id={textareaId}
          className={textareaClasses}
          rows={rows}
          maxLength={maxLength}
          required={required}
          disabled={disabled}
          readOnly={readOnly}
          value={value}
          defaultValue={defaultValue}
          onChange={handleChange}
          aria-invalid={hasError || undefined}
          aria-describedby={describedBy || undefined}
          {...rest}
        />

        <div className="flex items-center justify-between gap-2">
          {hasError && (
            <HelperText id={errorId} type="error" className="mt-0">
              {error}
            </HelperText>
          )}
          {showCount && maxLength && (
            <span
              className={`ml-auto text-xs ${
                charCount > maxLength * 0.9
                  ? 'text-amber-600'
                  : 'text-slate-400'
              }`}
            >
              {charCount}/{maxLength}
            </span>
          )}
        </div>
      </div>
    );
  },
);

Textarea.displayName = 'Textarea';

export default Textarea;
