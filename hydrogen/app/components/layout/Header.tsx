import {useState, useCallback, useEffect} from 'react';
import {Link, useLocation} from 'react-router';
import {SearchAutocomplete} from '~/components/search/SearchAutocomplete';
import {Menu, ChevronDown, User, Search, ShoppingCart} from 'lucide-react';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '~/components/ui/sheet';
import {Button} from '~/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
  DropdownMenuTrigger,
} from '~/components/ui/dropdown-menu';
import type {HeaderQuery} from 'storefrontapi.generated';

// ============================================================================
// Types
// ============================================================================

export type HeaderVariant = 'home' | 'default';

export interface HeaderProps {
  shop: HeaderQuery['shop'];
  menu: HeaderQuery['menu'];
  isLoggedIn?: boolean | Promise<boolean>;
  cart?: CartLike | null | Promise<unknown>;
  announcement?: string;
  variant?: HeaderVariant;
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

// Shared trigger class for nav link/button items
const NAV_TRIGGER_CLASS =
  'flex items-center gap-1 h-[40px] px-4 py-2.5 text-[14px] font-medium text-text-muted hover:text-primary transition-colors focus:outline-none';

// ============================================================================
// NavDropdown — shadcn DropdownMenu
// ============================================================================

function NavDropdown({
  label,
  items,
}: {
  label: string;
  items: Array<{title: string; url: string}>;
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className={NAV_TRIGGER_CLASS}>
          {label}
          <ChevronDown size={16} />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="min-w-48">
        {items.map((item) => (
          <DropdownMenuItem key={item.url} asChild>
            <Link to={item.url} className="cursor-pointer text-[14px]">
              {item.title}
            </Link>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

// ============================================================================
// CategoryDropdown — shadcn DropdownMenu with sub-menus for subcategories
// ============================================================================

function CategoryDropdown({
  categories,
}: {
  categories: NonNullable<HeaderProps['categories']>;
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className={NAV_TRIGGER_CLASS}>
          Categories
          <ChevronDown size={16} />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="start"
        className="min-w-64 max-h-96 overflow-y-auto"
      >
        {categories.map((category) =>
          category.subcategories && category.subcategories.length > 0 ? (
            <DropdownMenuSub key={category.id}>
              <DropdownMenuSubTrigger className="text-[14px]">
                {category.title}
              </DropdownMenuSubTrigger>
              <DropdownMenuSubContent className="min-w-48">
                {category.subcategories.map((sub) => (
                  <DropdownMenuItem key={sub.id} asChild>
                    <Link
                      to={`/collections/${sub.handle}`}
                      className="cursor-pointer text-[14px]"
                    >
                      {sub.title}
                    </Link>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuSubContent>
            </DropdownMenuSub>
          ) : (
            <DropdownMenuItem key={category.id} asChild>
              <Link
                to={`/collections/${category.handle}`}
                className="cursor-pointer text-[14px]"
              >
                {category.title}
              </Link>
            </DropdownMenuItem>
          ),
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

// ============================================================================
// MobileMenu — shadcn Sheet
// ============================================================================

function MobileMenu({
  isOpen,
  onClose,
  menu,
  isLoggedIn,
  categories,
}: MobileMenuProps) {
  const [expandedSection, setExpandedSection] = useState<string | null>(null);

  const toggleSection = useCallback((section: string) => {
    setExpandedSection((prev) => (prev === section ? null : section));
  }, []);

  return (
    <Sheet open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <SheetContent
        side="left"
        className="w-80 max-w-[calc(100%-3rem)] p-0 flex flex-col"
      >
        <SheetHeader className="px-4 py-3 border-b border-border shrink-0">
          <SheetTitle className="text-lg font-semibold text-dark text-left">
            Menu
          </SheetTitle>
        </SheetHeader>

        <nav className="overflow-y-auto flex-1">
          {categories && categories.length > 0 && (
            <div className="border-b border-border">
              <button
                className="flex items-center justify-between w-full px-4 py-3 text-text font-medium"
                onClick={() => toggleSection('categories')}
              >
                <span>Categories</span>
                <ChevronDown
                  size={16}
                  className={`transition-transform ${
                    expandedSection === 'categories' ? 'rotate-180' : ''
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
                    <ChevronDown
                      size={16}
                      className={`transition-transform ${
                        expandedSection === item.id ? 'rotate-180' : ''
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
                <User size={20} />
                <span>Account</span>
              </Link>
            ) : (
              <div className="space-y-3">
                <Link
                  to="/account/login"
                  className="flex items-center gap-2 text-text hover:text-primary"
                  onClick={onClose}
                >
                  <User size={20} />
                  <span>Sign In</span>
                </Link>
                <Button
                  variant="outline"
                  asChild
                  className="w-full border-primary text-primary hover:bg-primary hover:text-white"
                >
                  <Link to="/account/register" onClick={onClose}>
                    Register
                  </Link>
                </Button>
              </div>
            )}
          </div>
        </nav>
      </SheetContent>
    </Sheet>
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
  categories = [],
}: HeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [resolvedIsLoggedIn, setResolvedIsLoggedIn] = useState(false);
  const [cartCount, setCartCount] = useState(0);
  const location = useLocation();
  const isHome = variant === 'home';

  useEffect(() => {
    if (typeof isLoggedIn === 'boolean') {
      setResolvedIsLoggedIn(isLoggedIn);
    } else if (isLoggedIn instanceof Promise) {
      isLoggedIn.then(setResolvedIsLoggedIn);
    }
  }, [isLoggedIn]);

  useEffect(() => {
    function extractCartData(cartData: unknown) {
      if (!cartData || typeof cartData !== 'object') return;
      const c = cartData as CartLike;
      if (typeof c.totalQuantity === 'number') setCartCount(c.totalQuantity);
    }
    if (cart && typeof cart === 'object' && 'totalQuantity' in cart) {
      extractCartData(cart);
    } else if (cart instanceof Promise) {
      cart.then(extractCartData);
    }
  }, [cart]);

  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  const categoryFallbackItems = [
    {title: 'All Products', url: '/collections/all'},
  ];
  const accountItems = resolvedIsLoggedIn
    ? [
        {title: 'My Account', url: '/account'},
        {title: 'My Orders', url: '/account/orders'},
        {title: 'Track Order', url: '/account/orders'},
        {title: 'Sign Out', url: '/account/logout'},
      ]
    : [
        {title: 'Sign In', url: '/account/login'},
        {title: 'Register', url: '/account/register'},
      ];

  return (
    <>
      <header
        className={`sticky top-0 z-1020 ${
          isHome ? 'bg-white' : 'bg-white border-b border-primary'
        }`}
      >
        {announcement && (
          <div className="bg-dark text-white text-center text-sm py-2 px-4">
            {announcement}
          </div>
        )}

        <div className={`mx-auto max-w-300 ${isHome ? 'py-2.5' : 'py-3.5'}`}>
          {isHome ? (
            /* ── HOMEPAGE HEADER (Main variant) ── */
            <div className="flex items-center">
              <button
                className="lg:hidden p-2 -ml-2 text-text hover:text-primary transition-colors"
                onClick={() => setMobileMenuOpen(true)}
                aria-label="Open menu"
              >
                <Menu size={24} />
              </button>

              <Link to="/" className="shrink-0">
                <img
                  src="/logo-condensed.png"
                  alt={shop.name}
                  className="h-[50px] w-[65px] object-contain"
                  loading="eager"
                />
              </Link>

              <nav className="hidden lg:flex items-center justify-center flex-1 gap-2.5">
                {categories.length > 0 ? (
                  <CategoryDropdown categories={categories} />
                ) : (
                  <NavDropdown
                    label="Categories"
                    items={categoryFallbackItems}
                  />
                )}

                <Link
                  to="/collections/new-arrivals"
                  className={NAV_TRIGGER_CLASS}
                >
                  What&apos;s New
                </Link>

                <Link to="/blogs/news" className={NAV_TRIGGER_CLASS}>
                  Blog &amp; Media
                </Link>
              </nav>

              <div className="hidden lg:flex items-center gap-1 shrink-0">
                <NavDropdown label="Account" items={accountItems} />
                <Link
                  to="/cart"
                  className="relative p-2 text-secondary hover:text-primary transition-colors shrink-0"
                  aria-label={`Cart (${cartCount} items)`}
                >
                  <ShoppingCart size={24} />
                  {cartCount > 0 && (
                    <span className="absolute top-0 right-0 flex items-center justify-center min-w-4.5 h-4.5 px-1 text-[10px] font-medium text-white bg-primary rounded-full">
                      {cartCount > 99 ? '99+' : cartCount}
                    </span>
                  )}
                </Link>
              </div>

              <div className="lg:hidden flex items-center gap-1 ml-auto">
                <Link
                  to="/search"
                  className="p-2 text-text-muted hover:text-primary transition-colors"
                  aria-label="Search"
                >
                  <Search size={20} />
                </Link>
                <Link
                  to={resolvedIsLoggedIn ? '/account' : '/account/login'}
                  className="p-2 text-text-muted hover:text-primary transition-colors"
                  aria-label="Account"
                >
                  <User size={20} />
                </Link>
                <Link
                  to="/cart"
                  className="relative p-2 text-text-muted hover:text-primary transition-colors"
                  aria-label={`Cart (${cartCount} items)`}
                >
                  <ShoppingCart size={24} />
                  {cartCount > 0 && (
                    <span className="absolute top-0 right-0 flex items-center justify-center min-w-4.5 h-4.5 px-1 text-[10px] font-medium text-white bg-primary rounded-full">
                      {cartCount > 99 ? '99+' : cartCount}
                    </span>
                  )}
                </Link>
              </div>
            </div>
          ) : (
            /* ── ALTERNATE HEADER (non-homepage) ── */
            /* Figma node 2766:311: condensed logo + hamburger + search + DropdownMenu nav + cart */
            <div className="flex items-center gap-4 lg:gap-[26px]">
              {/* Mobile: hamburger */}
              <button
                className="lg:hidden p-2 -ml-2 text-text hover:text-primary transition-colors"
                onClick={() => setMobileMenuOpen(true)}
                aria-label="Open menu"
              >
                <Menu size={24} />
              </button>

              {/* Desktop left group: logo + categories button + search bar */}
              <div className="hidden lg:flex items-center gap-[15px] flex-1">
                <Link to="/" className="shrink-0">
                  <img
                    src="/logo-condensed.png"
                    alt={shop.name}
                    className="h-[50px] w-[65px] object-contain"
                    loading="eager"
                  />
                </Link>

                {/* Categories hamburger → opens Sheet */}
                <button
                  className="p-2 text-secondary hover:text-primary transition-colors shrink-0"
                  onClick={() => setMobileMenuOpen(true)}
                  aria-label="Open categories menu"
                >
                  <Menu size={24} />
                </button>

                {/* Search bar with Searchanise autocomplete */}
                <SearchAutocomplete className="flex-1" />
              </div>

              {/* Mobile: logo */}
              <Link to="/" className="shrink-0 lg:hidden">
                <img
                  src="/logo-condensed.png"
                  alt={shop.name}
                  className="h-[50px] w-[65px] object-contain"
                  loading="eager"
                />
              </Link>

              {/* Desktop right: DropdownMenu nav links + cart */}
              <div className="hidden lg:flex items-center shrink-0">
                <NavDropdown label="Account" items={accountItems} />

                <Link
                  to="/cart"
                  className="relative p-2 text-secondary hover:text-primary transition-colors shrink-0"
                  aria-label={`Cart (${cartCount} items)`}
                >
                  <ShoppingCart size={24} />
                  {cartCount > 0 && (
                    <span className="absolute top-0 right-0 flex items-center justify-center min-w-4.5 h-4.5 px-1 text-[10px] font-medium text-white bg-primary rounded-full">
                      {cartCount > 99 ? '99+' : cartCount}
                    </span>
                  )}
                </Link>
              </div>

              {/* Mobile: search + cart */}
              <div className="lg:hidden flex items-center gap-1 ml-auto">
                <Link
                  to="/search"
                  className="p-2 text-text-muted hover:text-primary transition-colors"
                  aria-label="Search"
                >
                  <Search size={20} />
                </Link>
                <Link
                  to="/cart"
                  className="relative p-2 text-text-muted hover:text-primary transition-colors"
                  aria-label={`Cart (${cartCount} items)`}
                >
                  <ShoppingCart size={24} />
                  {cartCount > 0 && (
                    <span className="absolute top-0 right-0 flex items-center justify-center min-w-4.5 h-4.5 px-1 text-[10px] font-medium text-white bg-primary rounded-full">
                      {cartCount > 99 ? '99+' : cartCount}
                    </span>
                  )}
                </Link>
              </div>
            </div>
          )}
        </div>
      </header>

      <MobileMenu
        isOpen={mobileMenuOpen}
        onClose={() => setMobileMenuOpen(false)}
        menu={menu}
        isLoggedIn={resolvedIsLoggedIn}
        categories={categories}
      />
    </>
  );
}

export default Header;
