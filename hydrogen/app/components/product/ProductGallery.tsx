'use client';

import {useState, useCallback, useRef} from 'react';
import {Image} from '@shopify/hydrogen';
import type {ProductVariant} from '@shopify/hydrogen/storefront-api-types';
import {ImageIcon, ChevronLeft, ChevronRight} from 'lucide-react';
import {ScrollArea} from '~/components/ui/scroll-area';

// ============================================================================
// Types
// ============================================================================

export interface ProductGalleryImage {
  id?: string | null;
  url: string;
  altText?: string | null;
  width?: number | null;
  height?: number | null;
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
  /** Thumbnail layout direction */
  layout?: 'horizontal' | 'vertical';
}

// ============================================================================
// Component
// ============================================================================

/**
 * ProductGallery - Image gallery with horizontal thumbnails below
 *
 * Features:
 * - Large main image
 * - Horizontal thumbnail strip below with left/right navigation
 * - Keyboard navigation support
 */
export function ProductGallery({
  images,
  selectedVariant,
  productTitle: _productTitle,
  className = '',
  layout = 'horizontal',
}: ProductGalleryProps) {
  // Start with variant image index if available
  const initialIndex = selectedVariant?.image
    ? images.findIndex((img) => img.id === selectedVariant.image?.id)
    : 0;

  const [currentIndex, setCurrentIndex] = useState(Math.max(0, initialIndex));
  const thumbnailsRef = useRef<HTMLDivElement>(null);

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

  const scrollThumbnails = useCallback((direction: 'left' | 'right') => {
    if (!thumbnailsRef.current) return;
    const scrollAmount = 200;
    thumbnailsRef.current.scrollBy({
      left: direction === 'left' ? -scrollAmount : scrollAmount,
      behavior: 'smooth',
    });
  }, []);

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

  if (layout === 'vertical') {
    return (
      <div className={`flex flex-row gap-3 ${className}`}>
        {/* Vertical Thumbnail Strip */}
        {hasMultipleImages && (
          <ScrollArea className="max-h-99.25">
            <div className="flex flex-col gap-2.5 pr-1">
              {images.map((image, index) => (
                <button
                  key={image.id}
                  onClick={() => goToImage(index)}
                  className={`relative shrink-0 w-15.75 h-18 rounded-[11px] overflow-hidden border-2 transition-colors ${
                    index === currentIndex
                      ? 'border-secondary'
                      : 'border-transparent hover:border-secondary/50'
                  }`}
                  aria-label={`View image ${index + 1}`}
                  aria-current={index === currentIndex}
                >
                  <Image
                    data={image}
                    className="w-full h-full object-cover"
                    loading="lazy"
                    sizes="63px"
                  />
                </button>
              ))}
            </div>
          </ScrollArea>
        )}

        {/* Main Image */}
        <div
          className="relative flex-1"
          role="region"
          aria-label="Product gallery"
          tabIndex={0}
          onKeyDown={handleKeyDown}
        >
          <div className="relative aspect-[345/397] rounded-[13px] overflow-hidden border border-[#edf0f8] bg-surface">
            {currentImage ? (
              <Image
                data={currentImage}
                className="w-full h-full object-cover"
                loading="eager"
                sizes="(min-width: 1024px) 33vw, 100vw"
              />
            ) : (
              <div className="flex items-center justify-center h-full text-text-muted">
                <ImageIcon size={64} />
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`flex flex-col ${className}`}>
      {/* Main Image */}
      <div
        className="relative"
        role="region"
        aria-label="Product gallery"
        tabIndex={0}
        onKeyDown={handleKeyDown}
      >
        <div className="relative aspect-[4/5] rounded-lg overflow-hidden bg-surface">
          {currentImage ? (
            <Image
              data={currentImage}
              className="w-full h-full object-cover"
              loading="eager"
              sizes="(min-width: 1024px) 50vw, 100vw"
            />
          ) : (
            <div className="flex items-center justify-center h-full text-text-muted">
              <ImageIcon size={64} />
            </div>
          )}
        </div>
      </div>

      {/* Horizontal Thumbnails */}
      {hasMultipleImages && (
        <div className="mt-4 flex items-center gap-2">
          {/* Left Arrow */}
          <button
            onClick={() => scrollThumbnails('left')}
            className="flex shrink-0 items-center justify-center w-8 h-8 rounded-full border border-border text-text-muted hover:text-text hover:border-primary transition-colors"
            aria-label="Scroll thumbnails left"
          >
            <ChevronLeft size={16} />
          </button>

          {/* Thumbnail Strip */}
          <div ref={thumbnailsRef} className="flex gap-3 overflow-x-auto">
            {images.map((image, index) => (
              <button
                key={image.id}
                onClick={() => goToImage(index)}
                className={`relative shrink-0 w-[88px] h-[88px] rounded-lg overflow-hidden border-2 transition-colors ${
                  index === currentIndex
                    ? 'border-primary'
                    : 'border-transparent hover:border-primary/50'
                }`}
                aria-label={`View image ${index + 1}`}
                aria-current={index === currentIndex}
              >
                <Image
                  data={image}
                  className="w-full h-full object-cover"
                  loading="lazy"
                  sizes="88px"
                />
              </button>
            ))}
          </div>

          {/* Right Arrow */}
          <button
            onClick={() => scrollThumbnails('right')}
            className="flex shrink-0 items-center justify-center w-8 h-8 rounded-full border border-border text-text-muted hover:text-text hover:border-primary transition-colors"
            aria-label="Scroll thumbnails right"
          >
            <ChevronRight size={16} />
          </button>
        </div>
      )}
    </div>
  );
}

export default ProductGallery;
