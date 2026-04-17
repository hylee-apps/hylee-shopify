import {useTranslation} from 'react-i18next';

// ============================================================================
// Types
// ============================================================================

interface ResolutionSummaryProps {
  itemCount: number;
  subtotal: number;
  shippingPrice: string;
  shippingFree: boolean;
  totalValue: number;
  currencyCode?: string;
}

// ============================================================================
// Helpers
// ============================================================================

function formatMoney(
  amount: number,
  currencyCode: string = 'USD',
  locale: string = 'en',
): string {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: currencyCode,
  }).format(amount);
}

// ============================================================================
// Component
// ============================================================================

export function ResolutionSummary({
  itemCount,
  subtotal,
  shippingPrice,
  shippingFree,
  totalValue,
  currencyCode = 'USD',
}: ResolutionSummaryProps) {
  const {t, i18n} = useTranslation('common');

  return (
    <div
      className="flex flex-col gap-[12px] rounded-[12px] bg-[#f9fafb] px-[20px] pb-[32px] pt-[28px]"
      data-testid="resolution-summary"
    >
      {/* Row 1: Items being returned */}
      <div className="flex items-center justify-between">
        <span className="text-[14px] font-normal leading-[21px] text-[#4b5563]">
          {t('resolutionSummary.itemsBeingReturned')}
        </span>
        <span className="text-[14px] font-medium leading-[21px] text-[#1f2937]">
          {itemCount}
        </span>
      </div>

      {/* Row 2: Subtotal */}
      <div className="flex items-center justify-between">
        <span className="text-[14px] font-normal leading-[21px] text-[#4b5563]">
          {t('resolutionSummary.subtotal')}
        </span>
        <span className="text-[14px] font-medium leading-[21px] text-[#1f2937]">
          {formatMoney(subtotal, currencyCode, i18n.language)}
        </span>
      </div>

      {/* Row 3: Return shipping */}
      <div className="flex items-center justify-between">
        <span className="text-[14px] font-normal leading-[21px] text-[#4b5563]">
          {t('resolutionSummary.returnShipping')}
        </span>
        <span
          className={`text-[14px] font-medium leading-[21px] ${
            shippingFree ? 'text-primary' : 'text-return-accent'
          }`}
        >
          {shippingPrice}
        </span>
      </div>

      {/* Divider + Total */}
      <div className="flex items-center justify-between border-t-2 border-[#e5e7eb] pt-[14px]">
        <span className="text-[16px] font-bold leading-[24px] text-[#111827]">
          {t('resolutionSummary.totalResolutionValue')}
        </span>
        <span
          className="text-[16px] font-bold leading-[24px] text-return-accent"
          data-testid="resolution-summary-total"
        >
          {formatMoney(totalValue, currencyCode, i18n.language)}
        </span>
      </div>
    </div>
  );
}
