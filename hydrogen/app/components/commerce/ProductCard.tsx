'use client';

import {useState} from 'react';
import {Link} from 'react-router';
import {Image} from '@shopify/hydrogen';
import type {
  Product,
  ProductVariant,
} from '@shopify/hydrogen/storefront-api-types';
import {Icon} from '../display/Icon';
import {AddToCart} from './AddToCart';

// ============================================================================
// Types
// ============================================================================

type ProductCardProduct = Pick<
  Product,
  'id' | 'title' | 'handle' | 'vendor' | 'availableForSale' | 'tags'
> & {
  images: {
    nodes: Array<{
      id?: string;
      url: string;
      altText?: string | null;
      width?: number;
      height?: number;
    }>;
  };
  priceRange: {
    minVariantPrice: {
      amount: string;
      currencyCode: string;
    };
  };
  compareAtPriceRange?: {
    minVariantPrice: {
      amount: string;
      currencyCode: string;
    };
  };
  variants: {
    nodes: Array<
      Pick<ProductVariant, 'id' | 'availableForSale'> & {
        price: {
          amount: string;
          currencyCode: string;
        };
        compareAtPrice?: {
          amount: string;
          currencyCode: string;
        } | null;
        selectedOptions: Array<{name: string; value: string}>;
      }
    >;
  };
  metafields?: Array<{
    key: string;
    value: string;
  } | null>;
};

export interface ProductCardProps {
  /** Product data */
  product: ProductCardProduct;
  /** Show vendor name */
  showVendor?: boolean;
  /** Show quick add button */
  showQuickAdd?: boolean;
  /** Show rating (requires metafield data) */
  showRating?: boolean;
  /** Show secondary image on hover */
  showSecondaryImage?: boolean;
  /** Show discount percentage badge */
  showDiscountPercentage?: boolean;
  /** Lazy load images */
  lazyLoad?: boolean;
  /** Custom badge text */
  customBadge?: string;
  /** Custom badge color */
  customBadgeColor?: string;
  /** Additional CSS classes */
  className?: string;
}

export interface ProductCardPlaceholderProps {
  /** Placeholder title */
  title?: string;
  /** Placeholder price */
  price?: string;
  /** Placeholder image URL */
  imageUrl?: string;
  /** Custom badge */
  customBadge?: string;
  /** Additional CSS classes */
  className?: string;
}

// ============================================================================
// Helpers
// ============================================================================

function formatPrice(amount: string, currencyCode: string): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currencyCode,
  }).format(parseFloat(amount));
}

function StarRating({rating, count}: {rating: number; count?: number}) {
  return (
    <div className="flex items-center gap-1">
      <div className="flex">
        {[1, 2, 3, 4, 5].map((star) => (
          <Icon
            key={star}
            name={star <= rating ? 'star-filled' : 'star'}
            size={14}
            className={star <= rating ? 'text-warning' : 'text-border'}
          />
        ))}
      </div>
      {count !== undefined && (
        <span className="text-xs text-text-muted">({count})</span>
      )}
    </div>
  );
}

// ============================================================================
// Placeholder Component
// ============================================================================

export function ProductCardPlaceholder({
  title = 'Product Title',
  price = '$0.00',
  imageUrl = 'https://placehold.co/600x600/f1f5f9/64748b?text=Product',
  customBadge,
  className = '',
}: ProductCardPlaceholderProps) {
  return (
    <article className={`group flex flex-col ${className}`}>
      {/* Image */}
      <div className="relative aspect-square overflow-hidden rounded-lg bg-surface">
        <Link to="#">
          <img
            src={imageUrl}
            alt={title}
            className="h-full w-full object-cover"
            loading="lazy"
          />
        </Link>
        <button
          type="button"
          className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full bg-white/80 text-text-muted hover:text-primary transition-colors"
          aria-label="Add to wishlist"
        >
          <Icon name="heart" size={18} />
        </button>
      </div>

      {/* Info */}
      <div className="mt-3 space-y-1.5">
        <div className="flex items-start justify-between gap-2">
          <h3 className="text-sm font-semibold text-dark line-clamp-1">
            <Link to="#" className="hover:text-primary">
              {title}
            </Link>
          </h3>
          <span className="shrink-0 text-sm font-bold text-dark">{price}</span>
        </div>
      </div>
    </article>
  );
}

// ============================================================================
// Main Component
// ============================================================================

export function ProductCard({
  product,
  showQuickAdd = true,
  showRating = true,
  showSecondaryImage = true,
  lazyLoad = true,
  className = '',
}: ProductCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [wishlisted, setWishlisted] = useState(false);

  // Get first available variant
  const firstVariant = product.variants.nodes[0];
  const price = firstVariant?.price;
  const isSoldOut = !product.availableForSale;

  // Get images
  const primaryImage = product.images.nodes[0];
  const secondaryImage = product.images.nodes[1];
  const hasSecondaryImage = showSecondaryImage && secondaryImage;

  // Get rating from metafields if available
  const ratingMetafield = product.metafields?.find((m) => m?.key === 'rating');
  const countMetafield = product.metafields?.find((m) => m?.key === 'count');
  const rating = ratingMetafield ? parseFloat(ratingMetafield.value) : null;
  const reviewCount = countMetafield
    ? parseInt(countMetafield.value, 10)
    : undefined;

  // Variant count for subtitle
  const variantCount = product.variants.nodes.length;

  return (
    <article
      className={`group flex flex-col ${className}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Image Container */}
      <div className="relative aspect-square overflow-hidden rounded-lg bg-surface">
        <Link to={`/products/${product.handle}`}>
          {primaryImage ? (
            <>
              <Image
                data={primaryImage}
                className={`h-full w-full object-cover transition-opacity duration-300 ${
                  hasSecondaryImage && isHovered ? 'opacity-0' : 'opacity-100'
                }`}
                loading={lazyLoad ? 'lazy' : 'eager'}
                sizes="(min-width: 1024px) 25vw, (min-width: 768px) 33vw, 50vw"
              />
              {hasSecondaryImage && (
                <Image
                  data={secondaryImage}
                  className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-300 ${
                    isHovered ? 'opacity-100' : 'opacity-0'
                  }`}
                  loading="lazy"
                  sizes="(min-width: 1024px) 25vw, (min-width: 768px) 33vw, 50vw"
                />
              )}
            </>
          ) : (
            <div className="flex h-full w-full items-center justify-center text-text-muted">
              <Icon name="image" size={48} />
            </div>
          )}
        </Link>

        {/* Wishlist heart icon */}
        <button
          type="button"
          onClick={() => setWishlisted(!wishlisted)}
          className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full bg-white/80 text-text-muted hover:text-primary transition-colors"
          aria-label={wishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
        >
          <Icon name={wishlisted ? 'heart-filled' : 'heart'} size={18} className={wishlisted ? 'text-primary' : ''} />
        </button>
      </div>

      {/* Product Info */}
      <div className="mt-3 space-y-1">
        {/* Title + Price row */}
        <div className="flex items-start justify-between gap-2">
          <h3 className="text-sm font-semibold text-dark line-clamp-1">
            <Link
              to={`/products/${product.handle}`}
              className="hover:text-primary"
            >
              {product.title}
            </Link>
          </h3>
          {price && (
            <span className="shrink-0 text-sm font-bold text-dark">
              {formatPrice(price.amount, price.currencyCode)}
            </span>
          )}
        </div>

        {/* Variant subtitle */}
        {variantCount > 1 && (
          <p className="text-xs text-text-muted">
            {variantCount} types available
          </p>
        )}

        {/* Rating */}
        {showRating && rating !== null && (
          <StarRating rating={rating} count={reviewCount} />
        )}
      </div>

      {/* Actions: Add To Cart + Add Shortlist */}
      {showQuickAdd && (
        <div className="mt-3 flex items-center gap-3">
          {isSoldOut ? (
            <button
              disabled
              className="rounded-md bg-surface px-4 py-2 text-xs font-medium text-text-muted"
            >
              Sold Out
            </button>
          ) : (
            <AddToCart
              variantId={firstVariant.id}
              available={product.availableForSale}
              size="sm"
              className="!rounded-md !px-4 !py-2 !text-xs"
            >
              Add To Cart
            </AddToCart>
          )}
          <button
            type="button"
            className="text-xs font-medium text-text-muted hover:text-primary transition-colors"
            onClick={() => setWishlisted(!wishlisted)}
          >
            Add Shortlist
          </button>
        </div>
      )}
    </article>
  );
}

export default ProductCard;
