import React, {forwardRef} from 'react';
import {Link} from 'react-router';

export type PillVariant =
  | 'default'
  | 'primary'
  | 'secondary'
  | 'info'
  | 'success'
  | 'warning'
  | 'error';
export type PillSize = 'default' | 'sm';

export interface PillProps extends React.HTMLAttributes<HTMLSpanElement> {
  /** Pill variant */
  variant?: PillVariant;
  /** Pill size */
  size?: PillSize;
  /** Icon to render before text */
  icon?: React.ReactNode;
  /** Show close button */
  closable?: boolean;
  /** Close button click handler */
  onClose?: () => void;
  /** Selected state */
  selected?: boolean;
  /** Interactive (hoverable) state */
  interactive?: boolean;
  /** Disabled state */
  disabled?: boolean;
  /** Make pill clickable with this URL */
  url?: string;
  /** Additional CSS classes */
  className?: string;
}

const variantStyles: Record<PillVariant, {base: string; selected: string}> = {
  default: {
    base: 'bg-slate-100 text-slate-700 border-slate-200',
    selected: 'bg-slate-700 text-white border-slate-700',
  },
  primary: {
    base: 'bg-primary/10 text-primary border-primary/20',
    selected: 'bg-primary text-white border-primary',
  },
  secondary: {
    base: 'bg-secondary/10 text-secondary border-secondary/20',
    selected: 'bg-secondary text-white border-secondary',
  },
  info: {
    base: 'bg-blue-50 text-blue-700 border-blue-200',
    selected: 'bg-blue-600 text-white border-blue-600',
  },
  success: {
    base: 'bg-green-50 text-green-700 border-green-200',
    selected: 'bg-green-600 text-white border-green-600',
  },
  warning: {
    base: 'bg-amber-50 text-amber-700 border-amber-200',
    selected: 'bg-amber-500 text-white border-amber-500',
  },
  error: {
    base: 'bg-red-50 text-red-700 border-red-200',
    selected: 'bg-red-600 text-white border-red-600',
  },
};

const sizeStyles: Record<PillSize, string> = {
  default: 'px-2.5 py-1 text-xs',
  sm: 'px-2 py-0.5 text-[10px]',
};

/**
 * Pill component - migrated from theme/snippets/pill.liquid
 *
 * A lightweight, less blocky tag/chip for filters and selections.
 *
 * @example
 * <Pill>Tag</Pill>
 *
 * @example
 * <Pill variant="primary" selected>Selected Filter</Pill>
 *
 * @example
 * <Pill closable onClose={() => console.log('removed')}>
 *   Removable
 * </Pill>
 */
export const Pill = forwardRef<HTMLSpanElement, PillProps>(
  (
    {
      variant = 'default',
      size = 'default',
      icon,
      closable = false,
      onClose,
      selected = false,
      interactive = false,
      disabled = false,
      url,
      className,
      children,
      ...rest
    },
    ref,
  ) => {
    const styles = variantStyles[variant];
    const isInteractive = interactive || !!url;

    const baseClasses =
      'inline-flex items-center gap-1.5 font-medium border rounded-full transition-all';
    const stateClasses = selected ? styles.selected : styles.base;
    const interactiveClasses =
      isInteractive && !disabled ? 'cursor-pointer hover:opacity-80' : '';
    const disabledClasses = disabled
      ? 'opacity-50 cursor-not-allowed pointer-events-none'
      : '';

    const pillClasses = [
      baseClasses,
      sizeStyles[size],
      stateClasses,
      interactiveClasses,
      disabledClasses,
      className,
    ]
      .filter(Boolean)
      .join(' ');

    const content = (
      <>
        {icon && <span className="pill-icon shrink-0">{icon}</span>}
        <span>{children}</span>
        {closable && (
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onClose?.();
            }}
            className="ml-0.5 -mr-0.5 p-0.5 rounded-full hover:bg-black/10 transition-colors"
            aria-label="Remove"
            disabled={disabled}
          >
            <svg
              className="w-3 h-3"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        )}
      </>
    );

    if (url && !disabled) {
      return (
        <Link to={url} className={pillClasses}>
          {content}
        </Link>
      );
    }

    return (
      <span ref={ref} className={pillClasses} {...rest}>
        {content}
      </span>
    );
  },
);

Pill.displayName = 'Pill';

export default Pill;
