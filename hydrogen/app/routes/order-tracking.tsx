import type {Route} from './+types/order-tracking';
import {Form, Link, useNavigation} from 'react-router';
import {getSeoMeta, Image} from '@shopify/hydrogen';
import {useTranslation} from 'react-i18next';
import {
  Search,
  Package,
  Loader2,
  AlertCircle,
  CheckCircle2,
  Truck,
  MapPin,
  ExternalLink,
  ArrowLeft,
  ImageIcon,
} from 'lucide-react';
import {
  getOrderByEmailAndNumber,
  type AdminOrderDetail,
  type AdminEnv,
} from '~/lib/admin-api';
import {Card, CardHeader, CardTitle, CardContent} from '~/components/ui/card';
import {Button} from '~/components/ui/button';
import {Input} from '~/components/ui/input';
import {Label} from '~/components/ui/label';

// ============================================================================
// Route Meta
// ============================================================================

export function meta() {
  return getSeoMeta({
    title: 'Track Your Order — Hy-lee',
    description:
      'Track the status of your order by entering your email and order number.',
  });
}

// ============================================================================
// Loader
// ============================================================================

export async function loader() {
  return {};
}

// ============================================================================
// Action
// ============================================================================

export async function action({request, context}: Route.ActionArgs) {
  const formData = await request.formData();
  const email = (formData.get('email') as string | null)?.trim().toLowerCase();
  const rawNumber = (formData.get('orderNumber') as string | null)?.trim();

  if (!email || !rawNumber) {
    return {error: 'missing_fields' as const};
  }

  const orderNumber = rawNumber.replace(/^#/, '');
  const isDev =
    (context.env as Record<string, string>).NODE_ENV !== 'production';

  try {
    const order = await getOrderByEmailAndNumber(
      context.env as unknown as AdminEnv,
      email,
      orderNumber,
    );

    if (!order) {
      // API succeeded but no matching order — likely wrong email, wrong order number,
      // or the store has a custom order ID prefix (e.g. #HY-1005 instead of #1005).
      console.warn(
        `[order-tracking] No order found for email="${email}" orderNumber="${orderNumber}". ` +
          `Check: (1) email matches the checkout email exactly, ` +
          `(2) Shopify Admin → Settings → General → Order ID format — if a prefix is set ` +
          `(e.g. "HY-") the order name is #HY-${orderNumber}, not #${orderNumber}.`,
      );
      return {error: 'not_found' as const};
    }

    return {order, email, orderNumber: rawNumber};
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error('[order-tracking] Admin API error:', message);
    // Return api_error (distinct from not_found) so the UI can show a different message.
    // In dev, include the raw error so it's visible via React DevTools / network tab.
    return {
      error: 'api_error' as const,
      ...(isDev ? {detail: message} : {}),
    };
  }
}

// ============================================================================
// Status badge helpers
// ============================================================================

function getStatusLabel(
  status: string,
  t: (key: string) => string,
): {label: string; className: string} {
  switch (status) {
    case 'FULFILLED':
      return {
        label: t('orderTracking.result.statusDelivered'),
        className: 'bg-primary/10 text-primary',
      };
    case 'IN_PROGRESS':
    case 'PARTIALLY_FULFILLED':
      return {
        label: t('orderTracking.result.statusShipped'),
        className: 'bg-secondary/10 text-secondary',
      };
    case 'CANCELLED':
      return {
        label: t('orderTracking.result.statusCancelled'),
        className: 'bg-red-50 text-red-600',
      };
    default:
      return {
        label: t('orderTracking.result.statusProcessing'),
        className: 'bg-gray-100 text-gray-600',
      };
  }
}

// ============================================================================
// OrderResultCard component
// ============================================================================

function OrderResultCard({
  order,
  email,
  orderNumber,
}: {
  order: AdminOrderDetail;
  email: string;
  orderNumber: string;
}) {
  const {t, i18n} = useTranslation('common');
  const locale = i18n.language;

  const statusInfo = getStatusLabel(order.displayFulfillmentStatus, t);
  const firstTracking = order.fulfillments[0]?.trackingInfo?.[0] ?? null;
  const trackingNumber = firstTracking?.number ?? null;
  const trackingUrl = firstTracking?.url ?? null;
  const carrier = firstTracking?.company ?? null;

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
    <div className="w-full max-w-lg">
      <Card className="overflow-hidden rounded-[12px] bg-white shadow-sm">
        {/* Header */}
        <div className="border-b border-border bg-gradient-to-r from-[#f9fafb] to-white px-6 py-5">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <CheckCircle2 size={20} className="shrink-0 text-primary" />
              <div>
                <p className="text-lg font-bold text-[#111827]">
                  {t('orderTracking.result.orderNumber', {
                    number: order.name,
                  })}
                </p>
                <p className="text-sm text-text-muted">
                  {t('orderTracking.result.placedOn', {date: placedDate})}
                </p>
              </div>
            </div>
            <div className="flex flex-col items-end gap-1">
              <span
                className={`rounded-full px-3 py-1 text-xs font-semibold ${statusInfo.className}`}
              >
                {statusInfo.label}
              </span>
              <span className="text-sm font-medium text-[#111827]">
                {total}
              </span>
            </div>
          </div>
        </div>

        <CardContent className="flex flex-col gap-5 p-6">
          {/* Items */}
          {order.lineItems.nodes.length > 0 && (
            <div className="flex flex-col gap-3">
              <p className="text-xs font-semibold uppercase tracking-wide text-text-muted">
                {t('orderTracking.result.items')}
              </p>
              <div className="flex flex-col gap-3">
                {order.lineItems.nodes.map((item, idx) => (
                  <div key={idx} className="flex items-center gap-3">
                    {item.image ? (
                      <Image
                        data={item.image}
                        width={48}
                        height={48}
                        className="size-12 shrink-0 rounded-[6px] object-cover"
                        alt={item.image.altText ?? item.title}
                      />
                    ) : (
                      <div className="flex size-12 shrink-0 items-center justify-center rounded-[6px] bg-[#f3f4f6]">
                        <ImageIcon size={20} className="text-[#9ca3af]" />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
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
            </div>
          )}

          {/* Shipping address */}
          {order.shippingAddress && (
            <div className="flex flex-col gap-2">
              <p className="text-xs font-semibold uppercase tracking-wide text-text-muted">
                {t('orderTracking.result.shippingTo')}
              </p>
              <div className="flex items-start gap-2 text-sm text-[#374151]">
                <MapPin size={14} className="mt-0.5 shrink-0 text-text-muted" />
                <span>
                  {[
                    order.shippingAddress.name,
                    order.shippingAddress.address1,
                    order.shippingAddress.city,
                    order.shippingAddress.province,
                    order.shippingAddress.country,
                  ]
                    .filter(Boolean)
                    .join(', ')}
                </span>
              </div>
            </div>
          )}

          {/* Tracking */}
          {(trackingNumber || carrier) && (
            <div className="flex flex-col gap-2">
              <p className="text-xs font-semibold uppercase tracking-wide text-text-muted">
                {t('orderTracking.result.trackingLabel')}
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
                  {t('orderTracking.result.trackOnCarrier', {
                    carrier: carrier ?? 'carrier',
                  })}
                </a>
              )}
            </div>
          )}

          {/* Divider + status page link */}
          <div className="border-t border-border pt-4">
            <Link
              to={`/order-status?email=${encodeURIComponent(email)}&number=${encodeURIComponent(orderNumber)}`}
              className="text-sm text-secondary hover:underline"
            >
              {t('orderTracking.result.viewStatusPage')} →
            </Link>
          </div>
        </CardContent>
      </Card>

      {/* Search another */}
      <div className="mt-4 flex justify-center">
        <Link
          to="/order-tracking"
          className="inline-flex items-center gap-1.5 text-sm text-text-muted hover:text-[#374151]"
        >
          <ArrowLeft size={14} />
          {t('orderTracking.result.searchAnother')}
        </Link>
      </div>
    </div>
  );
}

// ============================================================================
// SearchForm component
// ============================================================================

function SearchForm({error, detail}: {error?: string; detail?: string}) {
  const {t} = useTranslation('common');
  const navigation = useNavigation();
  const isSubmitting = navigation.state === 'submitting';

  return (
    <Card className="w-full max-w-md">
      <CardHeader className="text-center">
        <div className="mx-auto mb-4 flex size-14 items-center justify-center rounded-full bg-secondary/10">
          <Package size={28} className="text-secondary" />
        </div>
        <CardTitle className="text-2xl">{t('orderTracking.heading')}</CardTitle>
        <p className="mt-1 text-sm text-text-muted">
          {t('orderTracking.subheading')}
        </p>
      </CardHeader>

      <CardContent>
        <Form method="post" className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="email">{t('orderTracking.emailLabel')}</Label>
            <Input
              id="email"
              name="email"
              type="email"
              required
              autoComplete="email"
              placeholder={t('orderTracking.emailPlaceholder')}
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="orderNumber">
              {t('orderTracking.orderNumberLabel')}
            </Label>
            <Input
              id="orderNumber"
              name="orderNumber"
              type="text"
              required
              placeholder={t('orderTracking.orderNumberPlaceholder')}
            />
            <p className="text-xs text-text-muted">
              {t('orderTracking.orderNumberHint')}
            </p>
          </div>

          {error && (
            <div className="flex flex-col gap-1.5 rounded-lg border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">
              <div className="flex items-start gap-2">
                <AlertCircle size={16} className="mt-0.5 shrink-0" />
                <span>
                  {error === 'missing_fields'
                    ? t('orderTracking.errorMissingFields')
                    : error === 'api_error'
                      ? t('orderTracking.errorApiError')
                      : t('orderTracking.errorNotFound')}
                </span>
              </div>
              {detail && (
                <pre className="mt-1 overflow-x-auto whitespace-pre-wrap break-all rounded bg-destructive/10 p-2 text-xs">
                  {detail}
                </pre>
              )}
            </div>
          )}

          <Button
            type="submit"
            disabled={isSubmitting}
            className="mt-2 w-full gap-2"
          >
            {isSubmitting ? (
              <Loader2 size={16} className="animate-spin" />
            ) : (
              <Search size={16} />
            )}
            {isSubmitting
              ? t('orderTracking.submitting')
              : t('orderTracking.submit')}
          </Button>
        </Form>
      </CardContent>
    </Card>
  );
}

// ============================================================================
// Main Page
// ============================================================================

export default function OrderTrackingPage({actionData}: Route.ComponentProps) {
  const hasResult = actionData && 'order' in actionData && actionData.order;
  const error =
    actionData && 'error' in actionData ? actionData.error : undefined;
  const detail =
    actionData && 'detail' in actionData
      ? (actionData.detail as string)
      : undefined;

  return (
    <div className="flex min-h-[60vh] items-center justify-center px-4 py-16">
      {hasResult ? (
        <OrderResultCard
          order={
            (
              actionData as {
                order: AdminOrderDetail;
                email: string;
                orderNumber: string;
              }
            ).order
          }
          email={(actionData as {email: string}).email}
          orderNumber={(actionData as {orderNumber: string}).orderNumber}
        />
      ) : (
        <SearchForm error={error} detail={detail} />
      )}
    </div>
  );
}

// ============================================================================
// Loading Skeleton
// ============================================================================

export function HydrateFallback() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center px-4 py-16">
      <div className="w-full max-w-md overflow-hidden rounded-xl border border-border bg-white shadow-sm">
        <div className="flex flex-col items-center gap-4 p-8">
          <div className="size-14 animate-pulse rounded-full bg-gray-200" />
          <div className="h-7 w-48 animate-pulse rounded bg-gray-200" />
          <div className="h-4 w-64 animate-pulse rounded bg-gray-100" />
        </div>
        <div className="flex flex-col gap-4 px-8 pb-8">
          <div className="h-10 animate-pulse rounded bg-gray-100" />
          <div className="h-10 animate-pulse rounded bg-gray-100" />
          <div className="h-10 animate-pulse rounded-lg bg-gray-200" />
        </div>
      </div>
    </div>
  );
}
