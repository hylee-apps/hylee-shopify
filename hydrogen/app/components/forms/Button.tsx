import React, {forwardRef} from 'react';
import {Link, type LinkProps} from 'react-router';

export type ButtonVariant =
  | 'primary'
  | 'secondary'
  | 'destructive'
  | 'outline'
  | 'ghost'
  | 'link';
export type ButtonSize = 'default' | 'sm' | 'lg' | 'icon';

export interface ButtonBaseProps {
  /** Button visual variant */
  variant?: ButtonVariant;
  /** Button size */
  size?: ButtonSize;
  /** Show loading spinner and disable button */
  loading?: boolean;
  /** Render as full width */
  fullWidth?: boolean;
  /** Render with pill/rounded style */
  pill?: boolean;
  /** Icon element to render */
  icon?: React.ReactNode;
  /** Position of the icon */
  iconPosition?: 'left' | 'right';
  /** Additional CSS classes */
  className?: string;
  /** Button children/text content */
  children?: React.ReactNode;
}

export interface ButtonAsButtonProps
  extends
    ButtonBaseProps,
    Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'children'> {
  as?: 'button';
  to?: never;
}

export interface ButtonAsLinkProps
  extends ButtonBaseProps, Omit<LinkProps, 'children' | 'className'> {
  as: 'link';
  to: string;
  disabled?: boolean;
}

export type ButtonProps = ButtonAsButtonProps | ButtonAsLinkProps;

const variantStyles: Record<ButtonVariant, string> = {
  primary:
    'bg-gradient-to-br from-primary to-accent text-white border-transparent hover:from-primary/90 hover:to-accent/90 hover:-translate-y-px hover:shadow-lg',
  secondary:
    'bg-slate-100 text-slate-700 border-transparent hover:bg-slate-200',
  destructive: 'bg-red-500 text-white border-transparent hover:bg-red-600',
  outline: 'bg-transparent border-slate-200 text-slate-700 hover:bg-slate-50',
  ghost: 'bg-transparent border-transparent text-slate-700 hover:bg-slate-50',
  link: 'bg-transparent border-transparent text-primary underline underline-offset-4 hover:no-underline',
};

const sizeStyles: Record<ButtonSize, string> = {
  default: 'h-9 px-4 py-2 text-sm',
  sm: 'h-8 px-3 text-xs',
  lg: 'h-10 px-6 text-base',
  icon: 'h-9 w-9 p-0',
};

function getButtonClasses({
  variant = 'primary',
  size = 'default',
  fullWidth,
  pill,
  loading,
  disabled,
  className,
}: Pick<
  ButtonBaseProps,
  'variant' | 'size' | 'fullWidth' | 'pill' | 'loading' | 'className'
> & {disabled?: boolean}) {
  const baseClasses =
    'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-[0.75rem] font-medium leading-none transition-all duration-200 cursor-pointer outline-none border focus-visible:outline-2 focus-visible:outline-primary focus-visible:outline-offset-2 focus-visible:ring-4 focus-visible:ring-primary/15';

  const disabledClasses =
    disabled || loading
      ? 'pointer-events-none opacity-50 cursor-not-allowed'
      : '';

  const widthClasses = fullWidth ? 'w-full' : '';
  const pillClasses = pill ? 'rounded-full' : '';

  return [
    baseClasses,
    variantStyles[variant],
    sizeStyles[size],
    disabledClasses,
    widthClasses,
    pillClasses,
    className,
  ]
    .filter(Boolean)
    .join(' ');
}

function LoadingSpinner() {
  return (
    <svg
      className="h-4 w-4 animate-spin"
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
      />
    </svg>
  );
}

/**
 * Button component - migrated from theme/snippets/button.liquid
 *
 * Supports rendering as a <button> element or as a Remix <Link> component.
 *
 * @example
 * // As button
 * <Button variant="primary" onClick={handleClick}>Click Me</Button>
 *
 * @example
 * // As link
 * <Button as="link" to="/products" variant="secondary">View Products</Button>
 */
export const Button = forwardRef<
  HTMLButtonElement | HTMLAnchorElement,
  ButtonProps
>((props, ref) => {
  const {
    variant = 'primary',
    size = 'default',
    loading = false,
    fullWidth = false,
    pill = false,
    icon,
    iconPosition = 'left',
    children,
    className,
    ...rest
  } = props;

  const classes = getButtonClasses({
    variant,
    size,
    fullWidth,
    pill,
    loading,
    disabled: props.disabled,
    className,
  });

  const content = (
    <>
      {loading && <LoadingSpinner />}
      {!loading && icon && iconPosition === 'left' && icon}
      {children && <span>{children}</span>}
      {!loading && icon && iconPosition === 'right' && icon}
    </>
  );

  if (props.as === 'link') {
    const {to, disabled, ...linkRest} = rest as Omit<
      ButtonAsLinkProps,
      | 'variant'
      | 'size'
      | 'loading'
      | 'fullWidth'
      | 'pill'
      | 'icon'
      | 'iconPosition'
      | 'children'
      | 'className'
      | 'as'
    > & {to: string; disabled?: boolean};

    return (
      <Link
        ref={ref as React.Ref<HTMLAnchorElement>}
        to={to}
        className={classes}
        aria-disabled={disabled || loading || undefined}
        {...linkRest}
      >
        {content}
      </Link>
    );
  }

  const {type = 'button', ...buttonRest} = rest as Omit<
    ButtonAsButtonProps,
    | 'variant'
    | 'size'
    | 'loading'
    | 'fullWidth'
    | 'pill'
    | 'icon'
    | 'iconPosition'
    | 'children'
    | 'className'
    | 'as'
  >;

  return (
    <button
      ref={ref as React.Ref<HTMLButtonElement>}
      type={type}
      className={classes}
      disabled={props.disabled || loading}
      {...buttonRest}
    >
      {content}
    </button>
  );
});

Button.displayName = 'Button';

export default Button;
