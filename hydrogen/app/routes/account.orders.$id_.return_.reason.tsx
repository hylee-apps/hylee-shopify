import {useState, useCallback, useMemo} from 'react';
import type {Route} from './+types/account.orders.$id_.return_.reason';
import {redirect, Link} from 'react-router';
import {getSeoMeta} from '@shopify/hydrogen';
import {isCustomerLoggedIn, getCustomerAccessToken} from '~/lib/customer-auth';
import {ReturnStepProgress} from '~/components/account/ReturnStepProgress';
import {ReturnReasonItemCard} from '~/components/account/ReturnReasonItemCard';
import type {ReturnLineItem} from '~/components/account/ReturnItemCard';
import type {ReturnReason} from '~/components/account/ReturnReasonForm';
import {RefundSummary} from '~/components/account/RefundSummary';

// ============================================================================
// Route Meta
// ============================================================================

export function meta({data}: Route.MetaArgs) {
  const orderName = data?.orderName ?? 'Order';
  return getSeoMeta({
    title: `Return Reason — ${orderName}`,
    description: `Select return reasons for order ${orderName}.`,
  });
}

// ============================================================================
// GraphQL Query (same as Step 1)
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

  // If none of the selected IDs matched, redirect back
  if (lineItems.length === 0) {
    return redirect(`/account/orders/${params.id}/return`);
  }

  const reasonsParam = url.searchParams.get('reasons') ?? '';
  const shippingParam = url.searchParams.get('shipping') ?? '';

  return {
    orderId: params.id,
    orderName: order.name as string,
    deliveredDate: deliveredDate.toISOString(),
    lineItems,
    itemsParam: itemsParam!,
    reasonsParam,
    shippingParam,
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

// ============================================================================
// Slug ↔ ReturnReason conversion
// ============================================================================

const SLUG_TO_REASON: Record<string, ReturnReason> = {
  defective: 'Defective',
  'wrong-item': 'Wrong Item',
  'not-as-described': 'Not as Described',
  'changed-mind': 'Changed Mind',
};

// ============================================================================
// Per-item reason state type
// ============================================================================

interface ItemReasonData {
  reason: ReturnReason | null;
  details: string;
}

// ============================================================================
// Main Component
// ============================================================================

export default function ReturnReasonPage({loaderData}: Route.ComponentProps) {
  const {
    orderId,
    orderName,
    deliveredDate,
    lineItems,
    itemsParam,
    reasonsParam,
    shippingParam,
  } = loaderData;

  // All items arrive pre-selected
  const [selectedIds, setSelectedIds] = useState<Set<string>>(
    () => new Set(lineItems.map((item) => item.id)),
  );

  // Which item is expanded (first by default)
  const [expandedId, setExpandedId] = useState<string | null>(
    lineItems[0]?.id ?? null,
  );

  // Per-item reason data — restore from URL params if navigating back
  const [reasonData, setReasonData] = useState<Map<string, ItemReasonData>>(
    () => {
      const savedReasons = reasonsParam
        ? reasonsParam.split(',').filter((r) => r.trim())
        : [];
      return new Map(
        lineItems.map((item, idx) => {
          const slug = savedReasons[idx];
          const reason = slug ? (SLUG_TO_REASON[slug] ?? null) : null;
          return [item.id, {reason, details: ''}];
        }),
      );
    },
  );

  const toggleSelect = useCallback(
    (id: string) => {
      setSelectedIds((prev) => {
        const next = new Set(prev);
        if (next.has(id)) {
          next.delete(id);
          // Collapse if this item was expanded
          if (expandedId === id) {
            setExpandedId(null);
          }
          // Clear reason data for unchecked item
          setReasonData((prevData) => {
            const nextData = new Map(prevData);
            nextData.set(id, {reason: null, details: ''});
            return nextData;
          });
        } else {
          next.add(id);
        }
        return next;
      });
    },
    [expandedId],
  );

  const handleSelectAll = useCallback(() => {
    const allSelected =
      lineItems.length > 0 &&
      lineItems.every((item) => selectedIds.has(item.id));
    if (allSelected) {
      setSelectedIds(new Set());
      setExpandedId(null);
    } else {
      setSelectedIds(new Set(lineItems.map((item) => item.id)));
      if (!expandedId) {
        setExpandedId(lineItems[0]?.id ?? null);
      }
    }
  }, [lineItems, selectedIds, expandedId]);

  const handleExpand = useCallback((id: string) => {
    setExpandedId(id);
  }, []);

  const handleReasonChange = useCallback((id: string, reason: ReturnReason) => {
    setReasonData((prev) => {
      const next = new Map(prev);
      const current = next.get(id) ?? {reason: null, details: ''};
      next.set(id, {...current, reason});
      return next;
    });
  }, []);

  const handleDetailsChange = useCallback((id: string, details: string) => {
    setReasonData((prev) => {
      const next = new Map(prev);
      const current = next.get(id) ?? {reason: null, details: ''};
      next.set(id, {...current, details});
      return next;
    });
  }, []);

  // Calculate refund from selected items
  const itemSubtotal = useMemo(() => {
    let total = 0;
    for (const item of lineItems) {
      if (selectedIds.has(item.id)) {
        total += parseFloat(item.price.amount) * item.quantity;
      }
    }
    return total;
  }, [selectedIds, lineItems]);

  const currencyCode = lineItems[0]?.price.currencyCode ?? 'USD';

  // Continue is enabled only when all selected items have a reason
  const canContinue = useMemo(() => {
    if (selectedIds.size === 0) return false;
    for (const id of selectedIds) {
      const data = reasonData.get(id);
      if (!data?.reason) return false;
    }
    return true;
  }, [selectedIds, reasonData]);

  return (
    <div className="flex min-h-[calc(100vh-200px)] flex-col">
      {/* Scrollable Content */}
      <div className="mx-auto flex w-full max-w-[900px] flex-1 flex-col gap-[8px] px-[24px] pb-16 pt-[32px]">
        {/* Title */}
        <h1 className="text-center text-[32px] font-light leading-[48px] text-[#1f2937]">
          Return Items
        </h1>

        {/* Subtitle */}
        <p className="text-center text-[16px] font-normal leading-[24px] text-[#4b5563]">
          {orderName} &bull; Delivered on {formatDate(deliveredDate)}
        </p>

        {/* Step Progress */}
        <ReturnStepProgress
          currentStep={2}
          stepUrls={[
            `/account/orders/${orderId}/return?items=${encodeURIComponent(itemsParam)}${reasonsParam ? `&reasons=${encodeURIComponent(reasonsParam)}` : ''}${shippingParam ? `&shipping=${encodeURIComponent(shippingParam)}` : ''}`,
            `/account/orders/${orderId}/return/reason?items=${encodeURIComponent(itemsParam)}${reasonsParam ? `&reasons=${encodeURIComponent(reasonsParam)}` : ''}${shippingParam ? `&shipping=${encodeURIComponent(shippingParam)}` : ''}`,
          ]}
        />

        {/* Items Card */}
        <div className="overflow-clip rounded-[12px] border border-[#e5e7eb] bg-white shadow-[0px_1px_2px_0px_rgba(0,0,0,0.05)]">
          {/* Card Header */}
          <div className="flex items-center justify-between border-b border-[#e5e7eb] px-[24px] py-[20px]">
            <h2 className="text-[18px] font-bold leading-[27px] text-[#111827]">
              Select Items to Return
            </h2>
            <button
              type="button"
              onClick={handleSelectAll}
              className="text-[14px] font-normal leading-[21px] text-[#6b7280] hover:underline"
              data-testid="return-select-all"
            >
              Select all that apply
            </button>
          </div>

          {/* Card Body */}
          <div className="flex flex-col gap-[16px] px-[24px] pb-[40px] pt-[24px]">
            {lineItems.map((item) => {
              const data = reasonData.get(item.id) ?? {
                reason: null,
                details: '',
              };
              return (
                <ReturnReasonItemCard
                  key={item.id}
                  item={item}
                  selected={selectedIds.has(item.id)}
                  expanded={expandedId === item.id}
                  reason={data.reason}
                  details={data.details}
                  onToggleSelect={() => toggleSelect(item.id)}
                  onExpand={() => handleExpand(item.id)}
                  onReasonChange={(reason) =>
                    handleReasonChange(item.id, reason)
                  }
                  onDetailsChange={(details) =>
                    handleDetailsChange(item.id, details)
                  }
                />
              );
            })}
          </div>
        </div>

        {/* Refund Summary */}
        <RefundSummary
          itemSubtotal={itemSubtotal}
          currencyCode={currencyCode}
        />

        {/* Action Buttons (inline, not sticky) */}
        <div className="flex gap-[12px] pt-[16px]">
          <Link
            to={`/account/orders/${orderId}/return?items=${encodeURIComponent(itemsParam)}${reasonsParam ? `&reasons=${encodeURIComponent(reasonsParam)}` : ''}${shippingParam ? `&shipping=${encodeURIComponent(shippingParam)}` : ''}`}
            reloadDocument
            className="flex flex-[35] items-center justify-center rounded-[8px] border border-[#d1d5db] bg-white px-[25px] py-[13px] text-[15px] font-medium leading-normal text-[#374151] transition-colors hover:bg-[#f9fafb]"
            data-testid="return-cancel-btn"
          >
            Cancel
          </Link>
          <button
            type="button"
            disabled={!canContinue}
            onClick={() => {
              if (!canContinue) return;
              // Build reasons param from selected items
              const reasonsArr: string[] = [];
              for (const id of selectedIds) {
                const data = reasonData.get(id);
                if (data?.reason) {
                  reasonsArr.push(
                    data.reason.toLowerCase().replace(/\s+/g, '-'),
                  );
                }
              }
              const itemsStr = Array.from(selectedIds).join(',');
              const reasonsStr = reasonsArr.join(',');
              let navUrl = `/account/orders/${orderId}/return/shipping?items=${encodeURIComponent(itemsStr)}&reasons=${encodeURIComponent(reasonsStr)}`;
              if (shippingParam)
                navUrl += `&shipping=${encodeURIComponent(shippingParam)}`;
              window.location.href = navUrl;
            }}
            className={`flex flex-[65] items-center justify-center rounded-[8px] bg-return-accent px-[24px] py-[13px] text-[15px] font-medium leading-normal text-white transition-opacity ${
              canContinue ? 'hover:opacity-90' : 'cursor-not-allowed opacity-50'
            }`}
            data-testid="return-continue-btn"
          >
            Continue
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

      {/* Items card skeleton */}
      <div className="animate-pulse rounded-[12px] bg-gray-200 p-6">
        <div className="mb-4 h-[27px] w-[200px] rounded bg-gray-300" />
        {[1, 2, 3].map((i) => (
          <div key={i} className="mb-4 h-[130px] rounded-[12px] bg-gray-300" />
        ))}
      </div>

      {/* Refund summary skeleton */}
      <div className="h-[283px] animate-pulse rounded-[12px] bg-gray-200" />
    </div>
  );
}
