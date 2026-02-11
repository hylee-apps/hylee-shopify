import type {Route} from './+types/api.predictive-search';

// ============================================================================
// Predictive Search API Route (Resource Route — no UI)
// ============================================================================

const PREDICTIVE_SEARCH_QUERY = `#graphql
  fragment PredictiveProduct on Product {
    id
    title
    handle
    vendor
    featuredImage {
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
    variants(first: 1) {
      nodes {
        id
        availableForSale
        price {
          amount
          currencyCode
        }
      }
    }
  }
  fragment PredictiveCollection on Collection {
    id
    title
    handle
    image {
      url
      altText
      width
      height
    }
  }
  query PredictiveSearch(
    $query: String!
    $limit: Int!
    $limitScope: PredictiveSearchLimitScope!
    $country: CountryCode
    $language: LanguageCode
    $searchableFields: [SearchableField!]
  ) @inContext(country: $country, language: $language) {
    predictiveSearch(
      query: $query
      limit: $limit
      limitScope: $limitScope
      searchableFields: $searchableFields
      types: [PRODUCT, COLLECTION, QUERY]
    ) {
      products {
        ...PredictiveProduct
      }
      collections {
        ...PredictiveCollection
      }
      queries {
        text
        styledText
      }
    }
  }
` as const;

// ============================================================================
// Loader
// ============================================================================

export async function loader({request, context}: Route.LoaderArgs) {
  const url = new URL(request.url);
  const query = url.searchParams.get('q') ?? '';
  const limit = Math.min(Number(url.searchParams.get('limit') ?? 6), 10);

  if (!query) {
    return Response.json({products: [], collections: [], queries: []});
  }

  const {predictiveSearch} = await context.storefront.query(
    PREDICTIVE_SEARCH_QUERY,
    {
      variables: {
        query,
        limit,
        limitScope: 'EACH',
        country: context.storefront.i18n.country,
        language: context.storefront.i18n.language,
      },
    },
  );

  if (!predictiveSearch) {
    return Response.json({products: [], collections: [], queries: []});
  }

  return Response.json({
    products: predictiveSearch.products ?? [],
    collections: predictiveSearch.collections ?? [],
    queries: predictiveSearch.queries ?? [],
  });
}
