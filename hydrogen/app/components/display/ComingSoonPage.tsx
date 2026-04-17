import {Link} from 'react-router';
import {useTranslation} from 'react-i18next';
import {Clock, ArrowRight, Home} from 'lucide-react';

// ============================================================================
// ComingSoonPage
//
// Shown when a route's primary content (collection, page, blog) does not yet
// exist or has no publishable products. Keeps the experience branded and
// professional instead of serving a bare 404.
// ============================================================================

interface ComingSoonPageProps {
  /**
   * Slug / handle of the missing resource (e.g. "discounts", "what-s-new").
   * Humanised for display. Falls back to the generic i18n heading if omitted.
   */
  handle?: string;
  /**
   * Optional override for the display title (already formatted).
   * Takes precedence over handle humanisation.
   */
  title?: string;
}

function humanise(slug: string) {
  return slug
    .split(/[-_]/)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');
}

export function ComingSoonPage({handle, title}: ComingSoonPageProps) {
  const {t} = useTranslation();

  const displayTitle =
    title ?? (handle ? humanise(handle) : t('comingSoon.defaultTitle'));

  return (
    <div className="flex min-h-[70vh] flex-col">
      {/* Dark hero — mirrors About / collections/all hero style */}
      <section className="relative flex flex-1 items-center bg-dark px-4 py-20 sm:px-6 lg:px-8">
        {/* Decorative teal glow */}
        <div
          className="pointer-events-none absolute inset-0 opacity-20"
          style={{
            background:
              'radial-gradient(ellipse 60% 50% at 70% 50%, #2699a6, transparent)',
          }}
          aria-hidden
        />

        <div className="relative mx-auto w-full max-w-screen-2xl">
          {/* Clock icon badge */}
          <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-secondary/20">
            <Clock size={28} className="text-secondary" />
          </div>

          <p className="mb-3 text-sm font-bold uppercase tracking-widest text-secondary">
            {t('comingSoon.eyebrow')}
          </p>

          <h1 className="text-4xl font-black leading-tight tracking-tight text-white sm:text-5xl lg:text-6xl">
            {displayTitle}
          </h1>

          <p className="mt-5 max-w-md text-lg leading-relaxed text-white/65">
            {t('comingSoon.body')}
          </p>

          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              to="/collections/all"
              className="inline-flex items-center gap-2 rounded-full bg-primary px-7 py-3 text-sm font-semibold text-white shadow-md transition hover:bg-primary/90"
            >
              {t('comingSoon.ctaShop')}
              <ArrowRight size={16} />
            </Link>
            <Link
              to="/"
              className="inline-flex items-center gap-2 rounded-full border border-white/30 px-7 py-3 text-sm font-semibold text-white/80 transition hover:border-white/60 hover:text-white"
            >
              <Home size={16} />
              {t('comingSoon.ctaHome')}
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

export default ComingSoonPage;
