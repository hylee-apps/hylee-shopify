import type {CurrencyCode} from '@shopify/hydrogen/storefront-api-types';

// ============================================================================
// Types
// ============================================================================

/** Money type that's compatible with both MoneyV2 and simple objects */
export interface MoneyLike {
  amount: string;
  currencyCode: CurrencyCode | string;
}

export interface PriceDisplayProps {
  /** Current price */
  price: MoneyLike;
  /** Compare-at price (for sale items) */
  compareAtPrice?: MoneyLike | null;
  /** Show percentage off badge */
  showDiscountPercentage?: boolean;
  /** Size variant */
  size?: 'sm' | 'md' | 'lg';
  /** Layout direction */
  layout?: 'horizontal' | 'vertical';
  /** Additional class name */
  className?: string;
}

// ============================================================================
// Helpers
// ============================================================================

/**
 * Format money value for display
 */
function formatMoney(money: MoneyLike): string {
  const amount = parseFloat(money.amount);
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: money.currencyCode,
  }).format(amount);
}

// ============================================================================
// Component
// ============================================================================

/**
 * PriceDisplay - Display product prices with compare-at formatting
 *
 * Shows the current price with optional compare-at price and discount percentage.
 * Uses Hydrogen's Money component for proper currency formatting.
 */
export function PriceDisplay({
  price,
  compareAtPrice,
  showDiscountPercentage = true,
  size = 'md',
  layout = 'horizontal',
  className = '',
}: PriceDisplayProps) {
  const isOnSale =
    compareAtPrice &&
    parseFloat(compareAtPrice.amount) > parseFloat(price.amount);

  // Calculate discount percentage
  let discountPercentage = 0;
  if (isOnSale && compareAtPrice) {
    const discount =
      parseFloat(compareAtPrice.amount) - parseFloat(price.amount);
    discountPercentage = Math.round(
      (discount / parseFloat(compareAtPrice.amount)) * 100,
    );
  }

  const sizeClasses = {
    sm: {
      current: 'text-sm font-medium',
      compare: 'text-xs',
      badge: 'text-xs px-1 py-0.5',
    },
    md: {
      current: 'text-base font-semibold',
      compare: 'text-sm',
      badge: 'text-xs px-1.5 py-0.5',
    },
    lg: {
      current: 'text-xl font-bold',
      compare: 'text-base',
      badge: 'text-sm px-2 py-1',
    },
  };

  const sizes = sizeClasses[size];
  const isVertical = layout === 'vertical';

  return (
    <div
      className={`flex ${isVertical ? 'flex-col gap-0.5' : 'flex-wrap items-center gap-2'} ${className}`}
    >
      {/* Current price */}
      <span
        className={`${sizes.current} ${isOnSale ? 'text-primary' : 'text-dark'}`}
      >
        {formatMoney(price)}
      </span>

      {/* Compare-at price */}
      {isOnSale && compareAtPrice && (
        <span className={`${sizes.compare} text-text-muted line-through`}>
          {formatMoney(compareAtPrice)}
        </span>
      )}

      {/* Discount badge */}
      {isOnSale && showDiscountPercentage && discountPercentage > 0 && (
        <span
          className={`${sizes.badge} rounded bg-primary/10 font-medium text-primary`}
        >
          {discountPercentage}% OFF
        </span>
      )}
    </div>
  );
}

export default PriceDisplay;
