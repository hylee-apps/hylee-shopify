'use client';

import {useState, useCallback, useRef, useEffect} from 'react';
import {Image} from '@shopify/hydrogen';
import {useTranslation} from 'react-i18next';
import type {ProductVariant} from '@shopify/hydrogen/storefront-api-types';
import {ImageIcon, ChevronLeft, ChevronRight, X} from 'lucide-react';
import {Dialog, DialogContent, DialogTitle} from '~/components/ui/dialog';

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
  const {t} = useTranslation();
  // Start with variant image index if available
  const initialIndex = selectedVariant?.image
    ? images.findIndex((img) => img.id === selectedVariant.image?.id)
    : 0;

  const [currentIndex, setCurrentIndex] = useState(Math.max(0, initialIndex));
  const [lightboxOpen, setLightboxOpen] = useState(false);
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

  // Keyboard navigation for lightbox (arrow keys, Escape)
  useEffect(() => {
    if (!lightboxOpen) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === 'ArrowLeft') goToPrevious();
      else if (e.key === 'ArrowRight') goToNext();
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [lightboxOpen, goToPrevious, goToNext]);

  const lightbox = (
    <Dialog open={lightboxOpen} onOpenChange={setLightboxOpen}>
      <DialogContent className="max-w-5xl w-full bg-black/95 border-none p-0 flex items-center justify-center">
        <DialogTitle className="sr-only">
          {t('productGallery.lightboxTitle')}
        </DialogTitle>
        <button
          onClick={() => setLightboxOpen(false)}
          className="absolute top-4 right-4 z-10 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
          aria-label={t('productGallery.closeLightbox')}
        >
          <X size={20} />
        </button>
        {hasMultipleImages && (
          <button
            onClick={goToPrevious}
            className="absolute left-4 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
            aria-label={t('productGallery.previousImage')}
          >
            <ChevronLeft size={24} />
          </button>
        )}
        {currentImage && (
          <Image
            data={currentImage}
            className="max-h-[85vh] w-auto object-contain"
            loading="eager"
            sizes="90vw"
          />
        )}
        {hasMultipleImages && (
          <button
            onClick={goToNext}
            className="absolute right-4 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
            aria-label={t('productGallery.nextImage')}
          >
            <ChevronRight size={24} />
          </button>
        )}
        {hasMultipleImages && (
          <div className="absolute bottom-4 flex gap-1.5">
            {images.map((_, i) => (
              <button
                key={i}
                onClick={() => goToImage(i)}
                className={`w-2 h-2 rounded-full transition-colors ${i === currentIndex ? 'bg-white' : 'bg-white/40 hover:bg-white/70'}`}
                aria-label={t('productGallery.thumbnailAriaLabel', {
                  number: i + 1,
                })}
              />
            ))}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );

  if (layout === 'vertical') {
    return (
      <>
        {lightbox}
        <div className={`flex flex-row gap-3 ${className}`}>
          {/* Vertical Thumbnail Strip */}
          {hasMultipleImages && (
            <div className="flex max-h-120.5 flex-col gap-2.5 overflow-y-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              {images.map((image, index) => (
                <button
                  key={image.id}
                  onClick={() => {
                    goToImage(index);
                    setLightboxOpen(true);
                  }}
                  className={`relative shrink-0 w-15.75 h-18 rounded-[11px] overflow-hidden border-2 transition-colors ${
                    index === currentIndex
                      ? 'border-secondary'
                      : 'border-transparent hover:border-secondary/50'
                  }`}
                  aria-label={t('productGallery.thumbnailAriaLabel', {
                    number: index + 1,
                  })}
                  aria-current={index === currentIndex}
                >
                  <Image
                    data={image}
                    className="w-full h-full object-contain"
                    loading="lazy"
                    sizes="63px"
                  />
                </button>
              ))}
            </div>
          )}

          {/* Main Image — click to open lightbox */}
          <div
            className="relative flex-1"
            role="region"
            aria-label={t('productGallery.ariaLabel')}
            tabIndex={0}
            onKeyDown={handleKeyDown}
          >
            <button
              className="w-full rounded-[13px] overflow-hidden border border-[#edf0f8] bg-surface cursor-zoom-in block"
              onClick={() => setLightboxOpen(true)}
              aria-label={t('productGallery.zoomImage')}
            >
              {currentImage ? (
                <Image
                  data={currentImage}
                  className="w-full h-auto"
                  loading="eager"
                  sizes="(min-width: 1024px) 33vw, 100vw"
                />
              ) : (
                <div className="flex items-center justify-center min-h-[300px] text-text-muted">
                  <ImageIcon size={64} />
                </div>
              )}
            </button>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      {lightbox}
      <div className={`flex flex-col ${className}`}>
        {/* Main Image — click to open lightbox */}
        <div
          className="relative"
          role="region"
          aria-label={t('productGallery.ariaLabel')}
          tabIndex={0}
          onKeyDown={handleKeyDown}
        >
          <button
            className="w-full rounded-lg overflow-hidden bg-surface cursor-zoom-in block"
            onClick={() => setLightboxOpen(true)}
            aria-label={t('productGallery.zoomImage')}
          >
            {currentImage ? (
              <Image
                data={currentImage}
                className="w-full h-auto"
                loading="eager"
                sizes="(min-width: 1024px) 50vw, 100vw"
              />
            ) : (
              <div className="flex items-center justify-center min-h-75 text-text-muted">
                <ImageIcon size={64} />
              </div>
            )}
          </button>
        </div>

        {/* Horizontal Thumbnails */}
        {hasMultipleImages && (
          <div className="mt-4 flex items-center gap-2">
            {/* Left Arrow */}
            <button
              onClick={() => scrollThumbnails('left')}
              className="flex shrink-0 items-center justify-center w-8 h-8 rounded-full border border-border text-text-muted hover:text-text hover:border-primary transition-colors"
              aria-label={t('productGallery.scrollLeft')}
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
                  aria-label={t('productGallery.thumbnailAriaLabel', {
                    number: index + 1,
                  })}
                  aria-current={index === currentIndex}
                >
                  <Image
                    data={image}
                    className="w-full h-full object-contain"
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
              aria-label={t('productGallery.scrollRight')}
            >
              <ChevronRight size={16} />
            </button>
          </div>
        )}
      </div>
    </>
  );
}

export default ProductGallery;
