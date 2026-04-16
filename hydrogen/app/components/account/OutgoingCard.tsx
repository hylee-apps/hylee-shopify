import {Link} from 'react-router';
import {useTranslation} from 'react-i18next';
import {Image} from '@shopify/hydrogen';
import type {ComponentType} from 'react';
import {
  ImageIcon,
  Check,
  Tag,
  Package,
  Truck,
  DollarSign,
  Clock,
  PackageCheck,
  Printer,
  MapPin,
  ArrowLeftRight,
  CheckCircle,
} from 'lucide-react';
import type {LucideProps} from 'lucide-react';
import {
  ReturnProgressTracker,
  type ProgressStep,
} from './ReturnProgressTracker';

// ============================================================================
// Types
// ============================================================================

export type OutgoingStatus =
  | 'return-shipped'
  | 'awaiting-pickup'
  | 'exchange-out-for-delivery';

export interface OutgoingItem {
  id: string;
  type: 'return' | 'exchange';
  status: OutgoingStatus;
  initiatedDate: string;
  refundAmount?: {amount: string; currencyCode: string};
  exchangeFor?: string;
  originalOrderName: string;
  originalOrderId: string;
  statusTitle: string;
  statusMessage: string;
  product: {
    title: string;
    handle?: string;
    variant?: string;
    returnInfo: string;
    image?: {
      url: string;
      altText?: string | null;
      width?: number;
      height?: number;
    };
  };
}

// ============================================================================
// Status Configuration (uses translation keys throughout)
// ============================================================================

interface StatusBadgeConfig {
  labelKey: string;
  bg: string;
  color: string;
  icon: ComponentType<LucideProps>;
}

interface ActionConfig {
  labelKey: string;
  icon?: ComponentType<LucideProps>;
  primary?: boolean;
}

interface ProgressStepConfig {
  labelKey: string;
  status: ProgressStep['status'];
  icon: ComponentType<LucideProps>;
}

interface StatusConfig {
  badge: StatusBadgeConfig;
  linkKeys: string[];
  inlineActions: ActionConfig[];
  panelActions: ActionConfig[];
  progressSteps: ProgressStepConfig[];
}

const STATUS_CONFIG: Record<OutgoingStatus, StatusConfig> = {
  'return-shipped': {
    badge: {
      labelKey: 'outgoingCard.status.returnShipped',
      bg: 'bg-[rgba(42,200,100,0.1)]',
      color: 'text-[#2ac864]',
      icon: PackageCheck,
    },
    linkKeys: [
      'outgoingCard.link.viewReturnDetails',
      'outgoingCard.link.viewRefundStatus',
    ],
    inlineActions: [
      {labelKey: 'outgoingCard.action.printReturnLabel', icon: Printer},
      {labelKey: 'outgoingCard.action.contactSeller'},
    ],
    panelActions: [
      {
        labelKey: 'outgoingCard.action.trackReturnPackage',
        icon: Package,
        primary: true,
      },
      {labelKey: 'outgoingCard.action.viewRefundStatus', icon: DollarSign},
    ],
    progressSteps: [
      {
        labelKey: 'outgoingCard.progress.returnRequested',
        status: 'completed',
        icon: Check,
      },
      {
        labelKey: 'outgoingCard.progress.labelGenerated',
        status: 'completed',
        icon: Tag,
      },
      {
        labelKey: 'outgoingCard.progress.packageShipped',
        status: 'completed',
        icon: Package,
      },
      {
        labelKey: 'outgoingCard.progress.inTransit',
        status: 'active',
        icon: Truck,
      },
      {
        labelKey: 'outgoingCard.progress.refundProcessed',
        status: 'pending',
        icon: DollarSign,
      },
    ],
  },
  'awaiting-pickup': {
    badge: {
      labelKey: 'outgoingCard.status.awaitingPickup',
      bg: 'bg-[rgba(242,176,94,0.1)]',
      color: 'text-[#f2b05e]',
      icon: Clock,
    },
    linkKeys: [
      'outgoingCard.link.viewReturnDetails',
      'outgoingCard.link.cancelReturn',
    ],
    inlineActions: [
      {labelKey: 'outgoingCard.action.printReturnLabel', icon: Printer},
      {labelKey: 'outgoingCard.action.reschedulePickup'},
    ],
    panelActions: [
      {
        labelKey: 'outgoingCard.action.viewPickupDetails',
        icon: MapPin,
        primary: true,
      },
      {labelKey: 'outgoingCard.action.preparePackage', icon: Package},
    ],
    progressSteps: [
      {
        labelKey: 'outgoingCard.progress.returnRequested',
        status: 'completed',
        icon: Check,
      },
      {
        labelKey: 'outgoingCard.progress.labelGenerated',
        status: 'completed',
        icon: Tag,
      },
      {
        labelKey: 'outgoingCard.progress.awaitingPickup',
        status: 'active',
        icon: Clock,
      },
      {
        labelKey: 'outgoingCard.progress.inTransit',
        status: 'pending',
        icon: Truck,
      },
      {
        labelKey: 'outgoingCard.progress.refundProcessed',
        status: 'pending',
        icon: DollarSign,
      },
    ],
  },
  'exchange-out-for-delivery': {
    badge: {
      labelKey: 'outgoingCard.status.outForDelivery',
      bg: 'bg-[rgba(38,153,166,0.1)]',
      color: 'text-[#2699a6]',
      icon: Truck,
    },
    linkKeys: [
      'outgoingCard.link.viewExchangeDetails',
      'outgoingCard.link.trackNewItem',
    ],
    inlineActions: [
      {labelKey: 'outgoingCard.action.viewTracking'},
      {labelKey: 'outgoingCard.action.contactSupport'},
    ],
    panelActions: [
      {
        labelKey: 'outgoingCard.action.trackDelivery',
        icon: MapPin,
        primary: true,
      },
      {
        labelKey: 'outgoingCard.action.viewExchangeDetails',
        icon: ArrowLeftRight,
      },
    ],
    progressSteps: [
      {
        labelKey: 'outgoingCard.progress.exchangeRequested',
        status: 'completed',
        icon: Check,
      },
      {
        labelKey: 'outgoingCard.progress.returnShipped',
        status: 'completed',
        icon: Check,
      },
      {
        labelKey: 'outgoingCard.progress.newItemShipped',
        status: 'completed',
        icon: Check,
      },
      {
        labelKey: 'outgoingCard.progress.outForDelivery',
        status: 'active',
        icon: Truck,
      },
      {
        labelKey: 'outgoingCard.progress.exchangeComplete',
        status: 'pending',
        icon: CheckCircle,
      },
    ],
  },
};

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

// ============================================================================
// OutgoingCard Component
// ============================================================================

export function OutgoingCard({item}: {item: OutgoingItem}) {
  const {t} = useTranslation();
  const config = STATUS_CONFIG[item.status];
  const orderId = item.originalOrderId.split('/').pop();

  // Build translated progress steps to pass into ReturnProgressTracker
  const progressSteps: ProgressStep[] = config.progressSteps.map((step) => ({
    label: t(step.labelKey),
    status: step.status,
    icon: step.icon,
  }));

  return (
    <div className="w-full overflow-clip rounded-[12px] bg-white shadow-[0px_1px_2px_0px_rgba(0,0,0,0.05)]">
      {/* Card Header */}
      <div className="flex flex-wrap justify-between gap-y-[12px] border-b border-[#e5e7eb] bg-gradient-to-r from-[#f9fafb] to-white px-[24px] pb-[17px] pt-[16px]">
        {/* Left: Meta items */}
        <div className="flex flex-wrap gap-x-[24px] gap-y-[8px]">
          <MetaItem
            label={
              item.type === 'exchange'
                ? t('outgoingCard.meta.exchangeRequested')
                : t('outgoingCard.meta.returnInitiated')
            }
            value={formatDate(item.initiatedDate)}
          />
          {item.type === 'exchange' && item.exchangeFor ? (
            <MetaItem
              label={t('outgoingCard.meta.exchangeFor')}
              value={item.exchangeFor}
            />
          ) : (
            item.refundAmount && (
              <MetaItem
                label={t('outgoingCard.meta.refundAmount')}
                value={formatMoney(item.refundAmount)}
              />
            )
          )}
          <div className="flex flex-col gap-[2px]">
            <span className="text-[12px] font-medium uppercase leading-[18px] tracking-[0.5px] text-[#6b7280]">
              {t('outgoingCard.meta.originalOrderNumber')}
            </span>
            <Link
              to={`/account/orders/${orderId}`}
              className="text-[15px] font-semibold leading-[22.5px] text-secondary hover:underline"
            >
              {item.originalOrderName}
            </Link>
          </div>
        </div>

        {/* Right: Status badge + links */}
        <div className="flex flex-col gap-[2px]">
          {/* Status Badge */}
          <div
            className={`flex items-center gap-[8px] px-[12px] py-[8px] ${config.badge.bg}`}
          >
            <config.badge.icon size={13} className={config.badge.color} />
            <span
              className={`text-[13px] font-semibold leading-[19.5px] ${config.badge.color}`}
            >
              {t(config.badge.labelKey)}
            </span>
          </div>
          {/* Links */}
          <div className="flex items-start gap-[16px] pt-[8px]">
            {config.linkKeys.map((linkKey, idx) => (
              <span key={linkKey} className="flex items-start gap-[16px]">
                {idx > 0 && (
                  <span className="text-[14px] leading-[21px] text-[#d1d5db]">
                    |
                  </span>
                )}
                <button
                  type="button"
                  className="cursor-pointer text-[14px] leading-[21px] text-secondary hover:underline"
                >
                  {t(linkKey)}
                </button>
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Card Body */}
      <div className="flex flex-col gap-[16px] p-[24px]">
        {/* Return/Exchange Status */}
        <div className="flex flex-col gap-[4px]">
          <span className="text-[20px] font-bold leading-[30px] text-[#111827]">
            {item.statusTitle}
          </span>
          <span className="text-[14px] leading-[21px] text-[#4b5563]">
            {item.statusMessage}
          </span>
        </div>

        {/* Product Row */}
        <div className="flex flex-col gap-[16px] border-b border-[#f3f4f6] py-[16px] sm:flex-row sm:gap-[24px]">
          {/* Product Image */}
          {item.product.image ? (
            <Image
              data={item.product.image}
              width={120}
              height={120}
              className="size-[120px] shrink-0 rounded-[8px] object-cover"
              alt={item.product.image.altText || item.product.title}
            />
          ) : (
            <div className="flex size-[120px] shrink-0 items-center justify-center rounded-[8px] bg-[#f3f4f6]">
              <ImageIcon size={40} className="text-[#9ca3af]" />
            </div>
          )}

          {/* Product Info */}
          <div className="flex flex-1 flex-col gap-[8px]">
            {item.product.handle ? (
              <Link
                to={`/products/${item.product.handle}`}
                className="text-[15px] font-medium leading-[21px] text-secondary hover:underline"
              >
                {item.product.title}
              </Link>
            ) : (
              <span className="text-[15px] font-medium leading-[21px] text-secondary">
                {item.product.title}
              </span>
            )}
            {item.product.variant && (
              <span className="text-[13px] leading-[19.5px] text-[#4b5563]">
                {item.product.variant}
              </span>
            )}
            <div className="pt-[8px]">
              <span className="text-[13px] leading-[19.5px] text-[#4b5563]">
                {item.product.returnInfo}
              </span>
            </div>
            {/* Inline Action Buttons */}
            <div className="flex flex-wrap gap-[8px] pt-[8px]">
              {config.inlineActions.map((action) => (
                <button
                  key={action.labelKey}
                  type="button"
                  className="flex items-center gap-[8px] border border-[#d1d5db] bg-white px-[17px] py-[9px] text-[14px] font-medium leading-[21px] text-[#374151] transition-colors hover:border-[#9ca3af]"
                >
                  {action.icon && (
                    <action.icon size={14} className="text-[#374151]" />
                  )}
                  {t(action.labelKey)}
                </button>
              ))}
            </div>
          </div>

          {/* Actions Panel (desktop only) */}
          <div className="hidden w-[200px] min-w-[200px] flex-col gap-[8px] lg:flex">
            {config.panelActions.map((action) => (
              <button
                key={action.labelKey}
                type="button"
                className={`flex w-full items-center justify-center gap-[8px] px-[17px] py-[13px] text-center text-[14px] font-medium leading-[21px] transition-colors ${
                  action.primary
                    ? 'border border-[#2699a6] bg-[#2699a6] text-white hover:bg-[#1e7a85]'
                    : 'border border-[#d1d5db] bg-white text-[#374151] hover:border-[#9ca3af]'
                }`}
              >
                {action.icon && (
                  <action.icon
                    size={14}
                    className={action.primary ? 'text-white' : 'text-[#374151]'}
                  />
                )}
                {t(action.labelKey)}
              </button>
            ))}
          </div>
        </div>

        {/* Progress Tracker */}
        <ReturnProgressTracker steps={progressSteps} />
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
      <span className="text-[12px] font-medium uppercase leading-[18px] tracking-[0.5px] text-[#6b7280]">
        {label}
      </span>
      <span className="text-[15px] font-semibold leading-[22.5px] text-[#111827]">
        {value}
      </span>
    </div>
  );
}
