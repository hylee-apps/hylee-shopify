/**
 * Searchanise API client
 *
 * Searchanise indexes the Shopify product catalog and provides search results
 * enriched with synonym matching. This module is server-only — the API key
 * must never be exposed to the browser.
 *
 * Docs: https://docs.searchanise.io/search-api/
 *
 * Environment variables required:
 *   SEARCHANISE_API_KEY — store API key from the Searchanise dashboard
 */

// ============================================================================
// Types
// ============================================================================

export interface SearchaniseProduct {
  /** Shopify product ID (numeric string) */
  product_id: string;
  title: string;
  handle: string;
  /** Absolute URL to the product page */
  link: string;
  /** Primary image URL */
  image_link: string | null;
  price: number;
  /** Original (compare-at) price, null if not on sale */
  compare_at_price: number | null;
  vendor: string;
  product_type: string;
  tags: string[];
  available: boolean;
  /** Shopify variant ID for the default variant (numeric string from add_to_cart_id) */
  add_to_cart_id: string;
}

export interface SearchaniseSuggestion {
  value: string;
  /** Number of products that match this suggestion */
  count: number;
}

export interface SearchaniseSearchResult {
  products: SearchaniseProduct[];
  totalCount: number;
  page: number;
  pageSize: number;
  suggestions: SearchaniseSuggestion[];
}

export interface SearchaniseAutocompleteResult {
  suggestions: SearchaniseSuggestion[];
  /** Matching products for the instant-results panel */
  products: SearchaniseProduct[];
}

export interface SearchOptions {
  page?: number;
  pageSize?: number;
}

// ============================================================================
// Constants
// ============================================================================

// Actual Searchanise search API base URL (not the marketing site searchanise.io)
const SEARCH_BASE_URL = 'https://searchserverapi1.com/getwidgets';

// ============================================================================
// Internal helpers
// ============================================================================

/**
 * Derives the Shopify product handle from the `link` field returned by the API.
 * Links are typically "/products/<handle>" or absolute URLs ending in the same.
 */
function handleFromLink(link: string): string {
  if (!link) return '';
  const match = link.match(/\/products\/([^/?#]+)/);
  return match ? match[1] : '';
}

/**
 * Maps a raw Searchanise item object to the typed SearchaniseProduct shape.
 * Field names follow the Searchanise getwidgets response format.
 */
function normalizeProduct(raw: Record<string, unknown>): SearchaniseProduct {
  const link = String(raw.link ?? '');
  // `list_price` is the original (compare-at) price in Searchanise responses
  const listPrice = Number(raw.list_price ?? raw.compare_at_price ?? 0);

  return {
    product_id: String(raw.product_id ?? raw.id ?? ''),
    title: String(raw.title ?? ''),
    handle: String(raw.handle ?? handleFromLink(link)),
    link,
    image_link:
      raw.image_link != null && raw.image_link !== ''
        ? String(raw.image_link)
        : null,
    price: Number(raw.price ?? 0),
    compare_at_price: listPrice > 0 ? listPrice : null,
    vendor: String(raw.vendor ?? ''),
    product_type: String(raw.product_type ?? raw.category ?? ''),
    tags: Array.isArray(raw.tags)
      ? (raw.tags as string[]).map(String)
      : String(raw.tags ?? '')
          .split(',')
          .map((t) => t.trim())
          .filter(Boolean),
    // `quantity` is a numeric string in the API response; "0" means out of stock
    available: raw.quantity !== undefined ? Number(raw.quantity) > 0 : true,
    // `add_to_cart_id` is the numeric Shopify variant ID for the default variant
    add_to_cart_id: String(raw.add_to_cart_id ?? ''),
  };
}

/**
 * Normalises the suggestions field.
 * Searchanise returns suggestions as either strings or {value, count} objects.
 */
function normalizeSuggestions(raw: unknown[]): SearchaniseSuggestion[] {
  return raw.map((s) => {
    if (typeof s === 'string') return {value: s, count: 0};
    const obj = s as Record<string, unknown>;
    return {
      value: String(obj.value ?? obj.suggest ?? obj.query ?? ''),
      count: Number(obj.count ?? obj.totalItems ?? 0),
    };
  });
}

/**
 * Performs a fetch to the Searchanise widget API.
 * Throws on non-2xx responses or malformed JSON.
 */
async function fetchSearchanise(
  params: Record<string, string>,
): Promise<Record<string, unknown>> {
  const url = new URL(SEARCH_BASE_URL);
  for (const [key, value] of Object.entries(params)) {
    url.searchParams.set(key, value);
  }

  const response = await fetch(url.toString(), {
    headers: {Accept: 'application/json'},
  });

  if (!response.ok) {
    throw new Error(
      `Searchanise API error: ${response.status} ${response.statusText}`,
    );
  }

  const json = (await response.json()) as Record<string, unknown>;

  // The API returns {"error": "ERROR_CODE"} on auth/index failures
  if (json.error) {
    throw new Error(`Searchanise API returned error: ${json.error}`);
  }

  return json;
}

// ============================================================================
// Public API
// ============================================================================

/**
 * Full product search via Searchanise.
 *
 * Replaces the Shopify Storefront API `search` query with Searchanise results
 * that include synonym matching.
 */
export async function searchProducts(
  apiKey: string,
  query: string,
  options: SearchOptions = {},
): Promise<SearchaniseSearchResult> {
  const {page = 1, pageSize = 12} = options;
  const startIndex = (page - 1) * pageSize;

  const data = await fetchSearchanise({
    apiKey,
    q: query,
    startIndex: String(startIndex),
    maxResults: String(pageSize),
    output: 'json',
  });

  const items = Array.isArray(data.items)
    ? (data.items as Record<string, unknown>[]).map(normalizeProduct)
    : [];

  const totalCount = Number(data.totalItems ?? items.length);

  const rawSuggestions = Array.isArray(data.suggestions)
    ? (data.suggestions as unknown[])
    : [];

  return {
    products: items,
    totalCount,
    page,
    pageSize,
    suggestions: normalizeSuggestions(rawSuggestions),
  };
}

/**
 * Lightweight autocomplete query — returns query suggestions and a small
 * set of matching products for the instant-results dropdown.
 */
export async function getAutocompleteSuggestions(
  apiKey: string,
  query: string,
): Promise<SearchaniseAutocompleteResult> {
  if (!query.trim()) {
    return {suggestions: [], products: []};
  }

  const data = await fetchSearchanise({
    apiKey,
    q: query,
    maxResults: '5',
    output: 'json',
  });

  const rawSuggestions = Array.isArray(data.suggestions)
    ? (data.suggestions as unknown[])
    : [];

  const items = Array.isArray(data.items)
    ? (data.items as Record<string, unknown>[]).map(normalizeProduct)
    : [];

  return {
    suggestions: normalizeSuggestions(rawSuggestions),
    products: items,
  };
}
