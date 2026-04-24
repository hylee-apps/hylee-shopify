import type {Route} from './+types/account.orders.$id';
import {Link} from 'react-router';
import {getSeoMeta, Image} from '@shopify/hydrogen';
import {Truck, ExternalLink, ImageIcon, ArrowLeft, Undo2} from 'lucide-react';
import {RecipientBadge} from '~/components/account/RecipientBadge';
import {CHECKOUT_ATTR} from '~/lib/checkout';
import {useTranslation} from 'react-i18next';
import type {TFunction} from 'i18next';
import {requireAuth} from '~/lib/customer-auth';

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
// GraphQL Query — Storefront API (legacy customer auth)
// Fetches all orders and we filter by ID to ensure customer ownership.
// ============================================================================

const ORDER_QUERY = `#graphql
  query CustomerOrderDetail($customerAccessToken: String!) {
    customer(customerAccessToken: $customerAccessToken) {
      orders(first: 250) {
        nodes {
          id
          name
          processedAt
          canceledAt
          cancelReason
          fulfillmentStatus
          totalPrice {
            amount
            currencyCode
          }
          subtotalPrice {
            amount
            currencyCode
          }
          totalTax {
            amount
            currencyCode
          }
          totalShippingPrice {
            amount
            currencyCode
          }
          shippingAddress {
            firstName
            lastName
            formatted
            address1
            address2
            city
            provinceCode
            zip
            countryCodeV2
          }
          customAttributes {
            key
            value
          }
          billingAddress {
            firstName
            lastName
            formatted
          }
          lineItems(first: 50) {
            nodes {
              title
              quantity
              discountedTotalPrice {
                amount
                currencyCode
              }
              variant {
                title
                image {
                  url
                  altText
                  width
                  height
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
                  ... on DiscountCodeApplication {
                    code
                  }
                }
              }
            }
          }
          successfulFulfillments {
            trackingCompany
            trackingInfo {
              number
              url
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
  const token = requireAuth(context.session);
  const targetGid = `gid://shopify/Order/${params.id}`;

  const {customer} = await context.storefront.query(ORDER_QUERY, {
    variables: {customerAccessToken: token},
  });

  // Filter by GID to verify customer ownership
  const raw = (customer?.orders?.nodes ?? []).find(
    (o: any) => o.id === targetGid,
  );
  if (!raw) throw new Response('Order not found', {status: 404});

  // Normalize legacy field names to match what the component expects
  const order = {
    ...raw,
    // canceledAt (legacy) → cancelledAt (component expectation)
    cancelledAt: raw.canceledAt ?? null,
    // Rename price fields
    subtotal: raw.subtotalPrice ?? null,
    totalShipping: raw.totalShippingPrice ?? null,
    // Normalize addresses: compute `name` and keep `formatted`
    shippingAddress: raw.shippingAddress
      ? {
          ...raw.shippingAddress,
          name: [raw.shippingAddress.firstName, raw.shippingAddress.lastName]
            .filter(Boolean)
            .join(' '),
        }
      : null,
    billingAddress: raw.billingAddress
      ? {
          ...raw.billingAddress,
          name: [raw.billingAddress.firstName, raw.billingAddress.lastName]
            .filter(Boolean)
            .join(' '),
        }
      : null,
    // Normalize line items: hoist variant.image → image; compute variantTitle
    lineItems: {
      nodes: (raw.lineItems?.nodes ?? []).map((item: any) => {
        const vt = item.variant?.title;
        return {
          ...item,
          image: item.variant?.image ?? null,
          variantTitle: vt && vt !== 'Default Title' ? vt : null,
          soldDiscountedTotalPrice: item.discountedTotalPrice ?? null,
        };
      }),
    },
    // Normalize fulfillments structure
    fulfillments: {
      nodes: (raw.successfulFulfillments ?? []).map((f: any) => ({
        trackingInformation: (f.trackingInfo ?? []).map((t: any) => ({
          company: f.trackingCompany ?? null,
          number: t.number ?? null,
          url: t.url ?? null,
        })),
      })),
    },
  };

  const attrs = order.customAttributes ?? [];
  const getAttr = (key: string): string | null =>
    attrs.find((a: any) => a.key === key)?.value ?? null;

  return {
    order,
    shippingCategory: getAttr(CHECKOUT_ATTR.SHIPPING_CATEGORY),
    shippingRecipientLabel: getAttr(CHECKOUT_ATTR.SHIPPING_RECIPIENT_LABEL),
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

function getFulfillmentBadge(
  status: string | null,
  t: TFunction,
): {
  label: string;
  variant: 'success' | 'warning' | 'info' | 'default';
} {
  switch (status) {
    case 'FULFILLED':
      return {label: t('orderDetail.status.delivered'), variant: 'success'};
    case 'PARTIALLY_FULFILLED':
      return {
        label: t('orderDetail.status.partiallyShipped'),
        variant: 'warning',
      };
    case 'IN_PROGRESS':
      return {label: t('orderDetail.status.inProgress'), variant: 'info'};
    case 'UNFULFILLED':
    default:
      return {label: t('orderDetail.status.processing'), variant: 'default'};
  }
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
// Main Component
// ============================================================================

export default function OrderDetailPage({loaderData}: Route.ComponentProps) {
  const {order, shippingCategory, shippingRecipientLabel} = loaderData;
  const {t} = useTranslation('common');

  const {label: statusLabel, variant: statusVariant} = getFulfillmentBadge(
    order.fulfillmentStatus,
    t,
  );

  return (
    <div>
      {/* Back link */}
      <Link
        to="/account/orders"
        className="mb-4 inline-flex items-center gap-1 text-sm text-text-muted hover:text-secondary"
      >
        <ArrowLeft size={14} />
        {t('orderDetail.backToOrders')}
      </Link>

      {/* Page Header */}
      <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-dark">{order.name}</h1>
          <p className="mt-1 text-text-muted">
            {t('orderDetail.placed', {date: formatDate(order.processedAt)})}
          </p>
        </div>
        <div className="flex items-center gap-3">
          {order.fulfillmentStatus === 'FULFILLED' && (
            <Link
              to={`/account/orders/${order.id.split('/').pop()?.split('?')[0]}/return`}
              reloadDocument
              className="inline-flex items-center gap-2 rounded-lg border border-[#d1d5db] bg-white px-4 py-2 text-sm font-medium text-[#374151] transition-colors hover:bg-[#f9fafb]"
            >
              <Undo2 size={14} />
              {t('orderDetail.returnOrReplace')}
            </Link>
          )}
          <StatusBadge variant={statusVariant}>{statusLabel}</StatusBadge>
        </div>
      </div>

      {order.cancelledAt && (
        <div className="mb-6 rounded-md border border-red-200 bg-red-50 p-4">
          <p className="text-sm font-medium text-red-800">
            {t('orderDetail.cancelledNotice', {
              date: formatDate(order.cancelledAt),
            })}
            {order.cancelReason && ` — ${order.cancelReason}`}
          </p>
        </div>
      )}

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Tracking / Fulfillment */}
          {(order.fulfillments?.nodes?.length ?? 0) > 0 && (
            <div className="rounded-lg border border-border p-5">
              <h2 className="mb-4 text-lg font-semibold text-dark">
                {t('orderDetail.deliveryStatus.title')}
              </h2>
              {order.fulfillments!.nodes.map(
                (fulfillment: any, idx: number) => (
                  <div key={idx} className="space-y-2">
                    {fulfillment.trackingInformation?.map(
                      (tracking: any, tIdx: number) => (
                        <div
                          key={tIdx}
                          className="flex items-center justify-between rounded-md bg-surface p-3"
                        >
                          <div className="flex items-center gap-3">
                            <Truck size={20} className="text-primary" />
                            <div>
                              <p className="text-sm font-medium text-dark">
                                {tracking.company ||
                                  t('orderDetail.deliveryStatus.carrier')}
                              </p>
                              <p className="text-xs text-text-muted">
                                {t('orderDetail.deliveryStatus.tracking', {
                                  number: tracking.number,
                                })}
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
                              {t('orderDetail.deliveryStatus.trackLink')}
                              <ExternalLink size={14} />
                            </a>
                          )}
                        </div>
                      ),
                    )}
                  </div>
                ),
              )}
            </div>
          )}

          {/* Line Items */}
          <div className="rounded-lg border border-border">
            <h2 className="border-b border-border px-5 py-4 text-lg font-semibold text-dark">
              {t('orderDetail.items.title')}
            </h2>
            <div className="divide-y divide-border">
              {order.lineItems.nodes.map((item: any, idx: number) => {
                const image = item.image;
                const variantTitle = item.variantTitle;
                return (
                  <div key={idx} className="flex items-center gap-4 px-5 py-4">
                    {image ? (
                      <Image
                        data={image}
                        width={80}
                        height={80}
                        className="h-20 w-20 rounded-md object-cover"
                        alt={image.altText || item.title}
                      />
                    ) : (
                      <div className="flex h-20 w-20 items-center justify-center rounded-md bg-surface">
                        <ImageIcon size={32} className="text-text-muted" />
                      </div>
                    )}
                    <div className="flex-1">
                      <p className="text-sm font-medium text-dark">
                        {item.title}
                      </p>
                      {variantTitle && variantTitle !== 'Default Title' && (
                        <p className="text-xs text-text-muted">
                          {variantTitle}
                        </p>
                      )}
                      <p className="text-xs text-text-muted">
                        {t('orderDetail.items.qty', {quantity: item.quantity})}
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
                      {formatMoney(item.soldDiscountedTotalPrice)}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Order Summary */}
          <div className="rounded-lg border border-border p-5">
            <h2 className="mb-4 text-lg font-semibold text-dark">
              {t('orderDetail.summary.title')}
            </h2>
            <div className="space-y-2 text-sm">
              {order.subtotal && (
                <div className="flex justify-between">
                  <span className="text-text">
                    {t('orderDetail.summary.subtotal')}
                  </span>
                  <span className="font-medium text-dark">
                    {formatMoney(order.subtotal)}
                  </span>
                </div>
              )}
              {order.totalShipping && (
                <div className="flex justify-between">
                  <span className="text-text">
                    {t('orderDetail.summary.shipping')}
                  </span>
                  <span className="font-medium text-dark">
                    {parseFloat(order.totalShipping.amount) === 0
                      ? t('orderDetail.summary.shippingFree')
                      : formatMoney(order.totalShipping)}
                  </span>
                </div>
              )}
              {order.totalTax && parseFloat(order.totalTax.amount) > 0 && (
                <div className="flex justify-between">
                  <span className="text-text">
                    {t('orderDetail.summary.tax')}
                  </span>
                  <span className="font-medium text-dark">
                    {formatMoney(order.totalTax)}
                  </span>
                </div>
              )}
              <div className="flex justify-between border-t border-border pt-2 text-base">
                <span className="font-semibold text-dark">
                  {t('orderDetail.summary.total')}
                </span>
                <span className="font-bold text-dark">
                  {formatMoney(order.totalPrice)}
                </span>
              </div>
            </div>
          </div>

          {/* Shipping Address */}
          {order.shippingAddress && (
            <div className="rounded-lg border border-border p-5">
              <h2 className="mb-3 flex items-center gap-2 text-lg font-semibold text-dark">
                {t('orderDetail.shippingAddress.title')}
                {shippingRecipientLabel && shippingCategory && (
                  <RecipientBadge
                    category={shippingCategory}
                    label={shippingRecipientLabel}
                  />
                )}
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
                {t('orderDetail.billingAddress.title')}
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
          <ArrowLeft size={14} />
          {t('orderDetail.backToOrders')}
        </Link>
      </div>
    </div>
  );
}
