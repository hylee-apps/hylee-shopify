import type {Route} from './+types/account.orders._index';
import {redirect, Link, useSearchParams} from 'react-router';
import {getSeoMeta, Image} from '@shopify/hydrogen';
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '~/components/ui/breadcrumb';
import {Badge} from '~/components/ui/badge';
import {Button} from '~/components/ui/button';
import {ChevronDown, ChevronRight, ImageIcon, Package} from 'lucide-react';

// ============================================================================
// Route Meta
// ============================================================================

export function meta() {
  return getSeoMeta({
    title: 'Your Orders',
    description: 'View and track your orders.',
  });
}

// ============================================================================
// GraphQL Query
// ============================================================================

const CUSTOMER_ORDERS_QUERY = `#graphql
  query CustomerOrders($first: Int, $after: String) {
    customer {
      orders(first: $first, after: $after, sortKey: PROCESSED_AT, reverse: true) {
        nodes {
          id
          name
          processedAt
          financialStatus
          fulfillmentStatus
          totalPrice {
            amount
            currencyCode
          }
          lineItems(first: 5) {
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
// Loader
// ============================================================================

export async function loader({context, request}: Route.LoaderArgs) {
  const isLoggedIn = await context.customerAccount.isLoggedIn();
  if (!isLoggedIn) {
    return redirect('/account/login');
  }

  const url = new URL(request.url);
  const after = url.searchParams.get('after') ?? undefined;

  const {data} = await context.customerAccount.query(CUSTOMER_ORDERS_QUERY, {
    variables: {first: 10, after},
  });

  return {
    orders: data.customer?.orders.nodes ?? [],
    pageInfo: data.customer?.orders.pageInfo,
  };
}

// ============================================================================
// Helpers
// ============================================================================

function formatMoney(money: {amount: string; currencyCode: string}): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: money.currencyCode,
  }).format(parseFloat(money.amount));
}

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

function getFulfillmentBadge(status: string | null): {
  label: string;
  variant: 'success' | 'warning' | 'info' | 'default';
} {
  switch (status) {
    case 'FULFILLED':
      return {label: 'Delivered', variant: 'success'};
    case 'PARTIALLY_FULFILLED':
      return {label: 'Partially Shipped', variant: 'warning'};
    case 'IN_PROGRESS':
      return {label: 'In Progress', variant: 'info'};
    case 'UNFULFILLED':
    default:
      return {label: 'Processing', variant: 'default'};
  }
}

// ============================================================================
// Main Component
// ============================================================================

export default function OrdersPage({loaderData}: Route.ComponentProps) {
  const {orders, pageInfo} = loaderData;

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <Breadcrumb className="mb-6">
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link to="/">Home</Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link to="/account">Account</Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>Your Orders</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <div className="mb-8">
        <h1 className="text-3xl font-bold text-dark">Your Orders</h1>
        <p className="mt-1 text-text-muted">
          {orders.length > 0
            ? `${orders.length} order${orders.length !== 1 ? 's' : ''}`
            : 'No orders yet'}
        </p>
      </div>

      {orders.length > 0 ? (
        <div className="space-y-6">
          {orders.map((order: any) => (
            <OrderCard key={order.id} order={order} />
          ))}

          {/* Load More */}
          {pageInfo?.hasNextPage && (
            <div className="text-center">
              <Link
                to={`/account/orders?after=${pageInfo.endCursor}`}
                className="inline-flex items-center gap-2 rounded-md border border-border px-5 py-2.5 text-sm font-medium text-text transition-colors hover:border-primary hover:text-primary"
              >
                Load More Orders
                <ChevronDown size={16} />
              </Link>
            </div>
          )}
        </div>
      ) : (
        <EmptyOrders />
      )}
    </div>
  );
}

// ============================================================================
// StatusBadge Component
// ============================================================================

function StatusBadge({
  variant,
  children,
}: {
  variant: 'success' | 'warning' | 'info' | 'default';
  children: React.ReactNode;
}) {
  const cls = {
    success:
      'inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800',
    warning:
      'inline-flex items-center rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-medium text-amber-800',
    info: 'inline-flex items-center rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-800',
    default:
      'inline-flex items-center rounded-full bg-surface px-2.5 py-0.5 text-xs font-medium text-text',
  }[variant];
  return <span className={cls}>{children}</span>;
}

// ============================================================================
// OrderCard Component
// ============================================================================

function OrderCard({order}: {order: any}) {
  const {label: statusLabel, variant: statusVariant} = getFulfillmentBadge(
    order.fulfillmentStatus,
  );
  const orderId = order.id.split('/').pop();

  return (
    <div className="overflow-hidden rounded-lg border border-border">
      {/* Order Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border bg-surface/50 px-5 py-3">
        <div className="flex flex-wrap items-center gap-x-6 gap-y-1 text-sm">
          <div>
            <span className="text-text-muted">Order placed</span>{' '}
            <span className="font-medium text-dark">
              {formatDate(order.processedAt)}
            </span>
          </div>
          <div>
            <span className="text-text-muted">Total</span>{' '}
            <span className="font-medium text-dark">
              {formatMoney(order.totalPrice)}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <StatusBadge variant={statusVariant}>{statusLabel}</StatusBadge>
          <span className="text-sm text-text-muted">{order.name}</span>
        </div>
      </div>

      {/* Line Items */}
      <div className="divide-y divide-border px-5">
        {order.lineItems.nodes.map((item: any, idx: number) => (
          <div key={idx} className="flex items-center gap-4 py-4">
            {item.image ? (
              <Image
                data={item.image}
                width={64}
                height={64}
                className="h-16 w-16 rounded-md object-cover"
                alt={item.image.altText || item.title}
              />
            ) : (
              <div className="flex h-16 w-16 items-center justify-center rounded-md bg-surface">
                <ImageIcon size={24} className="text-text-muted" />
              </div>
            )}
            <div className="flex-1">
              <p className="text-sm font-medium text-dark">{item.title}</p>
              {item.variantTitle && item.variantTitle !== 'Default Title' && (
                <p className="text-xs text-text-muted">{item.variantTitle}</p>
              )}
              <p className="text-xs text-text-muted">Qty: {item.quantity}</p>
            </div>
            {item.price && (
              <span className="text-sm font-medium text-dark">
                {formatMoney(item.price)}
              </span>
            )}
          </div>
        ))}
      </div>

      {/* Footer */}
      <div className="flex items-center justify-end gap-3 border-t border-border px-5 py-3">
        <Link
          to={`/account/orders/${orderId}`}
          className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline"
        >
          View Order Details
          <ChevronRight size={14} />
        </Link>
      </div>
    </div>
  );
}

// ============================================================================
// EmptyOrders Component
// ============================================================================

function EmptyOrders() {
  return (
    <div className="flex flex-col items-center py-16 text-center">
      <Package size={64} className="mb-4 text-text-muted" />
      <h2 className="mb-2 text-xl font-semibold text-dark">No orders yet</h2>
      <p className="mb-6 text-text-muted">
        When you place your first order, it will appear here.
      </p>
      <Button asChild>
        <Link to="/collections">Start Shopping</Link>
      </Button>
    </div>
  );
}
