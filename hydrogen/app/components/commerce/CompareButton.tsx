'use client';

import {useCallback} from 'react';
import {useSearchParams} from 'react-router';
import {Icon} from '../display/Icon';

// ============================================================================
// Types
// ============================================================================

export interface CompareButtonProps {
  /** Product ID to compare */
  productId: string;
  /** Maximum number of products that can be compared */
  maxCompare?: number;
  /** Button variant */
  variant?: 'icon' | 'text' | 'full';
  /** Size variant */
  size?: 'sm' | 'md' | 'lg';
  /** Additional class name */
  className?: string;
}

// ============================================================================
// Component
// ============================================================================

/**
 * CompareButton - Add/remove products to compare list via URL params
 *
 * Manages comparison state through URL search params for sharing and persistence.
 */
export function CompareButton({
  productId,
  maxCompare = 4,
  variant = 'icon',
  size = 'md',
  className = '',
}: CompareButtonProps) {
  const [searchParams, setSearchParams] = useSearchParams();

  // Get current compare list from URL params
  const compareParam = searchParams.get('compare') || '';
  const compareList = compareParam ? compareParam.split(',') : [];
  const isComparing = compareList.includes(productId);
  const isMaxReached = compareList.length >= maxCompare;

  const toggleCompare = useCallback(() => {
    const newParams = new URLSearchParams(searchParams);

    if (isComparing) {
      // Remove from compare list
      const newList = compareList.filter((id) => id !== productId);
      if (newList.length > 0) {
        newParams.set('compare', newList.join(','));
      } else {
        newParams.delete('compare');
      }
    } else if (!isMaxReached) {
      // Add to compare list
      const newList = [...compareList, productId];
      newParams.set('compare', newList.join(','));
    }

    setSearchParams(newParams, {replace: true});
  }, [
    searchParams,
    setSearchParams,
    productId,
    compareList,
    isComparing,
    isMaxReached,
  ]);

  const sizeClasses = {
    sm: {
      button: 'p-1',
      icon: 14,
      text: 'text-xs',
    },
    md: {
      button: 'p-1.5',
      icon: 16,
      text: 'text-sm',
    },
    lg: {
      button: 'p-2',
      icon: 20,
      text: 'text-base',
    },
  };

  const sizes = sizeClasses[size];
  const isDisabled = !isComparing && isMaxReached;

  if (variant === 'icon') {
    return (
      <button
        type="button"
        onClick={toggleCompare}
        disabled={isDisabled}
        className={`inline-flex items-center justify-center rounded-md border transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary ${sizes.button} ${
          isComparing
            ? 'border-primary bg-primary/10 text-primary'
            : 'border-border bg-white text-text-muted hover:border-primary hover:text-primary'
        } ${isDisabled ? 'cursor-not-allowed opacity-50' : ''} ${className}`}
        aria-label={isComparing ? 'Remove from compare' : 'Add to compare'}
        title={
          isDisabled
            ? `Maximum ${maxCompare} products can be compared`
            : isComparing
              ? 'Remove from compare'
              : 'Add to compare'
        }
      >
        <Icon name="columns" size={sizes.icon} />
      </button>
    );
  }

  if (variant === 'text') {
    return (
      <button
        type="button"
        onClick={toggleCompare}
        disabled={isDisabled}
        className={`inline-flex items-center gap-1 ${sizes.text} font-medium transition-colors ${
          isComparing ? 'text-primary' : 'text-text-muted hover:text-primary'
        } ${isDisabled ? 'cursor-not-allowed opacity-50' : ''} ${className}`}
        aria-label={isComparing ? 'Remove from compare' : 'Add to compare'}
      >
        <Icon name="columns" size={sizes.icon} />
        <span>{isComparing ? 'Comparing' : 'Compare'}</span>
      </button>
    );
  }

  // Full variant with label
  return (
    <button
      type="button"
      onClick={toggleCompare}
      disabled={isDisabled}
      className={`inline-flex items-center justify-center gap-2 rounded-md border px-3 py-2 ${sizes.text} font-medium transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary ${
        isComparing
          ? 'border-primary bg-primary/10 text-primary'
          : 'border-border bg-white text-text hover:border-primary hover:text-primary'
      } ${isDisabled ? 'cursor-not-allowed opacity-50' : ''} ${className}`}
      aria-label={isComparing ? 'Remove from compare' : 'Add to compare'}
    >
      <Icon name="columns" size={sizes.icon} />
      <span>{isComparing ? 'Remove from Compare' : 'Add to Compare'}</span>
    </button>
  );
}

export default CompareButton;
