import type {Route} from './+types/search';
import {getSeoMeta} from '@shopify/hydrogen';
import {useLoaderData, useSearchParams, Form, Link} from 'react-router';
import {Search} from 'lucide-react';
import {Button} from '~/components/ui/button';
import {Input} from '~/components/ui/input';
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '~/components/ui/breadcrumb';
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
  const {searchTerm, products, totalCount, page, pageSize} =
    useLoaderData<typeof loader>();
  const [searchParams] = useSearchParams();

  const totalPages = pageSize > 0 ? Math.ceil(totalCount / pageSize) : 1;

  return (
    <div className="mx-auto max-w-300 px-4 py-8 sm:px-6">
      <Breadcrumb className="mb-6">
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link to="/">Home</Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>Search</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      {/* Search Form */}
      <div className="mb-8">
        <h1 className="mb-4 text-3xl font-bold text-dark">Search</h1>
        <SearchForm defaultValue={searchTerm} />
      </div>

      {/* Results */}
      {searchTerm ? (
        <>
          <p className="mb-6 text-text-muted">
            {totalCount > 0
              ? `${totalCount} result${totalCount !== 1 ? 's' : ''} for "${searchTerm}"`
              : `No results for "${searchTerm}"`}
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
          <p className="text-lg text-text-muted">
            Enter a search term to find products
          </p>
        </div>
      )}
    </div>
  );
}

// ============================================================================
// SearchForm Component
// ============================================================================

function SearchForm({defaultValue = ''}: {defaultValue?: string}) {
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
          placeholder="Search products..."
          autoComplete="off"
          className="pl-10"
          data-testid="search-input"
        />
      </div>
      <Button type="submit" data-testid="search-submit">
        Search
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
  const buildUrl = (pg: number) =>
    `/search?q=${encodeURIComponent(searchTerm)}&pg=${pg}`;

  return (
    <nav
      className="mt-8 flex items-center justify-center gap-2"
      aria-label="Search result pages"
    >
      {page > 1 && (
        <Button variant="outline" asChild size="sm">
          <Link to={buildUrl(page - 1)}>Previous</Link>
        </Button>
      )}
      <span className="text-sm text-text-muted">
        Page {page} of {totalPages}
      </span>
      {page < totalPages && (
        <Button variant="outline" asChild size="sm">
          <Link to={buildUrl(page + 1)}>Next</Link>
        </Button>
      )}
    </nav>
  );
}

// ============================================================================
// EmptySearchResults Component
// ============================================================================

function EmptySearchResults({searchTerm}: {searchTerm: string}) {
  return (
    <div
      className="flex flex-col items-center py-16 text-center"
      data-testid="search-empty"
    >
      <Search size={64} className="mb-4 text-text-muted" />
      <h2 className="mb-2 text-xl font-semibold text-dark">No results found</h2>
      <p className="mb-6 max-w-md text-text-muted">
        We couldn&apos;t find anything for &ldquo;{searchTerm}&rdquo;. Try
        checking your spelling or using different search terms.
      </p>
      <Button variant="secondary" asChild>
        <Link to="/collections">Browse Collections</Link>
      </Button>
    </div>
  );
}
