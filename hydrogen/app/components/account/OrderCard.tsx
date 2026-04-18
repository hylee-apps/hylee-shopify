import {Link} from 'react-router';
import {useTranslation} from 'react-i18next';
import {Image} from '@shopify/hydrogen';
import {
  ChevronDown,
  ImageIcon,
  RotateCcw,
  Package,
  Undo2,
  Gift,
  HelpCircle,
  Star,
  Headphones,
  MessageSquare,
} from 'lucide-react';

// ============================================================================
// Types
// ============================================================================

interface LineItem {
  title: string;
  quantity: number;
  variant?: {
    image?: {
      url: string;
      altText?: string | null;
      width?: number;
      height?: number;
    } | null;
    title?: string;
    price?: {amount: string; currencyCode: string};
    product?: {handle?: string};
  } | null;
}

interface OrderCardProps {
  order: {
    id: string;
    name: string;
    processedAt: string;
    fulfillmentStatus: string;
    totalPrice: {amount: string; currencyCode: string};
    lineItems: {nodes: LineItem[]};
    shippingAddress?: {
      firstName?: string | null;
      lastName?: string | null;
    } | null;
  };
}

type ActionButton = {
  key: string;
  labelKey: string;
  icon: typeof Package;
  primary?: boolean;
};

// ============================================================================
// Helpers
// ============================================================================

function formatMoney(
  money: {amount: string; currencyCode: string},
  locale: string,
): string {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: money.currencyCode,
  }).format(parseFloat(money.amount));
}

function formatDate(dateString: string, locale: string): string {
  return new Date(dateString).toLocaleDateString(locale, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

function isDeliveredToday(processedAt: string, status: string): boolean {
  if (status !== 'FULFILLED') return false;
  const today = new Date();
  const orderDate = new Date(processedAt);
  const diffDays = Math.floor(
    (today.getTime() - orderDate.getTime()) / (1000 * 60 * 60 * 24),
  );
  return diffDays === 0;
}

function getDeliveryKeys(
  processedAt: string,
  status: string,
  locale: string,
): {
  textKey: string;
  textParams?: Record<string, string>;
  isToday: boolean;
  messageKey: string;
} {
  switch (status) {
    case 'FULFILLED': {
      const today = isDeliveredToday(processedAt, status);
      return {
        textKey: today
          ? 'orderCard.delivery.deliveredToday'
          : 'orderCard.delivery.delivered',
        textParams: today ? undefined : {date: formatDate(processedAt, locale)},
        isToday: today,
        messageKey: today
          ? 'orderCard.delivery.messages.deliveredToday'
          : 'orderCard.delivery.messages.delivered',
      };
    }
    case 'IN_PROGRESS':
    case 'PARTIALLY_FULFILLED':
      return {
        textKey: 'orderCard.delivery.inTransit',
        isToday: false,
        messageKey: 'orderCard.delivery.messages.inTransit',
      };
    case 'UNFULFILLED':
    default:
      return {
        textKey: 'orderCard.delivery.processing',
        isToday: false,
        messageKey: 'orderCard.delivery.messages.processing',
      };
  }
}

function getActionButtons(status: string): ActionButton[] {
  switch (status) {
    case 'FULFILLED':
      return [
        {
          key: 'trackPackage',
          labelKey: 'orderCard.action.trackPackage',
          icon: Package,
        },
        {
          key: 'returnOrReplace',
          labelKey: 'orderCard.action.returnOrReplace',
          icon: Undo2,
        },
        {
          key: 'shareGiftReceipt',
          labelKey: 'orderCard.action.shareGiftReceipt',
          icon: Gift,
        },
        {
          key: 'askProductQuestion',
          labelKey: 'orderCard.action.askProductQuestion',
          icon: HelpCircle,
        },
        {
          key: 'writeReview',
          labelKey: 'orderCard.action.writeReview',
          icon: Star,
        },
      ];
    case 'IN_PROGRESS':
    case 'PARTIALLY_FULFILLED':
      return [
        {
          key: 'trackPackage',
          labelKey: 'orderCard.action.trackPackage',
          icon: Package,
          primary: true,
        },
        {
          key: 'returnOrReplace',
          labelKey: 'orderCard.action.returnOrReplace',
          icon: Undo2,
        },
        {
          key: 'shareGiftReceipt',
          labelKey: 'orderCard.action.shareGiftReceipt',
          icon: Gift,
        },
      ];
    default:
      return [
        {
          key: 'getProductSupport',
          labelKey: 'orderCard.action.getProductSupport',
          icon: Headphones,
          primary: true,
        },
        {
          key: 'leaveSellerFeedback',
          labelKey: 'orderCard.action.leaveSellerFeedback',
          icon: MessageSquare,
        },
      ];
  }
}

function getReturnEligibilityDate(processedAt: string, locale: string): string {
  const date = new Date(processedAt);
  date.setDate(date.getDate() + 30);
  return date.toLocaleDateString(locale, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

// ============================================================================
// OrderCard Component
// ============================================================================

export function OrderCard({order}: OrderCardProps) {
  const {t, i18n} = useTranslation();
  const locale = i18n.language;
  const orderId = order.id.split('/').pop()?.split('?')[0];
  const deliveryKeys = getDeliveryKeys(
    order.processedAt,
    order.fulfillmentStatus,
    locale,
  );
  const delivery = {
    text: t(deliveryKeys.textKey, deliveryKeys.textParams),
    isToday: deliveryKeys.isToday,
    message: t(deliveryKeys.messageKey),
  };
  const shipToName = order.shippingAddress
    ? `${order.shippingAddress.firstName ?? ''} ${order.shippingAddress.lastName ?? ''}`.trim()
    : null;
  const actionButtons = getActionButtons(order.fulfillmentStatus);

  return (
    <div className="w-full overflow-clip rounded-[12px] bg-white shadow-[0px_1px_2px_0px_rgba(0,0,0,0.05)]">
      {/* Card Header */}
      <div className="flex flex-wrap justify-between gap-y-[12px] border-b border-[#e5e7eb] bg-gradient-to-r from-[#f9fafb] to-white px-[24px] pb-[17px] pt-[16px]">
        {/* Left: Order Placed, Total, Ship To */}
        <div className="flex flex-wrap gap-x-[24px] gap-y-[8px]">
          <MetaItem
            label={t('orderCard.meta.orderPlaced')}
            value={formatDate(order.processedAt, locale)}
          />
          <MetaItem
            label={t('orderCard.meta.total')}
            value={formatMoney(order.totalPrice, locale)}
          />
          {shipToName && (
            <div className="flex flex-col gap-[2px]">
              <span className="text-[12px] font-normal uppercase leading-[18px] tracking-[0.5px] text-[#6b7280]">
                {t('orderCard.meta.shipTo')}
              </span>
              <div className="flex items-center gap-[4px] rounded-[4px] border border-[#d1d5db] bg-white px-[9px] py-[5px]">
                <span className="text-[14px] leading-[21px] text-[#374151]">
                  {shipToName}
                </span>
                <ChevronDown size={14} className="text-[#374151]" />
              </div>
            </div>
          )}
        </div>
        {/* Right: Order # + links */}
        <div className="flex flex-col gap-[2px]">
          <span className="text-[12px] font-normal uppercase leading-[18px] tracking-[0.5px] text-[#6b7280]">
            {t('orderCard.meta.orderNumber')}
          </span>
          <span className="text-[15px] leading-[22.5px] text-[#111827]">
            {order.name}
          </span>
          <div className="flex items-start gap-[16px]">
            <Link
              to={`/account/orders/${orderId}`}
              className="text-[14px] leading-[21px] text-secondary hover:underline"
            >
              {t('orderCard.link.viewOrderDetails')}
            </Link>
            <span className="text-[14px] leading-[21px] text-[#d1d5db]">|</span>
            <Link
              to={`/account/orders/${orderId}`}
              className="text-[14px] leading-[21px] text-secondary hover:underline"
            >
              {t('orderCard.link.viewInvoice')}
            </Link>
          </div>
        </div>
      </div>

      {/* Card Body */}
      <div className="flex flex-col gap-[16px] p-[24px]">
        {/* Delivery Status */}
        <div className="flex flex-col gap-[4px]">
          <span
            className={`text-[20px] leading-[30px] ${
              delivery.isToday ? 'text-primary' : 'text-[#111827]'
            }`}
          >
            {delivery.text}
          </span>
          <span className="text-[14px] leading-[21px] text-[#4b5563]">
            {delivery.message}
          </span>
        </div>

        {/* Product Rows */}
        {order.lineItems.nodes.map((item, idx) => (
          <ProductRow
            key={idx}
            item={item}
            processedAt={order.processedAt}
            actionButtons={idx === 0 ? actionButtons : undefined}
            hasBorder={idx < order.lineItems.nodes.length - 1}
            orderId={orderId}
          />
        ))}
      </div>
    </div>
  );
}

// ============================================================================
// MetaItem Sub-component
// ============================================================================

function MetaItem({label, value}: {label: string; value: string}) {
  return (
    <div className="flex flex-col gap-[2px]">
      <span className="text-[12px] font-normal uppercase leading-[18px] tracking-[0.5px] text-[#6b7280]">
        {label}
      </span>
      <span className="text-[15px] leading-[22.5px] text-[#111827]">
        {value}
      </span>
    </div>
  );
}

// ============================================================================
// ProductRow Sub-component
// ============================================================================

function ProductRow({
  item,
  processedAt,
  actionButtons,
  hasBorder,
  orderId,
}: {
  item: LineItem;
  processedAt: string;
  actionButtons?: ActionButton[];
  orderId?: string;
  hasBorder: boolean;
}) {
  const {t, i18n} = useTranslation();
  const locale = i18n.language;
  const image = item.variant?.image;
  const productHandle = item.variant?.product?.handle;

  return (
    <div
      className={`flex flex-col gap-[16px] py-[16px] sm:flex-row sm:gap-[24px] ${
        hasBorder ? 'border-b border-[#f3f4f6]' : ''
      }`}
    >
      {/* Product Image */}
      {image ? (
        <Image
          data={image}
          width={120}
          height={120}
          className="size-[120px] shrink-0 rounded-[8px] object-cover"
          alt={image.altText || item.title}
        />
      ) : (
        <div className="flex size-[120px] shrink-0 items-center justify-center rounded-[8px] bg-[#f3f4f6]">
          <ImageIcon size={40} className="text-[#9ca3af]" />
        </div>
      )}

      {/* Product Info */}
      <div className="flex flex-1 flex-col gap-[8px]">
        {productHandle ? (
          <Link
            to={`/products/${productHandle}`}
            className="text-[15px] leading-[21px] text-secondary hover:underline"
          >
            {item.title}
          </Link>
        ) : (
          <span className="text-[15px] leading-[21px] text-secondary">
            {item.title}
          </span>
        )}
        {item.variant?.title && item.variant.title !== 'Default Title' && (
          <span className="text-[13px] leading-[19.5px] text-[#4b5563]">
            {item.variant.title}
          </span>
        )}
        <span className="text-[13px] leading-[19.5px] text-[#4b5563]">
          {t('orderCard.returnEligibility', {
            date: getReturnEligibilityDate(processedAt, locale),
          })}
        </span>
        {/* Inline Action Buttons */}
        <div className="flex flex-wrap gap-[8px] pt-[8px]">
          {productHandle && (
            <Link
              to={`/products/${productHandle}`}
              className="flex items-center gap-[8px] border border-[#14b8a6] bg-[#14b8a6] px-[17px] py-[9px] text-[14px] leading-[21px] text-white transition-colors hover:bg-[#0d9488]"
            >
              <RotateCcw size={14} className="text-white" />
              {t('orderCard.buyItAgain')}
            </Link>
          )}
          {productHandle && (
            <Link
              to={`/products/${productHandle}`}
              className="border border-[#d1d5db] bg-white px-[17px] py-[9px] text-[14px] leading-[21px] text-[#374151] transition-colors hover:border-[#9ca3af]"
            >
              {t('orderCard.viewYourItem')}
            </Link>
          )}
        </div>
      </div>

      {/* Actions Panel (desktop only, first product row only) */}
      {actionButtons && actionButtons.length > 0 && (
        <div className="hidden w-[200px] min-w-[200px] flex-col gap-[8px] lg:flex">
          {actionButtons.map((action) => {
            // Wire "Return or replace items" to the return flow
            if (action.key === 'returnOrReplace') {
              return (
                <Link
                  key={action.key}
                  to={`/account/orders/${orderId}/return`}
                  reloadDocument
                  className="w-full border border-[#d1d5db] bg-white px-[17px] py-[13px] text-center text-[14px] leading-[21px] text-[#374151] transition-colors hover:border-[#9ca3af]"
                >
                  {t(action.labelKey)}
                </Link>
              );
            }
            // Wire "Write a product review" to the product page review form
            if (action.key === 'writeReview' && productHandle) {
              return (
                <Link
                  key={action.key}
                  to={`/products/${productHandle}?write_review=1`}
                  className="w-full border border-[#d1d5db] bg-white px-[17px] py-[13px] text-center text-[14px] leading-[21px] text-[#374151] transition-colors hover:border-[#9ca3af]"
                >
                  {t(action.labelKey)}
                </Link>
              );
            }
            return (
              <button
                key={action.key}
                type="button"
                className={`w-full px-[17px] py-[13px] text-center text-[14px] leading-[21px] transition-colors ${
                  action.primary
                    ? 'border border-[#14b8a6] bg-[#14b8a6] text-white hover:bg-[#0d9488]'
                    : 'border border-[#d1d5db] bg-white text-[#374151] hover:border-[#9ca3af]'
                }`}
              >
                {t(action.labelKey)}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
