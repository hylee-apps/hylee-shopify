'use client';

import {useState, useCallback, useEffect} from 'react';
import {useFetcher} from 'react-router';
import {CartForm} from '@shopify/hydrogen';
import {Icon} from '../display/Icon';

// ============================================================================
// Types
// ============================================================================

export interface AddToCartProps {
  /** Variant ID to add */
  variantId: string;
  /** Quantity to add */
  quantity?: number;
  /** Whether the variant is available */
  available?: boolean;
  /** Button text */
  children?: React.ReactNode;
  /** Size variant */
  size?: 'sm' | 'md' | 'lg';
  /** Button variant */
  variant?: 'primary' | 'secondary' | 'outline';
  /** Full width button */
  fullWidth?: boolean;
  /** Additional class name */
  className?: string;
  /** Callback after successful add */
  onSuccess?: () => void;
  /** Analytics data */
  analytics?: {
    products: Array<{
      productGid: string;
      variantGid: string;
      name: string;
      price: string;
      quantity: number;
    }>;
    totalValue: string;
  };
}

type ButtonState = 'idle' | 'loading' | 'success' | 'error';

// ============================================================================
// Component
// ============================================================================

/**
 * AddToCart - Add to cart button with loading states
 *
 * Uses Hydrogen's CartForm for Shopify cart integration.
 * Shows loading spinner during submission and success checkmark after.
 */
export function AddToCart({
  variantId,
  quantity = 1,
  available = true,
  children = 'Add to Cart',
  size = 'md',
  variant = 'primary',
  fullWidth = false,
  className = '',
  onSuccess,
  analytics,
}: AddToCartProps) {
  const fetcher = useFetcher();
  const [buttonState, setButtonState] = useState<ButtonState>('idle');

  // Track fetcher state changes
  useEffect(() => {
    if (fetcher.state === 'submitting') {
      setButtonState('loading');
    } else if (fetcher.state === 'idle' && fetcher.data) {
      // Check for errors in response
      if (fetcher.data.errors?.length > 0) {
        setButtonState('error');
      } else {
        setButtonState('success');
        onSuccess?.();
      }
    }
  }, [fetcher.state, fetcher.data, onSuccess]);

  // Reset to idle after success/error display
  useEffect(() => {
    if (buttonState === 'success' || buttonState === 'error') {
      const timer = setTimeout(() => {
        setButtonState('idle');
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [buttonState]);

  const sizeClasses = {
    sm: 'px-3 py-1.5 text-sm gap-1.5',
    md: 'px-4 py-2 text-base gap-2',
    lg: 'px-6 py-3 text-lg gap-2.5',
  };

  const variantClasses = {
    primary: 'bg-primary text-white hover:bg-primary/90 disabled:bg-primary/50',
    secondary:
      'bg-secondary text-white hover:bg-secondary/90 disabled:bg-secondary/50',
    outline:
      'border-2 border-primary text-primary hover:bg-primary hover:text-white disabled:border-primary/50 disabled:text-primary/50',
  };

  const isDisabled = !available || buttonState === 'loading';

  const buttonContent = useCallback(() => {
    switch (buttonState) {
      case 'loading':
        return (
          <>
            <Icon
              name="loader"
              size={size === 'sm' ? 14 : size === 'lg' ? 20 : 16}
              className="animate-spin"
            />
            <span>Adding...</span>
          </>
        );
      case 'success':
        return (
          <>
            <Icon
              name="check"
              size={size === 'sm' ? 14 : size === 'lg' ? 20 : 16}
            />
            <span>Added!</span>
          </>
        );
      case 'error':
        return (
          <>
            <Icon
              name="x"
              size={size === 'sm' ? 14 : size === 'lg' ? 20 : 16}
            />
            <span>Error</span>
          </>
        );
      default:
        if (!available) {
          return <span>Sold Out</span>;
        }
        return <span>{children}</span>;
    }
  }, [buttonState, available, children, size]);

  const lines = [{merchandiseId: variantId, quantity}];

  return (
    <CartForm
      route="/cart"
      action={CartForm.ACTIONS.LinesAdd}
      inputs={{lines}}
      fetcherKey={`add-to-cart-${variantId}`}
    >
      {(fetcher) => (
        <>
          <input
            type="hidden"
            name="analytics"
            value={JSON.stringify(analytics)}
          />
          <button
            type="submit"
            disabled={isDisabled}
            className={`inline-flex items-center justify-center font-medium rounded-md transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 disabled:cursor-not-allowed ${sizeClasses[size]} ${variantClasses[variant]} ${fullWidth ? 'w-full' : ''} ${className}`}
            aria-label={available ? 'Add to cart' : 'Sold out'}
          >
            {buttonContent()}
          </button>
        </>
      )}
    </CartForm>
  );
}

export default AddToCart;
