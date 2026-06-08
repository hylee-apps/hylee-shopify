import {useState, useEffect, useCallback, useRef} from 'react';

export interface CarouselSlide {
  id: string;
  /** Background image URL. Used as CSS background for image slides, and as
   *  the video poster (shown while the video loads) for video slides. */
  backgroundImage?: string;
  /** Shopify CDN (or any) .mp4 URL. When set, renders a muted looping video
   *  background instead of the static image. */
  videoUrl?: string;
  /** Fallback bg color shown only during true initial load (before any
   *  content has loaded). Never flashed during slide transitions. */
  bgColor?: string;
}

interface HeroCarouselProps {
  slides: CarouselSlide[];
  /** Auto-advance interval in ms. 0 = disabled. Default: 4500 */
  interval?: number;
  /** Rendered at the top of the content block (e.g. logo) */
  header?: React.ReactNode;
  /** Rendered between subheadline and CTA (e.g. search form) */
  footer?: React.ReactNode;
}

// Duration of the crossfade between slides (ms)
const FADE_MS = 500;

export function HeroCarousel({
  slides,
  interval = 4500,
  header,
  footer,
}: HeroCarouselProps) {
  const [current, setCurrent] = useState(0);
  // Index of the outgoing slide — kept at opacity 1 (beneath the incoming
  // slide) until the crossfade completes so the bgColor never shows through.
  const [prev, setPrev] = useState<number | null>(null);
  const autoTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const prevTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const count = slides.length;

  const next = useCallback(() => {
    setCurrent((c) => {
      setPrev(c);
      return (c + 1) % count;
    });
    if (prevTimerRef.current) clearTimeout(prevTimerRef.current);
    prevTimerRef.current = setTimeout(() => setPrev(null), FADE_MS + 100);
  }, [count]);

  // Auto-advance
  useEffect(() => {
    if (interval <= 0 || count <= 1) return;
    autoTimerRef.current = setInterval(next, interval);
    return () => {
      if (autoTimerRef.current) clearInterval(autoTimerRef.current);
    };
  }, [next, interval, count]);

  // Respect prefers-reduced-motion
  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    if (mq.matches && autoTimerRef.current) clearInterval(autoTimerRef.current);
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (prevTimerRef.current) clearTimeout(prevTimerRef.current);
    };
  }, []);

  if (!count) return null;

  return (
    <div
      className="relative w-full overflow-hidden"
      aria-roledescription="carousel"
      aria-label="Featured promotions"
    >
      <div
        className="relative flex w-full aspect-video max-h-screen items-center justify-center px-4 sm:px-[157px]"
        aria-roledescription="slide"
        aria-label={`Slide ${current + 1} of ${count}`}
      >
        {/*
          All slides render with stable keys so their <video> elements are
          mounted once and keep playing silently in the background. CSS
          transition-opacity fires on existing DOM elements when their inline
          opacity style changes — no remount, no re-load delay, no bgColor flash.

          z-index layering:
            0 — hidden slides (opacity 0, pointer-events none)
            1 — outgoing slide (stays fully visible beneath the incoming one)
            2 — current/incoming slide (fades 0→1 on top)
           10 — scrim
           20 — content
        */}
        {slides.map((slide, i) => {
          const isCurrent = i === current;
          const isPrev = i === prev;

          return (
            <div
              key={slide.id}
              className="absolute inset-0 transition-opacity"
              style={{
                opacity: isCurrent || isPrev ? 1 : 0,
                zIndex: isCurrent ? 2 : isPrev ? 1 : 0,
                transitionDuration: `${FADE_MS}ms`,
                pointerEvents: isCurrent ? 'auto' : 'none',
                backgroundColor: slide.bgColor ?? 'var(--color-hero)',
                backgroundImage:
                  !slide.videoUrl && slide.backgroundImage
                    ? `url('${slide.backgroundImage}')`
                    : undefined,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
              }}
            >
              {slide.videoUrl && (
                <video
                  className="absolute inset-0 size-full object-cover"
                  autoPlay
                  muted
                  loop
                  playsInline
                  preload="auto"
                  poster={slide.backgroundImage}
                  aria-hidden="true"
                >
                  <source src={slide.videoUrl} type="video/mp4" />
                </video>
              )}
            </div>
          );
        })}

        {/* Scrim */}
        <div
          className="absolute inset-0 bg-black/25 pointer-events-none"
          style={{zIndex: 10}}
          aria-hidden="true"
        />

        {/* Content */}
        <div
          className="relative flex flex-col items-center gap-4 px-4 text-center sm:px-[221px] w-full"
          style={{zIndex: 20}}
        >
          {header}
          {footer}
        </div>
      </div>
    </div>
  );
}
