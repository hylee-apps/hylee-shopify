import {useState, useMemo} from 'react';
import {useLocation, useNavigation, useRouteLoaderData} from 'react-router';
import type {Route} from './+types/collections.$handle';
import type {RootLoader} from '~/root';
import {
  findNavPath,
  buildPathFromParentMetafields,
  type CollectionRef,
  PARENT_CHAIN_FRAGMENT,
} from '~/lib/breadcrumbs';
import {
  getPaginationVariables,
  Pagination,
  getSeoMeta,
  Image,
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

type SubcollectionNode = {
  handle: string;
  title: string;
  image?: {
    url: string;
    altText?: string | null;
    width?: number | null;
    height?: number | null;
  } | null;
};

// ============================================================================
// Subcollection Grid
// ============================================================================

function SubcollectionGrid({
  collection,
}: {
  collection: {
    childCollections?: {
      references?: {nodes?: SubcollectionNode[] | null} | null;
    } | null;
  };
}) {
  const subcollections = collection.childCollections?.references?.nodes ?? [];
  if (!subcollections.length) return null;

  return (
    <div className="max-w-300 mx-auto px-4 sm:px-6 py-4">
      <div className="mx-auto flex w-fit flex-wrap justify-center gap-4">
        {subcollections.map((sub) => (
          <Link
            key={sub.handle}
            to={`/collections/${sub.handle}`}
            className="group flex w-40 flex-col items-center gap-2 sm:w-44 md:w-48"
          >
            <div className="aspect-square w-full overflow-hidden rounded-full bg-surface">
              {sub.image ? (
                <Image
                  data={sub.image}
                  aspectRatio="1/1"
                  sizes="(min-width: 1024px) 16vw, (min-width: 640px) 20vw, 33vw"
                  className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center bg-surface text-text-muted text-xs">
                  {sub.title.slice(0, 2)}
                </div>
              )}
            </div>
            <span className="text-center text-xs font-medium text-text leading-tight group-hover:text-primary transition-colors">
              {sub.title}
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}

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
      ...BcCollectionWithParents
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
      childCollections: metafield(namespace: "custom", key: "child_nodes") {
        references(first: 20) {
          nodes {
            ... on Collection {
              handle
              title
              image {
                url
                altText
                width
                height
              }
            }
          }
        }
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
  ${PARENT_CHAIN_FRAGMENT}
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
  const navigation = useNavigation();
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const root = useRouteLoaderData<RootLoader>('root');

  // Key for Pagination: changes when filters/sort change but NOT on cursor
  // navigation, so "Load More" still works while filters trigger a fresh mount.
  const paginationKey = useMemo(() => {
    const p = new URLSearchParams(searchParamsString);
    p.delete('cursor');
    p.delete('direction');
    return p.toString();
  }, [searchParamsString]);

  const isNavigating = navigation.state !== 'idle';

  // Build breadcrumb path — prefer metafield chain, fall back to nav menu
  const metafieldPath = buildPathFromParentMetafields(
    collection as unknown as CollectionRef,
  );
  const navPath =
    metafieldPath ?? findNavPath(root?.header?.menu, collection.handle);

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
      {/* BREADCRUMBS — Figma: ghost-button links h-10 px-4 rounded-xl  */}
      {/* Nav-aware: Home > Parent Collection > ... > This Collection       */}
      {/* ================================================================ */}
      <Breadcrumb className="max-w-300 mx-auto px-4 sm:px-6 py-2.5">
        <BreadcrumbList className="text-[14px] font-medium text-text-muted">
          {navPath ? (
            // Nav-hierarchy: L1 / L2 / ... / This Collection
            navPath.map((node, i) => {
              const isLast = i === navPath.length - 1;
              return (
                <>
                  {i > 0 && (
                    <BreadcrumbSeparator key={`sep-${node.url}`}>
                      /
                    </BreadcrumbSeparator>
                  )}
                  <BreadcrumbItem key={node.url}>
                    {isLast ? (
                      <BreadcrumbPage className="text-black h-10 px-4 inline-flex items-center">
                        {node.title}
                      </BreadcrumbPage>
                    ) : (
                      <BreadcrumbLink
                        asChild
                        className="h-10 px-4 rounded-xl hover:bg-accent inline-flex items-center"
                      >
                        <Link to={node.url}>{node.title}</Link>
                      </BreadcrumbLink>
                    )}
                  </BreadcrumbItem>
                </>
              );
            })
          ) : (
            // Fallback: just the current collection title, no parent link
            <BreadcrumbItem>
              <BreadcrumbPage className="text-black h-10 px-4 inline-flex items-center">
                {collection.title}
              </BreadcrumbPage>
            </BreadcrumbItem>
          )}
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
      {/* SUBCOLLECTIONS — square cards with image + title               */}
      {/* ================================================================ */}
      <SubcollectionGrid collection={collection} />

      {/* ================================================================ */}
      {/* PRODUCTS SECTION — Figma: px-[122px] py-[20px]                  */}
      {/* ================================================================ */}
      <div className="max-w-300 mx-auto px-4 sm:px-6 py-5">
        <Pagination key={paginationKey} connection={products}>
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
                <div
                  className={`flex-1 min-w-0 transition-opacity duration-200 ${isNavigating ? 'opacity-40 pointer-events-none' : 'opacity-100'}`}
                >
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
