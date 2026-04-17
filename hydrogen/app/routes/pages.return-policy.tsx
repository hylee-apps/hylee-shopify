import {Link} from 'react-router';
import {useTranslation} from 'react-i18next';
import {CheckCircle2, XCircle, ArrowRight, Mail} from 'lucide-react';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '~/components/ui/accordion';
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
// Highlight cards
// ============================================================================

const HIGHLIGHT_KEYS = ['window', 'shipping', 'refund', 'exchange'] as const;

const HIGHLIGHT_COLORS = [
  'bg-primary/10 text-primary',
  'bg-secondary/10 text-secondary',
  'bg-brand-accent/10 text-brand-accent',
  'bg-warning/10 text-warning',
] as const;

// ============================================================================
// Section header — matches homepage / about page style
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
// Step card — used in "How to Start a Return"
// ============================================================================

function StepCard({
  step,
  title,
  body,
}: {
  step: string;
  title: string;
  body: string;
}) {
  return (
    <div className="flex gap-4">
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-bold text-white">
        {step}
      </div>
      <div className="pt-1">
        <p className="font-semibold text-dark">{title}</p>
        <p className="mt-1 text-sm leading-relaxed text-text-muted">{body}</p>
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
      {/* HIGHLIGHTS                                                        */}
      {/* ================================================================ */}
      <section className="bg-surface py-10">
        <div className="mx-auto max-w-screen-2xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            {HIGHLIGHT_KEYS.map((key, i) => (
              <div
                key={key}
                className="flex flex-col items-center rounded-xl border border-border bg-white px-4 py-6 text-center shadow-sm"
              >
                <span
                  className={`text-3xl font-black sm:text-4xl ${HIGHLIGHT_COLORS[i].split(' ')[1]}`}
                >
                  {t(`returnPolicy.highlights.${key}.value`)}
                </span>
                <span className="mt-1 text-sm font-medium text-text-muted">
                  {t(`returnPolicy.highlights.${key}.label`)}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ================================================================ */}
      {/* POLICY SECTIONS                                                   */}
      {/* ================================================================ */}
      <section className="mx-auto max-w-screen-2xl px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
        <div className="grid gap-10 lg:grid-cols-[1fr_320px] lg:gap-16">
          {/* Main accordion content */}
          <div>
            <Accordion
              type="multiple"
              defaultValue={['eligibility', 'howTo', 'refunds']}
            >
              {/* Eligibility */}
              <AccordionItem value="eligibility">
                <AccordionTrigger className="text-left text-base font-semibold text-dark hover:no-underline">
                  {t('returnPolicy.sections.eligibility.title')}
                </AccordionTrigger>
                <AccordionContent className="space-y-3 text-sm leading-relaxed text-text-muted">
                  <p>{t('returnPolicy.sections.eligibility.body')}</p>
                  <ul className="space-y-2">
                    {conditions.map((c, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <CheckCircle2
                          size={16}
                          className="mt-0.5 shrink-0 text-primary"
                        />
                        <span>{c}</span>
                      </li>
                    ))}
                  </ul>
                </AccordionContent>
              </AccordionItem>

              {/* Ineligible */}
              <AccordionItem value="ineligible">
                <AccordionTrigger className="text-left text-base font-semibold text-dark hover:no-underline">
                  {t('returnPolicy.sections.ineligible.title')}
                </AccordionTrigger>
                <AccordionContent className="space-y-3 text-sm leading-relaxed text-text-muted">
                  <p>{t('returnPolicy.sections.ineligible.body')}</p>
                  <ul className="space-y-2">
                    {ineligibleItems.map((item, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <XCircle
                          size={16}
                          className="mt-0.5 shrink-0 text-destructive"
                        />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </AccordionContent>
              </AccordionItem>

              {/* How to start */}
              <AccordionItem value="howTo">
                <AccordionTrigger className="text-left text-base font-semibold text-dark hover:no-underline">
                  {t('returnPolicy.sections.howTo.title')}
                </AccordionTrigger>
                <AccordionContent className="space-y-4 text-sm">
                  <p className="leading-relaxed text-text-muted">
                    {t('returnPolicy.sections.howTo.intro')}
                  </p>
                  <div className="space-y-4 pl-1">
                    {steps.map((s) => (
                      <StepCard
                        key={s.step}
                        step={s.step}
                        title={s.title}
                        body={s.body}
                      />
                    ))}
                  </div>
                </AccordionContent>
              </AccordionItem>

              {/* Refunds */}
              <AccordionItem value="refunds">
                <AccordionTrigger className="text-left text-base font-semibold text-dark hover:no-underline">
                  {t('returnPolicy.sections.refunds.title')}
                </AccordionTrigger>
                <AccordionContent className="space-y-3 text-sm leading-relaxed text-text-muted">
                  <p>{t('returnPolicy.sections.refunds.body')}</p>
                  <p className="rounded-lg border border-secondary/30 bg-secondary/5 px-4 py-3 text-secondary">
                    {t('returnPolicy.sections.refunds.note')}
                  </p>
                </AccordionContent>
              </AccordionItem>

              {/* Exchanges */}
              <AccordionItem value="exchanges">
                <AccordionTrigger className="text-left text-base font-semibold text-dark hover:no-underline">
                  {t('returnPolicy.sections.exchanges.title')}
                </AccordionTrigger>
                <AccordionContent className="text-sm leading-relaxed text-text-muted">
                  <p>{t('returnPolicy.sections.exchanges.body')}</p>
                </AccordionContent>
              </AccordionItem>

              {/* Damaged */}
              <AccordionItem value="damaged">
                <AccordionTrigger className="text-left text-base font-semibold text-dark hover:no-underline">
                  {t('returnPolicy.sections.damaged.title')}
                </AccordionTrigger>
                <AccordionContent className="text-sm leading-relaxed text-text-muted">
                  <p>{t('returnPolicy.sections.damaged.body')}</p>
                </AccordionContent>
              </AccordionItem>

              {/* International */}
              <AccordionItem value="international">
                <AccordionTrigger className="text-left text-base font-semibold text-dark hover:no-underline">
                  {t('returnPolicy.sections.international.title')}
                </AccordionTrigger>
                <AccordionContent className="text-sm leading-relaxed text-text-muted">
                  <p>{t('returnPolicy.sections.international.body')}</p>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>

          {/* Sticky sidebar — quick actions */}
          <aside className="hidden lg:block">
            <div className="sticky top-8 space-y-4">
              {/* Start a return CTA */}
              <div className="rounded-2xl bg-primary p-6">
                <h3 className="text-lg font-bold text-white">
                  Ready to Return?
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-white/75">
                  Sign in to your account to start a return in minutes.
                </p>
                <Link
                  to="/account/orders"
                  className="mt-4 inline-flex items-center gap-2 rounded-full bg-white px-5 py-2 text-sm font-semibold text-primary transition hover:bg-white/90"
                >
                  My Orders
                  <ArrowRight size={14} />
                </Link>
              </div>

              {/* Contact card */}
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
                <div className="mt-4 flex flex-col gap-2">
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
      {/* MOBILE CONTACT CTA (shown below lg)                              */}
      {/* ================================================================ */}
      <section className="bg-surface py-10 lg:hidden">
        <div className="mx-auto max-w-screen-2xl px-4 sm:px-6">
          <div className="rounded-2xl bg-dark p-8 text-center">
            <h2 className="text-xl font-bold text-white">
              {t('returnPolicy.contact.heading')}
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-white/70">
              {t('returnPolicy.contact.body')}
            </p>
            <div className="mt-5 flex flex-wrap justify-center gap-3">
              <Link
                to="/account/orders"
                className="inline-flex items-center gap-2 rounded-full bg-primary px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-primary/90"
              >
                Start a Return
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
