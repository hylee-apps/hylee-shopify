import {Image} from '@shopify/hydrogen';
import {Check, ImageIcon} from 'lucide-react';
import {useTranslation} from 'react-i18next';
import type {ReturnLineItem} from '~/components/account/ReturnItemCard';
import {ReturnReasonForm} from '~/components/account/ReturnReasonForm';
import type {ReturnReason} from '~/components/account/ReturnReasonForm';

// ============================================================================
// Types
// ============================================================================

interface ReturnReasonItemCardProps {
  item: ReturnLineItem;
  selected: boolean;
  expanded: boolean;
  reason: ReturnReason | null;
  details: string;
  onToggleSelect: () => void;
  onExpand: () => void;
  onReasonChange: (reason: ReturnReason) => void;
  onDetailsChange: (details: string) => void;
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

// ============================================================================
// Component
// ============================================================================

export function ReturnReasonItemCard({
  item,
  selected,
  expanded,
  reason,
  details,
  onToggleSelect,
  onExpand,
  onReasonChange,
  onDetailsChange,
}: ReturnReasonItemCardProps) {
  const {t} = useTranslation('common');

  return (
    <div
      className={`flex w-full items-start gap-[20px] rounded-[12px] border-2 p-[22px] transition-colors ${
        selected && expanded
          ? 'min-h-[382px] border-return-accent bg-[rgba(38,153,166,0.02)]'
          : selected
            ? 'border-[#e5e7eb]'
            : 'border-[#e5e7eb]'
      }`}
      data-testid={`return-reason-item-${item.id}`}
    >
      {/* Checkbox */}
      <div className="shrink-0 pt-[8px]">
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onToggleSelect();
          }}
          className={`flex size-[24px] items-center justify-center rounded-[4px] border-2 transition-colors ${
            selected
              ? 'border-return-accent bg-return-accent'
              : 'border-[#d1d5db] bg-white'
          }`}
          data-testid={`return-reason-checkbox-${item.id}`}
          aria-label={
            selected
              ? t('returnReasonItemCard.deselectAriaLabel', {title: item.title})
              : t('returnReasonItemCard.selectAriaLabel', {title: item.title})
          }
        >
          {selected && (
            <Check size={14} className="text-white" strokeWidth={3} />
          )}
        </button>
      </div>

      {/* Product Image */}
      <div
        className="size-[80px] shrink-0 overflow-hidden rounded-[8px] bg-[#f3f4f6]"
        role={!expanded ? 'button' : undefined}
        tabIndex={!expanded && selected ? 0 : undefined}
        onClick={!expanded && selected ? onExpand : undefined}
        onKeyDown={
          !expanded && selected
            ? (e) => {
                if (e.key === 'Enter' || e.key === ' ') onExpand();
              }
            : undefined
        }
      >
        {item.image ? (
          <Image
            data={item.image}
            width={80}
            height={80}
            className="size-full object-cover"
            alt={item.image.altText || item.title}
          />
        ) : (
          <div className="flex size-full items-center justify-center">
            <ImageIcon size={24} className="text-[#9ca3af]" />
          </div>
        )}
      </div>

      {/* Product Info */}
      <div
        className={`flex flex-col gap-[4px] ${expanded ? 'w-[90px] shrink-0' : 'min-w-0 flex-1'}`}
        role={!expanded && selected ? 'button' : undefined}
        tabIndex={!expanded && selected ? 0 : undefined}
        onClick={!expanded && selected ? onExpand : undefined}
        onKeyDown={
          !expanded && selected
            ? (e) => {
                if (e.key === 'Enter' || e.key === ' ') onExpand();
              }
            : undefined
        }
      >
        <h4 className="text-[16px] font-medium leading-[24px] text-[#1f2937]">
          {item.title}
        </h4>
        <p className="text-[14px] font-normal leading-[21px] text-[#6b7280]">
          {item.variantTitle ? `${item.variantTitle} • ` : ''}
          {t('returnReasonItemCard.qty', {quantity: item.quantity})}
        </p>
        <p className="pt-[4px] text-[16px] font-semibold leading-[24px] text-return-accent">
          {formatMoney(item.price)}
        </p>
      </div>

      {/* Reason Form (expanded only) */}
      {expanded && selected && (
        <ReturnReasonForm
          itemId={item.id}
          reason={reason}
          details={details}
          onReasonChange={onReasonChange}
          onDetailsChange={onDetailsChange}
        />
      )}
    </div>
  );
}
