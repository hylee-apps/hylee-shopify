// ============================================================================
// Shopify Admin API — lightweight GraphQL client using client credentials grant
// ============================================================================
//
// The Storefront API cannot write customer metafields. This module exchanges
// a Client ID + Secret (from a Dev Dashboard app with `write_customers` scope)
// for a short-lived Admin API access token, and caches it in memory.
//
// Setup:
//   1. Shopify Dev Dashboard → create app → add `read_customers` + `write_customers` scopes
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
