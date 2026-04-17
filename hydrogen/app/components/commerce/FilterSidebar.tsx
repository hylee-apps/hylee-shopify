import {useState} from 'react';
import {useTranslation} from 'react-i18next';
import {Link, useLocation, useNavigate} from 'react-router';
import type {Filter} from '@shopify/hydrogen/storefront-api-types';
import {buildSortUrl} from '~/lib/collection/filters';
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
import {X} from 'lucide-react';

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
// Category link list item — Figma: plain text label + count badge (no checkbox)
// ============================================================================

interface CategoryLinkItemProps {
  label: string;
  count?: number;
  isActive: boolean;
  href: string;
}

function CategoryLinkItem({
  label,
  count,
  isActive,
  href,
}: CategoryLinkItemProps) {
  return (
    <Link
      to={href}
      preventScrollReset
      className="flex items-center justify-between py-[8px] w-full group"
    >
      <span
        className={cn(
          'text-[14px] leading-[21px] transition-colors',
          isActive
            ? 'font-medium text-[#111827]'
            : 'font-normal text-[#374151] group-hover:text-[#111827]',
        )}
      >
        {label}
      </span>
      {count !== undefined && (
        <span className="bg-[#f3f4f6] px-[8px] py-[2px] rounded-[10px] text-[12px] text-[#9ca3af] leading-[18px] shrink-0 ml-2">
          {count}
        </span>
      )}
    </Link>
  );
}

// ============================================================================
// Checkbox filter item — Figma: teal checked state, 18px square, rounded-[2.5px]
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
      className="flex cursor-pointer items-center gap-[12px] py-1.5 group"
    >
      <Checkbox
        checked={isActive}
        tabIndex={-1}
        className="pointer-events-none size-[18px] rounded-[2.5px] data-[state=checked]:bg-secondary data-[state=checked]:border-secondary"
      />
      <span className="text-[14px] text-[#374151] leading-[21px] transition-colors group-hover:text-[#111827]">
        {label}
      </span>
      {count !== undefined && (
        <span className="ml-auto text-xs text-[#9ca3af]">({count})</span>
      )}
    </Link>
  );
}

// ============================================================================
// Price Range Filter — Figma: inputs + Apply btn + preset checkboxes
// ============================================================================

interface PriceRangeFilterProps {
  presetValues?: Filter['values'];
  searchParams: URLSearchParams;
}

function PriceRangeFilter({presetValues, searchParams}: PriceRangeFilterProps) {
  const {pathname} = useLocation();
  const navigate = useNavigate();
  const {t} = useTranslation();

  // Parse current custom price filter from URL
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

  function handleApply() {
    const min = minVal !== '' ? parseInt(minVal, 10) : undefined;
    const max = maxVal !== '' ? parseInt(maxVal, 10) : undefined;
    const url = buildPriceFilterUrl(
      pathname,
      new URLSearchParams(searchParams.toString()),
      isNaN(min as number) ? undefined : min,
      isNaN(max as number) ? undefined : max,
    );
    navigate(url, {preventScrollReset: true});
  }

  const activeFilters = searchParams.getAll('filter');

  return (
    <div className="flex flex-col gap-[12px]">
      {/* Min / Max inputs */}
      <div className="flex items-center gap-[12px]">
        <Input
          type="number"
          value={minVal}
          onChange={(e) => setMinVal(e.target.value)}
          placeholder={t('filter.min')}
          min={0}
          className="w-[80px] h-[34px] border-[#d1d5db] rounded-[8px] text-[14px] text-center [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
        />
        <span className="text-[#9ca3af] text-[16px] leading-[24px]">-</span>
        <Input
          type="number"
          value={maxVal}
          onChange={(e) => setMaxVal(e.target.value)}
          placeholder={t('filter.max')}
          min={0}
          className="w-[80px] h-[34px] border-[#d1d5db] rounded-[8px] text-[14px] text-center [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
        />
      </div>

      {/* Apply button — Figma: full-width teal, rounded-[8px], Medium 13px */}
      <button
        type="button"
        onClick={handleApply}
        className="w-full bg-[#2699a6] hover:bg-[#2699a6]/90 transition-colors rounded-[8px] px-[16px] py-[8px] font-medium text-[13px] text-white text-center"
      >
        {t('filter.apply')}
      </button>

      {/* Preset price range checkboxes (rendered only if Shopify returns values) */}
      {presetValues && presetValues.length > 0 && (
        <div className="flex flex-col gap-[12px] pt-[4px]">
          {presetValues.map((value) => {
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
      )}
    </div>
  );
}

// ============================================================================
// Expandable checkbox list
// ============================================================================

interface ExpandableListProps {
  items: Filter['values'];
  searchParams: URLSearchParams;
  pathname: string;
  initialShow?: number;
  /** Lowercase filter label used in "Show more {label}s" text, e.g. "brand" */
  filterLabel?: string;
}

function ExpandableList({
  items,
  searchParams,
  pathname,
  initialShow = 6,
  filterLabel,
}: ExpandableListProps) {
  const [showAll, setShowAll] = useState(false);
  const {t} = useTranslation();
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
          className="mt-2 h-auto px-0 text-secondary"
        >
          {showAll
            ? t('filter.showLess')
            : filterLabel
              ? t('filter.showMore', {label: filterLabel})
              : t('filter.showMoreCount', {count: items.length - initialShow})}
        </Button>
      )}
    </div>
  );
}

// ============================================================================
// Category link list (no checkboxes)
// ============================================================================

interface CategoryListProps {
  items: Filter['values'];
  searchParams: URLSearchParams;
  pathname: string;
}

function CategoryList({items, searchParams, pathname}: CategoryListProps) {
  const activeFilters = searchParams.getAll('filter');

  return (
    <div className="flex flex-col">
      {items.map((value) => {
        const inputStr =
          typeof value.input === 'string'
            ? value.input
            : JSON.stringify(value.input);
        const isActive = activeFilters.includes(inputStr);
        const href = buildFilterUrl(pathname, searchParams, inputStr, 'toggle');

        return (
          <CategoryLinkItem
            key={value.id}
            label={value.label}
            count={value.count}
            isActive={isActive}
            href={href}
          />
        );
      })}
    </div>
  );
}

// ============================================================================
// Filter Sections — shared between desktop sidebar and mobile Sheet
// ============================================================================

interface FilterSectionsProps {
  filters: Filter[];
  searchParams: URLSearchParams;
  pathname: string;
  className?: string;
}

// Static filter inputs — must match the encoded JSON used in URL params
const SALE_INPUT = JSON.stringify({tag: 'sale'});
const PROMO_INPUT = JSON.stringify({tag: 'promotion'});

function FilterSections({
  filters,
  searchParams,
  pathname,
  className,
}: FilterSectionsProps) {
  const {t} = useTranslation();
  const activeFilters = searchParams.getAll('filter');
  const currentSort = searchParams.get('sort');

  const defaultOpen = ['browse-by', ...filters.map((f) => f.id)];

  const priceKey =
    searchParams.getAll('filter').find((f) => f.includes('"price"')) ??
    'no-price';

  const saleHref = buildFilterUrl(pathname, searchParams, SALE_INPUT, 'toggle');
  const promoHref = buildFilterUrl(
    pathname,
    searchParams,
    PROMO_INPUT,
    'toggle',
  );
  const newArrivalsHref = buildSortUrl(pathname, searchParams, 'newest');

  return (
    <Accordion type="multiple" defaultValue={defaultOpen} className={className}>
      {/* ------------------------------------------------------------------ */}
      {/* Static "Browse By" section — always visible, not dependent on       */}
      {/* Shopify returning these as dynamic filter options.                  */}
      {/* ------------------------------------------------------------------ */}
      <AccordionItem value="browse-by" className="border-b border-[#e5e7eb]">
        <AccordionTrigger className="py-[14px] text-[14px] font-bold text-[#111827] tracking-[0.5px] uppercase hover:no-underline">
          {t('filter.browseBy')}
        </AccordionTrigger>
        <AccordionContent className="pb-[16px]">
          <div className="space-y-0.5">
            <CheckboxFilterItem
              label={t('sort.newest')}
              isActive={currentSort === 'newest'}
              href={newArrivalsHref}
            />
            <CheckboxFilterItem
              label={t('filter.onSale')}
              isActive={activeFilters.includes(SALE_INPUT)}
              href={saleHref}
            />
            <CheckboxFilterItem
              label={t('filter.promotions')}
              isActive={activeFilters.includes(PROMO_INPUT)}
              href={promoHref}
            />
          </div>
        </AccordionContent>
      </AccordionItem>

      {filters.map((filter) => {
        if (!filter.values || filter.values.length === 0) return null;

        const isPriceRange = filter.type === 'PRICE_RANGE';
        // Category filter renders as link list (not checkboxes)
        const isCategoryList =
          !isPriceRange &&
          (filter.label.toLowerCase() === 'category' ||
            filter.label.toLowerCase() === 'product type');

        return (
          <AccordionItem
            key={filter.id}
            value={filter.id}
            className="border-b border-[#e5e7eb]"
          >
            {/* Filter title — Figma: Bold 14px #111827 tracking-[0.5px] uppercase */}
            <AccordionTrigger className="py-[14px] text-[14px] font-bold text-[#111827] tracking-[0.5px] uppercase hover:no-underline">
              {filter.label}
            </AccordionTrigger>
            <AccordionContent className="pb-[16px]">
              {isPriceRange ? (
                <PriceRangeFilter
                  key={priceKey}
                  presetValues={
                    filter.values.length > 0 ? filter.values : undefined
                  }
                  searchParams={searchParams}
                />
              ) : isCategoryList ? (
                <CategoryList
                  items={filter.values}
                  searchParams={searchParams}
                  pathname={pathname}
                />
              ) : (
                <ExpandableList
                  items={filter.values}
                  searchParams={searchParams}
                  pathname={pathname}
                  filterLabel={filter.label.toLowerCase()}
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
 * FilterSidebar — redesigned per Figma node 5030:728 (PLP end-node).
 *
 * Desktop (lg+): white card `bg-white border border-[#e5e7eb] rounded-[12px] w-[240px]`,
 *   sticky top-[24px]. Header shows "Filters" + teal × clear button.
 *   Sections: Category (link list), Price Range (inputs + Apply + presets),
 *   Brand/Rating/Availability (teal checkboxes).
 *
 * Mobile (<lg): hidden; controlled by isOpen/onClose as a Sheet drawer.
 */
export function FilterSidebar({
  filters,
  searchParams: loaderSearchParams,
  isOpen = false,
  onClose,
  className = '',
}: FilterSidebarProps) {
  const {t} = useTranslation();
  const {pathname, search} = useLocation();
  const searchParams = new URLSearchParams(search);
  const hasActiveFilters = searchParams.getAll('filter').length > 0;

  const clearAllLink = clearAllFiltersUrl(pathname, searchParams);

  return (
    <>
      {/* ------------------------------------------------------------------ */}
      {/* Desktop — card sidebar                                              */}
      {/* ------------------------------------------------------------------ */}
      <aside
        className={cn(
          'hidden lg:block w-[240px] shrink-0 self-start sticky top-[24px]',
          className,
        )}
      >
        <div className="bg-white border border-[#e5e7eb] rounded-[12px] pb-[33px] pt-[21px] px-[21px] flex flex-col gap-[20px]">
          {/* Sidebar header — "Filters" + × clear */}
          <div className="flex items-center justify-between">
            <h2 className="font-semibold text-[16px] text-[#1f2937] leading-[24px]">
              {t('toolbar.filters')}
            </h2>
            {hasActiveFilters && (
              <Link
                to={clearAllLink}
                preventScrollReset
                className="p-[4px] rounded-[8px] hover:bg-[#f3f4f6] transition-colors"
                aria-label={t('filter.clearAll')}
              >
                <X size={13} className="text-secondary" />
              </Link>
            )}
          </div>

          {/* Filter sections */}
          <FilterSections
            filters={filters}
            searchParams={searchParams}
            pathname={pathname}
          />
        </div>
      </aside>

      {/* ------------------------------------------------------------------ */}
      {/* Mobile — Sheet drawer                                               */}
      {/* ------------------------------------------------------------------ */}
      <Sheet open={isOpen} onOpenChange={(open) => !open && onClose?.()}>
        <SheetContent side="left" className="w-80 overflow-y-auto pt-10">
          <SheetTitle className="sr-only">{t('toolbar.filters')}</SheetTitle>
          {/* Mobile sheet header */}
          <div className="flex items-center justify-between border-b border-[#e5e7eb] pb-4 mb-2">
            <h2 className="font-semibold text-[16px] text-[#1f2937] leading-[24px]">
              {t('toolbar.filters')}
            </h2>
            {hasActiveFilters && (
              <Link
                to={clearAllLink}
                preventScrollReset
                onClick={onClose}
                className="p-[4px] rounded-[8px] hover:bg-[#f3f4f6] transition-colors"
                aria-label={t('filter.clearAll')}
              >
                <X size={13} className="text-secondary" />
              </Link>
            )}
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
