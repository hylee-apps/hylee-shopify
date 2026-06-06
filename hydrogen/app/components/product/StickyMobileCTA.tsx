'use client';

import {
  useEffect,
  useRef,
  useState,
  type ReactNode,
  type RefObject,
} from 'react';
import {Plus} from 'lucide-react';

import {AddToCart} from '~/components/commerce/AddToCart';
import {StickyBottomBar} from '~/components/ui/sticky-bottom-bar';

export interface StickyMobileCTAProps {
  /** Variant ID to add when the bar's CTA is tapped. */
  variantId: string;
  /** Quantity (driven by the parent's QuantitySelector state). */
  quantity: number;
  /** Whether the variant is in stock. Hides the bar when false. */
  available: boolean;
  /** Pre-formatted price node (e.g. PdpPrice). Rendered on the bar's left. */
  priceNode: ReactNode;
  /** Optional product title shown above the price. */
  productTitle?: string;
  /**
   * Ref to the in-page Add-to-Cart element. The sticky bar shows only when
   * this element is scrolled out of view (IntersectionObserver). If omitted,
   * the bar is always visible on mobile.
   */
  inPageCtaRef?: RefObject<HTMLElement | null>;
}

/**
 * StickyMobileCTA — mobile-only bottom bar that surfaces the primary
 * Add-to-Cart action when the in-page CTA scrolls out of view. Built on
 * StickyBottomBar (Phase 0) so it inherits iOS safe-area + lg:hidden.
 *
 * Pages that mount this should add `pb-24 lg:pb-0` to their wrapper so
 * the bar doesn't cover the bottom of the page when visible.
 */
export function StickyMobileCTA({
  variantId,
  quantity,
  available,
  priceNode,
  productTitle,
  inPageCtaRef,
}: StickyMobileCTAProps) {
  const sentinelRef = useRef<HTMLDivElement>(null);
  // Default to visible when no target ref is supplied — caller wants the bar
  // on screen unconditionally. Otherwise wait for the observer to fire.
  const [visible, setVisible] = useState(!inPageCtaRef);

  useEffect(() => {
    const target = inPageCtaRef?.current;
    if (!target || typeof IntersectionObserver === 'undefined') return;
    const observer = new IntersectionObserver(
      ([entry]) => setVisible(!entry.isIntersecting),
      {threshold: 0.1},
    );
    observer.observe(target);
    return () => observer.disconnect();
  }, [inPageCtaRef]);

  if (!available || !visible) {
    // Render the sentinel even when hidden so the observer can re-attach
    // after a route change without remounting the parent. The testid lets
    // tests verify the component is mounted with its ref wired up even
    // when the bar isn't visible — IntersectionObserver behavior under
    // Playwright is flaky enough that we can't rely on visibility alone.
    return (
      <div
        ref={sentinelRef}
        aria-hidden="true"
        data-testid="sticky-mobile-cta-sentinel"
      />
    );
  }

  return (
    <StickyBottomBar className="px-4 py-3" data-testid="sticky-mobile-cta">
      <div className="flex items-center gap-3">
        <div className="min-w-0 flex-1">
          {productTitle ? (
            <p className="truncate text-xs text-text-muted">{productTitle}</p>
          ) : null}
          <div className="text-base font-semibold text-text">{priceNode}</div>
        </div>
        <AddToCart
          variantId={variantId}
          quantity={quantity}
          available={available}
          className="tap-target inline-flex flex-1 items-center justify-center rounded-full bg-secondary px-5 text-sm font-medium text-white hover:bg-secondary/90"
        >
          <span className="flex items-center justify-center gap-2">
            <Plus size={16} />
            Add to Cart
          </span>
        </AddToCart>
      </div>
    </StickyBottomBar>
  );
}

export default StickyMobileCTA;
