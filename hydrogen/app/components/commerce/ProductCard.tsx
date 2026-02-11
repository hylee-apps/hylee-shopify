'use client';

import {useState} from 'react';
import {Link} from 'react-router';
import {Image} from '@shopify/hydrogen';
import type {
  Product,
  ProductVariant,
} from '@shopify/hydrogen/storefront-api-types';
import {Badge} from '../display/Badge';
import {Icon} from '../display/Icon';
import {PriceDisplay} from './PriceDisplay';
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
// Subcomponents
// ============================================================================

function StarRating({rating, count}: {rating: number; count?: number}) {
  return (
    <div className="flex items-center gap-1">
      <div className="flex">
        {[1, 2, 3, 4, 5].map((star) => (
          <Icon
            key={star}
            name={star <= rating ? 'star' : 'star'}
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
    <article
      className={`group relative flex flex-col overflow-hidden rounded-lg border border-border bg-white transition-shadow hover:shadow-md ${className}`}
    >
      {/* Image */}
      <div className="relative aspect-square overflow-hidden bg-surface">
        <Link to="#">
          <img
            src={imageUrl}
            alt={title}
            className="h-full w-full object-cover"
            loading="lazy"
          />
        </Link>
        {customBadge && (
          <div className="absolute left-2 top-2">
            <Badge variant="secondary">{customBadge}</Badge>
          </div>
        )}
      </div>

      {/* Info */}
      <div className="flex flex-1 flex-col gap-1 p-3">
        <h3 className="line-clamp-2 text-sm font-medium text-dark">
          <Link to="#" className="hover:text-primary">
            {title}
          </Link>
        </h3>
        <div className="text-sm font-semibold text-dark">{price}</div>
      </div>
    </article>
  );
}

// ============================================================================
// Main Component
// ============================================================================

export function ProductCard({
  product,
  showVendor = false,
  showQuickAdd = true,
  showRating = true,
  showSecondaryImage = true,
  showDiscountPercentage = true,
  lazyLoad = true,
  customBadge,
  customBadgeColor,
  className = '',
}: ProductCardProps) {
  const [isHovered, setIsHovered] = useState(false);

  // Get first available variant
  const firstVariant = product.variants.nodes[0];
  const price = firstVariant?.price;
  const compareAtPrice = firstVariant?.compareAtPrice;

  // Check sale and availability status
  const isOnSale =
    compareAtPrice &&
    parseFloat(compareAtPrice.amount) > parseFloat(price.amount);
  const isSoldOut = !product.availableForSale;
  const isNew = product.tags?.includes('new');

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

  return (
    <article
      className={`group relative flex flex-col overflow-hidden rounded-lg border border-border bg-white transition-shadow hover:shadow-md ${className}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Image Container */}
      <div className="relative aspect-square overflow-hidden bg-surface">
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

        {/* Badges */}
        <div className="absolute left-2 top-2 flex flex-col gap-1">
          {isSoldOut && <Badge variant="destructive">Sold Out</Badge>}
          {!isSoldOut && isOnSale && showDiscountPercentage && (
            <Badge variant="success">Sale</Badge>
          )}
          {isNew && !isSoldOut && <Badge variant="info">New</Badge>}
          {customBadge && (
            <Badge
              style={
                customBadgeColor
                  ? {backgroundColor: customBadgeColor}
                  : undefined
              }
            >
              {customBadge}
            </Badge>
          )}
        </div>
      </div>

      {/* Product Info */}
      <div className="flex flex-1 flex-col gap-1 p-3">
        {/* Vendor */}
        {showVendor && product.vendor && (
          <p className="text-xs text-text-muted">{product.vendor}</p>
        )}

        {/* Title */}
        <h3 className="line-clamp-2 text-sm font-medium text-dark">
          <Link
            to={`/products/${product.handle}`}
            className="hover:text-primary"
          >
            {product.title}
          </Link>
        </h3>

        {/* Price */}
        <PriceDisplay
          price={price}
          compareAtPrice={compareAtPrice}
          showDiscountPercentage={showDiscountPercentage}
          size="sm"
        />

        {/* Rating */}
        {showRating && rating !== null && (
          <StarRating rating={rating} count={reviewCount} />
        )}
      </div>

      {/* Quick Add Button */}
      {showQuickAdd && (
        <div className="p-3 pt-0">
          {isSoldOut ? (
            <button
              disabled
              className="w-full rounded-md bg-surface py-2 text-sm font-medium text-text-muted"
            >
              Sold Out
            </button>
          ) : (
            <AddToCart
              variantId={firstVariant.id}
              available={product.availableForSale}
              size="sm"
              fullWidth
            />
          )}
        </div>
      )}
    </article>
  );
}

export default ProductCard;
