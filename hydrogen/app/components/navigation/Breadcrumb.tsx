import React from 'react';
import {Link} from 'react-router';

export interface BreadcrumbItem {
  /** Display text */
  label: string;
  /** URL for the breadcrumb link */
  url?: string;
}

export type BreadcrumbVariant = 'default' | 'account';

export interface BreadcrumbProps {
  /** Array of breadcrumb items */
  items: BreadcrumbItem[];
  /** Variant style */
  variant?: BreadcrumbVariant;
  /** Custom separator character */
  separator?: string;
  /** Include home link automatically */
  includeHome?: boolean;
  /** Additional CSS classes */
  className?: string;
}

/**
 * Breadcrumb component - migrated from theme/snippets/breadcrumb.liquid
 *
 * Provides navigation context showing the current page location.
 *
 * @example
 * <Breadcrumb
 *   items={[
 *     { label: 'Products', url: '/products' },
 *     { label: 'Widget' }
 *   ]}
 * />
 *
 * @example
 * // Account variant (simpler, no schema.org)
 * <Breadcrumb
 *   variant="account"
 *   items={[
 *     { label: 'Your Account', url: '/account' },
 *     { label: 'Your Orders' }
 *   ]}
 * />
 */
export function Breadcrumb({
  items,
  variant = 'default',
  separator,
  includeHome = true,
  className,
}: BreadcrumbProps) {
  const sep = separator || (variant === 'account' ? '›' : '/');

  const allItems: BreadcrumbItem[] = includeHome
    ? [{label: 'Home', url: '/'}, ...items]
    : items;

  const baseClasses = [
    'breadcrumb flex items-center gap-2 text-sm text-slate-600',
    variant === 'account' ? 'breadcrumb--account' : '',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  // Account variant: simpler markup without schema.org
  if (variant === 'account') {
    return (
      <nav className={baseClasses} aria-label="Breadcrumb">
        {allItems.map((item, index) => {
          const isLast = index === allItems.length - 1;

          return (
            <React.Fragment key={`${item.label}-${index}`}>
              {item.url && !isLast ? (
                <Link
                  to={item.url}
                  className="hover:text-primary transition-colors"
                >
                  {item.label}
                </Link>
              ) : (
                <span
                  className={isLast ? 'text-slate-900 font-medium' : ''}
                  aria-current={isLast ? 'page' : undefined}
                >
                  {item.label}
                </span>
              )}
              {!isLast && (
                <span className="text-slate-400" aria-hidden="true">
                  {sep}
                </span>
              )}
            </React.Fragment>
          );
        })}
      </nav>
    );
  }

  // Default variant: full schema.org markup
  return (
    <nav className={baseClasses} aria-label="Breadcrumb">
      <ol
        className="flex items-center gap-2"
        itemScope
        itemType="https://schema.org/BreadcrumbList"
      >
        {allItems.map((item, index) => {
          const isLast = index === allItems.length - 1;
          const position = index + 1;

          return (
            <li
              key={`${item.label}-${index}`}
              className="flex items-center gap-2"
              itemProp="itemListElement"
              itemScope
              itemType="https://schema.org/ListItem"
            >
              {item.url && !isLast ? (
                <Link
                  to={item.url}
                  className="hover:text-primary transition-colors"
                  itemProp="item"
                >
                  <span itemProp="name">{item.label}</span>
                </Link>
              ) : (
                <span
                  className={isLast ? 'text-slate-900 font-medium' : ''}
                  aria-current={isLast ? 'page' : undefined}
                  itemProp="name"
                >
                  {item.label}
                </span>
              )}
              <meta itemProp="position" content={String(position)} />
              {!isLast && (
                <span className="text-slate-400" aria-hidden="true">
                  {sep}
                </span>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

export default Breadcrumb;
