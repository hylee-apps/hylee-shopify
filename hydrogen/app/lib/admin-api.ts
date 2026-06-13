// ============================================================================
// Shopify Admin API — lightweight GraphQL client using client credentials grant
// ============================================================================
//
// The Storefront API cannot write customer metafields. This module exchanges
// a Client ID + Secret (from a Dev Dashboard app with the required scopes)
// for a short-lived Admin API access token, and caches it in memory.
//
// Setup:
//   1. Shopify Dev Dashboard → create app → add these scopes:
//        read_customers, write_customers, read_orders
//   2. Install the app on your store
//   3. Copy Client ID + Client Secret → add to .env:
//        ADMIN_APP_CLIENT_ID=...
//        ADMIN_APP_CLIENT_SECRET=...
// ============================================================================

const ADMIN_API_VERSION = '2025-01';

export interface AdminEnv {
  ADMIN_APP_CLIENT_ID?: string;
  ADMIN_APP_CLIENT_SECRET?: string;
  PUBLIC_STORE_DOMAIN: string;
  [key: string]: string | undefined;
}

// ── Token Cache ─────────────────────────────────────────────────────────────

let cachedToken: string | null = null;
let tokenExpiresAt = 0;

/**
 * Exchange client credentials for an Admin API access token.
 * Tokens are cached in memory and refreshed when expired.
 */
async function getAdminAccessToken(env: AdminEnv): Promise<string> {
  if (!env.ADMIN_APP_CLIENT_ID || !env.ADMIN_APP_CLIENT_SECRET) {
    throw new Error(
      'ADMIN_APP_CLIENT_ID and ADMIN_APP_CLIENT_SECRET are not set. ' +
        'Create a Dev Dashboard app with write_customers scope and add credentials to .env',
    );
  }

  // Return cached token if still valid (with 5-minute buffer)
  if (cachedToken && Date.now() < tokenExpiresAt - 5 * 60 * 1000) {
    return cachedToken;
  }

  const url = `https://${env.PUBLIC_STORE_DOMAIN}/admin/oauth/access_token`;

  const response = await fetch(url, {
    method: 'POST',
    headers: {'Content-Type': 'application/x-www-form-urlencoded'},
    body: new URLSearchParams({
      grant_type: 'client_credentials',
      client_id: env.ADMIN_APP_CLIENT_ID,
      client_secret: env.ADMIN_APP_CLIENT_SECRET,
    }),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(
      `Admin API token exchange failed (${response.status}): ${text}`,
    );
  }

  const data = (await response.json()) as {
    access_token: string;
    scope: string;
    expires_in: number;
  };

  cachedToken = data.access_token;
  tokenExpiresAt = Date.now() + data.expires_in * 1000;

  return cachedToken;
}

// ── GraphQL Client ──────────────────────────────────────────────────────────

interface AdminApiResponse<T = Record<string, unknown>> {
  data?: T;
  errors?: Array<{message: string; locations?: unknown[]; path?: string[]}>;
}

/**
 * Execute a GraphQL mutation/query against the Shopify Admin API.
 */
export async function adminApi<T = Record<string, unknown>>(
  env: AdminEnv,
  query: string,
  variables?: Record<string, unknown>,
): Promise<T> {
  const token = await getAdminAccessToken(env);
  const url = `https://${env.PUBLIC_STORE_DOMAIN}/admin/api/${ADMIN_API_VERSION}/graphql.json`;

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Shopify-Access-Token': token,
    },
    body: JSON.stringify({query, variables}),
  });

  if (!response.ok) {
    throw new Error(
      `Admin API request failed: ${response.status} ${response.statusText}`,
    );
  }

  const json = (await response.json()) as AdminApiResponse<T>;

  if (json.errors?.length) {
    throw new Error(
      `Admin API errors: ${json.errors.map((e) => e.message).join(', ')}`,
    );
  }

  return json.data as T;
}

// ── Customer Metafield Queries ───────────────────────────────────────────────

const CUSTOMER_METAFIELDS_QUERY = `
  query CustomerMetafields($customerId: ID!) {
    customer(id: $customerId) {
      addressBook: metafield(namespace: "custom", key: "address_book") {
        value
      }
      surveyCompleted: metafield(namespace: "custom", key: "survey_completed") {
        value
      }
    }
  }
`;

interface CustomerMetafieldsResult {
  customer: {
    addressBook: {value: string} | null;
    surveyCompleted: {value: string} | null;
  } | null;
}

/**
 * Read address-book metafields for a customer via the Admin API.
 * Use this instead of the Storefront API to avoid cross-API propagation delay
 * (Admin API writes are immediately visible to Admin API reads).
 */
export async function getCustomerMetafields(
  env: AdminEnv,
  customerId: string,
): Promise<{
  addressBook: {value: string} | null;
  surveyCompleted: {value: string} | null;
}> {
  const data = await adminApi<CustomerMetafieldsResult>(
    env,
    CUSTOMER_METAFIELDS_QUERY,
    {customerId},
  );
  return {
    addressBook: data.customer?.addressBook ?? null,
    surveyCompleted: data.customer?.surveyCompleted ?? null,
  };
}

// ── Customer Metafield Mutations ────────────────────────────────────────────

const CUSTOMER_METAFIELD_SET = `
  mutation CustomerMetafieldSet($metafields: [MetafieldsSetInput!]!) {
    metafieldsSet(metafields: $metafields) {
      metafields {
        id
        namespace
        key
        value
      }
      userErrors {
        field
        message
      }
    }
  }
`;

interface MetafieldsSetResult {
  metafieldsSet: {
    metafields: Array<{
      id: string;
      namespace: string;
      key: string;
      value: string;
    }>;
    userErrors: Array<{field: string[]; message: string}>;
  };
}

/**
 * Write one or more metafields on a customer via the Admin API.
 */
export async function setCustomerMetafields(
  env: AdminEnv,
  customerId: string,
  metafields: Array<{
    namespace: string;
    key: string;
    value: string;
    type: string;
  }>,
): Promise<void> {
  const result = await adminApi<MetafieldsSetResult>(
    env,
    CUSTOMER_METAFIELD_SET,
    {
      metafields: metafields.map((mf) => ({
        ownerId: customerId,
        namespace: mf.namespace,
        key: mf.key,
        value: mf.value,
        type: mf.type,
      })),
    },
  );

  const errors = result.metafieldsSet?.userErrors;
  if (errors?.length) {
    throw new Error(
      `Failed to set customer metafields: ${errors.map((e) => e.message).join(', ')}`,
    );
  }
}

// ── Admin REST Client ────────────────────────────────────────────────────────

async function adminRestGet<T = unknown>(
  env: AdminEnv,
  path: string,
): Promise<T> {
  const token = await getAdminAccessToken(env);
  const url = `https://${env.PUBLIC_STORE_DOMAIN}/admin/api/${ADMIN_API_VERSION}/${path}`;
  const response = await fetch(url, {
    headers: {'X-Shopify-Access-Token': token},
  });
  if (!response.ok) {
    throw new Error(
      `Admin REST GET /${path} failed: ${response.status} ${response.statusText}`,
    );
  }
  return response.json() as Promise<T>;
}

// ── Shopify Inbox Script URL ─────────────────────────────────────────────────
//
// Shopify Inbox registers a script tag via the Script Tags API. In Liquid
// themes Shopify injects it automatically; in Hydrogen we must do it manually.
// This function fetches the current versioned CDN URL so the widget stays
// up-to-date without code changes when Shopify releases a new Inbox version.
//
// Requires the Admin app to have the `read_script_tags` scope.

const INBOX_URL_CACHE_KEY = new Request(
  'https://cache.internal/inbox-script-url',
);
const THEME_ID_CACHE_KEY = new Request('https://cache.internal/main-theme-id');
// 24-hour TTL — long enough to avoid per-request overhead, short enough to
// pick up Inbox version or theme changes within a day.
const ADMIN_CACHE_MAX_AGE = 24 * 60 * 60;

/**
 * Returns the current Shopify Inbox widget CDN URL.
 *
 * Resolution order:
 *   1. Cloudflare Cache API (24h TTL, shared across isolates)
 *   2. Admin REST API script_tags lookup (live, authoritative)
 *   3. cmsOverride — value from the custom.shopify_inbox_widget_script_url Shop metafield
 *   4. null — widget is not loaded
 */
export async function getInboxScriptUrl(
  env: AdminEnv,
  cmsOverride?: string | null,
): Promise<string | null> {
  const cache = await caches.open('hydrogen');
  const cached = await cache.match(INBOX_URL_CACHE_KEY);
  if (cached) return cached.text();

  try {
    const data = await adminRestGet<{
      script_tags: Array<{src: string; event: string}>;
    }>(env, 'script_tags.json');

    const tag = data.script_tags.find(
      (t) =>
        t.src.includes('cdn.shopify.com/extensions') &&
        t.src.includes('shopifyChatV1Widget'),
    );

    if (tag) {
      await cache.put(
        INBOX_URL_CACHE_KEY,
        new Response(tag.src, {
          headers: {'Cache-Control': `max-age=${ADMIN_CACHE_MAX_AGE}`},
        }),
      );
      return tag.src;
    }
  } catch {
    // Swallow — missing read_script_tags scope or network error.
    // The widget still loads via the fallback URL below.
  }

  return cmsOverride ?? null;
}

// ── Inbox Widget Config ───────────────────────────────────────────────────────
//
// Mirrors the data-* attributes Shopify injects on the <script> tag in Liquid.
// In Hydrogen we must set these manually so the widget initialises correctly.
//
// data-shop-id  comes from the custom.shopify_inbox_shop_id Shop metafield
//               (copy from the Liquid <script> tag in your theme preview).
// data-shop / data-shop-domain are derived from env.PUBLIC_STORE_DOMAIN.
// Styling defaults (color, position, icon) match the Shopify Inbox Admin
//   settings; update them here if you reconfigure the widget in Admin.

export interface InboxWidgetConfig {
  scriptUrl: string;
  shopDomain: string;
  shopId: string;
  buttonColor: string;
  secondaryColor: string;
  ternaryColor: string;
  icon: string;
  text: string;
  position: string;
  verticalPosition: string;
}

export function buildInboxWidgetConfig(
  scriptUrl: string,
  shopDomain: string,
  shopId: string | null,
): InboxWidgetConfig | null {
  if (!shopId) return null;
  return {
    scriptUrl,
    shopDomain,
    shopId,
    // Defaults match current Shopify Inbox Admin settings.
    // Update if you change button color, position, or icon in the Inbox Admin.
    buttonColor: '#55962d',
    secondaryColor: '#ffffff',
    ternaryColor: '#6a6a6a',
    icon: 'chat_bubble',
    text: 'no_text',
    position: 'bottom_right',
    verticalPosition: 'lowest',
  };
}

// ── Published Theme ID ───────────────────────────────────────────────────────
//
// The Shopify Inbox widget matches chat settings to the store by checking
// window.Shopify.theme.id against the published (role:"main") theme. Without
// the real theme ID the widget loads but ignores all Admin-configured settings
// (greeting, quick replies, availability, etc.) and falls back to defaults.
//
// Requires the Admin app to have the `read_themes` scope.

export async function getMainThemeId(env: AdminEnv): Promise<number> {
  const cache = await caches.open('hydrogen');
  const cached = await cache.match(THEME_ID_CACHE_KEY);
  if (cached) return (await cached.json()) as number;

  try {
    const data = await adminRestGet<{
      themes: Array<{id: number; role: string; name: string}>;
    }>(env, 'themes.json?role=main');

    const main = data.themes.find((t) => t.role === 'main');
    if (main) {
      await cache.put(
        THEME_ID_CACHE_KEY,
        new Response(String(main.id), {
          headers: {'Cache-Control': `max-age=${ADMIN_CACHE_MAX_AGE}`},
        }),
      );
      return main.id;
    }
  } catch {
    // Swallow — missing read_themes scope or network error. Caller falls back.
  }

  return 0;
}

// ── Order Lookup ─────────────────────────────────────────────────────────────

// Admin API 2025-01 field names (renamed from older versions):
//   fulfillmentStatus  → displayFulfillmentStatus
//   financialStatus    → displayFinancialStatus
//   statusUrl          → statusPageUrl
//   Fulfillment.trackingCompany/Numbers/Urls → trackingInfo[].{company,number,url}
export interface AdminOrderDetail {
  id: string;
  name: string;
  processedAt: string;
  displayFulfillmentStatus: string;
  displayFinancialStatus: string;
  statusPageUrl: string;
  totalPriceSet: {shopMoney: {amount: string; currencyCode: string}};
  shippingAddress: {
    name: string;
    address1: string;
    city: string;
    province: string;
    country: string;
    zip: string;
  } | null;
  lineItems: {
    nodes: Array<{
      title: string;
      quantity: number;
      image: {url: string; altText: string | null} | null;
    }>;
  };
  fulfillments: Array<{
    trackingInfo: Array<{
      company: string | null;
      number: string | null;
      url: string | null;
    }>;
  }>;
}

const ORDER_LOOKUP_QUERY = `
  query FindOrder($q: String!) {
    orders(first: 1, query: $q) {
      nodes {
        id
        name
        processedAt
        displayFulfillmentStatus
        displayFinancialStatus
        statusPageUrl
        totalPriceSet { shopMoney { amount currencyCode } }
        shippingAddress { name address1 city province country zip }
        lineItems(first: 5) {
          nodes { title quantity image { url altText } }
        }
        fulfillments(first: 1) {
          trackingInfo { company number url }
        }
      }
    }
  }
`;

/**
 * Look up an order by email + order number using the Admin API.
 * Requires the app to have the `read_orders` scope.
 * Returns null if no matching order is found.
 */
export async function getOrderByEmailAndNumber(
  env: AdminEnv,
  email: string,
  orderNumber: string,
): Promise<AdminOrderDetail | null> {
  const q = `name:#${orderNumber} email:${email}`;
  const data = await adminApi<{orders: {nodes: AdminOrderDetail[]}}>(
    env,
    ORDER_LOOKUP_QUERY,
    {q},
  );
  return data?.orders?.nodes?.[0] ?? null;
}
