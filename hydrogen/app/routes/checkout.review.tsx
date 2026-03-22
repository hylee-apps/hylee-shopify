import {getSeoMeta, Image} from '@shopify/hydrogen';
import {Link, redirect, useLoaderData, Form} from 'react-router';
import {CreditCard, ImageIcon, Lock, Check} from 'lucide-react';
import {Card} from '~/components/ui/card';
import {CheckoutProgress} from '~/components/checkout/CheckoutProgress';
import {OrderSummary} from '~/components/checkout/OrderSummary';
import {
  getCheckoutAttributes,
  formatMoney,
  PAYMENT_METHOD_LABELS,
  CART_BUYER_IDENTITY_UPDATE,
  type ShippingAddress,
  type ShippingMethod,
  type PaymentMethodType,
} from '~/lib/checkout';
import type {Route} from './+types/checkout.review';

// ============================================================================
// Route Meta
// ============================================================================

export function meta(_: Route.MetaArgs) {
  return getSeoMeta({
    title: 'Review Order — Checkout',
    description: 'Review your order details before placing your order.',
  });
}

// ============================================================================
// Loader
// ============================================================================

export async function loader({context}: Route.LoaderArgs) {
  const cart = await context.cart.get();

  if (!cart || (cart.totalQuantity ?? 0) === 0) {
    throw redirect('/cart');
  }

  const checkoutData = getCheckoutAttributes(cart);

  // If no shipping address has been entered, redirect back
  if (!checkoutData.shippingAddress) {
    throw redirect('/checkout/shipping');
  }

  return {
    cart,
    checkoutUrl: cart.checkoutUrl,
    shippingAddress: checkoutData.shippingAddress,
    shippingMethod: checkoutData.shippingMethod,
    shippingCost: checkoutData.shippingCost,
    paymentMethod: checkoutData.paymentMethod,
    deliveryInstructions: checkoutData.deliveryInstructions,
  };
}

// ============================================================================
// Action — Place Order (redirect to Shopify checkout)
// ============================================================================

export async function action({context}: Route.ActionArgs) {
  const cart = await context.cart.get();
  if (!cart?.id || !cart.checkoutUrl) throw redirect('/cart');

  const checkoutData = getCheckoutAttributes(cart);

  // Final buyer identity update to ensure Shopify checkout is pre-populated
  if (checkoutData.shippingAddress) {
    await context.storefront.mutate(CART_BUYER_IDENTITY_UPDATE, {
      variables: {
        cartId: cart.id,
        buyerIdentity: {
          email: checkoutData.shippingAddress.email,
          phone: checkoutData.shippingAddress.phone || undefined,
          countryCode: 'US',
        },
      },
    });
  }

  throw redirect(cart.checkoutUrl);
}

// ============================================================================
// Review Section Components
// ============================================================================

function ShippingAddressSection({address}: {address: ShippingAddress}) {
  return (
    <div className="rounded-lg border border-border p-5">
      <div className="flex items-start justify-between">
        <div className="flex flex-col gap-1">
          <h4 className="text-base font-semibold text-[#111827]">
            Shipping Address
          </h4>
          <div className="mt-2 flex flex-col gap-0.5 text-[15px] leading-relaxed text-[#4b5563]">
            <span>
              {address.firstName} {address.lastName}
            </span>
            <span>
              {address.address1}
              {address.address2 ? `, ${address.address2}` : ''}
            </span>
            <span>
              {address.city}, {address.state} {address.zip}
            </span>
            {address.phone && <span>{address.phone}</span>}
          </div>
        </div>
        <Link
          to="/checkout/shipping"
          className="text-sm font-medium text-secondary hover:underline"
        >
          Edit
        </Link>
      </div>
    </div>
  );
}

function ShippingMethodSection({method}: {method: ShippingMethod | null}) {
  return (
    <div className="rounded-lg border border-border p-5">
      <h4 className="text-base font-semibold text-[#111827]">
        Shipping Method
      </h4>
      <p className="mt-2 text-[15px] text-[#4b5563]">
        {method
          ? `${method.label} (${method.description}) - $${method.price.toFixed(2)}`
          : 'Standard Shipping (5-7 business days) - $5.99'}
      </p>
    </div>
  );
}

function PaymentMethodSection({
  paymentMethod,
}: {
  paymentMethod: PaymentMethodType | null;
}) {
  const label = paymentMethod
    ? PAYMENT_METHOD_LABELS[paymentMethod]
    : 'Credit / Debit Card';

  return (
    <div className="rounded-lg border border-border p-5">
      <div className="flex items-start justify-between">
        <div className="flex flex-col gap-2">
          <h4 className="text-base font-semibold text-[#111827]">
            Payment Method
          </h4>
          <div className="flex items-center gap-2 text-[15px] text-[#4b5563]">
            <CreditCard size={18} className="text-[#4b5563]" />
            <span>{label}</span>
          </div>
        </div>
        <Link
          to="/checkout/payment"
          className="text-sm font-medium text-secondary hover:underline"
        >
          Edit
        </Link>
      </div>
    </div>
  );
}

// ============================================================================
// Items In Order
// ============================================================================

function OrderItems({cart}: {cart: any}) {
  const lines = cart.lines?.nodes ?? [];

  return (
    <div className="mt-6">
      <h4 className="mb-4 text-base font-semibold text-[#111827]">
        Items in Order
      </h4>
      <div className="flex flex-col divide-y divide-[#f3f4f6]">
        {lines.map((line: any) => {
          const {merchandise, quantity, cost} = line;
          if (typeof merchandise === 'string') return null;
          const {product, image, selectedOptions} = merchandise;

          const variantAttrs =
            selectedOptions?.filter(
              (o: any) => !(o.name === 'Title' && o.value === 'Default Title'),
            ) ?? [];

          return (
            <div key={line.id} className="flex items-start gap-4 py-4">
              {/* Image */}
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

              {/* Details */}
              <div className="flex min-w-0 flex-1 flex-col gap-0.5">
                <span className="text-[15px] font-medium text-[#111827]">
                  {product.title}
                </span>
                {variantAttrs.map((opt: any) => (
                  <span key={opt.name} className="text-sm text-[#6b7280]">
                    {opt.name}: {opt.value}
                  </span>
                ))}
                <span className="text-sm text-[#6b7280]">Qty: {quantity}</span>
              </div>

              {/* Price */}
              <span className="shrink-0 text-base font-semibold text-[#111827]">
                {formatMoney(cost.totalAmount)}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ============================================================================
// Main Page
// ============================================================================

export default function CheckoutReviewPage() {
  const {
    cart,
    checkoutUrl,
    shippingAddress,
    shippingMethod,
    shippingCost,
    paymentMethod,
  } = useLoaderData<typeof loader>();

  const shippingDisplay = shippingCost
    ? `$${shippingCost.toFixed(2)}`
    : '$5.99';

  return (
    <div className="min-h-screen bg-[#f9fafb]">
      <CheckoutProgress currentStep="review" />

      <div className="mx-auto max-w-[1443px] px-6 py-8">
        <div className="flex items-start gap-8">
          {/* Left: Review content */}
          <div className="flex min-w-0 flex-1 flex-col gap-6">
            <Card className="gap-0 overflow-hidden bg-white p-0 shadow-sm">
              <div className="border-b border-border px-6 py-5">
                <h2 className="text-lg font-bold text-[#111827]">
                  Review Your Order
                </h2>
              </div>

              <div className="flex flex-col gap-6 px-6 py-6">
                {/* Disclaimer */}
                <p className="text-[15px] leading-relaxed text-[#4b5563]">
                  Please review your order details before placing your order. By
                  clicking &ldquo;Place Order&rdquo;, you agree to our{' '}
                  <Link
                    to="/policies/terms-of-service"
                    className="text-secondary hover:underline"
                  >
                    Terms of Service
                  </Link>{' '}
                  and{' '}
                  <Link
                    to="/policies/privacy-policy"
                    className="text-secondary hover:underline"
                  >
                    Privacy Policy
                  </Link>
                  .
                </p>

                {/* Shipping sections */}
                <ShippingAddressSection address={shippingAddress} />
                {/* <ShippingMethodSection method={shippingMethod} /> */}

                {/* Payment section */}
                <PaymentMethodSection paymentMethod={paymentMethod} />

                {/* Items */}
                <OrderItems cart={cart} />
              </div>
            </Card>
          </div>

          {/* Right: Order Total sidebar */}
          <Form method="post">
            <OrderSummary
              cart={cart as any}
              title="Order Total"
              subtotalLabel="Subtotal"
              shippingDisplay={shippingDisplay}
              totalLabel="Total"
              cta={{
                label: 'Place Order',
                href: '#',
                isSubmit: true,
                icon: 'check',
              }}
              trustBadges="ssl-only"
            />
          </Form>
        </div>
      </div>
    </div>
  );
}
