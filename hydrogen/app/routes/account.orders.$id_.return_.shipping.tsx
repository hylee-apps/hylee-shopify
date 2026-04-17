import {useState, useMemo} from 'react';
import type {Route} from './+types/account.orders.$id_.return_.shipping';
import {redirect, Link} from 'react-router';
import {getSeoMeta} from '@shopify/hydrogen';
import {useTranslation} from 'react-i18next';
import {Package, Truck, Zap} from 'lucide-react';
import {isCustomerLoggedIn, getCustomerAccessToken} from '~/lib/customer-auth';
import {ReturnStepProgress} from '~/components/account/ReturnStepProgress';
import {
  ShippingOptionCard,
  type ShippingOption,
} from '~/components/account/ShippingOptionCard';
import {ReturnAddressCard} from '~/components/account/ReturnAddressCard';
import {PackingInstructions} from '~/components/account/PackingInstructions';
import {ReturnShippingSummary} from '~/components/account/ReturnShippingSummary';
import {ReturnTrackingNotice} from '~/components/account/ReturnTrackingNotice';
import type {ReturnLineItem} from '~/components/account/ReturnItemCard';

// ============================================================================
// Route Meta
// ============================================================================

export function meta({data}: Route.MetaArgs) {
  const orderName = data?.orderName ?? 'Order';
  return getSeoMeta({
    title: `Return Shipping — ${orderName}`,
    description: `Choose return shipping for order ${orderName}.`,
  });
}

// ============================================================================
// Constants
// ============================================================================

// Static (non-translatable) parts of each shipping option.
// Title, price label, description, and features are derived from i18n in the component.
const SHIPPING_OPTIONS_BASE = [
  {
    id: 'drop-off' as const,
    icon: Package,
    priceFree: true,
    priceAmount: 0,
    rawPrice: '$0.00',
    showQrPreview: true,
  },
  {
    id: 'pickup' as const,
    icon: Truck,
    priceFree: true,
    priceAmount: 0,
    rawPrice: '$0.00',
  },
  {
    id: 'instant' as const,
    icon: Zap,
    priceFree: false,
    priceAmount: 4.99,
    rawPrice: '$4.99',
  },
];

// ============================================================================
// GraphQL Query (same as Steps 1-2)
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

  // Determine delivery date (use processedAt + simulated delivery offset)
  const processedDate = new Date(order.processedAt);
  const deliveredDate = new Date(processedDate);
  deliveredDate.setDate(deliveredDate.getDate() + 5);

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

  // Generate return ID from order name
  const orderName = order.name as string;
  const orderSuffix = orderName.replace(/^#?HY-?/i, '');
  const returnId = `RET-${orderSuffix}`;

  // Calculate total refund (items + 8% simulated tax)
  const itemSubtotal = lineItems.reduce(
    (sum, item) => sum + parseFloat(item.price.amount) * item.quantity,
    0,
  );
  const taxRate = 0.08;
  const taxRefund = itemSubtotal * taxRate;
  const totalRefund = itemSubtotal + taxRefund;

  const reasonsParam = url.searchParams.get('reasons') ?? '';
  const shippingParam = url.searchParams.get('shipping') ?? '';

  return {
    orderId: params.id,
    orderName,
    deliveredDate: deliveredDate.toISOString(),
    lineItems,
    returnId,
    itemCount: lineItems.length,
    totalRefund,
    currencyCode: lineItems[0]?.price.currencyCode ?? 'USD',
    itemsParam,
    reasonsParam,
    shippingParam,
  };
}

// ============================================================================
// Main Component
// ============================================================================

export default function ReturnShippingPage({loaderData}: Route.ComponentProps) {
  const {
    orderId,
    orderName,
    returnId,
    itemCount,
    totalRefund,
    currencyCode,
    itemsParam,
    reasonsParam,
    shippingParam,
  } = loaderData;

  const {t} = useTranslation();

  // Build translated shipping options from base config
  const shippingOptions: ShippingOption[] = useMemo(
    () =>
      SHIPPING_OPTIONS_BASE.map((opt) => ({
        ...opt,
        title: t(`returnShippingPage.options.${opt.id}.title`),
        price: opt.priceFree ? t('returnShippingPage.free') : opt.rawPrice,
        description: t(`returnShippingPage.options.${opt.id}.description`),
        features: [
          t(`returnShippingPage.options.${opt.id}.feature1`),
          t(`returnShippingPage.options.${opt.id}.feature2`),
          t(`returnShippingPage.options.${opt.id}.feature3`),
        ],
      })),
    [t],
  );

  // Shipping method selection — restore from URL if navigating back
  const [selectedMethod, setSelectedMethod] = useState<string>(() => {
    if (
      shippingParam &&
      SHIPPING_OPTIONS_BASE.some((o) => o.id === shippingParam)
    ) {
      return shippingParam;
    }
    return 'drop-off';
  });

  const selectedOption = useMemo(
    () => shippingOptions.find((o) => o.id === selectedMethod)!,
    [shippingOptions, selectedMethod],
  );

  const shippingCost = selectedOption.priceAmount;
  const adjustedRefund = totalRefund - shippingCost;

  // Build back URL preserving all accumulated state
  const backUrl = `/account/orders/${orderId}/return/reason?items=${encodeURIComponent(itemsParam)}${reasonsParam ? `&reasons=${encodeURIComponent(reasonsParam)}` : ''}&shipping=${encodeURIComponent(selectedMethod)}`;

  return (
    <div className="flex min-h-[calc(100vh-200px)] flex-col">
      {/* Scrollable Content */}
      <div className="mx-auto flex w-full max-w-screen-2xl flex-1 flex-col gap-[8px] px-4 pb-16 pt-6 lg:px-6 lg:pt-8">
        {/* Title */}
        <h1 className="text-center text-[32px] font-light leading-[48px] text-[#1f2937]">
          {t('returnShippingPage.title')}
        </h1>

        {/* Subtitle */}
        <p className="text-center text-[16px] font-normal leading-[24px] text-[#4b5563]">
          {t('returnShippingPage.subtitle')}
        </p>

        {/* Step Progress */}
        <ReturnStepProgress
          currentStep={3}
          stepUrls={[
            `/account/orders/${orderId}/return?items=${encodeURIComponent(itemsParam)}${reasonsParam ? `&reasons=${encodeURIComponent(reasonsParam)}` : ''}${shippingParam ? `&shipping=${encodeURIComponent(shippingParam)}` : ''}`,
            `/account/orders/${orderId}/return/reason?items=${encodeURIComponent(itemsParam)}${reasonsParam ? `&reasons=${encodeURIComponent(reasonsParam)}` : ''}${shippingParam ? `&shipping=${encodeURIComponent(shippingParam)}` : ''}`,
            `/account/orders/${orderId}/return/shipping?items=${encodeURIComponent(itemsParam)}${reasonsParam ? `&reasons=${encodeURIComponent(reasonsParam)}` : ''}${shippingParam ? `&shipping=${encodeURIComponent(shippingParam)}` : ''}`,
          ]}
        />

        {/* Shipping Method Card */}
        <div className="overflow-clip rounded-[12px] border border-[#e5e7eb] bg-white shadow-[0px_1px_2px_0px_rgba(0,0,0,0.05)]">
          {/* Card Header */}
          <div className="border-b border-[#e5e7eb] px-[24px] pb-[21px] pt-[20px]">
            <h2 className="text-[18px] font-bold leading-[27px] text-[#111827]">
              {t('returnShippingPage.shippingMethodHeading')}
            </h2>
          </div>

          {/* Card Body */}
          <div className="flex flex-col gap-[24px] px-[24px] pb-[36px] pt-[24px]">
            {/* Shipping Options */}
            <div className="flex flex-col gap-[16px]">
              {shippingOptions.map((option) => (
                <ShippingOptionCard
                  key={option.id}
                  option={option}
                  selected={selectedMethod === option.id}
                  onSelect={() => setSelectedMethod(option.id)}
                />
              ))}
            </div>

            {/* Return Address */}
            <ReturnAddressCard returnId={returnId} />

            {/* Packing Instructions */}
            <PackingInstructions />
          </div>
        </div>

        {/* Summary Box */}
        <ReturnShippingSummary
          itemCount={itemCount}
          shippingPrice={selectedOption.price}
          shippingFree={selectedOption.priceFree}
          totalRefund={adjustedRefund}
          currencyCode={currencyCode}
        />

        {/* Return Tracking Notice */}
        <ReturnTrackingNotice />

        {/* Action Buttons (inline, not sticky) */}
        <div className="flex gap-[12px] pt-[16px]">
          <Link
            to={backUrl}
            reloadDocument
            className="flex flex-[35] items-center justify-center rounded-[8px] border border-[#d1d5db] bg-white px-[25px] py-[13px] text-[15px] font-medium leading-normal text-[#374151] transition-colors hover:bg-[#f9fafb]"
            data-testid="return-cancel-btn"
          >
            {t('returnShippingPage.cancel')}
          </Link>
          <button
            type="button"
            onClick={() => {
              window.location.href = `/account/orders/${orderId}/return/resolve?items=${encodeURIComponent(itemsParam)}${reasonsParam ? `&reasons=${encodeURIComponent(reasonsParam)}` : ''}&shipping=${encodeURIComponent(selectedMethod)}`;
            }}
            className="flex flex-[65] items-center justify-center rounded-[8px] bg-return-accent px-[24px] py-[13px] text-[15px] font-medium leading-normal text-white transition-opacity hover:opacity-90"
            data-testid="return-continue-btn"
          >
            {t('returnShippingPage.continue')}
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
    <div className="mx-auto flex w-full max-w-screen-2xl flex-col gap-4 px-4 py-6 lg:px-6 lg:py-8">
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
        <div className="mb-4 h-[27px] w-[180px] rounded bg-gray-300" />
        {[1, 2, 3].map((i) => (
          <div key={i} className="mb-4 h-[150px] rounded-[12px] bg-gray-300" />
        ))}
      </div>

      {/* Summary skeleton */}
      <div className="h-[156px] animate-pulse rounded-[12px] bg-gray-200" />

      {/* Notice skeleton */}
      <div className="h-[116px] animate-pulse rounded-[12px] bg-gray-200" />
    </div>
  );
}
