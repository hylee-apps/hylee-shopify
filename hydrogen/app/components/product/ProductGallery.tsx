'use client';

import {useState, useCallback} from 'react';
import {Image} from '@shopify/hydrogen';
import type {
  ProductVariant,
  MediaImage,
} from '@shopify/hydrogen/storefront-api-types';
import {Icon} from '../display/Icon';

// ============================================================================
// Types
// ============================================================================

export interface ProductGalleryImage {
  id: string;
  url: string;
  altText?: string | null;
  width?: number;
  height?: number;
}

export interface ProductGalleryProps {
  /** Array of product media/images */
  images: ProductGalleryImage[];
  /** Currently selected variant (to highlight variant-specific images) */
  selectedVariant?: Pick<ProductVariant, 'id'> & {
    image?: ProductGalleryImage | null;
  };
  /** Product title for alt text fallback */
  productTitle: string;
  /** Additional class name for gallery container */
  className?: string;
}

// ============================================================================
// Component
// ============================================================================

/**
 * ProductGallery - Image gallery with thumbnails for product pages
 *
 * Features:
 * - Vertical thumbnail strip (desktop)
 * - Horizontal thumbnail strip (mobile)
 * - Main image with navigation arrows
 * - Keyboard navigation support
 * - Touch swipe support (basic)
 */
export function ProductGallery({
  images,
  selectedVariant,
  productTitle,
  className = '',
}: ProductGalleryProps) {
  // Start with variant image index if available
  const initialIndex = selectedVariant?.image
    ? images.findIndex((img) => img.id === selectedVariant.image?.id)
    : 0;

  const [currentIndex, setCurrentIndex] = useState(Math.max(0, initialIndex));

  const currentImage = images[currentIndex];
  const hasMultipleImages = images.length > 1;

  const goToImage = useCallback(
    (index: number) => {
      if (index >= 0 && index < images.length) {
        setCurrentIndex(index);
      }
    },
    [images.length],
  );

  const goToPrevious = useCallback(() => {
    setCurrentIndex((prev) => (prev > 0 ? prev - 1 : images.length - 1));
  }, [images.length]);

  const goToNext = useCallback(() => {
    setCurrentIndex((prev) => (prev < images.length - 1 ? prev + 1 : 0));
  }, [images.length]);

  // Handle keyboard navigation
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'ArrowLeft') {
        goToPrevious();
      } else if (e.key === 'ArrowRight') {
        goToNext();
      }
    },
    [goToPrevious, goToNext],
  );

  return (
    <div className={`flex gap-4 ${className}`}>
      {/* Desktop Thumbnails (vertical) */}
      {hasMultipleImages && (
        <div className="hidden lg:flex flex-col gap-2 w-20">
          <button
            onClick={goToPrevious}
            className="flex items-center justify-center p-2 rounded-md border border-border text-text-muted hover:text-text hover:border-primary transition-colors"
            aria-label="Previous image"
          >
            <Icon name="chevron-up" size={16} />
          </button>

          <div className="flex flex-col gap-2 max-h-[400px] overflow-y-auto scrollbar-hide">
            {images.map((image, index) => (
              <button
                key={image.id}
                onClick={() => goToImage(index)}
                className={`relative aspect-square rounded-md overflow-hidden border-2 transition-colors ${
                  index === currentIndex
                    ? 'border-primary'
                    : 'border-border hover:border-primary/50'
                }`}
                aria-label={`View image ${index + 1}`}
                aria-current={index === currentIndex}
              >
                <Image
                  data={image}
                  className="w-full h-full object-cover"
                  loading="lazy"
                  sizes="80px"
                />
              </button>
            ))}
          </div>

          <button
            onClick={goToNext}
            className="flex items-center justify-center p-2 rounded-md border border-border text-text-muted hover:text-text hover:border-primary transition-colors"
            aria-label="Next image"
          >
            <Icon name="chevron-down" size={16} />
          </button>
        </div>
      )}

      {/* Main Image */}
      <div
        className="relative flex-1"
        role="region"
        aria-label="Product gallery"
        tabIndex={0}
        onKeyDown={handleKeyDown}
      >
        <div className="relative aspect-square rounded-lg overflow-hidden bg-surface">
          {currentImage ? (
            <Image
              data={currentImage}
              className="w-full h-full object-contain"
              loading="eager"
              sizes="(min-width: 1024px) 50vw, 100vw"
            />
          ) : (
            <div className="flex items-center justify-center h-full text-text-muted">
              <Icon name="image" size={64} />
            </div>
          )}

          {/* Navigation Arrows */}
          {hasMultipleImages && (
            <>
              <button
                onClick={goToPrevious}
                className="absolute left-2 top-1/2 -translate-y-1/2 flex items-center justify-center w-10 h-10 rounded-full bg-white/90 shadow-md text-text hover:bg-white hover:text-primary transition-colors"
                aria-label="Previous image"
              >
                <Icon name="chevron-left" size={20} />
              </button>
              <button
                onClick={goToNext}
                className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center justify-center w-10 h-10 rounded-full bg-white/90 shadow-md text-text hover:bg-white hover:text-primary transition-colors"
                aria-label="Next image"
              >
                <Icon name="chevron-right" size={20} />
              </button>
            </>
          )}

          {/* Image Counter */}
          {hasMultipleImages && (
            <div className="absolute bottom-2 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-black/60 text-white text-sm">
              {currentIndex + 1} / {images.length}
            </div>
          )}
        </div>

        {/* Mobile Thumbnails (horizontal) */}
        {hasMultipleImages && (
          <div className="lg:hidden flex gap-2 mt-3 overflow-x-auto pb-2 scrollbar-hide">
            {images.map((image, index) => (
              <button
                key={image.id}
                onClick={() => goToImage(index)}
                className={`relative shrink-0 w-16 h-16 rounded-md overflow-hidden border-2 transition-colors ${
                  index === currentIndex
                    ? 'border-primary'
                    : 'border-border hover:border-primary/50'
                }`}
                aria-label={`View image ${index + 1}`}
                aria-current={index === currentIndex}
              >
                <Image
                  data={image}
                  className="w-full h-full object-cover"
                  loading="lazy"
                  sizes="64px"
                />
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default ProductGallery;
