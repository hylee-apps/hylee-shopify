import React from 'react';
import {Link, useSearchParams} from 'react-router';
import {Icon} from '../display/Icon';

export interface PaginationProps {
  /** Current page (1-indexed) */
  currentPage: number;
  /** Total number of pages */
  totalPages: number;
  /** Base URL for pagination links (pages appended as query param) */
  baseUrl?: string;
  /** Query parameter name for page */
  pageParam?: string;
  /** Show page numbers */
  showPageNumbers?: boolean;
  /** Show previous/next arrows */
  showPrevNext?: boolean;
  /** Maximum number of page buttons to show */
  maxPages?: number;
  /** Additional CSS classes */
  className?: string;
}

/**
 * Pagination component - migrated from theme/snippets/pagination.liquid
 *
 * Navigation for paginated content with page numbers and arrows.
 *
 * @example
 * <Pagination currentPage={1} totalPages={10} />
 *
 * @example
 * <Pagination
 *   currentPage={5}
 *   totalPages={20}
 *   baseUrl="/products"
 *   pageParam="page"
 *   showPageNumbers
 *   showPrevNext
 * />
 */
export function Pagination({
  currentPage,
  totalPages,
  baseUrl = '',
  pageParam = 'page',
  showPageNumbers = true,
  showPrevNext = true,
  maxPages = 7,
  className,
}: PaginationProps) {
  const [searchParams] = useSearchParams();

  if (totalPages <= 1) {
    return null;
  }

  const buildPageUrl = (page: number) => {
    const params = new URLSearchParams(searchParams);
    if (page === 1) {
      params.delete(pageParam);
    } else {
      params.set(pageParam, String(page));
    }
    const queryString = params.toString();
    return `${baseUrl}${queryString ? `?${queryString}` : ''}`;
  };

  const hasPrevious = currentPage > 1;
  const hasNext = currentPage < totalPages;

  // Calculate which page numbers to show
  const getPageNumbers = (): (number | 'ellipsis')[] => {
    if (totalPages <= maxPages) {
      return Array.from({length: totalPages}, (_, i) => i + 1);
    }

    const pages: (number | 'ellipsis')[] = [];
    const halfMax = Math.floor(maxPages / 2);

    // Always show first page
    pages.push(1);

    let start = Math.max(2, currentPage - halfMax + 1);
    let end = Math.min(totalPages - 1, currentPage + halfMax - 1);

    // Adjust if near start
    if (currentPage <= halfMax) {
      end = maxPages - 2;
    }

    // Adjust if near end
    if (currentPage >= totalPages - halfMax) {
      start = totalPages - maxPages + 3;
    }

    // Add ellipsis after first page if needed
    if (start > 2) {
      pages.push('ellipsis');
    }

    // Add middle pages
    for (let i = start; i <= end; i++) {
      pages.push(i);
    }

    // Add ellipsis before last page if needed
    if (end < totalPages - 1) {
      pages.push('ellipsis');
    }

    // Always show last page
    pages.push(totalPages);

    return pages;
  };

  const baseClasses = [
    'pagination flex items-center justify-center gap-1',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  const linkClasses =
    'inline-flex items-center justify-center min-w-[36px] h-9 px-3 rounded-lg text-sm font-medium transition-colors';
  const activeLinkClasses = 'bg-primary text-white';
  const inactiveLinkClasses = 'text-slate-700 hover:bg-slate-100';
  const disabledClasses =
    'text-slate-300 cursor-not-allowed pointer-events-none';

  return (
    <nav className={baseClasses} role="navigation" aria-label="Pagination">
      <ul className="flex items-center gap-1">
        {/* Previous */}
        {showPrevNext && (
          <li>
            {hasPrevious ? (
              <Link
                to={buildPageUrl(currentPage - 1)}
                className={`${linkClasses} ${inactiveLinkClasses}`}
                aria-label="Previous page"
              >
                <Icon name="chevron-left" size={16} />
                <span className="hidden sm:inline ml-1">Previous</span>
              </Link>
            ) : (
              <span
                className={`${linkClasses} ${disabledClasses}`}
                aria-disabled="true"
              >
                <Icon name="chevron-left" size={16} />
                <span className="hidden sm:inline ml-1">Previous</span>
              </span>
            )}
          </li>
        )}

        {/* Page Numbers */}
        {showPageNumbers &&
          getPageNumbers().map((page, index) => {
            if (page === 'ellipsis') {
              return (
                <li key={`ellipsis-${index}`}>
                  <span className="px-2 text-slate-400">…</span>
                </li>
              );
            }

            const isActive = page === currentPage;

            return (
              <li key={page}>
                {isActive ? (
                  <span
                    className={`${linkClasses} ${activeLinkClasses}`}
                    aria-current="page"
                  >
                    {page}
                  </span>
                ) : (
                  <Link
                    to={buildPageUrl(page)}
                    className={`${linkClasses} ${inactiveLinkClasses}`}
                    aria-label={`Page ${page}`}
                  >
                    {page}
                  </Link>
                )}
              </li>
            );
          })}

        {/* Page info (when numbers hidden) */}
        {!showPageNumbers && (
          <li>
            <span className="text-sm text-slate-600">
              Page {currentPage} of {totalPages}
            </span>
          </li>
        )}

        {/* Next */}
        {showPrevNext && (
          <li>
            {hasNext ? (
              <Link
                to={buildPageUrl(currentPage + 1)}
                className={`${linkClasses} ${inactiveLinkClasses}`}
                aria-label="Next page"
              >
                <span className="hidden sm:inline mr-1">Next</span>
                <Icon name="chevron-right" size={16} />
              </Link>
            ) : (
              <span
                className={`${linkClasses} ${disabledClasses}`}
                aria-disabled="true"
              >
                <span className="hidden sm:inline mr-1">Next</span>
                <Icon name="chevron-right" size={16} />
              </span>
            )}
          </li>
        )}
      </ul>
    </nav>
  );
}

export default Pagination;
