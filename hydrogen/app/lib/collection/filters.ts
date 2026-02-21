import type {
  Filter,
  ProductFilter,
  ProductCollectionSortKeys,
} from '@shopify/hydrogen/storefront-api-types';

// ============================================================================
// Types
// ============================================================================

export interface AppliedFilter {
  label: string;
  filter: ProductFilter;
  urlToRemove: string;
}

export interface SortOption {
  label: string;
  value: string;
  sortKey: ProductCollectionSortKeys;
  reverse: boolean;
}

// ============================================================================
// Sort Configuration
// ============================================================================

export const SORT_OPTIONS: SortOption[] = [
  {label: 'Relevance', value: 'manual', sortKey: 'MANUAL', reverse: false},
  {
    label: 'Most Popular',
    value: 'best-selling',
    sortKey: 'BEST_SELLING',
    reverse: false,
  },
  {
    label: 'Price: Low to High',
    value: 'price-asc',
    sortKey: 'PRICE',
    reverse: false,
  },
  {
    label: 'Price: High to Low',
    value: 'price-desc',
    sortKey: 'PRICE',
    reverse: true,
  },
  {label: 'Newest', value: 'newest', sortKey: 'CREATED', reverse: true},
  {label: 'A-Z', value: 'title-asc', sortKey: 'TITLE', reverse: false},
];

const DEFAULT_SORT = SORT_OPTIONS[0];

// ============================================================================
// URL Parsing
// ============================================================================

/**
 * Parse ProductFilter[] from URL search params.
 *
 * Each active filter is stored as `?filter=<url-encoded-json>` where the JSON
 * matches the Storefront API `ProductFilter` input shape (same as FilterValue.input).
 */
export function parseFiltersFromSearchParams(
  searchParams: URLSearchParams,
): ProductFilter[] {
  const filters: ProductFilter[] = [];

  for (const value of searchParams.getAll('filter')) {
    try {
      filters.push(JSON.parse(value) as ProductFilter);
    } catch {
      // Skip malformed filter params
    }
  }

  return filters;
}

/**
 * Parse sort key and direction from `?sort=` URL param.
 */
export function parseSortFromSearchParams(searchParams: URLSearchParams): {
  sortKey: ProductCollectionSortKeys;
  reverse: boolean;
} {
  const sortValue = searchParams.get('sort');
  const match = SORT_OPTIONS.find((opt) => opt.value === sortValue);
  return {
    sortKey: match?.sortKey ?? DEFAULT_SORT.sortKey,
    reverse: match?.reverse ?? DEFAULT_SORT.reverse,
  };
}

/**
 * Get the current sort value string from URL params.
 */
export function getCurrentSort(searchParams: URLSearchParams): string {
  return searchParams.get('sort') ?? DEFAULT_SORT.value;
}

// ============================================================================
// Applied Filters
// ============================================================================

/**
 * Derive the list of applied filters by matching active URL params against
 * the available filters returned by the Storefront API.
 */
export function getAppliedFilters(
  searchParams: URLSearchParams,
  availableFilters: Filter[],
  pathname: string,
): AppliedFilter[] {
  const activeFilterParams = searchParams.getAll('filter');
  const applied: AppliedFilter[] = [];

  for (const paramValue of activeFilterParams) {
    let parsedInput: ProductFilter;
    try {
      parsedInput = JSON.parse(paramValue) as ProductFilter;
    } catch {
      continue;
    }

    // Find matching label from available filters
    let label = 'Filter';
    for (const filter of availableFilters) {
      for (const fv of filter.values) {
        if (
          fv.input === paramValue ||
          JSON.stringify(fv.input) === paramValue
        ) {
          label = `${filter.label}: ${fv.label}`;
          break;
        }
      }
    }

    // Special case for price range — format as readable label
    if (parsedInput.price) {
      const {min, max} = parsedInput.price;
      if (min != null && max != null) {
        label = `Price: $${min}–$${max}`;
      } else if (min != null) {
        label = `Price: $${min}+`;
      } else if (max != null) {
        label = `Price: Up to $${max}`;
      }
    }

    applied.push({
      label,
      filter: parsedInput,
      urlToRemove: buildFilterUrl(pathname, searchParams, paramValue, 'remove'),
    });
  }

  return applied;
}

// ============================================================================
// URL Building
// ============================================================================

/**
 * Build a URL that adds or removes a filter param.
 *
 * @param pathname - The collection pathname (e.g. `/collections/kitchen`)
 * @param searchParams - Current URL search params
 * @param filterInput - The JSON string of the filter value's `input` field
 * @param action - Whether to add ('toggle on') or remove ('toggle off') the filter
 */
export function buildFilterUrl(
  pathname: string,
  searchParams: URLSearchParams,
  filterInput: string,
  action: 'add' | 'remove' | 'toggle',
): string {
  const params = new URLSearchParams(searchParams);

  // Remove pagination when filters change
  params.delete('cursor');
  params.delete('direction');

  const currentFilters = params.getAll('filter');
  const isActive = currentFilters.includes(filterInput);

  if (action === 'toggle') {
    action = isActive ? 'remove' : 'add';
  }

  if (action === 'remove') {
    params.delete('filter');
    for (const f of currentFilters) {
      if (f !== filterInput) {
        params.append('filter', f);
      }
    }
  } else if (action === 'add' && !isActive) {
    params.append('filter', filterInput);
  }

  const qs = params.toString();
  return qs ? `${pathname}?${qs}` : pathname;
}

/**
 * Build a URL with a price range filter, replacing any existing price filter.
 */
export function buildPriceFilterUrl(
  pathname: string,
  searchParams: URLSearchParams,
  min: number | undefined,
  max: number | undefined,
): string {
  const params = new URLSearchParams(searchParams);

  // Remove pagination
  params.delete('cursor');
  params.delete('direction');

  // Remove existing price filters
  const currentFilters = params.getAll('filter');
  params.delete('filter');
  for (const f of currentFilters) {
    try {
      const parsed = JSON.parse(f) as ProductFilter;
      if (!parsed.price) {
        params.append('filter', f);
      }
    } catch {
      params.append('filter', f);
    }
  }

  // Add new price filter if values provided
  if (min != null || max != null) {
    const priceFilter: ProductFilter = {
      price: {
        ...(min != null ? {min} : {}),
        ...(max != null ? {max} : {}),
      },
    };
    params.append('filter', JSON.stringify(priceFilter));
  }

  const qs = params.toString();
  return qs ? `${pathname}?${qs}` : pathname;
}

/**
 * Build a URL with a sort param, preserving existing filters.
 */
export function buildSortUrl(
  pathname: string,
  searchParams: URLSearchParams,
  sortValue: string,
): string {
  const params = new URLSearchParams(searchParams);

  // Remove pagination when sort changes
  params.delete('cursor');
  params.delete('direction');

  if (sortValue === DEFAULT_SORT.value) {
    params.delete('sort');
  } else {
    params.set('sort', sortValue);
  }

  const qs = params.toString();
  return qs ? `${pathname}?${qs}` : pathname;
}

/**
 * Return the base collection URL with all filters and pagination cleared.
 * Preserves sort if set.
 */
export function clearAllFiltersUrl(
  pathname: string,
  searchParams?: URLSearchParams,
): string {
  if (!searchParams) return pathname;

  const params = new URLSearchParams();
  const sort = searchParams.get('sort');
  if (sort) params.set('sort', sort);

  const qs = params.toString();
  return qs ? `${pathname}?${qs}` : pathname;
}
