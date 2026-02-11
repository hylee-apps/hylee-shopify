'use client';

import {Icon} from '../display/Icon';
import {SortSelect} from './SortSelect';

export interface CollectionToolbarProps {
  productCount: number;
  viewMode: 'grid' | 'list';
  onViewModeChange: (mode: 'grid' | 'list') => void;
  searchParams: URLSearchParams;
  onOpenFilters?: () => void;
  className?: string;
}

/**
 * CollectionToolbar — toolbar above the product grid with count, sort,
 * view toggle, and mobile filter button.
 */
export function CollectionToolbar({
  productCount,
  viewMode,
  onViewModeChange,
  searchParams,
  onOpenFilters,
  className,
}: CollectionToolbarProps) {
  return (
    <div
      className={`flex flex-wrap items-center justify-between gap-3 py-4 ${className ?? ''}`}
    >
      {/* Product count */}
      <p className="text-sm text-slate-600">
        <span className="font-medium text-slate-900">{productCount}</span>{' '}
        {productCount === 1 ? 'product' : 'products'}
      </p>

      <div className="flex items-center gap-3">
        {/* Mobile filter toggle */}
        {onOpenFilters && (
          <button
            type="button"
            onClick={onOpenFilters}
            className="flex items-center gap-1.5 rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-700 transition-colors hover:border-slate-400 lg:hidden"
            aria-label="Open filters"
          >
            <Icon name="filter" size={16} />
            <span>Filters</span>
          </button>
        )}

        {/* Sort */}
        <SortSelect searchParams={searchParams} />

        {/* View toggle */}
        <div className="hidden items-center gap-1 rounded-lg border border-slate-300 p-0.5 sm:flex">
          <button
            type="button"
            onClick={() => onViewModeChange('grid')}
            className={`rounded-md p-1.5 transition-colors ${
              viewMode === 'grid'
                ? 'bg-primary text-white'
                : 'text-slate-500 hover:text-slate-700'
            }`}
            aria-label="Grid view"
            aria-pressed={viewMode === 'grid'}
          >
            <Icon name="grid" size={16} />
          </button>
          <button
            type="button"
            onClick={() => onViewModeChange('list')}
            className={`rounded-md p-1.5 transition-colors ${
              viewMode === 'list'
                ? 'bg-primary text-white'
                : 'text-slate-500 hover:text-slate-700'
            }`}
            aria-label="List view"
            aria-pressed={viewMode === 'list'}
          >
            <Icon name="list" size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}
