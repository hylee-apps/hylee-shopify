import {useTranslation} from 'react-i18next';

// ============================================================================
// Types
// ============================================================================

interface ReturnShippingSummaryProps {
  itemCount: number;
  shippingPrice: string;
  shippingFree: boolean;
  totalRefund: number;
  currencyCode?: string;
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
// Component
// ============================================================================

export function ReturnShippingSummary({
  itemCount,
  shippingPrice,
  shippingFree,
  totalRefund,
  currencyCode = 'USD',
}: ReturnShippingSummaryProps) {
  const {t} = useTranslation('common');

  return (
    <div
      className="flex flex-col gap-[12px] rounded-[12px] bg-[#f9fafb] px-[20px] pb-[32px] pt-[20px]"
      data-testid="return-shipping-summary"
    >
      {/* Row 1: Items being returned */}
      <div className="flex items-center justify-between">
        <span className="text-[14px] font-normal leading-[21px] text-[#4b5563]">
          {t('returnShippingSummary.itemsBeingReturned')}
        </span>
        <span className="text-[14px] font-medium leading-[21px] text-[#1f2937]">
          {itemCount}
        </span>
      </div>

      {/* Row 2: Return shipping */}
      <div className="flex items-center justify-between">
        <span className="text-[14px] font-normal leading-[21px] text-[#4b5563]">
          {t('returnShippingSummary.returnShipping')}
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
          {t('returnShippingSummary.totalRefundAmount')}
        </span>
        <span
          className="text-[16px] font-bold leading-[24px] text-return-accent"
          data-testid="shipping-summary-total"
        >
          {formatMoney(totalRefund, currencyCode)}
        </span>
      </div>
    </div>
  );
}
