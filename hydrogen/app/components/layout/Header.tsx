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
  Package,
} from 'lucide-react';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '~/components/ui/sheet';
import {VisuallyHidden} from '@radix-ui/react-visually-hidden';
import {Button} from '~/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '~/components/ui/dropdown-menu';
import type {HeaderQuery} from 'storefrontapi.generated';
import {AnnouncementBanner} from './AnnouncementBanner';

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
  promoTierEnabled?: boolean;
  variant?: HeaderVariant;
  currentLanguage?: string;
  categories?: Array<{
    id: string;
    title: string;
    handle: string;
    subcategories?: Array<{id: string; title: string; handle: string}>;
  }>;
  seasonalItems?: Array<{id: string; title: string; handle: string}>;
  discountItems?: Array<{id: string; title: string; handle: string}>;
  socialFacebook?: string | null;
  socialInstagram?: string | null;
  socialPinterest?: string | null;
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
  currentLanguage: string;
  categories?: HeaderProps['categories'];
  seasonalItems?: HeaderProps['seasonalItems'];
  discountItems?: HeaderProps['discountItems'];
  socialFacebook?: string | null;
  socialInstagram?: string | null;
  socialPinterest?: string | null;
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

const MOBILE_SOCIAL_LINKS = [
  {
    label: 'Instagram',
    url: 'https://instagram.com',
    icon: 'M12 2.163c3.204 0 3.584.012 4.85.07 1.17.054 1.97.24 2.43.403a4.088 4.088 0 011.523.99 4.088 4.088 0 01.99 1.524c.163.46.349 1.26.403 2.43.058 1.265.07 1.645.07 4.849s-.012 3.584-.07 4.849c-.054 1.17-.24 1.97-.403 2.43a4.088 4.088 0 01-.99 1.524 4.088 4.088 0 01-1.524.99c-.46.163-1.26.349-2.43.403-1.265.058-1.645.07-4.849.07s-3.584-.012-4.849-.07c-1.17-.054-1.97-.24-2.43-.403a4.088 4.088 0 01-1.524-.99 4.088 4.088 0 01-.99-1.524c-.163-.46-.349-1.26-.403-2.43C2.175 15.584 2.163 15.204 2.163 12s.012-3.584.07-4.849c.054-1.17.24-1.97.403-2.43a4.088 4.088 0 01.99-1.524A4.088 4.088 0 015.15 2.636c.46-.163 1.26-.349 2.43-.403C8.845 2.175 9.225 2.163 12 2.163zm0 1.802c-3.15 0-3.504.013-4.743.069-.985.045-1.52.208-1.876.346-.472.183-.808.403-1.162.756a3.13 3.13 0 00-.756 1.162c-.138.356-.301.891-.346 1.876-.056 1.24-.069 1.593-.069 4.743s.013 3.504.069 4.743c.045.985.208 1.52.346 1.876.183.472.403.808.756 1.162.354.354.69.573 1.162.756.356.138.891.301 1.876.346 1.24.056 1.593.069 4.743.069s3.504-.013 4.743-.069c.985-.045 1.52-.208 1.876-.346.472-.183.808-.403 1.162-.756.354-.354.573-.69.756-1.162.138-.356.301-.891.346-1.876.056-1.24.069-1.593.069-4.743s-.013-3.504-.069-4.743c-.045-.985-.208-1.52-.346-1.876a3.13 3.13 0 00-.756-1.162 3.13 3.13 0 00-1.162-.756c-.356-.138-.891-.301-1.876-.346C15.504 3.978 15.15 3.965 12 3.965zm0 3.067a4.968 4.968 0 110 9.936 4.968 4.968 0 010-9.936zm0 8.19a3.223 3.223 0 100-6.446 3.223 3.223 0 000 6.446zm5.168-8.452a1.16 1.16 0 11-2.32 0 1.16 1.16 0 012.32 0z',
  },
  {
    label: 'Facebook',
    url: 'https://facebook.com',
    icon: 'M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z',
  },
  {
    label: 'Pinterest',
    url: 'https://pinterest.com',
    icon: 'M12 0C5.373 0 0 5.373 0 12c0 5.084 3.163 9.426 7.627 11.174-.105-.949-.2-2.405.042-3.441.218-.937 1.407-5.965 1.407-5.965s-.359-.719-.359-1.782c0-1.668.967-2.914 2.171-2.914 1.023 0 1.518.769 1.518 1.69 0 1.029-.655 2.568-.994 3.995-.283 1.194.599 2.169 1.777 2.169 2.133 0 3.772-2.249 3.772-5.495 0-2.873-2.064-4.882-5.012-4.882-3.414 0-5.418 2.561-5.418 5.207 0 1.031.397 2.138.893 2.738a.36.36 0 01.083.345l-.333 1.36c-.053.22-.174.267-.402.161-1.499-.698-2.436-2.889-2.436-4.649 0-3.785 2.75-7.262 7.929-7.262 4.163 0 7.398 2.967 7.398 6.931 0 4.136-2.607 7.464-6.227 7.464-1.216 0-2.359-.632-2.75-1.378l-.748 2.853c-.271 1.043-1.002 2.35-1.492 3.146C9.57 23.812 10.763 24 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0z',
  },
];

// Shared trigger class for nav link/button items
const NAV_TRIGGER_CLASS =
  'flex items-center gap-1 h-[40px] px-4 py-2.5 text-[16px] font-semibold text-[#111827] hover:text-primary transition-colors focus:outline-none';

// Pre-filtered /collections/all URLs for virtual nav sections.
// Tag-based filters require products to be tagged accordingly in Shopify Admin.
const FILTERED_URLS = {
  newArrivals: '/collections/all?sort=newest',
  discounts: `/collections/all?filter=${encodeURIComponent(JSON.stringify({tag: 'sale'}))}`,
  promotions: `/collections/all?filter=${encodeURIComponent(JSON.stringify({tag: 'promotion'}))}`,
} as const;

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
// SeasonalBar — full-width horizontal seasonal navigation (mirrors CategoryBar)
// ============================================================================

function SeasonalBar({
  items,
}: {
  items: NonNullable<HeaderProps['seasonalItems']>;
}) {
  const {t} = useTranslation();
  return (
    <nav className="hidden lg:block absolute left-0 right-0 border-t border-border bg-white shadow-md z-50">
      <ul className="flex items-center justify-center">
        {items.length > 0 ? (
          items.map((item) => (
            <li key={item.id} className="flex-1 text-center">
              <Link
                to={`/collections/${item.handle}`}
                className="block py-2.5 text-[14px] font-medium text-text-muted hover:text-primary transition-colors whitespace-nowrap"
              >
                {item.title}
              </Link>
            </li>
          ))
        ) : (
          <li className="py-2.5 text-[14px] text-text-muted">
            {t('nav.seasonalComingSoon', {
              defaultValue: 'Seasonal collections coming soon',
            })}
          </li>
        )}
      </ul>
    </nav>
  );
}

// ============================================================================
// DiscountsBar — full-width horizontal discounted-categories navigation
// ============================================================================

function DiscountsBar({
  items,
}: {
  items: NonNullable<HeaderProps['discountItems']>;
}) {
  const {t} = useTranslation();
  return (
    <nav className="hidden lg:block absolute left-0 right-0 border-t border-border bg-white shadow-md z-50">
      <ul className="flex items-center justify-center">
        {items.length > 0 ? (
          items.map((item) => (
            <li key={item.id} className="flex-1 text-center">
              <Link
                to={`/collections/${item.handle}`}
                className="block py-2.5 text-[14px] font-medium text-text-muted hover:text-primary transition-colors whitespace-nowrap"
              >
                {item.title}
              </Link>
            </li>
          ))
        ) : (
          <li className="py-2.5 text-[14px] text-text-muted">
            {t('nav.discountsComingSoon', {
              defaultValue: 'Discounted categories coming soon',
            })}
          </li>
        )}
      </ul>
    </nav>
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
  currentLanguage,
  categories,
  seasonalItems = [],
  discountItems = [],
  socialFacebook,
  socialInstagram,
  socialPinterest,
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
            to={FILTERED_URLS.newArrivals}
            className="block px-4 py-3 text-text font-medium border-b border-border hover:text-primary"
            onClick={onClose}
          >
            {t('nav.whatsNew')}
          </Link>

          {seasonalItems.length > 0 ? (
            <div className="border-b border-border">
              <button
                className="flex items-center justify-between w-full px-4 py-3 text-text font-medium"
                onClick={() => toggleSection('seasonal')}
              >
                <span>{t('nav.seasonal')}</span>
                <ChevronDown
                  size={16}
                  className={`transition-transform ${
                    expandedSection === 'seasonal' ? 'rotate-180' : ''
                  }`}
                />
              </button>
              {expandedSection === 'seasonal' && (
                <div className="bg-surface pb-2">
                  {seasonalItems.map((item) => (
                    <Link
                      key={item.id}
                      to={`/collections/${item.handle}`}
                      className="block px-6 py-2 text-sm text-text hover:text-primary"
                      onClick={onClose}
                    >
                      {item.title}
                    </Link>
                  ))}
                  <Link
                    to="/collections/seasonal"
                    className="block px-6 py-2 text-sm font-semibold text-secondary hover:text-primary"
                    onClick={onClose}
                  >
                    {t('nav.seeAll')}
                  </Link>
                </div>
              )}
            </div>
          ) : (
            <Link
              to="/collections/seasonal"
              className="block px-4 py-3 font-medium text-text hover:text-primary border-b border-border"
              onClick={onClose}
            >
              {t('nav.seasonal')}
            </Link>
          )}

          <div className="border-b border-border">
            <button
              className="flex items-center justify-between w-full px-4 py-3 text-text font-medium"
              onClick={() => toggleSection('discounts')}
            >
              <span>{t('nav.discounts')}</span>
              <ChevronDown
                size={16}
                className={`transition-transform ${
                  expandedSection === 'discounts' ? 'rotate-180' : ''
                }`}
              />
            </button>
            {expandedSection === 'discounts' && (
              <div className="bg-surface pb-2">
                {discountItems.length > 0 ? (
                  discountItems.map((item) => (
                    <Link
                      key={item.id}
                      to={`/collections/${item.handle}`}
                      className="block px-6 py-2 text-sm text-text hover:text-primary"
                      onClick={onClose}
                    >
                      {item.title}
                    </Link>
                  ))
                ) : (
                  <p className="px-6 py-2 text-sm text-text-muted">
                    {t('nav.discountsComingSoon', {
                      defaultValue: 'Discounted categories coming soon',
                    })}
                  </p>
                )}
              </div>
            )}
          </div>
          <Link
            to={FILTERED_URLS.promotions}
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
                className="flex items-center gap-2 tap-target text-text hover:text-primary"
                onClick={onClose}
              >
                <User size={20} />
                <span>{t('nav.account')}</span>
              </Link>
            ) : (
              <div className="space-y-3">
                <Link
                  to="/order-tracking"
                  className="flex items-center gap-2 text-text hover:text-primary"
                  onClick={onClose}
                >
                  <Package size={20} />
                  <span>{t('nav.trackOrders')}</span>
                </Link>
                <Link
                  to="/account/login"
                  className="flex items-center gap-2 tap-target text-text hover:text-primary"
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

          <div className="px-4 py-3 border-t border-border">
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-text-muted">
              {t('header.selectLanguage')}
            </p>
            <div className="flex flex-wrap gap-2">
              {LANGUAGES.map((lang) => (
                <Form
                  key={lang.code}
                  method="post"
                  action="/api/language"
                  reloadDocument
                  className="inline-flex"
                >
                  <input type="hidden" name="language" value={lang.code} />
                  <button
                    type="submit"
                    className={`tap-target inline-flex items-center gap-1.5 rounded-full border px-3 text-sm transition-colors ${
                      currentLanguage === lang.code
                        ? 'border-secondary bg-secondary/10 text-secondary font-semibold'
                        : 'border-border text-text hover:border-primary hover:text-primary'
                    }`}
                    aria-pressed={currentLanguage === lang.code}
                  >
                    <Globe size={14} />
                    {lang.code}
                  </button>
                </Form>
              ))}
            </div>
          </div>

          {(socialInstagram ?? socialFacebook ?? socialPinterest) && (
            <div className="px-4 py-3 border-t border-border">
              <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-text-muted">
                {t('header.followUs', {defaultValue: 'Follow Us'})}
              </p>
              <div className="flex gap-4">
                {MOBILE_SOCIAL_LINKS.map((social) => {
                  const url =
                    social.label === 'Instagram'
                      ? socialInstagram
                      : social.label === 'Facebook'
                        ? socialFacebook
                        : socialPinterest;
                  if (!url) return null;
                  return (
                    <a
                      key={social.label}
                      href={url}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={social.label}
                      className="text-text hover:text-primary transition-colors"
                    >
                      <svg
                        viewBox="0 0 24 24"
                        width={22}
                        height={22}
                        fill="currentColor"
                        aria-hidden="true"
                      >
                        <path d={social.icon} />
                      </svg>
                    </a>
                  );
                })}
              </div>
            </div>
          )}
        </nav>
      </SheetContent>
    </Sheet>
  );
}

// ============================================================================
// MobileSearchSheet — top-anchored Sheet with full-width SearchAutocomplete
// ============================================================================

function MobileSearchSheet({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  const {t} = useTranslation();
  return (
    <Sheet open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <SheetContent side="top" className="p-4 pt-12 lg:hidden">
        <SheetHeader className="sr-only">
          <SheetTitle>{t('header.search')}</SheetTitle>
          <SheetDescription>
            <VisuallyHidden>{t('search.placeholder')}</VisuallyHidden>
          </SheetDescription>
        </SheetHeader>
        <SearchAutocomplete className="w-full" />
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
  promoTierEnabled = true,
  variant = 'default',
  currentLanguage = 'EN',
  categories = [],
  seasonalItems = [],
  discountItems = [],
  socialFacebook,
  socialInstagram,
  socialPinterest,
}: HeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
  const [categoryBarOpen, setCategoryBarOpen] = useState(false);
  const [seasonalBarOpen, setSeasonalBarOpen] = useState(false);
  const [discountsBarOpen, setDiscountsBarOpen] = useState(false);
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
    setMobileSearchOpen(false);
    setCategoryBarOpen(false);
    setSeasonalBarOpen(false);
    setDiscountsBarOpen(false);
  }, [location.pathname]);

  const accountItems = resolvedIsLoggedIn
    ? [
        {key: 'nav.myAccount', url: '/account'},
        {key: 'nav.myOrders', url: '/account/orders'},
        {key: 'nav.trackOrders', url: '/order-tracking'},
        {
          key: 'nav.signOut',
          url: '/account/logout',
          method: 'post' as const,
        },
      ]
    : [
        {key: 'nav.trackOrders', url: '/order-tracking'},
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
        {promoTierEnabled ? (
          <AnnouncementBanner />
        ) : (
          announcement && (
            <div className="bg-dark text-white text-center text-sm py-2 px-4">
              {announcement}
            </div>
          )
        )}

        {isHome ? (
          /* ── HOMEPAGE HEADER (Main variant) ── */
          /* Full-width 3-column layout: logo far-left | nav centered | account/cart far-right */
          <div className="max-w-screen-2xl mx-auto w-full flex items-center px-4 sm:px-6 lg:px-8 py-2.5">
            {/* Left column — logo + mobile hamburger */}
            <div className="flex items-center gap-2 flex-1">
              <button
                className="lg:hidden tap-target -ml-2 inline-flex items-center justify-center text-text hover:text-primary transition-colors"
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
                  onClick={() => {
                    setSeasonalBarOpen(false);
                    setDiscountsBarOpen(false);
                    setCategoryBarOpen((prev) => !prev);
                  }}
                >
                  {t('nav.categories')}
                  <ChevronDown
                    size={16}
                    className={`transition-transform ${categoryBarOpen ? 'rotate-180' : ''}`}
                  />
                </button>
              )}

              <Link
                to={FILTERED_URLS.newArrivals}
                className={NAV_TRIGGER_CLASS}
              >
                {t('nav.whatsNew')}
              </Link>

              <button
                className={NAV_TRIGGER_CLASS}
                onClick={() => {
                  setCategoryBarOpen(false);
                  setDiscountsBarOpen(false);
                  setSeasonalBarOpen((prev) => !prev);
                }}
              >
                {t('nav.seasonal')}
                <ChevronDown
                  size={16}
                  className={`transition-transform ${seasonalBarOpen ? 'rotate-180' : ''}`}
                />
              </button>

              <button
                className={NAV_TRIGGER_CLASS}
                onClick={() => {
                  setCategoryBarOpen(false);
                  setSeasonalBarOpen(false);
                  setDiscountsBarOpen((prev) => !prev);
                }}
              >
                {t('nav.discounts')}
                <ChevronDown
                  size={16}
                  className={`transition-transform ${discountsBarOpen ? 'rotate-180' : ''}`}
                />
              </button>

              <Link to={FILTERED_URLS.promotions} className={NAV_TRIGGER_CLASS}>
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
                <button
                  type="button"
                  className="tap-target inline-flex items-center justify-center text-text-muted hover:text-primary transition-colors"
                  onClick={() => setMobileSearchOpen(true)}
                  aria-label={t('header.search')}
                >
                  <Search size={20} />
                </button>
                <Link
                  to={resolvedIsLoggedIn ? '/account' : '/account/login'}
                  className="tap-target inline-flex items-center justify-center text-text-muted hover:text-primary transition-colors"
                  aria-label={t('nav.account')}
                >
                  <User size={20} />
                </Link>
                <Link
                  to="/cart"
                  className="tap-target relative inline-flex items-center justify-center text-text-muted hover:text-primary transition-colors"
                  aria-label={t('header.cartCount', {count: cartCount})}
                >
                  <ShoppingCart size={24} />
                  {cartCount > 0 && (
                    <span className="absolute top-1 right-1 flex items-center justify-center min-w-4.5 h-4.5 px-1 text-[10px] font-medium text-white bg-primary rounded-full">
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
            {/* Mobile: hamburger + logo grouped (gap-2 matches homepage layout) */}
            <div className="flex items-center gap-2 flex-1 lg:hidden">
              <button
                className="tap-target -ml-2 inline-flex items-center justify-center text-text hover:text-primary transition-colors"
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
              <button
                type="button"
                className="tap-target inline-flex items-center justify-center text-text-muted hover:text-primary transition-colors"
                onClick={() => setMobileSearchOpen(true)}
                aria-label={t('header.search')}
              >
                <Search size={20} />
              </button>
              <Link
                to="/cart"
                className="tap-target relative inline-flex items-center justify-center text-text-muted hover:text-primary transition-colors"
                aria-label={t('header.cartCount', {count: cartCount})}
              >
                <ShoppingCart size={24} />
                {cartCount > 0 && (
                  <span className="absolute top-1 right-1 flex items-center justify-center min-w-4.5 h-4.5 px-1 text-[10px] font-medium text-white bg-primary rounded-full">
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
        {seasonalBarOpen && <SeasonalBar items={seasonalItems} />}
        {discountsBarOpen && <DiscountsBar items={discountItems} />}
      </header>

      <MobileMenu
        isOpen={mobileMenuOpen}
        onClose={() => setMobileMenuOpen(false)}
        menu={menu}
        isLoggedIn={resolvedIsLoggedIn}
        currentLanguage={currentLanguage}
        categories={categories}
        seasonalItems={seasonalItems}
        discountItems={discountItems}
        socialFacebook={socialFacebook}
        socialInstagram={socialInstagram}
        socialPinterest={socialPinterest}
      />

      <MobileSearchSheet
        isOpen={mobileSearchOpen}
        onClose={() => setMobileSearchOpen(false)}
      />
    </>
  );
}

export default Header;
