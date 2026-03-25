/**
 * Test route: renders OutgoingCard + ReturnProgressTracker with mock data.
 * Used by Playwright e2e tests — NOT linked in navigation.
 * Only available in development (no auth required).
 *
 * URL: /test/outgoing-cards
 */
import {
  OutgoingCard,
  type OutgoingItem,
} from '~/components/account/OutgoingCard';
import {OrderTabBar, type OrderTab} from '~/components/account/OrderTabBar';
import {OrderPagination} from '~/components/account/OrderPagination';
import {useState} from 'react';
import {Undo2} from 'lucide-react';
import {Button} from '~/components/ui/button';
import {Link} from 'react-router';

// ============================================================================
// Mock Data
// ============================================================================

const MOCK_OUTGOING_ITEMS: OutgoingItem[] = [
  {
    id: 'outgoing-return-shipped',
    type: 'return',
    status: 'return-shipped',
    initiatedDate: '2026-03-20T00:00:00Z',
    refundAmount: {amount: '79.99', currencyCode: 'USD'},
    originalOrderName: '#1042',
    originalOrderId: 'gid://shopify/Order/123456',
    statusTitle: 'Return shipped on March 21',
    statusMessage:
      'Your return is on its way to our warehouse. Refund will be processed within 3-5 business days after receipt.',
    product: {
      title: 'Classic Cotton T-Shirt',
      handle: 'classic-cotton-t-shirt',
      variant: 'Medium / Navy Blue',
      returnInfo: 'Reason: Not as described | Condition: Used - Like New',
      image: {
        url: 'https://cdn.shopify.com/s/files/1/0551/4566/0472/files/Placeholder.png',
        altText: 'Classic Cotton T-Shirt',
        width: 120,
        height: 120,
      },
    },
  },
  {
    id: 'outgoing-awaiting-pickup',
    type: 'return',
    status: 'awaiting-pickup',
    initiatedDate: '2026-03-18T00:00:00Z',
    refundAmount: {amount: '149.50', currencyCode: 'USD'},
    originalOrderName: '#1038',
    originalOrderId: 'gid://shopify/Order/234567',
    statusTitle: 'Scheduled for pickup on March 21',
    statusMessage:
      'Your package is ready for pickup. A carrier will pick it up from your address on the scheduled date.',
    product: {
      title: 'Wireless Bluetooth Headphones',
      handle: 'wireless-bluetooth-headphones',
      variant: 'Black',
      returnInfo: 'Reason: Changed mind | Condition: New in box',
      image: {
        url: 'https://cdn.shopify.com/s/files/1/0551/4566/0472/files/Placeholder.png',
        altText: 'Wireless Bluetooth Headphones',
        width: 120,
        height: 120,
      },
    },
  },
  {
    id: 'outgoing-exchange',
    type: 'exchange',
    status: 'exchange-out-for-delivery',
    initiatedDate: '2026-03-15T00:00:00Z',
    exchangeFor: 'Large Size',
    originalOrderName: '#1035',
    originalOrderId: 'gid://shopify/Order/345678',
    statusTitle: 'Your replacement item is out for delivery',
    statusMessage:
      'Expected delivery by 8 PM today. Your original item will be picked up when the replacement is delivered.',
    product: {
      title: 'Premium Running Shoes',
      handle: 'premium-running-shoes',
      variant: 'Exchanging: Medium → Large | Color: Navy Blue',
      returnInfo: 'Exchange reason: Size too small',
      image: {
        url: 'https://cdn.shopify.com/s/files/1/0551/4566/0472/files/Placeholder.png',
        altText: 'Premium Running Shoes',
        width: 120,
        height: 120,
      },
    },
  },
];

// ============================================================================
// Component
// ============================================================================

export default function TestOutgoingCards() {
  const [activeTab, setActiveTab] = useState<OrderTab>('on-the-way-out');
  const [showEmpty, setShowEmpty] = useState(false);

  const items = showEmpty ? [] : MOCK_OUTGOING_ITEMS;
  const isOutgoingTab = activeTab === 'on-the-way-out';

  return (
    <div
      className="mx-auto max-w-[1200px] p-[24px]"
      data-testid="test-outgoing-page"
    >
      {/* Test controls */}
      <div
        className="mb-[24px] flex gap-[16px] rounded border border-dashed border-[#d1d5db] bg-[#f9fafb] p-[12px]"
        data-testid="test-controls"
      >
        <button
          type="button"
          onClick={() => setShowEmpty(!showEmpty)}
          className="rounded bg-[#374151] px-[12px] py-[6px] text-sm text-white"
          data-testid="toggle-empty"
        >
          {showEmpty ? 'Show Cards' : 'Show Empty State'}
        </button>
      </div>

      {/* Page Header (mirrors account.orders._index) */}
      <div className="flex flex-col gap-[15px]">
        <div className="flex flex-col gap-[8px]">
          <h1 className="text-2xl font-bold leading-[51.2px] text-[#1f2937] sm:text-[32px]">
            My Orders
          </h1>
          <p className="text-[16px] leading-[25.6px] text-[#6b7280]">
            View and manage your order history
          </p>
        </div>

        {/* Tab Bar */}
        <OrderTabBar activeTab={activeTab} onTabChange={setActiveTab} />

        {/* Tab Content */}
        {isOutgoingTab ? (
          items.length > 0 ? (
            <div
              className="flex max-w-[1400px] flex-col gap-[24px] p-[24px]"
              data-testid="outgoing-content"
            >
              {/* Sub-section Header */}
              <div className="flex flex-col gap-[8px]" data-testid="sub-header">
                <h2 className="text-xl font-bold leading-[36px] text-[#111827] sm:text-[24px]">
                  On the Way Out
                </h2>
                <p className="text-[15px] leading-[22.5px] text-[#4b5563]">
                  Track your returns and items being shipped back
                </p>
              </div>

              {/* Outgoing Cards */}
              <div
                className="flex flex-col gap-[24px]"
                data-testid="outgoing-cards"
              >
                {items.map((item) => (
                  <OutgoingCard key={item.id} item={item} />
                ))}
              </div>

              {/* Pagination */}
              <OrderPagination currentPage={1} totalPages={1} />
            </div>
          ) : (
            <div
              className="flex flex-col items-center py-16 text-center"
              data-testid="empty-outgoing"
            >
              <Undo2 size={64} className="mb-4 text-[#9ca3af]" />
              <h2 className="mb-2 text-xl font-semibold text-[#1f2937]">
                No returns or exchanges
              </h2>
              <p className="mb-6 text-[#6b7280]">
                You don&apos;t have any active returns or exchanges at this
                time.
              </p>
              <Button asChild>
                <Link to="/collections">Continue Shopping</Link>
              </Button>
            </div>
          )
        ) : (
          <div
            className="py-16 text-center text-[#6b7280]"
            data-testid="other-tab-content"
          >
            Orders/Buy Again content (not rendered in this test route)
          </div>
        )}
      </div>
    </div>
  );
}
