'use client';

import {SlidersHorizontal, LayoutGrid, List} from 'lucide-react';
import {SortSelect} from './SortSelect';
import {Button} from '~/components/ui/button';
import {cn} from '~/lib/utils';

export interface CollectionToolbarProps {
  productCount: number;
  totalCount?: number;
  viewMode?: 'grid' | 'list';
  onViewModeChange?: (mode: 'grid' | 'list') => void;
  searchParams: URLSearchParams;
  /** Opens the mobile filter drawer — button is hidden on lg+ */
  onOpenMobileFilters?: () => void;
  className?: string;
}

/**
 * CollectionToolbar — toolbar above the product grid with count, sort,
 * mobile filter button, and optional view toggle.
 */
export function CollectionToolbar({
  productCount,
  totalCount,
  viewMode,
  onViewModeChange,
  searchParams,
  onOpenMobileFilters,
  className,
}: CollectionToolbarProps) {
  return (
    <div
      className={`flex flex-wrap items-center justify-between gap-3 py-5 ${className ?? ''}`}
    >
      {/* Result count */}
      <p className="text-sm font-medium text-dark">
        Showing <span className="font-semibold">{productCount}</span>{' '}
        {productCount === 1 ? 'Result' : 'Results'}
        {totalCount !== undefined && (
          <>
            {' '}
            from total <span className="font-semibold">{totalCount}</span>
          </>
        )}
      </p>

      <div className="flex items-center gap-3">
        {/* Mobile filter button — hidden on desktop (lg+) */}
        {onOpenMobileFilters && (
          <Button
            type="button"
            variant="outline"
            onClick={onOpenMobileFilters}
            className="lg:hidden rounded-full px-4 py-2.5 shadow-none border-border text-dark hover:border-text-muted hover:bg-transparent"
            aria-label="Open filters"
          >
            <SlidersHorizontal size={16} />
            <span>Filters</span>
          </Button>
        )}

        {/* Sort (pill-shaped) */}
        <SortSelect searchParams={searchParams} />

        {/* View toggle (optional) */}
        {viewMode && onViewModeChange && (
          <div className="hidden items-center gap-1 rounded-full border border-border p-0.5 sm:flex">
            <Button
              type="button"
              variant="ghost"
              onClick={() => onViewModeChange('grid')}
              className={cn(
                'rounded-full p-1.5 h-auto w-auto',
                viewMode === 'grid'
                  ? 'bg-primary text-white hover:bg-primary/90 hover:text-white'
                  : 'text-text-muted hover:text-dark hover:bg-transparent',
              )}
              aria-label="Grid view"
              aria-pressed={viewMode === 'grid'}
            >
              <LayoutGrid size={16} />
            </Button>
            <Button
              type="button"
              variant="ghost"
              onClick={() => onViewModeChange('list')}
              className={cn(
                'rounded-full p-1.5 h-auto w-auto',
                viewMode === 'list'
                  ? 'bg-primary text-white hover:bg-primary/90 hover:text-white'
                  : 'text-text-muted hover:text-dark hover:bg-transparent',
              )}
              aria-label="List view"
              aria-pressed={viewMode === 'list'}
            >
              <List size={16} />
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
