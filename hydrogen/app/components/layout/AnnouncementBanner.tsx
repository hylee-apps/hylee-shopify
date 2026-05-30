import {useState, useEffect, useRef, useCallback} from 'react';
import {Link} from 'react-router';
import {X, ChevronLeft, ChevronRight} from 'lucide-react';
import {useTranslation} from 'react-i18next';

const SESSION_KEY = 'hylee_promo_banner_dismissed';

interface Tier {
  key: string;
  href: string;
  external?: boolean;
}

const TIERS: Tier[] = [
  {key: 'firstOrder', href: '/collections/all'},
  {key: 'newsletter', href: '/#newsletter'},
  {key: 'accountCreation', href: '/account/register'},
  {key: 'referral', href: '/account'},
];

const INTERVAL_MS = 4000;

export function AnnouncementBanner() {
  const {t} = useTranslation();
  const [visible, setVisible] = useState(false);
  const [current, setCurrent] = useState(0);
  const paused = useRef(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  // Touch tracking for swipe
  const touchStartX = useRef<number | null>(null);

  useEffect(() => {
    if (
      typeof sessionStorage !== 'undefined' &&
      sessionStorage.getItem(SESSION_KEY)
    )
      return;
    setVisible(true);
  }, []);

  const advance = useCallback((dir: 1 | -1 = 1) => {
    setCurrent((c) => (c + dir + TIERS.length) % TIERS.length);
  }, []);

  useEffect(() => {
    if (!visible) return;
    timerRef.current = setInterval(() => {
      if (!paused.current) advance(1);
    }, INTERVAL_MS);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [visible, advance]);

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

  if (!visible) return null;

  const tier = TIERS[current];

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
        {/* Prev arrow */}
        <button
          type="button"
          onClick={() => advance(-1)}
          aria-label={t('announcementBanner.prev')}
          className="shrink-0 opacity-80 hover:opacity-100 transition-opacity hidden sm:block"
        >
          <ChevronLeft size={16} />
        </button>

        {/* Message */}
        <p className="text-center font-medium leading-tight flex-1">
          {t(`announcementBanner.${tier.key}.message`)}{' '}
          <Link
            to={tier.href}
            className="underline underline-offset-2 font-semibold hover:no-underline"
          >
            {t(`announcementBanner.${tier.key}.cta`)}
          </Link>
        </p>

        {/* Next arrow */}
        <button
          type="button"
          onClick={() => advance(1)}
          aria-label={t('announcementBanner.next')}
          className="shrink-0 opacity-80 hover:opacity-100 transition-opacity hidden sm:block"
        >
          <ChevronRight size={16} />
        </button>
      </div>

      {/* Dot indicators */}
      <div className="flex justify-center gap-1.5 pb-1.5 -mt-0.5">
        {TIERS.map((_, i) => (
          <button
            key={i}
            type="button"
            onClick={() => setCurrent(i)}
            aria-label={t('announcementBanner.goToSlide', {n: i + 1})}
            className={`h-1.5 rounded-full transition-all ${
              i === current ? 'w-4 bg-white' : 'w-1.5 bg-white/50'
            }`}
          />
        ))}
      </div>

      {/* Dismiss */}
      <button
        type="button"
        onClick={dismiss}
        aria-label={t('announcementBanner.dismiss')}
        className="absolute right-3 top-1/2 -translate-y-1/2 opacity-70 hover:opacity-100 transition-opacity p-1"
      >
        <X size={14} />
      </button>
    </div>
  );
}
