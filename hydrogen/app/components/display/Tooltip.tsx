import React from 'react';
import * as TooltipPrimitive from '@radix-ui/react-tooltip';
import {cn} from '~/lib/utils';

/* -------------------------------------------------------------------------- */
/*  Provider                                                                  */
/* -------------------------------------------------------------------------- */

/**
 * TooltipProvider — wrap your app to enable tooltips with shared delay.
 *
 * @example
 * // In root.tsx
 * <TooltipProvider>
 *   <Outlet />
 * </TooltipProvider>
 */
export const TooltipProvider = TooltipPrimitive.Provider;

/* -------------------------------------------------------------------------- */
/*  Core parts                                                                */
/* -------------------------------------------------------------------------- */

export const TooltipRoot = TooltipPrimitive.Root;
export const TooltipTrigger = TooltipPrimitive.Trigger;

/* -------------------------------------------------------------------------- */
/*  Content                                                                   */
/* -------------------------------------------------------------------------- */

export const TooltipContent = React.forwardRef<
  React.ElementRef<typeof TooltipPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof TooltipPrimitive.Content>
>(({className, sideOffset = 4, ...props}, ref) => (
  <TooltipPrimitive.Portal>
    <TooltipPrimitive.Content
      ref={ref}
      sideOffset={sideOffset}
      className={cn(
        'z-50 overflow-hidden rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm text-slate-900 shadow-md',
        'animate-in fade-in-0 zoom-in-95',
        'data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95',
        'data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2',
        'data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2',
        className,
      )}
      {...props}
    />
  </TooltipPrimitive.Portal>
));
TooltipContent.displayName = 'TooltipContent';

/* -------------------------------------------------------------------------- */
/*  Simplified all-in-one Tooltip                                             */
/* -------------------------------------------------------------------------- */

export interface TooltipProps {
  /** The element that triggers the tooltip */
  children: React.ReactNode;
  /** Tooltip text content */
  content: React.ReactNode;
  /** Which side the tooltip appears on */
  side?: 'top' | 'right' | 'bottom' | 'left';
  /** Offset in px from the trigger */
  sideOffset?: number;
  /** Additional className for the content */
  className?: string;
  /** Delay before showing in ms */
  delayDuration?: number;
}

/**
 * Simple Tooltip component — single-element API for common use-cases.
 *
 * For complex trigger patterns, use `TooltipRoot` + `TooltipTrigger` + `TooltipContent`.
 *
 * @example
 * <Tooltip content="Add to cart">
 *   <Button variant="ghost" icon="shopping-cart" />
 * </Tooltip>
 */
export function Tooltip({
  children,
  content,
  side = 'top',
  sideOffset = 4,
  className,
  delayDuration = 200,
}: TooltipProps) {
  return (
    <TooltipPrimitive.Provider delayDuration={delayDuration}>
      <TooltipPrimitive.Root>
        <TooltipPrimitive.Trigger asChild>{children}</TooltipPrimitive.Trigger>
        <TooltipContent side={side} sideOffset={sideOffset} className={className}>
          {content}
        </TooltipContent>
      </TooltipPrimitive.Root>
    </TooltipPrimitive.Provider>
  );
}
