import {getSeoMeta, Image} from '@shopify/hydrogen';
import {Link, redirect, useLoaderData, Form} from 'react-router';
import {useTranslation} from 'react-i18next';
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
  type PaymentMethodType,
} from '~/lib/checkout';
import {getCustomerAccessToken} from '~/lib/customer-auth';
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
    shippingRecipientLabel: checkoutData.shippingRecipientLabel,
    shippingCategory: checkoutData.shippingCategory,
  };
}

// ============================================================================
// Action — Place Order
//
// Passes the collected shipping address to Shopify's cart as
// `deliveryAddressPreferences` (Storefront API 2023-10+) so that
// Shopify's hosted checkout skips the address form and lands the customer
// directly on the payment step. Shopify collects all payment PII —
// card data never touches this application.
// ============================================================================

export async function action({request, context}: Route.ActionArgs) {
  const cart = await context.cart.get();
  if (!cart?.id || !cart.checkoutUrl) throw redirect('/cart');

  const checkoutData = getCheckoutAttributes(cart);
  const customerAccessToken =
    getCustomerAccessToken(context.session) ?? undefined;

  if (checkoutData.shippingAddress) {
    const addr = checkoutData.shippingAddress;

    // Build the buyer identity payload. `deliveryAddressPreferences` is a
    // Storefront API 2023-10+ field that tells Shopify's checkout to
    // pre-fill the shipping address, so customers only see the payment step.
    // The field isn't in the bundled codegen schema (which is older), so we
    // cast to `any` to satisfy TypeScript while still sending it at runtime.
    const buyerIdentity: any = {
      email: addr.email,
      phone: addr.phone || undefined,
      countryCode: 'US',
      customerAccessToken,
      deliveryAddressPreferences: [
        {
          deliveryAddress: {
            firstName: addr.firstName,
            lastName: addr.lastName,
            address1: addr.address1,
            address2: addr.address2 || undefined,
            city: addr.city,
            province: addr.state,
            zip: addr.zip,
            country: 'US',
            phone: addr.phone || undefined,
          },
        },
      ],
    };

    await context.storefront.mutate(CART_BUYER_IDENTITY_UPDATE, {
      variables: {cartId: cart.id, buyerIdentity},
    });
  }

  throw redirect(cart.checkoutUrl);
}

// ============================================================================
// Review Section Components
// ============================================================================

function ShippingAddressSection({
  address,
  recipientLabel,
}: {
  address: ShippingAddress;
  recipientLabel?: string | null;
}) {
  const {t} = useTranslation('common');
  return (
    <div className="rounded-lg border border-border p-5">
      <div className="flex items-start justify-between">
        <div className="flex flex-col gap-1">
          <h4 className="flex items-center gap-2 text-base font-semibold text-[#111827]">
            {t('checkout.review.shippingAddress.title')}
            {recipientLabel && (
              <span className="rounded-full bg-secondary/10 px-2.5 py-0.5 text-xs font-medium text-secondary">
                {t('checkout.review.shippingAddress.for', {
                  label: recipientLabel,
                })}
              </span>
            )}
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
          {t('checkout.review.shippingAddress.edit')}
        </Link>
      </div>
    </div>
  );
}

function PaymentMethodSection({
  paymentMethod,
}: {
  paymentMethod: PaymentMethodType | null;
}) {
  const {t} = useTranslation('common');
  const label = paymentMethod
    ? PAYMENT_METHOD_LABELS[paymentMethod]
    : t('checkout.review.paymentMethod.defaultLabel');

  return (
    <div className="rounded-lg border border-border p-5">
      <div className="flex items-start justify-between">
        <div className="flex flex-col gap-2">
          <h4 className="text-base font-semibold text-[#111827]">
            {t('checkout.review.paymentMethod.title')}
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
          {t('checkout.review.paymentMethod.edit')}
        </Link>
      </div>
    </div>
  );
}

// ============================================================================
// Items In Order
// ============================================================================

function OrderItems({cart}: {cart: any}) {
  const {t} = useTranslation('common');
  const lines = cart.lines?.nodes ?? [];

  return (
    <div className="mt-6">
      <h4 className="mb-4 text-base font-semibold text-[#111827]">
        {t('checkout.review.items.title')}
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
                <span className="text-sm text-[#6b7280]">
                  {t('checkout.review.items.qty', {quantity})}
                </span>
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
  const {t} = useTranslation('common');
  const {
    cart,
    shippingAddress,
    shippingCost,
    paymentMethod,
    shippingRecipientLabel,
  } = useLoaderData<typeof loader>();

  const shippingDisplay = shippingCost
    ? `$${shippingCost.toFixed(2)}`
    : '$5.99';

  return (
    <div className="min-h-screen bg-[#f9fafb]">
      <CheckoutProgress currentStep="review" />

      <div className="mx-auto max-w-[1443px] px-6 py-8">
        <div className="grid grid-cols-[1fr_400px] items-start gap-8">
          {/* Left: Review content */}
          <div className="flex flex-col gap-6">
            <Card className="gap-0 overflow-hidden bg-white p-0 shadow-sm">
              <div className="border-b border-border px-6 py-5">
                <h2 className="text-lg font-bold text-[#111827]">
                  {t('checkout.review.title')}
                </h2>
              </div>

              <div className="flex flex-col gap-6 px-6 py-6">
                {/* Disclaimer */}
                <p className="text-[15px] leading-relaxed text-[#4b5563]">
                  {t('checkout.review.disclaimerPart1')} &ldquo;
                  {t('checkout.review.placeOrder')}&rdquo;,{' '}
                  {t('checkout.review.disclaimerPart2')}{' '}
                  <Link
                    to="/policies/terms-of-service"
                    className="text-secondary hover:underline"
                  >
                    {t('checkout.review.termsOfService')}
                  </Link>{' '}
                  {t('checkout.review.disclaimerAnd')}{' '}
                  <Link
                    to="/policies/privacy-policy"
                    className="text-secondary hover:underline"
                  >
                    {t('checkout.review.privacyPolicy')}
                  </Link>
                  .
                </p>

                {/* Shipping address */}
                <ShippingAddressSection
                  address={shippingAddress}
                  recipientLabel={shippingRecipientLabel}
                />

                {/* Payment method */}
                <PaymentMethodSection paymentMethod={paymentMethod} />

                {/* Items */}
                <OrderItems cart={cart} />
              </div>
            </Card>

            {/* Payment notice */}
            <div className="flex items-center gap-3 rounded-lg border border-border bg-white px-5 py-4 text-[14px] text-[#4b5563] shadow-sm">
              <Lock size={16} className="shrink-0 text-secondary" />
              <span>{t('checkout.review.paymentNotice')}</span>
            </div>
          </div>

          {/* Right: Order Total sidebar */}
          <Form method="post" className="contents">
            <OrderSummary
              cart={cart as any}
              title={t('checkout.review.summary.title')}
              subtotalLabel={t('checkout.review.summary.subtotal')}
              shippingDisplay={shippingDisplay}
              totalLabel={t('checkout.review.summary.total')}
              cta={{
                label: t('checkout.review.placeOrder'),
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
