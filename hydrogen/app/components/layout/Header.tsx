import {useState, useCallback, useEffect} from 'react';
import {Link, Form, useLocation} from 'react-router';
import {useTranslation} from 'react-i18next';
import {SearchAutocomplete} from '~/components/search/SearchAutocomplete';
import {
  Menu,
  ChevronDown,
  Globe,
  User,
  Search,
  ShoppingCart,
} from 'lucide-react';
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
  currentLanguage?: string;
  categories?: Array<{
    id: string;
    title: string;
    handle: string;
    subcategories?: Array<{id: string; title: string; handle: string}>;
  }>;
}

const LANGUAGES = [
  {code: 'EN', label: 'English'},
  {code: 'ES', label: 'Español'},
  {code: 'FR', label: 'Français'},
] as const;

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
  'flex items-center gap-1 h-[40px] px-4 py-2.5 text-[16px] font-semibold text-[#111827] hover:text-primary transition-colors focus:outline-none';

// ============================================================================
// NavDropdown — shadcn DropdownMenu
// ============================================================================

function NavDropdown({
  label,
  items,
}: {
  label: string;
  items: Array<{key: string; url: string; method?: 'post'}>;
}) {
  const {t} = useTranslation();
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className={NAV_TRIGGER_CLASS}>
          {label}
          <ChevronDown size={16} />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="min-w-48">
        {items.map((item) =>
          item.method === 'post' ? (
            <DropdownMenuItem key={item.url} asChild>
              <Form method="post" action={item.url}>
                <button
                  type="submit"
                  className="cursor-pointer text-[14px] w-full text-left"
                >
                  {t(item.key)}
                </button>
              </Form>
            </DropdownMenuItem>
          ) : (
            <DropdownMenuItem key={item.url} asChild>
              <Link to={item.url} className="cursor-pointer text-[14px]">
                {t(item.key)}
              </Link>
            </DropdownMenuItem>
          ),
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

// ============================================================================
// CategoryBar — full-width horizontal category navigation
// ============================================================================

function CategoryBar({
  categories,
}: {
  categories: NonNullable<HeaderProps['categories']>;
}) {
  const {t} = useTranslation();
  return (
    <nav className="hidden lg:block absolute left-0 right-0 border-t border-border bg-white shadow-md z-50">
      <ul className="flex items-center justify-center">
        {categories.map((category) => (
          <li key={category.id} className="flex-1 text-center">
            <Link
              to={`/collections/${category.handle}`}
              className="block py-2.5 text-[14px] font-medium text-text-muted hover:text-primary transition-colors whitespace-nowrap"
            >
              {t(`nav.categoryTitles.${category.handle}`, {
                defaultValue: category.title,
              })}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
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
  const {t} = useTranslation();

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
            {t('header.mobileMenuTitle')}
          </SheetTitle>
        </SheetHeader>

        <nav className="overflow-y-auto flex-1">
          {categories && categories.length > 0 && (
            <div className="border-b border-border">
              <button
                className="flex items-center justify-between w-full px-4 py-3 text-text font-medium"
                onClick={() => toggleSection('categories')}
              >
                <span>{t('nav.categories')}</span>
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
                      {t(`nav.categoryTitles.${cat.handle}`, {
                        defaultValue: cat.title,
                      })}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Static navigation links */}
          <Link
            to="/collections/new-arrivals"
            className="block px-4 py-3 text-text font-medium border-b border-border hover:text-primary"
            onClick={onClose}
          >
            {t('nav.whatsNew')}
          </Link>
          <Link
            to="/collections/discounts"
            className="block px-4 py-3 text-text font-medium border-b border-border hover:text-primary"
            onClick={onClose}
          >
            {t('nav.discounts')}
          </Link>
          <Link
            to="/pages/promotions"
            className="block px-4 py-3 text-text font-medium border-b border-border hover:text-primary"
            onClick={onClose}
          >
            {t('nav.promotionsDeals')}
          </Link>
          <Link
            to="/blogs/news"
            className="block px-4 py-3 text-text font-medium border-b border-border hover:text-primary"
            onClick={onClose}
          >
            {t('nav.blogMedia')}
          </Link>

          <div className="mt-4 px-4 py-3 border-t border-border">
            {isLoggedIn ? (
              <Link
                to="/account"
                className="flex items-center gap-2 text-text hover:text-primary"
                onClick={onClose}
              >
                <User size={20} />
                <span>{t('nav.account')}</span>
              </Link>
            ) : (
              <div className="space-y-3">
                <Link
                  to="/account/login"
                  className="flex items-center gap-2 text-text hover:text-primary"
                  onClick={onClose}
                >
                  <User size={20} />
                  <span>{t('nav.signIn')}</span>
                </Link>
                <Button
                  variant="outline"
                  asChild
                  className="w-full border-primary text-primary hover:bg-primary hover:text-white"
                >
                  <Link to="/account/register" onClick={onClose}>
                    {t('nav.register')}
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
// LanguageSelector — Globe icon + dropdown, submits POST to /api/language
// ============================================================================

function LanguageSelector({currentLanguage}: {currentLanguage: string}) {
  const {t} = useTranslation();
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          className={`${NAV_TRIGGER_CLASS} gap-1.5`}
          aria-label={t('header.selectLanguage')}
        >
          <Globe size={16} />
          {currentLanguage}
          <ChevronDown size={14} />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-36">
        {LANGUAGES.map((lang) => (
          <DropdownMenuItem key={lang.code} asChild>
            <Form method="post" action="/api/language" reloadDocument>
              <input type="hidden" name="language" value={lang.code} />
              <button
                type="submit"
                className={`cursor-pointer text-[14px] w-full text-left flex items-center gap-2 ${
                  currentLanguage === lang.code
                    ? 'font-semibold text-secondary'
                    : ''
                }`}
              >
                {lang.label}
              </button>
            </Form>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
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
  currentLanguage = 'EN',
  categories = [],
}: HeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [categoryBarOpen, setCategoryBarOpen] = useState(false);
  const [resolvedIsLoggedIn, setResolvedIsLoggedIn] = useState(false);
  const [cartCount, setCartCount] = useState(0);
  const location = useLocation();
  const isHome = variant === 'home';
  const {t} = useTranslation();

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
    setCategoryBarOpen(false);
  }, [location.pathname]);

  const accountItems = resolvedIsLoggedIn
    ? [
        {key: 'nav.myAccount', url: '/account'},
        {key: 'nav.myOrders', url: '/account/orders'},
        {
          key: 'nav.signOut',
          url: '/account/logout',
          method: 'post' as const,
        },
      ]
    : [
        {key: 'nav.signIn', url: '/account/login'},
        {key: 'nav.register', url: '/account/register'},
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

        {isHome ? (
          /* ── HOMEPAGE HEADER (Main variant) ── */
          /* Full-width 3-column layout: logo far-left | nav centered | account/cart far-right */
          <div className="max-w-screen-2xl mx-auto w-full flex items-center px-4 sm:px-6 lg:px-8 py-2.5">
            {/* Left column — logo + mobile hamburger */}
            <div className="flex items-center gap-2 flex-1">
              <button
                className="lg:hidden p-2 -ml-2 text-text hover:text-primary transition-colors"
                onClick={() => setMobileMenuOpen(true)}
                aria-label={t('header.openMenu')}
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
            </div>

            {/* Center column — nav links (desktop only) */}
            <nav className="hidden lg:flex items-center gap-2.5">
              {categories.length > 0 && (
                <button
                  className={NAV_TRIGGER_CLASS}
                  onClick={() => setCategoryBarOpen((prev) => !prev)}
                >
                  {t('nav.categories')}
                  <ChevronDown
                    size={16}
                    className={`transition-transform ${categoryBarOpen ? 'rotate-180' : ''}`}
                  />
                </button>
              )}

              <Link
                to="/collections/new-arrivals"
                className={NAV_TRIGGER_CLASS}
              >
                {t('nav.whatsNew')}
              </Link>

              <Link to="/collections/discounts" className={NAV_TRIGGER_CLASS}>
                {t('nav.discounts')}
              </Link>

              <Link to="/pages/promotions" className={NAV_TRIGGER_CLASS}>
                {t('nav.promotionsDeals')}
              </Link>

              <Link to="/blogs/news" className={NAV_TRIGGER_CLASS}>
                {t('nav.blogMedia')}
              </Link>
            </nav>

            {/* Right column — account/cart (desktop) + mobile icons */}
            <div className="flex items-center gap-1 flex-1 justify-end">
              {/* Desktop */}
              <div className="hidden lg:flex items-center gap-1">
                <LanguageSelector currentLanguage={currentLanguage} />
                <NavDropdown label={t('nav.account')} items={accountItems} />
                <Link
                  to="/cart"
                  className="relative p-2 text-secondary hover:text-primary transition-colors shrink-0"
                  aria-label={t('header.cartCount', {count: cartCount})}
                >
                  <ShoppingCart size={24} />
                  {cartCount > 0 && (
                    <span className="absolute top-0 right-0 flex items-center justify-center min-w-4.5 h-4.5 px-1 text-[10px] font-medium text-white bg-primary rounded-full">
                      {cartCount > 99 ? '99+' : cartCount}
                    </span>
                  )}
                </Link>
              </div>

              {/* Mobile */}
              <div className="lg:hidden flex items-center gap-1">
                <Link
                  to="/search"
                  className="p-2 text-text-muted hover:text-primary transition-colors"
                  aria-label={t('header.search')}
                >
                  <Search size={20} />
                </Link>
                <Link
                  to={resolvedIsLoggedIn ? '/account' : '/account/login'}
                  className="p-2 text-text-muted hover:text-primary transition-colors"
                  aria-label={t('nav.account')}
                >
                  <User size={20} />
                </Link>
                <Link
                  to="/cart"
                  className="relative p-2 text-text-muted hover:text-primary transition-colors"
                  aria-label={t('header.cartCount', {count: cartCount})}
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
          </div>
        ) : (
          /* ── ALTERNATE HEADER (non-homepage) ── */
          /* Figma node 2766:311: condensed logo + hamburger + search + DropdownMenu nav + cart */
          <div className="max-w-screen-2xl mx-auto w-full flex items-center gap-4 lg:gap-[26px] px-4 sm:px-6 lg:px-8 py-2.5">
            {/* Mobile: hamburger */}
            <button
              className="lg:hidden p-2 -ml-2 text-text hover:text-primary transition-colors"
              onClick={() => setMobileMenuOpen(true)}
              aria-label={t('header.openMenu')}
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
                aria-label={t('header.openCategoriesMenu')}
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

            {/* Desktop right: language + account + cart */}
            <div className="hidden lg:flex items-center gap-1 shrink-0">
              <LanguageSelector currentLanguage={currentLanguage} />
              <NavDropdown label={t('nav.account')} items={accountItems} />

              <Link
                to="/cart"
                className="relative p-2 text-secondary hover:text-primary transition-colors shrink-0"
                aria-label={t('header.cartCount', {count: cartCount})}
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
                aria-label={t('header.search')}
              >
                <Search size={20} />
              </Link>
              <Link
                to="/cart"
                className="relative p-2 text-text-muted hover:text-primary transition-colors"
                aria-label={t('header.cartCount', {count: cartCount})}
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

        {categoryBarOpen && categories.length > 0 && (
          <CategoryBar categories={categories} />
        )}
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
