'use client';

import {useState, useRef, useEffect} from 'react';
import {Link, useLocation, useNavigate} from 'react-router';
import type {Filter} from '@shopify/hydrogen/storefront-api-types';
import {
  buildFilterUrl,
  buildPriceFilterUrl,
  clearAllFiltersUrl,
} from '~/lib/collection/filters';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '~/components/ui/accordion';
import {Checkbox} from '~/components/ui/checkbox';
import {Input} from '~/components/ui/input';
import {Button} from '~/components/ui/button';
import {Sheet, SheetContent, SheetTitle} from '~/components/ui/sheet';
import {cn} from '~/lib/utils';

// ============================================================================
// Types
// ============================================================================

export interface FilterSidebarProps {
  /** Filters returned from the Storefront API */
  filters: Filter[];
  /** Current URL search params */
  searchParams: URLSearchParams;
  /** Whether the mobile Sheet drawer is open */
  isOpen?: boolean;
  /** Called when the mobile Sheet drawer should close */
  onClose?: () => void;
  /** Additional class name */
  className?: string;
}

// ============================================================================
// Sub-components
// ============================================================================

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
      className="flex cursor-pointer items-center gap-2.5 py-1.5 group"
    >
      <Checkbox
        checked={isActive}
        tabIndex={-1}
        className="pointer-events-none data-[state=checked]:bg-primary data-[state=checked]:border-primary"
      />
      <span className="text-sm text-text-muted transition-colors group-hover:text-dark">
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

function PriceRangeFilter({searchParams}: {searchParams: URLSearchParams}) {
  const {pathname, search} = useLocation();
  const navigate = useNavigate();

  // Parse current price filter from the URL params passed in (URL-derived, optimistic)
  let initialMin = '';
  let initialMax = '';
  for (const val of searchParams.getAll('filter')) {
    try {
      const parsed = JSON.parse(val) as Record<string, Record<string, number>>;
      if (parsed.price) {
        if (parsed.price.min != null) initialMin = String(parsed.price.min);
        if (parsed.price.max != null) initialMax = String(parsed.price.max);
      }
    } catch {
      // skip
    }
  }

  const [minVal, setMinVal] = useState(initialMin);
  const [maxVal, setMaxVal] = useState(initialMax);
  // Skip navigation on the first render — only fire when user actually types
  const isFirstRender = useRef(true);

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }

    const timer = setTimeout(() => {
      const min = minVal !== '' ? parseInt(minVal, 10) : undefined;
      const max = maxVal !== '' ? parseInt(maxVal, 10) : undefined;
      const url = buildPriceFilterUrl(
        pathname,
        new URLSearchParams(search),
        isNaN(min as number) ? undefined : min,
        isNaN(max as number) ? undefined : max,
      );
      navigate(url, {preventScrollReset: true});
    }, 600);

    return () => clearTimeout(timer);
  }, [minVal, maxVal]);

  return (
    <div className="flex items-center gap-3">
      <Input
        type="number"
        value={minVal}
        onChange={(e) => setMinVal(e.target.value)}
        placeholder="Min"
        min={0}
        className="w-16 text-center text-sm [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
      />
      <span className="text-xs text-text-muted">to</span>
      <Input
        type="number"
        value={maxVal}
        onChange={(e) => setMaxVal(e.target.value)}
        placeholder="Max"
        min={0}
        className="w-16 text-center text-sm [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
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
        <Button
          type="button"
          variant="link"
          size="xs"
          onClick={() => setShowAll(!showAll)}
          className="mt-2 h-auto px-0 text-primary"
        >
          {showAll ? 'Show less' : 'Show more'}
        </Button>
      )}
    </div>
  );
}

// ============================================================================
// Filter Sections (shared between desktop sidebar and mobile Sheet)
// ============================================================================

interface FilterSectionsProps {
  filters: Filter[];
  searchParams: URLSearchParams;
  pathname: string;
  className?: string;
}

function FilterSections({
  filters,
  searchParams,
  pathname,
  className,
}: FilterSectionsProps) {
  const defaultOpen = filters.map((f) => f.id);

  // Derive a key for PriceRangeFilter so it resets when the price filter is
  // cleared externally (e.g. "Clear All"), while staying mounted during debounce.
  const priceKey =
    searchParams.getAll('filter').find((f) => f.includes('"price"')) ??
    'no-price';

  return (
    <Accordion type="multiple" defaultValue={defaultOpen} className={className}>
      {filters.map((filter) => {
        if (!filter.values || filter.values.length === 0) return null;

        const isPriceFilter = filter.type === 'PRICE_RANGE';

        return (
          <AccordionItem key={filter.id} value={filter.id}>
            <AccordionTrigger className="py-5 text-sm font-bold text-dark hover:no-underline">
              {filter.label}
            </AccordionTrigger>
            <AccordionContent>
              {isPriceFilter ? (
                <PriceRangeFilter key={priceKey} searchParams={searchParams} />
              ) : (
                <ExpandableList
                  items={filter.values}
                  searchParams={searchParams}
                  pathname={pathname}
                />
              )}
            </AccordionContent>
          </AccordionItem>
        );
      })}
    </Accordion>
  );
}

// ============================================================================
// Main Component
// ============================================================================

/**
 * FilterSidebar — filter panel for collection pages.
 *
 * Desktop (lg+): always-visible static left sidebar.
 * Mobile (<lg): hidden; controlled by isOpen/onClose as a Sheet drawer.
 */
export function FilterSidebar({
  filters,
  searchParams: loaderSearchParams,
  isOpen = false,
  onClose,
  className = '',
}: FilterSidebarProps) {
  const {pathname, search} = useLocation();
  // Derive searchParams from the current URL so filter state is optimistic:
  // the checkboxes reflect the URL immediately after navigate(), before the
  // loader finishes, rather than waiting for fresh loaderData.
  const searchParams = new URLSearchParams(search);
  const hasActiveFilters = searchParams.getAll('filter').length > 0;

  const clearAllLink = (
    <Button variant="outline" size="xs" asChild>
      <Link to={clearAllFiltersUrl(pathname, searchParams)} preventScrollReset>
        Clear All
      </Link>
    </Button>
  );

  return (
    <>
      {/* ------------------------------------------------------------------ */}
      {/* Desktop — always visible static sidebar                            */}
      {/* ------------------------------------------------------------------ */}
      <aside className={cn('hidden lg:block w-60 shrink-0', className)}>
        <div className="flex items-center justify-between border-b border-border pb-4">
          <h2 className="text-lg font-bold text-dark">Filters</h2>
          {hasActiveFilters && clearAllLink}
        </div>
        <FilterSections
          filters={filters}
          searchParams={searchParams}
          pathname={pathname}
        />
      </aside>

      {/* ------------------------------------------------------------------ */}
      {/* Mobile — Sheet drawer                                               */}
      {/* ------------------------------------------------------------------ */}
      <Sheet open={isOpen} onOpenChange={(open) => !open && onClose?.()}>
        <SheetContent side="left" className="w-80 overflow-y-auto pt-10">
          <SheetTitle className="sr-only">Filters</SheetTitle>
          <div className="flex items-center justify-between border-b border-border pb-4">
            <h2 className="text-lg font-bold text-dark">Filters</h2>
            {hasActiveFilters && clearAllLink}
          </div>
          <FilterSections
            filters={filters}
            searchParams={searchParams}
            pathname={pathname}
          />
        </SheetContent>
      </Sheet>
    </>
  );
}

export default FilterSidebar;
