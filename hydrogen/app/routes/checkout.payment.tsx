import {useState} from 'react';
import {getSeoMeta} from '@shopify/hydrogen';
import {Link, redirect, useLoaderData, Form} from 'react-router';
import {useTranslation} from 'react-i18next';
import {CreditCard} from 'lucide-react';
import {Card} from '~/components/ui/card';
import {cn} from '~/lib/utils';
import {CheckoutProgress} from '~/components/checkout/CheckoutProgress';
import {OrderSummary} from '~/components/checkout/OrderSummary';
import {
  CHECKOUT_ATTR,
  CART_ATTRIBUTES_UPDATE,
  buildCartAttributes,
  getCheckoutAttributes,
  type PaymentMethodType,
} from '~/lib/checkout';
import type {Route} from './+types/checkout.payment';

// ============================================================================
// Route Meta
// ============================================================================

export function meta(_: Route.MetaArgs) {
  return getSeoMeta({
    title: 'Payment — Checkout',
    description: 'Enter your payment details to complete your order.',
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

  return {
    cart,
    savedPaymentMethod: checkoutData.paymentMethod ?? 'credit',
  };
}

// ============================================================================
// Action — Store payment method preference
// ============================================================================

export async function action({request, context}: Route.ActionArgs) {
  const cart = await context.cart.get();
  if (!cart?.id) throw redirect('/cart');

  const formData = await request.formData();
  const paymentMethod = (formData.get('paymentMethod') as string) ?? 'credit';

  await context.storefront.mutate(CART_ATTRIBUTES_UPDATE, {
    variables: {
      cartId: cart.id,
      attributes: buildCartAttributes({
        [CHECKOUT_ATTR.PAYMENT_METHOD]: paymentMethod,
      }),
    },
  });

  throw redirect('/checkout/shipping');
}

// ============================================================================
// Payment Method Icons
// ============================================================================

function CreditCardBrandBadge({
  label,
  className,
}: {
  label: string;
  className?: string;
}) {
  return (
    <span
      className={cn(
        'inline-flex h-5 items-center rounded px-1.5 text-[10px] font-bold leading-none tracking-wide',
        className,
      )}
    >
      {label}
    </span>
  );
}

// ============================================================================
// PaymentMethodOption
// ============================================================================

type PaymentMethod = 'credit' | 'shopify' | 'apple' | 'google';

interface PaymentMethodOptionProps {
  id: PaymentMethod;
  selected: PaymentMethod;
  onSelect: (id: PaymentMethod) => void;
  icon: React.ReactNode;
  label: string;
  trailing?: React.ReactNode;
}

function PaymentMethodOption({
  id,
  selected,
  onSelect,
  icon,
  label,
  trailing,
}: PaymentMethodOptionProps) {
  const isSelected = selected === id;

  return (
    <button
      type="button"
      onClick={() => onSelect(id)}
      className={cn(
        'flex w-full cursor-pointer items-center gap-3 rounded-[8px] border-2 p-[18px] text-left transition-colors',
        isSelected
          ? 'border-secondary bg-secondary/5'
          : 'border-border hover:border-secondary/40',
      )}
    >
      {/* Radio indicator */}
      <div
        className={cn(
          'flex size-5 shrink-0 items-center justify-center rounded-full border',
          isSelected ? 'border-secondary' : 'border-[#767676] bg-white',
        )}
      >
        {isSelected && <div className="size-3 rounded-full bg-secondary" />}
      </div>

      {/* Brand icon */}
      {icon}

      {/* Label */}
      <span className="flex-1 text-base text-[#1f2937]">{label}</span>

      {/* Trailing (e.g. card brand badges) */}
      {trailing}
    </button>
  );
}

// ============================================================================
// BillingAddressCard
// ============================================================================

function BillingAddressCard() {
  const [sameAsShipping, setSameAsShipping] = useState(true);
  const {t} = useTranslation('common');

  return (
    <Card className="gap-0 overflow-hidden rounded-[12px] bg-white p-0 shadow-sm">
      <div className="border-b border-border px-6 py-5">
        <h2 className="text-lg font-bold text-[#111827]">
          {t('checkout.payment.billing.title')}
        </h2>
      </div>
      <div className="px-6 pt-6 pb-[41px]">
        <label className="flex cursor-pointer items-center gap-3">
          <div
            onClick={() => setSameAsShipping(!sameAsShipping)}
            className={cn(
              'flex size-[18px] shrink-0 items-center justify-center rounded-[2.5px] border transition-colors',
              sameAsShipping
                ? 'border-secondary bg-secondary'
                : 'border-[#767676] bg-white',
            )}
          >
            {sameAsShipping && (
              <svg
                viewBox="0 0 12 12"
                className="size-3 text-white"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <polyline points="2,6 5,9 10,3" />
              </svg>
            )}
          </div>
          <span className="text-[15px] text-[#1f2937]">
            {t('checkout.payment.billing.sameAsShipping')}
          </span>
        </label>
      </div>
    </Card>
  );
}

// ============================================================================
// OrderSummary wrapper — passes translated CTA/back labels to shared component
// ============================================================================

function PaymentOrderSummary({
  cart,
}: {
  cart: Awaited<ReturnType<typeof loader>>['cart'];
}) {
  const {t} = useTranslation('common');
  return (
    <OrderSummary
      cart={cart as any}
      cta={{
        label: t('checkout.payment.continueToShipping'),
        href: '#',
        isSubmit: true,
        icon: 'arrow',
      }}
      back={{label: t('checkout.payment.returnToCart'), href: '/cart'}}
      trustBadges="ssl-pci"
    />
  );
}

// ============================================================================
// Payment Method Card
// ============================================================================

function PaymentMethodCard({
  defaultMethod,
}: {
  defaultMethod: PaymentMethodType;
}) {
  const [selectedMethod, setSelectedMethod] =
    useState<PaymentMethodType>(defaultMethod);
  const {t} = useTranslation('common');

  return (
    <Card className="gap-0 overflow-hidden rounded-[12px] bg-white p-0 shadow-sm">
      {/* Header */}
      <div className="border-b border-border px-6 py-5">
        <h2 className="text-lg font-bold text-[#111827]">
          {t('checkout.payment.method.title')}
        </h2>
      </div>

      {/* Options */}
      <div className="flex flex-col gap-3 p-6">
        {/* Hidden input for form submission */}
        <input type="hidden" name="paymentMethod" value={selectedMethod} />
        <PaymentMethodOption
          id="credit"
          selected={selectedMethod}
          onSelect={setSelectedMethod}
          icon={
            <div className="flex h-[26px] w-10 shrink-0 items-center justify-center rounded-[4px] bg-[#f3f4f6]">
              <CreditCard size={14} className="text-[#4b5563]" />
            </div>
          }
          label={t('checkout.payment.method.creditDebit')}
          trailing={
            <div className="flex items-center gap-1">
              <CreditCardBrandBadge
                label="VISA"
                className="border border-[#e5e7eb] bg-white text-[#1a1f71]"
              />
              <CreditCardBrandBadge
                label="MC"
                className="border border-[#e5e7eb] bg-white text-[#eb001b]"
              />
            </div>
          }
        />

        {/* Shop Pay */}
        <PaymentMethodOption
          id="shopify"
          selected={selectedMethod}
          onSelect={setSelectedMethod}
          icon={
            <div className="flex h-[26px] w-10 shrink-0 items-center justify-center rounded-[4px] bg-[#552bed]">
              <span className="text-xs font-bold text-white">S</span>
            </div>
          }
          label={t('checkout.payment.method.shopPay')}
        />

        {/* Apple Pay */}
        <PaymentMethodOption
          id="apple"
          selected={selectedMethod}
          onSelect={setSelectedMethod}
          icon={
            <div className="flex h-[26px] w-10 shrink-0 items-center justify-center rounded-[4px] bg-black">
              <svg
                viewBox="0 0 14 16"
                className="h-3.5 w-3 fill-white"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path d="M13.187 11.394c-.234.53-.51 1.019-.826 1.47-.435.618-.79 1.046-1.063 1.282-.425.39-.879.589-1.364.6-.349 0-.77-.099-1.26-.3-.491-.2-.942-.3-1.354-.3-.432 0-.895.1-1.39.3-.496.2-.895.305-1.2.313-.465.02-.93-.185-1.397-.614-.296-.258-.667-.7-1.113-1.328C1.73 11.93 1.28 10.976.97 9.928.64 8.8.476 7.707.476 6.648c0-1.215.263-2.263.79-3.14.414-.706.965-1.263 1.654-1.67.69-.408 1.433-.616 2.23-.629.437 0 1.01.135 1.72.401.708.267 1.163.401 1.364.401.15 0 .658-.158 1.52-.473.814-.293 1.501-.414 2.063-.364 1.526.123 2.672.726 3.432 1.812-1.364.827-2.039 1.985-2.027 3.47.01 1.157.432 2.12 1.264 2.886.376.357.795.633 1.26.83-.101.294-.207.575-.319.843zM9.95.32C9.95 1.212 9.633 2.048 9 2.826 8.24 3.752 7.316 4.286 6.317 4.207a2.074 2.074 0 01-.015-.253c0-.855.373-1.77 1.034-2.518.33-.378.75-.693 1.258-.946.507-.249.987-.387 1.44-.413.01.082.015.163.015.243z" />
              </svg>
            </div>
          }
          label={t('checkout.payment.method.applePay')}
        />

        {/* Google Pay */}
        <PaymentMethodOption
          id="google"
          selected={selectedMethod}
          onSelect={setSelectedMethod}
          icon={
            <div className="flex h-[26px] w-10 shrink-0 items-center justify-center rounded-[4px] bg-[#4285f4]">
              <span className="text-xs font-bold text-white">G</span>
            </div>
          }
          label={t('checkout.payment.method.googlePay')}
        />
      </div>
    </Card>
  );
}

// ============================================================================
// Main Page
// ============================================================================

export default function CheckoutPaymentPage() {
  const {cart, savedPaymentMethod} = useLoaderData<typeof loader>();

  return (
    <div className="min-h-screen bg-[#f9fafb]">
      {/* Progress bar */}
      <CheckoutProgress currentStep="payment" />

      <Form method="post" className="mx-auto max-w-[1443px] px-6 py-8">
        <div className="grid grid-cols-[1fr_400px] items-start gap-8">
          {/* ── Left: Main content ── */}
          <div className="flex flex-col gap-6">
            <PaymentMethodCard
              defaultMethod={savedPaymentMethod as PaymentMethodType}
            />
            <BillingAddressCard />
          </div>

          {/* ── Right: Order Summary ── */}
          <PaymentOrderSummary cart={cart} />
        </div>
      </Form>
    </div>
  );
}
