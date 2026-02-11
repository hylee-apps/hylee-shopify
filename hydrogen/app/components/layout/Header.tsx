'use client';

import {useState, useCallback, useEffect, useRef} from 'react';
import {Link, useLocation} from 'react-router';
import {Icon} from '../display/Icon';
import type {HeaderQuery} from 'storefrontapi.generated';

// ============================================================================
// Types
// ============================================================================

export interface HeaderProps {
  /** Shop data from Storefront API */
  shop: HeaderQuery['shop'];
  /** Header menu from Storefront API */
  menu: HeaderQuery['menu'];
  /** Whether customer is logged in */
  isLoggedIn?: boolean | Promise<boolean>;
  /** Cart data for cart count */
  cart?: {totalQuantity?: number} | null | Promise<unknown>;
  /** Optional announcement bar text */
  announcement?: string;
  /** Header variant */
  variant?: 'default' | 'minimal';
  /** Show product categories dropdown */
  showCategories?: boolean;
  /** Categories for the dropdown menu */
  categories?: Array<{
    id: string;
    title: string;
    handle: string;
    subcategories?: Array<{id: string; title: string; handle: string}>;
  }>;
  /** Custom CTA button */
  cta?: {text: string; href: string};
}

interface NavDropdownProps {
  label: string;
  items: Array<{title: string; url: string}>;
  isOpen: boolean;
  onToggle: () => void;
  onClose: () => void;
}

interface MobileMenuProps {
  isOpen: boolean;
  onClose: () => void;
  menu: HeaderQuery['menu'];
  isLoggedIn: boolean;
  categories?: HeaderProps['categories'];
}

// ============================================================================
// Subcomponents
// ============================================================================

function NavDropdown({
  label,
  items,
  isOpen,
  onToggle,
  onClose,
}: NavDropdownProps) {
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        onClose();
      }
    }

    function handleEscape(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        onClose();
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleEscape);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen, onClose]);

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        className="flex items-center gap-1 px-3 py-2 text-sm font-medium text-text hover:text-primary transition-colors"
        aria-expanded={isOpen}
        onClick={onToggle}
      >
        {label}
        <Icon
          name="chevron-down"
          size={12}
          className={`transition-transform ${isOpen ? 'rotate-180' : ''}`}
        />
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 mt-1 min-w-48 rounded-md bg-white shadow-lg ring-1 ring-border z-dropdown">
          <div className="py-2">
            {items.map((item) => (
              <Link
                key={item.url}
                to={item.url}
                className="block px-4 py-2 text-sm text-text hover:bg-surface hover:text-primary transition-colors"
                onClick={onClose}
              >
                {item.title}
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function CategoryDropdown({
  categories,
  isOpen,
  onToggle,
  onClose,
}: {
  categories: NonNullable<HeaderProps['categories']>;
  isOpen: boolean;
  onToggle: () => void;
  onClose: () => void;
}) {
  const [hoveredCategory, setHoveredCategory] = useState<string | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        onClose();
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose]);

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        className="flex items-center gap-1 px-3 py-2 text-sm font-medium text-text hover:text-primary transition-colors"
        aria-expanded={isOpen}
        onClick={onToggle}
      >
        Product Category
        <Icon
          name="chevron-down"
          size={12}
          className={`transition-transform ${isOpen ? 'rotate-180' : ''}`}
        />
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 mt-1 min-w-64 rounded-md bg-white shadow-lg ring-1 ring-border z-dropdown">
          <div className="p-2 border-b border-border">
            <span className="text-xs font-semibold text-text-muted uppercase tracking-wider">
              Categories
            </span>
          </div>
          <div className="py-2 max-h-96 overflow-y-auto">
            {categories.map((category) => (
              <div
                key={category.id}
                className="relative"
                onMouseEnter={() => setHoveredCategory(category.id)}
                onMouseLeave={() => setHoveredCategory(null)}
              >
                <Link
                  to={`/collections/${category.handle}`}
                  className="flex items-center justify-between px-4 py-2 text-sm text-text hover:bg-surface hover:text-primary transition-colors"
                  onClick={onClose}
                >
                  {category.title}
                  {category.subcategories &&
                    category.subcategories.length > 0 && (
                      <Icon name="chevron-right" size={16} />
                    )}
                </Link>

                {/* Subcategory flyout */}
                {category.subcategories &&
                  category.subcategories.length > 0 &&
                  hoveredCategory === category.id && (
                    <div className="absolute left-full top-0 ml-1 min-w-48 rounded-md bg-white shadow-lg ring-1 ring-border">
                      <div className="p-2 border-b border-border">
                        <span className="text-xs font-semibold text-text-muted">
                          {category.title}
                        </span>
                      </div>
                      <div className="py-2">
                        {category.subcategories.map((sub) => (
                          <Link
                            key={sub.id}
                            to={`/collections/${sub.handle}`}
                            className="block px-4 py-2 text-sm text-text hover:bg-surface hover:text-primary transition-colors"
                            onClick={onClose}
                          >
                            {sub.title}
                          </Link>
                        ))}
                      </div>
                    </div>
                  )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function MobileMenu({
  isOpen,
  onClose,
  menu,
  isLoggedIn,
  categories,
}: MobileMenuProps) {
  const [expandedSection, setExpandedSection] = useState<string | null>(null);

  // Prevent body scroll when menu is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  const toggleSection = useCallback((section: string) => {
    setExpandedSection((prev) => (prev === section ? null : section));
  }, []);

  if (!isOpen) return null;

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-black/50 z-fixed"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Menu panel */}
      <div className="fixed inset-y-0 left-0 w-80 max-w-[calc(100%-3rem)] bg-white z-modal shadow-xl">
        <div className="flex items-center justify-between p-4 border-b border-border">
          <span className="text-lg font-semibold text-dark">Menu</span>
          <button
            onClick={onClose}
            className="p-2 -mr-2 text-text-muted hover:text-text transition-colors"
            aria-label="Close menu"
          >
            <Icon name="x" size={24} />
          </button>
        </div>

        <nav className="overflow-y-auto h-[calc(100%-4rem)]">
          {/* Categories section */}
          {categories && categories.length > 0 && (
            <div className="border-b border-border">
              <button
                className="flex items-center justify-between w-full px-4 py-3 text-text font-medium"
                onClick={() => toggleSection('categories')}
              >
                <span>Product Category</span>
                <Icon
                  name="chevron-right"
                  size={16}
                  className={`transition-transform ${
                    expandedSection === 'categories' ? 'rotate-90' : ''
                  }`}
                />
              </button>
              {expandedSection === 'categories' && (
                <div className="bg-surface pb-2">
                  {categories.map((cat) => (
                    <Link
                      key={cat.id}
                      to={`/collections/${cat.handle}`}
                      className="block px-6 py-2 text-sm text-text hover:text-primary"
                      onClick={onClose}
                    >
                      {cat.title}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Menu items */}
          {menu?.items?.map((item) => {
            const hasChildren = item.items && item.items.length > 0;

            if (hasChildren) {
              return (
                <div key={item.id} className="border-b border-border">
                  <button
                    className="flex items-center justify-between w-full px-4 py-3 text-text font-medium"
                    onClick={() => toggleSection(item.id)}
                  >
                    <span>{item.title}</span>
                    <Icon
                      name="chevron-right"
                      size={16}
                      className={`transition-transform ${
                        expandedSection === item.id ? 'rotate-90' : ''
                      }`}
                    />
                  </button>
                  {expandedSection === item.id && (
                    <div className="bg-surface pb-2">
                      {item.items?.map((child) => (
                        <Link
                          key={child.id}
                          to={child.url ?? '#'}
                          className="block px-6 py-2 text-sm text-text hover:text-primary"
                          onClick={onClose}
                        >
                          {child.title}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              );
            }

            return (
              <Link
                key={item.id}
                to={item.url ?? '#'}
                className="block px-4 py-3 text-text font-medium border-b border-border hover:text-primary"
                onClick={onClose}
              >
                {item.title}
              </Link>
            );
          })}

          {/* Account section */}
          <div className="mt-4 px-4 py-3 border-t border-border">
            {isLoggedIn ? (
              <Link
                to="/account"
                className="flex items-center gap-2 text-text hover:text-primary"
                onClick={onClose}
              >
                <Icon name="user" size={20} />
                <span>Account</span>
              </Link>
            ) : (
              <Link
                to="/account/login"
                className="flex items-center gap-2 text-text hover:text-primary"
                onClick={onClose}
              >
                <Icon name="user" size={20} />
                <span>Sign In</span>
              </Link>
            )}
          </div>
        </nav>
      </div>
    </>
  );
}

// ============================================================================
// Main Component
// ============================================================================

export function Header({
  shop,
  menu,
  isLoggedIn = false,
  cart,
  announcement,
  variant = 'default',
  showCategories = true,
  categories = [],
  cta,
}: HeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [resolvedIsLoggedIn, setResolvedIsLoggedIn] = useState(false);
  const [cartCount, setCartCount] = useState(0);
  const location = useLocation();

  // Resolve promises for isLoggedIn and cart
  useEffect(() => {
    if (typeof isLoggedIn === 'boolean') {
      setResolvedIsLoggedIn(isLoggedIn);
    } else if (isLoggedIn instanceof Promise) {
      isLoggedIn.then(setResolvedIsLoggedIn);
    }
  }, [isLoggedIn]);

  useEffect(() => {
    if (
      cart &&
      'totalQuantity' in cart &&
      typeof cart.totalQuantity === 'number'
    ) {
      setCartCount(cart.totalQuantity);
    } else if (cart instanceof Promise) {
      cart.then((resolved: unknown) => {
        if (
          resolved &&
          typeof resolved === 'object' &&
          'totalQuantity' in resolved
        ) {
          setCartCount((resolved as {totalQuantity: number}).totalQuantity);
        }
      });
    }
  }, [cart]);

  // Close dropdown when route changes
  useEffect(() => {
    setActiveDropdown(null);
    setMobileMenuOpen(false);
  }, [location.pathname]);

  const toggleDropdown = useCallback((id: string) => {
    setActiveDropdown((prev) => (prev === id ? null : id));
  }, []);

  const closeDropdown = useCallback(() => {
    setActiveDropdown(null);
  }, []);

  const closeMobileMenu = useCallback(() => {
    setMobileMenuOpen(false);
  }, []);

  // Convert menu items for dropdown
  const whatsNewItems = [
    {title: 'Deals & Promotions', url: '/collections/deals-promotions'},
    {title: 'New Additions', url: '/collections/new-arrivals'},
    {title: 'Season Item Spotlights', url: '/collections/seasonal'},
    {title: 'Special Events', url: '/collections/special-events'},
  ];

  return (
    <header
      className={`sticky top-0 bg-white z-sticky ${
        variant === 'minimal' ? '' : 'shadow-sm'
      }`}
    >
      {/* Announcement bar */}
      {announcement && (
        <div className="bg-primary text-white text-center text-sm py-2 px-4">
          {announcement}
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Mobile menu toggle */}
          <button
            className="lg:hidden p-2 -ml-2 text-text hover:text-primary transition-colors"
            onClick={() => setMobileMenuOpen(true)}
            aria-label="Open menu"
          >
            <Icon name="menu" size={24} />
          </button>

          {/* Logo */}
          <Link to="/" className="shrink-0">
            {shop.brand?.logo?.image?.url ? (
              <>
                <img
                  src={shop.brand.logo.image.url}
                  alt={shop.name}
                  className="hidden sm:block h-8 w-auto"
                  loading="eager"
                />
                <img
                  src={shop.brand.logo.image.url}
                  alt={shop.name}
                  className="sm:hidden h-6 w-auto"
                  loading="eager"
                />
              </>
            ) : (
              <span className="text-xl font-bold text-dark">{shop.name}</span>
            )}
          </Link>

          {/* Desktop navigation */}
          {variant === 'default' && (
            <nav
              className="hidden lg:flex items-center gap-1"
              role="navigation"
            >
              {/* Product Categories */}
              {showCategories && categories.length > 0 && (
                <CategoryDropdown
                  categories={categories}
                  isOpen={activeDropdown === 'categories'}
                  onToggle={() => toggleDropdown('categories')}
                  onClose={closeDropdown}
                />
              )}

              {/* What's New */}
              <NavDropdown
                label="What's New"
                items={whatsNewItems}
                isOpen={activeDropdown === 'whatsNew'}
                onToggle={() => toggleDropdown('whatsNew')}
                onClose={closeDropdown}
              />

              {/* Blog */}
              <Link
                to="/blogs/news"
                className="px-3 py-2 text-sm font-medium text-text hover:text-primary transition-colors"
              >
                Blog
              </Link>

              {/* Additional menu items */}
              {menu?.items?.map((item) => {
                if (item.items && item.items.length > 0) {
                  return (
                    <NavDropdown
                      key={item.id}
                      label={item.title}
                      items={item.items.map((child) => ({
                        title: child.title,
                        url: child.url ?? '#',
                      }))}
                      isOpen={activeDropdown === item.id}
                      onToggle={() => toggleDropdown(item.id)}
                      onClose={closeDropdown}
                    />
                  );
                }
                return (
                  <Link
                    key={item.id}
                    to={item.url ?? '#'}
                    className="px-3 py-2 text-sm font-medium text-text hover:text-primary transition-colors"
                  >
                    {item.title}
                  </Link>
                );
              })}
            </nav>
          )}

          {/* Actions */}
          <div className="flex items-center gap-2">
            {/* Orders link (if logged in) */}
            {resolvedIsLoggedIn && (
              <Link
                to="/account/orders"
                className="hidden md:block text-sm font-medium text-text hover:text-primary transition-colors"
              >
                Orders
              </Link>
            )}

            {/* Account */}
            <Link
              to={resolvedIsLoggedIn ? '/account' : '/account/login'}
              className="hidden sm:flex items-center gap-1 px-3 py-2 text-sm font-medium text-text border border-border rounded-md hover:border-primary hover:text-primary transition-colors"
            >
              <Icon name="user" size={16} />
              <span>{resolvedIsLoggedIn ? 'Account' : 'Sign In'}</span>
            </Link>

            {/* CTA Button */}
            {cta && (
              <Link
                to={cta.href}
                className="hidden md:inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-primary rounded-md hover:bg-primary/90 transition-colors"
              >
                {cta.text}
              </Link>
            )}

            {/* Cart (mobile icon only) */}
            <Link
              to="/cart"
              className="relative p-2 text-text hover:text-primary transition-colors"
              aria-label={`Cart (${cartCount} items)`}
            >
              <Icon name="cart" size={24} />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 flex items-center justify-center w-5 h-5 text-xs font-bold text-white bg-primary rounded-full">
                  {cartCount > 99 ? '99+' : cartCount}
                </span>
              )}
            </Link>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      <MobileMenu
        isOpen={mobileMenuOpen}
        onClose={closeMobileMenu}
        menu={menu}
        isLoggedIn={resolvedIsLoggedIn}
        categories={categories}
      />
    </header>
  );
}

export default Header;
