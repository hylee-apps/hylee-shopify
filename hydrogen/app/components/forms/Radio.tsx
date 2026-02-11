import React, {forwardRef, useId, createContext, useContext} from 'react';
import {HelperText} from './HelperText';

export type RadioSize = 'default' | 'sm' | 'lg';
export type RadioLayout = 'vertical' | 'horizontal' | 'cards' | 'buttons';

export interface RadioOption {
  value: string;
  label: string;
  description?: string;
  disabled?: boolean;
}

interface RadioGroupContextValue {
  name: string;
  value?: string;
  size: RadioSize;
  layout: RadioLayout;
  disabled?: boolean;
  required?: boolean;
  hasError: boolean;
  onChange?: (value: string) => void;
}

const RadioGroupContext = createContext<RadioGroupContextValue | null>(null);

function useRadioGroupContext() {
  const context = useContext(RadioGroupContext);
  if (!context) {
    throw new Error('Radio must be used within a RadioGroup');
  }
  return context;
}

export interface RadioGroupProps {
  /** Radio group name */
  name: string;
  /** Currently selected value */
  value?: string;
  /** Default selected value (for uncontrolled) */
  defaultValue?: string;
  /** Radio options */
  options: RadioOption[];
  /** Group label */
  label?: string;
  /** Hint/helper text */
  hint?: string;
  /** Error message */
  error?: string;
  /** Layout direction */
  layout?: RadioLayout;
  /** Size variant */
  size?: RadioSize;
  /** Required field */
  required?: boolean;
  /** Disabled state */
  disabled?: boolean;
  /** Change handler */
  onChange?: (value: string) => void;
  /** Additional CSS classes */
  className?: string;
}

const sizeStyles: Record<RadioSize, {radio: string; label: string}> = {
  default: {
    radio: 'h-4 w-4',
    label: 'text-sm',
  },
  sm: {
    radio: 'h-3.5 w-3.5',
    label: 'text-xs',
  },
  lg: {
    radio: 'h-5 w-5',
    label: 'text-base',
  },
};

const layoutStyles: Record<RadioLayout, string> = {
  vertical: 'flex flex-col gap-2',
  horizontal: 'flex flex-row flex-wrap gap-4',
  cards: 'grid gap-3',
  buttons: 'flex flex-row flex-wrap',
};

/**
 * RadioGroup component - migrated from theme/snippets/radio-group.liquid
 *
 * A group of radio buttons with various layout options.
 *
 * @example
 * <RadioGroup
 *   name="size"
 *   label="Select Size"
 *   options={[
 *     { value: 's', label: 'Small' },
 *     { value: 'm', label: 'Medium' },
 *     { value: 'l', label: 'Large' },
 *   ]}
 *   required
 * />
 *
 * @example
 * // Cards layout
 * <RadioGroup
 *   name="plan"
 *   layout="cards"
 *   options={[
 *     { value: 'basic', label: 'Basic', description: '$9/month' },
 *     { value: 'pro', label: 'Pro', description: '$29/month' },
 *   ]}
 * />
 */
export const RadioGroup = forwardRef<HTMLDivElement, RadioGroupProps>(
  (
    {
      name,
      value,
      defaultValue,
      options,
      label,
      hint,
      error,
      layout = 'vertical',
      size = 'default',
      required = false,
      disabled = false,
      onChange,
      className,
    },
    ref,
  ) => {
    const groupId = useId();
    const hasError = !!error;

    const [internalValue, setInternalValue] = React.useState(defaultValue);
    const currentValue = value ?? internalValue;

    const handleChange = (optionValue: string) => {
      if (value === undefined) {
        setInternalValue(optionValue);
      }
      onChange?.(optionValue);
    };

    const groupClasses = ['space-y-2', className].filter(Boolean).join(' ');

    return (
      <RadioGroupContext.Provider
        value={{
          name,
          value: currentValue,
          size,
          layout,
          disabled,
          required,
          hasError,
          onChange: handleChange,
        }}
      >
        <div
          ref={ref}
          className={groupClasses}
          role="radiogroup"
          aria-invalid={hasError || undefined}
          aria-labelledby={label ? `${groupId}-label` : undefined}
        >
          {label && (
            <div
              id={`${groupId}-label`}
              className={`font-medium text-slate-700 ${sizeStyles[size].label} ${
                required
                  ? "after:content-['*'] after:ml-0.5 after:text-red-500"
                  : ''
              }`}
            >
              {label}
            </div>
          )}

          {hint && <HelperText type="muted">{hint}</HelperText>}

          <div className={layoutStyles[layout]}>
            {options.map((option) => (
              <RadioItem key={option.value} option={option} />
            ))}
          </div>

          {hasError && <HelperText type="error">{error}</HelperText>}
        </div>
      </RadioGroupContext.Provider>
    );
  },
);

RadioGroup.displayName = 'RadioGroup';

interface RadioItemProps {
  option: RadioOption;
}

function RadioItem({option}: RadioItemProps) {
  const {name, value, size, layout, disabled, required, hasError, onChange} =
    useRadioGroupContext();

  const optionId = `${name}-${option.value}`;
  const sizes = sizeStyles[size];
  const isChecked = value === option.value;
  const isDisabled = disabled || option.disabled;

  const baseRadioClasses =
    'shrink-0 rounded-full border border-slate-300 bg-white text-primary transition-all duration-200 cursor-pointer';
  const focusClasses = 'focus:ring-2 focus:ring-primary/20 focus:ring-offset-2';
  const disabledClasses = 'disabled:opacity-50 disabled:cursor-not-allowed';
  const errorClasses = hasError ? 'border-red-500' : '';
  const checkedClasses =
    'checked:border-primary checked:border-[5px] checked:bg-white';

  const radioClasses = [
    baseRadioClasses,
    sizes.radio,
    focusClasses,
    disabledClasses,
    errorClasses,
    checkedClasses,
  ]
    .filter(Boolean)
    .join(' ');

  if (layout === 'cards') {
    return (
      <label
        htmlFor={optionId}
        className={`relative flex items-start gap-3 p-4 rounded-lg border cursor-pointer transition-all ${
          isChecked
            ? 'border-primary bg-primary/5'
            : 'border-slate-200 hover:border-slate-300'
        } ${isDisabled ? 'opacity-50 cursor-not-allowed' : ''}`}
      >
        <input
          type="radio"
          name={name}
          id={optionId}
          value={option.value}
          checked={isChecked}
          disabled={isDisabled}
          required={required}
          onChange={() => onChange?.(option.value)}
          className={radioClasses}
        />
        <div className="flex flex-col gap-0.5">
          <span className={`font-medium text-slate-700 ${sizes.label}`}>
            {option.label}
          </span>
          {option.description && (
            <span className="text-xs text-slate-500">{option.description}</span>
          )}
        </div>
      </label>
    );
  }

  if (layout === 'buttons') {
    return (
      <label
        htmlFor={optionId}
        className={`relative px-4 py-2 border cursor-pointer transition-all first:rounded-l-lg last:rounded-r-lg -ml-px first:ml-0 ${
          isChecked
            ? 'bg-primary text-white border-primary z-10'
            : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
        } ${isDisabled ? 'opacity-50 cursor-not-allowed' : ''}`}
      >
        <input
          type="radio"
          name={name}
          id={optionId}
          value={option.value}
          checked={isChecked}
          disabled={isDisabled}
          required={required}
          onChange={() => onChange?.(option.value)}
          className="sr-only"
        />
        <span className={`font-medium ${sizes.label}`}>{option.label}</span>
      </label>
    );
  }

  // Default vertical/horizontal layout
  return (
    <div className="flex items-start gap-2">
      <input
        type="radio"
        name={name}
        id={optionId}
        value={option.value}
        checked={isChecked}
        disabled={isDisabled}
        required={required}
        onChange={() => onChange?.(option.value)}
        className={radioClasses}
      />
      <div className="flex flex-col gap-0.5">
        <label
          htmlFor={optionId}
          className={`font-medium text-slate-700 cursor-pointer ${sizes.label} ${
            isDisabled ? 'opacity-50 cursor-not-allowed' : ''
          }`}
        >
          {option.label}
        </label>
        {option.description && (
          <span className="text-xs text-slate-500">{option.description}</span>
        )}
      </div>
    </div>
  );
}

export {RadioGroup as Radio};
export default RadioGroup;
