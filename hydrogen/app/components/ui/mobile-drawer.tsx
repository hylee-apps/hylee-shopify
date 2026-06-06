import * as React from 'react';

import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '~/components/ui/sheet';
import {cn} from '~/lib/utils';

/**
 * Bottom-anchored Sheet variant used for mobile filter drawers, order summary
 * drawers, sort sheets, etc. Includes a drag-handle pill at the top edge and
 * iOS safe-area padding. Composes shadcn `Sheet` primitives directly so the
 * existing API (header/footer/close) keeps working.
 */
function MobileDrawer({...props}: React.ComponentProps<typeof Sheet>) {
  return <Sheet {...props} />;
}

function MobileDrawerContent({
  className,
  children,
  showCloseButton = true,
  showHandle = true,
  ...props
}: React.ComponentProps<typeof SheetContent> & {
  showHandle?: boolean;
}) {
  return (
    <SheetContent
      side="bottom"
      showCloseButton={showCloseButton}
      className={cn(
        'max-h-[90vh] rounded-t-2xl pb-safe',
        showHandle && 'pt-3',
        className,
      )}
      {...props}
    >
      {showHandle ? (
        <div
          aria-hidden="true"
          className="mx-auto h-1 w-10 shrink-0 rounded-full bg-border"
        />
      ) : null}
      {children}
    </SheetContent>
  );
}

export {
  MobileDrawer,
  MobileDrawerContent,
  // Re-export Sheet sub-primitives so callers don't need to mix imports.
  SheetClose as MobileDrawerClose,
  SheetDescription as MobileDrawerDescription,
  SheetFooter as MobileDrawerFooter,
  SheetHeader as MobileDrawerHeader,
  SheetTitle as MobileDrawerTitle,
  SheetTrigger as MobileDrawerTrigger,
};
