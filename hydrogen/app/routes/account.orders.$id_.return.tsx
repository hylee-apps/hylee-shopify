import {useState, useCallback, useMemo} from 'react';
import type {Route} from './+types/account.orders.$id_.return';
import {redirect, Link} from 'react-router';
import {useTranslation} from 'react-i18next';
import {getSeoMeta} from '@shopify/hydrogen';
import {isCustomerLoggedIn, getCustomerAccessToken} from '~/lib/customer-auth';
import {ReturnStepProgress} from '~/components/account/ReturnStepProgress';
import {ReturnSelectionSummary} from '~/components/account/ReturnSelectionSummary';
import {ReturnItemCard} from '~/components/account/ReturnItemCard';
import type {ReturnLineItem} from '~/components/account/ReturnItemCard';
import {ReturnPolicyNotice} from '~/components/account/ReturnPolicyNotice';

// ============================================================================
// Route Meta
// ============================================================================

export function meta({data}: Route.MetaArgs) {
  const orderName = data?.orderName ?? 'Order';
  return getSeoMeta({
    title: `Start a Return — ${orderName}`,
    description: `Start a return for order ${orderName}.`,
  });
}

// ============================================================================
// GraphQL Query
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

  // Read accumulated state from URL (carried when navigating back from later steps)
  const url = new URL(request.url);
  const savedItemsParam = url.searchParams.get('items') ?? '';
  const savedReasonsParam = url.searchParams.get('reasons') ?? '';
  const savedShippingParam = url.searchParams.get('shipping') ?? '';

  const token = getCustomerAccessToken(context.session)!;
  const targetGid = `gid://shopify/Order/${params.id}`;

  const data = await context.storefront.query(CUSTOMER_ORDER_RETURN_QUERY, {
    variables: {customerAccessToken: token, first: 250},
  });

  const allOrders = (data as any).customer?.orders?.nodes ?? [];
  // Order IDs from customer() include a ?key= suffix — match on numeric ID
  const order = allOrders.find(
    (o: any) => o.id === targetGid || o.id.startsWith(targetGid + '?'),
  );
  if (!order) {
    throw new Response('Order not found', {status: 404});
  }

  // Determine delivery date (use processedAt + simulated delivery offset)
  const processedDate = new Date(order.processedAt);
  const deliveredDate = new Date(processedDate);
  deliveredDate.setDate(deliveredDate.getDate() + 5); // Simulate 5-day delivery

  // Build line items with return eligibility
  const returnWindowDays = 30;
  const now = new Date();
  const returnWindowEnd = new Date(deliveredDate);
  returnWindowEnd.setDate(returnWindowEnd.getDate() + returnWindowDays);
  const withinReturnWindow = now <= returnWindowEnd;

  const lineItems: ReturnLineItem[] = (order.lineItems?.nodes ?? []).map(
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
        eligible: withinReturnWindow,
        eligibilityReason: withinReturnWindow ? 'eligible' : 'window-closed',
      } satisfies ReturnLineItem;
    },
  );

  // Pre-selected item IDs from URL (when navigating back from later steps)
  const preselectedItemIds = savedItemsParam
    ? savedItemsParam.split(',').filter((id) => id.trim())
    : [];

  return {
    orderId: params.id,
    orderName: order.name as string,
    deliveredDate: deliveredDate.toISOString(),
    lineItems,
    preselectedItemIds,
    savedReasonsParam,
    savedShippingParam,
  };
}

// ============================================================================
// Helpers
// ============================================================================

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

function formatMoney(amount: number, currencyCode: string = 'USD'): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currencyCode,
  }).format(amount);
}

// ============================================================================
// Main Component
// ============================================================================

export default function ReturnSelectItemsPage({
  loaderData,
}: Route.ComponentProps) {
  const {t} = useTranslation();
  const {
    orderId,
    orderName,
    deliveredDate,
    lineItems,
    preselectedItemIds,
    savedReasonsParam,
    savedShippingParam,
  } = loaderData;

  // Selection state — restore from URL if navigating back from a later step
  const [selectedIds, setSelectedIds] = useState<Set<string>>(
    () => new Set(preselectedItemIds),
  );

  const eligibleItems = useMemo(
    () => lineItems.filter((item) => item.eligible),
    [lineItems],
  );

  const allSelected =
    eligibleItems.length > 0 &&
    eligibleItems.every((item) => selectedIds.has(item.id));

  const toggleItem = useCallback((id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }, []);

  const handleSelectAll = useCallback(() => {
    if (allSelected) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(eligibleItems.map((item) => item.id)));
    }
  }, [allSelected, eligibleItems]);

  // Calculate estimated refund
  const estimatedRefund = useMemo(() => {
    let total = 0;
    let currency = 'USD';
    for (const item of lineItems) {
      if (selectedIds.has(item.id)) {
        total += parseFloat(item.price.amount) * item.quantity;
        currency = item.price.currencyCode;
      }
    }
    return formatMoney(total, currency);
  }, [selectedIds, lineItems]);

  const hasSelection = selectedIds.size > 0;

  const handleContinue = useCallback(() => {
    if (!hasSelection) return;
    const itemsParam = Array.from(selectedIds).join(',');
    // Full-page navigation — React Router manifest doesn't resolve this route client-side
    let url = `/account/orders/${orderId}/return/reason?items=${encodeURIComponent(itemsParam)}`;
    // Carry forward saved state from later steps
    if (savedReasonsParam)
      url += `&reasons=${encodeURIComponent(savedReasonsParam)}`;
    if (savedShippingParam)
      url += `&shipping=${encodeURIComponent(savedShippingParam)}`;
    window.location.href = url;
  }, [
    hasSelection,
    selectedIds,
    orderId,
    savedReasonsParam,
    savedShippingParam,
  ]);

  return (
    <div className="flex min-h-[calc(100vh-200px)] flex-col">
      {/* Scrollable Content */}
      <div className="mx-auto flex w-full max-w-[900px] flex-1 flex-col gap-2 px-6 pb-16 pt-8">
        {/* Title */}
        <h1 className="text-center text-[32px] font-light leading-[48px] text-[#1f2937]">
          {t('return.pageTitle')}
        </h1>

        {/* Subtitle */}
        <p className="text-center text-[16px] leading-6 text-[#4b5563]">
          {t('return.subtitle', {orderName, date: formatDate(deliveredDate)})}
        </p>

        {/* Step Progress */}
        <ReturnStepProgress
          currentStep={1}
          stepUrls={[
            `/account/orders/${orderId}/return${preselectedItemIds.length ? `?items=${encodeURIComponent(preselectedItemIds.join(','))}${savedReasonsParam ? `&reasons=${encodeURIComponent(savedReasonsParam)}` : ''}${savedShippingParam ? `&shipping=${encodeURIComponent(savedShippingParam)}` : ''}` : ''}`,
          ]}
        />

        {/* Selection Summary */}
        <ReturnSelectionSummary
          selectedCount={selectedIds.size}
          totalCount={eligibleItems.length}
          estimatedRefund={estimatedRefund}
          allSelected={allSelected}
          onSelectAll={handleSelectAll}
        />

        {/* Order Items Card */}
        <div className="overflow-clip rounded-[12px] border border-[#e5e7eb] bg-white shadow-[0_1px_2px_0_rgba(0,0,0,0.05)]">
          {/* Card Header */}
          <div className="flex items-center justify-between border-b border-[#e5e7eb] px-6 py-5">
            <h2 className="text-[18px] font-bold leading-[27px] text-[#111827]">
              {t('return.orderItems')}
            </h2>
            <span className="text-[14px] leading-[21px] text-[#6b7280]">
              {t('return.selectHint')}
            </span>
          </div>

          {/* Items List */}
          <div className="flex flex-col gap-4 p-0">
            {lineItems.map((item) => (
              <ReturnItemCard
                key={item.id}
                item={item}
                selected={selectedIds.has(item.id)}
                onToggle={() => toggleItem(item.id)}
              />
            ))}
          </div>
        </div>

        {/* Return Policy Notice */}
        <ReturnPolicyNotice />

        {/* Action Buttons (inline, not sticky) */}
        <div className="flex gap-[12px] pt-[16px]">
          <Link
            to="/account/orders"
            reloadDocument
            className="flex flex-[35] items-center justify-center rounded-[8px] border border-[#d1d5db] bg-white px-[25px] py-[13px] text-[15px] font-medium leading-normal text-[#374151] transition-colors hover:bg-[#f9fafb]"
            data-testid="return-cancel-btn"
          >
            {t('return.cancel')}
          </Link>
          <button
            type="button"
            disabled={!hasSelection}
            onClick={handleContinue}
            className={`flex flex-[65] items-center justify-center rounded-[8px] bg-return-accent px-[24px] py-[13px] text-[15px] font-medium leading-normal text-white transition-opacity ${
              hasSelection
                ? 'hover:opacity-90'
                : 'cursor-not-allowed opacity-50'
            }`}
            data-testid="return-continue-btn"
          >
            {t('return.continue')}
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

      {/* Summary skeleton */}
      <div className="h-[80px] animate-pulse rounded-[12px] bg-gray-200" />

      {/* Items card skeleton */}
      <div className="animate-pulse rounded-[12px] bg-gray-200 p-6">
        <div className="mb-4 h-[27px] w-[150px] rounded bg-gray-300" />
        {[1, 2, 3].map((i) => (
          <div key={i} className="mb-4 h-[130px] rounded-[12px] bg-gray-300" />
        ))}
      </div>
    </div>
  );
}
