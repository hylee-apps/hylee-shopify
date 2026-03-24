// ============================================================================
// Account Dashboard & Sidebar Helpers
// Pure functions extracted for testability.
// ============================================================================

/**
 * Derive avatar initials from first and last name.
 */
export function getInitials(
  firstName: string | null,
  lastName: string | null,
): string {
  const f = firstName?.charAt(0)?.toUpperCase() ?? '';
  const l = lastName?.charAt(0)?.toUpperCase() ?? '';
  return f + l || '?';
}

/**
 * Determine whether a sidebar nav item is active based on the current pathname.
 * Dashboard (/account) must be an exact match to avoid highlighting on sub-routes.
 */
export function isNavActive(to: string, pathname: string): boolean {
  if (to === '/account') return pathname === '/account';
  return pathname.startsWith(to);
}

/**
 * Map a fulfillment status enum to a human-readable label.
 */
export function formatFulfillmentStatus(status: string): string {
  const labels: Record<string, string> = {
    UNFULFILLED: 'Processing',
    IN_PROGRESS: 'In Transit',
    PARTIALLY_FULFILLED: 'Partially Shipped',
    FULFILLED: 'Delivered',
    ON_HOLD: 'On Hold',
  };
  return labels[status] ?? status;
}

/**
 * Map a fulfillment status to Tailwind color classes for badges.
 */
export function statusColor(status: string): {bg: string; text: string} {
  switch (status) {
    case 'FULFILLED':
      return {bg: 'bg-primary/10', text: 'text-primary'};
    case 'IN_PROGRESS':
    case 'PARTIALLY_FULFILLED':
      return {bg: 'bg-secondary/10', text: 'text-secondary'};
    default:
      return {bg: 'bg-gray-100', text: 'text-gray-600'};
  }
}

/**
 * Raw order shape from the GraphQL query.
 */
interface RawOrder {
  id: string;
  name: string;
  processedAt: string;
  fulfillmentStatus: string;
  totalPrice: {amount: string; currencyCode: string};
}

/**
 * Simplified order summary for display.
 */
export interface OrderSummary {
  id: string;
  name: string;
  date: string;
  total: string;
  status: string;
  statusLabel: string;
}

/**
 * Transform a raw GraphQL order into an OrderSummary for display.
 */
export function mapOrder(order: RawOrder): OrderSummary {
  return {
    id: order.id,
    name: order.name,
    date: new Date(order.processedAt).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    }),
    total: new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: order.totalPrice.currencyCode,
    }).format(parseFloat(order.totalPrice.amount)),
    status: order.fulfillmentStatus,
    statusLabel: formatFulfillmentStatus(order.fulfillmentStatus),
  };
}
