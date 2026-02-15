import {useState} from 'react';
import {useLocation} from 'react-router';
import type {Route} from './+types/collections.all';
import {
  getPaginationVariables,
  Pagination,
  getSeoMeta,
} from '@shopify/hydrogen';
import type {ProductCardProps} from '~/components/commerce/ProductCard';
import {Link} from 'react-router';
import {Icon} from '~/components/display';
import {CollectionHero} from '~/components/commerce/CollectionHero';
import {CollectionToolbar} from '~/components/commerce/CollectionToolbar';
import {ProductGrid} from '~/components/commerce/ProductGrid';
import {FilterSidebar} from '~/components/commerce/FilterSidebar';
import {parseSortFromSearchParams} from '~/lib/collection/filters';

type AllProduct = ProductCardProps['product'];

// ============================================================================
// GraphQL
// ============================================================================

const ALL_PRODUCT_FRAGMENT = `#graphql
  fragment AllProduct on Product {
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

const ALL_PRODUCTS_QUERY = `#graphql
  query AllProducts(
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
      nodes {
        ...AllProduct
      }
      pageInfo {
        hasNextPage
        hasPreviousPage
        startCursor
        endCursor
      }
    }
  }
  ${ALL_PRODUCT_FRAGMENT}
` as const;

// Map collection sort keys to product sort keys
function mapSortKey(collectionSortKey: string): string {
  const mapping: Record<string, string> = {
    COLLECTION_DEFAULT: 'RELEVANCE',
    BEST_SELLING: 'BEST_SELLING',
    PRICE: 'PRICE',
    CREATED: 'CREATED_AT',
    TITLE: 'TITLE',
    MANUAL: 'RELEVANCE',
  };
  return mapping[collectionSortKey] || 'RELEVANCE';
}

// ============================================================================
// Loader
// ============================================================================

export async function loader({request, context}: Route.LoaderArgs) {
  const {storefront} = context;

  const url = new URL(request.url);
  const searchParams = url.searchParams;

  const {sortKey: collectionSortKey, reverse} =
    parseSortFromSearchParams(searchParams);
  const sortKey = mapSortKey(collectionSortKey ?? 'COLLECTION_DEFAULT');
  const paginationVariables = getPaginationVariables(request, {pageBy: 24});

  const {products} = await storefront.query(ALL_PRODUCTS_QUERY, {
    variables: {
      sortKey,
      reverse,
      ...paginationVariables,
      country: storefront.i18n.country,
      language: storefront.i18n.language,
    },
  });

  return {
    products,
    searchParamsString: searchParams.toString(),
  };
}

// ============================================================================
// SEO Meta
// ============================================================================

export function meta({}: Route.MetaArgs) {
  return getSeoMeta({
    title: 'All Products',
    description: 'Browse our full catalog of products.',
  });
}

// ============================================================================
// Component
// ============================================================================

export default function AllProductsPage({loaderData}: Route.ComponentProps) {
  const {products, searchParamsString} = loaderData;
  const [filtersOpen, setFiltersOpen] = useState(false);

  const searchParams = new URLSearchParams(searchParamsString);
  const hasProducts = products.nodes.length > 0;

  // All-products page has no collection-level filters from Storefront API
  const availableFilters = (products as any).filters ?? [];

  return (
    <div className="pb-12">
      {/* Gradient Promotional Banner */}
      <CollectionHero
        title="All Products"
        description="Browse our full catalog"
        promoHeadline="Grab Upto 50% Off On Selected Products"
        promoCta="Shop Now"
        promoCtaUrl="#products"
      />

      {/* Main content */}
      <div id="products" className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Toolbar */}
        <CollectionToolbar
          productCount={products.nodes.length}
          searchParams={searchParams}
          onOpenFilters={() => setFiltersOpen(true)}
        />

        {/* 2-column layout: filters + grid */}
        <div className="flex gap-10">
          {/* Filter Sidebar */}
          <FilterSidebar
            filters={availableFilters}
            searchParams={searchParams}
            isOpen={filtersOpen}
            onClose={() => setFiltersOpen(false)}
          />

          {/* Product grid + pagination */}
          <div className="flex-1 min-w-0">
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
                        <PreviousLink className="inline-flex items-center gap-2 rounded-lg border border-border px-4 py-2 text-sm font-medium text-dark transition-colors hover:border-text-muted hover:bg-surface">
                          <Icon name="arrow-up" size={16} />
                          Load Previous
                        </PreviousLink>
                      </div>
                    )}

                    <ProductGrid products={nodes as AllProduct[]} />

                    {hasNextPage && (
                      <div className="mt-10 flex justify-center">
                        <NextLink className="inline-flex items-center gap-2 rounded-full bg-primary px-8 py-3 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-primary/90">
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
                <Icon name="search" size={48} className="mb-4 text-text-muted" />
                <h2 className="mb-2 text-lg font-medium text-dark">
                  No products found
                </h2>
                <p className="mb-6 text-sm text-text-muted">
                  Check back soon for new products.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
