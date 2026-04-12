import type {Route} from './+types/cart';
import {isCustomerLoggedIn} from '~/lib/customer-auth';
import {
  CartForm,
  Image,
  type OptimisticCart,
  useOptimisticCart,
  getSeoMeta,
} from '@shopify/hydrogen';
import type {CartLineInput} from '@shopify/hydrogen/storefront-api-types';
import {Link, useFetcher, useLoaderData} from 'react-router';
import {
  ShoppingCart,
  ImageIcon,
  Minus,
  Plus,
  X,
  UserCircle,
  ShieldCheck,
  Lock,
  ArrowRight,
} from 'lucide-react';
import {Button} from '~/components/ui/button';
import {Input} from '~/components/ui/input';
import {Card} from '~/components/ui/card';
import {cn} from '~/lib/utils';
import {CheckoutProgress} from '~/components/checkout/CheckoutProgress';

// ============================================================================
// Route Meta
// ============================================================================

export function meta({data}: Route.MetaArgs) {
  return getSeoMeta({
    title: 'Shopping Cart',
    description: 'Review your shopping cart and proceed to checkout.',
  });
}

// ============================================================================
// Loader
// ============================================================================

export async function loader({context}: Route.LoaderArgs) {
  const cart = await context.cart.get();
  const isLoggedIn = isCustomerLoggedIn(context.session);
  return {cart, isLoggedIn};
}

// ============================================================================
// Action — Cart Mutations
// ============================================================================

export async function action({request, context}: Route.ActionArgs) {
  const {cart} = context;

  const formData = await request.formData();
  const {action, inputs} = CartForm.getFormInput(formData);

  if (!action) {
    throw new Error('No action provided');
  }

  let result;

  switch (action) {
    case CartForm.ACTIONS.LinesAdd:
      result = await cart.addLines(inputs.lines as CartLineInput[]);
      break;

    case CartForm.ACTIONS.LinesUpdate:
      result = await cart.updateLines(inputs.lines);
      break;

    case CartForm.ACTIONS.LinesRemove:
      result = await cart.removeLines(inputs.lineIds);
      break;

    case CartForm.ACTIONS.DiscountCodesUpdate: {
      const formDiscountCode = inputs.discountCode;
      const discountCodes = (
        formDiscountCode ? [formDiscountCode] : []
      ) as string[];

      if (inputs.discountCodes && Array.isArray(inputs.discountCodes)) {
        discountCodes.push(...(inputs.discountCodes as string[]));
      }

      result = await cart.updateDiscountCodes(discountCodes);
      break;
    }

    case CartForm.ACTIONS.NoteUpdate:
      result = await cart.updateNote(inputs.note as string);
      break;

    default:
      throw new Error(`Unhandled action: ${action}`);
  }

  const cartId = result?.cart?.id;
  const headers = cartId ? cart.setCartId(result.cart.id) : new Headers();
  const {cart: cartResult, errors, warnings} = result;

  return Response.json(
    {cart: cartResult, errors, warnings},
    {status: 200, headers},
  );
}

// ============================================================================
// Helpers
// ============================================================================

function formatMoney(money: {amount: string; currencyCode: string}): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: money.currencyCode,
  }).format(parseFloat(money.amount));
}

// ============================================================================
// CartEmpty
// ============================================================================

function CartEmpty() {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <ShoppingCart size={80} className="mb-6 text-text-muted" />
      <h2 className="mb-2 text-2xl font-semibold text-[#111827]">
        Your cart is empty
      </h2>
      <p className="mb-8 text-text-muted">Add items to get started</p>
      <Button size="lg" asChild>
        <Link to="/collections">Start Shopping</Link>
      </Button>
    </div>
  );
}

// ============================================================================
// GuestBanner
// ============================================================================

function GuestBanner() {
  return (
    <div className="flex items-center gap-3 rounded-sm border border-brand-accent bg-brand-accent/10 p-[17px]">
      <UserCircle size={20} className="shrink-0 text-brand-accent" />
      <p className="text-sm text-[#374151]">
        Checking out as guest.{' '}
        <Link
          to="/account/login"
          className="font-medium text-secondary hover:underline"
        >
          Sign in
        </Link>{' '}
        for faster checkout and order tracking.
      </p>
    </div>
  );
}

// ============================================================================
// CartLineRow
// ============================================================================

interface CartLineRowProps {
  line: OptimisticCart<any>['lines']['nodes'][number];
  isLast: boolean;
}

function CartLineRow({line, isLast}: CartLineRowProps) {
  const {id, quantity, cost, merchandise} = line;

  if (typeof merchandise === 'string') return null;

  const {product, image, selectedOptions} = merchandise;
  const lineUrl = `/products/${product.handle}`;
  const isRemoving = 'isOptimistic' in line;

  const variantAttrs =
    selectedOptions?.filter(
      (o: any) => !(o.name === 'Title' && o.value === 'Default Title'),
    ) ?? [];

  return (
    <div
      className={cn(
        'flex items-start gap-4 py-4',
        !isLast && 'border-b border-[#f3f4f6]',
        isRemoving && 'pointer-events-none opacity-50',
      )}
    >
      {/* Product Image */}
      <Link to={lineUrl} className="shrink-0">
        <div className="relative size-20 overflow-hidden rounded-sm bg-[#f3f4f6]">
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
      </Link>

      {/* Product Details */}
      <div className="flex min-w-0 flex-1 flex-col gap-1">
        <Link
          to={lineUrl}
          className="text-[15px] font-medium leading-snug text-[#111827] hover:text-primary"
        >
          {product.title}
        </Link>

        {variantAttrs.map((opt: any) => (
          <p
            key={opt.name}
            className="text-[13px] leading-snug text-text-muted"
          >
            {opt.name}: {opt.value}
          </p>
        ))}

        {/* Qty Controls */}
        <div className="mt-1 flex items-center gap-2 text-[13px] text-text-muted">
          <span>Qty:</span>
          <div className="flex items-center gap-1.5 rounded-full border border-border bg-white px-2 py-0.5 shadow-sm">
            <CartForm
              route="/cart"
              action={CartForm.ACTIONS.LinesUpdate}
              inputs={{lines: [{id, quantity: Math.max(1, quantity - 1)}]}}
            >
              <button
                type="submit"
                disabled={quantity <= 1}
                className="flex size-4 items-center justify-center text-text-muted transition-colors hover:text-secondary disabled:opacity-40"
                aria-label="Decrease quantity"
              >
                <Minus size={10} />
              </button>
            </CartForm>

            <span className="min-w-[1rem] text-center text-[13px] font-medium text-[#111827]">
              {quantity}
            </span>

            <CartForm
              route="/cart"
              action={CartForm.ACTIONS.LinesUpdate}
              inputs={{lines: [{id, quantity: quantity + 1}]}}
            >
              <button
                type="submit"
                className="flex size-4 items-center justify-center text-text-muted transition-colors hover:text-secondary"
                aria-label="Increase quantity"
              >
                <Plus size={10} />
              </button>
            </CartForm>
          </div>
        </div>
      </div>

      {/* Price + Remove */}
      <div className="flex shrink-0 flex-col items-end gap-2">
        <span className="text-base font-semibold text-[#111827]">
          {formatMoney(cost.totalAmount)}
        </span>
        <CartForm
          route="/cart"
          action={CartForm.ACTIONS.LinesRemove}
          inputs={{lineIds: [id]}}
        >
          <button
            type="submit"
            className="text-text-muted transition-colors hover:text-red-500"
            aria-label="Remove item"
          >
            <X size={14} />
          </button>
        </CartForm>
      </div>
    </div>
  );
}

// ============================================================================
// PromoCodeCard
// ============================================================================

function PromoCodeCard({discountCodes}: {discountCodes: any[] | undefined}) {
  const fetcher = useFetcher({key: 'discount-code'});
  const isSubmitting = fetcher.state !== 'idle';
  const appliedCodes = discountCodes?.filter((d: any) => d.applicable) ?? [];

  return (
    <Card className="gap-0 overflow-hidden bg-white p-0 shadow-sm">
      {/* Header */}
      <div className="border-b border-border px-6 py-5">
        <h2 className="text-lg font-bold text-[#111827]">Promo Code</h2>
      </div>

      {/* Content */}
      <div className="px-6 py-6">
        {/* Applied codes */}
        {appliedCodes.length > 0 && (
          <div className="mb-4 flex flex-wrap gap-2">
            {appliedCodes.map((d: any, idx: number) => (
              <div
                key={idx}
                className="flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-sm font-medium text-primary"
              >
                {d.code}
                <CartForm
                  route="/cart"
                  action={CartForm.ACTIONS.DiscountCodesUpdate}
                  inputs={{
                    discountCodes: appliedCodes
                      .filter((_: any, i: number) => i !== idx)
                      .map((c: any) => c.code),
                  }}
                >
                  <button
                    type="submit"
                    aria-label={`Remove ${d.code}`}
                    className="transition-colors hover:text-primary/60"
                  >
                    <X size={12} />
                  </button>
                </CartForm>
              </div>
            ))}
          </div>
        )}

        <CartForm
          route="/cart"
          action={CartForm.ACTIONS.DiscountCodesUpdate}
          fetcherKey="discount-code"
        >
          {/* Preserve existing applied codes */}
          {appliedCodes.map((d: any) => (
            <input
              key={d.code}
              type="hidden"
              name="discountCodes"
              value={d.code}
            />
          ))}

          <div className="flex gap-2">
            <Input
              name="discountCode"
              placeholder="Enter promo code"
              className="flex-1 rounded-sm border-[#d1d5db] px-[17px] py-[13px] text-[15px] placeholder:text-[#757575]"
            />
            <Button
              type="submit"
              variant="outline"
              disabled={isSubmitting}
              className="rounded-sm border-[#d1d5db] px-[21px] py-[13px] text-[15px] font-medium text-[#374151]"
            >
              {isSubmitting ? '...' : 'Apply'}
            </Button>
          </div>
        </CartForm>
      </div>
    </Card>
  );
}

// ============================================================================
// OrderSummary — Sticky sidebar
// ============================================================================

interface OrderSummaryProps {
  cart: OptimisticCart<any>;
  discountCodes?: any[];
}

function OrderSummary({cart, discountCodes}: OrderSummaryProps) {
  const {cost, totalQuantity} = cart;
  const subtotal = cost?.subtotalAmount;
  const total = cost?.totalAmount;

  // Calculate promo discount as difference between subtotal and total
  const hasAppliedDiscount =
    discountCodes?.some((d: any) => d.applicable) ?? false;
  const discountAmount =
    hasAppliedDiscount && subtotal && total
      ? parseFloat(subtotal.amount) - parseFloat(total.amount)
      : 0;

  return (
    <Card className="sticky top-0 w-[400px] shrink-0 gap-0 overflow-hidden bg-white p-0 shadow-sm">
      {/* Title */}
      <div className="border-b border-border px-6 pb-[18px] pt-6">
        <h3 className="text-lg font-bold text-[#1f2937]">Order Summary</h3>
      </div>

      <div className="px-6 pt-6">
        {/* Summary Rows */}
        <div className="flex flex-col gap-[17px]">
          <div className="flex items-center justify-between">
            <span className="text-[15px] text-[#4b5563]">
              Subtotal ({totalQuantity} {totalQuantity === 1 ? 'item' : 'items'}
              )
            </span>
            <span className="text-[15px] text-[#4b5563]">
              {subtotal ? formatMoney(subtotal) : '—'}
            </span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-[15px] text-[#4b5563]">Shipping</span>
            <span className="text-[15px] text-[#9ca3af]">
              Calculated at next step
            </span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-[15px] text-[#4b5563]">Tax</span>
            <span className="text-[15px] text-[#9ca3af]">
              Calculated at next step
            </span>
          </div>

          {discountAmount > 0 && (
            <div className="flex items-center justify-between">
              <span className="text-[15px] text-primary">Promo Discount</span>
              <span className="text-[15px] font-medium text-primary">
                -${discountAmount.toFixed(2)}
              </span>
            </div>
          )}
        </div>

        {/* 2px separator */}
        <div className="my-[22px] border-t-2 border-border" />

        {/* Estimated Total */}
        <div className="flex items-center justify-between">
          <span className="text-lg font-bold text-[#111827]">
            Estimated Total
          </span>
          <span className="text-lg font-bold text-[#111827]">
            {total ? formatMoney(total) : '—'}
          </span>
        </div>

        {/* Checkout CTA */}
        <div className="mt-[22px]">
          <Link
            to="/checkout/payment"
            className="flex w-full items-center justify-center gap-2 rounded-sm bg-brand-accent px-4 py-4 text-base font-semibold text-white transition-colors hover:bg-brand-accent/90"
          >
            Proceed to Checkout
            <ArrowRight size={16} />
          </Link>
        </div>

        {/* Trust Badges */}
        <div className="mb-6 mt-6 flex items-center justify-center gap-6 border-t border-border pt-6">
          <div className="flex items-center gap-2">
            <Lock size={13} className="text-primary" />
            <span className="text-[13px] text-[#4b5563]">Secure Checkout</span>
          </div>
          <div className="flex items-center gap-2">
            <ShieldCheck size={13} className="text-primary" />
            <span className="text-[13px] text-[#4b5563]">SSL Encrypted</span>
          </div>
        </div>
      </div>
    </Card>
  );
}

// ============================================================================
// Main CartPage
// ============================================================================

export default function CartPage() {
  const {cart: originalCart, isLoggedIn} = useLoaderData<typeof loader>();
  const cart = useOptimisticCart(originalCart);
  const hasItems = cart && (cart.totalQuantity ?? 0) > 0;

  return (
    <div className="min-h-screen bg-[#f9fafb]">
      {/* Step indicator */}
      <CheckoutProgress currentStep="cart" />

      <div className="mx-auto max-w-300 px-6 py-8">
        {hasItems ? (
          <div className="flex items-start gap-8">
            {/* ── Left: Main content ── */}
            <div className="flex min-w-0 flex-1 flex-col gap-6">
              {/* Guest banner — hidden for logged-in users */}
              {!isLoggedIn && <GuestBanner />}

              {/* Shopping Cart card */}
              <Card className="gap-0 overflow-hidden bg-white p-0 shadow-sm">
                {/* Header */}
                <div className="flex items-center justify-between border-b border-border px-6 py-5">
                  <h2 className="text-lg font-bold text-[#111827]">
                    Shopping Cart ({cart.totalQuantity}{' '}
                    {cart.totalQuantity === 1 ? 'item' : 'items'})
                  </h2>
                  <Button
                    variant="ghost"
                    asChild
                    className="p-2 text-[15px] font-medium text-secondary hover:bg-transparent hover:text-secondary/80"
                  >
                    <Link to="/collections">Continue Shopping</Link>
                  </Button>
                </div>

                {/* Items */}
                <div className="px-6 pt-6">
                  {cart.lines.nodes.map((line: any, idx: number) => (
                    <CartLineRow
                      key={line.id}
                      line={line}
                      isLast={idx === cart.lines.nodes.length - 1}
                    />
                  ))}
                </div>
              </Card>

              {/* Promo Code card */}
              <PromoCodeCard discountCodes={cart.discountCodes} />
            </div>

            {/* ── Right: Order Summary ── */}
            <OrderSummary
              cart={cart as OptimisticCart<any>}
              discountCodes={cart.discountCodes}
            />
          </div>
        ) : (
          <CartEmpty />
        )}
      </div>
    </div>
  );
}
