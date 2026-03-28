import {Link} from 'react-router';
import {ArrowLeft, ArrowRight} from 'lucide-react';

// ============================================================================
// Types
// ============================================================================

interface ReturnActionBarProps {
  backHref: string;
  backLabel?: string;
  continueLabel?: string;
  onContinue?: () => void;
  continueHref?: string;
  disabled?: boolean;
}

// ============================================================================
// Component
// ============================================================================

export function ReturnActionBar({
  backHref,
  backLabel = 'Back to Orders',
  continueLabel = 'Continue to Reason',
  onContinue,
  continueHref,
  disabled = false,
}: ReturnActionBarProps) {
  return (
    <div className="sticky bottom-0 z-[1020] border-t border-[#e5e7eb] bg-white shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)]">
      <div className="flex items-center justify-between px-6 py-4">
        {/* Back Button */}
        <Link
          to={backHref}
          className="inline-flex items-center gap-2 rounded-lg border border-[#d1d5db] bg-white px-[25px] py-[13px] text-[15px] font-medium leading-[22.5px] text-[#374151] transition-colors hover:bg-[#f9fafb]"
          data-testid="return-back-btn"
        >
          <ArrowLeft size={15} />
          <span className="pl-2">{backLabel}</span>
        </Link>

        {/* Continue Button */}
        {continueHref && !disabled ? (
          <Link
            to={continueHref}
            className="inline-flex items-center gap-2 rounded-lg bg-return-accent px-6 py-3 text-[15px] font-medium text-white transition-opacity hover:opacity-90"
            data-testid="return-continue-btn"
          >
            <span>{continueLabel}</span>
            <ArrowRight size={15} className="ml-2" />
          </Link>
        ) : (
          <button
            type="button"
            onClick={onContinue}
            disabled={disabled}
            className={`inline-flex items-center gap-2 rounded-lg bg-return-accent px-6 py-3 text-[15px] font-medium text-white transition-opacity ${
              disabled ? 'cursor-not-allowed opacity-50' : 'hover:opacity-90'
            }`}
            data-testid="return-continue-btn"
          >
            <span>{continueLabel}</span>
            <ArrowRight size={15} className="ml-2" />
          </button>
        )}
      </div>
    </div>
  );
}
