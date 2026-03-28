import {useState, useMemo} from 'react';
import type {Route} from './+types/account.orders.$id_.return_.resolve';
import {redirect, Link} from 'react-router';
import {getSeoMeta} from '@shopify/hydrogen';
import {
  ArrowLeftRight,
  RefreshCw,
  CreditCard,
  Smile,
  CheckCircle2,
  Mail,
} from 'lucide-react';
import {isCustomerLoggedIn, getCustomerAccessToken} from '~/lib/customer-auth';
import {ReturnStepProgress} from '~/components/account/ReturnStepProgress';
import {
  ResolutionOptionCard,
  type ResolutionOption,
} from '~/components/account/ResolutionOptionCard';
import {SelectedItemsPreview} from '~/components/account/SelectedItemsPreview';
import {ResolutionSummary} from '~/components/account/ResolutionSummary';
import {OurPromiseNotice} from '~/components/account/OurPromiseNotice';
import type {ReturnLineItem} from '~/components/account/ReturnItemCard';

// ============================================================================
// Route Meta
// ============================================================================

export function meta({data}: Route.MetaArgs) {
  const orderName = data?.orderName ?? 'Order';
  return getSeoMeta({
    title: `Make It Right — ${orderName}`,
    description: `Choose a resolution for your return — order ${orderName}.`,
  });
}

// ============================================================================
// Constants
// ============================================================================

const RESOLUTION_OPTIONS: ResolutionOption[] = [
  {
    id: 'exchange',
    icon: ArrowLeftRight,
    title: 'Exchange',
    description: 'Swap for a different color, size, or variant',
  },
  {
    id: 'replace',
    icon: RefreshCw,
    title: 'Replace',
    description: 'Get the exact same item sent again',
  },
  {
    id: 'store-credit',
    icon: CreditCard,
    title: 'Store Credit',
    description: 'Instant credit to your Hylee account',
  },
  {
    id: 'refund',
    icon: Smile,
    title: 'Refund',
    description: 'Money back to original payment method',
  },
];

const SHIPPING_COSTS: Record<
  string,
  {amount: number; label: string; free: boolean}
> = {
  'drop-off': {amount: 0, label: 'Free', free: true},
  pickup: {amount: 0, label: 'Free', free: true},
  instant: {amount: 4.99, label: '$4.99', free: false},
};

// ============================================================================
// GraphQL Query (same as Steps 1-3)
// ============================================================================

const CUSTOMER_ORDER_RETURN_QUERY = `#graphql
  query CustomerOrderReturn($customerAccessToken: String!, $first: Int!) {
    customer(customerAccessToken: $customerAccessToken) {
      orders(first: $first, sortKey: PROCESSED_AT, reverse: true) {
        nodes {
          id
          name
          processedAt
          fulfillmentStatus
          lineItems(first: 50) {
            nodes {
              title
              quantity
              variant {
                id
                image {
                  url
                  altText
                  width
                  height
                }
                title
                price {
                  amount
                  currencyCode
                }
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

export async function loader({context, params, request}: Route.LoaderArgs) {
  if (!isCustomerLoggedIn(context.session)) {
    return redirect('/account/login');
  }

  const url = new URL(request.url);
  const itemsParam = url.searchParams.get('items');

  // If no items param, redirect back to Step 1
  if (!itemsParam) {
    return redirect(`/account/orders/${params.id}/return`);
  }

  const selectedItemIds = new Set(
    itemsParam.split(',').filter((id) => id.trim()),
  );

  if (selectedItemIds.size === 0) {
    return redirect(`/account/orders/${params.id}/return`);
  }

  const token = getCustomerAccessToken(context.session)!;
  const targetGid = `gid://shopify/Order/${params.id}`;

  const data = await context.storefront.query(CUSTOMER_ORDER_RETURN_QUERY, {
    variables: {customerAccessToken: token, first: 250},
  });

  const allOrders = (data as any).customer?.orders?.nodes ?? [];
  const order = allOrders.find(
    (o: any) => o.id === targetGid || o.id.startsWith(targetGid + '?'),
  );
  if (!order) {
    throw new Response('Order not found', {status: 404});
  }

  // Build line items and filter to only selected ones
  const allLineItems: ReturnLineItem[] = (order.lineItems?.nodes ?? []).map(
    (item: any, idx: number) => {
      const variantTitle =
        item.variant?.title && item.variant.title !== 'Default Title'
          ? item.variant.title
          : null;

      return {
        id: item.variant?.id ?? `item-${idx}`,
        title: item.title,
        variantTitle,
        quantity: item.quantity,
        price: item.variant?.price ?? {amount: '0', currencyCode: 'USD'},
        image: item.variant?.image ?? null,
        eligible: true,
      } satisfies ReturnLineItem;
    },
  );

  // Filter to only selected items
  const lineItems = allLineItems.filter((item) => selectedItemIds.has(item.id));

  if (lineItems.length === 0) {
    return redirect(`/account/orders/${params.id}/return`);
  }

  // Calculate subtotal
  const subtotal = lineItems.reduce(
    (sum, item) => sum + parseFloat(item.price.amount) * item.quantity,
    0,
  );

  // Determine shipping cost from URL param
  const shippingParam = url.searchParams.get('shipping') ?? 'drop-off';
  const shipping = SHIPPING_COSTS[shippingParam] ?? SHIPPING_COSTS['drop-off'];
  const totalValue = subtotal - shipping.amount;

  const reasonsParam = url.searchParams.get('reasons') ?? '';

  return {
    orderId: params.id,
    orderName: order.name as string,
    lineItems,
    itemCount: lineItems.length,
    subtotal,
    shippingPrice: shipping.label,
    shippingFree: shipping.free,
    totalValue,
    currencyCode: lineItems[0]?.price.currencyCode ?? 'USD',
    itemsParam,
    reasonsParam,
    shippingParam,
  };
}

// ============================================================================
// Helpers
// ============================================================================

function formatMoney(amount: number, currencyCode: string = 'USD'): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currencyCode,
  }).format(amount);
}

// ============================================================================
// Main Component
// ============================================================================

export default function ReturnResolvePage({loaderData}: Route.ComponentProps) {
  const {
    orderId,
    orderName,
    lineItems,
    itemCount,
    subtotal,
    shippingPrice,
    shippingFree,
    totalValue,
    currencyCode,
    itemsParam,
    reasonsParam,
    shippingParam,
  } = loaderData;

  // Resolution selection state — no pre-selection
  const [selectedResolution, setSelectedResolution] = useState<string | null>(
    null,
  );
  const [submitted, setSubmitted] = useState(false);

  const canSubmit = selectedResolution !== null;

  // Build preview items for thumbnails
  const previewItems = useMemo(
    () =>
      lineItems.map((item) => ({
        id: item.id,
        title: item.title,
        image: item.image,
      })),
    [lineItems],
  );

  const formattedTotalValue = formatMoney(subtotal, currencyCode);

  // Build back URL preserving all accumulated state
  const backUrl = `/account/orders/${orderId}/return/shipping?items=${encodeURIComponent(itemsParam)}${reasonsParam ? `&reasons=${encodeURIComponent(reasonsParam)}` : ''}&shipping=${encodeURIComponent(shippingParam)}`;

  // Build step URLs for progress bar navigation
  const stepUrls = [
    `/account/orders/${orderId}/return?items=${encodeURIComponent(itemsParam)}${reasonsParam ? `&reasons=${encodeURIComponent(reasonsParam)}` : ''}${shippingParam ? `&shipping=${encodeURIComponent(shippingParam)}` : ''}`,
    `/account/orders/${orderId}/return/reason?items=${encodeURIComponent(itemsParam)}${reasonsParam ? `&reasons=${encodeURIComponent(reasonsParam)}` : ''}${shippingParam ? `&shipping=${encodeURIComponent(shippingParam)}` : ''}`,
    `/account/orders/${orderId}/return/shipping?items=${encodeURIComponent(itemsParam)}${reasonsParam ? `&reasons=${encodeURIComponent(reasonsParam)}` : ''}${shippingParam ? `&shipping=${encodeURIComponent(shippingParam)}` : ''}`,
    `/account/orders/${orderId}/return/resolve?items=${encodeURIComponent(itemsParam)}${reasonsParam ? `&reasons=${encodeURIComponent(reasonsParam)}` : ''}${shippingParam ? `&shipping=${encodeURIComponent(shippingParam)}` : ''}`,
  ];

  const selectedOption = RESOLUTION_OPTIONS.find(
    (o) => o.id === selectedResolution,
  );

  const handleSubmit = () => {
    if (!canSubmit) return;
    setSubmitted(true);
    window.scrollTo({top: 0, behavior: 'smooth'});
  };

  // ── Confirmation View ──────────────────────────────────────────────────
  if (submitted && selectedOption) {
    const ResolutionIcon = selectedOption.icon;
    return (
      <div className="flex min-h-[calc(100vh-200px)] flex-col">
        <div
          className="mx-auto flex w-full max-w-[900px] flex-1 flex-col gap-[8px] px-[24px] pb-16 pt-[32px]"
          data-testid="return-confirmation"
        >
          {/* Title */}
          <h1 className="text-center text-[32px] font-light leading-[48px] text-[#1f2937]">
            Return Request Submitted
          </h1>

          {/* Subtitle */}
          <p className="text-center text-[16px] font-normal leading-[24px] text-[#4b5563]">
            We&apos;ve received your request and will review it shortly
          </p>

          {/* Confirmation Card */}
          <div className="mt-[16px] overflow-clip rounded-[12px] border border-[#e5e7eb] bg-white shadow-[0px_1px_2px_0px_rgba(0,0,0,0.05)]">
            <div className="flex flex-col items-center gap-[24px] px-[24px] pb-[48px] pt-[40px]">
              {/* Success Icon */}
              <div className="flex size-[80px] items-center justify-center rounded-full bg-[rgba(42,200,100,0.1)]">
                <CheckCircle2 size={40} className="text-primary" />
              </div>

              {/* Order Reference */}
              <div className="text-center">
                <p className="text-[14px] font-medium leading-[21px] text-[#4b5563]">
                  Order {orderName}
                </p>
                <p className="mt-[4px] text-[14px] font-normal leading-[21px] text-[#9ca3af]">
                  {itemCount} {itemCount === 1 ? 'item' : 'items'} &bull;{' '}
                  {formatMoney(totalValue, currencyCode)}
                </p>
              </div>

              {/* Resolution Chosen */}
              <div className="flex items-center gap-[12px] rounded-[12px] bg-[rgba(38,153,166,0.05)] px-[24px] py-[16px]">
                <div className="flex size-[48px] items-center justify-center rounded-full bg-[rgba(79,209,168,0.15)]">
                  <ResolutionIcon size={24} className="text-return-accent" />
                </div>
                <div>
                  <p className="text-[16px] font-semibold leading-[24px] text-[#111827]">
                    {selectedOption.title}
                  </p>
                  <p className="text-[13px] font-normal leading-[19.5px] text-[#4b5563]">
                    {selectedOption.description}
                  </p>
                </div>
              </div>

              {/* Divider */}
              <div className="w-full border-t border-[#e5e7eb]" />

              {/* Email Notice */}
              <div className="flex items-start gap-[12px]">
                <Mail
                  size={20}
                  className="mt-[2px] shrink-0 text-return-accent"
                />
                <p className="text-[14px] font-normal leading-[22.4px] text-[#4b5563]">
                  We&apos;ll send you an email once your return has been
                  reviewed. You can track the status of your return from your
                  orders page at any time.
                </p>
              </div>
            </div>
          </div>

          {/* Back to Orders Button */}
          <div className="flex justify-center pt-[16px]">
            <Link
              to="/account/orders"
              reloadDocument
              className="flex items-center justify-center rounded-[8px] bg-return-accent px-[32px] py-[13px] text-[15px] font-medium leading-normal text-white transition-opacity hover:opacity-90"
              data-testid="return-back-to-orders-btn"
            >
              Back to My Orders
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // ── Form View ──────────────────────────────────────────────────────────
  return (
    <div className="flex min-h-[calc(100vh-200px)] flex-col">
      {/* Scrollable Content */}
      <div className="mx-auto flex w-full max-w-[900px] flex-1 flex-col gap-[8px] px-[24px] pb-16 pt-[32px]">
        {/* Title */}
        <h1 className="text-center text-[32px] font-light leading-[48px] text-[#1f2937]">
          Make It Right
        </h1>

        {/* Subtitle */}
        <p className="text-center text-[16px] font-normal leading-[24px] text-[#4b5563]">
          How would you like us to resolve this?
        </p>

        {/* Step Progress */}
        <ReturnStepProgress currentStep={4} stepUrls={stepUrls} />

        {/* Main Card */}
        <div className="overflow-clip rounded-[12px] border border-[#e5e7eb] bg-white shadow-[0px_1px_2px_0px_rgba(0,0,0,0.05)]">
          {/* Card Header */}
          <div className="border-b border-[#e5e7eb] px-[24px] pb-[21px] pt-[20px]">
            <h2 className="text-[18px] font-bold leading-[27px] text-[#111827]">
              Choose Your Resolution
            </h2>
          </div>

          {/* Card Body */}
          <div className="flex flex-col gap-[16px] px-[24px] pb-[48px] pt-[24px]">
            {/* Selected Items Preview */}
            <SelectedItemsPreview
              items={previewItems}
              totalValue={formattedTotalValue}
            />

            {/* Resolution Options Grid */}
            <div
              className="grid grid-cols-2 gap-[16px]"
              data-testid="resolution-grid"
            >
              {RESOLUTION_OPTIONS.map((option) => (
                <ResolutionOptionCard
                  key={option.id}
                  option={option}
                  selected={selectedResolution === option.id}
                  onSelect={() => setSelectedResolution(option.id)}
                />
              ))}
            </div>

            {/* Summary Section (inside card) */}
            <ResolutionSummary
              itemCount={itemCount}
              subtotal={subtotal}
              shippingPrice={shippingPrice}
              shippingFree={shippingFree}
              totalValue={totalValue}
              currencyCode={currencyCode}
            />
          </div>
        </div>

        {/* Our Promise Notice */}
        <OurPromiseNotice />

        {/* Action Buttons (inline, not sticky) */}
        <div className="flex gap-[12px] pt-[16px]">
          <Link
            to={backUrl}
            reloadDocument
            className="flex flex-[35] items-center justify-center rounded-[8px] border border-[#d1d5db] bg-white px-[25px] py-[13px] text-[15px] font-medium leading-normal text-[#374151] transition-colors hover:bg-[#f9fafb]"
            data-testid="return-cancel-btn"
          >
            Cancel
          </Link>
          <button
            type="button"
            disabled={!canSubmit}
            onClick={handleSubmit}
            className={`flex flex-[65] items-center justify-center rounded-[8px] bg-return-accent px-[24px] py-[13px] text-[15px] font-medium leading-normal text-white transition-opacity ${
              canSubmit ? 'hover:opacity-90' : 'cursor-not-allowed opacity-50'
            }`}
            data-testid="return-submit-btn"
          >
            Submit Return
          </button>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// HydrateFallback
// ============================================================================

export function HydrateFallback() {
  return (
    <div className="mx-auto flex w-full max-w-[900px] flex-col gap-4 px-6 py-8">
      {/* Title skeleton */}
      <div className="mx-auto h-[48px] w-[300px] animate-pulse rounded bg-gray-200" />
      <div className="mx-auto h-[24px] w-[400px] animate-pulse rounded bg-gray-200" />

      {/* Steps skeleton */}
      <div className="flex items-center justify-center gap-4 py-6">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="flex items-center gap-4">
            <div className="size-[48px] animate-pulse rounded-full bg-gray-200" />
            {i < 4 && (
              <div className="h-[2px] w-[60px] animate-pulse bg-gray-200" />
            )}
          </div>
        ))}
      </div>

      {/* Card skeleton */}
      <div className="animate-pulse rounded-[12px] bg-gray-200 p-6">
        <div className="mb-4 h-[27px] w-[250px] rounded bg-gray-300" />
        <div className="mb-4 flex gap-3">
          <div className="size-[50px] rounded-[8px] bg-gray-300" />
          <div className="size-[50px] rounded-[8px] bg-gray-300" />
        </div>
        <div className="grid grid-cols-2 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-[171.5px] rounded-[12px] bg-gray-300" />
          ))}
        </div>
      </div>

      {/* Notice skeleton */}
      <div className="h-[116px] animate-pulse rounded-[12px] bg-gray-200" />
    </div>
  );
}
