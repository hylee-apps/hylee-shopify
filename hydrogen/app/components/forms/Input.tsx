import React, {forwardRef, useId} from 'react';
import {Label} from './Label';
import {HelperText} from './HelperText';

export type InputSize = 'default' | 'sm' | 'lg';

export interface InputProps extends Omit<
  React.InputHTMLAttributes<HTMLInputElement>,
  'size'
> {
  /** Input size variant */
  size?: InputSize;
  /** Label text */
  label?: string;
  /** Error message - shows error state and helper text */
  error?: string;
  /** Hint/helper text */
  hint?: string;
  /** Icon to render inside input */
  icon?: React.ReactNode;
  /** Position of the icon */
  iconPosition?: 'left' | 'right';
  /** Additional wrapper CSS classes */
  wrapperClassName?: string;
  /** Additional input CSS classes */
  className?: string;
}

const sizeStyles: Record<InputSize, string> = {
  default: 'h-9 px-3 text-sm',
  sm: 'h-8 px-2.5 text-xs',
  lg: 'h-10 px-4 text-base',
};

/**
 * Input component - migrated from theme/snippets/input.liquid
 *
 * A styled input field with optional label, icon, and helper text.
 *
 * @example
 * <Input
 *   name="email"
 *   label="Email Address"
 *   type="email"
 *   required
 *   placeholder="Enter your email"
 * />
 *
 * @example
 * <Input
 *   name="search"
 *   icon={<SearchIcon />}
 *   placeholder="Search..."
 * />
 */
export const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      size = 'default',
      label,
      error,
      hint,
      icon,
      iconPosition = 'left',
      required,
      disabled,
      readOnly,
      wrapperClassName,
      className,
      id: providedId,
      ...rest
    },
    ref,
  ) => {
    const generatedId = useId();
    const inputId = providedId || generatedId;
    const hintId = `${inputId}-hint`;
    const errorId = `${inputId}-error`;

    const hasIcon = !!icon;
    const hasError = !!error;

    const baseClasses =
      'flex w-full min-w-0 rounded-lg border bg-white text-slate-900 placeholder:text-slate-400 transition-all duration-200 outline-none';
    const focusClasses =
      'focus:border-blue-500 focus:ring-3 focus:ring-blue-500/50';
    const disabledClasses = 'disabled:pointer-events-none disabled:opacity-50';
    const errorClasses = hasError
      ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20'
      : 'border-slate-200';
    const iconPaddingClasses = hasIcon
      ? iconPosition === 'left'
        ? 'pl-10'
        : 'pr-10'
      : '';

    const inputClasses = [
      baseClasses,
      sizeStyles[size],
      focusClasses,
      disabledClasses,
      errorClasses,
      iconPaddingClasses,
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

    const inputElement = (
      <input
        ref={ref}
        id={inputId}
        className={inputClasses}
        required={required}
        disabled={disabled}
        readOnly={readOnly}
        aria-invalid={hasError || undefined}
        aria-describedby={describedBy || undefined}
        {...rest}
      />
    );

    return (
      <div className={wrapperClasses}>
        {label && (
          <Label htmlFor={inputId} required={required} error={hasError}>
            {label}
          </Label>
        )}

        {hint && !hasError && (
          <HelperText id={hintId} type="muted">
            {hint}
          </HelperText>
        )}

        {hasIcon ? (
          <div className="relative flex items-center">
            <span
              className={`absolute ${
                iconPosition === 'left' ? 'left-3' : 'right-3'
              } flex items-center text-slate-400 pointer-events-none`}
            >
              {icon}
            </span>
            {inputElement}
          </div>
        ) : (
          inputElement
        )}

        {hasError && (
          <HelperText id={errorId} type="error">
            {error}
          </HelperText>
        )}
      </div>
    );
  },
);

Input.displayName = 'Input';

export default Input;
