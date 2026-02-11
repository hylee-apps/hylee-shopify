import type {Route} from './+types/account.orders.$id';
import {redirect, Link} from 'react-router';
import {getSeoMeta, Image} from '@shopify/hydrogen';
import {Breadcrumb, Icon, Badge} from '~/components';

// ============================================================================
// Route Meta
// ============================================================================

export function meta({data}: Route.MetaArgs) {
  const orderName = data?.order?.name ?? 'Order';
  return getSeoMeta({
    title: `Order ${orderName}`,
    description: `Details for order ${orderName}.`,
  });
}

// ============================================================================
// GraphQL Query
// ============================================================================

const ORDER_QUERY = `#graphql
  query OrderDetail($orderId: ID!) {
    order(id: $orderId) {
      id
      name
      processedAt
      cancelledAt
      cancelReason
      financialStatus
      fulfillmentStatus
      totalPrice {
        amount
        currencyCode
      }
      subtotal {
        amount
        currencyCode
      }
      totalTax {
        amount
        currencyCode
      }
      totalShipping {
        amount
        currencyCode
      }
      shippingAddress {
        name
        formatted
        address1
        address2
        city
        provinceCode
        zip
        country
      }
      billingAddress {
        name
        formatted
      }
      lineItems(first: 50) {
        nodes {
          title
          quantity
          image {
            url
            altText
            width
            height
          }
          totalPrice {
            amount
            currencyCode
          }
          variant {
            title
            price {
              amount
              currencyCode
            }
          }
          discountAllocations {
            allocatedAmount {
              amount
              currencyCode
            }
            discountApplication {
              ... on AutomaticDiscountApplication {
                title
              }
              ... on ManualDiscountApplication {
                title
              }
              ... on CodeDiscountApplication {
                code
              }
            }
          }
        }
      }
      fulfillments(first: 10) {
        nodes {
          status
          createdAt
          updatedAt
          trackingInformation {
            number
            company
            url
          }
        }
      }
      discountApplications(first: 10) {
        nodes {
          ... on AutomaticDiscountApplication {
            title
            value {
              ... on MoneyV2 {
                amount
                currencyCode
              }
              ... on PricingPercentageValue {
                percentage
              }
            }
          }
          ... on CodeDiscountApplication {
            code
            value {
              ... on MoneyV2 {
                amount
                currencyCode
              }
              ... on PricingPercentageValue {
                percentage
              }
            }
          }
        }
      }
    }
  }
` as const;

// ============================================================================
// Loader
// ============================================================================

export async function loader({context, params}: Route.LoaderArgs) {
  const isLoggedIn = await context.customerAccount.isLoggedIn();
  if (!isLoggedIn) {
    return redirect('/account/login');
  }

  const orderId = `gid://shopify/Order/${params.id}`;

  const {data} = await context.customerAccount.query(ORDER_QUERY, {
    variables: {orderId},
  });

  if (!data.order) {
    throw new Response('Order not found', {status: 404});
  }

  return {order: data.order};
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

export default function OrderDetailPage({loaderData}: Route.ComponentProps) {
  const {order} = loaderData;

  const {label: statusLabel, variant: statusVariant} = getFulfillmentBadge(
    order.fulfillmentStatus,
  );

  const breadcrumbs = [
    {label: 'Home', url: '/'},
    {label: 'Account', url: '/account'},
    {label: 'Orders', url: '/account/orders'},
    {label: order.name},
  ];

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <Breadcrumb items={breadcrumbs} className="mb-6" />

      {/* Page Header */}
      <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-dark">{order.name}</h1>
          <p className="mt-1 text-text-muted">
            Placed {formatDate(order.processedAt)}
          </p>
        </div>
        <Badge variant={statusVariant} size="lg">
          {statusLabel}
        </Badge>
      </div>

      {order.cancelledAt && (
        <div className="mb-6 rounded-md border border-red-200 bg-red-50 p-4">
          <p className="text-sm font-medium text-red-800">
            This order was cancelled on {formatDate(order.cancelledAt)}
            {order.cancelReason && ` — ${order.cancelReason}`}
          </p>
        </div>
      )}

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Tracking / Fulfillment */}
          {order.fulfillments?.nodes?.length > 0 && (
            <div className="rounded-lg border border-border p-5">
              <h2 className="mb-4 text-lg font-semibold text-dark">
                Delivery Status
              </h2>
              {order.fulfillments.nodes.map((fulfillment: any, idx: number) => (
                <div key={idx} className="space-y-2">
                  {fulfillment.trackingInformation?.map(
                    (tracking: any, tIdx: number) => (
                      <div
                        key={tIdx}
                        className="flex items-center justify-between rounded-md bg-surface p-3"
                      >
                        <div className="flex items-center gap-3">
                          <Icon
                            name="truck"
                            size={20}
                            className="text-primary"
                          />
                          <div>
                            <p className="text-sm font-medium text-dark">
                              {tracking.company || 'Carrier'}
                            </p>
                            <p className="text-xs text-text-muted">
                              Tracking: {tracking.number}
                            </p>
                          </div>
                        </div>
                        {tracking.url && (
                          <a
                            href={tracking.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline"
                          >
                            Track
                            <Icon name="external-link" size={14} />
                          </a>
                        )}
                      </div>
                    ),
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Line Items */}
          <div className="rounded-lg border border-border">
            <h2 className="border-b border-border px-5 py-4 text-lg font-semibold text-dark">
              Items
            </h2>
            <div className="divide-y divide-border">
              {order.lineItems.nodes.map((item: any, idx: number) => (
                <div key={idx} className="flex items-center gap-4 px-5 py-4">
                  {item.image ? (
                    <Image
                      data={item.image}
                      width={80}
                      height={80}
                      className="h-20 w-20 rounded-md object-cover"
                      alt={item.image.altText || item.title}
                    />
                  ) : (
                    <div className="flex h-20 w-20 items-center justify-center rounded-md bg-surface">
                      <Icon
                        name="image"
                        size={32}
                        className="text-text-muted"
                      />
                    </div>
                  )}
                  <div className="flex-1">
                    <p className="text-sm font-medium text-dark">
                      {item.title}
                    </p>
                    {item.variant?.title &&
                      item.variant.title !== 'Default Title' && (
                        <p className="text-xs text-text-muted">
                          {item.variant.title}
                        </p>
                      )}
                    <p className="text-xs text-text-muted">
                      Qty: {item.quantity}
                    </p>
                    {item.discountAllocations?.length > 0 &&
                      item.discountAllocations.map(
                        (disc: any, dIdx: number) => (
                          <p
                            key={dIdx}
                            className="text-xs font-medium text-primary"
                          >
                            {disc.discountApplication?.title ||
                              disc.discountApplication?.code}{' '}
                            (-{formatMoney(disc.allocatedAmount)})
                          </p>
                        ),
                      )}
                  </div>
                  <span className="shrink-0 text-sm font-medium text-dark">
                    {formatMoney(item.totalPrice)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Order Summary */}
          <div className="rounded-lg border border-border p-5">
            <h2 className="mb-4 text-lg font-semibold text-dark">
              Order Summary
            </h2>
            <div className="space-y-2 text-sm">
              {order.subtotal && (
                <div className="flex justify-between">
                  <span className="text-text">Subtotal</span>
                  <span className="font-medium text-dark">
                    {formatMoney(order.subtotal)}
                  </span>
                </div>
              )}
              {order.totalShipping && (
                <div className="flex justify-between">
                  <span className="text-text">Shipping</span>
                  <span className="font-medium text-dark">
                    {parseFloat(order.totalShipping.amount) === 0
                      ? 'Free'
                      : formatMoney(order.totalShipping)}
                  </span>
                </div>
              )}
              {order.totalTax && parseFloat(order.totalTax.amount) > 0 && (
                <div className="flex justify-between">
                  <span className="text-text">Tax</span>
                  <span className="font-medium text-dark">
                    {formatMoney(order.totalTax)}
                  </span>
                </div>
              )}
              <div className="flex justify-between border-t border-border pt-2 text-base">
                <span className="font-semibold text-dark">Total</span>
                <span className="font-bold text-dark">
                  {formatMoney(order.totalPrice)}
                </span>
              </div>
            </div>
          </div>

          {/* Shipping Address */}
          {order.shippingAddress && (
            <div className="rounded-lg border border-border p-5">
              <h2 className="mb-3 text-lg font-semibold text-dark">
                Shipping Address
              </h2>
              <div className="text-sm text-text">
                <p className="font-medium text-dark">
                  {order.shippingAddress.name}
                </p>
                {order.shippingAddress.formatted?.map(
                  (line: string, idx: number) => (
                    <p key={idx}>{line}</p>
                  ),
                )}
              </div>
            </div>
          )}

          {/* Billing Address */}
          {order.billingAddress && (
            <div className="rounded-lg border border-border p-5">
              <h2 className="mb-3 text-lg font-semibold text-dark">
                Billing Address
              </h2>
              <div className="text-sm text-text">
                <p className="font-medium text-dark">
                  {order.billingAddress.name}
                </p>
                {order.billingAddress.formatted?.map(
                  (line: string, idx: number) => (
                    <p key={idx}>{line}</p>
                  ),
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Back link */}
      <div className="mt-8">
        <Link
          to="/account/orders"
          className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline"
        >
          <Icon name="arrow-left" size={14} />
          Back to Orders
        </Link>
      </div>
    </div>
  );
}
