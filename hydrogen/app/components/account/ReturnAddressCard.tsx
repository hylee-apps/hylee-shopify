import {MapPin, Tag} from 'lucide-react';
import {useTranslation} from 'react-i18next';

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
  const {t} = useTranslation('common');

  return (
    <div
      className="flex flex-col gap-[12px] border-t border-[#e5e7eb] pt-[25px]"
      data-testid="return-address-section"
    >
      {/* Section Title */}
      <div className="flex items-center text-[16px] leading-[24px] text-[#111827]">
        <MapPin size={16} className="shrink-0" />
        <span className="font-semibold">
          {' '}
          {t('returnAddressCard.sectionTitle')}
        </span>
      </div>

      {/* Address Card */}
      <div className="rounded-[8px] bg-[#f9fafb] px-[16px] pb-[16px] pt-[15px]">
        {/* Address Block */}
        <div className="flex flex-col">
          <span className="text-[14px] font-bold leading-[25.2px] text-[#374151]">
            {t('returnAddressCard.facilityName')}
          </span>
          <span className="text-[14px] font-normal leading-[25.2px] text-[#374151]">
            {t('returnAddressCard.address1')}
          </span>
          <span className="text-[14px] font-normal leading-[25.2px] text-[#374151]">
            {t('returnAddressCard.address2')}
          </span>
          <span className="text-[14px] font-normal leading-[25.2px] text-[#374151]">
            {t('returnAddressCard.cityStateZip')}
          </span>
          <span className="text-[14px] font-normal leading-[25.2px] text-[#374151]">
            {t('returnAddressCard.country')}
          </span>
        </div>

        {/* Return ID */}
        <div className="mt-[12px] flex items-center gap-[8px] text-[14px]">
          <Tag size={14} className="shrink-0 text-return-accent" />
          <span className="leading-[25.2px] text-[#374151]">
            {t('returnAddressCard.returnId', {id: returnId})}
          </span>
        </div>
      </div>
    </div>
  );
}
