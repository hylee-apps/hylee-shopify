import type {ComponentType} from 'react';
import type {LucideProps} from 'lucide-react';

// ============================================================================
// Types
// ============================================================================

export interface ResolutionOption {
  id: string;
  icon: ComponentType<LucideProps>;
  title: string;
  description: string;
}

interface ResolutionOptionCardProps {
  option: ResolutionOption;
  selected: boolean;
  onSelect: () => void;
}

// ============================================================================
// Component
// ============================================================================

export function ResolutionOptionCard({
  option,
  selected,
  onSelect,
}: ResolutionOptionCardProps) {
  const Icon = option.icon;

  return (
    <button
      type="button"
      onClick={onSelect}
      className={`relative h-[171.5px] cursor-pointer rounded-[12px] border-2 transition-all ${
        selected
          ? 'border-return-accent bg-[rgba(38,153,166,0.05)] shadow-[0_4px_6px_-1px_rgba(0,0,0,0.1),0_2px_4px_-1px_rgba(0,0,0,0.06)]'
          : 'border-[#e5e7eb] bg-white hover:border-[#d1d5db]'
      }`}
      data-testid={`resolution-option-${option.id}`}
    >
      {/* Icon Container */}
      <div
        className={`absolute left-1/2 top-[20px] flex size-[64px] -translate-x-1/2 items-center justify-center rounded-full transition-colors ${
          selected ? 'bg-[rgba(79,209,168,0.15)]' : 'bg-[#f3f4f6]'
        }`}
      >
        <Icon
          size={28}
          className={`transition-colors ${
            selected ? 'text-return-accent' : 'text-[#4b5563]'
          }`}
        />
      </div>

      {/* Title */}
      <h3 className="absolute left-[20px] right-[20px] top-[96px] text-center text-[16px] font-semibold leading-[24px] text-[#111827]">
        {option.title}
      </h3>

      {/* Description */}
      <p className="absolute left-[20px] right-[20px] top-[128px] text-center text-[13px] font-normal leading-[19.5px] text-[#4b5563]">
        {option.description}
      </p>
    </button>
  );
}
