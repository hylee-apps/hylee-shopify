// ============================================================================
// Types
// ============================================================================

interface RefundSummaryProps {
  itemSubtotal: number;
  taxRate?: number;
  shippingFree?: boolean;
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

export function RefundSummary({
  itemSubtotal,
  taxRate = 0.08,
  shippingFree = true,
  currencyCode = 'USD',
}: RefundSummaryProps) {
  const taxRefund = itemSubtotal * taxRate;
  const estimatedTotal = itemSubtotal + taxRefund;

  return (
    <div
      className="flex flex-col gap-[16px] rounded-[12px] bg-[#f9fafb] p-[24px]"
      data-testid="refund-summary"
    >
      {/* Title */}
      <h3 className="text-[18px] font-semibold leading-[27px] text-[#1f2937]">
        Refund Summary
      </h3>

      {/* Line Items */}
      <div className="flex flex-col gap-[11px]">
        <div className="flex items-center justify-between">
          <span className="text-[15px] font-normal leading-[22.5px] text-[#1f2937]">
            Item Subtotal
          </span>
          <span className="text-[15px] font-normal leading-[22.5px] text-[#1f2937]">
            {formatMoney(itemSubtotal, currencyCode)}
          </span>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-[15px] font-normal leading-[22.5px] text-[#1f2937]">
            Tax Refund
          </span>
          <span className="text-[15px] font-normal leading-[22.5px] text-[#1f2937]">
            {formatMoney(taxRefund, currencyCode)}
          </span>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-[15px] font-normal leading-[22.5px] text-[#1f2937]">
            Return Shipping
          </span>
          <span className="text-[15px] font-normal leading-[22.5px] text-primary">
            {shippingFree ? 'Free' : formatMoney(0, currencyCode)}
          </span>
        </div>
      </div>

      {/* Divider + Total */}
      <div className="flex items-center justify-between border-t-2 border-[#e5e7eb] pt-[14px]">
        <span className="text-[18px] font-bold leading-[27px] text-[#111827]">
          Estimated Refund
        </span>
        <span
          className="text-[18px] font-bold leading-[27px] text-return-accent"
          data-testid="refund-total"
        >
          {formatMoney(estimatedTotal, currencyCode)}
        </span>
      </div>

      {/* Disclaimer */}
      <p className="text-[13px] font-normal leading-[19.5px] text-[#6b7280]">
        Refund will be processed to original payment method within 5-7 business
        days after we receive the item.
      </p>
    </div>
  );
}
