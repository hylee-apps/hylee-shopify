import {useState, useEffect, useRef, useCallback} from 'react';
import {Link, useRouteLoaderData} from 'react-router';
import {X, ChevronLeft, ChevronRight, Tag} from 'lucide-react';
import type {RootLoader} from '~/root';

const SESSION_KEY = 'hylee_promo_banner_dismissed';
const INTERVAL_MS = 4000;

export function AnnouncementBanner() {
  const data = useRouteLoaderData<RootLoader>('root');
  const discounts = data?.bannerDiscounts ?? [];

  const [visible, setVisible] = useState(false);
  const [current, setCurrent] = useState(0);
  const paused = useRef(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const touchStartX = useRef<number | null>(null);

  useEffect(() => {
    if (!discounts.length) return;
    if (
      typeof sessionStorage !== 'undefined' &&
      sessionStorage.getItem(SESSION_KEY)
    )
      return;
    setVisible(true);
  }, [discounts.length]);

  const advance = useCallback(
    (dir: 1 | -1 = 1) => {
      setCurrent((c) => (c + dir + discounts.length) % discounts.length);
    },
    [discounts.length],
  );

  useEffect(() => {
    if (!visible || discounts.length <= 1) return;
    timerRef.current = setInterval(() => {
      if (!paused.current) advance(1);
    }, INTERVAL_MS);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [visible, advance, discounts.length]);

  function dismiss() {
    if (typeof sessionStorage !== 'undefined') {
      sessionStorage.setItem(SESSION_KEY, '1');
    }
    setVisible(false);
  }

  function handleTouchStart(e: React.TouchEvent) {
    touchStartX.current = e.touches[0].clientX;
  }

  function handleTouchEnd(e: React.TouchEvent) {
    if (touchStartX.current === null) return;
    const delta = e.changedTouches[0].clientX - touchStartX.current;
    if (Math.abs(delta) > 40) advance(delta < 0 ? 1 : -1);
    touchStartX.current = null;
  }

  if (!visible || !discounts.length) return null;

  const discount = discounts[current];
  const showArrows = discounts.length > 1;

  return (
    <div
      data-testid="announcement-banner"
      className="bg-primary text-white text-sm relative select-none"
      onMouseEnter={() => {
        paused.current = true;
      }}
      onMouseLeave={() => {
        paused.current = false;
      }}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      <div className="max-w-screen-2xl mx-auto px-10 py-2 flex items-center justify-center gap-3 min-h-[36px]">
        {showArrows && (
          <button
            type="button"
            onClick={() => advance(-1)}
            aria-label="Previous offer"
            className="shrink-0 opacity-80 hover:opacity-100 transition-opacity hidden sm:block"
          >
            <ChevronLeft size={16} />
          </button>
        )}

        <p className="text-center font-medium leading-tight">
          {discount.title}
          {' — '}
          <Link
            to="/collections/discounts"
            className="inline-flex items-center gap-1 font-semibold underline underline-offset-2 hover:no-underline"
          >
            <Tag size={12} />
            {discount.code}
          </Link>
        </p>

        {showArrows && (
          <button
            type="button"
            onClick={() => advance(1)}
            aria-label="Next offer"
            className="shrink-0 opacity-80 hover:opacity-100 transition-opacity hidden sm:block"
          >
            <ChevronRight size={16} />
          </button>
        )}
      </div>

      {showArrows && (
        <div className="flex justify-center gap-1.5 pb-1.5 -mt-0.5">
          {discounts.map((_, i) => (
            <button
              key={i}
              type="button"
              onClick={() => setCurrent(i)}
              aria-label={`Go to offer ${i + 1}`}
              className={`h-1.5 rounded-full transition-all ${
                i === current ? 'w-4 bg-white' : 'w-1.5 bg-white/50'
              }`}
            />
          ))}
        </div>
      )}

      <button
        type="button"
        onClick={dismiss}
        aria-label="Dismiss banner"
        className="absolute right-3 top-1/2 -translate-y-1/2 opacity-70 hover:opacity-100 transition-opacity p-1"
      >
        <X size={14} />
      </button>
    </div>
  );
}
