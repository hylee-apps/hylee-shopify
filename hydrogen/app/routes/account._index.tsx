import type {Route} from './+types/account._index';
import {redirect, Link} from 'react-router';
import {getSeoMeta} from '@shopify/hydrogen';
import {useTranslation} from 'react-i18next';
import {readAddressBook} from '~/lib/address-book-graphql';
import {
  getAuthenticatedCustomer,
  getCustomerAccessToken,
  isCustomerLoggedIn,
} from '~/lib/customer-auth';
import {Package, ImageIcon} from 'lucide-react';
import {mapOrder, statusColor, type OrderSummary} from '~/lib/account-helpers';

// ============================================================================
// Route Meta
// ============================================================================

export function meta() {
  return getSeoMeta({
    title: 'Your Account',
    description: 'Manage your Hy-lee account.',
  });
}

// ============================================================================
// GraphQL — Recent Orders (Storefront API)
// ============================================================================

const DASHBOARD_ORDERS_QUERY = `#graphql
  query DashboardOrders($customerAccessToken: String!) {
    customer(customerAccessToken: $customerAccessToken) {
      orders(first: 50, sortKey: PROCESSED_AT, reverse: true) {
        nodes {
          id
          name
          processedAt
          fulfillmentStatus
          totalPrice {
            amount
            currencyCode
          }
        }
      }
    }
  }
` as const;

// ============================================================================
// Loader
// ============================================================================

export async function loader({context}: Route.LoaderArgs) {
  if (!isCustomerLoggedIn(context.session)) {
    return redirect('/account/login');
  }

  const customer = await getAuthenticatedCustomer(
    context.storefront,
    context.session,
  );

  // Redirect new customers to the welcome survey
  const surveyDone = context.session.get('surveyCompleted') === 'true';
  if (!surveyDone) {
    try {
      const {surveyCompleted} = await readAddressBook(context);
      if (surveyCompleted) {
        context.session.set('surveyCompleted', 'true');
      } else {
        const createdAt = customer.createdAt;
        if (createdAt) {
          const accountAge = Date.now() - new Date(createdAt).getTime();
          const sevenDays = 7 * 24 * 60 * 60 * 1000;
          if (accountAge < sevenDays) {
            return redirect('/account/welcome');
          }
        }
      }
    } catch {
      // Metafield read failed — skip survey redirect
    }
  }

  // Fetch recent orders + address count in parallel
  let recentOrders: OrderSummary[] = [];
  let totalOrders = 0;
  let activeOrders = 0;
  let addressCount = 0;
  const token = getCustomerAccessToken(context.session)!;

  try {
    const [ordersResult, addressBookResult] = await Promise.all([
      context.storefront.query(DASHBOARD_ORDERS_QUERY, {
        variables: {customerAccessToken: token},
      }),
      readAddressBook(context).catch(() => null),
    ]);
    const data = ordersResult;

    const allOrders = (data.customer?.orders.nodes ?? []).map(mapOrder);
    totalOrders = allOrders.length;
    activeOrders = allOrders.filter((o) => o.status !== 'FULFILLED').length;
    recentOrders = allOrders.slice(0, 3);
    addressCount = addressBookResult?.book.contacts?.length ?? 0;
  } catch {
    // Graceful degradation — show empty dashboard
  }

  return {
    customer,
    recentOrders,
    totalOrders,
    activeOrders,
    addressCount,
  };
}

// ============================================================================
// Main Component
// ============================================================================

export default function AccountDashboard({loaderData}: Route.ComponentProps) {
  const {t} = useTranslation();
  const {customer, recentOrders, totalOrders, activeOrders, addressCount} =
    loaderData;
  const firstName = customer?.firstName ?? 'there';

  return (
    <div className="flex flex-col gap-6">
      {/* Welcome Banner */}
      <div
        className="flex items-center rounded-2xl px-5 py-6 sm:p-8"
        style={{
          backgroundImage:
            'linear-gradient(135deg, var(--color-secondary) 0%, var(--color-brand-accent) 100%)',
        }}
      >
        <div className="flex flex-col gap-2">
          <h2 className="text-[24px] font-light leading-9 text-white">
            {t('account.dashboard.welcomeBack', {name: firstName})}
          </h2>
          <p className="text-[16px] leading-6 text-white/90">
            {t('account.dashboard.subtitle')}
          </p>
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
        <StatCard
          value={totalOrders}
          label={t('account.dashboard.totalOrders')}
        />
        <StatCard
          value={activeOrders}
          label={t('account.dashboard.activeOrders')}
        />
        <StatCard
          value={addressCount}
          label={t('account.dashboard.savedAddresses')}
        />
      </div>

      {/* Recent Orders */}
      <div className="overflow-hidden rounded-xl border border-border bg-white shadow-sm">
        <div className="flex items-center justify-between border-b border-border px-6 py-5">
          <h2 className="text-lg font-bold text-gray-900">
            {t('account.dashboard.recentOrders')}
          </h2>
          <Link
            to="/account/orders"
            className="text-[15px] font-medium text-secondary hover:underline"
          >
            {t('account.dashboard.viewAll')}
          </Link>
        </div>
        <div className="p-6">
          {recentOrders.length === 0 ? (
            <p className="py-8 text-center text-sm text-text-muted">
              {t('account.dashboard.noOrders')}{' '}
              <Link to="/" className="text-secondary hover:underline">
                {t('account.dashboard.startShopping')}
              </Link>
            </p>
          ) : (
            <div className="divide-y divide-gray-100">
              {recentOrders.map((order) => (
                <OrderRow key={order.id} order={order} />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Saved for Later / Wishlist (placeholder) */}
      <div className="overflow-hidden rounded-xl border border-border bg-white shadow-sm">
        <div className="flex items-center justify-between border-b border-border px-6 py-5">
          <h2 className="text-lg font-bold text-gray-900">
            {t('account.dashboard.savedForLater')}
          </h2>
          <Link
            to="/account/wishlist"
            className="text-[15px] font-medium text-secondary hover:underline"
          >
            {t('account.dashboard.viewWishlist')}
          </Link>
        </div>
        <div className="grid grid-cols-1 gap-4 p-6 sm:grid-cols-3">
          {['Wireless Mouse Pro', 'USB-C Hub', 'Monitor Stand'].map(
            (name, i) => (
              <WishlistPlaceholder
                key={name}
                name={name}
                price={['$79.00', '$45.00', '$89.00'][i]}
              />
            ),
          )}
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// Sub-components
// ============================================================================

function StatCard({value, label}: {value: number; label: string}) {
  return (
    <div className="flex flex-col items-center gap-1 rounded-xl border border-border bg-white p-6 shadow-sm">
      <span className="text-[32px] font-bold text-secondary">{value}</span>
      <span className="text-sm text-text-muted">{label}</span>
    </div>
  );
}

function OrderRow({order}: {order: OrderSummary}) {
  const {t} = useTranslation();
  const colors = statusColor(order.status);
  // Extract numeric order ID from GID (e.g. "gid://shopify/Order/12345" → "12345")
  const numericId = order.id.split('/').pop()?.split('?')[0] ?? '';

  return (
    <Link
      to={`/account/orders?highlight=${numericId}`}
      className="flex flex-col gap-3 py-4 transition-colors hover:bg-gray-50 sm:flex-row sm:items-center sm:justify-between"
    >
      <div className="flex items-center gap-4">
        <div className="hidden size-[60px] shrink-0 items-center justify-center rounded-lg bg-gray-100 sm:flex">
          <Package size={16} className="text-gray-400" />
        </div>
        <div className="flex flex-col gap-1">
          <h4 className="text-base font-medium text-gray-800">{order.name}</h4>
          <p className="text-sm text-text-muted">
            {t('account.dashboard.placedOn', {date: order.date})} &middot;{' '}
            {order.total}
          </p>
        </div>
      </div>
      <span
        className={`self-start rounded-xl px-3 py-1 text-[13px] font-medium sm:self-auto ${colors.bg} ${colors.text}`}
      >
        {order.statusLabel}
      </span>
    </Link>
  );
}

// ============================================================================
// Loading Skeleton (exported as HydrateFallback for initial page load)
// ============================================================================

export function HydrateFallback() {
  return (
    <div className="flex flex-col gap-6">
      {/* Welcome Banner Skeleton */}
      <div className="h-[104px] animate-pulse rounded-2xl bg-gray-200" />

      {/* Stats Row Skeleton */}
      <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="flex flex-col items-center gap-2 rounded-xl border border-border bg-white p-6"
          >
            <div className="h-10 w-16 animate-pulse rounded bg-gray-200" />
            <div className="h-4 w-24 animate-pulse rounded bg-gray-100" />
          </div>
        ))}
      </div>

      {/* Recent Orders Skeleton */}
      <div className="overflow-hidden rounded-xl border border-border bg-white shadow-sm">
        <div className="flex items-center justify-between border-b border-border px-6 py-5">
          <div className="h-5 w-32 animate-pulse rounded bg-gray-200" />
          <div className="h-4 w-16 animate-pulse rounded bg-gray-100" />
        </div>
        <div className="divide-y divide-gray-100 p-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex items-center gap-4 py-4">
              <div className="hidden size-[60px] animate-pulse rounded-lg bg-gray-100 sm:block" />
              <div className="flex flex-1 flex-col gap-2">
                <div className="h-4 w-28 animate-pulse rounded bg-gray-200" />
                <div className="h-3 w-48 animate-pulse rounded bg-gray-100" />
              </div>
              <div className="h-6 w-20 animate-pulse rounded-xl bg-gray-100" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function WishlistPlaceholder({name, price}: {name: string; price: string}) {
  return (
    <div className="flex flex-col items-center">
      <div className="flex aspect-square w-full items-center justify-center rounded-lg bg-gray-100">
        <ImageIcon size={24} className="text-gray-400" />
      </div>
      <h4 className="mt-3 text-sm font-medium text-gray-800">{name}</h4>
      <p className="text-sm font-semibold text-secondary">{price}</p>
    </div>
  );
}
