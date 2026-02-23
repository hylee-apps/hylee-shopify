import {Link} from 'react-router';
import {Check} from 'lucide-react';
import {cn} from '~/lib/utils';

export type CheckoutStep = 'cart' | 'payment' | 'shipping' | 'review';

interface Step {
  id: CheckoutStep;
  label: string;
  number: number;
  href: string;
}

const STEPS: Step[] = [
  {id: 'cart', label: 'Cart', number: 1, href: '/cart'},
  {id: 'payment', label: 'Payment', number: 2, href: '/checkout/payment'},
  {id: 'shipping', label: 'Shipping', number: 3, href: '/checkout/shipping'},
  {id: 'review', label: 'Review', number: 4, href: '/checkout/review'},
];

interface CheckoutProgressProps {
  currentStep: CheckoutStep;
}

export function CheckoutProgress({currentStep}: CheckoutProgressProps) {
  const currentIndex = STEPS.findIndex((s) => s.id === currentStep);

  return (
    <div className="w-full border-b border-border bg-white py-6">
      <div className="flex items-center justify-center">
        {STEPS.map((step, idx) => {
          const isActive = step.id === currentStep;
          const isCompleted = idx < currentIndex;

          const badge = (
            <div
              className={cn(
                'flex size-7 items-center justify-center rounded-full text-xs font-bold',
                isCompleted
                  ? 'bg-secondary text-white'
                  : isActive
                    ? 'bg-primary text-white'
                    : 'bg-border text-[#4b5563]',
              )}
            >
              {isCompleted ? <Check size={12} strokeWidth={3} /> : step.number}
            </div>
          );

          const label = (
            <span
              className={cn(
                'whitespace-nowrap text-sm font-medium',
                isCompleted
                  ? 'text-secondary'
                  : isActive
                    ? 'text-primary'
                    : 'text-[#9ca3af]',
              )}
            >
              {step.label}
            </span>
          );

          return (
            <div key={step.id} className="flex items-center">
              {/* Step — clickable if completed */}
              {isCompleted ? (
                <Link
                  to={step.href}
                  className="flex items-center gap-2 transition-opacity hover:opacity-80"
                >
                  {badge}
                  {label}
                </Link>
              ) : (
                <div className="flex items-center gap-2">
                  {badge}
                  {label}
                </div>
              )}

              {/* Divider — not after last step */}
              {idx < STEPS.length - 1 && (
                <div
                  className={cn(
                    'mx-2 h-0.5 w-10',
                    idx <= currentIndex ? 'bg-primary' : 'bg-border',
                  )}
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
