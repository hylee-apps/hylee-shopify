import type {ComponentType} from 'react';
import {Check} from 'lucide-react';
import type {LucideProps} from 'lucide-react';

// ============================================================================
// Types
// ============================================================================

export interface ProgressStep {
  label: string;
  status: 'completed' | 'active' | 'pending';
  icon: ComponentType<LucideProps>;
}

interface ReturnProgressTrackerProps {
  steps: ProgressStep[];
}

// ============================================================================
// ReturnProgressTracker Component
// ============================================================================

export function ReturnProgressTracker({steps}: ReturnProgressTrackerProps) {
  return (
    <div className="w-full overflow-x-auto rounded-[8px] bg-[#f9fafb] p-[16px]">
      <div className="relative flex w-full min-w-[500px] items-center justify-between">
        {/* Connecting line */}
        <div className="absolute left-0 right-0 top-[15px] z-0 h-[3px] bg-[#d1d5db]" />

        {/* Steps */}
        {steps.map((step) => (
          <div
            key={step.label}
            className="relative z-10 flex flex-1 flex-col items-center gap-[8px]"
          >
            <StepIcon step={step} />
            <span
              className={`text-center text-[12px] font-medium leading-[18px] whitespace-nowrap ${
                step.status === 'pending' ? 'text-[#4b5563]' : 'text-[#111827]'
              }`}
            >
              {step.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ============================================================================
// StepIcon Sub-component
// ============================================================================

function StepIcon({step}: {step: ProgressStep}) {
  const Icon = step.icon;

  switch (step.status) {
    case 'completed':
      return (
        <div className="flex size-[32px] items-center justify-center rounded-[16px] bg-[#2ac864]">
          <Check size={14} className="text-white" />
        </div>
      );
    case 'active':
      return (
        <div className="flex size-[32px] items-center justify-center rounded-[16px] bg-[#2699a6] shadow-[0px_0px_0px_4px_rgba(38,153,166,0.2)]">
          <Icon size={14} className="text-white" />
        </div>
      );
    case 'pending':
      return (
        <div className="flex size-[32px] items-center justify-center rounded-[16px] bg-[#d1d5db]">
          <Icon size={14} className="text-[#6b7280]" />
        </div>
      );
  }
}
