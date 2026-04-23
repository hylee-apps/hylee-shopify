'use client';

import {useState, useCallback, useRef, useEffect} from 'react';
import {Image} from '@shopify/hydrogen';
import {useTranslation} from 'react-i18next';
import type {ProductVariant} from '@shopify/hydrogen/storefront-api-types';
import {
  ImageIcon,
  ChevronLeft,
  ChevronRight,
  X,
  ZoomIn,
  ZoomOut,
} from 'lucide-react';
import * as DialogPrimitive from '@radix-ui/react-dialog';
import {Dialog, DialogPortal, DialogTitle} from '~/components/ui/dialog';

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
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const thumbnailsRef = useRef<HTMLDivElement>(null);
  const panRef = useRef<HTMLDivElement>(null);
  const dragState = useRef({
    active: false,
    didDrag: false,
    x: 0,
    y: 0,
    scrollLeft: 0,
    scrollTop: 0,
  });

  const currentImage = images[currentIndex];
  const lightboxImage = images[lightboxIndex];
  const hasMultipleImages = images.length > 1;

  // Gallery navigation (PDP carousel only)
  const goToImage = useCallback(
    (index: number) => {
      if (index >= 0 && index < images.length) setCurrentIndex(index);
    },
    [images.length],
  );

  const goToPrevious = useCallback(() => {
    setCurrentIndex((prev) => (prev > 0 ? prev - 1 : images.length - 1));
  }, [images.length]);

  const goToNext = useCallback(() => {
    setCurrentIndex((prev) => (prev < images.length - 1 ? prev + 1 : 0));
  }, [images.length]);

  // Lightbox navigation (independent)
  const lightboxGoTo = useCallback(
    (index: number) => {
      if (index >= 0 && index < images.length) setLightboxIndex(index);
    },
    [images.length],
  );

  const lightboxPrevious = useCallback(() => {
    setLightboxIndex((prev) => (prev > 0 ? prev - 1 : images.length - 1));
  }, [images.length]);

  const lightboxNext = useCallback(() => {
    setLightboxIndex((prev) => (prev < images.length - 1 ? prev + 1 : 0));
  }, [images.length]);

  const openLightbox = useCallback((index: number) => {
    setLightboxIndex(index);
    setLightboxOpen(true);
  }, []);

  const scrollThumbnails = useCallback((direction: 'left' | 'right') => {
    if (!thumbnailsRef.current) return;
    thumbnailsRef.current.scrollBy({
      left: direction === 'left' ? -200 : 200,
      behavior: 'smooth',
    });
  }, []);

  // Keyboard navigation for gallery
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'ArrowLeft') goToPrevious();
      else if (e.key === 'ArrowRight') goToNext();
    },
    [goToPrevious, goToNext],
  );

  // Keyboard navigation for lightbox
  useEffect(() => {
    if (!lightboxOpen) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === 'ArrowLeft') lightboxPrevious();
      else if (e.key === 'ArrowRight') lightboxNext();
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [lightboxOpen, lightboxPrevious, lightboxNext]);

  const MAX_ZOOM = 3;
  const [zoomLevel, setZoomLevel] = useState(1);
  const isZoomed = zoomLevel > 1;

  const zoomIn = useCallback(
    () => setZoomLevel((z) => Math.min(z + 1, MAX_ZOOM)),
    [],
  );
  const zoomOut = useCallback(
    () => setZoomLevel((z) => Math.max(z - 1, 1)),
    [],
  );

  // Reset zoom when lightbox image changes or lightbox closes
  useEffect(() => {
    setZoomLevel(1);
  }, [lightboxIndex, lightboxOpen]);

  const lightbox = (
    <Dialog open={lightboxOpen} onOpenChange={setLightboxOpen}>
      <DialogPortal>
        {/* Semi-transparent backdrop */}
        <DialogPrimitive.Overlay className="fixed inset-0 z-1030 bg-black/75" />

        {/* Centered modal card */}
        <DialogPrimitive.Content
          className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-1030 outline-none w-[min(560px,90vw)]"
          aria-describedby={undefined}
        >
          <DialogTitle className="sr-only">
            {t('productGallery.lightboxTitle')}
          </DialogTitle>

          {/* Card — explicit h-[85vh] so flex-1 on image area resolves to a real pixel height */}
          <div className="relative bg-white rounded-2xl border border-gray-200 shadow-2xl overflow-hidden flex flex-col h-[85vh]">
            {/* Top bar: counter + zoom controls + close */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
              <span className="text-sm font-medium text-gray-500">
                {lightboxIndex + 1} / {images.length}
              </span>
              <div className="flex items-center gap-2">
                {/* Zoom out */}
                <button
                  onClick={zoomOut}
                  disabled={zoomLevel === 1}
                  className="p-2 rounded-full bg-gray-900 hover:bg-gray-700 text-white shadow transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                  aria-label={t('productGallery.zoomOut')}
                >
                  <ZoomOut size={18} />
                </button>

                {/* Zoom level indicator */}
                <span className="text-sm font-semibold text-gray-700 w-8 text-center tabular-nums">
                  {zoomLevel}×
                </span>

                {/* Zoom in */}
                <button
                  onClick={zoomIn}
                  disabled={zoomLevel === MAX_ZOOM}
                  className="p-2 rounded-full bg-gray-900 hover:bg-gray-700 text-white shadow transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                  aria-label={t('productGallery.zoomIn')}
                >
                  <ZoomIn size={18} />
                </button>

                <div className="w-px h-5 bg-gray-200 mx-1" />

                {/* Close */}
                <button
                  onClick={() => setLightboxOpen(false)}
                  className="p-2 rounded-full bg-gray-900 hover:bg-gray-700 text-white shadow transition-colors"
                  aria-label={t('productGallery.closeLightbox')}
                >
                  <X size={18} />
                </button>
              </div>
            </div>

            {/* Image area — flex-1; panRef is absolute so it gets a true bounded height */}
            <div className="relative flex-1 bg-gray-50 min-h-0 overflow-hidden">
              {/* panRef: absolute inset-0 gives a real pixel height independent of flex % resolution */}
              <div
                ref={panRef}
                className={`absolute inset-0 select-none ${
                  isZoomed
                    ? 'overflow-auto cursor-grab active:cursor-grabbing'
                    : 'overflow-hidden cursor-zoom-in flex items-center justify-center'
                }`}
                onMouseDown={(e) => {
                  dragState.current.didDrag = false;
                  if (!isZoomed) return;
                  e.preventDefault();
                  const el = panRef.current;
                  if (!el) return;
                  dragState.current = {
                    active: true,
                    didDrag: false,
                    x: e.clientX,
                    y: e.clientY,
                    scrollLeft: el.scrollLeft,
                    scrollTop: el.scrollTop,
                  };
                }}
                onMouseMove={(e) => {
                  const ds = dragState.current;
                  if (!ds.active || !panRef.current) return;
                  const dx = e.clientX - ds.x;
                  const dy = e.clientY - ds.y;
                  if (Math.abs(dx) > 2 || Math.abs(dy) > 2) ds.didDrag = true;
                  panRef.current.scrollLeft = ds.scrollLeft - dx;
                  panRef.current.scrollTop = ds.scrollTop - dy;
                }}
                onMouseUp={() => {
                  dragState.current.active = false;
                }}
                onMouseLeave={() => {
                  dragState.current.active = false;
                }}
                onClick={() => {
                  if (dragState.current.didDrag) return;
                  zoomIn();
                }}
              >
                {/* Inner wrapper: p-12 + explicit width creates real scroll content in both axes */}
                <div
                  className={isZoomed ? 'p-12' : 'max-w-full max-h-full'}
                  style={isZoomed ? {width: `${zoomLevel * 100}%`} : undefined}
                >
                  {lightboxImage && (
                    <Image
                      data={lightboxImage}
                      className={`h-auto transition-all duration-300 ${
                        isZoomed
                          ? 'w-full'
                          : 'max-h-[75vh] max-w-full object-contain'
                      }`}
                      loading="eager"
                      sizes="560px"
                      draggable={false}
                    />
                  )}
                </div>
              </div>

              {/* Nav arrows sit above the panRef */}
              {hasMultipleImages && (
                <button
                  onClick={lightboxPrevious}
                  className="absolute left-3 top-1/2 -translate-y-1/2 z-20 p-2.5 rounded-full bg-gray-900 hover:bg-gray-700 text-white shadow-lg transition-colors"
                  aria-label={t('productGallery.previousImage')}
                >
                  <ChevronLeft size={22} />
                </button>
              )}

              {hasMultipleImages && (
                <button
                  onClick={lightboxNext}
                  className="absolute right-3 top-1/2 -translate-y-1/2 z-20 p-2.5 rounded-full bg-gray-900 hover:bg-gray-700 text-white shadow-lg transition-colors"
                  aria-label={t('productGallery.nextImage')}
                >
                  <ChevronRight size={22} />
                </button>
              )}
            </div>

            {/* Dot indicators */}
            {hasMultipleImages && (
              <div className="flex justify-center gap-2 py-3 border-t border-gray-100">
                {images.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => lightboxGoTo(i)}
                    className={`w-2 h-2 rounded-full transition-colors ${
                      i === lightboxIndex
                        ? 'bg-gray-900'
                        : 'bg-gray-300 hover:bg-gray-500'
                    }`}
                    aria-label={t('productGallery.thumbnailAriaLabel', {
                      number: i + 1,
                    })}
                  />
                ))}
              </div>
            )}
          </div>
        </DialogPrimitive.Content>
      </DialogPortal>
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
                  onClick={() => goToImage(index)}
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
              className="w-full h-[480px] rounded-[13px] overflow-hidden border border-[#edf0f8] bg-surface cursor-zoom-in flex items-center justify-center"
              onClick={() => openLightbox(currentIndex)}
              aria-label={t('productGallery.zoomImage')}
            >
              {currentImage ? (
                <Image
                  data={currentImage}
                  className="max-w-full max-h-full object-contain"
                  loading="eager"
                  sizes="(min-width: 1024px) 33vw, 100vw"
                />
              ) : (
                <div className="text-text-muted">
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
            onClick={() => openLightbox(currentIndex)}
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
              className="flex shrink-0 items-center justify-center w-8 h-8 rounded-full bg-gray-900 hover:bg-gray-700 text-white shadow-sm transition-colors"
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
              className="flex shrink-0 items-center justify-center w-8 h-8 rounded-full bg-gray-900 hover:bg-gray-700 text-white shadow-sm transition-colors"
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
