import {useTranslation} from 'react-i18next';

// ============================================================================
// Component
// ============================================================================

export function OurPromiseNotice() {
  const {t} = useTranslation('common');

  return (
    <div
      className="flex flex-col gap-[8px] rounded-[12px] border border-[rgba(38,153,166,0.2)] bg-[rgba(38,153,166,0.05)] p-[21px]"
      data-testid="our-promise-notice"
    >
      {/* Header */}
      <h4 className="pl-[8px] text-[14px] font-semibold leading-[21px] text-return-accent">
        {t('ourPromiseNotice.heading')}
      </h4>

      {/* Body */}
      <p className="text-[14px] font-normal leading-[22.4px] text-[#4b5563]">
        {t('ourPromiseNotice.body')}
      </p>
    </div>
  );
}
