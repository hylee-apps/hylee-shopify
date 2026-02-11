'use client';

import {Link, useSearchParams} from 'react-router';
import {Icon} from '../display/Icon';

// ============================================================================
// Types
// ============================================================================

export interface CompareBarProps {
  /** Maximum number of products to compare */
  maxCompare?: number;
  /** Additional class name */
  className?: string;
}

// ============================================================================
// Component
// ============================================================================

/**
 * CompareBar — Floating bottom bar that appears when products are added
 * to the compare list via URL params.
 *
 * Shows count + "Compare Now" link to /compare route.
 */
export function CompareBar({maxCompare = 4, className = ''}: CompareBarProps) {
  const [searchParams, setSearchParams] = useSearchParams();

  const compareParam = searchParams.get('compare') || '';
  const compareList = compareParam
    ? compareParam.split(',').filter(Boolean)
    : [];
  const count = compareList.length;

  if (count === 0) return null;

  const clearAll = () => {
    const newParams = new URLSearchParams(searchParams);
    newParams.delete('compare');
    setSearchParams(newParams, {replace: true});
  };

  return (
    <div
      className={`fixed bottom-0 left-0 right-0 z-40 border-t border-slate-200 bg-white/95 shadow-lg backdrop-blur-sm ${className}`}
    >
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary">
            <Icon name="columns" size={16} />
          </div>
          <span className="text-sm font-medium text-slate-700">
            {count} product{count !== 1 ? 's' : ''} selected
            <span className="ml-1 text-slate-400">(max {maxCompare})</span>
          </span>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={clearAll}
            className="rounded-lg px-3 py-1.5 text-sm font-medium text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-700"
          >
            Clear
          </button>
          <Link
            to={`/compare?compare=${compareParam}`}
            className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-primary/90"
          >
            <Icon name="columns" size={16} />
            Compare Now
          </Link>
        </div>
      </div>
    </div>
  );
}

export default CompareBar;
