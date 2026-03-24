import {describe, it, expect} from 'vitest';
import {
  getInitials,
  isNavActive,
  formatFulfillmentStatus,
  statusColor,
  mapOrder,
} from '../account-helpers';

// ============================================================================
// getInitials
// ============================================================================

describe('getInitials', () => {
  it('returns first letter of each name uppercased', () => {
    expect(getInitials('john', 'doe')).toBe('JD');
  });

  it('handles already-uppercase names', () => {
    expect(getInitials('Alice', 'Brown')).toBe('AB');
  });

  it('returns first initial only when lastName is null', () => {
    expect(getInitials('john', null)).toBe('J');
  });

  it('returns last initial only when firstName is null', () => {
    expect(getInitials(null, 'doe')).toBe('D');
  });

  it('returns "?" when both names are null', () => {
    expect(getInitials(null, null)).toBe('?');
  });

  it('returns "?" for empty strings', () => {
    expect(getInitials('', '')).toBe('?');
  });

  it('handles single-character names', () => {
    expect(getInitials('A', 'B')).toBe('AB');
  });
});

// ============================================================================
// isNavActive
// ============================================================================

describe('isNavActive', () => {
  it('matches /account exactly for the dashboard link', () => {
    expect(isNavActive('/account', '/account')).toBe(true);
  });

  it('does not match /account when on a sub-route', () => {
    expect(isNavActive('/account', '/account/orders')).toBe(false);
  });

  it('matches sub-routes with prefix matching', () => {
    expect(isNavActive('/account/orders', '/account/orders')).toBe(true);
    expect(isNavActive('/account/orders', '/account/orders/123')).toBe(true);
  });

  it('does not match unrelated routes', () => {
    expect(isNavActive('/account/orders', '/account/settings')).toBe(false);
  });

  it('handles trailing segments correctly', () => {
    // /account/orders does not match /account/addresses
    expect(isNavActive('/account/orders', '/account/addresses')).toBe(false);
  });
});

// ============================================================================
// formatFulfillmentStatus
// ============================================================================

describe('formatFulfillmentStatus', () => {
  it('maps UNFULFILLED to Processing', () => {
    expect(formatFulfillmentStatus('UNFULFILLED')).toBe('Processing');
  });

  it('maps IN_PROGRESS to In Transit', () => {
    expect(formatFulfillmentStatus('IN_PROGRESS')).toBe('In Transit');
  });

  it('maps PARTIALLY_FULFILLED to Partially Shipped', () => {
    expect(formatFulfillmentStatus('PARTIALLY_FULFILLED')).toBe(
      'Partially Shipped',
    );
  });

  it('maps FULFILLED to Delivered', () => {
    expect(formatFulfillmentStatus('FULFILLED')).toBe('Delivered');
  });

  it('maps ON_HOLD to On Hold', () => {
    expect(formatFulfillmentStatus('ON_HOLD')).toBe('On Hold');
  });

  it('returns the raw status for unknown values', () => {
    expect(formatFulfillmentStatus('SOME_NEW_STATUS')).toBe('SOME_NEW_STATUS');
  });
});

// ============================================================================
// statusColor
// ============================================================================

describe('statusColor', () => {
  it('returns primary colors for FULFILLED', () => {
    const result = statusColor('FULFILLED');
    expect(result.bg).toContain('primary');
    expect(result.text).toContain('primary');
  });

  it('returns secondary colors for IN_PROGRESS', () => {
    const result = statusColor('IN_PROGRESS');
    expect(result.bg).toContain('secondary');
    expect(result.text).toContain('secondary');
  });

  it('returns secondary colors for PARTIALLY_FULFILLED', () => {
    const result = statusColor('PARTIALLY_FULFILLED');
    expect(result.bg).toContain('secondary');
  });

  it('returns gray colors for UNFULFILLED', () => {
    const result = statusColor('UNFULFILLED');
    expect(result.bg).toBe('bg-gray-100');
    expect(result.text).toBe('text-gray-600');
  });

  it('returns gray colors for unknown statuses', () => {
    const result = statusColor('UNKNOWN');
    expect(result.bg).toBe('bg-gray-100');
  });
});

// ============================================================================
// mapOrder
// ============================================================================

describe('mapOrder', () => {
  const rawOrder = {
    id: 'gid://shopify/Order/123',
    name: '#1001',
    processedAt: '2026-03-15T10:00:00Z',
    fulfillmentStatus: 'UNFULFILLED',
    totalPrice: {amount: '49.99', currencyCode: 'USD'},
  };

  it('preserves id and name', () => {
    const result = mapOrder(rawOrder);
    expect(result.id).toBe('gid://shopify/Order/123');
    expect(result.name).toBe('#1001');
  });

  it('formats date as short month, day, year', () => {
    const result = mapOrder(rawOrder);
    expect(result.date).toBe('Mar 15, 2026');
  });

  it('formats total as currency', () => {
    const result = mapOrder(rawOrder);
    expect(result.total).toBe('$49.99');
  });

  it('preserves raw status', () => {
    const result = mapOrder(rawOrder);
    expect(result.status).toBe('UNFULFILLED');
  });

  it('maps status to human-readable label', () => {
    const result = mapOrder(rawOrder);
    expect(result.statusLabel).toBe('Processing');
  });

  it('handles fulfilled orders', () => {
    const fulfilled = {...rawOrder, fulfillmentStatus: 'FULFILLED'};
    const result = mapOrder(fulfilled);
    expect(result.statusLabel).toBe('Delivered');
  });

  it('handles different currencies', () => {
    const eurOrder = {
      ...rawOrder,
      totalPrice: {amount: '100.00', currencyCode: 'EUR'},
    };
    const result = mapOrder(eurOrder);
    // EUR formatting varies by locale, just check it contains the amount
    expect(result.total).toContain('100.00');
  });
});
