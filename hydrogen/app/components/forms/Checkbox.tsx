import React, {forwardRef, useId} from 'react';
import {HelperText} from './HelperText';

export type CheckboxSize = 'default' | 'sm' | 'lg';

export interface CheckboxProps extends Omit<
  React.InputHTMLAttributes<HTMLInputElement>,
  'size' | 'type'
> {
  /** Checkbox size variant */
  size?: CheckboxSize;
  /** Label text */
  label?: string;
  /** Description text below label */
  description?: string;
  /** Error message - shows error state and helper text */
  error?: string;
  /** Render as card style */
  card?: boolean;
  /** Additional wrapper CSS classes */
  wrapperClassName?: string;
  /** Additional checkbox CSS classes */
  className?: string;
}

const sizeStyles: Record<CheckboxSize, {checkbox: string; label: string}> = {
  default: {
    checkbox: 'h-4 w-4',
    label: 'text-sm',
  },
  sm: {
    checkbox: 'h-3.5 w-3.5',
    label: 'text-xs',
  },
  lg: {
    checkbox: 'h-5 w-5',
    label: 'text-base',
  },
};

/**
 * Checkbox component - migrated from theme/snippets/checkbox.liquid
 *
 * A styled checkbox with optional label and description.
 *
 * @example
 * <Checkbox
 *   name="agree"
 *   label="I agree to the terms and conditions"
 * />
 *
 * @example
 * <Checkbox
 *   name="newsletter"
 *   label="Subscribe to newsletter"
 *   description="Get updates about new products and offers"
 *   card
 * />
 */
export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(
  (
    {
      size = 'default',
      label,
      description,
      error,
      card = false,
      required,
      disabled,
      wrapperClassName,
      className,
      id: providedId,
      ...rest
    },
    ref,
  ) => {
    const generatedId = useId();
    const checkboxId = providedId || generatedId;
    const errorId = `${checkboxId}-error`;

    const hasError = !!error;
    const sizes = sizeStyles[size];

    const baseCheckboxClasses =
      'shrink-0 rounded border border-slate-300 bg-white text-primary transition-all duration-200 cursor-pointer';
    const focusClasses =
      'focus:ring-2 focus:ring-primary/20 focus:ring-offset-2';
    const disabledClasses = 'disabled:opacity-50 disabled:cursor-not-allowed';
    const errorClasses = hasError ? 'border-red-500' : '';
    const checkedClasses =
      'checked:bg-primary checked:border-primary checked:hover:bg-primary/90';

    const checkboxClasses = [
      baseCheckboxClasses,
      sizes.checkbox,
      focusClasses,
      disabledClasses,
      errorClasses,
      checkedClasses,
      className,
    ]
      .filter(Boolean)
      .join(' ');

    const wrapperBaseClasses = card
      ? 'relative flex items-start gap-3 p-4 rounded-lg border border-slate-200 hover:border-slate-300 has-[:checked]:border-primary has-[:checked]:bg-primary/5 transition-all cursor-pointer'
      : 'flex items-start gap-2';

    const wrapperClasses = [wrapperBaseClasses, wrapperClassName]
      .filter(Boolean)
      .join(' ');

    return (
      <div>
        <div className={wrapperClasses}>
          <input
            ref={ref}
            type="checkbox"
            id={checkboxId}
            className={checkboxClasses}
            required={required}
            disabled={disabled}
            aria-invalid={hasError || undefined}
            aria-describedby={hasError ? errorId : undefined}
            {...rest}
          />

          {(label || description) && (
            <div className="flex flex-col gap-0.5">
              {label && (
                <label
                  htmlFor={checkboxId}
                  className={`font-medium text-slate-700 cursor-pointer ${sizes.label} ${
                    disabled ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                >
                  {label}
                  {required && (
                    <span className="text-red-500 ml-0.5" aria-hidden="true">
                      *
                    </span>
                  )}
                </label>
              )}
              {description && (
                <span className="text-xs text-slate-500">{description}</span>
              )}
            </div>
          )}
        </div>

        {hasError && (
          <HelperText id={errorId} type="error" className="mt-1.5">
            {error}
          </HelperText>
        )}
      </div>
    );
  },
);

Checkbox.displayName = 'Checkbox';

export default Checkbox;
