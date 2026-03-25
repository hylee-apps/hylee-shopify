import type {
  OutgoingItem,
  OutgoingStatus,
} from '~/components/account/OutgoingCard';

// ============================================================================
// Types
// ============================================================================

interface OrderLineItem {
  title: string;
  quantity: number;
  variant?: {
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

// ============================================================================
// Simulation Configuration
// ============================================================================

const RETURN_REASONS = [
  'Not as described',
  'Changed mind',
  'Defective item',
  'Wrong item received',
  'Better price found',
];

const RETURN_CONDITIONS = [
  'Used - Like New',
  'New in box',
  'Used - Good',
  'New - Unopened',
];

const EXCHANGE_REASONS = [
  'Size too small',
  'Size too large',
  'Wrong color received',
  'Prefer different style',
];

// ============================================================================
// Simulation Logic
// ============================================================================

/**
 * Simulates outgoing (return/exchange) items from fulfilled orders.
 * Since Shopify Storefront API doesn't expose returns, we derive
 * realistic return/exchange data from actual fulfilled order data.
 */
export function simulateOutgoingItems(orders: Order[]): OutgoingItem[] {
  const fulfilledOrders = orders.filter(
    (o) => o.fulfillmentStatus === 'FULFILLED',
  );

  if (fulfilledOrders.length === 0) return [];

  const items: OutgoingItem[] = [];
  const statusCycle: OutgoingStatus[] = [
    'return-shipped',
    'awaiting-pickup',
    'exchange-out-for-delivery',
  ];

  // Generate up to 3 outgoing items from fulfilled orders (one per status)
  const ordersToUse = fulfilledOrders.slice(0, 3);

  ordersToUse.forEach((order, idx) => {
    const status = statusCycle[idx % statusCycle.length];
    const lineItem = order.lineItems.nodes[0];
    if (!lineItem) return;

    const orderDate = new Date(order.processedAt);
    const initiatedDate = new Date(orderDate);
    initiatedDate.setDate(initiatedDate.getDate() + 2); // Return initiated 2 days after order

    const isExchange = status === 'exchange-out-for-delivery';
    const reasonIdx = idx % RETURN_REASONS.length;
    const conditionIdx = idx % RETURN_CONDITIONS.length;

    const variantTitle = lineItem.variant?.title;
    const hasVariant = variantTitle && variantTitle !== 'Default Title';

    items.push({
      id: `outgoing-${order.id}`,
      type: isExchange ? 'exchange' : 'return',
      status,
      initiatedDate: initiatedDate.toISOString(),
      refundAmount: isExchange
        ? undefined
        : {
            amount: (parseFloat(order.totalPrice.amount) * 0.8).toFixed(2),
            currencyCode: order.totalPrice.currencyCode,
          },
      exchangeFor: isExchange ? 'Large Size' : undefined,
      originalOrderName: order.name,
      originalOrderId: order.id,
      statusTitle: getStatusTitle(status, initiatedDate),
      statusMessage: getStatusMessage(status),
      product: {
        title: lineItem.title,
        handle: lineItem.variant?.product?.handle,
        variant: hasVariant
          ? isExchange
            ? `Exchanging: ${variantTitle} → Large | Color: Navy Blue`
            : `${variantTitle}`
          : undefined,
        returnInfo: isExchange
          ? `Exchange reason: ${EXCHANGE_REASONS[idx % EXCHANGE_REASONS.length]}`
          : `Reason: ${RETURN_REASONS[reasonIdx]} | Condition: ${RETURN_CONDITIONS[conditionIdx]}`,
        image: lineItem.variant?.image ?? undefined,
      },
    });
  });

  return items;
}

// ============================================================================
// Helpers
// ============================================================================

function getStatusTitle(status: OutgoingStatus, initiatedDate: Date): string {
  const shippedDate = new Date(initiatedDate);
  shippedDate.setDate(shippedDate.getDate() + 1);
  const formattedDate = shippedDate.toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
  });

  switch (status) {
    case 'return-shipped':
      return `Return shipped on ${formattedDate}`;
    case 'awaiting-pickup': {
      const pickupDate = new Date(initiatedDate);
      pickupDate.setDate(pickupDate.getDate() + 3);
      const pickupFormatted = pickupDate.toLocaleDateString('en-US', {
        month: 'long',
        day: 'numeric',
      });
      return `Scheduled for pickup on ${pickupFormatted}`;
    }
    case 'exchange-out-for-delivery':
      return 'Your replacement item is out for delivery';
  }
}

function getStatusMessage(status: OutgoingStatus): string {
  switch (status) {
    case 'return-shipped':
      return 'Your return is on its way to our warehouse. Refund will be processed within 3-5 business days after receipt.';
    case 'awaiting-pickup':
      return 'Your package is ready for pickup. A carrier will pick it up from your address on the scheduled date.';
    case 'exchange-out-for-delivery':
      return 'Expected delivery by 8 PM today. Your original item will be picked up when the replacement is delivered.';
  }
}
