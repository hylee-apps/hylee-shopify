import type {Route} from './+types/search';
import {getSeoMeta} from '@shopify/hydrogen';
import {useLoaderData, useSearchParams, Form, Link} from 'react-router';
import {useTranslation} from 'react-i18next';
import {Search} from 'lucide-react';
import {Button} from '~/components/ui/button';
import {Input} from '~/components/ui/input';
import {PageBreadcrumbs} from '~/components/ui/PageBreadcrumbs';
import {ProductCard} from '~/components/commerce';
import {searchProducts, type SearchaniseProduct} from '~/lib/searchanise';

// ============================================================================
// Route Meta
// ============================================================================

export function meta({data}: Route.MetaArgs) {
  const query = data?.searchTerm ?? '';
  return getSeoMeta({
    title: query ? `Search results for "${query}"` : 'Search',
    description: query
      ? `Browse search results for "${query}" on Hy-lee.`
      : 'Search our products and collections.',
  });
}

// ============================================================================
// Loader
// ============================================================================

export async function loader({request, context}: Route.LoaderArgs) {
  const url = new URL(request.url);
  const searchTerm = url.searchParams.get('q') ?? '';
  const page = Math.max(1, Number(url.searchParams.get('pg') ?? '1'));

  if (!searchTerm) {
    return {searchTerm, products: null, totalCount: 0, page: 1, pageSize: 12};
  }

  const apiKey = (context.env as Env).SEARCHANISE_API_KEY;
  if (!apiKey) {
    // Graceful degradation: fall back to empty results if key is missing rather
    // than crashing the entire page during local development.
    console.warn(
      '[search] SEARCHANISE_API_KEY is not set — returning empty results',
    );
    return {
      searchTerm,
      products: [] as SearchaniseProduct[],
      totalCount: 0,
      page,
      pageSize: 12,
    };
  }

  try {
    const result = await searchProducts(apiKey, searchTerm, {
      page,
      pageSize: 12,
    });
    return {
      searchTerm,
      products: result.products,
      totalCount: result.totalCount,
      page: result.page,
      pageSize: result.pageSize,
    };
  } catch (err) {
    console.error('[search] Searchanise API call failed:', err);
    return {
      searchTerm,
      products: [] as SearchaniseProduct[],
      totalCount: 0,
      page,
      pageSize: 12,
    };
  }
}

// ============================================================================
// Main Search Page
// ============================================================================

export default function SearchPage() {
  const {t} = useTranslation();
  const {searchTerm, products, totalCount, page, pageSize} =
    useLoaderData<typeof loader>();
  const [searchParams] = useSearchParams();

  const totalPages = pageSize > 0 ? Math.ceil(totalCount / pageSize) : 1;

  return (
    <>
      <PageBreadcrumbs current={t('search.breadcrumb.search')} />
      <div className="mx-auto max-w-screen-2xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Results */}
        {searchTerm ? (
          <>
            <p className="mb-6 text-text-muted">
              {totalCount > 0
                ? t('search.results_other', {
                    count: totalCount,
                    term: searchTerm,
                  })
                : t('search.noResults', {term: searchTerm})}
            </p>

            {products && products.length > 0 ? (
              <>
                <SearchResults products={products} />
                {totalPages > 1 && (
                  <SearchPagination
                    page={page}
                    totalPages={totalPages}
                    searchTerm={searchTerm}
                  />
                )}
              </>
            ) : (
              <EmptySearchResults searchTerm={searchTerm} />
            )}
          </>
        ) : (
          <div className="py-12 text-center">
            <Search size={64} className="mx-auto mb-4 text-text-muted" />
            <p className="text-lg text-text-muted">{t('search.enterTerm')}</p>
          </div>
        )}
      </div>
    </>
  );
}

// ============================================================================
// SearchForm Component
// ============================================================================

function SearchForm({defaultValue = ''}: {defaultValue?: string}) {
  const {t} = useTranslation();
  return (
    <Form method="get" action="/search" className="flex max-w-2xl gap-2">
      <div className="relative flex-1">
        <Search
          size={20}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted"
        />
        <Input
          type="search"
          name="q"
          defaultValue={defaultValue}
          placeholder={t('search.placeholder')}
          autoComplete="off"
          className="pl-10"
          data-testid="search-input"
        />
      </div>
      <Button type="submit" data-testid="search-submit">
        {t('search.submit')}
      </Button>
    </Form>
  );
}

// ============================================================================
// SearchResults Component
// ============================================================================

function SearchResults({products}: {products: SearchaniseProduct[]}) {
  return (
    <div
      className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4"
      data-testid="search-results"
    >
      {products.map((product) => (
        <ProductCard
          key={product.product_id}
          product={{
            id: `gid://shopify/Product/${product.product_id}`,
            title: product.title,
            handle: product.handle,
            vendor: product.vendor,
            availableForSale: product.available,
            tags: product.tags,
            images: {
              nodes: product.image_link
                ? [
                    {
                      id: product.product_id,
                      url: product.image_link,
                      altText: product.title,
                      width: 800,
                      height: 800,
                    },
                  ]
                : [],
            },
            priceRange: {
              minVariantPrice: {
                amount: String(product.price),
                currencyCode: 'USD',
              },
            },
            compareAtPriceRange: product.compare_at_price
              ? {
                  minVariantPrice: {
                    amount: String(product.compare_at_price),
                    currencyCode: 'USD',
                  },
                }
              : undefined,
            variants: {
              nodes: product.add_to_cart_id
                ? [
                    {
                      id: `gid://shopify/ProductVariant/${product.add_to_cart_id}`,
                      availableForSale: product.available,
                      price: {
                        amount: String(product.price),
                        currencyCode: 'USD',
                      },
                      selectedOptions: [],
                    },
                  ]
                : [],
            },
          }}
        />
      ))}
    </div>
  );
}

// ============================================================================
// SearchPagination Component
// ============================================================================

function SearchPagination({
  page,
  totalPages,
  searchTerm,
}: {
  page: number;
  totalPages: number;
  searchTerm: string;
}) {
  const {t} = useTranslation();
  const buildUrl = (pg: number) =>
    `/search?q=${encodeURIComponent(searchTerm)}&pg=${pg}`;

  return (
    <nav
      className="mt-8 flex items-center justify-center gap-2"
      aria-label={t('search.resultPages')}
    >
      {page > 1 && (
        <Button variant="outline" asChild size="sm">
          <Link to={buildUrl(page - 1)}>{t('search.pagination.previous')}</Link>
        </Button>
      )}
      <span className="text-sm text-text-muted">
        {t('search.pagination.page', {page, total: totalPages})}
      </span>
      {page < totalPages && (
        <Button variant="outline" asChild size="sm">
          <Link to={buildUrl(page + 1)}>{t('search.pagination.next')}</Link>
        </Button>
      )}
    </nav>
  );
}

// ============================================================================
// EmptySearchResults Component
// ============================================================================

function EmptySearchResults({searchTerm}: {searchTerm: string}) {
  const {t} = useTranslation();
  return (
    <div
      className="flex flex-col items-center py-16 text-center"
      data-testid="search-empty"
    >
      <Search size={64} className="mb-4 text-text-muted" />
      <h2 className="mb-2 text-xl font-semibold text-dark">
        {t('search.noResultsHeading')}
      </h2>
      <p className="mb-6 max-w-md text-text-muted">
        {t('search.noResultsBody', {term: searchTerm})}
      </p>
      <Button variant="secondary" asChild>
        <Link to="/collections">{t('search.browseCollections')}</Link>
      </Button>
    </div>
  );
}
