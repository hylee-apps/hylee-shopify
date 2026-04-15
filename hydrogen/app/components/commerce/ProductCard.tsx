'use client';

import {useState} from 'react';
import {Link} from 'react-router';
import {useTranslation} from 'react-i18next';
import {Image, CartForm} from '@shopify/hydrogen';
import type {
  Product,
  ProductVariant,
} from '@shopify/hydrogen/storefront-api-types';
import {ImageIcon, Heart, Plus} from 'lucide-react';
import {AddToCart} from './AddToCart';
import {Button} from '~/components/ui/button';
import {FaceIcon, toFaceRating} from './FaceRating';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '~/components/ui/tooltip';
import {useWishlist} from '~/hooks/useWishlist';

// ============================================================================
// Types
// ============================================================================

type ProductCardProduct = Pick<
  Product,
  'id' | 'title' | 'handle' | 'vendor' | 'availableForSale' | 'tags'
> & {
  images: {
    nodes: Array<{
      id?: string | null;
      url: string;
      altText?: string | null;
      width?: number | null;
      height?: number | null;
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
  /**
   * Card size variant.
   * - 'default': standard grid card (homepage-style)
   * - 'small': PLP compact card — Figma Card=ProductSmall (173×191px image,
   *   bg-secondary Add button, superscript price, 14px title)
   * - 'category': PLP non-end-node category card — Figma node 5006:775
   *   (bg-white border rounded-[12px], 203px image, brand+name+stars+price)
   * - 'end-node': PLP end-node leaf card — Figma node 5030:728
   *   (identical to 'category' but 250px image height for the wider 4-col grid)
   */
  size?: 'default' | 'small' | 'category' | 'end-node';
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
  /** Collection handle appended as ?collection= on the product link for PDP breadcrumbs */
  collectionHandle?: string;
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
  const {t} = useTranslation();
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
          aria-label={t('productCard.addToWishlist')}
        >
          <Heart size={18} />
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
  size = 'default',
  showQuickAdd = true,
  showRating = true,
  showSecondaryImage = true,
  lazyLoad = true,
  className = '',
  collectionHandle,
  customBadge,
  customBadgeColor,
}: ProductCardProps) {
  const {t} = useTranslation();
  const [isHovered, setIsHovered] = useState(false);
  const {
    isWishlisted,
    isPending,
    toggle: toggleWishlist,
  } = useWishlist(product.id);

  const productUrl = collectionHandle
    ? `/products/${product.handle}?collection=${collectionHandle}`
    : `/products/${product.handle}`;

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

  // ============================================================================
  // Category variant — Figma node 5006:775 (PLP non-end-node category page)
  // bg-white border border-[#e5e7eb] rounded-[12px], 203px image, brand+name+stars+price
  // ============================================================================

  if (size === 'category' || size === 'end-node') {
    // end-node is identical to category except image height: 250px vs 203px
    const imageHeight = size === 'end-node' ? 'h-[250px]' : 'h-[203px]';
    const compareAtPrice = firstVariant?.compareAtPrice;
    const hasDiscount =
      compareAtPrice &&
      parseFloat(compareAtPrice.amount) > parseFloat(price?.amount ?? '0');

    // Badge priority: Sale/discount > tag:new > tag:best-seller > customBadge
    // Colors: discount=orange #f2b05e, new=primary green, best-seller=secondary teal
    let badgeText: string | null = null;
    let badgeBg = 'bg-[#f2b05e]'; // default: orange for sale/discount
    if (hasDiscount && compareAtPrice && price) {
      const pct = Math.round(
        ((parseFloat(compareAtPrice.amount) - parseFloat(price.amount)) /
          parseFloat(compareAtPrice.amount)) *
          100,
      );
      badgeText = pct >= 10 ? `-${pct}%` : 'Sale';
    } else if (product.tags?.includes('new')) {
      badgeText = 'New';
      badgeBg = 'bg-primary';
    } else if (product.tags?.includes('best-seller')) {
      badgeText = 'Best Seller';
      badgeBg = 'bg-secondary';
    } else if (customBadge) {
      badgeText = customBadge;
      badgeBg = customBadgeColor ?? 'bg-primary';
    }

    const ratingMeta = product.metafields?.find((m) => m?.key === 'rating');
    const ratingCountMeta = product.metafields?.find(
      (m) => m?.key === 'rating_count',
    );
    const starRating = ratingMeta ? parseFloat(ratingMeta.value) : null;
    const starCount = ratingCountMeta
      ? parseInt(ratingCountMeta.value, 10)
      : null;

    return (
      <article
        className={`flex flex-col bg-white border border-[#e5e7eb] rounded-[12px] overflow-hidden ${className}`}
      >
        {/* Image area */}
        <div className={`relative ${imageHeight} w-full bg-[#f3f4f6]`}>
          <Link to={productUrl} className="block w-full h-full">
            {primaryImage ? (
              <Image
                data={primaryImage}
                aspectRatio="1/1"
                sizes="(min-width: 1280px) 17vw, (min-width: 1024px) 25vw, (min-width: 640px) 33vw, 50vw"
                className="w-full h-full object-cover"
                loading={lazyLoad ? 'lazy' : 'eager'}
              />
            ) : (
              <div className="flex w-full h-full items-center justify-center text-[#9ca3af]">
                <ImageIcon size={32} />
              </div>
            )}
          </Link>

          {/* Badge — top-left */}
          {badgeText && (
            <span
              className={`absolute left-3 top-3 ${badgeBg} px-3 py-1 rounded-[4px] text-[11px] font-bold text-white uppercase leading-none pointer-events-none`}
            >
              {badgeText}
            </span>
          )}

          {/* Wishlist — top-right */}
          <button
            type="button"
            onClick={toggleWishlist}
            disabled={isPending}
            aria-label={
              isWishlisted
                ? t('productCard.removeFromWishlist')
                : t('productCard.addToWishlist')
            }
            className="absolute right-3 top-3 flex items-center justify-center size-8 rounded-full bg-white/90 transition-colors hover:bg-white disabled:opacity-70"
          >
            <Heart
              size={14}
              className={isWishlisted ? 'text-primary' : 'text-[#9ca3af]'}
              fill={isWishlisted ? 'currentColor' : 'none'}
            />
          </button>
        </div>

        {/* Product info */}
        <div className="p-4 flex flex-col gap-1 flex-1">
          {/* Name */}
          <h3 className="text-[15px] font-medium text-[#111827] leading-[21px] line-clamp-2">
            <Link
              to={productUrl}
              className="hover:text-primary transition-colors"
            >
              {product.title}
            </Link>
          </h3>

          {/* Stars + count */}
          {starRating !== null && (
            <div className="flex items-center gap-1 pt-1">
              <span className="text-[#f2b05e] text-[12px] leading-none tracking-[1px]">
                {'★'.repeat(Math.round(starRating))}
                {'☆'.repeat(5 - Math.round(starRating))}
              </span>
              {starCount !== null && (
                <span className="text-[12px] text-[#6b7280] leading-[18px]">
                  ({starCount})
                </span>
              )}
            </div>
          )}

          {/* Price */}
          {price && (
            <div className="flex items-center gap-2 pt-1">
              <span className="text-[18px] font-bold text-[#111827] leading-[27px]">
                {formatPrice(price.amount, price.currencyCode)}
              </span>
              {hasDiscount && compareAtPrice && (
                <span className="text-[14px] font-normal text-[#9ca3af] line-through leading-[21px]">
                  {formatPrice(
                    compareAtPrice.amount,
                    compareAtPrice.currencyCode,
                  )}
                </span>
              )}
            </div>
          )}

          {/* CTAs — pinned to card bottom */}
          <div className="mt-auto pt-3 flex flex-col gap-2">
            {isSoldOut ? (
              <button
                disabled
                className="w-full rounded-[8px] bg-[#f3f4f6] py-2 text-[13px] font-medium text-[#9ca3af] cursor-not-allowed"
              >
                {t('addToCart.soldOut')}
              </button>
            ) : (
              <CartForm
                route="/cart"
                action={CartForm.ACTIONS.LinesAdd}
                inputs={{
                  lines: [{merchandiseId: firstVariant?.id ?? '', quantity: 1}],
                }}
              >
                {() => (
                  <button
                    type="submit"
                    className="w-full rounded-[8px] bg-secondary py-2 text-[13px] font-semibold text-white transition-colors hover:bg-secondary/90"
                  >
                    {t('addToCart.idle')}
                  </button>
                )}
              </CartForm>
            )}
            <button
              type="button"
              onClick={toggleWishlist}
              disabled={isPending}
              className="flex items-center justify-center gap-1.5 py-1 text-[12px] font-medium text-[#6b7280] transition-colors hover:text-primary disabled:opacity-70"
            >
              <Heart
                size={13}
                fill={isWishlisted ? 'currentColor' : 'none'}
                className={isWishlisted ? 'text-primary' : ''}
              />
              {isWishlisted
                ? t('productCard.wishlisted')
                : t('productCard.addToWishlist')}
            </button>
          </div>
        </div>
      </article>
    );
  }

  // ============================================================================
  // Small variant — Figma Card=ProductSmall (PLP)
  // flex-col gap-[10px] p-[10px], image 173×191px, bg-secondary Add btn,
  // superscript price ($12px + amount 24px), 14px Medium title
  // ============================================================================

  if (size === 'small') {
    return (
      <article className={`flex flex-col gap-[10px] p-[10px] ${className}`}>
        {/* Image — aspect ratio from Figma 173×191, fluid width */}
        <div className="relative aspect-173/191 w-full bg-surface overflow-hidden">
          <Link to={productUrl}>
            {primaryImage ? (
              <Image
                data={primaryImage}
                sizes="(min-width: 768px) 220px, (min-width: 640px) 30vw, 45vw"
                className="h-full w-full object-cover"
                loading={lazyLoad ? 'lazy' : 'eager'}
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-text-muted">
                <ImageIcon size={32} />
              </div>
            )}
          </Link>
        </div>

        {/* Add button — Figma: bg-secondary rounded-[25px] h-[40px] px-[20px] */}
        <CartForm
          route="/cart"
          action={CartForm.ACTIONS.LinesAdd}
          inputs={{
            lines: [{merchandiseId: firstVariant?.id ?? '', quantity: 1}],
          }}
        >
          {() => (
            <Button
              type="submit"
              disabled={isSoldOut || !firstVariant}
              className="bg-secondary hover:bg-secondary/90 rounded-[25px] h-10 px-5 has-[>svg]:px-5 text-white gap-2.5 [&_svg:not([class*='size-'])]:size-6.25"
            >
              {isSoldOut ? (
                t('addToCart.soldOut')
              ) : (
                <>
                  <Plus className="text-white" />
                  <span className="text-[14px] font-medium">
                    {t('productCard.add')}
                  </span>
                </>
              )}
            </Button>
          )}
        </CartForm>

        {/* Price — Figma: $ at 12px (top-left), amount at 24px, SemiBold, tracking-[0.5px] */}
        {price && (
          <div className="relative h-[28px] w-[64px] font-semibold text-black tracking-[0.5px] whitespace-nowrap shrink-0">
            <span className="absolute left-0 top-[4px] text-[12px] leading-[24px]">
              $
            </span>
            <span className="absolute left-[8px] top-0 text-[24px] leading-[24px]">
              {parseFloat(price.amount).toFixed(2)}
            </span>
          </div>
        )}

        {/* Title — Figma: 14px Roboto Medium, text-black */}
        <p className="text-[14px] font-medium text-black line-clamp-2">
          <Link to={productUrl} className="hover:text-primary">
            {product.title}
          </Link>
        </p>
      </article>
    );
  }

  // ============================================================================
  // Default variant
  // ============================================================================

  return (
    <article
      className={`group flex flex-col ${className}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Image Container */}
      <div className="relative aspect-square overflow-hidden rounded-lg bg-surface">
        <Link to={productUrl}>
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
              <ImageIcon size={48} />
            </div>
          )}
        </Link>

        {/* Wishlist heart icon */}
        <button
          type="button"
          onClick={toggleWishlist}
          disabled={isPending}
          className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full bg-white/80 text-text-muted hover:text-primary transition-colors disabled:opacity-70"
          aria-label={
            isWishlisted
              ? t('productCard.removeFromWishlist')
              : t('productCard.addToWishlist')
          }
        >
          <Heart
            size={18}
            fill={isWishlisted ? 'currentColor' : 'none'}
            className={isWishlisted ? 'text-primary' : ''}
          />
        </button>
      </div>

      {/* Product Info */}
      <div className="mt-3 flex flex-col gap-2">
        {/* Title — full width, 2-line clamp, tooltip reveals full text on hover */}
        <TooltipProvider>
          <Tooltip>
            <h3 className="w-full text-sm font-semibold text-dark line-clamp-2">
              <TooltipTrigger asChild>
                <Link to={productUrl} className="hover:text-primary">
                  {product.title}
                </Link>
              </TooltipTrigger>
            </h3>
            <TooltipContent side="top" className="max-w-[220px] text-center">
              {product.title}
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>

        {/* Price — centered */}
        {price && (
          <p className="text-center text-sm font-bold text-dark">
            {formatPrice(price.amount, price.currencyCode)}
          </p>
        )}
      </div>

      {/* CTAs */}
      {showQuickAdd && (
        <div className="mt-3 flex items-center gap-3">
          {isSoldOut ? (
            <button
              disabled
              className="rounded-md bg-surface px-4 py-2 text-xs font-medium text-text-muted"
            >
              {t('addToCart.soldOut')}
            </button>
          ) : (
            <AddToCart
              variantId={firstVariant?.id ?? ''}
              available={product.availableForSale}
              size="sm"
              className="!rounded-md !px-4 !py-2 !text-xs"
            >
              {t('addToCart.idle')}
            </AddToCart>
          )}
          <button
            type="button"
            disabled={isPending}
            className="text-xs font-medium text-text-muted hover:text-primary transition-colors disabled:opacity-70"
            onClick={toggleWishlist}
          >
            {isWishlisted
              ? t('productCard.wishlisted')
              : t('productCard.addShortlist')}
          </button>
        </div>
      )}
    </article>
  );
}

export default ProductCard;
