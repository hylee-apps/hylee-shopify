// ============================================================================
// Buy Again — Product Extraction
// ============================================================================

// ============================================================================
// Types
// ============================================================================

interface OrderLineItem {
  title: string;
  quantity: number;
  variant?: {
    id?: string;
    image?: {
      url: string;
      altText?: string | null;
      width?: number;
      height?: number;
    } | null;
    title?: string;
    price?: {amount: string; currencyCode: string};
    product?: {handle?: string};
  } | null;
}

interface Order {
  id: string;
  name: string;
  processedAt: string;
  fulfillmentStatus: string;
  totalPrice: {amount: string; currencyCode: string};
  lineItems: {nodes: OrderLineItem[]};
}

export interface BuyAgainProduct {
  id: string;
  productTitle: string;
  productHandle: string | null;
  variantTitle: string | null;
  variantId: string | null;
  price: {amount: string; currencyCode: string} | null;
  image: {
    url: string;
    altText?: string | null;
    width?: number;
    height?: number;
  } | null;
  lastPurchasedDate: string;
  purchaseCount: number;
}

// ============================================================================
// Extraction Logic
// ============================================================================

/**
 * Extracts individual products from fulfilled orders for the Buy Again tab.
 * De-duplicates by product handle (or title if no handle), keeping the most
 * recent purchase date and accumulating purchase counts.
 * Returns products sorted by most recently purchased (descending).
 */
export function extractBuyAgainProducts(orders: Order[]): BuyAgainProduct[] {
  const fulfilledOrders = orders.filter(
    (o) => o.fulfillmentStatus === 'FULFILLED',
  );

  if (fulfilledOrders.length === 0) return [];

  // Map: dedup key → BuyAgainProduct (accumulates across orders)
  const productMap = new Map<string, BuyAgainProduct>();

  for (const order of fulfilledOrders) {
    for (const item of order.lineItems.nodes) {
      const handle = item.variant?.product?.handle ?? null;
      const variantId = item.variant?.id ?? null;

      // Dedup key: prefer handle, fall back to title
      const key = handle ?? item.title;

      const existing = productMap.get(key);

      if (existing) {
        // Accumulate count
        existing.purchaseCount += item.quantity;

        // Keep most recent purchase date
        if (order.processedAt > existing.lastPurchasedDate) {
          existing.lastPurchasedDate = order.processedAt;
          // Update image/price/variant to most recent order's data
          if (item.variant?.image) {
            existing.image = item.variant.image;
          }
          if (item.variant?.price) {
            existing.price = item.variant.price;
          }
          if (variantId) {
            existing.variantId = variantId;
          }
        }
      } else {
        const variantTitle = item.variant?.title ?? null;
        const displayVariant =
          variantTitle && variantTitle !== 'Default Title'
            ? variantTitle
            : null;

        productMap.set(key, {
          id: `buyagain-${key}-${variantId ?? 'no-variant'}`,
          productTitle: item.title,
          productHandle: handle,
          variantTitle: displayVariant,
          variantId,
          price: item.variant?.price ?? null,
          image: item.variant?.image ?? null,
          lastPurchasedDate: order.processedAt,
          purchaseCount: item.quantity,
        });
      }
    }
  }

  // Sort by most recently purchased (descending)
  return Array.from(productMap.values()).sort((a, b) =>
    b.lastPurchasedDate.localeCompare(a.lastPurchasedDate),
  );
}
