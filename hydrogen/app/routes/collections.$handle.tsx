import {useState} from 'react';
import {useLocation} from 'react-router';
import type {Route} from './+types/collections.$handle';
import {
  getPaginationVariables,
  Pagination,
  getSeoMeta,
} from '@shopify/hydrogen';
import type {ProductCardProps} from '~/components/commerce/ProductCard';
import {Link} from 'react-router';
import {ChevronUp, Loader2, Search} from 'lucide-react';
import {Button} from '~/components/ui/button';
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '~/components/ui/breadcrumb';
import {CollectionHero} from '~/components/commerce/CollectionHero';
import {CollectionToolbar} from '~/components/commerce/CollectionToolbar';
import {ProductGrid} from '~/components/commerce/ProductGrid';
import {FilterSidebar} from '~/components/commerce/FilterSidebar';
import {
  parseFiltersFromSearchParams,
  parseSortFromSearchParams,
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

  return {
    collection,
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
  const {collection, searchParamsString} = loaderData;
  const {pathname} = useLocation();
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  // Reconstruct searchParams from serialized string
  const searchParams = new URLSearchParams(searchParamsString);

  if (!collection) {
    return null;
  }

  const {products} = collection;
  const availableFilters = products.filters ?? [];

  return (
    <div className="pb-12">
      {/* ================================================================ */}
      {/* BREADCRUMBS — Figma: ghost-button links h-10 px-4 rounded-[8px]  */}
      {/* ================================================================ */}
      <Breadcrumb className="max-w-300 mx-auto px-4 sm:px-6 py-2.5">
        <BreadcrumbList className="text-[14px] font-medium text-text-muted">
          <BreadcrumbItem>
            <BreadcrumbLink
              asChild
              className="h-10 px-4 rounded-[8px] hover:bg-accent inline-flex items-center"
            >
              <Link to="/">Home</Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator>/</BreadcrumbSeparator>
          <BreadcrumbItem>
            <BreadcrumbLink
              asChild
              className="h-10 px-4 rounded-[8px] hover:bg-accent inline-flex items-center"
            >
              <Link to="/collections">Collections</Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator>/</BreadcrumbSeparator>
          <BreadcrumbItem>
            <BreadcrumbPage className="text-black">
              {collection.title}
            </BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      {/* ================================================================ */}
      {/* COLLECTION HERO — Figma: image left 328px + title right 57px    */}
      {/* ================================================================ */}
      <CollectionHero
        title={collection.title}
        description={collection.description}
        descriptionHtml={collection.descriptionHtml}
        image={collection.image}
      />

      {/* ================================================================ */}
      {/* PRODUCTS SECTION — Figma: px-[122px] py-[20px]                  */}
      {/* ================================================================ */}
      <div className="max-w-300 mx-auto px-4 sm:px-6 py-5">
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
              {/* Results heading — uses Pagination's accumulated nodes for accurate count */}
              {/* Figma: "{N} Product Results", 30px SemiBold, centered, pb-[10px]        */}
              {nodes.length > 0 && (
                <div className="flex items-center justify-center pb-[10px]">
                  <p className="font-semibold text-[30px] text-black">
                    {nodes.length}
                    {hasNextPage ? '+' : ''} Product Results
                  </p>
                </div>
              )}

              {/* Toolbar */}
              <CollectionToolbar
                productCount={nodes.length}
                searchParams={searchParams}
                onOpenMobileFilters={() => setMobileFiltersOpen(true)}
              />

              {/* 2-column layout: filters + grid */}
              <div className="flex gap-10">
                {/* Filter Sidebar — always visible on desktop, Sheet on mobile */}
                <FilterSidebar
                  filters={availableFilters}
                  searchParams={searchParams}
                  isOpen={mobileFiltersOpen}
                  onClose={() => setMobileFiltersOpen(false)}
                />

                {/* Product grid */}
                <div className="flex-1 min-w-0">
                  {nodes.length > 0 ? (
                    <>
                      {hasPreviousPage && (
                        <div className="mb-6 flex justify-center">
                          <Button variant="outline" asChild>
                            <PreviousLink>
                              <ChevronUp size={16} />
                              Load Previous
                            </PreviousLink>
                          </Button>
                        </div>
                      )}

                      {/* Figma: 5-column grid, gap-[10px], Card=ProductSmall */}
                      <ProductGrid
                        products={nodes as CollectionProduct[]}
                        size="small"
                        collectionHandle={collection.handle}
                      />

                      {hasNextPage && (
                        <div className="mt-10 flex justify-center">
                          <Button asChild className="rounded-full px-8 py-3">
                            <NextLink>
                              {isLoading ? (
                                <>
                                  <Loader2 size={16} className="animate-spin" />
                                  Loading...
                                </>
                              ) : (
                                'Load More Products'
                              )}
                            </NextLink>
                          </Button>
                        </div>
                      )}
                    </>
                  ) : (
                    /* Empty state */
                    <div className="flex flex-col items-center justify-center py-16 text-center">
                      <Search size={48} className="mb-4 text-text-muted" />
                      <h2 className="mb-2 text-lg font-medium text-dark">
                        No products found
                      </h2>
                      <p className="mb-6 text-sm text-text-muted">
                        Try adjusting your filters or browse all products in
                        this collection.
                      </p>
                      <Button asChild className="rounded-full px-6">
                        <Link to={clearAllFiltersUrl(pathname, searchParams)}>
                          Clear All Filters
                        </Link>
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </>
          )}
        </Pagination>
      </div>
    </div>
  );
}
