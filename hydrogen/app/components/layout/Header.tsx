'use client';

import {useState, useCallback, useEffect, useRef} from 'react';
import {Link, useLocation} from 'react-router';
import {Icon} from '../display/Icon';
import {PredictiveSearch} from '../navigation/PredictiveSearch';
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
  /** Cart data for count and total */
  cart?: CartLike | null | Promise<unknown>;
  /** Optional announcement bar text */
  announcement?: string;
  /** Categories for the dropdown menu */
  categories?: Array<{
    id: string;
    title: string;
    handle: string;
    subcategories?: Array<{id: string; title: string; handle: string}>;
  }>;
}

interface CartLike {
  totalQuantity?: number;
  cost?: {
    totalAmount?: {
      amount?: string;
      currencyCode?: string;
    };
  };
}

interface DropdownProps {
  label: string;
  items: Array<{title: string; url: string}>;
  isOpen: boolean;
  onToggle: () => void;
  onClose: () => void;
  variant?: 'light' | 'dark';
}

interface MobileMenuProps {
  isOpen: boolean;
  onClose: () => void;
  menu: HeaderQuery['menu'];
  isLoggedIn: boolean;
  categories?: HeaderProps['categories'];
}

// ============================================================================
// Helpers
// ============================================================================

function formatCartTotal(amount?: string, currencyCode?: string): string {
  if (!amount) return '$0.00';
  const num = parseFloat(amount);
  if (isNaN(num)) return '$0.00';
  try {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currencyCode || 'USD',
    }).format(num);
  } catch {
    return `$${num.toFixed(2)}`;
  }
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
  variant = 'light',
}: DropdownProps) {
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
      if (event.key === 'Escape') onClose();
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

  const textClass =
    variant === 'dark'
      ? 'text-white hover:text-white/80'
      : 'text-text-muted hover:text-primary';

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        className={`flex items-center gap-[2px] h-[40px] px-4 py-2.5 text-[14px] font-medium transition-colors ${textClass}`}
        aria-expanded={isOpen}
        onClick={onToggle}
      >
        {label}
        <Icon
          name="chevron-down"
          size={10}
          className={`transition-transform ${isOpen ? 'rotate-180' : ''}`}
        />
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 mt-1 min-w-48 rounded-lg bg-white shadow-lg ring-1 ring-border z-[1000]">
          <div className="py-2">
            {items.map((item) => (
              <Link
                key={item.url}
                to={item.url}
                className="block px-4 py-2 text-[14px] text-text hover:bg-surface hover:text-primary transition-colors"
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
  variant = 'light',
}: {
  categories: NonNullable<HeaderProps['categories']>;
  isOpen: boolean;
  onToggle: () => void;
  onClose: () => void;
  variant?: 'light' | 'dark';
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

  const textClass =
    variant === 'dark'
      ? 'text-white hover:text-white/80'
      : 'text-text-muted hover:text-primary';

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        className={`flex items-center gap-[2px] h-[40px] px-4 py-2.5 text-[14px] font-medium transition-colors ${textClass}`}
        aria-expanded={isOpen}
        onClick={onToggle}
      >
        Categories
        <Icon
          name="chevron-down"
          size={10}
          className={`transition-transform ${isOpen ? 'rotate-180' : ''}`}
        />
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 mt-1 min-w-64 rounded-lg bg-white shadow-lg ring-1 ring-border z-[1000]">
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
                  className="flex items-center justify-between px-4 py-2 text-[14px] text-text hover:bg-surface hover:text-primary transition-colors"
                  onClick={onClose}
                >
                  {category.title}
                  {category.subcategories &&
                    category.subcategories.length > 0 && (
                      <Icon name="chevron-right" size={16} />
                    )}
                </Link>

                {category.subcategories &&
                  category.subcategories.length > 0 &&
                  hoveredCategory === category.id && (
                    <div className="absolute left-full top-0 ml-1 min-w-48 rounded-lg bg-white shadow-lg ring-1 ring-border">
                      <div className="py-2">
                        {category.subcategories.map((sub) => (
                          <Link
                            key={sub.id}
                            to={`/collections/${sub.handle}`}
                            className="block px-4 py-2 text-[14px] text-text hover:bg-surface hover:text-primary transition-colors"
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
      <div
        className="fixed inset-0 bg-black/50 z-[1030]"
        onClick={onClose}
        aria-hidden="true"
      />

      <div className="fixed inset-y-0 left-0 w-80 max-w-[calc(100%-3rem)] bg-white z-[1050] shadow-xl">
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
          {categories && categories.length > 0 && (
            <div className="border-b border-border">
              <button
                className="flex items-center justify-between w-full px-4 py-3 text-text font-medium"
                onClick={() => toggleSection('categories')}
              >
                <span>Categories</span>
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
              <div className="space-y-3">
                <Link
                  to="/account/login"
                  className="flex items-center gap-2 text-text hover:text-primary"
                  onClick={onClose}
                >
                  <Icon name="user" size={20} />
                  <span>Sign In</span>
                </Link>
                <Link
                  to="/account/register"
                  className="block text-center text-sm font-medium text-primary border border-primary rounded-lg px-4 py-2 hover:bg-primary hover:text-white transition-colors"
                  onClick={onClose}
                >
                  Register
                </Link>
              </div>
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
  categories = [],
}: HeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [searchOpen, setSearchOpen] = useState(false);
  const [resolvedIsLoggedIn, setResolvedIsLoggedIn] = useState(false);
  const [cartCount, setCartCount] = useState(0);
  const [cartTotal, setCartTotal] = useState('$0.00');
  const location = useLocation();
  const isHomePage = location.pathname === '/';

  // Close search on route change
  useEffect(() => {
    setSearchOpen(false);
  }, [location]);

  // Resolve isLoggedIn promise
  useEffect(() => {
    if (typeof isLoggedIn === 'boolean') {
      setResolvedIsLoggedIn(isLoggedIn);
    } else if (isLoggedIn instanceof Promise) {
      isLoggedIn.then(setResolvedIsLoggedIn);
    }
  }, [isLoggedIn]);

  // Resolve cart data (quantity + total)
  useEffect(() => {
    function extractCartData(cartData: unknown) {
      if (!cartData || typeof cartData !== 'object') return;
      const c = cartData as CartLike;
      if (typeof c.totalQuantity === 'number') {
        setCartCount(c.totalQuantity);
      }
      if (c.cost?.totalAmount) {
        setCartTotal(
          formatCartTotal(
            c.cost.totalAmount.amount,
            c.cost.totalAmount.currencyCode,
          ),
        );
      }
    }

    if (cart && typeof cart === 'object' && 'totalQuantity' in cart) {
      extractCartData(cart);
    } else if (cart instanceof Promise) {
      cart.then(extractCartData);
    }
  }, [cart]);

  // Close dropdown on route change
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

  const categoryFallbackItems = [
    {title: 'All Products', url: '/collections/all'},
  ];

  const whatsNewItems = [
    {title: 'Deals & Promotions', url: '/collections/deals-promotions'},
    {title: 'New Additions', url: '/collections/new-arrivals'},
    {title: 'Season Item Spotlights', url: '/collections/seasonal'},
    {title: 'Special Events', url: '/collections/special-events'},
  ];

  const languageItems = [
    {title: 'English', url: '?lang=en'},
    {title: 'Spanish', url: '?lang=es'},
    {title: 'French', url: '?lang=fr'},
  ];

  const accountItems = resolvedIsLoggedIn
    ? [
        {title: 'My Account', url: '/account'},
        {title: 'My Orders', url: '/account/orders'},
        {title: 'Sign Out', url: '/account/logout'},
      ]
    : [
        {title: 'Sign In', url: '/account/login'},
        {title: 'Register', url: '/account/register'},
      ];

  return (
    <>
      <header
        className={`sticky top-0 z-[1020] ${
          isHomePage ? 'bg-white' : 'bg-white border-b border-primary'
        }`}
      >
        {announcement && (
          <div className="bg-dark text-white text-center text-sm py-2 px-4">
            {announcement}
          </div>
        )}

        <div className="mx-auto px-4 sm:px-6 lg:px-16 xl:px-[122px] max-w-[1440px] py-[14px]">
          {isHomePage ? (
            /* ======================================================== */
            /* HOMEPAGE HEADER (Figma: "Main" variant)                   */
            /* White bg, no border, condensed logo, centered nav         */
            /* Figma: 1440×79px, gap-185 between groups, py-10+4        */
            /* ======================================================== */
            <div className="flex items-center">
              {/* Mobile: hamburger */}
              <button
                className="lg:hidden p-2 -ml-2 text-text hover:text-primary transition-colors"
                onClick={() => setMobileMenuOpen(true)}
                aria-label="Open menu"
              >
                <Icon name="menu" size={24} />
              </button>

              {/* Logo — condensed colored "Hy" (Figma: 65×50px) */}
              <Link to="/" className="shrink-0">
                <img
                  src="/logo-condensed.png"
                  alt={shop.name}
                  className="h-[50px] w-[65px] object-contain"
                  loading="eager"
                />
              </Link>

              {/* Desktop: centered navigation (Figma: gap-10px between links, 14px Inter Medium #666) */}
              <nav className="hidden lg:flex items-center justify-center flex-1 gap-[10px]">
                {categories.length > 0 ? (
                  <CategoryDropdown
                    categories={categories}
                    isOpen={activeDropdown === 'categories'}
                    onToggle={() => toggleDropdown('categories')}
                    onClose={closeDropdown}
                  />
                ) : (
                  <NavDropdown
                    label="Categories"
                    items={categoryFallbackItems}
                    isOpen={activeDropdown === 'categories'}
                    onToggle={() => toggleDropdown('categories')}
                    onClose={closeDropdown}
                  />
                )}

                <Link
                  to="/collections/new-arrivals"
                  className="flex items-center h-[40px] px-4 py-2.5 text-[14px] font-medium text-text-muted hover:text-primary transition-colors"
                >
                  What&apos;s New
                </Link>

                <Link
                  to="/blogs/news"
                  className="flex items-center h-[40px] px-4 py-2.5 text-[14px] font-medium text-text-muted hover:text-primary transition-colors"
                >
                  Blog &amp; Media
                </Link>

                <NavDropdown
                  label="EN"
                  items={languageItems}
                  isOpen={activeDropdown === 'language'}
                  onToggle={() => toggleDropdown('language')}
                  onClose={closeDropdown}
                />
              </nav>

              {/* Desktop: Sign In + Register (Figma: 166px, justify-between) */}
              <div className="hidden lg:flex items-center justify-between shrink-0 w-[166px]">
                <Link
                  to={resolvedIsLoggedIn ? '/account' : '/account/login'}
                  className="flex items-center h-[40px] px-4 py-2.5 text-[14px] font-medium text-text-muted hover:text-primary transition-colors"
                >
                  {resolvedIsLoggedIn ? 'Account' : 'Sign In'}
                </Link>
                {!resolvedIsLoggedIn && (
                  <Link
                    to="/account/register"
                    className="flex items-center h-[40px] px-4 py-2.5 text-[14px] font-medium text-secondary border border-secondary rounded-sm hover:bg-secondary hover:text-white transition-colors"
                  >
                    Register
                  </Link>
                )}
              </div>

              {/* Mobile: account icon */}
              <div className="lg:hidden flex items-center gap-1 ml-auto">
                <Link
                  to={resolvedIsLoggedIn ? '/account' : '/account/login'}
                  className="p-2 text-text hover:text-primary transition-colors"
                  aria-label="Account"
                >
                  <Icon name="user" size={20} />
                </Link>
              </div>
            </div>
          ) : (
            /* ======================================================== */
            /* NON-HOMEPAGE HEADER (Figma: "Alternate" variant)          */
            /* White bg, green bottom border, search bar, cart badge     */
            /* Figma: 1440×78px, px-122, py-14, gap-26, border-b primary*/
            /* ======================================================== */
            <div className="flex items-center gap-4 lg:gap-[26px]">
              {/* Mobile: hamburger */}
              <button
                className="lg:hidden p-2 -ml-2 text-text hover:text-primary transition-colors"
                onClick={() => setMobileMenuOpen(true)}
                aria-label="Open menu"
              >
                <Icon name="menu" size={24} />
              </button>

              {/* Left group: logo + hamburger + search (Figma: gap-15, flex-1) */}
              <div className="hidden lg:flex items-center gap-[15px] flex-1">
                {/* Logo — condensed colored "Hy" (Figma: 65×50px) */}
                <Link to="/" className="shrink-0">
                  <img
                    src="/logo-condensed.png"
                    alt={shop.name}
                    className="h-[50px] w-[65px] object-contain"
                    loading="eager"
                  />
                </Link>

                {/* Categories hamburger button (Figma: 40×40, border-1 secondary, radius 6px) */}
                <button
                  className="flex items-center justify-center size-[40px] border border-secondary rounded-xs shrink-0 hover:bg-secondary/5 transition-colors"
                  onClick={() => setMobileMenuOpen(true)}
                  aria-label="Open categories menu"
                >
                  <Icon name="menu" size={24} className="text-secondary" />
                </button>

                {/* Search bar (Figma: border-1 secondary, rounded-25, h-40, flex-1) */}
                <button
                  type="button"
                  onClick={() => setSearchOpen(true)}
                  className="flex flex-1 items-center justify-between border border-secondary rounded-[25px] h-[40px] px-[13px] py-[10px] bg-white cursor-text"
                >
                  <span className="text-[14px] font-medium text-black/50">
                    Search products...
                  </span>
                  <Icon
                    name="search"
                    size={28}
                    className="text-text-muted shrink-0"
                  />
                </button>
              </div>

              {/* Mobile: logo (visible only on mobile since desktop logo is inside left group) */}
              <Link to="/" className="shrink-0 lg:hidden">
                <img
                  src="/logo-condensed.png"
                  alt={shop.name}
                  className="h-[50px] w-[65px] object-contain"
                  loading="eager"
                />
              </Link>

              {/* Right actions (Figma: 222px, justify-between) */}
              <div className="hidden lg:flex items-center justify-between shrink-0 w-[222px]">
                <NavDropdown
                  label="My Orders"
                  items={[
                    {title: 'All Orders', url: '/account/orders'},
                    {title: 'Track Order', url: '/account/orders'},
                  ]}
                  isOpen={activeDropdown === 'orders'}
                  onToggle={() => toggleDropdown('orders')}
                  onClose={closeDropdown}
                />

                <Link
                  to={resolvedIsLoggedIn ? '/account' : '/account/login'}
                  className="flex items-center h-[40px] px-4 py-2.5 text-[14px] font-medium text-text-muted hover:text-primary transition-colors whitespace-nowrap"
                >
                  Account
                </Link>

                {/* Cart icon with badge (Figma: 54×40 container, white bg badge 10×10) */}
                <Link
                  to="/cart"
                  className="relative flex items-center justify-center w-[54px] h-[40px] shrink-0"
                  aria-label={`Cart (${cartCount} items)`}
                >
                  <Icon
                    name="cart"
                    size={40}
                    className="text-secondary"
                  />
                  {cartCount > 0 && (
                    <span className="absolute -top-1 -right-1 flex items-center justify-center min-w-[18px] h-[18px] text-[14px] font-medium text-white bg-secondary rounded-full px-1">
                      {cartCount > 9 ? '9+' : cartCount}
                    </span>
                  )}
                </Link>
              </div>

              {/* Mobile: search + cart */}
              <div className="lg:hidden flex items-center gap-1 ml-auto">
                <button
                  type="button"
                  onClick={() => setSearchOpen(true)}
                  className="p-2 text-text-muted hover:text-primary transition-colors"
                  aria-label="Search"
                >
                  <Icon name="search" size={20} />
                </button>
                <Link
                  to="/cart"
                  className="relative p-2 text-text-muted hover:text-primary transition-colors"
                  aria-label={`Cart (${cartCount} items)`}
                >
                  <Icon name="cart" size={24} />
                  {cartCount > 0 && (
                    <span className="absolute -top-1 -right-1 flex items-center justify-center w-5 h-5 text-[9px] font-medium text-black bg-primary rounded-full">
                      {cartCount > 99 ? '99+' : cartCount}
                    </span>
                  )}
                </Link>
              </div>
            </div>
          )}
        </div>
      </header>

      {/* Mobile menu */}
      <MobileMenu
        isOpen={mobileMenuOpen}
        onClose={() => setMobileMenuOpen(false)}
        menu={menu}
        isLoggedIn={resolvedIsLoggedIn}
        categories={categories}
      />

      {/* Predictive Search Overlay */}
      <PredictiveSearch
        isOpen={searchOpen}
        onClose={() => setSearchOpen(false)}
      />
    </>
  );
}

export default Header;
