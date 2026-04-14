import {Image} from '@shopify/hydrogen';
import {Check, ImageIcon} from 'lucide-react';
import {useTranslation} from 'react-i18next';

// ============================================================================
// Types
// ============================================================================

export interface ReturnLineItem {
  id: string;
  title: string;
  variantTitle: string | null;
  quantity: number;
  price: {amount: string; currencyCode: string};
  image: {
    url: string;
    altText?: string | null;
    width?: number;
    height?: number;
  } | null;
  eligible: boolean;
  eligibilityReason?: 'eligible' | 'final-sale' | 'window-closed';
}

interface ReturnItemCardProps {
  item: ReturnLineItem;
  selected: boolean;
  onToggle: () => void;
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

export function ReturnItemCard({
  item,
  selected,
  onToggle,
}: ReturnItemCardProps) {
  const {t} = useTranslation('common');

  function getEligibilityBadge(reason: string | undefined) {
    switch (reason) {
      case 'final-sale':
        return {
          text: t('returnItemCard.badgeFinalSale'),
          textColor: 'text-red-600',
          bgColor: 'bg-red-600/10',
        };
      case 'window-closed':
        return {
          text: t('returnItemCard.badgeWindowClosed'),
          textColor: 'text-[#6b7280]',
          bgColor: 'bg-[#6b7280]/10',
        };
      case 'eligible':
      default:
        return {
          text: t('returnItemCard.badgeEligible'),
          textColor: 'text-primary',
          bgColor: 'bg-primary/10',
        };
    }
  }

  const badge = getEligibilityBadge(item.eligibilityReason);

  return (
    <button
      type="button"
      onClick={item.eligible ? onToggle : undefined}
      disabled={!item.eligible}
      className={`flex w-full cursor-pointer items-start gap-5 rounded-[12px] border-2 p-[22px] text-left transition-colors ${
        selected ? 'border-return-accent' : 'border-[#e5e7eb]'
      } ${!item.eligible ? 'cursor-not-allowed opacity-60' : 'hover:border-return-accent/50'}`}
      data-testid={`return-item-${item.id}`}
    >
      {/* Checkbox */}
      <div
        className="shrink-0 pt-2"
        data-testid={`return-item-checkbox-${item.id}`}
      >
        {item.eligible && (
          <div
            className={`flex size-6 items-center justify-center rounded-[4px] border-2 transition-colors ${
              selected
                ? 'border-return-accent bg-return-accent'
                : 'border-[#d1d5db] bg-white'
            }`}
          >
            {selected && (
              <Check size={14} className="text-white" strokeWidth={3} />
            )}
          </div>
        )}
      </div>

      {/* Product Image */}
      <div className="size-[100px] shrink-0 overflow-hidden rounded-lg bg-[#f3f4f6]">
        {item.image ? (
          <Image
            data={item.image}
            width={100}
            height={100}
            className="size-full object-cover"
            alt={item.image.altText || item.title}
          />
        ) : (
          <div className="flex size-full items-center justify-center">
            <ImageIcon size={40} className="text-[#9ca3af]" />
          </div>
        )}
      </div>

      {/* Item Details */}
      <div className="flex min-w-0 flex-1 flex-col gap-1">
        <h4 className="text-[16px] font-medium leading-6 text-[#1f2937]">
          {item.title}
        </h4>
        <p className="text-[14px] leading-[21px] text-[#6b7280]">
          {item.variantTitle ? `${item.variantTitle} • ` : ''}
          {t('returnItemCard.qty', {quantity: item.quantity})}
        </p>
        <p className="pt-1 text-[16px] font-semibold leading-6 text-return-accent">
          {formatMoney(item.price)}
        </p>
      </div>

      {/* Eligibility Badge */}
      <span
        className={`shrink-0 rounded-[4px] px-2 py-1 text-[12px] font-medium uppercase leading-[18px] tracking-[0.5px] ${badge.textColor} ${badge.bgColor}`}
      >
        {badge.text}
      </span>
    </button>
  );
}
