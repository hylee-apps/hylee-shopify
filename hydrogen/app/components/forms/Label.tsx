import React, {forwardRef} from 'react';

export type LabelSize = 'default' | 'sm' | 'lg';

export interface LabelProps extends React.LabelHTMLAttributes<HTMLLabelElement> {
  /** Size variant */
  size?: LabelSize;
  /** Show required indicator */
  required?: boolean;
  /** Show optional indicator */
  optional?: boolean;
  /** Error state styling */
  error?: boolean;
  /** Icon to render before text */
  icon?: React.ReactNode;
  /** Help text to display inline */
  help?: string;
  /** Additional CSS classes */
  className?: string;
}

const sizeStyles: Record<LabelSize, string> = {
  default: 'text-sm',
  sm: 'text-xs',
  lg: 'text-base',
};

/**
 * Label component - migrated from theme/snippets/label.liquid
 *
 * @example
 * <Label htmlFor="email" required>Email Address</Label>
 */
export const Label = forwardRef<HTMLLabelElement, LabelProps>(
  (
    {
      size = 'default',
      required = false,
      optional = false,
      error = false,
      icon,
      help,
      className,
      children,
      ...rest
    },
    ref,
  ) => {
    const baseClasses =
      'inline-flex items-center gap-1.5 font-medium text-slate-700';
    const errorClasses = error ? 'text-red-600' : '';

    const classes = [baseClasses, sizeStyles[size], errorClasses, className]
      .filter(Boolean)
      .join(' ');

    return (
      <label ref={ref} className={classes} {...rest}>
        {icon && <span className="label-icon">{icon}</span>}
        {children}
        {required && (
          <span className="text-red-500 ml-0.5" aria-hidden="true">
            *
          </span>
        )}
        {optional && !required && (
          <span className="text-slate-400 font-normal">(optional)</span>
        )}
        {help && <span className="text-slate-400 font-normal">{help}</span>}
      </label>
    );
  },
);

Label.displayName = 'Label';

export default Label;
