import {useRef} from 'react';
import {Camera} from 'lucide-react';

// ============================================================================
// Types
// ============================================================================

const RETURN_REASONS = [
  'Defective',
  'Wrong Item',
  'Not as Described',
  'Changed Mind',
] as const;

export type ReturnReason = (typeof RETURN_REASONS)[number];

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
  const fileInputRef = useRef<HTMLInputElement>(null);

  return (
    <div
      className="flex flex-1 flex-col gap-[12px] border-t border-[#e5e7eb] pt-[17px]"
      data-testid={`return-reason-form-${itemId}`}
    >
      {/* Label */}
      <label className="text-[13px] font-normal leading-[19.5px] text-[#6b7280]">
        Reason for return:
      </label>

      {/* Reason Options Grid */}
      <div className="grid grid-cols-2 gap-[12px]">
        {RETURN_REASONS.map((opt) => (
          <button
            key={opt}
            type="button"
            onClick={() => onReasonChange(opt)}
            className={`rounded-[8px] border px-[17px] py-[13px] text-center text-[14px] leading-[21px] transition-colors ${
              reason === opt
                ? 'border-return-accent bg-[rgba(38,153,166,0.05)] font-medium text-return-accent'
                : 'border-[#d1d5db] font-normal text-[#1f2937] hover:border-[#9ca3af]'
            }`}
            data-testid={`return-reason-option-${opt.toLowerCase().replace(/\s+/g, '-')}`}
          >
            {opt}
          </button>
        ))}
      </div>

      {/* Additional Details Textarea */}
      <textarea
        placeholder="Additional details (optional)"
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
            Upload Photos
          </span>
        </button>
        <p className="text-[12px] font-normal leading-[18px] text-[#6b7280]">
          Add photos to support your return request
        </p>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          aria-label="Upload return photos"
        />
      </div>
    </div>
  );
}
