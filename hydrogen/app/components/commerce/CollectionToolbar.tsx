'use client';

import {Icon} from '../display/Icon';
import {SortSelect} from './SortSelect';

export interface CollectionToolbarProps {
  productCount: number;
  totalCount?: number;
  viewMode?: 'grid' | 'list';
  onViewModeChange?: (mode: 'grid' | 'list') => void;
  searchParams: URLSearchParams;
  onOpenFilters?: () => void;
  className?: string;
}

/**
 * CollectionToolbar — toolbar above the product grid with count, sort,
 * and optional view toggle / mobile filter button.
 */
export function CollectionToolbar({
  productCount,
  totalCount,
  viewMode,
  onViewModeChange,
  searchParams,
  onOpenFilters,
  className,
}: CollectionToolbarProps) {
  return (
    <div
      className={`flex flex-wrap items-center justify-between gap-3 py-5 ${className ?? ''}`}
    >
      {/* Result count */}
      <p className="text-sm font-medium text-dark">
        Showing{' '}
        <span className="font-semibold">{productCount}</span>{' '}
        {productCount === 1 ? 'Result' : 'Results'}
        {totalCount !== undefined && (
          <> from total <span className="font-semibold">{totalCount}</span></>
        )}
      </p>

      <div className="flex items-center gap-3">
        {/* Mobile filter toggle */}
        {onOpenFilters && (
          <button
            type="button"
            onClick={onOpenFilters}
            className="flex items-center gap-1.5 rounded-full border border-border px-4 py-2.5 text-sm font-medium text-dark transition-colors hover:border-text-muted lg:hidden"
            aria-label="Open filters"
          >
            <Icon name="filter" size={16} />
            <span>Filters</span>
          </button>
        )}

        {/* Sort (pill-shaped) */}
        <SortSelect searchParams={searchParams} />

        {/* View toggle (optional) */}
        {viewMode && onViewModeChange && (
          <div className="hidden items-center gap-1 rounded-full border border-border p-0.5 sm:flex">
            <button
              type="button"
              onClick={() => onViewModeChange('grid')}
              className={`rounded-full p-1.5 transition-colors ${
                viewMode === 'grid'
                  ? 'bg-primary text-white'
                  : 'text-text-muted hover:text-dark'
              }`}
              aria-label="Grid view"
              aria-pressed={viewMode === 'grid'}
            >
              <Icon name="grid" size={16} />
            </button>
            <button
              type="button"
              onClick={() => onViewModeChange('list')}
              className={`rounded-full p-1.5 transition-colors ${
                viewMode === 'list'
                  ? 'bg-primary text-white'
                  : 'text-text-muted hover:text-dark'
              }`}
              aria-label="List view"
              aria-pressed={viewMode === 'list'}
            >
              <Icon name="list" size={16} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
