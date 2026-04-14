import {AlertCircle} from 'lucide-react';
import {useTranslation} from 'react-i18next';

// ============================================================================
// Component
// ============================================================================

export function ReturnPolicyNotice() {
  const {t} = useTranslation('common');

  return (
    <div className="flex flex-col gap-2 rounded-[12px] border border-[rgba(242,176,94,0.3)] bg-[rgba(242,176,94,0.1)] p-[21px]">
      {/* Header */}
      <div className="flex items-center gap-2 text-[#f2b05e]">
        <AlertCircle size={14} />
        <span className="text-[14px] font-semibold leading-[21px]">
          {t('returnPolicyNotice.heading')}
        </span>
      </div>

      {/* Body */}
      <p className="text-[14px] leading-[22.4px] text-[#4b5563]">
        {t('returnPolicyNotice.body')}
      </p>
    </div>
  );
}
