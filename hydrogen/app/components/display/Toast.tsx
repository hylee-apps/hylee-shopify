import React from 'react';
import * as ToastPrimitive from '@radix-ui/react-toast';
import {cva, type VariantProps} from 'class-variance-authority';
import {Icon} from './Icon';
import {cn} from '~/lib/utils';

/* -------------------------------------------------------------------------- */
/*  Variant definitions                                                       */
/* -------------------------------------------------------------------------- */

const toastVariants = cva(
  'group pointer-events-auto relative flex w-full items-center justify-between gap-4 overflow-hidden rounded-xl border p-4 shadow-lg transition-all data-[swipe=cancel]:translate-x-0 data-[swipe=end]:translate-x-[var(--radix-toast-swipe-end-x)] data-[swipe=move]:translate-x-[var(--radix-toast-swipe-move-x)] data-[state=open]:animate-in data-[state=open]:slide-in-from-top-full data-[state=closed]:animate-out data-[state=closed]:fade-out-80 data-[state=closed]:slide-out-to-right-full',
  {
    variants: {
      variant: {
        default: 'border-slate-200 bg-white text-slate-900',
        success:
          'border-green-200 bg-green-50 text-green-900',
        error:
          'border-red-200 bg-red-50 text-red-900',
        warning:
          'border-amber-200 bg-amber-50 text-amber-900',
        info: 'border-blue-200 bg-blue-50 text-blue-900',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  },
);

export type ToastVariant = NonNullable<
  VariantProps<typeof toastVariants>['variant']
>;

/* -------------------------------------------------------------------------- */
/*  Types                                                                     */
/* -------------------------------------------------------------------------- */

export interface ToastProps
  extends React.ComponentPropsWithoutRef<typeof ToastPrimitive.Root>,
    VariantProps<typeof toastVariants> {
  /** Toast title */
  title?: string;
  /** Toast description / body text */
  description?: string;
  /** Optional action element */
  action?: React.ReactNode;
  /** Show close button */
  closable?: boolean;
}

export interface ToasterProps {
  /** Additional className for the viewport */
  className?: string;
}

/* -------------------------------------------------------------------------- */
/*  Icon mapping                                                              */
/* -------------------------------------------------------------------------- */

const variantIcons: Record<string, string> = {
  success: 'check-circle',
  error: 'alert-circle',
  warning: 'alert-triangle',
  info: 'info',
};

/* -------------------------------------------------------------------------- */
/*  Components                                                                */
/* -------------------------------------------------------------------------- */

/**
 * Toast component — powered by Radix Toast for swipe-to-dismiss,
 * automatic timeout, and accessible announcements.
 *
 * @example
 * <Toast variant="success" title="Saved!" description="Your changes have been saved." />
 */
export const Toast = React.forwardRef<
  React.ElementRef<typeof ToastPrimitive.Root>,
  ToastProps
>(({className, variant, title, description, action, closable = true, ...props}, ref) => {
  const iconName = variant ? variantIcons[variant] : undefined;

  return (
    <ToastPrimitive.Root
      ref={ref}
      className={cn(toastVariants({variant}), className)}
      {...props}
    >
      <div className="flex items-start gap-3 flex-1">
        {iconName && (
          <Icon
            name={iconName as any}
            size={20}
            className="shrink-0 mt-0.5"
          />
        )}
        <div className="grid gap-1">
          {title && (
            <ToastPrimitive.Title className="text-sm font-semibold">
              {title}
            </ToastPrimitive.Title>
          )}
          {description && (
            <ToastPrimitive.Description className="text-sm opacity-90">
              {description}
            </ToastPrimitive.Description>
          )}
        </div>
      </div>
      {action && (
        <ToastPrimitive.Action altText="Action" asChild>
          {action}
        </ToastPrimitive.Action>
      )}
      {closable && (
        <ToastPrimitive.Close
          className="absolute right-2 top-2 rounded-md p-1 text-current opacity-0 transition-opacity hover:opacity-100 group-hover:opacity-100 focus:opacity-100 focus:outline-none"
          aria-label="Close"
        >
          <Icon name="x" size={16} />
        </ToastPrimitive.Close>
      )}
    </ToastPrimitive.Root>
  );
});

Toast.displayName = 'Toast';

/**
 * ToastViewport — position container for toasts.
 * Place once in your root layout (e.g. root.tsx).
 */
export function ToastViewport({className}: {className?: string}) {
  return (
    <ToastPrimitive.Viewport
      className={cn(
        'fixed top-0 right-0 z-[var(--z-toast,9999)] flex max-h-screen w-full flex-col-reverse gap-2 p-4 sm:max-w-[420px]',
        className,
      )}
    />
  );
}

/**
 * ToastProvider — wrap your app to enable toast notifications.
 */
export const ToastProvider = ToastPrimitive.Provider;

export {toastVariants};
