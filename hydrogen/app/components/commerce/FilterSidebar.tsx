'use client';

import {useState} from 'react';
import {Link, useLocation, useNavigate} from 'react-router';
import type {Filter} from '@shopify/hydrogen/storefront-api-types';
import {AccordionItem} from '../navigation/Accordion';
import {Icon} from '../display/Icon';
import {
  buildFilterUrl,
  buildPriceFilterUrl,
  clearAllFiltersUrl,
  type AppliedFilter,
} from '~/lib/collection/filters';

export interface FilterSidebarProps {
  filters: Filter[];
  appliedFilters: AppliedFilter[];
  searchParams: URLSearchParams;
  className?: string;
}

/**
 * FilterSidebar — migrated from the filter sidebar in
 * theme/sections/main-collection-product-grid.liquid
 *
 * Server-driven faceted filtering via Storefront API. Each filter option
 * is a `<Link>` so filtering works without JavaScript.
 */
export function FilterSidebar({
  filters,
  appliedFilters,
  searchParams,
  className,
}: FilterSidebarProps) {
  const {pathname} = useLocation();

  return (
    <aside className={`filter-sidebar ${className ?? ''}`}>
      {/* Applied filters */}
      {appliedFilters.length > 0 && (
        <div className="mb-4">
          <div className="mb-2 flex items-center justify-between">
            <span className="text-sm font-medium text-slate-900">
              Active Filters
            </span>
            <Link
              to={clearAllFiltersUrl(pathname, searchParams)}
              className="text-xs text-primary hover:underline"
              preventScrollReset
            >
              Clear All
            </Link>
          </div>
          <div className="flex flex-wrap gap-2">
            {appliedFilters.map((af) => (
              <Link
                key={af.urlToRemove}
                to={af.urlToRemove}
                preventScrollReset
                className="inline-flex items-center gap-1 rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs font-medium text-primary transition-colors hover:bg-primary/20"
              >
                {af.label}
                <Icon name="x" size={12} />
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Filter groups */}
      <div className="divide-y divide-slate-200">
        {filters.map((filter) => (
          <FilterGroup
            key={filter.id}
            filter={filter}
            searchParams={searchParams}
            pathname={pathname}
          />
        ))}
      </div>
    </aside>
  );
}

// ============================================================================
// FilterGroup — renders a single filter as an AccordionItem
// ============================================================================

function FilterGroup({
  filter,
  searchParams,
  pathname,
}: {
  filter: Filter;
  searchParams: URLSearchParams;
  pathname: string;
}) {
  const activeCount = getActiveCountForFilter(filter, searchParams);
  const title = (
    <span className="flex items-center gap-2">
      {filter.label}
      {activeCount > 0 && (
        <span className="inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-primary px-1.5 text-xs font-medium text-white">
          {activeCount}
        </span>
      )}
    </span>
  );

  if (filter.type === 'PRICE_RANGE') {
    return (
      <AccordionItem id={filter.id} title={title} defaultOpen>
        <PriceRangeFilter
          filter={filter}
          searchParams={searchParams}
          pathname={pathname}
        />
      </AccordionItem>
    );
  }

  return (
    <AccordionItem id={filter.id} title={title} defaultOpen>
      <div className="space-y-1">
        {filter.values.map((filterValue) => {
          const input =
            typeof filterValue.input === 'string'
              ? filterValue.input
              : JSON.stringify(filterValue.input);
          const isActive = searchParams.getAll('filter').includes(input);
          const url = buildFilterUrl(pathname, searchParams, input, 'toggle');

          return (
            <Link
              key={filterValue.id}
              to={url}
              preventScrollReset
              className={`flex items-center justify-between rounded-md px-2 py-1.5 text-sm transition-colors ${
                isActive
                  ? 'bg-primary/10 font-medium text-primary'
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              <span className="flex items-center gap-2">
                <span
                  className={`flex h-4 w-4 shrink-0 items-center justify-center rounded border transition-colors ${
                    isActive ? 'border-primary bg-primary' : 'border-slate-300'
                  }`}
                >
                  {isActive && (
                    <Icon name="check" size={10} className="text-white" />
                  )}
                </span>
                {filterValue.label}
              </span>
              <span className="text-xs text-slate-400">
                ({filterValue.count})
              </span>
            </Link>
          );
        })}
      </div>
    </AccordionItem>
  );
}

// ============================================================================
// PriceRangeFilter
// ============================================================================

function PriceRangeFilter({
  filter,
  searchParams,
  pathname,
}: {
  filter: Filter;
  searchParams: URLSearchParams;
  pathname: string;
}) {
  const navigate = useNavigate();

  // Extract current price range from active filters
  const activeFilters = searchParams.getAll('filter');
  let currentMin = '';
  let currentMax = '';
  for (const f of activeFilters) {
    try {
      const parsed = JSON.parse(f) as Record<string, Record<string, number>>;
      if (parsed.price) {
        if (parsed.price.min != null) currentMin = String(parsed.price.min);
        if (parsed.price.max != null) currentMax = String(parsed.price.max);
      }
    } catch {
      // skip
    }
  }

  const [min, setMin] = useState(currentMin);
  const [max, setMax] = useState(currentMax);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const minVal = min ? Number(min) : undefined;
    const maxVal = max ? Number(max) : undefined;
    const url = buildPriceFilterUrl(pathname, searchParams, minVal, maxVal);
    navigate(url);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div className="flex items-center gap-2">
        <div className="flex-1">
          <label className="sr-only" htmlFor="price-min">
            Min price
          </label>
          <div className="relative">
            <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-sm text-slate-400">
              $
            </span>
            <input
              id="price-min"
              type="number"
              min="0"
              step="1"
              placeholder="Min"
              value={min}
              onChange={(e) => setMin(e.target.value)}
              className="w-full rounded-lg border border-slate-300 py-2 pl-6 pr-2 text-sm text-slate-700 placeholder:text-slate-400 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>
        </div>
        <span className="text-sm text-slate-400">—</span>
        <div className="flex-1">
          <label className="sr-only" htmlFor="price-max">
            Max price
          </label>
          <div className="relative">
            <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-sm text-slate-400">
              $
            </span>
            <input
              id="price-max"
              type="number"
              min="0"
              step="1"
              placeholder="Max"
              value={max}
              onChange={(e) => setMax(e.target.value)}
              className="w-full rounded-lg border border-slate-300 py-2 pl-6 pr-2 text-sm text-slate-700 placeholder:text-slate-400 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>
        </div>
      </div>
      <button
        type="submit"
        className="w-full rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-primary/90"
      >
        Apply
      </button>
    </form>
  );
}

// ============================================================================
// Helpers
// ============================================================================

function getActiveCountForFilter(
  filter: Filter,
  searchParams: URLSearchParams,
): number {
  const activeParams = searchParams.getAll('filter');
  let count = 0;

  for (const filterValue of filter.values) {
    const input =
      typeof filterValue.input === 'string'
        ? filterValue.input
        : JSON.stringify(filterValue.input);

    if (activeParams.includes(input)) {
      count++;
    }
  }

  // Also check for price range
  if (filter.type === 'PRICE_RANGE') {
    for (const param of activeParams) {
      try {
        const parsed = JSON.parse(param) as Record<string, unknown>;
        if (parsed.price) count++;
      } catch {
        // skip
      }
    }
  }

  return count;
}
