import {useState, useEffect, useCallback, useRef} from 'react';

export interface CarouselSlide {
  id: string;
  backgroundImage: string;
  /** Fallback bg color while image loads */
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

export function HeroCarousel({
  slides,
  interval = 4500,
  header,
  footer,
}: HeroCarouselProps) {
  const [current, setCurrent] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const count = slides.length;

  const next = useCallback(() => {
    setCurrent((c) => (c + 1) % count);
  }, [count]);

  // Auto-advance
  useEffect(() => {
    if (interval <= 0 || count <= 1) return;
    timerRef.current = setInterval(next, interval);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [next, interval, count]);

  // Respect prefers-reduced-motion
  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    if (mq.matches) {
      if (timerRef.current) clearInterval(timerRef.current);
    }
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
        className="relative flex h-[522px] w-full items-center justify-center px-4 sm:px-[157px]"
        style={{
          backgroundColor: slide.bgColor ?? 'var(--color-hero)',
          backgroundImage: slide.backgroundImage
            ? `url('${slide.backgroundImage}')`
            : undefined,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
        aria-roledescription="slide"
        aria-label={`Slide ${current + 1} of ${count}`}
      >
        {/* Scrim */}
        <div
          className="absolute inset-0 bg-black/25 pointer-events-none"
          aria-hidden="true"
        />

        {/* Content */}
        <div className="relative z-10 flex flex-col items-center gap-4 px-4 text-center sm:px-[221px] w-full">
          {header}
          {footer}
        </div>
      </div>
    </div>
  );
}
