/**
 * Shared wishlist helpers.
 *
 * Wishlist items are stored as a JSON array of product GIDs in the
 * customer metafield `custom.wishlist`.
 *
 * Both reads AND writes use the Admin API. The Storefront API cannot
 * read metafields in the `custom` namespace unless a metafield definition
 * with explicit Storefront API access has been created in Shopify Admin —
 * and Admin API writes are not visible to Storefront API reads without
 * that configuration. Using the Admin API for both sides guarantees
 * consistency immediately after every write.
 */

import {adminApi, setCustomerMetafields, type AdminEnv} from '~/lib/admin-api';
export type {AdminEnv};

// ============================================================================
// Types
// ============================================================================

type StorefrontLike = {
  query: <T = Record<string, unknown>>(
    query: string,
    options?: {variables?: Record<string, unknown>},
  ) => Promise<T>;
};

// ============================================================================
// GraphQL
// ============================================================================

/**
 * Storefront API — used only to resolve the customer GID from an access
 * token. Customer identity fields (id, name, email) are always accessible
 * via Storefront API; only metafields require Admin API.
 */
const CUSTOMER_GID_QUERY = `#graphql
  query CustomerGid($customerAccessToken: String!) {
    customer(customerAccessToken: $customerAccessToken) {
      id
    }
  }
` as const;

/**
 * Admin API — reads the wishlist metafield directly. This is always
 * correct regardless of Storefront API metafield access settings.
 */
const ADMIN_WISHLIST_QUERY = `
  query AdminCustomerWishlist($customerId: ID!) {
    customer(id: $customerId) {
      wishlist: metafield(namespace: "custom", key: "wishlist") {
        value
      }
    }
  }
`;

// ============================================================================
// Internal helpers
// ============================================================================

/**
 * Resolve the customer Shopify GID from a Storefront access token.
 * This is the only Storefront API call needed — the GID is then used
 * for all subsequent Admin API calls.
 */
async function resolveCustomerId(
  storefront: StorefrontLike,
  customerAccessToken: string,
): Promise<string | null> {
  try {
    const data = await storefront.query(CUSTOMER_GID_QUERY, {
      variables: {customerAccessToken},
    });
    return (data as any)?.customer?.id ?? null;
  } catch {
    return null;
  }
}

/**
 * Read wishlist IDs via Admin API for a known customer GID.
 */
async function readWishlistIdsByGid(
  env: AdminEnv,
  customerId: string,
): Promise<string[]> {
  try {
    const data = await adminApi<{
      customer: {wishlist: {value: string} | null} | null;
    }>(env, ADMIN_WISHLIST_QUERY, {customerId});

    const rawValue = data.customer?.wishlist?.value;
    if (!rawValue) return [];
    const parsed = JSON.parse(rawValue);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((id): id is string => typeof id === 'string');
  } catch {
    return [];
  }
}

// ============================================================================
// Public API
// ============================================================================

/**
 * Read the current wishlist product GIDs for a customer.
 * Uses Storefront API to resolve the GID, then Admin API to read the metafield.
 */
export async function readWishlistIds(
  storefront: StorefrontLike,
  env: AdminEnv,
  customerAccessToken: string,
  customerIdOverride?: string,
): Promise<string[]> {
  const customerId =
    customerIdOverride ??
    (await resolveCustomerId(storefront, customerAccessToken));
  if (!customerId) return [];
  return readWishlistIdsByGid(env, customerId);
}

/**
 * Write an updated wishlist GID array back to the customer metafield.
 */
export async function writeWishlistIds(
  env: AdminEnv,
  customerId: string,
  ids: string[],
): Promise<void> {
  await setCustomerMetafields(env, customerId, [
    {
      namespace: 'custom',
      key: 'wishlist',
      value: JSON.stringify(ids),
      type: 'json',
    },
  ]);
}

/**
 * Add a product GID to the wishlist (idempotent — no duplicate entries).
 * Returns the updated list.
 */
export async function addToWishlist(
  storefront: StorefrontLike,
  env: AdminEnv,
  customerAccessToken: string,
  productId: string,
): Promise<string[]> {
  const customerId = await resolveCustomerId(storefront, customerAccessToken);
  if (!customerId) return [];

  const currentIds = await readWishlistIdsByGid(env, customerId);
  if (currentIds.includes(productId)) return currentIds;

  const updatedIds = [...currentIds, productId];
  await writeWishlistIds(env, customerId, updatedIds);
  return updatedIds;
}

/**
 * Remove a product GID from the wishlist.
 * Returns the updated list.
 */
export async function removeFromWishlist(
  storefront: StorefrontLike,
  env: AdminEnv,
  customerAccessToken: string,
  productId: string,
  customerIdOverride?: string,
): Promise<string[]> {
  const customerId =
    customerIdOverride ??
    (await resolveCustomerId(storefront, customerAccessToken));
  if (!customerId) return [];

  const currentIds = await readWishlistIdsByGid(env, customerId);
  const updatedIds = currentIds.filter((id) => id !== productId);
  await writeWishlistIds(env, customerId, updatedIds);
  return updatedIds;
}
