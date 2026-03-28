// ============================================================================
// Types
// ============================================================================

interface ReturnSelectionSummaryProps {
  selectedCount: number;
  totalCount: number;
  estimatedRefund: string;
  allSelected: boolean;
  onSelectAll: () => void;
}

// ============================================================================
// Component
// ============================================================================

export function ReturnSelectionSummary({
  selectedCount,
  totalCount,
  estimatedRefund,
  allSelected,
  onSelectAll,
}: ReturnSelectionSummaryProps) {
  return (
    <div className="flex items-center justify-between rounded-[12px] bg-[#f9fafb] px-6 py-5">
      {/* Left: selection info */}
      <div className="flex flex-col gap-1">
        <span className="text-[14px] leading-[21px] text-[#4b5563]">
          {selectedCount} of {totalCount} items selected
        </span>
        <span className="text-[18px] font-bold leading-[27px] text-[#111827]">
          Estimated refund: {estimatedRefund}
        </span>
      </div>

      {/* Right: select all toggle */}
      <button
        type="button"
        onClick={onSelectAll}
        className="text-[14px] font-medium leading-[21px] text-return-accent hover:underline"
        data-testid="return-select-all"
      >
        {allSelected ? 'Deselect All' : 'Select All'}
      </button>
    </div>
  );
}
