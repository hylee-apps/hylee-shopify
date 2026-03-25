/**
 * Test route: renders BuyAgainCard in a 3-column grid with mock data.
 * Used by Playwright e2e tests — NOT linked in navigation.
 * Only available in development (no auth required).
 *
 * URL: /test/buy-again-cards
 */
import {BuyAgainCard} from '~/components/account/BuyAgainCard';
import type {BuyAgainProduct} from '~/lib/buy-again-data';
import {OrderTabBar, type OrderTab} from '~/components/account/OrderTabBar';
import {OrderStatsCards} from '~/components/account/OrderStatsCards';
import {OrderPagination} from '~/components/account/OrderPagination';
import {useState} from 'react';
import {RotateCcw} from 'lucide-react';
import {Button} from '~/components/ui/button';
import {Link} from 'react-router';

// ============================================================================
// Mock Data
// ============================================================================

const MOCK_BUY_AGAIN_PRODUCTS: BuyAgainProduct[] = [
  {
    id: 'buyagain-order-1-v100',
    productTitle: 'Order 1',
    productHandle: 'order-1-product',
    variantTitle: null,
    variantId: 'gid://shopify/ProductVariant/100',
    price: {amount: '21.99', currencyCode: 'USD'},
    image: null,
    lastPurchasedDate: '2026-02-25T00:00:00Z',
    purchaseCount: 1,
  },
  {
    id: 'buyagain-arctic-fan-v200',
    productTitle:
      'ARCTIC Case Fan Hub - 10-fold PWM Fan Distributor with SATA Power - Black',
    productHandle: 'arctic-case-fan-hub',
    variantTitle: 'Black',
    variantId: 'gid://shopify/ProductVariant/200',
    price: {amount: '24.99', currencyCode: 'USD'},
    image: null,
    lastPurchasedDate: '2026-02-23T00:00:00Z',
    purchaseCount: 2,
  },
  {
    id: 'buyagain-leuchtturm-v300',
    productTitle:
      'LEUCHTTURM1917 The Official Bullet Journal Edition 2 - Notebook Built for BuJo, Medium A5 204 Pages (Turquoise25)',
    productHandle: 'leuchtturm1917-bullet-journal',
    variantTitle: 'Turquoise25',
    variantId: 'gid://shopify/ProductVariant/300',
    price: {amount: '32.95', currencyCode: 'USD'},
    image: null,
    lastPurchasedDate: '2026-02-23T00:00:00Z',
    purchaseCount: 1,
  },
  {
    id: 'buyagain-order-4-v400',
    productTitle: 'Order 4',
    productHandle: 'order-4-product',
    variantTitle: null,
    variantId: 'gid://shopify/ProductVariant/400',
    price: {amount: '299.00', currencyCode: 'USD'},
    image: null,
    lastPurchasedDate: '2026-01-15T00:00:00Z',
    purchaseCount: 1,
  },
  {
    id: 'buyagain-usb-cable-v500',
    productTitle: 'USB-C Charging Cable 2m - Fast Charge Braided Nylon Cable',
    productHandle: 'usb-c-charging-cable',
    variantTitle: '2m / Black',
    variantId: 'gid://shopify/ProductVariant/500',
    price: {amount: '12.99', currencyCode: 'USD'},
    image: null,
    lastPurchasedDate: '2025-12-20T00:00:00Z',
    purchaseCount: 3,
  },
  {
    id: 'buyagain-planner-v600',
    productTitle:
      'LEUCHTTURM1917 - Weekly Planner & Notebook 2026, Hardcover, Composition (B5), Ruled, Spring Leaf',
    productHandle: 'leuchtturm1917-weekly-planner',
    variantTitle: 'Spring Leaf',
    variantId: 'gid://shopify/ProductVariant/600',
    price: {amount: '19.95', currencyCode: 'USD'},
    image: null,
    lastPurchasedDate: '2026-02-23T00:00:00Z',
    purchaseCount: 1,
  },
  {
    id: 'buyagain-no-handle-v700',
    productTitle: 'Custom Engraved Pen (No Handle)',
    productHandle: null,
    variantTitle: null,
    variantId: null,
    price: {amount: '15.00', currencyCode: 'USD'},
    image: null,
    lastPurchasedDate: '2026-01-10T00:00:00Z',
    purchaseCount: 1,
  },
  {
    id: 'buyagain-with-image-v800',
    productTitle: 'Wireless Bluetooth Headphones',
    productHandle: 'wireless-bluetooth-headphones',
    variantTitle: 'Black',
    variantId: 'gid://shopify/ProductVariant/800',
    price: {amount: '79.99', currencyCode: 'USD'},
    image: {
      url: 'https://cdn.shopify.com/s/files/1/0551/4566/0472/files/Placeholder.png',
      altText: 'Wireless Bluetooth Headphones',
      width: 400,
      height: 400,
    },
    lastPurchasedDate: '2026-03-10T00:00:00Z',
    purchaseCount: 2,
  },
];

// ============================================================================
// Component
// ============================================================================

export default function TestBuyAgainCards() {
  const [activeTab, setActiveTab] = useState<OrderTab>('buy-again');
  const [showEmpty, setShowEmpty] = useState(false);

  const products = showEmpty ? [] : MOCK_BUY_AGAIN_PRODUCTS;

  return (
    <div className="min-h-screen bg-[#f8fafc] p-[24px]">
      <div className="mx-auto max-w-[1280px]">
        <div className="flex flex-col gap-[15px]">
          {/* Test Controls */}
          <div className="flex gap-[8px] rounded-[8px] border border-dashed border-[#d1d5db] bg-white p-[12px]">
            <button
              type="button"
              onClick={() => setShowEmpty(!showEmpty)}
              className="rounded-[6px] border border-[#d1d5db] bg-white px-[12px] py-[6px] text-[13px] text-[#374151] hover:bg-[#f3f4f6]"
            >
              {showEmpty ? 'Show Products' : 'Show Empty State'}
            </button>
          </div>

          {/* Page Header */}
          <div className="flex flex-col gap-[8px]">
            <h1 className="text-2xl font-bold leading-[51.2px] text-[#1f2937] sm:text-[32px]">
              My Orders
            </h1>
            <p className="text-[16px] leading-[25.6px] text-[#6b7280]">
              View and manage your order history
            </p>
          </div>

          {/* Stats Cards */}
          <OrderStatsCards
            totalOrders={12}
            inTransitOrders={2}
            deliveredOrders={9}
          />

          {/* Tab Bar */}
          <OrderTabBar activeTab={activeTab} onTabChange={setActiveTab} />

          {/* Tab Content */}
          {activeTab === 'buy-again' ? (
            products.length > 0 ? (
              <div className="flex max-w-[1400px] flex-col gap-[24px] p-[24px]">
                {/* Sub-section Header */}
                <div className="flex flex-col gap-[8px]">
                  <h2 className="text-xl font-bold leading-[36px] text-[#111827] sm:text-[24px]">
                    Buy Again
                  </h2>
                  <p className="text-[15px] leading-[22.5px] text-[#4b5563]">
                    Quickly reorder items you&apos;ve purchased before
                  </p>
                </div>

                {/* Product Grid */}
                <div className="grid grid-cols-1 gap-[24px] sm:grid-cols-2 lg:grid-cols-3">
                  {products.map((product) => (
                    <BuyAgainCard key={product.id} product={product} />
                  ))}
                </div>

                {/* Pagination (mock: 2 pages) */}
                <OrderPagination currentPage={1} totalPages={2} />
              </div>
            ) : (
              <div className="flex flex-col items-center py-16 text-center">
                <RotateCcw size={64} className="mb-4 text-[#9ca3af]" />
                <h2 className="mb-2 text-xl font-semibold text-[#1f2937]">
                  No items to buy again
                </h2>
                <p className="mb-6 text-[#6b7280]">
                  Once you receive your first order, products will appear here
                  for easy re-ordering.
                </p>
                <Button asChild>
                  <Link to="/collections">Start Shopping</Link>
                </Button>
              </div>
            )
          ) : (
            <div className="flex flex-col items-center py-16 text-center text-[#6b7280]">
              <p>
                Switch to the &quot;Buy Again&quot; tab to see the test content.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
