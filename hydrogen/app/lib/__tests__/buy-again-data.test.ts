import {describe, it, expect} from 'vitest';
import {extractBuyAgainProducts} from '../buy-again-data';

// ============================================================================
// Test Helpers
// ============================================================================

function makeOrder(overrides: Record<string, any> = {}) {
  return {
    id: overrides.id ?? 'gid://shopify/Order/1',
    name: overrides.name ?? '#1001',
    processedAt: overrides.processedAt ?? '2026-02-25T00:00:00Z',
    fulfillmentStatus: overrides.fulfillmentStatus ?? 'FULFILLED',
    totalPrice: overrides.totalPrice ?? {amount: '49.99', currencyCode: 'USD'},
    lineItems: {
      nodes: overrides.lineItems ?? [
        {
          title: 'Test Product',
          quantity: 1,
          variant: {
            id: 'gid://shopify/ProductVariant/100',
            image: {
              url: 'https://cdn.shopify.com/test.jpg',
              altText: 'Test',
              width: 400,
              height: 400,
            },
            title: 'Black / Medium',
            price: {amount: '49.99', currencyCode: 'USD'},
            product: {handle: 'test-product'},
          },
        },
      ],
    },
  };
}

// ============================================================================
// Tests
// ============================================================================

describe('extractBuyAgainProducts', () => {
  it('returns empty array for no orders', () => {
    expect(extractBuyAgainProducts([])).toEqual([]);
  });

  it('returns empty array when no fulfilled orders', () => {
    const orders = [
      makeOrder({fulfillmentStatus: 'UNFULFILLED'}),
      makeOrder({fulfillmentStatus: 'IN_PROGRESS'}),
    ];
    expect(extractBuyAgainProducts(orders)).toEqual([]);
  });

  it('extracts products from fulfilled orders only', () => {
    const orders = [
      makeOrder({fulfillmentStatus: 'FULFILLED', id: 'gid://shopify/Order/1'}),
      makeOrder({
        fulfillmentStatus: 'UNFULFILLED',
        id: 'gid://shopify/Order/2',
        lineItems: [
          {
            title: 'Unfulfilled Product',
            quantity: 1,
            variant: {
              id: 'gid://shopify/ProductVariant/200',
              price: {amount: '19.99', currencyCode: 'USD'},
              product: {handle: 'unfulfilled-product'},
            },
          },
        ],
      }),
    ];

    const result = extractBuyAgainProducts(orders);
    expect(result).toHaveLength(1);
    expect(result[0].productTitle).toBe('Test Product');
  });

  it('de-duplicates by product handle, keeps most recent', () => {
    const orders = [
      makeOrder({
        id: 'gid://shopify/Order/1',
        processedAt: '2026-01-01T00:00:00Z',
      }),
      makeOrder({
        id: 'gid://shopify/Order/2',
        processedAt: '2026-03-15T00:00:00Z',
      }),
    ];

    const result = extractBuyAgainProducts(orders);
    expect(result).toHaveLength(1);
    expect(result[0].lastPurchasedDate).toBe('2026-03-15T00:00:00Z');
  });

  it('accumulates purchase count across orders', () => {
    const orders = [
      makeOrder({
        id: 'gid://shopify/Order/1',
        processedAt: '2026-01-01T00:00:00Z',
        lineItems: [
          {
            title: 'Test Product',
            quantity: 2,
            variant: {
              id: 'gid://shopify/ProductVariant/100',
              price: {amount: '49.99', currencyCode: 'USD'},
              product: {handle: 'test-product'},
            },
          },
        ],
      }),
      makeOrder({
        id: 'gid://shopify/Order/2',
        processedAt: '2026-03-15T00:00:00Z',
        lineItems: [
          {
            title: 'Test Product',
            quantity: 3,
            variant: {
              id: 'gid://shopify/ProductVariant/100',
              price: {amount: '49.99', currencyCode: 'USD'},
              product: {handle: 'test-product'},
            },
          },
        ],
      }),
    ];

    const result = extractBuyAgainProducts(orders);
    expect(result).toHaveLength(1);
    expect(result[0].purchaseCount).toBe(5);
  });

  it('sorts by most recent purchase date descending', () => {
    const orders = [
      makeOrder({
        id: 'gid://shopify/Order/1',
        processedAt: '2026-01-01T00:00:00Z',
        lineItems: [
          {
            title: 'Old Product',
            quantity: 1,
            variant: {
              id: 'gid://shopify/ProductVariant/100',
              price: {amount: '10.00', currencyCode: 'USD'},
              product: {handle: 'old-product'},
            },
          },
        ],
      }),
      makeOrder({
        id: 'gid://shopify/Order/2',
        processedAt: '2026-03-15T00:00:00Z',
        lineItems: [
          {
            title: 'New Product',
            quantity: 1,
            variant: {
              id: 'gid://shopify/ProductVariant/200',
              price: {amount: '20.00', currencyCode: 'USD'},
              product: {handle: 'new-product'},
            },
          },
        ],
      }),
    ];

    const result = extractBuyAgainProducts(orders);
    expect(result).toHaveLength(2);
    expect(result[0].productTitle).toBe('New Product');
    expect(result[1].productTitle).toBe('Old Product');
  });

  it('handles missing variant gracefully', () => {
    const orders = [
      makeOrder({
        lineItems: [
          {
            title: 'No Variant Product',
            quantity: 1,
            variant: null,
          },
        ],
      }),
    ];

    const result = extractBuyAgainProducts(orders);
    expect(result).toHaveLength(1);
    expect(result[0].productHandle).toBeNull();
    expect(result[0].variantId).toBeNull();
    expect(result[0].variantTitle).toBeNull();
    expect(result[0].price).toBeNull();
    expect(result[0].image).toBeNull();
  });

  it('handles missing image gracefully', () => {
    const orders = [
      makeOrder({
        lineItems: [
          {
            title: 'No Image Product',
            quantity: 1,
            variant: {
              id: 'gid://shopify/ProductVariant/300',
              image: null,
              title: 'Default Title',
              price: {amount: '15.00', currencyCode: 'USD'},
              product: {handle: 'no-image'},
            },
          },
        ],
      }),
    ];

    const result = extractBuyAgainProducts(orders);
    expect(result).toHaveLength(1);
    expect(result[0].image).toBeNull();
  });

  it('excludes "Default Title" from variantTitle', () => {
    const orders = [
      makeOrder({
        lineItems: [
          {
            title: 'Simple Product',
            quantity: 1,
            variant: {
              id: 'gid://shopify/ProductVariant/400',
              title: 'Default Title',
              price: {amount: '9.99', currencyCode: 'USD'},
              product: {handle: 'simple-product'},
            },
          },
        ],
      }),
    ];

    const result = extractBuyAgainProducts(orders);
    expect(result).toHaveLength(1);
    expect(result[0].variantTitle).toBeNull();
  });

  it('handles missing handle — de-duplicates by title instead', () => {
    const orders = [
      makeOrder({
        id: 'gid://shopify/Order/1',
        processedAt: '2026-01-01T00:00:00Z',
        lineItems: [
          {
            title: 'Custom Item',
            quantity: 1,
            variant: {
              id: 'gid://shopify/ProductVariant/500',
              price: {amount: '5.00', currencyCode: 'USD'},
              product: {},
            },
          },
        ],
      }),
      makeOrder({
        id: 'gid://shopify/Order/2',
        processedAt: '2026-02-01T00:00:00Z',
        lineItems: [
          {
            title: 'Custom Item',
            quantity: 2,
            variant: {
              id: 'gid://shopify/ProductVariant/500',
              price: {amount: '5.00', currencyCode: 'USD'},
              product: {},
            },
          },
        ],
      }),
    ];

    const result = extractBuyAgainProducts(orders);
    expect(result).toHaveLength(1);
    expect(result[0].productHandle).toBeNull();
    expect(result[0].purchaseCount).toBe(3);
    expect(result[0].lastPurchasedDate).toBe('2026-02-01T00:00:00Z');
  });

  it('extracts multiple distinct products from a single order', () => {
    const orders = [
      makeOrder({
        lineItems: [
          {
            title: 'Product A',
            quantity: 1,
            variant: {
              id: 'gid://shopify/ProductVariant/100',
              price: {amount: '10.00', currencyCode: 'USD'},
              product: {handle: 'product-a'},
            },
          },
          {
            title: 'Product B',
            quantity: 1,
            variant: {
              id: 'gid://shopify/ProductVariant/200',
              price: {amount: '20.00', currencyCode: 'USD'},
              product: {handle: 'product-b'},
            },
          },
        ],
      }),
    ];

    const result = extractBuyAgainProducts(orders);
    expect(result).toHaveLength(2);
  });

  it('updates image/price/variantId to most recent order data', () => {
    const orders = [
      makeOrder({
        id: 'gid://shopify/Order/1',
        processedAt: '2026-01-01T00:00:00Z',
        lineItems: [
          {
            title: 'Test Product',
            quantity: 1,
            variant: {
              id: 'gid://shopify/ProductVariant/100',
              image: {url: 'https://cdn.shopify.com/old.jpg', altText: 'Old'},
              price: {amount: '29.99', currencyCode: 'USD'},
              product: {handle: 'test-product'},
            },
          },
        ],
      }),
      makeOrder({
        id: 'gid://shopify/Order/2',
        processedAt: '2026-03-01T00:00:00Z',
        lineItems: [
          {
            title: 'Test Product',
            quantity: 1,
            variant: {
              id: 'gid://shopify/ProductVariant/101',
              image: {url: 'https://cdn.shopify.com/new.jpg', altText: 'New'},
              price: {amount: '34.99', currencyCode: 'USD'},
              product: {handle: 'test-product'},
            },
          },
        ],
      }),
    ];

    const result = extractBuyAgainProducts(orders);
    expect(result).toHaveLength(1);
    expect(result[0].image?.url).toBe('https://cdn.shopify.com/new.jpg');
    expect(result[0].price?.amount).toBe('34.99');
    expect(result[0].variantId).toBe('gid://shopify/ProductVariant/101');
  });
});
