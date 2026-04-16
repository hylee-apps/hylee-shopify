import {type ReactNode, forwardRef} from 'react';
import {Search} from 'lucide-react';
import {useTranslation} from 'react-i18next';
import {cn} from '~/lib/utils';

export interface PillInputProps extends Omit<
  React.InputHTMLAttributes<HTMLInputElement>,
  'className'
> {
  /** Tailwind classes applied to the outer pill wrapper */
  className?: string;
  /** Trailing icon (defaults to Search icon at 28px) */
  icon?: ReactNode;
  /** Hide the trailing icon entirely */
  hideIcon?: boolean;
  /** Pulse animation on the default search icon */
  loading?: boolean;
}

export const PillInput = forwardRef<HTMLInputElement, PillInputProps>(
  (
    {className, icon, hideIcon = false, loading = false, ...inputProps},
    ref,
  ) => {
    const {t} = useTranslation();
    return (
      <div
        className={cn(
          'flex items-center border border-secondary rounded-[25px] h-10 px-3.25 bg-white overflow-hidden',
          className,
        )}
      >
        <input
          ref={ref}
          {...inputProps}
          className="flex-1 text-[14px] font-medium text-dark placeholder:text-black/50 bg-transparent outline-none focus:outline-none focus:ring-0 border-none min-w-0"
        />

        {!hideIcon && (
          <button
            type="submit"
            aria-label={t('pillInput.search')}
            className="shrink-0 flex items-center pl-2 focus:outline-none"
          >
            {icon ?? (
              <Search
                size={28}
                className={cn(
                  'text-text-muted',
                  loading && 'text-secondary animate-pulse',
                )}
              />
            )}
          </button>
        )}
      </div>
    );
  },
);

PillInput.displayName = 'PillInput';
