import type {Route} from './+types/order-status';
import {Fragment} from 'react';
import {Link, redirect} from 'react-router';
import {getSeoMeta, Image} from '@shopify/hydrogen';
import {useTranslation} from 'react-i18next';
import {
  ArrowLeft,
  CheckCircle2,
  ExternalLink,
  ImageIcon,
  MapPin,
  Truck,
  XCircle,
} from 'lucide-react';
import {
  getOrderByEmailAndNumber,
  type AdminEnv,
  type AdminOrderDetail,
} from '~/lib/admin-api';
import {Card, CardContent} from '~/components/ui/card';

// ============================================================================
// Route Meta
// ============================================================================

export function meta() {
  return getSeoMeta({
    title: 'Order Status — Hy-lee',
    description: 'View the current status of your Hy-lee order.',
  });
}

// ============================================================================
// Loader
// ============================================================================

export async function loader({request, context}: Route.LoaderArgs) {
  const url = new URL(request.url);
  const email = url.searchParams.get('email')?.trim().toLowerCase() ?? '';
  const number = url.searchParams.get('number')?.trim() ?? '';

  if (!email || !number) {
    throw redirect('/order-tracking');
  }

  let order: AdminOrderDetail | null;
  try {
    order = await getOrderByEmailAndNumber(
      context.env as unknown as AdminEnv,
      email,
      number.replace(/^#/, ''),
    );
  } catch (err) {
    console.error('[order-status] Admin API error:', err);
    throw redirect('/order-tracking');
  }

  if (!order) {
    throw redirect('/order-tracking');
  }

  return {order};
}

// ============================================================================
// Timeline helpers
// ============================================================================

const TIMELINE_STEPS = ['placed', 'confirmed', 'shipped', 'delivered'] as const;
type TimelineStep = (typeof TIMELINE_STEPS)[number];

function getActiveStepIndex(status: string): number {
  switch (status) {
    case 'FULFILLED':
      return 3;
    case 'IN_PROGRESS':
    case 'PARTIALLY_FULFILLED':
      return 2;
    case 'CANCELLED':
      return -1;
    default:
      return 1; // UNFULFILLED, PENDING, ON_HOLD
  }
}

function getStatusBadge(
  status: string,
  t: (key: string) => string,
): {label: string; className: string} {
  switch (status) {
    case 'FULFILLED':
      return {
        label: t('orderStatus.progress.delivered'),
        className: 'bg-primary/10 text-primary',
      };
    case 'IN_PROGRESS':
    case 'PARTIALLY_FULFILLED':
      return {
        label: t('orderStatus.progress.shipped'),
        className: 'bg-secondary/10 text-secondary',
      };
    case 'CANCELLED':
      return {
        label: t('orderStatus.progress.cancelled'),
        className: 'bg-red-50 text-red-600',
      };
    default:
      return {
        label: t('orderStatus.progress.confirmed'),
        className: 'bg-gray-100 text-gray-600',
      };
  }
}

// ============================================================================
// Timeline component
// ============================================================================

function OrderTimeline({
  status,
  t,
}: {
  status: string;
  t: (key: string) => string;
}) {
  const activeIndex = getActiveStepIndex(status);

  if (activeIndex === -1) {
    return (
      <div className="flex items-center gap-2 py-1">
        <XCircle size={20} className="shrink-0 text-red-500" />
        <span className="text-sm font-medium text-red-600">
          {t('orderStatus.progress.cancelled')}
        </span>
      </div>
    );
  }

  const stepLabels: Record<TimelineStep, string> = {
    placed: t('orderStatus.progress.placed'),
    confirmed: t('orderStatus.progress.confirmed'),
    shipped: t('orderStatus.progress.shipped'),
    delivered: t('orderStatus.progress.delivered'),
  };

  return (
    <div className="flex items-start">
      {TIMELINE_STEPS.map((step, i) => {
        const isComplete = i <= activeIndex;
        const isCurrent = i === activeIndex;
        return (
          <Fragment key={step}>
            <div className="flex shrink-0 flex-col items-center gap-1.5">
              {isComplete ? (
                <CheckCircle2
                  size={20}
                  className={isCurrent ? 'text-secondary' : 'text-primary'}
                />
              ) : (
                <div className="size-5 rounded-full border-2 border-gray-200 bg-white" />
              )}
              <span
                className={`text-[11px] font-medium leading-none ${
                  isCurrent
                    ? 'text-secondary'
                    : isComplete
                      ? 'text-[#374151]'
                      : 'text-gray-400'
                }`}
              >
                {stepLabels[step]}
              </span>
            </div>
            {i < TIMELINE_STEPS.length - 1 && (
              <div
                className={`mx-2 mt-2.5 h-0.5 flex-1 rounded-full ${
                  i < activeIndex ? 'bg-primary' : 'bg-gray-200'
                }`}
              />
            )}
          </Fragment>
        );
      })}
    </div>
  );
}

// ============================================================================
// Main Page
// ============================================================================

export default function OrderStatusPage({loaderData}: Route.ComponentProps) {
  const {order} = loaderData;
  const {t, i18n} = useTranslation('common');
  const locale = i18n.language;

  const badge = getStatusBadge(order.displayFulfillmentStatus, t);

  const firstTracking = order.fulfillments[0]?.trackingInfo?.[0] ?? null;
  const trackingNumber = firstTracking?.number ?? null;
  const trackingUrl = firstTracking?.url ?? null;
  const carrier = firstTracking?.company ?? null;
  const hasTracking = trackingNumber || carrier;

  const total = new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: order.totalPriceSet.shopMoney.currencyCode,
  }).format(parseFloat(order.totalPriceSet.shopMoney.amount));

  const placedDate = new Date(order.processedAt).toLocaleDateString(locale, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <div className="mx-auto max-w-2xl px-4 py-12">
      {/* Back link */}
      <Link
        to="/order-tracking"
        className="mb-6 inline-flex items-center gap-1.5 text-sm text-text-muted hover:text-[#374151]"
      >
        <ArrowLeft size={14} />
        {t('orderStatus.backToTracking')}
      </Link>

      <div className="mt-6 flex flex-col gap-4">
        {/* Order header + timeline */}
        <Card className="overflow-hidden rounded-[12px] bg-white shadow-sm">
          <div className="border-b border-border bg-gradient-to-r from-[#f9fafb] to-white px-6 py-5">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="text-xl font-bold text-[#111827]">{order.name}</p>
                <p className="mt-0.5 text-sm text-text-muted">
                  {t('orderTracking.result.placedOn', {date: placedDate})}
                </p>
              </div>
              <div className="flex flex-col items-end gap-1.5">
                <span
                  className={`rounded-full px-3 py-1 text-xs font-semibold ${badge.className}`}
                >
                  {badge.label}
                </span>
                <span className="text-sm font-semibold text-[#111827]">
                  {total}
                </span>
              </div>
            </div>
          </div>

          <CardContent className="px-6 py-5">
            <OrderTimeline status={order.displayFulfillmentStatus} t={t} />
          </CardContent>
        </Card>

        {/* Tracking */}
        {hasTracking && (
          <Card className="rounded-[12px] bg-white shadow-sm">
            <CardContent className="flex flex-col gap-3 p-6">
              <p className="text-xs font-semibold uppercase tracking-wide text-text-muted">
                {t('orderStatus.trackingSection')}
              </p>
              <div className="flex items-center gap-2 text-sm text-[#374151]">
                <Truck size={14} className="shrink-0 text-text-muted" />
                <span>
                  {carrier && <span className="font-medium">{carrier}</span>}
                  {carrier && trackingNumber && (
                    <span className="text-text-muted"> · </span>
                  )}
                  {trackingNumber && <span>{trackingNumber}</span>}
                </span>
              </div>
              {trackingUrl && (
                <a
                  href={trackingUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex w-fit items-center gap-1.5 rounded-[6px] border border-secondary bg-secondary/5 px-3 py-2 text-sm font-medium text-secondary transition-colors hover:bg-secondary/10"
                >
                  <ExternalLink size={13} />
                  {t('orderStatus.trackOnCarrier', {
                    carrier: carrier ?? 'carrier',
                  })}
                </a>
              )}
            </CardContent>
          </Card>
        )}

        {/* Items */}
        {order.lineItems.nodes.length > 0 && (
          <Card className="rounded-[12px] bg-white shadow-sm">
            <CardContent className="flex flex-col gap-4 p-6">
              <p className="text-xs font-semibold uppercase tracking-wide text-text-muted">
                {t('orderStatus.itemsSection')}
              </p>
              <div className="flex flex-col gap-4">
                {order.lineItems.nodes.map((item, idx) => (
                  <div key={idx} className="flex items-center gap-3">
                    {item.image ? (
                      <Image
                        data={item.image}
                        width={56}
                        height={56}
                        className="size-14 shrink-0 rounded-[8px] object-cover"
                        alt={item.image.altText ?? item.title}
                      />
                    ) : (
                      <div className="flex size-14 shrink-0 items-center justify-center rounded-[8px] bg-[#f3f4f6]">
                        <ImageIcon size={22} className="text-[#9ca3af]" />
                      </div>
                    )}
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-[#111827]">
                        {item.title}
                      </p>
                      <p className="text-xs text-text-muted">
                        {t('orderTracking.result.qty', {qty: item.quantity})}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Shipping address */}
        {order.shippingAddress && (
          <Card className="rounded-[12px] bg-white shadow-sm">
            <CardContent className="flex flex-col gap-3 p-6">
              <p className="text-xs font-semibold uppercase tracking-wide text-text-muted">
                {t('orderStatus.shippingSection')}
              </p>
              <div className="flex items-start gap-2 text-sm text-[#374151]">
                <MapPin size={14} className="mt-0.5 shrink-0 text-text-muted" />
                <div className="flex flex-col gap-0.5">
                  <span className="font-medium">
                    {order.shippingAddress.name}
                  </span>
                  <span>{order.shippingAddress.address1}</span>
                  <span>
                    {[
                      order.shippingAddress.city,
                      order.shippingAddress.province,
                      order.shippingAddress.zip,
                    ]
                      .filter(Boolean)
                      .join(', ')}
                  </span>
                  <span>{order.shippingAddress.country}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Help footer */}
        <p className="text-center text-sm text-text-muted">
          {t('orderStatus.needHelp')}{' '}
          <Link to="/contact" className="text-secondary hover:underline">
            {t('orderStatus.contactUs')}
          </Link>
        </p>
      </div>
    </div>
  );
}
