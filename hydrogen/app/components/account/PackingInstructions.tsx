import {ClipboardList} from 'lucide-react';

// ============================================================================
// Constants
// ============================================================================

const DEFAULT_INSTRUCTIONS = [
  'Pack items securely in their original packaging when possible',
  'Include all accessories, tags, and original materials',
  'Seal the box tightly with strong packing tape',
  'Attach the return label to the outside of the package (or show QR code)',
  'Remove or cover any old shipping labels',
];

// ============================================================================
// Types
// ============================================================================

interface PackingInstructionsProps {
  instructions?: string[];
}

// ============================================================================
// Component
// ============================================================================

export function PackingInstructions({
  instructions = DEFAULT_INSTRUCTIONS,
}: PackingInstructionsProps) {
  return (
    <div
      className="flex flex-col gap-[12px] border-t border-[#e5e7eb] pt-[25px]"
      data-testid="packing-instructions"
    >
      {/* Section Title */}
      <div className="flex items-center text-[16px] leading-[24px] text-[#111827]">
        <ClipboardList size={16} className="shrink-0" />
        <span className="font-semibold"> Packing Instructions</span>
      </div>

      {/* Ordered List */}
      <ol className="flex flex-col gap-[12px]">
        {instructions.map((instruction, idx) => (
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
