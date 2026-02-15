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
    green: '#a3b87c',
    yellow: '#eab308',
    orange: '#f97316',
    purple: '#a855f7',
    pink: '#f0c4d4',
    gray: '#6b7280',
    grey: '#6b7280',
    brown: '#92400e',
    navy: '#1e3a5a',
    beige: '#c8b8a8',
    cream: '#fffdd0',
    silver: '#c0c0c0',
    gold: '#ffd700',
    lavender: '#b8b8e8',
    peach: '#d4b8a8',
    olive: '#a3b87c',
  };

  const backgroundColor =
    colorMap[value.toLowerCase()] || value.toLowerCase().replace(/\s+/g, '');

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={!isAvailable}
      className={`relative w-11 h-11 rounded-full border-2 transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 ${
        isSelected
          ? 'border-[#3a4980] ring-2 ring-[#3a4980]/20 ring-offset-1'
          : 'border-transparent hover:border-primary/30'
      } ${!isAvailable ? 'opacity-40 cursor-not-allowed' : ''}`}
      style={{backgroundColor}}
      aria-label={`${value}${!isAvailable ? ' (Out of stock)' : ''}`}
      title={value}
    >
      {isSelected && (
        <span className="absolute inset-0 flex items-center justify-center">
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="white"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <polyline points="20 6 9 17 4 12" />
          </svg>
        </span>
      )}
      {!isAvailable && !isSelected && (
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
      className={`inline-flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-full border transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary ${
        isSelected
          ? 'border-[#3a4980] text-[#3a4980]'
          : 'border-border text-text-muted hover:border-primary/50'
      } ${!isAvailable ? 'opacity-40 cursor-not-allowed' : ''}`}
      aria-label={`${value}${!isAvailable ? ' (Out of stock)' : ''}`}
    >
      {/* Radio circle */}
      <span
        className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
          isSelected ? 'border-[#3a4980]' : 'border-border'
        }`}
      >
        {isSelected && (
          <span className="w-2 h-2 rounded-full bg-[#3a4980]" />
        )}
      </span>
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
            <div className="mb-3">
              <span className="text-sm text-text-muted">
                Choose a {option.name}
              </span>
            </div>

            {/* Option Values */}
            <div className={`flex flex-wrap ${isColorOption ? 'gap-3' : 'gap-2'}`}>
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
