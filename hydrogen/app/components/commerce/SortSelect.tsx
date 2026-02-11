'use client';

import {useNavigate, useLocation} from 'react-router';
import {
  SORT_OPTIONS,
  getCurrentSort,
  buildSortUrl,
} from '~/lib/collection/filters';

export interface SortSelectProps {
  searchParams: URLSearchParams;
  className?: string;
}

/**
 * SortSelect — sort dropdown for collection pages.
 *
 * Navigates to new URL with `?sort=` param on change.
 */
export function SortSelect({searchParams, className}: SortSelectProps) {
  const navigate = useNavigate();
  const {pathname} = useLocation();
  const currentSort = getCurrentSort(searchParams);

  return (
    <select
      value={currentSort}
      onChange={(e) => {
        const url = buildSortUrl(pathname, searchParams, e.target.value);
        navigate(url);
      }}
      className={`rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700 transition-colors hover:border-slate-400 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary ${className ?? ''}`}
      aria-label="Sort products"
    >
      {SORT_OPTIONS.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  );
}
