import {getSeoMeta, Image} from '@shopify/hydrogen';
import {Link, useLoaderData} from 'react-router';
import {
  CheckCircle,
  Package,
  ShoppingBag,
  ImageIcon,
  Calendar,
} from 'lucide-react';
import {Card} from '~/components/ui/card';
import {formatMoney} from '~/lib/checkout';
import type {Route} from './+types/checkout.confirmation';

// ============================================================================
// Route Meta
// ============================================================================

export function meta(_: Route.MetaArgs) {
  return getSeoMeta({
    title: 'Order Confirmed — Hy-lee',
    description: 'Thank you for your order!',
  });
}

// ============================================================================
// Loader
// ============================================================================

export async function loader({request, context}: Route.LoaderArgs) {
  // After Shopify checkout, we can read order info from URL params
  // or show a generic confirmation. For now, check if there's an
  // order_id param or rely on the last cart state.
  const url = new URL(request.url);
  const orderId = url.searchParams.get('order_id');
  const orderNumber = url.searchParams.get('order_number');

  // Try to get the cart — if it was just completed, it may be empty now
  const cart = await context.cart.get();

  // Check if user is logged in to show/hide account creation CTA
  let isLoggedIn = false;
  try {
    isLoggedIn = await context.customerAccount.isLoggedIn();
  } catch {
    // Guest user
  }

  return {
    orderId,
    orderNumber: orderNumber ?? 'HY-2024-00000',
    cart,
    isLoggedIn,
  };
}

// ============================================================================
// Success Hero
// ============================================================================

function SuccessHero({orderNumber}: {orderNumber: string}) {
  return (
    <div className="flex flex-col items-center py-12 text-center">
      {/* Success icon */}
      <div className="mb-6 flex size-20 items-center justify-center rounded-full bg-primary">
        <CheckCircle size={40} className="text-white" />
      </div>

      {/* Title */}
      <h1 className="mb-3 text-4xl font-bold text-[#111827]">
        Thank You for Your Order!
      </h1>

      {/* Confirmation email notice */}
      <p className="mb-6 text-lg text-[#4b5563]">
        A confirmation email has been sent to your email address
      </p>

      {/* Order number badge */}
      <div className="mb-8 rounded-lg border border-border bg-white px-6 py-3.5">
        <span className="text-lg font-semibold text-[#111827]">
          Order #{orderNumber}
        </span>
      </div>

      {/* Action buttons */}
      <div className="flex items-center gap-3">
        <Link
          to="/account/orders"
          className="flex items-center gap-2 rounded-lg bg-[#e67e22] px-6 py-3.5 text-base font-semibold text-white transition-colors hover:bg-[#d35400]"
        >
          <Package size={18} />
          Track Order
        </Link>
        <Link
          to="/collections"
          className="flex items-center gap-2 rounded-lg border border-border bg-white px-6 py-3.5 text-base font-semibold text-[#111827] transition-colors hover:bg-[#f9fafb]"
        >
          <ShoppingBag size={18} />
          Continue Shopping
        </Link>
      </div>
    </div>
  );
}

// ============================================================================
// Order Details Card
// ============================================================================

function OrderDetailsCard({cart}: {cart: any}) {
  const lines = cart?.lines?.nodes ?? [];
  const cost = cart?.cost;
  const today = new Date();
  const placedDate = today.toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });

  // Estimate delivery: 5-7 business days from now
  const deliveryStart = new Date(today);
  deliveryStart.setDate(deliveryStart.getDate() + 7);
  const deliveryEnd = new Date(today);
  deliveryEnd.setDate(deliveryEnd.getDate() + 10);
  const deliveryRange = `${deliveryStart.toLocaleDateString('en-US', {month: 'long', day: 'numeric'})} - ${deliveryEnd.toLocaleDateString('en-US', {month: 'long', day: 'numeric'})}`;

  return (
    <Card className="gap-0 overflow-hidden bg-white p-0 shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border px-6 py-5">
        <h2 className="text-lg font-bold text-[#111827]">Order Details</h2>
        <span className="text-sm text-[#6b7280]">Placed on {placedDate}</span>
      </div>

      <div className="flex flex-col px-6 py-6">
        {/* Shipping + Delivery info */}
        <div className="flex gap-8">
          <div className="flex flex-1 flex-col gap-1">
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#6b7280]">
              Shipping Address
            </h4>
            <p className="mt-2 text-sm leading-relaxed text-[#4b5563]">
              Your shipping details will be sent via email
            </p>
          </div>
          <div className="flex flex-1 flex-col gap-1">
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#6b7280]">
              Estimated Delivery
            </h4>
            <div className="mt-2 flex items-center gap-2">
              <Calendar size={16} className="text-secondary" />
              <span className="text-sm font-semibold text-[#111827]">
                {deliveryRange}
              </span>
            </div>
            <span className="text-sm text-[#6b7280]">Standard Shipping</span>
          </div>
        </div>

        {/* Items Ordered */}
        {lines.length > 0 && (
          <>
            <div className="my-6 border-t border-border" />
            <h4 className="mb-4 text-base font-semibold text-[#111827]">
              Items Ordered
            </h4>
            <div className="flex flex-col divide-y divide-[#f3f4f6]">
              {lines.map((line: any) => {
                const {merchandise, quantity, cost: lineCost} = line;
                if (typeof merchandise === 'string') return null;
                const {product, image, selectedOptions} = merchandise;

                const variantAttrs =
                  selectedOptions?.filter(
                    (o: any) =>
                      !(o.name === 'Title' && o.value === 'Default Title'),
                  ) ?? [];

                return (
                  <div key={line.id} className="flex items-start gap-4 py-4">
                    <div className="relative size-20 shrink-0 overflow-hidden rounded-lg bg-[#f3f4f6]">
                      {image ? (
                        <Image
                          data={image}
                          width={80}
                          height={80}
                          className="absolute inset-0 size-full object-cover"
                          alt={image.altText || product.title}
                        />
                      ) : (
                        <div className="flex size-full items-center justify-center">
                          <ImageIcon size={24} className="text-text-muted" />
                        </div>
                      )}
                    </div>
                    <div className="flex min-w-0 flex-1 flex-col gap-0.5">
                      <span className="text-[15px] font-medium text-[#111827]">
                        {product.title}
                      </span>
                      {variantAttrs.map((opt: any) => (
                        <span key={opt.name} className="text-sm text-[#6b7280]">
                          {opt.name}: {opt.value}
                        </span>
                      ))}
                      <span className="text-sm text-[#6b7280]">
                        Qty: {quantity}
                      </span>
                    </div>
                    <span className="shrink-0 text-base font-semibold text-[#111827]">
                      {formatMoney(lineCost.totalAmount)}
                    </span>
                  </div>
                );
              })}
            </div>
          </>
        )}

        {/* Price breakdown */}
        {cost && (
          <>
            <div className="my-4 border-t border-border" />
            <div className="flex flex-col gap-3 rounded-lg bg-[#f9fafb] p-5">
              <div className="flex justify-between text-[15px] text-[#4b5563]">
                <span>Subtotal</span>
                <span>
                  {cost.subtotalAmount ? formatMoney(cost.subtotalAmount) : '—'}
                </span>
              </div>
              <div className="flex justify-between text-[15px] text-[#4b5563]">
                <span>Shipping</span>
                <span>$5.99</span>
              </div>
              <div className="flex justify-between text-[15px] text-[#4b5563]">
                <span>Tax</span>
                <span>
                  {cost.totalTaxAmount ? formatMoney(cost.totalTaxAmount) : '—'}
                </span>
              </div>
              <div className="border-t border-border pt-3">
                <div className="flex justify-between text-lg font-bold text-[#111827]">
                  <span>Total</span>
                  <span>
                    {cost.totalAmount ? formatMoney(cost.totalAmount) : '—'}
                  </span>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </Card>
  );
}

// ============================================================================
// Create Account CTA
// ============================================================================

function CreateAccountCTA() {
  return (
    <div className="flex flex-col items-center py-8 text-center">
      <h3 className="mb-2 text-xl font-bold text-[#111827]">
        Create an Account for Faster Checkout
      </h3>
      <p className="mb-5 text-base text-[#4b5563]">
        Save your shipping and payment information for next time
      </p>
      <Link
        to="/account/register"
        className="rounded-lg bg-secondary px-8 py-3 text-base font-semibold text-white transition-colors hover:bg-secondary/90"
      >
        Create Account
      </Link>
    </div>
  );
}

// ============================================================================
// Main Page
// ============================================================================

export default function CheckoutConfirmationPage() {
  const {orderNumber, cart, isLoggedIn} = useLoaderData<typeof loader>();

  return (
    <div className="min-h-screen bg-[#f9fafb]">
      {/* Success hero */}
      <div className="bg-white">
        <div className="mx-auto max-w-[800px]">
          <SuccessHero orderNumber={orderNumber} />
        </div>
      </div>

      {/* Order details */}
      <div className="mx-auto max-w-[800px] px-6 py-8">
        <OrderDetailsCard cart={cart} />

        {/* Account creation CTA — only for guests */}
        {!isLoggedIn && <CreateAccountCTA />}
      </div>
    </div>
  );
}
