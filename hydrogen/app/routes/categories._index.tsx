import {useMemo, useRef} from 'react';
import {useTranslation} from 'react-i18next';
import {Link, useLoaderData} from 'react-router';
import {getSeoMeta} from '@shopify/hydrogen';
import {PageBreadcrumbs} from '~/components/ui/PageBreadcrumbs';
import type {Route} from './+types/categories._index';

// ============================================================================
// GraphQL — fetch all collections sorted A-Z (up to 250)
// ============================================================================

const ALL_COLLECTIONS_QUERY = `#graphql
  query AllCollections(
    $country: CountryCode
    $language: LanguageCode
  ) @inContext(country: $country, language: $language) {
    collections(first: 250, sortKey: TITLE) {
      nodes {
        id
        title
        handle
        isDisplayed: metafield(namespace: "custom", key: "is_displayed_on_all_product_categories_page") {
          value
        }
      }
    }
  }
` as const;

// ============================================================================
// SEO
// ============================================================================

export function meta() {
  return getSeoMeta({
    title: 'All Product Categories — Hy-lee',
    description:
      'Browse every product category at Hy-lee A to Z — furniture, off-grid power, tiny home essentials, and more.',
  });
}

// ============================================================================
// Loader
// ============================================================================

export async function loader({request, context}: Route.LoaderArgs) {
  const {storefront} = context;

  const data = await storefront
    .query(ALL_COLLECTIONS_QUERY, {
      variables: {
        country: storefront.i18n.country,
        language: storefront.i18n.language,
      },
      cache: storefront.CacheLong(),
    })
    .catch(() => null);

  const collections: Array<{id: string; title: string; handle: string}> = (
    data?.collections?.nodes ?? []
  ).filter((c) => c.isDisplayed?.value === 'true');

  return {collections};
}

// ============================================================================
// Component
// ============================================================================

const ALPHA = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');

type Collection = {id: string; title: string; handle: string};

export default function CategoriesIndex() {
  const {collections} = useLoaderData<typeof loader>();
  const {t} = useTranslation();
  const sectionRefs = useRef<Record<string, HTMLElement | null>>({});

  // Group collections by first letter (A-Z, or '#' for non-alpha)
  const grouped = useMemo(() => {
    const map = new Map<string, Collection[]>();
    for (const col of collections) {
      const first = col.title[0]?.toUpperCase() ?? '#';
      const key = /[A-Z]/.test(first) ? first : '#';
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(col);
    }
    return map;
  }, [collections]);

  const activeLetters = new Set(grouped.keys());

  function scrollTo(letter: string) {
    sectionRefs.current[letter]?.scrollIntoView({
      behavior: 'smooth',
      block: 'start',
    });
  }

  // Ordered sections: A-Z then '#' if present
  const orderedKeys = [
    ...ALPHA.filter((l) => grouped.has(l)),
    ...(grouped.has('#') ? ['#'] : []),
  ];

  return (
    <>
      {/* Breadcrumb — rendered outside the padded container so its own
          px-4 sm:px-6 lg:px-8 aligns with the rest of the site */}
      <PageBreadcrumbs current={t('allCategories.title')} />

      <div
        className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 pb-16"
        data-testid="categories-index"
      >
        {/* Page heading */}
        <h1 className="text-3xl font-bold text-text mt-2 mb-6">
          {t('allCategories.title')}
        </h1>

        {/* A-Z letter strip — sticky within the page content */}
        <div
          className="sticky top-[56px] z-10 bg-white border-b border-border py-2 mb-8 -mx-4 sm:-mx-6 lg:-mx-8 px-4 sm:px-6 lg:px-8 overflow-x-auto"
          data-testid="letter-strip"
        >
          <ul className="flex gap-1 min-w-max">
            {ALPHA.map((letter) => {
              const active = activeLetters.has(letter);
              return (
                <li key={letter}>
                  <button
                    type="button"
                    onClick={() => active && scrollTo(letter)}
                    disabled={!active}
                    className={`w-8 h-8 rounded-md text-sm font-semibold transition-colors ${
                      active
                        ? 'text-secondary hover:bg-secondary/10 cursor-pointer'
                        : 'text-text-muted/40 cursor-default'
                    }`}
                  >
                    {letter}
                  </button>
                </li>
              );
            })}
          </ul>
        </div>

        {/* Letter sections */}
        <div className="space-y-12">
          {orderedKeys.map((letter) => {
            const cols = grouped.get(letter)!;
            return (
              <section
                key={letter}
                ref={(el) => {
                  sectionRefs.current[letter] = el;
                }}
                id={`section-${letter}`}
                aria-label={t('allCategories.sectionLabel', {letter})}
              >
                {/* Section heading */}
                <h2 className="text-xl font-bold text-secondary border-b border-border pb-2 mb-5">
                  {letter}
                </h2>

                {/* Category text links — 3-column directory layout */}
                <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-1">
                  {cols.map((col) => (
                    <li key={col.id}>
                      <Link
                        to={`/collections/${col.handle}`}
                        data-testid="category-tile"
                        className="block py-1.5 text-sm text-text hover:text-secondary hover:underline underline-offset-2 transition-colors truncate"
                      >
                        {col.title}
                      </Link>
                    </li>
                  ))}
                </ul>
              </section>
            );
          })}
        </div>
      </div>
    </>
  );
}
