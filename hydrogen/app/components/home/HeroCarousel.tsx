import {useState, useEffect, useCallback, useRef} from 'react';
import {Link} from 'react-router';

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
  /** Primary headline text (from hero_slide.headline metafield). */
  headline?: string;
  /** Supporting subheadline text (from hero_slide.subheadline metafield). */
  subheadline?: string;
  /** CTA button label (from hero_slide.cta_label metafield). */
  ctaLabel?: string;
  /** CTA button destination URL (from hero_slide.cta_url metafield). */
  ctaUrl?: string;
}

interface HeroCarouselProps {
  slides: CarouselSlide[];
  /** Auto-advance interval in ms. 0 = disabled. Default: 4500 */
  interval?: number;
}

// Duration of the crossfade between slides (ms)
const FADE_MS = 500;

export function HeroCarousel({slides, interval = 4500}: HeroCarouselProps) {
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

  const slide = slides[current];

  return (
    <div
      className="relative w-full overflow-hidden"
      aria-roledescription="carousel"
      aria-label="Featured promotions"
    >
      <div
        className="relative flex w-full aspect-video max-h-screen items-center justify-center"
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
           30 — dots
        */}
        {slides.map((s, i) => {
          const isCurrent = i === current;
          const isPrev = i === prev;

          return (
            <div
              key={s.id}
              className="absolute inset-0 transition-opacity"
              style={{
                opacity: isCurrent || isPrev ? 1 : 0,
                zIndex: isCurrent ? 2 : isPrev ? 1 : 0,
                transitionDuration: `${FADE_MS}ms`,
                pointerEvents: isCurrent ? 'auto' : 'none',
                backgroundColor: s.bgColor ?? 'var(--color-hero)',
                backgroundImage:
                  !s.videoUrl && s.backgroundImage
                    ? `url('${s.backgroundImage}')`
                    : undefined,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
              }}
            >
              {s.videoUrl && (
                <video
                  className="absolute inset-0 size-full object-cover"
                  autoPlay
                  muted
                  loop
                  playsInline
                  preload="auto"
                  poster={s.backgroundImage}
                  aria-hidden="true"
                >
                  <source src={s.videoUrl} type="video/mp4" />
                </video>
              )}
            </div>
          );
        })}

        {/* Scrim — slightly heavier than default for text legibility */}
        <div
          className="absolute inset-0 bg-black/40 pointer-events-none"
          style={{zIndex: 10}}
          aria-hidden="true"
        />

        {/* ── Variant A: Centered Editorial ─────────────────────────────────
            Headline → subheadline → CTA, all centered.
            Logo removed — it lives in the header.
            Search bar removed — it lives in the header.
        ─────────────────────────────────────────────────────────────────── */}
        <div
          className="relative flex flex-col items-center gap-5 px-6 text-center sm:px-16 lg:px-32 w-full"
          style={{zIndex: 20}}
        >
          {slide.headline && (
            <h2 className="text-3xl font-black leading-tight tracking-tight text-white sm:text-5xl lg:text-6xl drop-shadow-lg">
              {slide.headline}
            </h2>
          )}
          {slide.subheadline && (
            <p className="max-w-2xl text-base font-medium text-white/80 sm:text-lg lg:text-xl drop-shadow">
              {slide.subheadline}
            </p>
          )}
          {slide.ctaLabel && slide.ctaUrl && (
            <Link
              to={slide.ctaUrl}
              className="mt-2 inline-flex items-center gap-2 rounded-full bg-primary px-8 py-3 text-sm font-bold text-white shadow-lg transition-colors hover:bg-primary/90 focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 sm:text-base sm:px-10 sm:py-4"
            >
              {slide.ctaLabel}
            </Link>
          )}
        </div>

        {/* Slide dot navigation */}
        {count > 1 && (
          <div
            className="absolute bottom-5 flex gap-2 items-center justify-center w-full"
            style={{zIndex: 30}}
          >
            {slides.map((s, i) => (
              <button
                key={s.id}
                type="button"
                onClick={() => setCurrent(i)}
                aria-label={`Go to slide ${i + 1}`}
                className={`rounded-full transition-all ${
                  i === current
                    ? 'w-6 h-2 bg-white'
                    : 'w-2 h-2 bg-white/50 hover:bg-white/75'
                }`}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
