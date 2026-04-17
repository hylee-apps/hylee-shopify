import {useState, useMemo} from 'react';
import {useTranslation} from 'react-i18next';
import {
  redirect,
  useLocation,
  useNavigation,
  useRouteLoaderData,
} from 'react-router';
import {ComingSoonPage} from '~/components/display/ComingSoonPage';
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
} from '@shopify/hydrogen';
import type {ProductCardProps} from '~/components/commerce/ProductCard';
import {Link} from 'react-router';
import {ChevronRight, ChevronUp, Filter, Loader2, Search} from 'lucide-react';
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
import {ActiveFilterChips} from '~/components/commerce/ActiveFilterChips';
import {ProductCard} from '~/components/commerce/ProductCard';
import {FilterSidebar} from '~/components/commerce/FilterSidebar';
import {SubcategoryScrollSection} from '~/components/commerce/SubcategoryScrollSection';
import type {SubcollectionNode} from '~/components/commerce/SubcategoryScrollSection';
import {SortSelect} from '~/components/commerce/SortSelect';
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

// ============================================================================
// Virtual collection redirects
//
// These handles don't map to real Shopify collections — they are filtered
// views of /collections/all. When a user navigates to one of these URLs
// (e.g. bookmarked or via the header nav) they are redirected to
// /collections/all with the appropriate filter or sort pre-applied.
// ============================================================================

const sale = encodeURIComponent(JSON.stringify({tag: 'sale'}));
const promotion = encodeURIComponent(JSON.stringify({tag: 'promotion'}));

const VIRTUAL_REDIRECTS: Record<string, string> = {
  'new-arrivals': '/collections/all?sort=newest',
  'what-s-new': '/collections/all?sort=newest',
  discounts: `/collections/all?filter=${sale}`,
  promotions: `/collections/all?filter=${promotion}`,
  'promotions-deals': `/collections/all?filter=${promotion}`,
};

export async function loader({params, request, context}: Route.LoaderArgs) {
  const {storefront} = context;
  const {handle} = params;

  if (!handle) {
    throw new Response('Collection handle is required', {status: 400});
  }

  // Redirect virtual collection handles to filtered /collections/all
  if (VIRTUAL_REDIRECTS[handle]) {
    throw redirect(VIRTUAL_REDIRECTS[handle], {status: 302});
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

  // Collection doesn't exist in Shopify — show a branded coming-soon page
  // instead of a raw 404.
  if (!collection) {
    return {
      collection: null,
      comingSoon: true as const,
      handle,
      searchParamsString: searchParams.toString(),
    };
  }

  // Collection exists but has no products and no active filters — treat as
  // "not yet ready" rather than an empty results state.
  const hasActiveFilters = filters.length > 0;
  const isEmpty =
    !hasActiveFilters &&
    collection.products.nodes.length === 0 &&
    !collection.products.pageInfo.hasNextPage;

  if (isEmpty) {
    return {
      collection: null,
      comingSoon: true as const,
      handle,
      searchParamsString: searchParams.toString(),
    };
  }

  return {
    collection,
    comingSoon: false as const,
    handle,
    searchParamsString: searchParams.toString(),
  };
}

// ============================================================================
// SEO Meta
// ============================================================================

export function meta({data}: Route.MetaArgs) {
  if (!data?.collection) {
    const title = data?.handle
      ? data.handle
          .split('-')
          .map((w: string) => w.charAt(0).toUpperCase() + w.slice(1))
          .join(' ')
      : 'Coming Soon';
    return [{title: `${title} | Hy-lee`}];
  }

  const {collection} = data;

  return getSeoMeta({
    title: collection.seo?.title ?? collection.title,
    description: collection.seo?.description ?? collection.description,
    media: collection.image,
  });
}

// ============================================================================
// Shared Breadcrumbs
// ============================================================================

function CollectionBreadcrumbs({
  navPath,
  title,
}: {
  navPath: Array<{url: string; title: string}> | null;
  title: string;
}) {
  const {t} = useTranslation();
  // Build: Home > [nav hierarchy] > Current Collection
  // Filter out root and /collections — neither should appear as raw path entries.
  const navItems = navPath
    ? navPath.filter((n) => n.url !== '/' && n.url !== '/collections')
    : [{url: null, title}];

  const crumbs: Array<{url: string | null; title: string}> = [
    {url: '/', title: t('breadcrumb.home')},
    ...navItems,
  ];

  return (
    <Breadcrumb className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
      <BreadcrumbList className="text-[14px] font-medium text-[#4b5563]">
        {crumbs.map((node, i) => {
          const isLast = i === crumbs.length - 1;
          return (
            <>
              {i > 0 && (
                <BreadcrumbSeparator key={`sep-${i}`}>
                  <ChevronRight size={12} className="text-[#9ca3af]" />
                </BreadcrumbSeparator>
              )}
              <BreadcrumbItem key={node.url ?? node.title}>
                {isLast || !node.url ? (
                  <BreadcrumbPage className="text-[#111827] font-medium h-10 px-4 inline-flex items-center">
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
        })}
      </BreadcrumbList>
    </Breadcrumb>
  );
}

// ============================================================================
// Non-end-node results header (count + sort, no filter sidebar)
// ============================================================================

function CategoryResultsHeader({
  count,
  hasNextPage,
  searchParams,
}: {
  count: number;
  hasNextPage: boolean;
  searchParams: URLSearchParams;
}) {
  const {t} = useTranslation();
  return (
    <div className="flex items-center justify-between border-b border-[#e5e7eb] pb-4.25 w-full">
      {/* Count — Figma: Roboto Medium 18px #111827 */}
      <p className="font-medium text-[18px] text-[#111827] leading-6.75">
        {t('collection.productResults', {
          total: count,
          suffix: hasNextPage ? '+' : '',
        })}
      </p>

      {/* Sort dropdown — reuse existing SortSelect (pill style) */}
      <SortSelect searchParams={searchParams} />
    </div>
  );
}

// ============================================================================
// End-node results header — Figma 5030:728
// Left: count (18px medium) + subtitle (14px gray)
// Right: Filters button (border rounded-[8px]) + Sort button (border rounded-[8px])
// ============================================================================

function EndNodeResultsHeader({
  count,
  hasNextPage,
  searchParams,
  onOpenFilters,
}: {
  count: number;
  hasNextPage: boolean;
  searchParams: URLSearchParams;
  onOpenFilters: () => void;
}) {
  const {t} = useTranslation();
  return (
    <div className="flex items-center justify-between border-b border-[#e5e7eb] pb-[17px] w-full">
      {/* Left: count + subtitle */}
      <div className="flex flex-col gap-[4px]">
        <h2 className="font-medium text-[18px] text-[#111827] leading-[27px]">
          {t('collection.productResults', {
            total: count,
            suffix: hasNextPage ? '+' : '',
          })}
        </h2>
        <p className="text-[14px] text-[#6b7280] leading-[21px]">
          {t('collection.showingResults', {
            total: count,
            suffix: hasNextPage ? '+' : '',
          })}
        </p>
      </div>

      {/* Right: Filters + Sort */}
      <div className="flex items-center gap-[12px]">
        {/* Filters button — opens mobile sheet on all viewports */}
        <button
          type="button"
          onClick={onOpenFilters}
          className="bg-white border border-[#d1d5db] rounded-[8px] px-[17px] py-[9px] flex items-center gap-[8px] hover:bg-[#f9fafb] transition-colors lg:hidden"
        >
          <Filter size={13} className="text-[#374151]" />
          <span className="font-medium text-[13px] text-[#374151]">
            {t('toolbar.filters')}
          </span>
        </button>

        {/* Sort — override pill style → Figma square rounded-[8px] */}
        <SortSelect
          searchParams={searchParams}
          className="!rounded-[8px] !border-[#d1d5db] !px-[17px] !py-[9px] !text-[14px] !text-[#374151] !font-normal"
        />
      </div>
    </div>
  );
}

// ============================================================================
// Component
// ============================================================================

export default function CollectionPage({loaderData}: Route.ComponentProps) {
  const {collection, comingSoon, handle, searchParamsString} = loaderData;
  const {t} = useTranslation();
  const {pathname} = useLocation();
  const navigation = useNavigation();
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const root = useRouteLoaderData<RootLoader>('root');

  // Collection doesn't exist or has no products yet — show branded coming soon
  if (comingSoon || !collection) {
    return <ComingSoonPage handle={handle} />;
  }

  const paginationKey = useMemo(() => {
    const p = new URLSearchParams(searchParamsString);
    p.delete('cursor');
    p.delete('direction');
    return p.toString();
  }, [searchParamsString]);

  const isNavigating = navigation.state !== 'idle';

  const metafieldPath = buildPathFromParentMetafields(
    collection as unknown as CollectionRef,
  );
  const navPath =
    metafieldPath ?? findNavPath(root?.header?.menu, collection.handle);

  const searchParams = new URLSearchParams(searchParamsString);

  const {products} = collection;
  const availableFilters = products.filters ?? [];

  // Subcollections — determines which layout to use
  const subcollections: SubcollectionNode[] = (collection.childCollections
    ?.references?.nodes ?? []) as SubcollectionNode[];
  const isCategory = subcollections.length > 0;

  // ============================================================================
  // NON-END-NODE layout (has child subcollections)
  // Figma: hero image+desc, subcategory scroll, 6-col grid, no filter sidebar
  // ============================================================================

  if (isCategory) {
    return (
      <div className="pb-12">
        {/* Breadcrumbs */}
        <CollectionBreadcrumbs navPath={navPath} title={collection.title} />

        {/* Hero — image left + title/description right */}
        <CollectionHero
          title={collection.title}
          description={collection.description}
          image={collection.image}
        />

        {/* Subcategory horizontal scroll */}
        <SubcategoryScrollSection subcollections={subcollections} />

        {/* Products section */}
        <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
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
                {/* Results header: count + sort */}
                <CategoryResultsHeader
                  count={nodes.length}
                  hasNextPage={hasNextPage}
                  searchParams={searchParams}
                />

                {/* Product grid — 6 columns, no sidebar */}
                <div
                  className={`mt-6 transition-opacity duration-200 ${
                    isNavigating
                      ? 'opacity-40 pointer-events-none'
                      : 'opacity-100'
                  }`}
                >
                  {nodes.length > 0 ? (
                    <>
                      {hasPreviousPage && (
                        <div className="mb-6 flex justify-center">
                          <Button variant="outline" asChild>
                            <PreviousLink>
                              <ChevronUp size={16} />
                              {t('collection.loadPrevious')}
                            </PreviousLink>
                          </Button>
                        </div>
                      )}

                      {/* 6-column grid — Figma: ~229px pitch on 1400px container */}
                      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-5">
                        {nodes.map((product) => (
                          <ProductCard
                            key={product.id}
                            product={product as CollectionProduct}
                            size="category"
                            collectionHandle={collection.handle}
                          />
                        ))}
                      </div>

                      {hasNextPage && (
                        <div className="mt-10 flex justify-center">
                          <Button asChild className="rounded-full px-8 py-3">
                            <NextLink>
                              {isLoading ? (
                                <>
                                  <Loader2 size={16} className="animate-spin" />
                                  {t('collection.loading')}
                                </>
                              ) : (
                                t('collection.loadMore')
                              )}
                            </NextLink>
                          </Button>
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="flex flex-col items-center justify-center py-16 text-center">
                      <Search size={48} className="mb-4 text-[#9ca3af]" />
                      <h2 className="mb-2 text-lg font-medium text-[#111827]">
                        {t('collection.noProductsFound')}
                      </h2>
                      <p className="mb-6 text-sm text-[#6b7280]">
                        {t('collection.browseSubcategoriesHint')}
                      </p>
                      <Button asChild className="rounded-full px-6">
                        <Link to={clearAllFiltersUrl(pathname, searchParams)}>
                          {t('collection.clearAllFilters')}
                        </Link>
                      </Button>
                    </div>
                  )}
                </div>
              </>
            )}
          </Pagination>
        </div>
      </div>
    );
  }

  // ============================================================================
  // END-NODE layout (leaf collection — no children)
  // Figma 5030:728: NO hero, card FilterSidebar, 4-col grid, teal chips
  // ============================================================================

  return (
    <div className="pb-12">
      {/* Breadcrumbs */}
      <CollectionBreadcrumbs navPath={navPath} title={collection.title} />

      {/* Listing layout: sidebar (240px) + main (flex-1) */}
      <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 py-[24px]">
        <Pagination key={paginationKey} connection={products}>
          {({
            nodes,
            NextLink,
            PreviousLink,
            hasNextPage,
            hasPreviousPage,
            isLoading,
          }) => (
            <div className="flex gap-[32px] items-start">
              {/* Card filter sidebar */}
              <FilterSidebar
                filters={availableFilters}
                searchParams={searchParams}
                isOpen={mobileFiltersOpen}
                onClose={() => setMobileFiltersOpen(false)}
              />

              {/* Main content */}
              <main className="flex-1 min-w-0">
                {/* Results header */}
                <EndNodeResultsHeader
                  count={nodes.length}
                  hasNextPage={hasNextPage}
                  searchParams={searchParams}
                  onOpenFilters={() => setMobileFiltersOpen(true)}
                />

                {/* Active filter chips */}
                <ActiveFilterChips
                  filters={availableFilters}
                  searchParams={searchParams}
                  className="pt-[16px]"
                />

                {/* Product grid */}
                <div
                  className={`mt-[24px] transition-opacity duration-200 ${
                    isNavigating
                      ? 'opacity-40 pointer-events-none'
                      : 'opacity-100'
                  }`}
                >
                  {nodes.length > 0 ? (
                    <>
                      {hasPreviousPage && (
                        <div className="mb-6 flex justify-center">
                          <Button variant="outline" asChild>
                            <PreviousLink>
                              <ChevronUp size={16} />
                              {t('collection.loadPrevious')}
                            </PreviousLink>
                          </Button>
                        </div>
                      )}

                      {/* 4-column grid — Figma: 4 cols at 1080px main width */}
                      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
                        {nodes.map((product) => (
                          <ProductCard
                            key={product.id}
                            product={product as CollectionProduct}
                            size="end-node"
                            collectionHandle={collection.handle}
                          />
                        ))}
                      </div>

                      {hasNextPage && (
                        <div className="mt-10 flex justify-center">
                          <Button asChild className="rounded-full px-8 py-3">
                            <NextLink>
                              {isLoading ? (
                                <>
                                  <Loader2 size={16} className="animate-spin" />
                                  {t('collection.loading')}
                                </>
                              ) : (
                                t('collection.loadMore')
                              )}
                            </NextLink>
                          </Button>
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="flex flex-col items-center justify-center py-16 text-center">
                      <Search size={48} className="mb-4 text-[#9ca3af]" />
                      <h2 className="mb-2 text-lg font-medium text-[#111827]">
                        {t('collection.noProductsFound')}
                      </h2>
                      <p className="mb-6 text-sm text-[#6b7280]">
                        {t('collection.adjustFiltersHint')}
                      </p>
                      <Button asChild className="rounded-full px-6">
                        <Link to={clearAllFiltersUrl(pathname, searchParams)}>
                          {t('collection.clearAllFilters')}
                        </Link>
                      </Button>
                    </div>
                  )}
                </div>
              </main>
            </div>
          )}
        </Pagination>
      </div>
    </div>
  );
}
