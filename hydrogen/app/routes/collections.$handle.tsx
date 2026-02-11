'use client';

import {useState, useEffect} from 'react';
import {useLocation} from 'react-router';
import type {Route} from './+types/collections.$handle';
import {
  getPaginationVariables,
  Pagination,
  getSeoMeta,
} from '@shopify/hydrogen';
import type {ProductCardProps} from '~/components/commerce/ProductCard';
import {Link} from 'react-router';
import {Breadcrumb} from '~/components/navigation';
import {Icon} from '~/components/display';
import {Modal} from '~/components/navigation';
import {CollectionHero} from '~/components/commerce/CollectionHero';
import {FilterSidebar} from '~/components/commerce/FilterSidebar';
import {CollectionToolbar} from '~/components/commerce/CollectionToolbar';
import {ProductGrid} from '~/components/commerce/ProductGrid';
import {
  parseFiltersFromSearchParams,
  parseSortFromSearchParams,
  getAppliedFilters,
  clearAllFiltersUrl,
} from '~/lib/collection/filters';

type CollectionProduct = ProductCardProps['product'];

// ============================================================================
// GraphQL Fragments & Query
// ============================================================================

const COLLECTION_PRODUCT_FRAGMENT = `#graphql
  fragment CollectionProduct on Product {
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
        id
        availableForSale
        price {
          amount
          currencyCode
        }
        compareAtPrice {
          amount
          currencyCode
        }
        selectedOptions {
          name
          value
        }
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

const COLLECTION_QUERY = `#graphql
  query Collection(
    $handle: String!
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
    collection(handle: $handle) {
      id
      title
      handle
      description
      descriptionHtml
      image {
        id
        url
        altText
        width
        height
      }
      seo {
        title
        description
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
        nodes {
          ...CollectionProduct
        }
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
          values {
            id
            label
            count
            input
          }
        }
      }
    }
  }
  ${COLLECTION_PRODUCT_FRAGMENT}
` as const;

// ============================================================================
// Loader
// ============================================================================

export async function loader({params, request, context}: Route.LoaderArgs) {
  const {storefront} = context;
  const {handle} = params;

  if (!handle) {
    throw new Response('Collection handle is required', {status: 400});
  }

  const url = new URL(request.url);
  const searchParams = url.searchParams;

  const filters = parseFiltersFromSearchParams(searchParams);
  const {sortKey, reverse} = parseSortFromSearchParams(searchParams);
  const paginationVariables = getPaginationVariables(request, {pageBy: 24});

  const {collection} = await storefront.query(COLLECTION_QUERY, {
    variables: {
      handle,
      filters,
      sortKey,
      reverse,
      ...paginationVariables,
      country: storefront.i18n.country,
      language: storefront.i18n.language,
    },
  });

  if (!collection) {
    throw new Response('Collection not found', {status: 404});
  }

  const appliedFilters = getAppliedFilters(
    searchParams,
    collection.products.filters,
    `/collections/${handle}`,
  );

  return {
    collection,
    appliedFilters,
    searchParamsString: searchParams.toString(),
  };
}

// ============================================================================
// SEO Meta
// ============================================================================

export function meta({data}: Route.MetaArgs) {
  if (!data?.collection) {
    return [{title: 'Collection Not Found'}];
  }

  const {collection} = data;

  return getSeoMeta({
    title: collection.seo?.title ?? collection.title,
    description: collection.seo?.description ?? collection.description,
    media: collection.image,
  });
}

// ============================================================================
// Component
// ============================================================================

export default function CollectionPage({loaderData}: Route.ComponentProps) {
  const {collection, appliedFilters, searchParamsString} = loaderData;
  const {pathname} = useLocation();

  // Reconstruct searchParams from serialized string
  const searchParams = new URLSearchParams(searchParamsString);

  // View mode state with localStorage persistence
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  useEffect(() => {
    const saved = localStorage.getItem('collection-view-mode');
    if (saved === 'grid' || saved === 'list') {
      setViewMode(saved);
    }
  }, []);
  const handleViewModeChange = (mode: 'grid' | 'list') => {
    setViewMode(mode);
    localStorage.setItem('collection-view-mode', mode);
  };

  // Mobile filter drawer state
  const [filtersOpen, setFiltersOpen] = useState(false);

  if (!collection) {
    return null;
  }

  const {products} = collection;
  const hasProducts = products.nodes.length > 0;
  const hasFilters = products.filters.length > 0;

  return (
    <div className="mx-auto max-w-7xl px-4 pb-12 sm:px-6 lg:px-8">
      {/* Breadcrumb */}
      <Breadcrumb
        items={[
          {label: 'Home', url: '/'},
          {label: 'Collections', url: '/collections'},
          {label: collection.title},
        ]}
        className="py-4"
      />

      {/* Hero */}
      <CollectionHero
        title={collection.title}
        description={collection.description}
        descriptionHtml={collection.descriptionHtml}
        image={collection.image}
      />

      {/* Toolbar */}
      <CollectionToolbar
        productCount={products.nodes.length}
        viewMode={viewMode}
        onViewModeChange={handleViewModeChange}
        searchParams={searchParams}
        onOpenFilters={hasFilters ? () => setFiltersOpen(true) : undefined}
      />

      {/* Main layout: sidebar + grid */}
      <div className="flex gap-8">
        {/* Desktop filter sidebar */}
        {hasFilters && (
          <div className="hidden w-64 shrink-0 lg:block">
            <div className="sticky top-24">
              <FilterSidebar
                filters={products.filters}
                appliedFilters={appliedFilters}
                searchParams={searchParams}
              />
            </div>
          </div>
        )}

        {/* Mobile filter drawer */}
        {hasFilters && (
          <Modal
            open={filtersOpen}
            onClose={() => setFiltersOpen(false)}
            title="Filters"
            size="medium"
          >
            <FilterSidebar
              filters={products.filters}
              appliedFilters={appliedFilters}
              searchParams={searchParams}
            />
          </Modal>
        )}

        {/* Product grid + pagination */}
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
                      <PreviousLink className="inline-flex items-center gap-2 rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 transition-colors hover:border-slate-400 hover:bg-slate-50">
                        <Icon name="arrow-up" size={16} />
                        Load Previous
                      </PreviousLink>
                    </div>
                  )}

                  <ProductGrid
                    products={nodes as CollectionProduct[]}
                    viewMode={viewMode}
                  />

                  {hasNextPage && (
                    <div className="mt-8 flex justify-center">
                      <NextLink className="inline-flex items-center gap-2 rounded-lg bg-primary px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-primary/90">
                        {isLoading ? (
                          <>
                            <Icon
                              name="loader"
                              size={16}
                              className="animate-spin"
                            />
                            Loading...
                          </>
                        ) : (
                          'Load More Products'
                        )}
                      </NextLink>
                    </div>
                  )}
                </>
              )}
            </Pagination>
          ) : (
            /* Empty state */
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <Icon name="search" size={48} className="mb-4 text-slate-300" />
              <h2 className="mb-2 text-lg font-medium text-slate-900">
                No products found
              </h2>
              <p className="mb-6 text-sm text-slate-500">
                Try adjusting your filters or browse all products in this
                collection.
              </p>
              {appliedFilters.length > 0 && (
                <Link
                  to={clearAllFiltersUrl(pathname, searchParams)}
                  className="inline-flex items-center gap-2 rounded-lg bg-primary px-6 py-2.5 text-sm font-medium text-white transition-colors hover:bg-primary/90"
                >
                  Clear All Filters
                </Link>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
