import {Link} from 'react-router';
import type {FooterQuery} from 'storefrontapi.generated';

// ============================================================================
// Types
// ============================================================================

export interface FooterProps {
  /** Footer menu from Storefront API */
  menu?: FooterQuery['menu'] | null;
  /** Shop name for copyright */
  shopName: string;
  /** Logo URL (optional) */
  logoUrl?: string;
  /** Brand description */
  description?: string;
  /** Footer variant */
  variant?: 'default' | 'minimal';
  /** Additional link columns */
  columns?: Array<{
    heading: string;
    links: Array<{title: string; url: string}>;
  }>;
  /** Copyright text override */
  copyrightText?: string;
}

interface FooterColumnProps {
  heading: string;
  links: Array<{title: string; url: string}>;
}

// ============================================================================
// Subcomponents
// ============================================================================

function FooterColumn({heading, links}: FooterColumnProps) {
  return (
    <div className="space-y-4">
      <h4 className="text-sm font-semibold text-dark uppercase tracking-wider">
        {heading}
      </h4>
      <ul className="space-y-2">
        {links.map((link) => (
          <li key={link.url}>
            <Link
              to={link.url}
              className="text-sm text-text-muted hover:text-primary transition-colors"
            >
              {link.title}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

function MinimalFooter({
  shopName,
  menu,
  copyrightText,
}: Pick<FooterProps, 'shopName' | 'menu' | 'copyrightText'>) {
  const year = new Date().getFullYear();

  return (
    <footer className="bg-surface border-t border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm text-text-muted">
            © {year} {shopName}. {copyrightText || 'All rights reserved.'}
          </p>

          {menu?.items && menu.items.length > 0 && (
            <ul className="flex flex-wrap items-center gap-4">
              {menu.items.map((item) => (
                <li key={item.id}>
                  <Link
                    to={item.url ?? '#'}
                    className="text-sm text-text-muted hover:text-primary transition-colors"
                  >
                    {item.title}
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </footer>
  );
}

// ============================================================================
// Main Component
// ============================================================================

export function Footer({
  menu,
  shopName,
  logoUrl,
  description,
  variant = 'default',
  columns = [],
  copyrightText,
}: FooterProps) {
  const year = new Date().getFullYear();

  if (variant === 'minimal') {
    return (
      <MinimalFooter
        shopName={shopName}
        menu={menu}
        copyrightText={copyrightText}
      />
    );
  }

  // Default fallback columns if none provided and no menu
  const defaultColumns: FooterColumnProps[] = [
    {
      heading: 'Products',
      links: [
        {title: 'Electronics', url: '/collections/electronics'},
        {title: 'Fashion', url: '/collections/fashion'},
        {title: 'Home & Living', url: '/collections/home-living'},
        {title: 'All Categories', url: '/collections/all'},
      ],
    },
    {
      heading: 'Company',
      links: [
        {title: 'About Us', url: '/pages/about-us'},
        {title: 'Contact', url: '/pages/contact'},
        {title: 'Careers', url: '/pages/careers'},
        {title: 'Blog', url: '/blogs/news'},
      ],
    },
    {
      heading: 'Support',
      links: [
        {title: 'Help Center', url: '/pages/help-center'},
        {title: 'Shipping Info', url: '/pages/shipping-info'},
        {title: 'Returns', url: '/pages/returns'},
        {title: 'Terms & Conditions', url: '/pages/terms-conditions'},
      ],
    },
  ];

  // Convert menu items to column format
  const menuColumns: FooterColumnProps[] = [];
  if (menu?.items) {
    menu.items.forEach((item) => {
      if (item.items && item.items.length > 0) {
        menuColumns.push({
          heading: item.title,
          links: item.items.map((child) => ({
            title: child.title,
            url: child.url ?? '#',
          })),
        });
      }
    });
  }

  // Use provided columns, then menu columns, then defaults
  const displayColumns =
    columns.length > 0
      ? columns
      : menuColumns.length > 0
        ? menuColumns
        : defaultColumns;

  return (
    <footer className="bg-surface border-t border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-8">
          {/* Brand column */}
          <div className="col-span-2 md:col-span-4 lg:col-span-2 space-y-4">
            <div className="flex items-center">
              {logoUrl ? (
                <img
                  src={logoUrl}
                  alt={shopName}
                  className="h-7 sm:h-9 w-auto"
                  loading="lazy"
                />
              ) : (
                <span className="text-xl font-bold text-dark">{shopName}</span>
              )}
            </div>

            {description && (
              <p className="text-sm text-text-muted max-w-xs">{description}</p>
            )}
          </div>

          {/* Link columns */}
          {displayColumns.map((column) => (
            <FooterColumn
              key={column.heading}
              heading={column.heading}
              links={column.links}
            />
          ))}
        </div>

        {/* Bottom bar */}
        <div className="mt-12 pt-8 border-t border-border">
          <p className="text-sm text-center text-text-muted">
            © {year} {shopName}. {copyrightText || 'All rights reserved.'}
          </p>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
