import {Analytics, getShopAnalytics, useNonce} from '@shopify/hydrogen';
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
import type {Route} from './+types/root';
import {PageLayout} from '~/components/layout';
import appStyles from '~/styles/app.css?url';
import {isCustomerLoggedIn} from '~/lib/customer-auth';
import {categoryNavConfig} from '~/config/navigation';
import {prioritizeCategories} from '~/lib/navigation';

export type RootLoader = typeof loader;

/**
 * Avoid re-fetching root queries on sub-navigations.
 */
export const shouldRevalidate: ShouldRevalidateFunction = ({
  formMethod,
  currentUrl,
  nextUrl,
}) => {
  if (formMethod && formMethod !== 'GET') return true;
  if (currentUrl.toString() === nextUrl.toString()) return true;
  return false;
};

export function links() {
  return [
    {rel: 'icon', type: 'image/x-icon', href: '/favicon.ico'},
    {rel: 'preconnect', href: 'https://fonts.googleapis.com'},
    {
      rel: 'preconnect',
      href: 'https://fonts.gstatic.com',
      crossOrigin: 'anonymous' as const,
    },
    {
      rel: 'stylesheet',
      href: 'https://fonts.googleapis.com/css2?family=Roboto:wght@300;400;500;700&family=Assistant:wght@300;400;500;600;700;800&display=swap',
    },
    {rel: 'preconnect', href: 'https://cdn.shopify.com'},
    {rel: 'preconnect', href: 'https://shop.app'},
  ];
}

export async function loader(args: Route.LoaderArgs) {
  const deferredData = loadDeferredData(args);
  const criticalData = await loadCriticalData(args);

  const {storefront, env} = args.context;

  return {
    ...deferredData,
    ...criticalData,
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

async function loadCriticalData({context}: Route.LoaderArgs) {
  const {storefront} = context;

  const [header, collectionsResult] = await Promise.all([
    storefront.query(HEADER_QUERY, {
      cache: storefront.CacheLong(),
      variables: {
        headerMenuHandle: 'main-menu',
      },
    }),
    storefront.query(HEADER_COLLECTIONS_QUERY, {
      cache: storefront.CacheLong(),
    }),
  ]);

  const rawCategories =
    collectionsResult?.collections?.nodes?.map(
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

  const categories = prioritizeCategories(rawCategories, categoryNavConfig);

  return {header, categories};
}

function loadDeferredData({context}: Route.LoaderArgs) {
  const {storefront, cart} = context;

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

export function Layout({children}: {children?: React.ReactNode}) {
  const nonce = useNonce();

  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width,initial-scale=1" />
        <link rel="stylesheet" href={appStyles} />
        <Meta />
        <Links />
      </head>
      <body>
        {children}
        <ScrollRestoration nonce={nonce} />
        <Scripts nonce={nonce} />
      </body>
    </html>
  );
}

export default function App() {
  const data = useRouteLoaderData<RootLoader>('root');

  if (!data) {
    return <Outlet />;
  }

  return (
    <Analytics.Provider
      cart={data.cart}
      shop={data.shop}
      consent={data.consent}
    >
      <PageLayout />
    </Analytics.Provider>
  );
}

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

const MENU_FRAGMENT = `#graphql
  fragment MenuItem on MenuItem {
    id
    resourceId
    tags
    title
    type
    url
  }
  # L4 — deepest level (e.g. Air Fryers)
  fragment L4MenuItem on MenuItem {
    ...MenuItem
  }
  # L3 — e.g. Kitchen Appliance
  fragment L3MenuItem on MenuItem {
    ...MenuItem
    items {
      ...L4MenuItem
    }
  }
  # L2 — e.g. Kitchen & Dining
  fragment L2MenuItem on MenuItem {
    ...MenuItem
    items {
      ...L3MenuItem
    }
  }
  # L1 — top-level category (e.g. Home & Garden)
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
