import type {Route} from './+types/compare';
import {Link, useSearchParams} from 'react-router';
import {useTranslation} from 'react-i18next';
import {getSeoMeta} from '@shopify/hydrogen';
import {
  CompareTable,
  type CompareProduct,
} from '~/components/commerce/CompareTable';
import {PageBreadcrumbs} from '~/components/ui/PageBreadcrumbs';
import {X, Plus, Columns2} from 'lucide-react';

// ============================================================================
// GraphQL Query
// ============================================================================

const COMPARE_PRODUCTS_QUERY = `#graphql
  query CompareProducts(
    $ids: [ID!]!
    $country: CountryCode
    $language: LanguageCode
  ) @inContext(country: $country, language: $language) {
    nodes(ids: $ids) {
      ... on Product {
        id
        title
        handle
        vendor
        productType
        featuredImage {
          id
          url
          altText
          width
          height
        }
        priceRange {
          minVariantPrice {
            amount
            currencyCode
          }
        }
        compareAtPriceRange {
          minVariantPrice {
            amount
            currencyCode
          }
        }
        variants(first: 1) {
          nodes {
            weight
            weightUnit
            price {
              amount
              currencyCode
            }
            compareAtPrice {
              amount
              currencyCode
            }
          }
        }
        dimensions: metafield(namespace: "custom", key: "dimensions") {
          value
        }
        material: metafield(namespace: "custom", key: "material") {
          value
        }
        specifications: metafield(namespace: "custom", key: "specifications") {
          value
        }
      }
    }
  }
` as const;

// ============================================================================
// SEO
// ============================================================================

export function meta({data}: Route.MetaArgs) {
  const count = data?.products?.length ?? 0;
  return getSeoMeta({
    title: count > 0 ? `Compare ${count} Products` : 'Compare Products',
    description:
      'Compare products side by side to find the best option for you.',
  });
}

// ============================================================================
// Loader
// ============================================================================

export async function loader({request, context}: Route.LoaderArgs) {
  const {storefront} = context;
  const url = new URL(request.url);
  const compareParam = url.searchParams.get('compare') || '';

  // Parse product IDs from URL — supports both raw IDs and GIDs
  const rawIds = compareParam
    .split(',')
    .map((id) => id.trim())
    .filter(Boolean);

  if (rawIds.length === 0) {
    return {products: [] as CompareProduct[]};
  }

  // Cap at 4 to avoid overly large queries
  const cappedIds = rawIds.slice(0, 4);

  // Ensure IDs are in Shopify GID format
  const gids = cappedIds.map((id) =>
    id.startsWith('gid://') ? id : `gid://shopify/Product/${id}`,
  );

  const {nodes} = await storefront.query(COMPARE_PRODUCTS_QUERY, {
    variables: {
      ids: gids,
      country: storefront.i18n.country,
      language: storefront.i18n.language,
    },
  });

  // Filter out nulls (deleted/unavailable products) and cast
  const products = (nodes ?? []).filter(
    (node: CompareProduct | null) => node !== null && node.id,
  ) as CompareProduct[];

  return {products};
}

// ============================================================================
// Component
// ============================================================================

export default function ComparePage({loaderData}: Route.ComponentProps) {
  const {products} = loaderData;
  const {t} = useTranslation();
  const [searchParams, setSearchParams] = useSearchParams();
  const hasProducts = products.length > 0;

  const clearAll = () => {
    const newParams = new URLSearchParams(searchParams);
    newParams.delete('compare');
    setSearchParams(newParams, {replace: true});
  };

  return (
    <>
      <PageBreadcrumbs current={t('compare.page.heading')} />
      <div className="mx-auto max-w-screen-2xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 sm:text-3xl">
              {t('compare.page.heading')}
            </h1>
            {hasProducts && (
              <p className="mt-1 text-sm text-slate-600">
                {t('compare.page.subheading', {count: products.length})}
              </p>
            )}
          </div>
          {hasProducts && (
            <div className="flex gap-3">
              <button
                type="button"
                onClick={clearAll}
                className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-600 transition-colors hover:border-slate-300 hover:text-slate-900"
              >
                <X size={16} />
                {t('compare.page.clearAll')}
              </button>
              <Link
                to="/collections/all"
                className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-primary/90"
              >
                <Plus size={16} />
                {t('compare.page.addMore')}
              </Link>
            </div>
          )}
        </div>

        {/* Content */}
        {hasProducts ? <CompareTable products={products} /> : <EmptyState />}
      </div>
    </>
  );
}

// ============================================================================
// Empty State
// ============================================================================

function EmptyState() {
  const {t} = useTranslation();
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-200 py-16 text-center">
      <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-slate-100 text-slate-400">
        <Columns2 size={28} />
      </div>
      <h2 className="mb-2 text-lg font-semibold text-slate-900">
        {t('compare.page.empty.heading')}
      </h2>
      <p className="mb-6 max-w-sm text-sm text-slate-600">
        {t('compare.page.empty.body')}
      </p>
      <Link
        to="/collections/all"
        className="inline-flex items-center gap-2 rounded-lg bg-primary px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-primary/90"
      >
        {t('compare.page.empty.cta')}
      </Link>
    </div>
  );
}
