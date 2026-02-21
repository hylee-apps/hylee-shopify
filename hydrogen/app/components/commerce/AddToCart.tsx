'use client';

import {useState, useCallback, useEffect} from 'react';
import {useFetcher} from 'react-router';
import {CartForm} from '@shopify/hydrogen';
import {Loader2, Check, X} from 'lucide-react';
import {Button} from '~/components/ui/button';

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
            <Loader2
              size={size === 'sm' ? 14 : size === 'lg' ? 20 : 16}
              className="animate-spin"
            />
            <span>Adding...</span>
          </>
        );
      case 'success':
        return (
          <>
            <Check size={size === 'sm' ? 14 : size === 'lg' ? 20 : 16} />
            <span>Added!</span>
          </>
        );
      case 'error':
        return (
          <>
            <X size={size === 'sm' ? 14 : size === 'lg' ? 20 : 16} />
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
          <Button
            type="submit"
            disabled={isDisabled}
            className={`rounded-md ${sizeClasses[size]} ${variantClasses[variant]} ${fullWidth ? 'w-full' : ''} ${className}`}
            aria-label={available ? 'Add to cart' : 'Sold out'}
          >
            {buttonContent()}
          </Button>
        </>
      )}
    </CartForm>
  );
}

export default AddToCart;
