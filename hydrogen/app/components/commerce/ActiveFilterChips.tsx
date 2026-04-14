'use client';

import {useLocation} from 'react-router';
import {useTranslation} from 'react-i18next';
import type {Filter} from '@shopify/hydrogen/storefront-api-types';
import {X} from 'lucide-react';
import {Link} from 'react-router';
import {buildFilterUrl, clearAllFiltersUrl} from '~/lib/collection/filters';

export interface ActiveFilterChipsProps {
  /** Full filter list from Storefront API — used to look up human-readable labels */
  filters: Filter[];
  /** Current URL search params */
  searchParams: URLSearchParams;
  className?: string;
}

interface ActiveChip {
  label: string;
  input: string;
  removeUrl: string;
}

/**
 * ActiveFilterChips — Figma node 5030:728 (PLP end-node).
 *
 * Renders currently-applied filters as teal dismissible pills between the
 * results header and the product grid. Only renders when filters are active.
 *
 * Each chip: `bg-secondary/10 px-[12px] py-[8px] rounded-[20px]`
 * Label: Roboto Regular 13px `#2699a6`
 * × icon: 13px `#2699a6` — clicking removes that filter
 * "Clear all": Roboto Medium 13px `#2699a6` — removes all filters
 */
export function ActiveFilterChips({
  filters,
  searchParams,
  className = '',
}: ActiveFilterChipsProps) {
  const {t} = useTranslation();
  const {pathname} = useLocation();

  const activeInputs = searchParams.getAll('filter');

  if (activeInputs.length === 0) return null;

  // Build a lookup: input string → label
  const labelMap = new Map<string, string>();
  for (const filter of filters) {
    for (const value of filter.values ?? []) {
      const inputStr =
        typeof value.input === 'string'
          ? value.input
          : JSON.stringify(value.input);
      labelMap.set(inputStr, value.label);
    }
  }

  const chips: ActiveChip[] = activeInputs
    .map((input) => {
      const label = labelMap.get(input);
      if (!label) return null;
      return {
        label,
        input,
        removeUrl: buildFilterUrl(pathname, searchParams, input, 'remove'),
      };
    })
    .filter((c): c is ActiveChip => c !== null);

  if (chips.length === 0) return null;

  const clearAllUrl = clearAllFiltersUrl(pathname, searchParams);

  return (
    <div
      className={`flex flex-wrap gap-x-[8px] gap-y-[8px] items-center ${className}`}
    >
      {chips.map((chip) => (
        <Link
          key={chip.input}
          to={chip.removeUrl}
          preventScrollReset
          className="bg-secondary/10 px-[12px] py-[8px] rounded-[20px] flex gap-[8px] items-center hover:bg-secondary/20 transition-colors no-underline"
          aria-label={t('filter.removeFilter', {label: chip.label})}
        >
          <span className="text-[13px] text-secondary leading-[19.5px]">
            {chip.label}
          </span>
          <X size={13} className="text-secondary shrink-0" />
        </Link>
      ))}

      {/* Clear all */}
      <Link
        to={clearAllUrl}
        preventScrollReset
        className="px-[8px] py-[10px] rounded-[8px] font-medium text-[13px] text-secondary hover:text-secondary/80 transition-colors no-underline"
      >
        {t('filter.clearAll')}
      </Link>
    </div>
  );
}

export default ActiveFilterChips;
