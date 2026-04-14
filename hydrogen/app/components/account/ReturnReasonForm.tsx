import {useRef} from 'react';
import {Camera} from 'lucide-react';
import {useTranslation} from 'react-i18next';

// ============================================================================
// Types
// ============================================================================

export type ReturnReason =
  | 'Defective'
  | 'Wrong Item'
  | 'Not as Described'
  | 'Changed Mind';

interface ReturnReasonFormProps {
  itemId: string;
  reason: ReturnReason | null;
  details: string;
  onReasonChange: (reason: ReturnReason) => void;
  onDetailsChange: (details: string) => void;
}

// ============================================================================
// Component
// ============================================================================

export function ReturnReasonForm({
  itemId,
  reason,
  details,
  onReasonChange,
  onDetailsChange,
}: ReturnReasonFormProps) {
  const {t} = useTranslation('common');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const RETURN_REASONS: {key: ReturnReason; label: string}[] = [
    {key: 'Defective', label: t('returnReasonForm.reason.defective')},
    {key: 'Wrong Item', label: t('returnReasonForm.reason.wrongItem')},
    {
      key: 'Not as Described',
      label: t('returnReasonForm.reason.notAsDescribed'),
    },
    {key: 'Changed Mind', label: t('returnReasonForm.reason.changedMind')},
  ];

  return (
    <div
      className="flex flex-1 flex-col gap-[12px] border-t border-[#e5e7eb] pt-[17px]"
      data-testid={`return-reason-form-${itemId}`}
    >
      {/* Label */}
      <label className="text-[13px] font-normal leading-[19.5px] text-[#6b7280]">
        {t('returnReasonForm.label')}
      </label>

      {/* Reason Options Grid */}
      <div className="grid grid-cols-2 gap-[12px]">
        {RETURN_REASONS.map(({key, label}) => (
          <button
            key={key}
            type="button"
            onClick={() => onReasonChange(key)}
            className={`rounded-[8px] border px-[17px] py-[13px] text-center text-[14px] leading-[21px] transition-colors ${
              reason === key
                ? 'border-return-accent bg-[rgba(38,153,166,0.05)] font-medium text-return-accent'
                : 'border-[#d1d5db] font-normal text-[#1f2937] hover:border-[#9ca3af]'
            }`}
            data-testid={`return-reason-option-${key.toLowerCase().replace(/\s+/g, '-')}`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Additional Details Textarea */}
      <textarea
        placeholder={t('returnReasonForm.detailsPlaceholder')}
        value={details}
        onChange={(e) => onDetailsChange(e.target.value)}
        className="resize-none rounded-[8px] border border-[#d1d5db] bg-white px-[17px] pb-[31px] pt-[13px] text-[15px] font-normal leading-normal text-[#1f2937] placeholder:text-[#757575] focus:border-return-accent focus:outline-none"
        data-testid={`return-reason-details-${itemId}`}
      />

      {/* Upload Photos */}
      <div className="flex flex-col gap-[8px] pt-[7px]">
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="inline-flex items-center gap-[8px] self-start rounded-[8px] border border-[#d1d5db] bg-white px-[25px] py-[13px] transition-colors hover:border-[#9ca3af]"
          data-testid={`return-reason-upload-${itemId}`}
        >
          <Camera size={15} className="text-[#374151]" />
          <span className="pl-[8px] text-[15px] font-medium leading-[22.5px] text-[#374151]">
            {t('returnReasonForm.uploadPhotos')}
          </span>
        </button>
        <p className="text-[12px] font-normal leading-[18px] text-[#6b7280]">
          {t('returnReasonForm.uploadHint')}
        </p>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          aria-label={t('returnReasonForm.uploadAriaLabel')}
        />
      </div>
    </div>
  );
}
