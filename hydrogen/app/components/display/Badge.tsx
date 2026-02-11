import React, {forwardRef} from 'react';
import {Link} from 'react-router';

export type BadgeVariant =
  | 'default'
  | 'secondary'
  | 'destructive'
  | 'outline'
  | 'success'
  | 'warning'
  | 'info';
export type BadgeSize = 'default' | 'sm' | 'lg';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  /** Badge variant */
  variant?: BadgeVariant;
  /** Badge size */
  size?: BadgeSize;
  /** Icon to render before text */
  icon?: React.ReactNode;
  /** Show dot indicator */
  dot?: boolean;
  /** Pill (rounded) shape */
  pill?: boolean;
  /** Show close button */
  closable?: boolean;
  /** Close button click handler */
  onClose?: () => void;
  /** Make badge clickable with this URL */
  url?: string;
  /** Additional CSS classes */
  className?: string;
}

const variantStyles: Record<BadgeVariant, string> = {
  default: 'bg-primary/10 text-primary border-primary/20',
  secondary: 'bg-slate-100 text-slate-700 border-slate-200',
  destructive: 'bg-red-100 text-red-700 border-red-200',
  outline: 'bg-transparent text-slate-700 border-slate-300',
  success: 'bg-green-100 text-green-700 border-green-200',
  warning: 'bg-amber-100 text-amber-700 border-amber-200',
  info: 'bg-blue-100 text-blue-700 border-blue-200',
};

const sizeStyles: Record<BadgeSize, string> = {
  default: 'px-2.5 py-0.5 text-xs',
  sm: 'px-2 py-px text-[10px]',
  lg: 'px-3 py-1 text-sm',
};

/**
 * Badge component - migrated from theme/snippets/badge.liquid
 *
 * A small label for highlighting status, counts, or categories.
 *
 * @example
 * <Badge>New</Badge>
 *
 * @example
 * <Badge variant="success" icon={<CheckIcon />}>Verified</Badge>
 *
 * @example
 * <Badge variant="destructive" closable onClose={() => console.log('closed')}>
 *   Sale
 * </Badge>
 */
export const Badge = forwardRef<HTMLSpanElement, BadgeProps>(
  (
    {
      variant = 'default',
      size = 'default',
      icon,
      dot = false,
      pill = false,
      closable = false,
      onClose,
      url,
      className,
      children,
      ...rest
    },
    ref,
  ) => {
    const baseClasses =
      'inline-flex items-center gap-1 font-medium border transition-colors';
    const shapeClasses = pill ? 'rounded-full' : 'rounded-md';
    const interactiveClasses = url ? 'hover:opacity-80 cursor-pointer' : '';

    const badgeClasses = [
      baseClasses,
      variantStyles[variant],
      sizeStyles[size],
      shapeClasses,
      interactiveClasses,
      className,
    ]
      .filter(Boolean)
      .join(' ');

    const content = (
      <>
        {dot && (
          <span
            className="w-1.5 h-1.5 rounded-full bg-current"
            aria-hidden="true"
          />
        )}
        {icon && <span className="badge-icon shrink-0">{icon}</span>}
        <span>{children}</span>
        {closable && (
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onClose?.();
            }}
            className="ml-0.5 -mr-1 p-0.5 rounded hover:bg-black/10 transition-colors"
            aria-label="Remove"
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

    if (url) {
      return (
        <Link to={url} className={badgeClasses}>
          {content}
        </Link>
      );
    }

    return (
      <span ref={ref} className={badgeClasses} {...rest}>
        {content}
      </span>
    );
  },
);

Badge.displayName = 'Badge';

export default Badge;
