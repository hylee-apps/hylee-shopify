import {Check, ClipboardList, HelpCircle, Truck, SmilePlus} from 'lucide-react';
import type {LucideProps} from 'lucide-react';
import type {ComponentType} from 'react';
import {useTranslation} from 'react-i18next';

// ============================================================================
// Types
// ============================================================================

type StepStatus = 'completed' | 'active' | 'pending';

interface Step {
  label: string;
  icon: ComponentType<LucideProps>;
  status: StepStatus;
  href?: string;
}

/**
 * @param stepUrls — Optional URLs for each step (indices 0–3 = Steps 1–4).
 *   Completed and active steps with a URL become clickable links.
 *   Use `reloadDocument` navigation (full page load) since return routes
 *   aren't resolved by React Router's client-side manifest.
 */
interface ReturnStepProgressProps {
  currentStep: 1 | 2 | 3 | 4;
  stepUrls?: (string | undefined)[];
}

// ============================================================================
// Step icons (stable, no i18n needed)
// ============================================================================

const STEP_ICONS: ComponentType<LucideProps>[] = [
  ClipboardList,
  HelpCircle,
  Truck,
  SmilePlus,
];

// ============================================================================
// Component
// ============================================================================

export function ReturnStepProgress({
  currentStep,
  stepUrls,
}: ReturnStepProgressProps) {
  const {t} = useTranslation('common');

  const stepLabels = [
    t('returnStep.selectItems'),
    t('returnStep.reason'),
    t('returnStep.ship'),
    t('returnStep.makeItRight'),
  ];

  const steps: Step[] = STEP_ICONS.map((icon, idx) => {
    const stepNum = idx + 1;
    let status: StepStatus = 'pending';
    if (stepNum < currentStep) status = 'completed';
    else if (stepNum === currentStep) status = 'active';
    const href = status !== 'pending' ? stepUrls?.[idx] : undefined;
    return {label: stepLabels[idx], icon, status, href};
  });

  return (
    <div
      className="flex items-start justify-center gap-4 pb-8 pt-6"
      data-testid="return-step-progress"
    >
      {steps.map((step, idx) => (
        <div key={step.label} className="flex items-start gap-4">
          {/* Step */}
          <StepItem step={step} index={idx} />

          {/* Connector line (between steps, not after the last) */}
          {idx < steps.length - 1 && (
            <div className="mt-[23px] h-[2px] w-[60px] shrink-0 bg-[#e5e7eb]" />
          )}
        </div>
      ))}
    </div>
  );
}

// ============================================================================
// Step Item (clickable or static)
// ============================================================================

function StepItem({step, index}: {step: Step; index: number}) {
  const content = (
    <div
      className={`flex flex-col items-center gap-2 ${
        step.status === 'pending' ? 'opacity-40' : ''
      } ${step.href ? 'cursor-pointer' : ''}`}
      data-testid={`return-step-${index + 1}`}
    >
      {/* Circle */}
      <div
        className={`relative flex size-[48px] items-center justify-center rounded-full transition-opacity ${
          step.status === 'active' || step.status === 'completed'
            ? 'bg-return-accent'
            : 'bg-[#e5e7eb]'
        } ${step.href ? 'group-hover/step:opacity-80' : ''}`}
      >
        {/* Shadow ring for active step */}
        {step.status === 'active' && (
          <div className="absolute inset-0 rounded-full shadow-[0_0_0_4px_rgba(38,153,166,0.2)]" />
        )}
        {/* Icon */}
        {step.status === 'completed' ? (
          <Check size={20} className="text-white" strokeWidth={3} />
        ) : (
          <step.icon
            size={20}
            className={
              step.status === 'active' ? 'text-white' : 'text-[#4b5563]'
            }
          />
        )}
      </div>
      {/* Label */}
      <span
        className={`whitespace-nowrap text-[13px] font-medium leading-[19.5px] text-[#4b5563] ${
          step.href ? 'group-hover/step:text-return-accent' : ''
        }`}
      >
        {step.label}
      </span>
    </div>
  );

  if (step.href) {
    return (
      <a
        href={step.href}
        className="group/step no-underline"
        data-testid={`return-step-link-${index + 1}`}
      >
        {content}
      </a>
    );
  }

  return content;
}
