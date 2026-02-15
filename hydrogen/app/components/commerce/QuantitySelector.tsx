'use client';

import {useCallback} from 'react';
import {Icon} from '../display/Icon';

// ============================================================================
// Types
// ============================================================================

export interface QuantitySelectorProps {
  /** Current quantity value */
  quantity: number;
  /** Callback when quantity changes */
  onChange: (quantity: number) => void;
  /** Minimum quantity allowed */
  min?: number;
  /** Maximum quantity allowed */
  max?: number;
  /** Disable the selector */
  disabled?: boolean;
  /** Size variant */
  size?: 'sm' | 'md' | 'lg';
  /** Additional class name */
  className?: string;
}

// ============================================================================
// Component
// ============================================================================

/**
 * QuantitySelector - Increment/decrement quantity input
 *
 * Provides buttons to increase/decrease quantity with min/max limits.
 */
export function QuantitySelector({
  quantity,
  onChange,
  min = 1,
  max = 99,
  disabled = false,
  size = 'md',
  className = '',
}: QuantitySelectorProps) {
  const handleDecrement = useCallback(() => {
    if (quantity > min) {
      onChange(quantity - 1);
    }
  }, [quantity, min, onChange]);

  const handleIncrement = useCallback(() => {
    if (quantity < max) {
      onChange(quantity + 1);
    }
  }, [quantity, max, onChange]);

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = parseInt(e.target.value, 10);
      if (!isNaN(value)) {
        const clampedValue = Math.max(min, Math.min(max, value));
        onChange(clampedValue);
      }
    },
    [min, max, onChange],
  );

  const sizeClasses = {
    sm: {
      container: 'h-8',
      button: 'w-8 h-8',
      input: 'w-10 text-sm',
      icon: 14,
    },
    md: {
      container: 'h-10',
      button: 'w-10 h-10',
      input: 'w-12 text-base',
      icon: 16,
    },
    lg: {
      container: 'h-12',
      button: 'w-12 h-12',
      input: 'w-14 text-lg',
      icon: 20,
    },
  };

  const sizes = sizeClasses[size];
  const isDecrementDisabled = disabled || quantity <= min;
  const isIncrementDisabled = disabled || quantity >= max;

  return (
    <div
      className={`inline-flex items-center rounded-full border border-border ${sizes.container} ${className}`}
    >
      {/* Decrement button */}
      <button
        type="button"
        onClick={handleDecrement}
        disabled={isDecrementDisabled}
        className={`flex items-center justify-center ${sizes.button} rounded-l-full border-r border-border text-text transition-colors hover:bg-surface focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-inset disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:bg-transparent`}
        aria-label="Decrease quantity"
      >
        <Icon name="minus" size={sizes.icon} />
      </button>

      {/* Quantity input */}
      <input
        type="number"
        value={quantity}
        onChange={handleInputChange}
        disabled={disabled}
        min={min}
        max={max}
        className={`${sizes.input} ${sizes.container} border-0 bg-transparent text-center font-medium text-dark focus:outline-none focus:ring-0 disabled:cursor-not-allowed disabled:opacity-50 [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none`}
        aria-label="Quantity"
      />

      {/* Increment button */}
      <button
        type="button"
        onClick={handleIncrement}
        disabled={isIncrementDisabled}
        className={`flex items-center justify-center ${sizes.button} rounded-r-full border-l border-border text-text transition-colors hover:bg-surface focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-inset disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:bg-transparent`}
        aria-label="Increase quantity"
      >
        <Icon name="plus" size={sizes.icon} />
      </button>
    </div>
  );
}

export default QuantitySelector;
