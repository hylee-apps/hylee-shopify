import React, {forwardRef} from 'react';

export type HelperTextType =
  | 'default'
  | 'muted'
  | 'success'
  | 'warning'
  | 'error';

export interface HelperTextProps extends React.HTMLAttributes<HTMLParagraphElement> {
  /** Visual type/state of the helper text */
  type?: HelperTextType;
  /** Icon to render before text */
  icon?: React.ReactNode;
  /** Additional CSS classes */
  className?: string;
}

const typeStyles: Record<HelperTextType, string> = {
  default: 'text-slate-600',
  muted: 'text-slate-400',
  success: 'text-green-600',
  warning: 'text-amber-600',
  error: 'text-red-600',
};

/**
 * HelperText component - migrated from theme/snippets/helper-text.liquid
 *
 * Provides contextual help or error messages for form fields.
 *
 * @example
 * <HelperText>Enter your full email address</HelperText>
 *
 * @example
 * <HelperText type="error">This field is required</HelperText>
 */
export const HelperText = forwardRef<HTMLParagraphElement, HelperTextProps>(
  ({type = 'default', icon, className, children, ...rest}, ref) => {
    const baseClasses = 'flex items-center gap-1.5 text-xs mt-1.5';

    const classes = [baseClasses, typeStyles[type], className]
      .filter(Boolean)
      .join(' ');

    return (
      <p
        ref={ref}
        className={classes}
        role={type === 'error' ? 'alert' : undefined}
        {...rest}
      >
        {icon && <span className="helper-text-icon shrink-0">{icon}</span>}
        <span>{children}</span>
      </p>
    );
  },
);

HelperText.displayName = 'HelperText';

export default HelperText;
