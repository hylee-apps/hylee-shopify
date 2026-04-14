import {Link, useSearchParams} from 'react-router';
import {ChevronLeft, ChevronRight} from 'lucide-react';
import {useTranslation} from 'react-i18next';

interface OrderPaginationProps {
  currentPage: number;
  totalPages: number;
}

function getVisiblePages(current: number, total: number): (number | '...')[] {
  if (total <= 5) {
    return Array.from({length: total}, (_, i) => i + 1);
  }

  const pages: (number | '...')[] = [];

  // Always show first 3 pages or pages around current
  if (current <= 3) {
    pages.push(1, 2, 3, '...', total);
  } else if (current >= total - 2) {
    pages.push(1, '...', total - 2, total - 1, total);
  } else {
    pages.push(1, '...', current - 1, current, current + 1, '...', total);
  }

  return pages;
}

function buildPageUrl(params: URLSearchParams, page: number): string {
  const newParams = new URLSearchParams(params);
  if (page <= 1) {
    newParams.delete('page');
  } else {
    newParams.set('page', String(page));
  }
  const qs = newParams.toString();
  return qs ? `?${qs}` : '/account/orders';
}

const BASE_BTN =
  'flex size-[40px] items-center justify-center rounded-[8px] text-[14px] transition-colors';

export function OrderPagination({
  currentPage,
  totalPages,
}: OrderPaginationProps) {
  const [searchParams] = useSearchParams();
  const {t} = useTranslation('common');

  if (totalPages <= 1) return null;

  const pages = getVisiblePages(currentPage, totalPages);
  const isFirst = currentPage <= 1;
  const isLast = currentPage >= totalPages;

  return (
    <nav
      aria-label={t('orderPagination.ariaLabel')}
      className="flex w-full items-center justify-center gap-[8px]"
    >
      {/* Previous Arrow */}
      {isFirst ? (
        <span
          className={`${BASE_BTN} cursor-not-allowed border border-[#e5e7eb] bg-white opacity-50`}
          aria-disabled="true"
        >
          <ChevronLeft size={14} className="text-[#1f2937]" />
        </span>
      ) : (
        <Link
          to={buildPageUrl(searchParams, currentPage - 1)}
          className={`${BASE_BTN} border border-[#e5e7eb] bg-white hover:border-[#14b8a6]`}
          aria-label={t('orderPagination.previousPage')}
        >
          <ChevronLeft size={14} className="text-[#1f2937]" />
        </Link>
      )}

      {/* Page Numbers */}
      {pages.map((page, idx) =>
        page === '...' ? (
          <span
            key={`ellipsis-${idx}`}
            className="text-[16px] leading-[25.6px] text-[#6b7280]"
          >
            ...
          </span>
        ) : page === currentPage ? (
          <span
            key={page}
            className={`${BASE_BTN} border border-[#14b8a6] bg-[#14b8a6] text-white`}
            aria-current="page"
          >
            {page}
          </span>
        ) : (
          <Link
            key={page}
            to={buildPageUrl(searchParams, page)}
            className={`${BASE_BTN} border border-[#e5e7eb] bg-white text-[#1f2937] hover:border-[#14b8a6] hover:text-[#14b8a6]`}
          >
            {page}
          </Link>
        ),
      )}

      {/* Next Arrow */}
      {isLast ? (
        <span
          className={`${BASE_BTN} cursor-not-allowed border border-[#e5e7eb] bg-white opacity-50`}
          aria-disabled="true"
        >
          <ChevronRight size={14} className="text-[#1f2937]" />
        </span>
      ) : (
        <Link
          to={buildPageUrl(searchParams, currentPage + 1)}
          className={`${BASE_BTN} border border-[#e5e7eb] bg-white hover:border-[#14b8a6]`}
          aria-label={t('orderPagination.nextPage')}
        >
          <ChevronRight size={14} className="text-[#1f2937]" />
        </Link>
      )}
    </nav>
  );
}
