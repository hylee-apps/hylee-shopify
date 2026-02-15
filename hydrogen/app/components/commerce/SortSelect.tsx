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
      className={`cursor-pointer rounded-full border border-border bg-white px-4 py-2.5 text-sm font-medium text-dark transition-colors hover:border-text-muted focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary ${className ?? ''}`}
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
