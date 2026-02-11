import type {Route} from './+types/search';
import {getSeoMeta, getPaginationVariables} from '@shopify/hydrogen';
import {useLoaderData, useSearchParams, Form} from 'react-router';
import {Breadcrumb, Icon, Button} from '~/components';
import {ProductCard} from '~/components/commerce';

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
// GraphQL Query
// ============================================================================

const SEARCH_QUERY = `#graphql
  fragment SearchProduct on Product {
    id
    title
    handle
    vendor
    availableForSale
    tags
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
      maxVariantPrice {
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
  }
  query Search(
    $query: String!
    $first: Int
    $last: Int
    $startCursor: String
    $endCursor: String
    $country: CountryCode
    $language: LanguageCode
  ) @inContext(country: $country, language: $language) {
    products: search(
      query: $query
      types: PRODUCT
      first: $first
      last: $last
      before: $startCursor
      after: $endCursor
    ) {
      totalCount
      nodes {
        ... on Product {
          ...SearchProduct
        }
      }
      pageInfo {
        hasNextPage
        hasPreviousPage
        startCursor
        endCursor
      }
    }
  }
` as const;

// ============================================================================
// Loader
// ============================================================================

export async function loader({request, context}: Route.LoaderArgs) {
  const url = new URL(request.url);
  const searchTerm = url.searchParams.get('q') ?? '';

  if (!searchTerm) {
    return {searchTerm, products: null, totalCount: 0};
  }

  const paginationVariables = getPaginationVariables(request, {
    pageBy: 12,
  });

  const {products} = await context.storefront.query(SEARCH_QUERY, {
    variables: {
      query: searchTerm,
      ...paginationVariables,
      country: context.storefront.i18n.country,
      language: context.storefront.i18n.language,
    },
  });

  return {
    searchTerm,
    products: products.nodes,
    totalCount: products.totalCount,
    pageInfo: products.pageInfo,
  };
}

// ============================================================================
// Main Search Page
// ============================================================================

export default function SearchPage() {
  const {searchTerm, products, totalCount} = useLoaderData<typeof loader>();
  const [searchParams] = useSearchParams();

  const breadcrumbs = [{label: 'Home', url: '/'}, {label: 'Search'}];

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <Breadcrumb items={breadcrumbs} className="mb-6" />

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
            <SearchResults products={products} />
          ) : (
            <EmptySearchResults searchTerm={searchTerm} />
          )}
        </>
      ) : (
        <div className="py-12 text-center">
          <Icon
            name="search"
            size={64}
            className="mx-auto mb-4 text-text-muted"
          />
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
        <Icon
          name="search"
          size={20}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted"
        />
        <input
          type="search"
          name="q"
          defaultValue={defaultValue}
          placeholder="Search products..."
          autoComplete="off"
          className="w-full rounded-md border border-border bg-white py-2.5 pl-10 pr-4 text-base text-dark placeholder:text-text-muted focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
        />
      </div>
      <Button type="submit" size="default">
        Search
      </Button>
    </Form>
  );
}

// ============================================================================
// SearchResults Component
// ============================================================================

function SearchResults({products}: {products: any[]}) {
  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
      {products.map((product: any) => (
        <ProductCard
          key={product.id}
          product={{
            id: product.id,
            title: product.title,
            handle: product.handle,
            vendor: product.vendor,
            availableForSale: product.availableForSale,
            tags: product.tags,
            images: {
              nodes: product.featuredImage ? [product.featuredImage] : [],
            },
            priceRange: product.priceRange,
            compareAtPriceRange: product.compareAtPriceRange,
            variants: product.variants,
          }}
        />
      ))}
    </div>
  );
}

// ============================================================================
// EmptySearchResults Component
// ============================================================================

function EmptySearchResults({searchTerm}: {searchTerm: string}) {
  return (
    <div className="flex flex-col items-center py-16 text-center">
      <Icon name="search" size={64} className="mb-4 text-text-muted" />
      <h2 className="mb-2 text-xl font-semibold text-dark">No results found</h2>
      <p className="mb-6 max-w-md text-text-muted">
        We couldn&apos;t find anything for &ldquo;{searchTerm}&rdquo;. Try
        checking your spelling or using different search terms.
      </p>
      <Button as="link" to="/collections" variant="secondary">
        Browse Collections
      </Button>
    </div>
  );
}
