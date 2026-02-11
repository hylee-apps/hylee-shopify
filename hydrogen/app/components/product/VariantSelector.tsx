'use client';

import {useMemo} from 'react';
import {useNavigate, useSearchParams} from 'react-router';
import type {
  ProductOption,
  ProductVariant,
} from '@shopify/hydrogen/storefront-api-types';

// ============================================================================
// Types
// ============================================================================

export interface VariantOption {
  name: string;
  value: string;
}

export interface VariantSelectorVariant {
  id: string;
  availableForSale: boolean;
  selectedOptions: VariantOption[];
  price: {
    amount: string;
    currencyCode: string;
  };
}

export interface VariantSelectorProps {
  /** Product options (Color, Size, etc.) */
  options: Array<Pick<ProductOption, 'name' | 'values'>>;
  /** All product variants */
  variants: VariantSelectorVariant[];
  /** Currently selected variant */
  selectedVariant?: VariantSelectorVariant;
  /** Product handle for URL updates */
  productHandle: string;
  /** Additional class name */
  className?: string;
}

// ============================================================================
// Helpers
// ============================================================================

/**
 * Get URL search params for a specific variant
 */
function getVariantUrl(
  handle: string,
  selectedOptions: VariantOption[],
  searchParams: URLSearchParams,
): string {
  const params = new URLSearchParams(searchParams);

  selectedOptions.forEach((option) => {
    params.set(option.name.toLowerCase(), option.value);
  });

  return `/products/${handle}?${params.toString()}`;
}

/**
 * Check if a specific option value is available (any variant with that value is in stock)
 */
function isOptionValueAvailable(
  optionName: string,
  optionValue: string,
  variants: VariantSelectorVariant[],
  currentSelections: Record<string, string>,
): boolean {
  return variants.some((variant) => {
    // Check if this variant has the target option value
    const hasTargetValue = variant.selectedOptions.some(
      (opt) =>
        opt.name.toLowerCase() === optionName.toLowerCase() &&
        opt.value === optionValue,
    );

    if (!hasTargetValue) return false;

    // Check if all other current selections match
    const matchesOtherSelections = Object.entries(currentSelections).every(
      ([name, value]) => {
        if (name.toLowerCase() === optionName.toLowerCase()) return true;
        return variant.selectedOptions.some(
          (opt) =>
            opt.name.toLowerCase() === name.toLowerCase() &&
            opt.value === value,
        );
      },
    );

    return matchesOtherSelections && variant.availableForSale;
  });
}

// ============================================================================
// Subcomponents
// ============================================================================

interface ColorSwatchProps {
  value: string;
  isSelected: boolean;
  isAvailable: boolean;
  onClick: () => void;
}

function ColorSwatch({
  value,
  isSelected,
  isAvailable,
  onClick,
}: ColorSwatchProps) {
  // Map common color names to CSS colors
  const colorMap: Record<string, string> = {
    white: '#ffffff',
    black: '#000000',
    red: '#ef4444',
    blue: '#3b82f6',
    green: '#22c55e',
    yellow: '#eab308',
    orange: '#f97316',
    purple: '#a855f7',
    pink: '#ec4899',
    gray: '#6b7280',
    grey: '#6b7280',
    brown: '#92400e',
    navy: '#1e3a5a',
    beige: '#d4b896',
    cream: '#fffdd0',
    silver: '#c0c0c0',
    gold: '#ffd700',
  };

  const backgroundColor =
    colorMap[value.toLowerCase()] || value.toLowerCase().replace(/\s+/g, '');

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={!isAvailable}
      className={`relative w-8 h-8 rounded-full border-2 transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 ${
        isSelected
          ? 'border-primary ring-2 ring-primary ring-offset-2'
          : 'border-border hover:border-primary/50'
      } ${!isAvailable ? 'opacity-40 cursor-not-allowed' : ''}`}
      style={{backgroundColor}}
      aria-label={`${value}${!isAvailable ? ' (Out of stock)' : ''}`}
      title={value}
    >
      {!isAvailable && (
        <span className="absolute inset-0 flex items-center justify-center">
          <span className="block w-full h-0.5 bg-text-muted rotate-45 transform" />
        </span>
      )}
    </button>
  );
}

interface SizeButtonProps {
  value: string;
  isSelected: boolean;
  isAvailable: boolean;
  onClick: () => void;
}

function SizeButton({
  value,
  isSelected,
  isAvailable,
  onClick,
}: SizeButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={!isAvailable}
      className={`px-4 py-2 min-w-12 text-sm font-medium rounded-md border transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary ${
        isSelected
          ? 'bg-primary text-white border-primary'
          : 'bg-white text-text border-border hover:border-primary hover:text-primary'
      } ${!isAvailable ? 'opacity-40 cursor-not-allowed line-through' : ''}`}
      aria-label={`${value}${!isAvailable ? ' (Out of stock)' : ''}`}
    >
      {value}
    </button>
  );
}

// ============================================================================
// Main Component
// ============================================================================

/**
 * VariantSelector - Select product variants (Color, Size, etc.)
 *
 * Features:
 * - Color swatches for color options
 * - Size buttons for size options
 * - Availability indicators
 * - URL-based variant selection
 */
export function VariantSelector({
  options,
  variants,
  selectedVariant,
  productHandle,
  className = '',
}: VariantSelectorProps) {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // Build current selections map
  const currentSelections = useMemo(() => {
    const selections: Record<string, string> = {};
    selectedVariant?.selectedOptions.forEach((opt) => {
      selections[opt.name.toLowerCase()] = opt.value;
    });
    return selections;
  }, [selectedVariant]);

  // Handle option value selection
  const handleOptionChange = (optionName: string, optionValue: string) => {
    // Build new selections
    const newSelections: VariantOption[] = options.map((option) => ({
      name: option.name,
      value:
        option.name.toLowerCase() === optionName.toLowerCase()
          ? optionValue
          : currentSelections[option.name.toLowerCase()] || option.values[0],
    }));

    // Find the variant that matches these selections
    const matchingVariant = variants.find((variant) =>
      newSelections.every((selection) =>
        variant.selectedOptions.some(
          (opt) =>
            opt.name.toLowerCase() === selection.name.toLowerCase() &&
            opt.value === selection.value,
        ),
      ),
    );

    if (matchingVariant) {
      const url = getVariantUrl(productHandle, newSelections, searchParams);
      navigate(url, {preventScrollReset: true, replace: true});
    }
  };

  if (options.length === 0) {
    return null;
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {options.map((option) => {
        const currentValue = currentSelections[option.name.toLowerCase()];
        const isColorOption =
          option.name.toLowerCase() === 'color' ||
          option.name.toLowerCase() === 'colour';

        return (
          <div key={option.name}>
            {/* Option Label */}
            <div className="flex items-center gap-2 mb-3">
              <span className="text-sm font-medium text-text">
                {option.name}:
              </span>
              <span className="text-sm text-text-muted">{currentValue}</span>
            </div>

            {/* Option Values */}
            <div className="flex flex-wrap gap-2">
              {option.values.map((value) => {
                const isSelected = currentValue === value;
                const isAvailable = isOptionValueAvailable(
                  option.name,
                  value,
                  variants,
                  currentSelections,
                );

                if (isColorOption) {
                  return (
                    <ColorSwatch
                      key={value}
                      value={value}
                      isSelected={isSelected}
                      isAvailable={isAvailable}
                      onClick={() => handleOptionChange(option.name, value)}
                    />
                  );
                }

                return (
                  <SizeButton
                    key={value}
                    value={value}
                    isSelected={isSelected}
                    isAvailable={isAvailable}
                    onClick={() => handleOptionChange(option.name, value)}
                  />
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default VariantSelector;
