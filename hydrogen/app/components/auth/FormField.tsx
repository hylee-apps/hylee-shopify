import {cn} from '~/lib/utils';

// ============================================================================
// Types
// ============================================================================

interface FormFieldProps {
  label: string;
  name: string;
  placeholder: string;
  type?: string;
  defaultValue?: string;
  error?: string;
  hint?: string;
  autoComplete?: string;
}

// ============================================================================
// Component
// ============================================================================

export function FormField({
  label,
  name,
  placeholder,
  type = 'text',
  defaultValue,
  error,
  hint,
  autoComplete,
}: FormFieldProps) {
  return (
    <div className="flex flex-col gap-2">
      <label htmlFor={name} className="text-[14px] font-medium text-[#374151]">
        {label}
      </label>
      <input
        id={name}
        type={type}
        name={name}
        placeholder={placeholder}
        defaultValue={defaultValue ?? ''}
        autoComplete={autoComplete}
        className={cn(
          'h-[44px] w-full rounded-[8px] border bg-white px-[17px] text-[15px] placeholder:text-[#757575] focus:border-secondary focus:outline-none focus:ring-1 focus:ring-secondary',
          error ? 'border-red-400' : 'border-[#d1d5db]',
        )}
      />
      {hint && !error && (
        <p className="text-[12px] leading-[18px] text-[#6b7280]">{hint}</p>
      )}
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  );
}
