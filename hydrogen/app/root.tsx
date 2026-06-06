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
import { categoryNavConfig } from '~/config/navigation';
import { prioritizeCategories } from '~/lib/navigation';
import { readWishlistIds, type AdminEnv } from '~/lib/wishlist';
import { isCustomerLoggedIn, getCustomerAccessToken } from '~/lib/customer-auth';
import { getAnalyticsConfig } from '~/config/analytics.server';
import { GtmConsentDefaults } from '~/components/analytics/GtmConsentDefaults';
import { GtmScript } from '~/components/analytics/GtmScript';
import { GtmNoScript } from '~/components/analytics/GtmNoScript';
import { usePageViewTracking } from '~/hooks/usePageViewTracking';
import { useAnalyticsContext } from '~/hooks/useAnalyticsContext';

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

async function loadCriticalData({ context, request }: Route.LoaderArgs) {
  const { storefront } = context;

  const cookie = request.headers.get('Cookie') ?? '';
  const langMatch = /(?:^|;\s*)language=([^;]+)/.exec(cookie);
  const lang = langMatch?.[1]?.toUpperCase() ?? '';
  const currentLanguage = ['EN', 'ES', 'FR'].includes(lang) ? lang : 'EN';

  const [header, collectionsResult, seasonalNavResult] = await Promise.all([
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

  return {
    header,
    categories,
    seasonalItems,
    currentLanguage,
    locale,
    wishlistIds,
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

  return (
    <html lang={locale} data-locale={locale}>
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width,initial-scale=1" />
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
  let errorMessage = 'Unknown error';
  let errorStatus = 500;

  if (isRouteErrorResponse(error)) {
    errorMessage = error?.data?.message ?? error.data;
    errorStatus = error.status;
  } else if (error instanceof Error) {
    errorMessage = error.message;
  }

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="text-center">
        <h1 className="text-5xl font-bold text-dark">{errorStatus}</h1>
        <p className="mt-4 text-lg text-text-muted">{errorMessage}</p>
      </div>
    </div>
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
