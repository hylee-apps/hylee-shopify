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

export interface PriceParts {
  /** Currency symbol or code (e.g. "$", "€", "kr") */
  symbol: string;
  /** Locale-formatted number without the symbol (e.g. "12.00", "1,200") */
  number: string;
  /** Whether the symbol appears before or after the digits */
  symbolPosition: 'before' | 'after';
}

/**
 * Split a money value into its currency symbol and numeric parts using the
 * runtime locale (browser on client, server default on SSR). This allows
 * correct positioning of currency symbols — some currencies (e.g. SEK, NOK)
 * place their symbol after the number.
 */
export function formatPriceParts(
  money: MoneyLike,
  locale?: string,
): PriceParts {
  const amount = parseFloat(money.amount);
  const formatter = new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: money.currencyCode as string,
  });
  const parts = formatter.formatToParts(amount);

  const currencyPart = parts.find((p) => p.type === 'currency');
  const symbol = currencyPart?.value ?? (money.currencyCode as string);

  const currencyIndex = parts.findIndex((p) => p.type === 'currency');
  const firstIntegerIndex = parts.findIndex((p) => p.type === 'integer');
  const symbolPosition: 'before' | 'after' =
    currencyIndex < firstIntegerIndex ? 'before' : 'after';

  // Number = all parts except the currency token and surrounding whitespace literals
  const number = parts
    .filter((p) => p.type !== 'currency')
    .map((p) => p.value)
    .join('')
    .trim();

  return {symbol, number, symbolPosition};
}

/**
 * Format money value for display (full string including symbol)
 */
function formatMoney(money: MoneyLike): string {
  const amount = parseFloat(money.amount);
  return new Intl.NumberFormat(undefined, {
    style: 'currency',
    currency: money.currencyCode as string,
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
