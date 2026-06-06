import {
  Analytics,
  getShopAnalytics,
  useNonce,
  useLoadScript,
} from '@shopify/hydrogen';
import type { LanguageCode } from '@shopify/hydrogen/storefront-api-types';
import {
  Outlet,
  useRouteError,
  isRouteErrorResponse,
  type ShouldRevalidateFunction,
  Links,
  Meta,
  Scripts,
  ScrollRestoration,
  useRouteLoaderData,
} from 'react-router';
import type { Route } from './+types/root';
import { useMemo, useEffect } from 'react';
import i18next from 'i18next';
import { initReactI18next } from 'react-i18next';
import { I18nextProvider } from 'react-i18next';
import { resources, i18nConfig } from '~/i18n';
import { PageLayout } from '~/components/layout';
import appStyles from '~/styles/app.css?url';
import {categoryNavConfig} from '~/config/navigation';
import {prioritizeCategories} from '~/lib/navigation';
import {readWishlistIds, type AdminEnv} from '~/lib/wishlist';
import {isCustomerLoggedIn, getCustomerAccessToken} from '~/lib/customer-auth';
import {getAnalyticsConfig} from '~/config/analytics.server';
import {GtmConsentDefaults} from '~/components/analytics/GtmConsentDefaults';
import {GtmScript} from '~/components/analytics/GtmScript';
import {GtmNoScript} from '~/components/analytics/GtmNoScript';
import {usePageViewTracking} from '~/hooks/usePageViewTracking';
import {useAnalyticsContext} from '~/hooks/useAnalyticsContext';
import {GLOBAL_CMS_QUERY, parseGlobalCms} from '~/lib/cms';
import {
  adminApi,
  getInboxScriptUrl,
  getMainThemeId,
  buildInboxWidgetConfig,
  type InboxWidgetConfig,
} from '~/lib/admin-api';

export type RootLoader = typeof loader;

const INBOX_CHAT_SCRIPT =
  'https://cdn.shopify.com/extensions/a91f9cd9-7693-4b55-b0f8-a47f69a8cb0c/inbox-1267/assets/inbox-chat-loader.js';

// ─── Links ────────────────────────────────────────────────────────────────────

export function links() {
  return [
    { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' },
    { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
    {
      rel: 'preconnect',
      href: 'https://fonts.gstatic.com',
      crossOrigin: 'anonymous' as const,
    },
    {
      rel: 'stylesheet',
      href: 'https://fonts.googleapis.com/css2?family=Roboto:wght@300;400;500;700&family=Assistant:wght@300;400;500;600;700;800&display=swap',
    },
    { rel: 'preconnect', href: 'https://cdn.shopify.com' },
    { rel: 'preconnect', href: 'https://shop.app' },
  ];
}

// ─── Revalidation ────────────────────────────────────────────────────────────

export const shouldRevalidate: ShouldRevalidateFunction = ({
  formMethod,
  currentUrl,
  nextUrl,
}) => {
  if (formMethod && formMethod !== 'GET') return true;
  if (currentUrl.toString() === nextUrl.toString()) return true;
  return false;
};

// ─── Loader ──────────────────────────────────────────────────────────────────

export async function loader(args: Route.LoaderArgs) {
  const deferredData = loadDeferredData(args);
  const criticalData = await loadCriticalData(args);
  const analyticsConfig = getAnalyticsConfig();

  const { storefront, env } = args.context;

  return {
    ...deferredData,
    ...criticalData,
    analytics: analyticsConfig.enabled ? analyticsConfig : null,
    publicStoreDomain: env.PUBLIC_STORE_DOMAIN,
    storeCountry: args.context.storefront.i18n.country,
    shop: getShopAnalytics({
      storefront,
      publicStorefrontId: env.PUBLIC_STOREFRONT_ID,
    }),
    consent: {
      checkoutDomain: env.PUBLIC_CHECKOUT_DOMAIN,
      storefrontAccessToken: env.PUBLIC_STOREFRONT_API_TOKEN,
      withPrivacyBanner: false,
      country: args.context.storefront.i18n.country,
      language: args.context.storefront.i18n.language,
    },
  };
}

// ─── Banner Discounts ─────────────────────────────────────────────────────────

export interface BannerDiscount {
  id: string;
  code: string;
  title: string;
}

const BANNER_DISCOUNTS_QUERY = `
  query BannerDiscounts {
    codeDiscountNodes(first: 30) {
      nodes {
        id
        codeDiscount {
          __typename
          ... on DiscountCodeBasic {
            status
            codes(first: 1) { nodes { code } }
            customerGets {
              value {
                __typename
                ... on DiscountPercentage { percentage }
                ... on DiscountAmount { amount { amount currencyCode } }
              }
              items {
                __typename
                ... on AllDiscountItems { allItems }
                ... on DiscountCollections {
                  collections(first: 1) { nodes { title } }
                }
                ... on DiscountProducts {
                  products(first: 1) { nodes { title } }
                }
              }
            }
          }
          ... on DiscountCodeBxgy {
            title
            status
            codes(first: 1) { nodes { code } }
          }
          ... on DiscountCodeFreeShipping {
            status
            codes(first: 1) { nodes { code } }
          }
        }
      }
    }
  }
`;

function describeDiscount(d: any): string {
  const type = d.__typename;

  if (type === 'DiscountCodeFreeShipping') return 'Free shipping on your order';

  if (type === 'DiscountCodeBxgy') {
    return d.title || 'Buy & get offer';
  }

  if (type === 'DiscountCodeBasic') {
    const val = d.customerGets?.value;
    const items = d.customerGets?.items;

    // Build value string
    let valueStr = '';
    if (val?.__typename === 'DiscountPercentage') {
      const pct = Math.round((val.percentage ?? 0) * 100);
      valueStr = `${pct}% off`;
    } else if (val?.__typename === 'DiscountAmount') {
      const amt = parseFloat(val.amount?.amount ?? '0');
      const currency = val.amount?.currencyCode ?? 'USD';
      valueStr = `${new Intl.NumberFormat('en-US', {style: 'currency', currency}).format(amt)} off`;
    }

    // Build scope string
    let scopeStr = '';
    const itemType = items?.__typename;
    if (itemType === 'AllDiscountItems') {
      scopeStr = 'everything';
    } else if (itemType === 'DiscountCollections') {
      const collTitle = items.collections?.nodes?.[0]?.title;
      scopeStr = collTitle ?? 'select collections';
    } else if (itemType === 'DiscountProducts') {
      const prodTitle = items.products?.nodes?.[0]?.title;
      scopeStr = prodTitle ?? 'select products';
    }

    return (
      [valueStr, scopeStr].filter(Boolean).join(' on ') || 'Special discount'
    );
  }

  return 'Special discount';
}

function parseBannerDiscounts(data: any): BannerDiscount[] {
  const nodes: any[] = data?.codeDiscountNodes?.nodes ?? [];
  return nodes
    .filter((n) => n.codeDiscount?.status === 'ACTIVE')
    .map((n) => {
      const code = (n.codeDiscount.codes?.nodes?.[0]?.code as string) ?? '';
      const description = describeDiscount(n.codeDiscount);
      return {id: n.id as string, code, title: description};
    })
    .filter((d) => d.code);
}

// ─────────────────────────────────────────────────────────────────────────────

async function loadCriticalData({context, request}: Route.LoaderArgs) {
  const {storefront} = context;

  const cookie = request.headers.get('Cookie') ?? '';
  const langMatch = /(?:^|;\s*)language=([^;]+)/.exec(cookie);
  const lang = langMatch?.[1]?.toUpperCase() ?? '';
  const currentLanguage = ['EN', 'ES', 'FR'].includes(lang) ? lang : 'EN';

  const [
    header,
    collectionsResult,
    seasonalNavResult,
    discountsNavResult,
    globalCmsData,
    bannerDiscountsData,
  ] = await Promise.all([
    storefront.query(HEADER_QUERY, {
      cache: storefront.CacheLong(),
      variables: {
        headerMenuHandle: 'main-menu',
        language: currentLanguage as LanguageCode,
        country: storefront.i18n.country,
      },
    }),
    storefront.query(HEADER_COLLECTIONS_QUERY, {
      cache: storefront.CacheLong(),
      variables: {
        language: currentLanguage as LanguageCode,
        country: storefront.i18n.country,
      },
    }),
    storefront
      .query(SEASONAL_NAV_QUERY, {
        cache: storefront.CacheLong(),
        variables: {
          language: currentLanguage as LanguageCode,
          country: storefront.i18n.country,
        },
      })
      .catch(() => null),
    storefront
      .query(DISCOUNTS_NAV_QUERY, {
        cache: storefront.CacheLong(),
        variables: {
          language: currentLanguage as LanguageCode,
          country: storefront.i18n.country,
        },
      })
      .catch(() => null),
    storefront
      .query(GLOBAL_CMS_QUERY, {cache: storefront.CacheShort()})
      .catch(() => null),
    adminApi(context.env as unknown as AdminEnv, BANNER_DISCOUNTS_QUERY).catch(
      (err) => {
        console.error('[BannerDiscounts] Admin API error:', err);
        return null;
      },
    ),
  ]);

  const rawCategories =
    collectionsResult?.collections?.nodes?.map(
      (c: {
        id: string;
        title: string;
        handle: string;
        menuPriority?: { value: string } | null;
      }) => ({
        id: c.id,
        title: c.title,
        handle: c.handle,
        priority: c.menuPriority ? parseInt(c.menuPriority.value, 10) : null,
      }),
    ) ?? [];

  const categories = prioritizeCategories(rawCategories, categoryNavConfig);

  const rawSeasonalItems: Array<{
    id: string;
    title: string;
    handle: string;
    priority: number | null;
  }> =
    (
      seasonalNavResult?.collection?.childCollections?.references?.nodes ?? []
    ).map(
      (c: {
        id: string;
        title: string;
        handle: string;
        menuPriority?: { value: string } | null;
      }) => ({
        id: c.id,
        title: c.title,
        handle: c.handle,
        priority: c.menuPriority ? parseInt(c.menuPriority.value, 10) : null,
      }),
    ) ?? [];

  const seasonalItems = rawSeasonalItems
    .sort((a, b) => {
      if (a.priority !== null && b.priority !== null)
        return a.priority - b.priority;
      if (a.priority !== null) return -1;
      if (b.priority !== null) return 1;
      return a.title.localeCompare(b.title);
    })
    .slice(0, 5)
    .map(({ priority: _p, ...item }) => item);

  const rawDiscountItems: Array<{
    id: string;
    title: string;
    handle: string;
    priority: number | null;
  }> =
    (
      discountsNavResult?.collection?.childCollections?.references?.nodes ?? []
    ).map(
      (c: {
        id: string;
        title: string;
        handle: string;
        menuPriority?: {value: string} | null;
      }) => ({
        id: c.id,
        title: c.title,
        handle: c.handle,
        priority: c.menuPriority ? parseInt(c.menuPriority.value, 10) : null,
      }),
    ) ?? [];

  const discountItems = rawDiscountItems
    .sort((a, b) => {
      if (a.priority !== null && b.priority !== null)
        return a.priority - b.priority;
      if (a.priority !== null) return -1;
      if (b.priority !== null) return 1;
      return a.title.localeCompare(b.title);
    })
    .map(({priority: _p, ...item}) => item);

  const locale = currentLanguage.toLowerCase() as 'en' | 'es' | 'fr';

  let wishlistIds: string[] = [];
  const sessionToken = getCustomerAccessToken(context.session);
  if (sessionToken) {
    try {
      const { customer: rootCustomer } = await storefront.query(
        `#graphql
          query RootCustomerId($customerAccessToken: String!) {
            customer(customerAccessToken: $customerAccessToken) { id }
          }
        ` as const,
        { variables: { customerAccessToken: sessionToken } },
      );
      const customerId = rootCustomer?.id ?? undefined;
      wishlistIds = await readWishlistIds(
        storefront,
        context.env as unknown as AdminEnv,
        '',
        customerId,
      ).catch(() => []);
    } catch {
      // Wishlist fetch failed — proceed without
    }
  }

  const adminEnv = context.env as unknown as AdminEnv;
  const globalCms = parseGlobalCms(globalCmsData, adminEnv);
  const bannerDiscounts = parseBannerDiscounts(bannerDiscountsData);
  if (globalCms.promoTierEnabled && !bannerDiscounts.length) {
    console.warn(
      '[AnnouncementBanner] promoTierEnabled=true but no active discounts returned.',
      'Raw response:',
      JSON.stringify(bannerDiscountsData)?.slice(0, 300),
    );
  }
  const [inboxScriptUrl, shopifyThemeId] = await Promise.all([
    getInboxScriptUrl(adminEnv, globalCms.shopifyInboxWidgetScriptUrl),
    getMainThemeId(adminEnv),
  ]);

  const inboxConfig = inboxScriptUrl
    ? buildInboxWidgetConfig(
        inboxScriptUrl,
        context.env.PUBLIC_STORE_DOMAIN,
        globalCms.shopifyInboxShopId,
      )
    : null;

  return {
    header,
    categories,
    seasonalItems,
    discountItems,
    currentLanguage,
    locale,
    wishlistIds,
    globalCms,
    bannerDiscounts,
    inboxConfig,
    shopifyThemeId,
    storeCurrency: header?.shop?.paymentSettings?.currencyCode ?? 'USD',
  };
}

function loadDeferredData({ context }: Route.LoaderArgs) {
  const { storefront, cart } = context;

  const footer = storefront
    .query(FOOTER_QUERY, {
      cache: storefront.CacheLong(),
      variables: {
        footerMenuHandle: 'footer',
      },
    })
    .catch((error: Error) => {
      console.error(error);
      return null;
    });

  return {
    cart: cart.get(),
    isLoggedIn: isCustomerLoggedIn(context.session),
    footer,
  };
}

// ─── Layout ──────────────────────────────────────────────────────────────────

export function Layout({ children }: { children?: React.ReactNode }) {
  const nonce = useNonce();
  const data = useRouteLoaderData<RootLoader>('root');
  const locale = (data?.locale ?? 'en') as string;
  const analytics = data?.analytics;
  const shopDomain = data?.publicStoreDomain;
  const inboxConfig = data?.inboxConfig ?? null;
  const storeCurrency = data?.storeCurrency ?? 'USD';
  const storeCountry = data?.storeCountry ?? 'US';
  const shopifyThemeId = data?.shopifyThemeId ?? 0;
  const gtmContainerId = data?.globalCms?.gtmContainerId || null;

  return (
    <html lang={locale} data-locale={locale}>
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width,initial-scale=1" />
        {/* Google Tag Manager — container ID from custom.google_tag_manager_id Shop metafield */}
        {gtmContainerId && (
          <>
            <script
              nonce={nonce}
              suppressHydrationWarning
              dangerouslySetInnerHTML={{
                __html: `window.dataLayer=window.dataLayer||[];window.dataLayer.push({'gtm.start':new Date().getTime(),event:'gtm.js'});`,
              }}
            />
            <script
              nonce={nonce}
              async
              suppressHydrationWarning
              src={`https://www.googletagmanager.com/gtm.js?id=${gtmContainerId}`}
            />
          </>
        )}
        <link rel="stylesheet" href={appStyles} />
        <Meta />
        <Links />

        {analytics && (
          <>
            {/* Consent defaults before GTM so all states start as 'denied' */}
            <GtmConsentDefaults nonce={nonce} waitMs={500} />
            {/* GTM bootstrap after consent, before </head> */}
            <GtmScript
              containerId={analytics.gtm.containerId}
              nonce={nonce}
              dataLayerName={analytics.gtm.dataLayerName}
              serverUrl={analytics.gtm.serverUrl}
            />
          </>
        )}
      </head>
      <body>
        {/* GTM noscript immediately after <body> — required by GTM spec */}
        {analytics && (
          <GtmNoScript
            containerId={analytics.gtm.containerId}
            serverUrl={analytics.gtm.serverUrl}
          />
        )}
        {children}
        <ScrollRestoration nonce={nonce} />
        {inboxConfig ? (
          <>
            <script
              nonce={nonce}
              id="shopify-features"
              type="application/json"
              suppressHydrationWarning
              dangerouslySetInnerHTML={{
                __html: '{"features":["shopify-chat"]}',
              }}
            />
            <script
              nonce={nonce}
              suppressHydrationWarning
              dangerouslySetInnerHTML={{
                __html: [
                  'window.Shopify = window.Shopify || {};',
                  `window.Shopify.shop = ${JSON.stringify(shopDomain)};`,
                  `window.Shopify.locale = ${JSON.stringify(locale)};`,
                  `window.Shopify.currency = ${JSON.stringify(storeCurrency)};`,
                  `window.Shopify.country = ${JSON.stringify(storeCountry)};`,
                  // role:"main" + real theme id lets Inbox match the store's
                  // Admin-configured settings (greeting, quick replies, etc.).
                  `window.Shopify.theme = {handle:"hydrogen",id:${shopifyThemeId},role:"main",style:{id:null,handle:null}};`,
                ].join(' '),
              }}
            />
            <script
              nonce={nonce}
              type="module"
              defer
              async
              suppressHydrationWarning
              src={inboxConfig.scriptUrl}
              data-button-color={inboxConfig.buttonColor}
              data-secondary-color={inboxConfig.secondaryColor}
              data-ternary-color={inboxConfig.ternaryColor}
              data-icon={inboxConfig.icon}
              data-text={inboxConfig.text}
              data-position={inboxConfig.position}
              data-vertical-position={inboxConfig.verticalPosition}
              data-shop-id={inboxConfig.shopId}
              data-shop={inboxConfig.shopDomain}
              data-shop-domain={inboxConfig.shopDomain}
            />
          </>
        ) : null}
        <Scripts nonce={nonce} />
      </body>
    </html>
  );
}

// ─── App ─────────────────────────────────────────────────────────────────────

export default function App() {
  const data = useRouteLoaderData<RootLoader>('root');
  const locale = (data?.locale ?? 'en') as string;

  usePageViewTracking({ enabled: !!data?.analytics });
  useAnalyticsContext({
    enabled: !!data?.analytics,
    isLoggedIn: data?.isLoggedIn ?? false,
  });

  // Load Shopify Inbox chat widget asynchronously
  useLoadScript(INBOX_CHAT_SCRIPT);

  const i18nInstance = useMemo(() => {
    const instance = i18next.createInstance();
    void instance.use(initReactI18next).init({
      ...i18nConfig,
      lng: locale,
      resources,
    });
    return instance;
  }, [locale]);

  useEffect(() => {
    if (i18next.language !== locale) {
      void i18next.changeLanguage(locale);
    }
  }, [locale]);

  if (!data) {
    return <Outlet />;
  }

  return (
    <I18nextProvider i18n={i18nInstance}>
      <Analytics.Provider
        cart={data.cart}
        shop={data.shop}
        consent={data.consent}
      >
        <PageLayout />
      </Analytics.Provider>
    </I18nextProvider>
  );
}

// ─── Error boundary ──────────────────────────────────────────────────────────

export function ErrorBoundary() {
  const error = useRouteError();
  let errorStatus = 500;

  if (isRouteErrorResponse(error)) {
    errorStatus = error.status;
  }

  const is404 = errorStatus === 404;

  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width,initial-scale=1" />
        {is404 && <meta name="robots" content="noindex, nofollow" />}
        <title>
          {is404 ? 'Page Not Found | Hy-lee' : 'Something went wrong | Hy-lee'}
        </title>
        <Links />
      </head>
      <body>
        <div className="flex min-h-screen flex-col items-center justify-center gap-8 px-4 text-center">
          {is404 ? (
            <>
              <div>
                <p className="text-sm font-semibold uppercase tracking-widest text-primary">
                  404
                </p>
                <h1 className="mt-2 text-4xl font-bold text-dark sm:text-5xl">
                  Page not found
                </h1>
                <p className="mt-4 text-lg text-text-muted">
                  The page you&apos;re looking for doesn&apos;t exist or has
                  been moved.
                </p>
              </div>

              <form
                action="/search"
                method="get"
                className="flex w-full max-w-md gap-2"
              >
                <input
                  type="search"
                  name="q"
                  placeholder="Search products…"
                  className="flex-1 rounded-xl border border-border px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                  aria-label="Search products"
                />
                <button
                  type="submit"
                  className="rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-white hover:bg-primary/90"
                >
                  Search
                </button>
              </form>

              <nav
                aria-label="Return to site"
                className="flex flex-wrap justify-center gap-3"
              >
                <a
                  href="/"
                  className="rounded-xl border border-border px-4 py-2 text-sm font-medium hover:bg-accent"
                >
                  Home
                </a>
                <a
                  href="/collections"
                  className="rounded-xl border border-border px-4 py-2 text-sm font-medium hover:bg-accent"
                >
                  All Collections
                </a>
                <a
                  href="/collections/new-arrivals"
                  className="rounded-xl border border-border px-4 py-2 text-sm font-medium hover:bg-accent"
                >
                  New Arrivals
                </a>
                <a
                  href="/faq"
                  className="rounded-xl border border-border px-4 py-2 text-sm font-medium hover:bg-accent"
                >
                  FAQ
                </a>
              </nav>
            </>
          ) : (
            <>
              <div>
                <p className="text-sm font-semibold uppercase tracking-widest text-destructive">
                  {errorStatus}
                </p>
                <h1 className="mt-2 text-4xl font-bold text-dark sm:text-5xl">
                  Something went wrong
                </h1>
                <p className="mt-4 text-lg text-text-muted">
                  An unexpected error occurred. Please try again later.
                </p>
              </div>
              <a
                href="/"
                className="rounded-xl bg-primary px-6 py-3 text-sm font-semibold text-white hover:bg-primary/90"
              >
                Return to home
              </a>
            </>
          )}
        </div>
        <Scripts />
      </body>
    </html>
  );
}

// ─── GraphQL ─────────────────────────────────────────────────────────────────

const MENU_FRAGMENT = `#graphql
  fragment MenuItem on MenuItem {
    id
    resourceId
    tags
    title
    type
    url
  }
  fragment L4MenuItem on MenuItem {
    ...MenuItem
  }
  fragment L3MenuItem on MenuItem {
    ...MenuItem
    items {
      ...L4MenuItem
    }
  }
  fragment L2MenuItem on MenuItem {
    ...MenuItem
    items {
      ...L3MenuItem
    }
  }
  fragment L1MenuItem on MenuItem {
    ...MenuItem
    items {
      ...L2MenuItem
    }
  }
  fragment Menu on Menu {
    id
    items {
      ...L1MenuItem
    }
  }
` as const;

const HEADER_QUERY = `#graphql
  fragment Shop on Shop {
    id
    name
    description
    primaryDomain {
      url
    }
    brand {
      logo {
        image {
          url
        }
      }
    }
    paymentSettings {
      currencyCode
    }
  }
  query Header(
    $country: CountryCode
    $headerMenuHandle: String!
    $language: LanguageCode
  ) @inContext(language: $language, country: $country) {
    shop {
      ...Shop
    }
    menu(handle: $headerMenuHandle) {
      ...Menu
    }
  }
  ${MENU_FRAGMENT}
` as const;

const HEADER_COLLECTIONS_QUERY = `#graphql
  query HeaderCollections(
    $country: CountryCode
    $language: LanguageCode
  ) @inContext(country: $country, language: $language) {
    collections(first: 250, sortKey: TITLE) {
      nodes {
        id
        title
        handle
        menuPriority: metafield(namespace: "custom", key: "menu_priority_order") {
          value
        }
      }
    }
  }
` as const;

const SEASONAL_NAV_QUERY = `#graphql
  query SeasonalNavItems(
    $country: CountryCode
    $language: LanguageCode
  ) @inContext(country: $country, language: $language) {
    collection(handle: "seasonal") {
      childCollections: metafield(namespace: "custom", key: "child_nodes") {
        references(first: 10) {
          nodes {
            ... on Collection {
              id
              title
              handle
              menuPriority: metafield(namespace: "custom", key: "menu_priority_order") {
                value
              }
            }
          }
        }
      }
    }
  }
` as const;

const DISCOUNTS_NAV_QUERY = `#graphql
  query DiscountsNavItems(
    $country: CountryCode
    $language: LanguageCode
  ) @inContext(country: $country, language: $language) {
    collection(handle: "discounts-menu") {
      childCollections: metafield(namespace: "custom", key: "child_nodes") {
        references(first: 20) {
          nodes {
            ... on Collection {
              id
              title
              handle
              menuPriority: metafield(namespace: "custom", key: "menu_priority_order") {
                value
              }
            }
          }
        }
      }
    }
  }
` as const;

const FOOTER_QUERY = `#graphql
  query Footer(
    $country: CountryCode
    $footerMenuHandle: String!
    $language: LanguageCode
  ) @inContext(language: $language, country: $country) {
    menu(handle: $footerMenuHandle) {
      ...Menu
    }
  }
  ${MENU_FRAGMENT}
` as const;
