import {useState} from 'react';
import {useTranslation} from 'react-i18next';
import {Link, useLocation} from 'react-router';
import type {Route} from './+types/collections.all';
import {
  getPaginationVariables,
  Pagination,
  getSeoMeta,
  Image,
} from '@shopify/hydrogen';
import {
  ProductCard,
  type ProductCardProps,
} from '~/components/commerce/ProductCard';
import {ChevronUp, Loader2, Search} from 'lucide-react';
import {Button} from '~/components/ui/button';
import {CollectionToolbar} from '~/components/commerce/CollectionToolbar';
import {FilterSidebar} from '~/components/commerce/FilterSidebar';
import {ActiveFilterChips} from '~/components/commerce/ActiveFilterChips';
import {
  parseFiltersFromSearchParams,
  parseSortFromSearchParams,
  clearAllFiltersUrl,
} from '~/lib/collection/filters';

type CollectionProduct = ProductCardProps['product'];

// ============================================================================
// GraphQL
// ============================================================================

const PRODUCT_FRAGMENT = `#graphql
  fragment AllPageProduct on Product {
    id
    title
    handle
    vendor
    availableForSale
    tags
    images(first: 2) {
      nodes {
        id
        url
        altText
        width
        height
      }
    }
    priceRange {
      minVariantPrice { amount currencyCode }
    }
    compareAtPriceRange {
      minVariantPrice { amount currencyCode }
    }
    variants(first: 1) {
      nodes {
        id
        availableForSale
        price { amount currencyCode }
        compareAtPrice { amount currencyCode }
        selectedOptions { name value }
      }
    }
    metafields(identifiers: [
      {namespace: "reviews", key: "rating"},
      {namespace: "reviews", key: "rating_count"}
    ]) {
      key
      value
    }
  }
` as const;

/**
 * Primary query — uses collection(handle:"all") so we get real filters,
 * proper sort keys, and a collection image. Works when the "All Products"
 * collection is published to the Storefront channel in Shopify Admin.
 */
const ALL_COLLECTION_QUERY = `#graphql
  query AllCollection(
    $filters: [ProductFilter!]
    $sortKey: ProductCollectionSortKeys
    $reverse: Boolean
    $first: Int
    $last: Int
    $startCursor: String
    $endCursor: String
    $country: CountryCode
    $language: LanguageCode
  ) @inContext(country: $country, language: $language) {
    collection(handle: "all") {
      id
      title
      description
      image {
        id
        url
        altText
        width
        height
      }
      products(
        first: $first
        last: $last
        before: $startCursor
        after: $endCursor
        filters: $filters
        sortKey: $sortKey
        reverse: $reverse
      ) {
        nodes { ...AllPageProduct }
        pageInfo {
          hasNextPage
          hasPreviousPage
          startCursor
          endCursor
        }
        filters {
          id
          label
          type
          presentation
          values { id label count input }
        }
      }
    }
  }
  ${PRODUCT_FRAGMENT}
` as const;

/**
 * Fallback query — root products field. No collection context means no
 * filters, but the page will load regardless of Shopify admin settings.
 */
const ALL_PRODUCTS_FALLBACK_QUERY = `#graphql
  query AllProductsFallback(
    $sortKey: ProductSortKeys
    $reverse: Boolean
    $first: Int
    $last: Int
    $startCursor: String
    $endCursor: String
    $country: CountryCode
    $language: LanguageCode
  ) @inContext(country: $country, language: $language) {
    products(
      first: $first
      last: $last
      before: $startCursor
      after: $endCursor
      sortKey: $sortKey
      reverse: $reverse
    ) {
      nodes { ...AllPageProduct }
      pageInfo {
        hasNextPage
        hasPreviousPage
        startCursor
        endCursor
      }
    }
  }
  ${PRODUCT_FRAGMENT}
` as const;

// Collection sort keys → root Product sort keys (fallback only)
const COLLECTION_TO_PRODUCT_SORT: Record<string, string> = {
  COLLECTION_DEFAULT: 'RELEVANCE',
  BEST_SELLING: 'BEST_SELLING',
  PRICE: 'PRICE',
  CREATED: 'CREATED_AT',
  TITLE: 'TITLE',
  MANUAL: 'RELEVANCE',
};

// ============================================================================
// Loader
// ============================================================================

export async function loader({request, context}: Route.LoaderArgs) {
  const {storefront} = context;
  const url = new URL(request.url);
  const searchParams = url.searchParams;

  const filters = parseFiltersFromSearchParams(searchParams);
  const {sortKey, reverse} = parseSortFromSearchParams(searchParams);
  const paginationVariables = getPaginationVariables(request, {pageBy: 24});

  // --- Attempt 1: query via collection(handle:"all") for full filter support
  const {collection} = await storefront.query(ALL_COLLECTION_QUERY, {
    variables: {
      filters,
      sortKey: sortKey as any,
      reverse,
      ...paginationVariables,
      country: storefront.i18n.country,
      language: storefront.i18n.language,
    },
  });

  if (collection) {
    return {
      products: collection.products,
      collectionImage: collection.image ?? null,
      hasCollectionContext: true,
      searchParamsString: searchParams.toString(),
    };
  }

  // --- Fallback: root products query (no filters available)
  const mappedSortKey =
    COLLECTION_TO_PRODUCT_SORT[sortKey ?? 'COLLECTION_DEFAULT'] ?? 'RELEVANCE';

  const {products} = await storefront.query(ALL_PRODUCTS_FALLBACK_QUERY, {
    variables: {
      sortKey: mappedSortKey as any,
      reverse,
      ...paginationVariables,
      country: storefront.i18n.country,
      language: storefront.i18n.language,
    },
  });

  return {
    products,
    collectionImage: null,
    hasCollectionContext: false,
    searchParamsString: searchParams.toString(),
  };
}

// ============================================================================
// Meta
// ============================================================================

export function meta({}: Route.MetaArgs) {
  return getSeoMeta({
    title: 'All Products',
    description: 'Browse our full catalog of products.',
  });
}

// ============================================================================
// Page Component
// ============================================================================

export default function AllProductsPage({loaderData}: Route.ComponentProps) {
  const {products, collectionImage, hasCollectionContext, searchParamsString} =
    loaderData;
  const {t} = useTranslation();
  const {pathname} = useLocation();
  const [filtersOpen, setFiltersOpen] = useState(false);

  const searchParams = new URLSearchParams(searchParamsString);
  const hasProducts = products.nodes.length > 0;
  const availableFilters = (products as any).filters ?? [];
  const activeFilterCount = Array.from(searchParams.entries()).filter(
    ([k]) => k !== 'sort_by' && k !== 'direction',
  ).length;

  return (
    <div className="pb-12">
      {/* ================================================================ */}
      {/* HERO BANNER                                                        */}
      {/* ================================================================ */}
      <section className="relative overflow-hidden bg-dark">
        {/* Decorative glow */}
        <div
          className="pointer-events-none absolute inset-0 opacity-25"
          style={{
            background:
              'radial-gradient(ellipse 55% 70% at 80% 50%, #2699a6, transparent)',
          }}
          aria-hidden
        />

        <div className="relative mx-auto flex max-w-screen-2xl items-center gap-8 px-4 py-10 sm:px-6 lg:gap-16 lg:px-8 lg:py-14">
          {/* Text block */}
          <div className="flex-1">
            <p className="mb-3 text-sm font-bold uppercase tracking-widest text-secondary">
              {t('collectionsAll.promoHeadline')}
            </p>
            <h1 className="text-5xl font-black leading-tight tracking-tight text-white sm:text-6xl lg:text-7xl">
              {t('collectionsAll.title')}
            </h1>
            <p className="mt-4 max-w-md text-lg leading-relaxed text-white/65">
              {t('collectionsAll.description')}
            </p>
            <Link
              to="#products"
              className="mt-6 inline-flex items-center gap-2 rounded-full bg-primary px-6 py-2.5 text-sm font-semibold text-white shadow-md transition hover:bg-primary/90"
            >
              {t('collection.shopNow')}
            </Link>
          </div>

          {/* Collection image (when available) or decorative colour blocks */}
          {collectionImage ? (
            <div className="hidden shrink-0 overflow-hidden rounded-2xl shadow-lg lg:block lg:h-[220px] lg:w-[360px]">
              <Image
                data={collectionImage}
                aspectRatio="360/220"
                sizes="360px"
                className="h-full w-full object-cover"
                loading="eager"
              />
            </div>
          ) : (
            <div
              className="hidden shrink-0 lg:grid lg:h-[200px] lg:w-[300px] lg:grid-cols-2 lg:gap-3"
              aria-hidden
            >
              {[
                'bg-primary',
                'bg-secondary',
                'bg-brand-accent',
                'bg-dark/60',
              ].map((bg) => (
                <div key={bg} className={`${bg} rounded-xl`} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ================================================================ */}
      {/* MAIN CONTENT                                                       */}
      {/* ================================================================ */}
      <div
        id="products"
        className="mx-auto max-w-screen-2xl px-4 pt-6 sm:px-6 lg:px-8"
      >
        {/* Toolbar */}
        <CollectionToolbar
          productCount={products.nodes.length}
          searchParams={searchParams}
          onOpenMobileFilters={
            availableFilters.length > 0 ? () => setFiltersOpen(true) : undefined
          }
        />

        {/* Active filter chips */}
        {activeFilterCount > 0 && (
          <div className="mt-3">
            <ActiveFilterChips
              filters={availableFilters}
              searchParams={searchParams}
            />
          </div>
        )}

        {/* No-filter notice (fallback mode only) */}
        {!hasCollectionContext && (
          <p className="mt-3 text-xs text-text-muted">
            Filters are unavailable until the &ldquo;All Products&rdquo;
            collection is published in Shopify Admin → Sales channels → Online
            Store.
          </p>
        )}

        {/* 2-column layout: sidebar + grid */}
        <div className="mt-5 flex gap-10">
          {availableFilters.length > 0 && (
            <FilterSidebar
              filters={availableFilters}
              searchParams={searchParams}
              isOpen={filtersOpen}
              onClose={() => setFiltersOpen(false)}
            />
          )}

          <div className="min-w-0 flex-1">
            {hasProducts ? (
              <Pagination connection={products}>
                {({
                  nodes,
                  NextLink,
                  PreviousLink,
                  hasNextPage,
                  hasPreviousPage,
                  isLoading,
                }) => (
                  <>
                    {hasPreviousPage && (
                      <div className="mb-6 flex justify-center">
                        <Button variant="outline" asChild>
                          <PreviousLink className="inline-flex items-center gap-2 rounded-lg border border-border px-4 py-2 text-sm font-medium text-dark transition-colors hover:border-text-muted hover:bg-surface">
                            <ChevronUp size={16} />
                            {t('collectionsAll.loadPrevious')}
                          </PreviousLink>
                        </Button>
                      </div>
                    )}

                    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
                      {(nodes as CollectionProduct[]).map((product) => (
                        <ProductCard
                          key={product.id}
                          product={product}
                          size="end-node"
                          collectionHandle="all"
                        />
                      ))}
                    </div>

                    {hasNextPage && (
                      <div className="mt-10 flex justify-center">
                        <NextLink className="inline-flex items-center gap-2 rounded-full bg-primary px-8 py-3 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-primary/90">
                          {isLoading ? (
                            <>
                              <Loader2 size={16} className="animate-spin" />
                              {t('collectionsAll.loading')}
                            </>
                          ) : (
                            t('collection.loadMore')
                          )}
                        </NextLink>
                      </div>
                    )}
                  </>
                )}
              </Pagination>
            ) : (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <Search size={48} className="mb-4 text-text-muted" />
                <h2 className="mb-2 text-lg font-medium text-dark">
                  {t('collectionsAll.emptyHeading')}
                </h2>
                <p className="mb-6 text-sm text-text-muted">
                  {activeFilterCount > 0
                    ? t('collection.adjustFiltersHint')
                    : t('collectionsAll.emptySubtitle')}
                </p>
                {activeFilterCount > 0 && (
                  <Link
                    to={clearAllFiltersUrl(pathname, searchParams)}
                    className="rounded-full border border-secondary px-5 py-2 text-sm font-semibold text-secondary transition hover:bg-secondary hover:text-white"
                  >
                    {t('collection.clearAllFilters')}
                  </Link>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
