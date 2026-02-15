import {useState, useCallback} from 'react';
import {Link, useLocation, useNavigate} from 'react-router';
import type {Filter} from '@shopify/hydrogen/storefront-api-types';
import {Icon} from '../display/Icon';
import {
  buildFilterUrl,
  buildPriceFilterUrl,
  clearAllFiltersUrl,
} from '~/lib/collection/filters';

// ============================================================================
// Types
// ============================================================================

export interface FilterSidebarProps {
  /** Filters returned from the Storefront API */
  filters: Filter[];
  /** Current URL search params */
  searchParams: URLSearchParams;
  /** Whether the mobile drawer is open */
  isOpen?: boolean;
  /** Callback to close the mobile drawer */
  onClose?: () => void;
  /** Additional class name */
  className?: string;
}

// ============================================================================
// Sub-components
// ============================================================================

interface FilterSectionProps {
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
}

function FilterSection({
  title,
  children,
  defaultOpen = true,
}: FilterSectionProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className="border-b border-border py-5">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex w-full items-center justify-between text-left"
      >
        <span className="text-sm font-bold text-dark">{title}</span>
        <Icon
          name={isOpen ? 'chevron-up' : 'chevron-down'}
          size={16}
          className="text-text-muted"
        />
      </button>
      {isOpen && <div className="mt-4">{children}</div>}
    </div>
  );
}

interface CheckboxFilterItemProps {
  label: string;
  count?: number;
  isActive: boolean;
  href: string;
}

function CheckboxFilterItem({
  label,
  count,
  isActive,
  href,
}: CheckboxFilterItemProps) {
  return (
    <Link
      to={href}
      preventScrollReset
      className="flex items-center gap-2.5 py-1.5 group"
    >
      <span
        className={`flex h-4 w-4 shrink-0 items-center justify-center rounded border transition-colors ${
          isActive
            ? 'border-[#3a4980] bg-[#3a4980]'
            : 'border-border group-hover:border-text-muted'
        }`}
      >
        {isActive && (
          <svg
            width="10"
            height="10"
            viewBox="0 0 24 24"
            fill="none"
            stroke="white"
            strokeWidth="4"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <polyline points="20 6 9 17 4 12" />
          </svg>
        )}
      </span>
      <span className="text-sm text-text-muted group-hover:text-dark transition-colors">
        {label}
      </span>
      {count !== undefined && (
        <span className="ml-auto text-xs text-text-muted">({count})</span>
      )}
    </Link>
  );
}

// ============================================================================
// Price Range
// ============================================================================

function PriceRangeFilter({
  searchParams,
}: {
  searchParams: URLSearchParams;
}) {
  const {pathname} = useLocation();
  const navigate = useNavigate();

  // Parse current price filter from search params
  let currentMin = 0;
  let currentMax = 200;
  for (const val of searchParams.getAll('filter')) {
    try {
      const parsed = JSON.parse(val) as Record<string, Record<string, number>>;
      if (parsed.price) {
        if (parsed.price.min != null) currentMin = parsed.price.min;
        if (parsed.price.max != null) currentMax = parsed.price.max;
      }
    } catch {
      // skip
    }
  }

  const [minVal, setMinVal] = useState(String(currentMin));
  const [maxVal, setMaxVal] = useState(String(currentMax));

  const applyPrice = useCallback(() => {
    const min = parseInt(minVal, 10) || 0;
    const max = parseInt(maxVal, 10) || undefined;
    const url = buildPriceFilterUrl(pathname, searchParams, min, max);
    navigate(url, {preventScrollReset: true});
  }, [minVal, maxVal, pathname, searchParams, navigate]);

  return (
    <div className="flex items-center gap-3">
      <input
        type="number"
        value={minVal}
        onChange={(e) => setMinVal(e.target.value)}
        onBlur={applyPrice}
        onKeyDown={(e) => e.key === 'Enter' && applyPrice()}
        placeholder="0"
        min={0}
        className="w-16 rounded-md border border-border px-2 py-1.5 text-center text-sm text-dark focus:border-[#3a4980] focus:outline-none [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
      />
      <span className="text-xs text-text-muted">to</span>
      <input
        type="number"
        value={maxVal}
        onChange={(e) => setMaxVal(e.target.value)}
        onBlur={applyPrice}
        onKeyDown={(e) => e.key === 'Enter' && applyPrice()}
        placeholder="200"
        min={0}
        className="w-16 rounded-md border border-border px-2 py-1.5 text-center text-sm text-dark focus:border-[#3a4980] focus:outline-none [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
      />
    </div>
  );
}

// ============================================================================
// Expandable List Helper
// ============================================================================

interface ExpandableListProps {
  items: Filter['values'];
  searchParams: URLSearchParams;
  pathname: string;
  initialShow?: number;
}

function ExpandableList({
  items,
  searchParams,
  pathname,
  initialShow = 6,
}: ExpandableListProps) {
  const [showAll, setShowAll] = useState(false);
  const activeFilters = searchParams.getAll('filter');

  const displayed = showAll ? items : items.slice(0, initialShow);
  const hasMore = items.length > initialShow;

  return (
    <div>
      <div className="space-y-0.5">
        {displayed.map((value) => {
          const inputStr =
            typeof value.input === 'string'
              ? value.input
              : JSON.stringify(value.input);
          const isActive = activeFilters.includes(inputStr);
          const href = buildFilterUrl(
            pathname,
            searchParams,
            inputStr,
            'toggle',
          );

          return (
            <CheckboxFilterItem
              key={value.id}
              label={value.label}
              count={value.count}
              isActive={isActive}
              href={href}
            />
          );
        })}
      </div>
      {hasMore && (
        <button
          type="button"
          onClick={() => setShowAll(!showAll)}
          className="mt-2 text-xs font-medium text-[#3a4980] hover:underline"
        >
          {showAll ? 'Show less' : 'Show more'}
        </button>
      )}
    </div>
  );
}

// ============================================================================
// Main Component
// ============================================================================

/**
 * FilterSidebar — collapsible filter panel for collection pages.
 *
 * On desktop it renders as a static left sidebar.
 * On mobile it renders as a slide-over drawer (controlled by isOpen/onClose).
 */
export function FilterSidebar({
  filters,
  searchParams,
  isOpen = false,
  onClose,
  className = '',
}: FilterSidebarProps) {
  const {pathname} = useLocation();
  const hasActiveFilters = searchParams.getAll('filter').length > 0;

  const filterContent = (
    <div className={className}>
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-border">
        <h2 className="text-lg font-bold text-dark">Filters</h2>
        <div className="flex items-center gap-3">
          {hasActiveFilters && (
            <Link
              to={clearAllFiltersUrl(pathname, searchParams)}
              preventScrollReset
              className="text-xs font-medium text-text-muted hover:text-dark transition-colors border border-border rounded-md px-3 py-1"
            >
              Clear All
            </Link>
          )}
          {/* Mobile close button */}
          {onClose && (
            <button
              type="button"
              onClick={onClose}
              className="lg:hidden flex items-center justify-center w-8 h-8 rounded-full hover:bg-surface"
              aria-label="Close filters"
            >
              <Icon name="x" size={18} />
            </button>
          )}
        </div>
      </div>

      {/* Filter Sections */}
      {filters.map((filter) => {
        // Skip empty filters
        if (!filter.values || filter.values.length === 0) return null;

        const isPriceFilter = filter.type === 'PRICE_RANGE';

        if (isPriceFilter) {
          return (
            <FilterSection key={filter.id} title={filter.label}>
              <PriceRangeFilter searchParams={searchParams} />
            </FilterSection>
          );
        }

        return (
          <FilterSection key={filter.id} title={filter.label}>
            <ExpandableList
              items={filter.values}
              searchParams={searchParams}
              pathname={pathname}
            />
          </FilterSection>
        );
      })}
    </div>
  );

  return (
    <>
      {/* Desktop: static sidebar */}
      <aside className="hidden lg:block w-60 shrink-0">
        {filterContent}
      </aside>

      {/* Mobile: slide-over drawer */}
      {isOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/30"
            onClick={onClose}
            aria-hidden="true"
          />
          {/* Drawer */}
          <div className="absolute inset-y-0 left-0 flex w-80 max-w-full flex-col bg-white shadow-xl">
            <div className="flex-1 overflow-y-auto px-5 py-5">
              {filterContent}
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default FilterSidebar;
