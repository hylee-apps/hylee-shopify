import {useMemo, useState, useEffect} from 'react';
import type {Route} from './+types/account.orders._index';
import {Link, useSearchParams} from 'react-router';
import {getSeoMeta} from '@shopify/hydrogen';
import {useTranslation} from 'react-i18next';
import {Button} from '~/components/ui/button';
import {Package, Undo2, RotateCcw, ChevronDown} from 'lucide-react';
import {OrderStatsCards} from '~/components/account/OrderStatsCards';
import {OrderTabBar, type OrderTab} from '~/components/account/OrderTabBar';
import {OrderCard} from '~/components/account/OrderCard';
import {OutgoingCard} from '~/components/account/OutgoingCard';
import {BuyAgainCard} from '~/components/account/BuyAgainCard';
import {OrderPagination} from '~/components/account/OrderPagination';
import {simulateOutgoingItems} from '~/lib/outgoing-data';
import {extractBuyAgainProducts} from '~/lib/buy-again-data';

// ============================================================================
// Route Meta
// ============================================================================

export function meta() {
  return getSeoMeta({
    title: 'My Orders',
    description: 'View and manage your order history.',
  });
}

// ============================================================================
// GraphQL Query (Customer Account API)
// ============================================================================

const CUSTOMER_ORDERS_QUERY = `#graphql
  query CustomerOrders($first: Int) {
    customer {
      orders(first: $first, sortKey: PROCESSED_AT, reverse: true) {
        nodes {
          id
          name
          processedAt
          fulfillmentStatus
          totalPrice {
            amount
            currencyCode
          }
          shippingAddress {
            firstName
            lastName
          }
          customAttributes {
            key
            value
          }
          lineItems(first: 10) {
            nodes {
              title
              quantity
              image {
                url
                altText
                width
                height
              }
              variantTitle
              price {
                amount
                currencyCode
              }
            }
          }
          fulfillments(first: 5) {
            nodes {
              trackingInformation {
                company
                number
                url
              }
            }
          }
        }
        pageInfo {
          hasNextPage
          endCursor
        }
      }
    }
  }
` as const;

// ============================================================================
// Constants
// ============================================================================

const ORDERS_PER_PAGE = 10;

type TimeFilter = 'past-3-months' | 'past-6-months' | 'past-year' | 'all-time';

const TIME_FILTER_OPTIONS: {value: TimeFilter; labelKey: string}[] = [
  {value: 'past-3-months', labelKey: 'orders.timeFilters.past3Months'},
  {value: 'past-6-months', labelKey: 'orders.timeFilters.past6Months'},
  {value: 'past-year', labelKey: 'orders.timeFilters.pastYear'},
  {value: 'all-time', labelKey: 'orders.timeFilters.allTime'},
];

function getFilterMonths(filter: TimeFilter): number | null {
  switch (filter) {
    case 'past-3-months':
      return 3;
    case 'past-6-months':
      return 6;
    case 'past-year':
      return 12;
    case 'all-time':
      return null;
  }
}

// ============================================================================
// Loader
// ============================================================================

export async function loader({context}: Route.LoaderArgs) {
  await context.customerAccount.handleAuthStatus();

  const {data} = await context.customerAccount.query(CUSTOMER_ORDERS_QUERY, {
    variables: {first: 250},
  });

  const allOrders = data.customer?.orders.nodes ?? [];

  return {orders: allOrders};
}

// ============================================================================
// Main Component
// ============================================================================

export default function OrdersPage({loaderData}: Route.ComponentProps) {
  const {t} = useTranslation();
  const {orders} = loaderData;
  const [searchParams, setSearchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState<OrderTab>('orders');

  // Scroll to and briefly highlight a specific order when arriving from the dashboard
  const highlightId = searchParams.get('highlight');
  useEffect(() => {
    if (!highlightId) return;
    const el = document.querySelector<HTMLElement>(
      `[data-order-id="${highlightId}"]`,
    );
    if (!el) return;
    el.scrollIntoView({behavior: 'smooth', block: 'center'});
    el.classList.add('ring-2', 'ring-secondary', 'ring-offset-2');
    const timer = setTimeout(() => {
      el.classList.remove('ring-2', 'ring-secondary', 'ring-offset-2');
    }, 2500);
    return () => clearTimeout(timer);
  }, [highlightId]);

  // Time filter
  const timeFilter =
    (searchParams.get('time') as TimeFilter) || 'past-3-months';

  // Filter orders by time
  const filterMonths = getFilterMonths(timeFilter);
  const timeFilteredOrders = filterMonths
    ? orders.filter((order: any) => {
        const orderDate = new Date(order.processedAt);
        const cutoff = new Date();
        cutoff.setMonth(cutoff.getMonth() - filterMonths);
        return orderDate >= cutoff;
      })
    : orders;

  // Stats (from time-filtered orders)
  const totalOrders = timeFilteredOrders.length;
  const inTransitOrders = timeFilteredOrders.filter(
    (o: any) =>
      o.fulfillmentStatus === 'UNFULFILLED' ||
      o.fulfillmentStatus === 'IN_PROGRESS' ||
      o.fulfillmentStatus === 'PARTIALLY_FULFILLED',
  ).length;
  const deliveredOrders = timeFilteredOrders.filter(
    (o: any) => o.fulfillmentStatus === 'FULFILLED',
  ).length;

  // Tab filtering (for Orders and Buy Again tabs)
  const tabFilteredOrders =
    activeTab === 'buy-again'
      ? timeFilteredOrders.filter(
          (o: any) => o.fulfillmentStatus === 'FULFILLED',
        )
      : activeTab === 'on-the-way-out'
        ? timeFilteredOrders.filter(
            (o: any) =>
              o.fulfillmentStatus === 'UNFULFILLED' ||
              o.fulfillmentStatus === 'IN_PROGRESS' ||
              o.fulfillmentStatus === 'PARTIALLY_FULFILLED',
          )
        : timeFilteredOrders;

  // Simulated outgoing items (for On the Way Out tab)
  const outgoingItems = useMemo(
    () => simulateOutgoingItems(timeFilteredOrders as any),
    [timeFilteredOrders],
  );

  // Buy Again products (extracted from fulfilled orders)
  const buyAgainProducts = useMemo(
    () => extractBuyAgainProducts(timeFilteredOrders as any),
    [timeFilteredOrders],
  );

  // Determine items for pagination based on active tab
  const isOutgoingTab = activeTab === 'on-the-way-out';
  const isBuyAgainTab = activeTab === 'buy-again';
  const paginationItemCount = isOutgoingTab
    ? outgoingItems.length
    : isBuyAgainTab
      ? buyAgainProducts.length
      : tabFilteredOrders.length;

  // Pagination
  const currentPage = Math.max(1, parseInt(searchParams.get('page') || '1'));
  const totalPages = Math.ceil(paginationItemCount / ORDERS_PER_PAGE);
  const safePage = Math.min(currentPage, Math.max(1, totalPages));
  const startIdx = (safePage - 1) * ORDERS_PER_PAGE;
  const pageOrders = tabFilteredOrders.slice(
    startIdx,
    startIdx + ORDERS_PER_PAGE,
  );
  const pageOutgoingItems = outgoingItems.slice(
    startIdx,
    startIdx + ORDERS_PER_PAGE,
  );
  const pageBuyAgainProducts = buyAgainProducts.slice(
    startIdx,
    startIdx + ORDERS_PER_PAGE,
  );

  function handleTabChange(tab: OrderTab) {
    setActiveTab(tab);
    // Reset page when switching tabs
    const newParams = new URLSearchParams(searchParams);
    newParams.delete('page');
    setSearchParams(newParams, {replace: true});
  }

  function handleTimeFilterChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const newParams = new URLSearchParams(searchParams);
    newParams.set('time', e.target.value);
    newParams.delete('page');
    setSearchParams(newParams, {replace: true});
  }

  return (
    <div className="flex flex-col gap-[15px]">
      {/* Page Header */}
      <div className="flex flex-col gap-[8px]">
        <h1 className="text-2xl font-bold leading-[51.2px] text-[#1f2937] sm:text-[32px]">
          {t('orders.title')}
        </h1>
        <p className="text-[16px] leading-[25.6px] text-[#6b7280]">
          {t('orders.subtitle')}
        </p>
      </div>

      {/* Stats Cards */}
      <OrderStatsCards
        totalOrders={totalOrders}
        inTransitOrders={inTransitOrders}
        deliveredOrders={deliveredOrders}
      />

      {/* Tab Bar */}
      <OrderTabBar activeTab={activeTab} onTabChange={handleTabChange} />

      {/* Tab Content */}
      {isOutgoingTab ? (
        // On the Way Out Tab
        outgoingItems.length > 0 ? (
          <div className="flex max-w-[1400px] flex-col gap-[24px] p-[24px]">
            {/* Sub-section Header */}
            <div className="flex flex-col gap-[8px]">
              <h2 className="text-xl font-bold leading-[36px] text-[#111827] sm:text-[24px]">
                {t('orders.onTheWayOut.title')}
              </h2>
              <p className="text-[15px] leading-[22.5px] text-[#4b5563]">
                {t('orders.onTheWayOut.subtitle')}
              </p>
            </div>

            {/* Outgoing Cards */}
            <div className="flex flex-col gap-[24px]">
              {pageOutgoingItems.map((item) => (
                <OutgoingCard key={item.id} item={item} />
              ))}
            </div>

            {/* Pagination */}
            <OrderPagination currentPage={safePage} totalPages={totalPages} />
          </div>
        ) : (
          <EmptyOutgoing />
        )
      ) : isBuyAgainTab ? (
        // Buy Again Tab — 3-column product grid
        buyAgainProducts.length > 0 ? (
          <div className="flex max-w-[1400px] flex-col gap-[24px] p-[24px]">
            {/* Sub-section Header */}
            <div className="flex flex-col gap-[8px]">
              <h2 className="text-xl font-bold leading-[36px] text-[#111827] sm:text-[24px]">
                {t('orders.buyAgain.title')}
              </h2>
              <p className="text-[15px] leading-[22.5px] text-[#4b5563]">
                {t('orders.buyAgain.subtitle')}
              </p>
            </div>

            {/* Product Grid */}
            <div className="grid grid-cols-1 gap-[24px] sm:grid-cols-2 lg:grid-cols-3">
              {pageBuyAgainProducts.map((product) => (
                <BuyAgainCard key={product.id} product={product} />
              ))}
            </div>

            {/* Pagination */}
            <OrderPagination currentPage={safePage} totalPages={totalPages} />
          </div>
        ) : (
          <EmptyBuyAgain />
        )
      ) : // Orders Tab
      tabFilteredOrders.length > 0 ? (
        <div className="flex max-w-[1400px] flex-col gap-[24px] p-[24px]">
          {/* Orders Header */}
          <div className="flex flex-wrap items-center gap-x-[24px] gap-y-[8px]">
            <div className="flex flex-col gap-[2px]">
              <span className="text-[12px] font-normal uppercase leading-[18px] tracking-[0.5px] text-[#6b7280]">
                {t('orders.ordersPlaced')}
              </span>
              <span className="text-[14px] leading-[21px] text-[#374151]">
                {t('orders.ordersCount', {count: tabFilteredOrders.length})}
              </span>
            </div>
            <div className="flex flex-col gap-[2px]">
              <span className="text-[12px] font-normal uppercase leading-[18px] tracking-[0.5px] text-[#6b7280]">
                {t('orders.timePeriod')}
              </span>
              <div className="relative">
                <select
                  value={timeFilter}
                  onChange={handleTimeFilterChange}
                  className="appearance-none rounded-[4px] border border-[#d1d5db] bg-white py-[5px] pl-[9px] pr-[26px] text-[14px] leading-[21px] text-[#374151] focus:border-secondary focus:outline-none focus:ring-1 focus:ring-secondary"
                >
                  {TIME_FILTER_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {t(opt.labelKey)}
                    </option>
                  ))}
                </select>
                <ChevronDown
                  size={14}
                  className="pointer-events-none absolute right-[7px] top-1/2 -translate-y-1/2 text-[#374151]"
                />
              </div>
            </div>
          </div>

          {/* Order Cards */}
          <div className="flex flex-col gap-[24px]">
            {pageOrders.map((order: any) => {
              const numericId =
                order.id.split('/').pop()?.split('?')[0] ?? order.id;
              return (
                <div
                  key={order.id}
                  data-order-id={numericId}
                  className="rounded-[12px] transition-[box-shadow] duration-500"
                >
                  <OrderCard order={order} />
                </div>
              );
            })}
          </div>

          {/* Pagination */}
          <OrderPagination currentPage={safePage} totalPages={totalPages} />
        </div>
      ) : (
        <EmptyOrders />
      )}
    </div>
  );
}

// ============================================================================
// HydrateFallback (loading skeleton)
// ============================================================================

export function HydrateFallback() {
  return (
    <div className="flex flex-col gap-[15px]">
      {/* Header skeleton */}
      <div className="flex flex-col gap-[8px]">
        <div className="h-[40px] w-[200px] animate-pulse rounded bg-gray-200" />
        <div className="h-[20px] w-[300px] animate-pulse rounded bg-gray-200" />
      </div>
      {/* Stats skeleton */}
      <div className="flex flex-col gap-[24px] pb-[16px] sm:flex-row">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="h-[134px] flex-1 animate-pulse rounded-[12px] bg-gray-200"
          />
        ))}
      </div>
      {/* Tab bar skeleton */}
      <div className="h-[59px] w-full animate-pulse rounded bg-gray-200" />
      {/* Order cards skeleton */}
      <div className="flex flex-col gap-[24px] p-[24px]">
        {[1, 2].map((i) => (
          <div
            key={i}
            className="h-[300px] w-full animate-pulse rounded-[12px] bg-gray-200"
          />
        ))}
      </div>
    </div>
  );
}

// ============================================================================
// EmptyOrders Component
// ============================================================================

function EmptyOrders() {
  const {t} = useTranslation();
  return (
    <div className="flex flex-col items-center py-16 text-center">
      <Package size={64} className="mb-4 text-[#9ca3af]" />
      <h2 className="mb-2 text-xl font-semibold text-[#1f2937]">
        {t('orders.empty.heading')}
      </h2>
      <p className="mb-6 text-[#6b7280]">{t('orders.empty.subtitle')}</p>
      <Button asChild>
        <Link to="/collections">{t('orders.empty.cta')}</Link>
      </Button>
    </div>
  );
}

// ============================================================================
// EmptyBuyAgain Component
// ============================================================================

function EmptyBuyAgain() {
  const {t} = useTranslation();
  return (
    <div className="flex flex-col items-center py-16 text-center">
      <RotateCcw size={64} className="mb-4 text-[#9ca3af]" />
      <h2 className="mb-2 text-xl font-semibold text-[#1f2937]">
        {t('orders.emptyBuyAgain.heading')}
      </h2>
      <p className="mb-6 text-[#6b7280]">
        {t('orders.emptyBuyAgain.subtitle')}
      </p>
      <Button asChild>
        <Link to="/collections">{t('orders.empty.cta')}</Link>
      </Button>
    </div>
  );
}

// ============================================================================
// EmptyOutgoing Component
// ============================================================================

function EmptyOutgoing() {
  const {t} = useTranslation();
  return (
    <div className="flex flex-col items-center py-16 text-center">
      <Undo2 size={64} className="mb-4 text-[#9ca3af]" />
      <h2 className="mb-2 text-xl font-semibold text-[#1f2937]">
        {t('orders.emptyOutgoing.heading')}
      </h2>
      <p className="mb-6 text-[#6b7280]">
        {t('orders.emptyOutgoing.subtitle')}
      </p>
      <Button asChild>
        <Link to="/collections">{t('orders.continueShopping')}</Link>
      </Button>
    </div>
  );
}
