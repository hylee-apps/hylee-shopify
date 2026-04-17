import {Link} from 'react-router';
import {useTranslation} from 'react-i18next';
import {
  CheckCircle2,
  XCircle,
  ArrowRight,
  Mail,
  Calendar,
  Truck,
  RefreshCcw,
  ArrowLeftRight,
  CreditCard,
  ShieldCheck,
  Globe,
} from 'lucide-react';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '~/components/ui/breadcrumb';

// ============================================================================
// Meta
// ============================================================================

export function meta() {
  return [
    {title: 'Return Policy | Hy-lee'},
    {
      name: 'description',
      content:
        "Hy-lee's hassle-free 30-day return policy — free return shipping, fast refunds, and easy exchanges.",
    },
  ];
}

// ============================================================================
// Highlights config — icon + value colour per card
// ============================================================================

const HIGHLIGHTS = [
  {
    key: 'window',
    icon: Calendar,
    iconBg: 'bg-primary/10',
    iconColor: 'text-primary',
    valueColor: 'text-primary',
  },
  {
    key: 'shipping',
    icon: Truck,
    iconBg: 'bg-secondary/10',
    iconColor: 'text-secondary',
    valueColor: 'text-secondary',
  },
  {
    key: 'refund',
    icon: RefreshCcw,
    iconBg: 'bg-brand-accent/10',
    iconColor: 'text-brand-accent',
    valueColor: 'text-brand-accent',
  },
  {
    key: 'exchange',
    icon: ArrowLeftRight,
    iconBg: 'bg-warning/10',
    iconColor: 'text-warning',
    valueColor: 'text-warning',
  },
] as const;

// ============================================================================
// Quick-facts grid config (refunds, exchanges, damaged, international)
// ============================================================================

const QUICK_FACT_CARDS = [
  {
    key: 'refunds',
    icon: CreditCard,
    iconBg: 'bg-primary/10',
    iconColor: 'text-primary',
  },
  {
    key: 'exchanges',
    icon: ArrowLeftRight,
    iconBg: 'bg-secondary/10',
    iconColor: 'text-secondary',
  },
  {
    key: 'damaged',
    icon: ShieldCheck,
    iconBg: 'bg-brand-accent/10',
    iconColor: 'text-brand-accent',
  },
  {
    key: 'international',
    icon: Globe,
    iconBg: 'bg-warning/10',
    iconColor: 'text-warning',
  },
] as const;

// ============================================================================
// Shared section header — eyebrow + teal bar + heading
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

export default function ReturnPolicyPage() {
  const {t} = useTranslation();

  const steps = t('returnPolicy.sections.howTo.steps', {
    returnObjects: true,
  }) as Array<{step: string; title: string; body: string}>;

  const conditions = t('returnPolicy.sections.eligibility.conditions', {
    returnObjects: true,
  }) as string[];

  const ineligibleItems = t('returnPolicy.sections.ineligible.items', {
    returnObjects: true,
  }) as string[];

  return (
    <div className="overflow-x-hidden">
      {/* ================================================================ */}
      {/* HERO                                                              */}
      {/* ================================================================ */}
      <section className="relative bg-dark px-4 py-14 sm:px-6 sm:py-18 lg:px-8 lg:py-24">
        <div
          className="pointer-events-none absolute inset-0 opacity-20"
          style={{
            background:
              'radial-gradient(ellipse 60% 50% at 70% 50%, #2699a6, transparent)',
          }}
          aria-hidden
        />
        <div className="relative mx-auto max-w-screen-2xl">
          <Breadcrumb className="mb-8">
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink asChild>
                  <Link to="/" className="text-white/60 hover:text-white">
                    {t('returnPolicy.breadcrumb.home')}
                  </Link>
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator className="text-white/40" />
              <BreadcrumbItem>
                <BreadcrumbPage className="text-white/80">
                  {t('returnPolicy.breadcrumb.page')}
                </BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>

          <p className="mb-3 text-sm font-semibold uppercase tracking-widest text-secondary">
            {t('returnPolicy.hero.eyebrow')}
          </p>
          <h1 className="max-w-2xl text-4xl font-black leading-tight tracking-tight text-white sm:text-5xl lg:text-6xl">
            {t('returnPolicy.hero.title')}
          </h1>
          <p className="mt-6 max-w-xl text-lg leading-relaxed text-white/70">
            {t('returnPolicy.hero.subtitle')}
          </p>
        </div>
      </section>

      {/* ================================================================ */}
      {/* HIGHLIGHTS — 4 stat cards with icons                             */}
      {/* ================================================================ */}
      <section className="bg-surface py-10">
        <div className="mx-auto max-w-screen-2xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            {HIGHLIGHTS.map(
              ({key, icon: Icon, iconBg, iconColor, valueColor}) => (
                <div
                  key={key}
                  className="flex flex-col items-center rounded-xl border border-border bg-white px-4 py-6 text-center shadow-sm"
                >
                  <div
                    className={`mb-3 flex h-10 w-10 items-center justify-center rounded-xl ${iconBg}`}
                  >
                    <Icon size={20} className={iconColor} />
                  </div>
                  <span
                    className={`text-3xl font-black sm:text-4xl ${valueColor}`}
                  >
                    {t(`returnPolicy.highlights.${key}.value`)}
                  </span>
                  <span className="mt-1 text-sm font-medium text-text-muted">
                    {t(`returnPolicy.highlights.${key}.label`)}
                  </span>
                </div>
              ),
            )}
          </div>
        </div>
      </section>

      {/* ================================================================ */}
      {/* MAIN CONTENT                                                      */}
      {/* ================================================================ */}
      <section className="mx-auto max-w-screen-2xl px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
        <div className="grid gap-10 lg:grid-cols-[1fr_320px] lg:gap-16">
          {/* ------------------------------------------------------------ */}
          {/* Left column                                                   */}
          {/* ------------------------------------------------------------ */}
          <div className="space-y-16">
            {/* ---------------------------------------------------------- */}
            {/* ELIGIBILITY COMPARISON — two tinted cards side by side      */}
            {/* ---------------------------------------------------------- */}
            <div>
              <SectionHeader
                eyebrow={t('returnPolicy.eligibilitySectionEyebrow')}
                heading={t('returnPolicy.eligibilitySectionHeading')}
              />

              <div className="grid gap-5 sm:grid-cols-2">
                {/* What CAN be returned */}
                <div className="rounded-2xl border border-primary/20 bg-primary/5 p-6">
                  <div className="mb-4 flex items-center gap-2.5">
                    <CheckCircle2 size={20} className="shrink-0 text-primary" />
                    <h3 className="font-semibold text-dark">
                      {t('returnPolicy.sections.eligibility.title')}
                    </h3>
                  </div>
                  <p className="mb-4 text-sm leading-relaxed text-text-muted">
                    {t('returnPolicy.sections.eligibility.body')}
                  </p>
                  <ul className="space-y-2.5">
                    {conditions.map((c, i) => (
                      <li
                        key={i}
                        className="flex items-start gap-2.5 text-sm text-text-muted"
                      >
                        <CheckCircle2
                          size={14}
                          className="mt-0.5 shrink-0 text-primary"
                        />
                        {c}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* What CANNOT be returned */}
                <div className="rounded-2xl border border-destructive/20 bg-destructive/5 p-6">
                  <div className="mb-4 flex items-center gap-2.5">
                    <XCircle size={20} className="shrink-0 text-destructive" />
                    <h3 className="font-semibold text-dark">
                      {t('returnPolicy.sections.ineligible.title')}
                    </h3>
                  </div>
                  <p className="mb-4 text-sm leading-relaxed text-text-muted">
                    {t('returnPolicy.sections.ineligible.body')}
                  </p>
                  <ul className="space-y-2.5">
                    {ineligibleItems.map((item, i) => (
                      <li
                        key={i}
                        className="flex items-start gap-2.5 text-sm text-text-muted"
                      >
                        <XCircle
                          size={14}
                          className="mt-0.5 shrink-0 text-destructive"
                        />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>

            {/* ---------------------------------------------------------- */}
            {/* HOW TO RETURN — connected step timeline                     */}
            {/* ---------------------------------------------------------- */}
            <div>
              <SectionHeader
                eyebrow={t('returnPolicy.howToEyebrow')}
                heading={t('returnPolicy.sections.howTo.title')}
              />
              <p className="mb-8 text-base leading-relaxed text-text-muted">
                {t('returnPolicy.sections.howTo.intro')}
              </p>

              <div>
                {steps.map((s, i) => (
                  <div key={s.step} className="flex gap-5">
                    {/* Step number + connector line */}
                    <div className="flex flex-col items-center">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-bold text-white">
                        {s.step}
                      </div>
                      {i < steps.length - 1 && (
                        <div className="my-1 w-0.5 flex-1 bg-border" />
                      )}
                    </div>

                    {/* Step content */}
                    <div
                      className={`pt-1.5 ${i < steps.length - 1 ? 'pb-8' : 'pb-0'}`}
                    >
                      <p className="font-semibold text-dark">{s.title}</p>
                      <p className="mt-1 text-sm leading-relaxed text-text-muted">
                        {s.body}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* ---------------------------------------------------------- */}
            {/* QUICK FACTS GRID — refunds / exchanges / damaged / intl     */}
            {/* ---------------------------------------------------------- */}
            <div>
              <SectionHeader
                eyebrow={t('returnPolicy.quickFacts.eyebrow')}
                heading={t('returnPolicy.quickFacts.heading')}
              />

              <div className="grid gap-5 sm:grid-cols-2">
                {QUICK_FACT_CARDS.map(
                  ({key, icon: Icon, iconBg, iconColor}) => (
                    <div
                      key={key}
                      className="rounded-2xl border border-border bg-white p-6 shadow-sm"
                    >
                      <div
                        className={`mb-4 flex h-10 w-10 items-center justify-center rounded-xl ${iconBg}`}
                      >
                        <Icon size={20} className={iconColor} />
                      </div>
                      <h3 className="font-semibold text-dark">
                        {t(`returnPolicy.sections.${key}.title`)}
                      </h3>
                      <p className="mt-2 text-sm leading-relaxed text-text-muted">
                        {t(`returnPolicy.sections.${key}.body`)}
                      </p>
                      {key === 'refunds' && (
                        <p className="mt-3 rounded-lg border border-secondary/20 bg-secondary/5 px-3 py-2.5 text-xs leading-relaxed text-secondary">
                          {t('returnPolicy.sections.refunds.note')}
                        </p>
                      )}
                    </div>
                  ),
                )}
              </div>
            </div>
          </div>

          {/* ------------------------------------------------------------ */}
          {/* Sticky sidebar (desktop only)                                 */}
          {/* ------------------------------------------------------------ */}
          <aside className="hidden lg:block">
            <div className="sticky top-8 space-y-4">
              {/* Ready to Return CTA */}
              <div className="rounded-2xl bg-primary p-6">
                <h3 className="text-lg font-bold text-white">
                  {t('returnPolicy.readyToReturn.heading')}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-white/75">
                  {t('returnPolicy.readyToReturn.body')}
                </p>
                <Link
                  to="/account/orders"
                  className="mt-4 inline-flex items-center gap-2 rounded-full bg-white px-5 py-2 text-sm font-semibold text-primary transition hover:bg-white/90"
                >
                  {t('returnPolicy.readyToReturn.myOrdersCta')}
                  <ArrowRight size={14} />
                </Link>
              </div>

              {/* Contact / FAQ card */}
              <div className="rounded-2xl border border-border bg-white p-6 shadow-sm">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-secondary/10">
                  <Mail size={20} className="text-secondary" />
                </div>
                <h3 className="mt-3 font-semibold text-dark">
                  {t('returnPolicy.contact.heading')}
                </h3>
                <p className="mt-1 text-sm leading-relaxed text-text-muted">
                  {t('returnPolicy.contact.body')}
                </p>
                <div className="mt-4">
                  <Link
                    to="/faq"
                    className="inline-flex items-center gap-1.5 text-sm font-medium text-secondary hover:underline"
                  >
                    {t('returnPolicy.contact.faqCta')}
                    <ArrowRight size={13} />
                  </Link>
                </div>
              </div>
            </div>
          </aside>
        </div>
      </section>

      {/* ================================================================ */}
      {/* MOBILE BOTTOM CTA (hidden on lg)                                 */}
      {/* ================================================================ */}
      <section className="bg-surface py-10 lg:hidden">
        <div className="mx-auto max-w-screen-2xl px-4 sm:px-6">
          <div className="rounded-2xl bg-dark p-8 text-center">
            <h2 className="text-xl font-bold text-white">
              {t('returnPolicy.readyToReturn.heading')}
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-white/70">
              {t('returnPolicy.readyToReturn.body')}
            </p>
            <div className="mt-5 flex flex-wrap justify-center gap-3">
              <Link
                to="/account/orders"
                className="inline-flex items-center gap-2 rounded-full bg-primary px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-primary/90"
              >
                {t('returnPolicy.readyToReturn.startReturnCta')}
                <ArrowRight size={14} />
              </Link>
              <Link
                to="/faq"
                className="inline-flex items-center gap-2 rounded-full border border-white/30 px-6 py-2.5 text-sm font-semibold text-white/80 transition hover:border-white/60 hover:text-white"
              >
                {t('returnPolicy.contact.faqCta')}
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
