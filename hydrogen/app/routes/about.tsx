import {Link} from 'react-router';
import {useTranslation} from 'react-i18next';
import {ShieldCheck, Users, Sparkles, Eye, ArrowRight} from 'lucide-react';

// ============================================================================
// Meta
// ============================================================================

export function meta() {
  return [
    {title: 'About Us | Hy-lee'},
    {
      name: 'description',
      content:
        'Learn about Hy-lee — a modern marketplace built for small-space living.',
    },
  ];
}

// ============================================================================
// Data
// ============================================================================

const VALUE_ICONS = [Sparkles, Users, Eye, ShieldCheck] as const;

const VALUE_COLORS = [
  'bg-primary/10 text-primary',
  'bg-secondary/10 text-secondary',
  'bg-brand-accent/10 text-brand-accent',
  'bg-warning/10 text-warning',
] as const;

const VALUE_KEYS = ['curation', 'community', 'simplicity', 'trust'] as const;

// ============================================================================
// Section header — matches homepage product section style
// ============================================================================

function SectionHeader({eyebrow, heading}: {eyebrow: string; heading: string}) {
  return (
    <div className="mb-8">
      <p className="mb-2 text-sm font-semibold uppercase tracking-widest text-secondary">
        {eyebrow}
      </p>
      <div className="flex items-center gap-3 border-b-2 border-border pb-3">
        <span className="h-8 w-1 shrink-0 rounded-full bg-secondary" />
        <h2 className="text-[28px] font-bold leading-tight tracking-tight text-dark sm:text-[32px]">
          {heading}
        </h2>
      </div>
    </div>
  );
}

// ============================================================================
// Page Component
// ============================================================================

export default function AboutPage() {
  const {t} = useTranslation();

  return (
    <div className="overflow-x-hidden">
      {/* ================================================================ */}
      {/* HERO                                                              */}
      {/* ================================================================ */}
      <section className="relative bg-dark px-4 py-16 sm:px-6 sm:py-20 lg:px-8 lg:py-28">
        {/* Decorative teal glow */}
        <div
          className="pointer-events-none absolute inset-0 opacity-20"
          style={{
            background:
              'radial-gradient(ellipse 60% 50% at 70% 50%, #2699a6, transparent)',
          }}
          aria-hidden
        />
        <div className="relative mx-auto max-w-screen-2xl">
          <p className="mb-3 text-sm font-semibold uppercase tracking-widest text-secondary">
            {t('about.hero.eyebrow')}
          </p>
          <h1 className="max-w-2xl text-4xl font-black leading-tight tracking-tight text-white sm:text-5xl lg:text-6xl">
            {t('about.hero.heading')}
          </h1>
          <p className="mt-6 max-w-xl text-lg leading-relaxed text-white/70">
            {t('about.hero.body')}
          </p>
          <Link
            to="/collections/all"
            className="mt-8 inline-flex items-center gap-2 rounded-full bg-primary px-7 py-3 text-sm font-semibold text-white shadow-md transition hover:bg-primary/90"
          >
            {t('about.cta.shop.button')}
            <ArrowRight size={16} />
          </Link>
        </div>
      </section>

      {/* ================================================================ */}
      {/* OUR MISSION                                                       */}
      {/* ================================================================ */}
      <section className="mx-auto max-w-screen-2xl px-4 py-14 sm:px-6 lg:px-8 lg:py-20">
        <div className="grid gap-10 lg:grid-cols-2 lg:gap-16 lg:items-center">
          {/* Text */}
          <div>
            <SectionHeader
              eyebrow={t('about.mission.eyebrow')}
              heading={t('about.mission.heading')}
            />
            <p className="text-base leading-relaxed text-text-muted">
              {t('about.mission.body')}
            </p>
            <p className="mt-4 text-base leading-relaxed text-text-muted">
              {t('about.mission.body2')}
            </p>
          </div>

          {/* Decorative visual */}
          <div className="grid grid-cols-2 gap-4" aria-hidden>
            {[
              {bg: 'bg-primary', label: 'Quality'},
              {bg: 'bg-secondary', label: 'Community'},
              {bg: 'bg-brand-accent', label: 'Simplicity'},
              {bg: 'bg-dark', label: 'Trust'},
            ].map(({bg, label}) => (
              <div
                key={label}
                className={`${bg} flex h-32 items-end rounded-2xl p-4 sm:h-40`}
              >
                <span className="text-sm font-bold text-white/80">{label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ================================================================ */}
      {/* STATS BAR                                                         */}
      {/* ================================================================ */}
      <section className="bg-surface py-12">
        <div className="mx-auto max-w-screen-2xl px-4 sm:px-6 lg:px-8">
          <p className="mb-8 text-center text-sm font-semibold uppercase tracking-widest text-secondary">
            {t('about.stats.heading')}
          </p>
          <div className="grid grid-cols-2 gap-6 sm:grid-cols-4">
            {(['products', 'suppliers', 'customers', 'returns'] as const).map(
              (key) => (
                <div
                  key={key}
                  className="flex flex-col items-center rounded-xl border border-border bg-white px-4 py-6 text-center shadow-sm"
                >
                  <span className="text-3xl font-black text-dark sm:text-4xl">
                    {t(`about.stats.${key}.value`)}
                  </span>
                  <span className="mt-1 text-sm font-medium text-text-muted">
                    {t(`about.stats.${key}.label`)}
                  </span>
                </div>
              ),
            )}
          </div>
        </div>
      </section>

      {/* ================================================================ */}
      {/* VALUES                                                            */}
      {/* ================================================================ */}
      <section className="mx-auto max-w-screen-2xl px-4 py-14 sm:px-6 lg:px-8 lg:py-20">
        <SectionHeader
          eyebrow={t('about.values.eyebrow')}
          heading={t('about.values.heading')}
        />
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {VALUE_KEYS.map((key, i) => {
            const Icon = VALUE_ICONS[i];
            return (
              <div
                key={key}
                className="flex flex-col gap-4 rounded-xl border border-border bg-white p-6 shadow-sm"
              >
                <div
                  className={`flex h-10 w-10 items-center justify-center rounded-lg ${VALUE_COLORS[i]}`}
                >
                  <Icon size={20} />
                </div>
                <div>
                  <h3 className="font-semibold text-dark">
                    {t(`about.values.${key}.title`)}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-text-muted">
                    {t(`about.values.${key}.body`)}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* ================================================================ */}
      {/* CTA CARDS                                                         */}
      {/* ================================================================ */}
      <section className="bg-surface py-14 lg:py-20">
        <div className="mx-auto max-w-screen-2xl px-4 sm:px-6 lg:px-8">
          <h2 className="mb-8 text-center text-2xl font-bold text-dark sm:text-3xl">
            {t('about.cta.heading')}
          </h2>
          <div className="grid gap-5 sm:grid-cols-2">
            {/* Shop CTA */}
            <div className="flex flex-col gap-5 rounded-2xl bg-primary p-8">
              <div>
                <h3 className="text-xl font-bold text-white">
                  {t('about.cta.shop.title')}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-white/75">
                  {t('about.cta.shop.body')}
                </p>
              </div>
              <Link
                to="/collections/all"
                className="inline-flex w-fit items-center gap-2 rounded-full bg-white px-6 py-2.5 text-sm font-semibold text-primary transition hover:bg-white/90"
              >
                {t('about.cta.shop.button')}
                <ArrowRight size={15} />
              </Link>
            </div>

            {/* Supplier CTA */}
            <div className="flex flex-col gap-5 rounded-2xl bg-dark p-8">
              <div>
                <h3 className="text-xl font-bold text-white">
                  {t('about.cta.supplier.title')}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-white/75">
                  {t('about.cta.supplier.body')}
                </p>
              </div>
              <Link
                to="/pages/become-a-supplier"
                className="inline-flex w-fit items-center gap-2 rounded-full bg-secondary px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-secondary/90"
              >
                {t('about.cta.supplier.button')}
                <ArrowRight size={15} />
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
