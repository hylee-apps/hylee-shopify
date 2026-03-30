import {useState, useEffect, useCallback, useRef} from 'react';
import {Link} from 'react-router';
import {
  ChevronLeft,
  ChevronRight,
  X,
  Tag,
  Package,
  Truck,
  Star,
} from 'lucide-react';

// ============================================================================
// Types
// ============================================================================

export type NotificationType = 'deal' | 'referral' | 'shipped' | 'delivered';

export interface AccountNotification {
  id: string;
  type: NotificationType;
  title: string;
  body: string;
  ctaLabel?: string;
  ctaUrl?: string;
}

interface AccountNotificationCarouselProps {
  notifications: AccountNotification[];
  /** Auto-advance interval in ms. Default: 5000. 0 = disabled. */
  interval?: number;
}

// ============================================================================
// Icon + color mapping per notification type
// ============================================================================

const TYPE_CONFIG: Record<
  NotificationType,
  {icon: React.ElementType; bg: string; iconColor: string}
> = {
  deal: {
    icon: Tag,
    bg: 'bg-secondary/10 border-secondary/20',
    iconColor: 'text-secondary',
  },
  referral: {
    icon: Star,
    bg: 'bg-primary/10 border-primary/20',
    iconColor: 'text-primary',
  },
  shipped: {
    icon: Truck,
    bg: 'bg-brand-accent/10 border-brand-accent/20',
    iconColor: 'text-brand-accent',
  },
  delivered: {
    icon: Package,
    bg: 'bg-green-50 border-green-200',
    iconColor: 'text-green-600',
  },
};

// ============================================================================
// Component
// ============================================================================

export function AccountNotificationCarousel({
  notifications,
  interval = 5000,
}: AccountNotificationCarouselProps) {
  const [visible, setVisible] = useState<AccountNotification[]>(notifications);
  const [current, setCurrent] = useState(0);
  const [paused, setPaused] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const count = visible.length;

  const next = useCallback(() => {
    setCurrent((c) => (c + 1) % count);
  }, [count]);

  const prev = useCallback(() => {
    setCurrent((c) => (c - 1 + count) % count);
  }, [count]);

  // Auto-advance
  useEffect(() => {
    if (interval <= 0 || paused || count <= 1) return;
    timerRef.current = setInterval(next, interval);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [next, interval, paused, count]);

  // Respect prefers-reduced-motion
  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    if (mq.matches) setPaused(true);
  }, []);

  function dismiss(id: string) {
    setVisible((prev) => {
      const next = prev.filter((n) => n.id !== id);
      // Keep current index in bounds after removal
      setCurrent((c) => Math.min(c, Math.max(next.length - 1, 0)));
      return next;
    });
  }

  if (!count) return null;

  const notification = visible[current];
  const config = TYPE_CONFIG[notification.type];
  const Icon = config.icon;

  return (
    <div
      className={`relative overflow-hidden rounded-xl border p-4 ${config.bg}`}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      aria-roledescription="carousel"
      aria-label="Account notifications"
    >
      <div
        className="flex items-start gap-3"
        aria-roledescription="slide"
        aria-label={`${current + 1} of ${count}: ${notification.title}`}
      >
        {/* Icon */}
        <div className="shrink-0 mt-0.5">
          <Icon size={18} className={config.iconColor} />
        </div>

        {/* Text */}
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-gray-900">
            {notification.title}
          </p>
          <p className="mt-0.5 text-sm text-text-muted leading-snug">
            {notification.body}
          </p>
          {notification.ctaLabel && notification.ctaUrl && (
            <Link
              to={notification.ctaUrl}
              className="mt-2 inline-block text-xs font-semibold text-secondary hover:underline"
            >
              {notification.ctaLabel} →
            </Link>
          )}
        </div>

        {/* Dismiss */}
        <button
          type="button"
          onClick={() => dismiss(notification.id)}
          aria-label="Dismiss notification"
          className="shrink-0 rounded p-0.5 text-gray-400 hover:text-gray-600 transition-colors"
        >
          <X size={14} />
        </button>
      </div>

      {/* Prev / Next + dots — only when multiple notifications */}
      {count > 1 && (
        <div className="mt-3 flex items-center justify-between">
          <div className="flex gap-1.5">
            {visible.map((_, i) => (
              <button
                key={i}
                type="button"
                onClick={() => setCurrent(i)}
                aria-label={`Go to notification ${i + 1}`}
                className={`h-1.5 rounded-full transition-all ${
                  i === current ? 'w-5 bg-secondary' : 'w-1.5 bg-gray-300'
                }`}
              />
            ))}
          </div>
          <div className="flex gap-1">
            <button
              type="button"
              onClick={prev}
              aria-label="Previous notification"
              className="rounded p-1 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <ChevronLeft size={14} />
            </button>
            <button
              type="button"
              onClick={next}
              aria-label="Next notification"
              className="rounded p-1 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <ChevronRight size={14} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
