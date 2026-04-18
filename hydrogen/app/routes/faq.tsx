import {useState, useMemo} from 'react';
import {Link} from 'react-router';
import {useTranslation} from 'react-i18next';
import {MessageCircle, Search} from 'lucide-react';
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
// Types
// ============================================================================

interface FaqItem {
  q: string;
  a: string;
}

interface FaqCategory {
  key: string;
  label: string;
  items: FaqItem[];
}

// ============================================================================
// Meta
// ============================================================================

export function meta() {
  return [
    {title: 'FAQ | Hy-lee'},
    {
      name: 'description',
      content:
        'Find answers to frequently asked questions about shopping, shipping, returns, and your account at Hy-lee.',
    },
  ];
}

// ============================================================================
// Category icon map
// ============================================================================

const CATEGORY_ICON_CLASS: Record<string, string> = {
  ordersShipping: 'bg-primary/10 text-primary',
  returnsRefunds: 'bg-secondary/10 text-secondary',
  payments: 'bg-warning/10 text-warning',
  accountPrivacy: 'bg-brand-accent/10 text-brand-accent',
  products: 'bg-primary/10 text-primary',
};

// ============================================================================
// Page Component
// ============================================================================

export default function FaqPage() {
  const {t} = useTranslation();
  const [query, setQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<string | null>(null);

  const categoryKeys = [
    'ordersShipping',
    'returnsRefunds',
    'payments',
    'accountPrivacy',
    'products',
  ] as const;

  const categories: FaqCategory[] = categoryKeys.map((key) => ({
    key,
    label: t(`faq.categories.${key}`),
    items: t(`faq.items.${key}`, {returnObjects: true}) as FaqItem[],
  }));

  // Filter across all categories when query is non-empty
  const filteredCategories = useMemo(() => {
    if (!query.trim()) return categories;
    const lower = query.toLowerCase();
    return categories
      .map((cat) => ({
        ...cat,
        items: cat.items.filter(
          (item) =>
            item.q.toLowerCase().includes(lower) ||
            item.a.toLowerCase().includes(lower),
        ),
      }))
      .filter((cat) => cat.items.length > 0);
  }, [query, categories]);

  const hasResults = filteredCategories.some((cat) => cat.items.length > 0);

  // Which categories to show — filtered by tab if selected and no active search
  const visibleCategories =
    activeCategory && !query.trim()
      ? filteredCategories.filter((cat) => cat.key === activeCategory)
      : filteredCategories;

  return (
    <div className="mx-auto max-w-screen-2xl px-4 py-8 sm:px-6 lg:px-8 lg:py-12">
      {/* Breadcrumb */}
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link to="/">{t('faq.breadcrumb.home')}</Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>{t('faq.breadcrumb.faq')}</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      {/* Page header */}
      <div className="mt-6 mb-8">
        <h1 className="text-3xl font-bold text-dark sm:text-4xl">
          {t('faq.heading')}
        </h1>
        <p className="mt-2 text-text-muted">{t('faq.subtitle')}</p>
      </div>

      {/* Search */}
      <div className="relative mb-8">
        <Search
          size={18}
          className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted"
          aria-hidden
        />
        <input
          type="search"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setActiveCategory(null);
          }}
          placeholder={t('faq.searchPlaceholder')}
          className="w-full rounded-xl border border-border bg-white py-3 pl-11 pr-4 text-sm text-text shadow-sm outline-none transition focus:border-secondary focus:ring-2 focus:ring-secondary/20"
          aria-label={t('faq.searchPlaceholder')}
        />
      </div>

      {/* Category tabs (hidden during search) */}
      {!query.trim() && (
        <div className="mb-8 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setActiveCategory(null)}
            className={`rounded-full px-4 py-1.5 text-sm font-medium transition ${
              activeCategory === null
                ? 'bg-secondary text-white shadow-sm'
                : 'bg-surface text-text-muted hover:bg-secondary/10 hover:text-secondary'
            }`}
          >
            All
          </button>
          {categories.map((cat) => (
            <button
              type="button"
              key={cat.key}
              onClick={() =>
                setActiveCategory(activeCategory === cat.key ? null : cat.key)
              }
              className={`rounded-full px-4 py-1.5 text-sm font-medium transition ${
                activeCategory === cat.key
                  ? 'bg-secondary text-white shadow-sm'
                  : 'bg-surface text-text-muted hover:bg-secondary/10 hover:text-secondary'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      )}

      {/* FAQ sections */}
      {hasResults ? (
        <div className="space-y-8">
          {visibleCategories.map((cat) => (
            <section key={cat.key} aria-labelledby={`cat-${cat.key}`}>
              <div className="mb-4 flex items-center gap-3">
                <div
                  className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-sm font-bold ${CATEGORY_ICON_CLASS[cat.key] ?? 'bg-border text-text-muted'}`}
                >
                  {cat.label.charAt(0)}
                </div>
                <h2
                  id={`cat-${cat.key}`}
                  className="text-lg font-semibold text-dark"
                >
                  {cat.label}
                </h2>
              </div>

              <div className="rounded-xl border border-border bg-white shadow-sm">
                <Accordion type="multiple">
                  {cat.items.map((item, i) => (
                    <AccordionItem key={i} value={`${cat.key}-${i}`}>
                      <AccordionTrigger className="px-5 text-sm font-medium text-dark hover:no-underline hover:text-secondary">
                        {item.q}
                      </AccordionTrigger>
                      <AccordionContent className="px-5 text-sm leading-relaxed text-text-muted">
                        {item.a}
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </div>
            </section>
          ))}
        </div>
      ) : (
        <p className="rounded-xl border border-border bg-white px-6 py-8 text-center text-text-muted">
          {t('faq.noResults')}
        </p>
      )}

      {/* Contact CTA */}
      <div className="mt-12 rounded-2xl border border-border bg-surface px-6 py-8 text-center sm:px-10">
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-secondary/10">
          <MessageCircle size={24} className="text-secondary" />
        </div>
        <h2 className="text-xl font-semibold text-dark">
          {t('faq.contact.heading')}
        </h2>
        <p className="mt-2 text-sm text-text-muted">{t('faq.contact.body')}</p>
        <Link
          to="/pages/contact"
          className="mt-5 inline-flex items-center gap-2 rounded-full bg-secondary px-6 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-secondary/90"
        >
          {t('faq.contact.cta')}
        </Link>
      </div>
    </div>
  );
}
