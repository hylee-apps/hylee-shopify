'use client';

import {useState, type ReactNode} from 'react';

import {
  MobileDrawer,
  MobileDrawerContent,
  MobileDrawerHeader,
  MobileDrawerTitle,
} from '~/components/ui/mobile-drawer';
import {StickyBottomBar} from '~/components/ui/sticky-bottom-bar';

export interface MobileSummaryDrawerProps {
  /** Title shown at the top of the drawer (e.g. "Order Summary"). */
  title: string;
  /** Body of the drawer — typically the desktop sidebar's body content. */
  children: ReactNode;
  /**
   * Render-prop for the sticky bottom bar. Receives an `openSummary`
   * callback that opens the drawer when invoked. Lets callers compose any
   * layout (price + checkout CTA, step actions, etc.) without coupling.
   */
  stickyBar: (props: {openSummary: () => void}) => ReactNode;
}

/**
 * MobileSummaryDrawer — pairs a `StickyBottomBar` with a bottom-anchored
 * `Sheet` so phones get an out-of-the-way order summary plus an always-
 * reachable primary action.
 *
 * Reused by the cart and the four checkout steps (shipping/payment/review/
 * confirmation). Both halves are `lg:hidden` via the underlying primitives,
 * so desktop layouts keep their inline sticky sidebar untouched.
 *
 * Pages that mount this should add `pb-24 lg:pb-0` to their wrapper so the
 * sticky bar doesn't cover the bottom of the page.
 */
export function MobileSummaryDrawer({
  title,
  children,
  stickyBar,
}: MobileSummaryDrawerProps) {
  const [open, setOpen] = useState(false);
  const openSummary = () => setOpen(true);

  return (
    <>
      <StickyBottomBar>{stickyBar({openSummary})}</StickyBottomBar>
      <MobileDrawer open={open} onOpenChange={setOpen}>
        <MobileDrawerContent>
          <MobileDrawerHeader>
            <MobileDrawerTitle>{title}</MobileDrawerTitle>
          </MobileDrawerHeader>
          <div className="flex-1 overflow-y-auto px-4 pb-4">{children}</div>
        </MobileDrawerContent>
      </MobileDrawer>
    </>
  );
}

export default MobileSummaryDrawer;
