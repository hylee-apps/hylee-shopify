import React from 'react';
import * as DialogPrimitive from '@radix-ui/react-dialog';
import {VisuallyHidden} from '@radix-ui/react-visually-hidden';
import {cva, type VariantProps} from 'class-variance-authority';
import {Icon} from '../display/Icon';
import {cn} from '~/lib/utils';

/* -------------------------------------------------------------------------- */
/*  Variant definitions                                                       */
/* -------------------------------------------------------------------------- */

const sheetVariants = cva(
  'fixed z-[var(--z-modal,1050)] bg-white shadow-xl transition ease-in-out data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=open]:duration-300 data-[state=closed]:duration-200',
  {
    variants: {
      side: {
        top: 'inset-x-0 top-0 border-b data-[state=open]:slide-in-from-top data-[state=closed]:slide-out-to-top',
        right:
          'inset-y-0 right-0 h-full w-3/4 border-l data-[state=open]:slide-in-from-right data-[state=closed]:slide-out-to-right sm:max-w-sm',
        bottom:
          'inset-x-0 bottom-0 border-t data-[state=open]:slide-in-from-bottom data-[state=closed]:slide-out-to-bottom',
        left: 'inset-y-0 left-0 h-full w-3/4 border-r data-[state=open]:slide-in-from-left data-[state=closed]:slide-out-to-left sm:max-w-sm',
      },
    },
    defaultVariants: {
      side: 'right',
    },
  },
);

export type SheetSide = NonNullable<
  VariantProps<typeof sheetVariants>['side']
>;

/* -------------------------------------------------------------------------- */
/*  Types                                                                     */
/* -------------------------------------------------------------------------- */

export interface SheetProps {
  /** Whether the sheet is open */
  open: boolean;
  /** Callback when the sheet should close */
  onClose: () => void;
  /** Sheet title (shown in header, required for accessibility) */
  title?: string;
  /** Sheet description */
  description?: string;
  /** Which side the sheet slides from */
  side?: SheetSide;
  /** Show close button */
  closable?: boolean;
  /** Sheet footer content */
  footer?: React.ReactNode;
  /** Additional CSS classes for the content panel */
  className?: string;
  /** Sheet body content */
  children: React.ReactNode;
}

/* -------------------------------------------------------------------------- */
/*  Component                                                                 */
/* -------------------------------------------------------------------------- */

/**
 * Sheet / Drawer component — slides in from a screen edge.
 *
 * Built on Radix Dialog for accessible focus trapping, portal, and overlay.
 * Ideal for cart drawers, mobile navigation, filter sidebars, etc.
 *
 * @example
 * const [open, setOpen] = useState(false);
 *
 * <Button onClick={() => setOpen(true)}>Open Cart</Button>
 * <Sheet
 *   open={open}
 *   onClose={() => setOpen(false)}
 *   title="Your Cart"
 *   side="right"
 * >
 *   <CartContents />
 * </Sheet>
 */
export function Sheet({
  open,
  onClose,
  title,
  description,
  side = 'right',
  closable = true,
  footer,
  className,
  children,
}: SheetProps) {
  return (
    <DialogPrimitive.Root open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogPrimitive.Portal>
        {/* Overlay */}
        <DialogPrimitive.Overlay className="fixed inset-0 z-[var(--z-modal-backdrop,1040)] bg-black/50 data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=closed]:animate-out data-[state=closed]:fade-out-0" />

        {/* Sheet panel */}
        <DialogPrimitive.Content
          className={cn(sheetVariants({side}), className)}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-slate-200">
            {title ? (
              <DialogPrimitive.Title className="text-lg font-semibold text-slate-900">
                {title}
              </DialogPrimitive.Title>
            ) : (
              <VisuallyHidden asChild>
                <DialogPrimitive.Title>Sheet</DialogPrimitive.Title>
              </VisuallyHidden>
            )}
            {closable && (
              <DialogPrimitive.Close
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors ml-auto cursor-pointer"
                aria-label="Close"
              >
                <Icon name="x" size={20} />
              </DialogPrimitive.Close>
            )}
          </div>

          {/* Description (visually hidden when not provided) */}
          {description ? (
            <DialogPrimitive.Description className="px-4 pt-2 text-sm text-slate-500">
              {description}
            </DialogPrimitive.Description>
          ) : (
            <VisuallyHidden asChild>
              <DialogPrimitive.Description>
                Sheet content
              </DialogPrimitive.Description>
            </VisuallyHidden>
          )}

          {/* Body */}
          <div className="flex-1 overflow-y-auto p-4">{children}</div>

          {/* Footer */}
          {footer && (
            <div className="flex items-center justify-end gap-3 p-4 border-t border-slate-200">
              {footer}
            </div>
          )}
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}

export {sheetVariants};
