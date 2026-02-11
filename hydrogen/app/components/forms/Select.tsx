import React, {forwardRef, useId} from 'react';
import {Label} from './Label';
import {HelperText} from './HelperText';

export interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

export interface SelectOptionGroup {
  group: string;
  options: SelectOption[];
}

export type SelectSize = 'default' | 'sm';

export interface SelectProps extends Omit<
  React.SelectHTMLAttributes<HTMLSelectElement>,
  'size'
> {
  /** Select size variant */
  size?: SelectSize;
  /** Array of options or option groups */
  options: (SelectOption | SelectOptionGroup)[];
  /** Label text */
  label?: string;
  /** Placeholder text (first disabled option) */
  placeholder?: string;
  /** Error message - shows error state and helper text */
  error?: string;
  /** Hint/helper text */
  hint?: string;
  /** Additional wrapper CSS classes */
  wrapperClassName?: string;
  /** Additional select CSS classes */
  className?: string;
}

const sizeStyles: Record<SelectSize, string> = {
  default: 'h-9 px-3 text-sm',
  sm: 'h-8 px-2.5 text-xs',
};

function isOptionGroup(
  option: SelectOption | SelectOptionGroup,
): option is SelectOptionGroup {
  return 'group' in option;
}

/**
 * Select component - migrated from theme/snippets/select.liquid
 *
 * A styled select dropdown with optional label and helper text.
 *
 * @example
 * <Select
 *   name="country"
 *   label="Country"
 *   placeholder="Select a country"
 *   options={[
 *     { value: 'us', label: 'United States' },
 *     { value: 'ca', label: 'Canada' },
 *   ]}
 *   required
 * />
 *
 * @example
 * // With option groups
 * <Select
 *   name="region"
 *   options={[
 *     { group: 'North America', options: [{ value: 'us', label: 'United States' }] },
 *     { group: 'Europe', options: [{ value: 'uk', label: 'United Kingdom' }] },
 *   ]}
 * />
 */
export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  (
    {
      size = 'default',
      options,
      label,
      placeholder,
      error,
      hint,
      required,
      disabled,
      multiple,
      wrapperClassName,
      className,
      id: providedId,
      ...rest
    },
    ref,
  ) => {
    const generatedId = useId();
    const selectId = providedId || generatedId;
    const hintId = `${selectId}-hint`;
    const errorId = `${selectId}-error`;

    const hasError = !!error;

    const baseClasses =
      'flex w-full min-w-0 rounded-lg border bg-white text-slate-900 transition-all duration-200 outline-none appearance-none cursor-pointer pr-10';
    const focusClasses =
      'focus:border-blue-500 focus:ring-3 focus:ring-blue-500/50';
    const disabledClasses = 'disabled:pointer-events-none disabled:opacity-50';
    const errorClasses = hasError
      ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20'
      : 'border-slate-200';

    const selectClasses = [
      baseClasses,
      sizeStyles[size],
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

    return (
      <div className={wrapperClasses}>
        {label && (
          <Label htmlFor={selectId} required={required} error={hasError}>
            {label}
          </Label>
        )}

        <div className="relative">
          <select
            ref={ref}
            id={selectId}
            className={selectClasses}
            required={required}
            disabled={disabled}
            multiple={multiple}
            aria-invalid={hasError || undefined}
            aria-describedby={describedBy || undefined}
            {...rest}
          >
            {placeholder && !multiple && (
              <option value="" disabled>
                {placeholder}
              </option>
            )}

            {options.map((option, index) => {
              if (isOptionGroup(option)) {
                return (
                  <optgroup key={`group-${index}`} label={option.group}>
                    {option.options.map((groupOption) => (
                      <option
                        key={groupOption.value}
                        value={groupOption.value}
                        disabled={groupOption.disabled}
                      >
                        {groupOption.label}
                      </option>
                    ))}
                  </optgroup>
                );
              }

              return (
                <option
                  key={option.value}
                  value={option.value}
                  disabled={option.disabled}
                >
                  {option.label}
                </option>
              );
            })}
          </select>

          {/* Chevron icon */}
          <span className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
            <svg
              className="h-4 w-4"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill="currentColor"
              aria-hidden="true"
            >
              <path
                fillRule="evenodd"
                d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z"
                clipRule="evenodd"
              />
            </svg>
          </span>
        </div>

        {hint && !hasError && (
          <HelperText id={hintId} type="muted">
            {hint}
          </HelperText>
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

Select.displayName = 'Select';

export default Select;
