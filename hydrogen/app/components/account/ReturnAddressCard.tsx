import {MapPin, Tag} from 'lucide-react';

// ============================================================================
// Types
// ============================================================================

interface ReturnAddressCardProps {
  returnId: string;
}

// ============================================================================
// Component
// ============================================================================

export function ReturnAddressCard({returnId}: ReturnAddressCardProps) {
  return (
    <div
      className="flex flex-col gap-[12px] border-t border-[#e5e7eb] pt-[25px]"
      data-testid="return-address-section"
    >
      {/* Section Title */}
      <div className="flex items-center text-[16px] leading-[24px] text-[#111827]">
        <MapPin size={16} className="shrink-0" />
        <span className="font-semibold"> Return Address</span>
      </div>

      {/* Address Card */}
      <div className="rounded-[8px] bg-[#f9fafb] px-[16px] pb-[16px] pt-[15px]">
        {/* Address Block */}
        <div className="flex flex-col">
          <span className="text-[14px] font-bold leading-[25.2px] text-[#374151]">
            Hylee Returns Center
          </span>
          <span className="text-[14px] font-normal leading-[25.2px] text-[#374151]">
            1234 Warehouse Boulevard
          </span>
          <span className="text-[14px] font-normal leading-[25.2px] text-[#374151]">
            Building C, Suite 100
          </span>
          <span className="text-[14px] font-normal leading-[25.2px] text-[#374151]">
            Seattle, WA 98101
          </span>
          <span className="text-[14px] font-normal leading-[25.2px] text-[#374151]">
            United States
          </span>
        </div>

        {/* Return ID */}
        <div className="mt-[12px] flex items-center gap-[8px] text-[14px]">
          <Tag size={14} className="shrink-0 text-return-accent" />
          <span className="leading-[25.2px] text-[#374151]">
            Return ID: <span className="font-bold">{returnId}</span>
          </span>
        </div>
      </div>
    </div>
  );
}
