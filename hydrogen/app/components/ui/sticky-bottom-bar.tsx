import * as React from 'react';

import {cn} from '~/lib/utils';

/**
 * Mobile-only sticky bar pinned to the bottom of the viewport, used for
 * primary CTAs (e.g. PDP Add-to-Cart, cart Checkout) so the action stays in
 * reach as the user scrolls.
 *
 * iOS safe-area handled via `pb-safe`. Pages that render this should add
 * `pb-24 lg:pb-0` to their wrapper so content isn't hidden behind the bar.
 */
function StickyBottomBar({className, ...props}: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="sticky-bottom-bar"
      className={cn(
        'fixed inset-x-0 bottom-0 z-1030 border-t border-border bg-background pb-safe shadow-[0_-4px_12px_-4px_rgba(0,0,0,0.08)] lg:hidden',
        className,
      )}
      {...props}
    />
  );
}

export {StickyBottomBar};
