import {ClipboardList} from 'lucide-react';
import {useTranslation} from 'react-i18next';

// ============================================================================
// Types
// ============================================================================

interface PackingInstructionsProps {
  instructions?: string[];
}

// ============================================================================
// Component
// ============================================================================

export function PackingInstructions({instructions}: PackingInstructionsProps) {
  const {t} = useTranslation('common');

  const defaultInstructions = [
    t('packingInstructions.step1'),
    t('packingInstructions.step2'),
    t('packingInstructions.step3'),
    t('packingInstructions.step4'),
    t('packingInstructions.step5'),
  ];

  const steps = instructions ?? defaultInstructions;

  return (
    <div
      className="flex flex-col gap-[12px] border-t border-[#e5e7eb] pt-[25px]"
      data-testid="packing-instructions"
    >
      {/* Section Title */}
      <div className="flex items-center text-[16px] leading-[24px] text-[#111827]">
        <ClipboardList size={16} className="shrink-0" />
        <span className="font-semibold">
          {' '}
          {t('packingInstructions.sectionTitle')}
        </span>
      </div>

      {/* Ordered List */}
      <ol className="flex flex-col gap-[12px]">
        {steps.map((instruction, idx) => (
          <li key={idx} className="relative pl-[32px]">
            {/* Numbered Circle */}
            <div className="absolute left-0 top-0 flex size-[28px] items-center justify-center rounded-full bg-return-accent">
              <span className="text-[14px] font-bold leading-none text-white">
                {idx + 1}
              </span>
            </div>
            {/* Instruction Text */}
            <span className="text-[14px] font-normal leading-[22.4px] text-[#374151]">
              {instruction}
            </span>
          </li>
        ))}
      </ol>
    </div>
  );
}
