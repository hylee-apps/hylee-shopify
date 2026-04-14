import {useNavigate, useLocation} from 'react-router';
import {useTranslation} from 'react-i18next';
import {
  SORT_OPTIONS,
  getCurrentSort,
  buildSortUrl,
} from '~/lib/collection/filters';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '~/components/ui/select';

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
  const {t} = useTranslation();
  const currentSort = getCurrentSort(searchParams);

  return (
    <Select
      value={currentSort}
      onValueChange={(value) => {
        const url = buildSortUrl(pathname, searchParams, value);
        navigate(url);
      }}
    >
      <SelectTrigger
        className={`cursor-pointer rounded-full border border-border bg-white px-4 py-2.5 text-sm font-medium text-dark transition-colors hover:border-text-muted focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary h-auto w-auto ${className ?? ''}`}
        aria-label={t('sort.ariaLabel')}
      >
        <span className="flex items-center gap-1 whitespace-nowrap">
          <span>{t('sort.label')}</span>
          <SelectValue />
        </span>
      </SelectTrigger>
      <SelectContent>
        {SORT_OPTIONS.map((option) => (
          <SelectItem key={option.value} value={option.value}>
            {t(option.labelKey)}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
