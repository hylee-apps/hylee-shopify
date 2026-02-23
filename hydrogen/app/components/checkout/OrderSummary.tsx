import {Image} from '@shopify/hydrogen';
import {Link} from 'react-router';
import {
  ArrowRight,
  ArrowLeft,
  Lock,
  ShieldCheck,
  ImageIcon,
  Check,
} from 'lucide-react';
import {Card} from '~/components/ui/card';
import {formatMoney} from '~/lib/checkout';

// ============================================================================
// Shared Order Summary Sidebar
// ============================================================================

interface CartLine {
  id: string;
  quantity: number;
  cost: {totalAmount: {amount: string; currencyCode: string}};
  merchandise: {
    product: {handle: string; title: string};
    image?: {
      id?: string;
      url: string;
      altText?: string;
      width?: number;
      height?: number;
    } | null;
    selectedOptions?: Array<{name: string; value: string}>;
  };
}

interface OrderSummaryCart {
  totalQuantity?: number;
  cost?: {
    subtotalAmount?: {amount: string; currencyCode: string};
    totalAmount?: {amount: string; currencyCode: string};
    totalTaxAmount?: {amount: string; currencyCode: string};
  };
  lines?: {nodes: CartLine[]};
}

interface OrderSummaryProps {
  cart: OrderSummaryCart;
  /** Title shown at top of sidebar. Defaults to "Order Summary" */
  title?: string;
  /** Label for subtotal row. e.g. "Subtotal (3 items)" or just "Subtotal" */
  subtotalLabel?: string;
  /** Shipping cost string. null = "Calculated at next step" */
  shippingDisplay?: string | null;
  /** Tax display string. null = "Calculated at next step" */
  taxDisplay?: string | null;
  /** Total row label. Defaults to "Total" */
  totalLabel?: string;
  /** Show product items in order summary (shipping page shows them) */
  showProductItems?: boolean;
  /** Primary CTA */
  cta?: {
    label: string;
    href: string;
    /** If true, renders as a form submit button instead of a link */
    isSubmit?: boolean;
    icon?: 'arrow' | 'check';
  };
  /** Secondary back link */
  back?: {
    label: string;
    href: string;
  };
  /** Trust badges config */
  trustBadges?: 'ssl-pci' | 'ssl-only' | 'none';
}

export function OrderSummary({
  cart,
  title = 'Order Summary',
  subtotalLabel,
  shippingDisplay,
  taxDisplay,
  totalLabel = 'Total',
  showProductItems = false,
  cta,
  back,
  trustBadges = 'ssl-pci',
}: OrderSummaryProps) {
  const subtotal = cart.cost?.subtotalAmount;
  const total = cart.cost?.totalAmount;
  const taxAmount = cart.cost?.totalTaxAmount;
  const lines = cart.lines?.nodes ?? [];

  const defaultSubtotalLabel = cart.totalQuantity
    ? `Subtotal (${cart.totalQuantity} ${cart.totalQuantity === 1 ? 'item' : 'items'})`
    : 'Subtotal';

  return (
    <Card className="sticky top-4 w-[400px] shrink-0 gap-0 overflow-hidden bg-white p-0 shadow-sm">
      {/* Header */}
      <div className="border-b border-border px-6 pb-[17px] pt-6">
        <h3 className="text-lg font-bold text-[#1f2937]">{title}</h3>
      </div>

      <div className="px-6 pt-[22px]">
        {/* Product items (when enabled) */}
        {showProductItems && lines.length > 0 && (
          <div className="mb-4 flex flex-col gap-3 border-b border-border pb-4">
            {lines.map((line) => (
              <ProductItemRow key={line.id} line={line} />
            ))}
          </div>
        )}

        {/* Summary rows */}
        <div className="flex flex-col gap-[17px]">
          <div className="flex items-center justify-between">
            <span className="text-[15px] text-[#4b5563]">
              {subtotalLabel ?? defaultSubtotalLabel}
            </span>
            <span className="text-[15px] text-[#4b5563]">
              {subtotal ? formatMoney(subtotal) : '—'}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-[15px] text-[#4b5563]">Shipping</span>
            <span className="text-[15px] text-[#4b5563]">
              {shippingDisplay ?? (
                <span className="text-text-light">Calculated at next step</span>
              )}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-[15px] text-[#4b5563]">Tax</span>
            <span className="text-[15px] text-[#4b5563]">
              {taxDisplay ??
                (taxAmount ? (
                  formatMoney(taxAmount)
                ) : (
                  <span className="text-text-light">
                    Calculated at next step
                  </span>
                ))}
            </span>
          </div>
        </div>

        {/* Separator + Total */}
        <div className="my-[22px] border-t-2 border-border" />
        <div className="flex items-center justify-between">
          <span className="text-lg font-bold text-[#111827]">{totalLabel}</span>
          <span className="text-lg font-bold text-[#111827]">
            {total ? formatMoney(total) : '—'}
          </span>
        </div>

        {/* CTA */}
        {cta && (
          <div className="mt-[22px]">
            {cta.isSubmit ? (
              <button
                type="submit"
                className="flex w-full items-center justify-center gap-2 rounded-lg bg-secondary px-4 py-4 text-base font-semibold text-white transition-colors hover:bg-secondary/90"
              >
                {cta.label}
                {cta.icon === 'arrow' && <ArrowRight size={16} />}
                {cta.icon === 'check' && <Check size={16} />}
              </button>
            ) : (
              <Link
                to={cta.href}
                className="flex w-full items-center justify-center gap-2 rounded-lg bg-secondary px-4 py-4 text-base font-semibold text-white transition-colors hover:bg-secondary/90"
              >
                {cta.label}
                {cta.icon === 'arrow' && <ArrowRight size={16} />}
                {cta.icon === 'check' && <Check size={16} />}
              </Link>
            )}
          </div>
        )}

        {/* Back link */}
        {back && (
          <div className="mt-1">
            <Link
              to={back.href}
              className="flex w-full items-center justify-center gap-2 rounded-lg p-2 text-[15px] font-medium text-secondary transition-colors hover:bg-secondary/5"
            >
              <ArrowLeft size={15} />
              {back.label}
            </Link>
          </div>
        )}

        {/* Trust badges */}
        {trustBadges !== 'none' && (
          <div className="mt-[22px] flex flex-col gap-3 border-t border-border pb-6 pt-[25px]">
            {trustBadges === 'ssl-pci' ? (
              <>
                <div className="flex items-center gap-2">
                  <Lock size={13} className="shrink-0 text-primary" />
                  <span className="text-[13px] text-[#4b5563]">
                    256-bit SSL Encryption
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <ShieldCheck size={13} className="shrink-0 text-primary" />
                  <span className="text-[13px] text-[#4b5563]">
                    PCI Compliant
                  </span>
                </div>
              </>
            ) : (
              <div className="flex items-center justify-center gap-2">
                <Lock size={13} className="shrink-0 text-primary" />
                <span className="text-[13px] text-[#4b5563]">
                  Secure SSL Encrypted Transaction
                </span>
              </div>
            )}
          </div>
        )}
      </div>
    </Card>
  );
}

// ── Product item row for order summary ────────────────────────────────────

function ProductItemRow({line}: {line: CartLine}) {
  const {merchandise, quantity, cost} = line;
  const {product, image} = merchandise;

  return (
    <div className="flex items-start gap-3">
      {/* Thumbnail */}
      <div className="relative size-[60px] shrink-0 overflow-hidden rounded-lg bg-[#f3f4f6]">
        {image ? (
          <Image
            data={image}
            width={60}
            height={60}
            className="absolute inset-0 size-full object-cover"
            alt={image.altText || product.title}
          />
        ) : (
          <div className="flex size-full items-center justify-center">
            <ImageIcon size={20} className="text-text-muted" />
          </div>
        )}
      </div>

      {/* Details */}
      <div className="flex min-w-0 flex-1 flex-col">
        <span className="text-sm font-medium leading-snug text-[#111827]">
          {product.title}
        </span>
        <span className="text-xs text-[#6b7280]">Qty: {quantity}</span>
      </div>

      {/* Price */}
      <span className="shrink-0 text-sm font-medium text-[#111827]">
        {formatMoney(cost.totalAmount)}
      </span>
    </div>
  );
}
