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

  useEffect(() => {
    if (interval <= 0 || count <= 1) return;
    autoTimerRef.current = setInterval(next, interval);
    return () => {
      if (autoTimerRef.current) clearInterval(autoTimerRef.current);
    };
  }, [next, interval, count]);

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    if (mq.matches && autoTimerRef.current) clearInterval(autoTimerRef.current);
  }, []);

  useEffect(() => {
    return () => {
      if (prevTimerRef.current) clearTimeout(prevTimerRef.current);
    };
  }, []);

  if (!count) return null;

  const slide = slides[current];
  const hasContent = slide.headline || slide.subheadline || slide.ctaLabel;

  return (
    <div
      className="relative w-full overflow-hidden"
      aria-roledescription="carousel"
      aria-label="Featured promotions"
    >
      <div
        className="relative w-full aspect-video max-h-screen"
        aria-roledescription="slide"
        aria-label={`Slide ${current + 1} of ${count}`}
      >
        {/*
          z-index layering:
            0 — hidden slides
            1 — outgoing slide
            2 — current/incoming slide
           10 — left panel
           20 — dot navigation
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

        {/* ── Variant B: Left-Aligned Panel ────────────────────────────────
            Semi-transparent dark panel on the left; the right half of the
            background image is fully unobscured. Two CTAs: primary + ghost.
        ─────────────────────────────────────────────────────────────────── */}
        {hasContent && (
          <div
            className="absolute inset-y-0 left-0 flex items-center"
            style={{zIndex: 10}}
          >
            <div className="m-6 flex flex-col gap-5 rounded-r-2xl bg-black/55 p-8 backdrop-blur-sm sm:m-10 sm:p-10 lg:m-14 lg:max-w-lg lg:p-12">
              {slide.headline && (
                <h2 className="text-3xl font-black leading-tight tracking-tight text-white sm:text-4xl lg:text-5xl">
                  {slide.headline}
                </h2>
              )}
              {slide.subheadline && (
                <p className="text-sm font-medium leading-relaxed text-white/80 sm:text-base">
                  {slide.subheadline}
                </p>
              )}
              {(slide.ctaLabel || slide.ctaUrl) && (
                <div className="flex flex-wrap gap-3 pt-1">
                  {slide.ctaLabel && slide.ctaUrl && (
                    <Link
                      to={slide.ctaUrl}
                      className="inline-flex items-center rounded-full bg-primary px-6 py-2.5 text-sm font-bold text-white shadow transition-colors hover:bg-primary/90 focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
                    >
                      {slide.ctaLabel}
                    </Link>
                  )}
                  <Link
                    to="/categories"
                    className="inline-flex items-center rounded-full border border-white/60 px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-white/10 focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2"
                  >
                    Browse Categories
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Dot navigation */}
        {count > 1 && (
          <div
            className="absolute bottom-5 flex w-full items-center justify-center gap-2"
            style={{zIndex: 20}}
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
