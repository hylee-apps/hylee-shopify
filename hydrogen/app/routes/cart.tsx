import type {Route} from './+types/cart';
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
  XCircle,
  Truck,
  X,
} from 'lucide-react';
import {Button} from '~/components/ui/button';

// ============================================================================
// Constants
// ============================================================================

/** Free shipping threshold in dollars */
const FREE_SHIPPING_THRESHOLD = 50;

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
  return {cart};
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

      // Combine with existing discount codes
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
// Money Formatter
// ============================================================================

function formatMoney(money: {amount: string; currencyCode: string}): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: money.currencyCode,
  }).format(parseFloat(money.amount));
}

// ============================================================================
// CartEmpty Component
// ============================================================================

function CartEmpty() {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <ShoppingCart size={80} className="mb-6 text-text-muted" />
      <h2 className="mb-2 text-2xl font-semibold text-dark">
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
// CartLineRow Component
// ============================================================================

interface CartLineRowProps {
  line: OptimisticCart<any>['lines']['nodes'][number];
  isLast: boolean;
}

function CartLineRow({line, isLast}: CartLineRowProps) {
  const {id, quantity, cost, merchandise} = line;

  if (typeof merchandise === 'string') return null;

  const {product, title: variantTitle, image, selectedOptions} = merchandise;
  const lineUrl = `/products/${product.handle}`;
  const isRemoving = 'isOptimistic' in line;

  // Build variant description text
  const variantDescription =
    selectedOptions &&
    selectedOptions.length > 0 &&
    !(
      selectedOptions.length === 1 &&
      selectedOptions[0].name === 'Title' &&
      selectedOptions[0].value === 'Default Title'
    )
      ? selectedOptions.map((o: any) => `${o.name}: ${o.value}`).join(', ')
      : product.vendor || '';

  return (
    <div
      className={`transition-opacity ${isRemoving ? 'pointer-events-none opacity-50' : ''}`}
    >
      <div className="grid grid-cols-[1fr_auto_auto_auto_auto] items-center gap-4 px-4 py-4 sm:grid-cols-[1fr_120px_140px_120px_32px] sm:gap-6">
        {/* Item: Thumbnail + Info */}
        <div className="flex items-center gap-4">
          <Link to={lineUrl} className="shrink-0">
            {image ? (
              <Image
                data={image}
                width={56}
                height={56}
                className="size-14 rounded-md object-cover"
                alt={image.altText || product.title}
              />
            ) : (
              <div className="flex size-14 items-center justify-center rounded-md bg-surface">
                <ImageIcon size={24} className="text-text-muted" />
              </div>
            )}
          </Link>
          <div className="min-w-0">
            <Link
              to={lineUrl}
              className="block truncate text-base font-medium text-dark hover:text-primary"
            >
              {product.title}
            </Link>
            {variantDescription && (
              <p className="truncate text-sm text-text-muted">
                {variantDescription}
              </p>
            )}
          </div>
        </div>

        {/* Unit Price */}
        <div className="hidden text-base text-text sm:block">
          {formatMoney(cost.amountPerQuantity)}
        </div>

        {/* Quantity Controls */}
        <div className="flex items-center justify-center">
          <div className="flex items-center gap-4 rounded-full bg-white px-4 py-2 shadow-sm ring-1 ring-border">
            {/* Decrement */}
            <CartForm
              route="/cart"
              action={CartForm.ACTIONS.LinesUpdate}
              inputs={{
                lines: [{id, quantity: Math.max(1, quantity - 1)}],
              }}
            >
              <button
                type="submit"
                disabled={quantity <= 1}
                className="flex size-6 items-center justify-center rounded-full bg-surface text-text transition-colors hover:bg-border disabled:cursor-not-allowed disabled:opacity-40"
                aria-label="Decrease quantity"
              >
                <Minus size={14} />
              </button>
            </CartForm>

            <span className="min-w-6 text-center text-lg font-bold text-dark">
              {quantity}
            </span>

            {/* Increment */}
            <CartForm
              route="/cart"
              action={CartForm.ACTIONS.LinesUpdate}
              inputs={{
                lines: [{id, quantity: quantity + 1}],
              }}
            >
              <button
                type="submit"
                className="flex size-6 items-center justify-center rounded-full bg-surface text-text transition-colors hover:bg-border"
                aria-label="Increase quantity"
              >
                <Plus size={14} />
              </button>
            </CartForm>
          </div>
        </div>

        {/* Line Total */}
        <div className="text-right text-base font-bold text-dark">
          {formatMoney(cost.totalAmount)}
        </div>

        {/* Remove */}
        <CartForm
          route="/cart"
          action={CartForm.ACTIONS.LinesRemove}
          inputs={{lineIds: [id]}}
        >
          <button
            type="submit"
            className="flex size-8 items-center justify-center rounded-full text-text-muted transition-colors hover:bg-surface hover:text-primary"
            aria-label="Remove item"
          >
            <XCircle size={20} />
          </button>
        </CartForm>
      </div>

      {/* Divider */}
      {!isLast && <div className="mx-4 border-b border-border" />}
    </div>
  );
}

// ============================================================================
// CartSummary Component
// ============================================================================

interface CartSummaryProps {
  cart: OptimisticCart<any>;
}

function CartSummary({cart}: CartSummaryProps) {
  const {cost, discountCodes, checkoutUrl} = cart;
  const subtotal = cost?.subtotalAmount;
  const total = cost?.totalAmount;
  const totalDollars = total ? parseFloat(total.amount) : 0;

  // Free shipping progress
  const shippingProgress = Math.min(
    (totalDollars / FREE_SHIPPING_THRESHOLD) * 100,
    100,
  );
  const amountToFreeShipping = Math.max(
    FREE_SHIPPING_THRESHOLD - totalDollars,
    0,
  );
  const hasFreeShipping = totalDollars >= FREE_SHIPPING_THRESHOLD;

  return (
    <div className="mt-6 space-y-6">
      {/* Summary Lines */}
      <div className="flex flex-col gap-3 px-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex-1 space-y-2">
          {/* Subtotal */}
          <div className="flex items-center justify-between sm:gap-12">
            <span className="text-sm font-bold text-dark">Subtotal</span>
            {subtotal && (
              <span className="text-base font-bold text-dark">
                {formatMoney(subtotal)}
              </span>
            )}
          </div>

          {/* Sales Tax */}
          <div className="flex items-center justify-between sm:gap-12">
            <span className="text-sm font-bold text-dark">Sales Tax</span>
            <span className="text-base font-bold text-dark">
              Calculated at checkout
            </span>
          </div>

          {/* Shipping */}
          <div className="flex items-center justify-between sm:gap-12">
            <span className="text-sm font-bold text-dark">Shipping</span>
            <div className="flex items-center gap-3">
              <span className="text-base text-text-muted">
                {hasFreeShipping ? 'Free' : 'Calculated at checkout'}
              </span>
              <DiscountCodeToggle discountCodes={discountCodes} />
            </div>
          </div>
        </div>
      </div>

      {/* Divider */}
      <div className="border-b border-border" />

      {/* Total */}
      <div className="flex items-baseline justify-between px-4">
        <span className="text-3xl font-normal text-dark">Total</span>
        {total && (
          <span className="text-xl font-normal text-dark">
            {formatMoney(total)}
          </span>
        )}
      </div>

      {/* Free Shipping Progress */}
      <div className="flex items-center gap-4 px-4">
        <Truck size={40} className="shrink-0 text-dark" />

        <div className="flex-1 space-y-2">
          {/* Progress Bar */}
          <div className="h-3 overflow-hidden rounded-full bg-border">
            <div
              className="h-full rounded-full bg-primary transition-all"
              style={{width: `${shippingProgress}%`}}
            />
          </div>

          {/* Free Shipping Message */}
          <p className="text-sm text-dark">
            {hasFreeShipping ? (
              <>
                You qualify for <span className="font-bold">Free Shipping</span>
                !
              </>
            ) : (
              <>
                You are{' '}
                <span className="font-medium">
                  ${amountToFreeShipping.toFixed(2)}
                </span>{' '}
                away from <span className="font-bold">Free Shipping</span>
              </>
            )}
          </p>
        </div>
      </div>

      {/* Checkout Button */}
      {checkoutUrl && (
        <div className="px-4 pb-4">
          <a
            href={checkoutUrl}
            className="flex w-full items-center justify-center rounded-lg bg-dark px-6 py-4 text-2xl font-normal text-surface transition-colors hover:bg-dark/90"
          >
            Check Out
          </a>
        </div>
      )}
    </div>
  );
}

// ============================================================================
// DiscountCodeToggle Component
// ============================================================================

function DiscountCodeToggle({
  discountCodes,
}: {
  discountCodes: any[] | undefined;
}) {
  const fetcher = useFetcher();
  const isSubmitting = fetcher.state !== 'idle';

  // Show applied codes or "Add Coupon" link
  const appliedCodes = discountCodes?.filter((d: any) => d.applicable) ?? [];

  if (appliedCodes.length > 0) {
    return (
      <div className="flex items-center gap-2">
        {appliedCodes.map((discount: any, idx: number) => (
          <span key={idx} className="text-sm font-medium text-primary">
            {discount.code}
            <CartForm
              route="/cart"
              action={CartForm.ACTIONS.DiscountCodesUpdate}
              inputs={{discountCodes: []}}
            >
              <button
                type="submit"
                className="ml-1 text-xs text-text-muted hover:text-primary"
                aria-label={`Remove discount ${discount.code}`}
              >
                <X size={12} />
              </button>
            </CartForm>
          </span>
        ))}
      </div>
    );
  }

  return (
    <CartForm
      route="/cart"
      action={CartForm.ACTIONS.DiscountCodesUpdate}
      fetcherKey="discount-code-inline"
    >
      <details className="group relative">
        <summary className="cursor-pointer text-base underline decoration-solid text-text hover:text-primary">
          Add Coupon
        </summary>
        <div className="absolute right-0 top-full z-10 mt-2 flex gap-2 rounded-lg border border-border bg-white p-3 shadow-md">
          <input
            type="text"
            name="discountCode"
            placeholder="Code"
            className="w-36 rounded-md border border-border px-3 py-1.5 text-sm text-dark placeholder:text-text-muted focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
          />
          <button
            type="submit"
            disabled={isSubmitting}
            className="rounded-md bg-primary px-3 py-1.5 text-sm font-medium text-white transition-colors hover:bg-primary/90 disabled:opacity-50"
          >
            {isSubmitting ? '...' : 'Apply'}
          </button>
        </div>
      </details>
    </CartForm>
  );
}

// ============================================================================
// Main Cart Page Component
// ============================================================================

export default function CartPage() {
  const {cart: originalCart} = useLoaderData<typeof loader>();
  const cart = useOptimisticCart(originalCart);

  const hasItems = cart && (cart.totalQuantity ?? 0) > 0;

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
      {hasItems ? (
        <div className="overflow-hidden rounded-lg border border-border bg-white shadow-sm">
          {/* Gradient Banner */}
          <div className="relative overflow-hidden bg-linear-to-r from-primary via-accent to-secondary px-6 py-5">
            <h1 className="relative z-10 text-2xl font-normal text-dark sm:text-[28px] sm:leading-9">
              Your Cart ({cart.totalQuantity}{' '}
              {cart.totalQuantity === 1 ? 'Item' : 'Items'})
            </h1>
          </div>

          {/* Column Headers (desktop) */}
          <div className="hidden border-b border-border bg-surface px-4 py-3 text-xs font-semibold uppercase tracking-wider text-text-muted sm:grid sm:grid-cols-[1fr_120px_140px_120px_32px] sm:gap-6">
            <span>Item</span>
            <span>Price</span>
            <span className="text-center">Quantity</span>
            <span className="text-right">Total</span>
            <span />
          </div>

          {/* Cart Line Items */}
          <div>
            {cart.lines.nodes.map((line: any, idx: number) => (
              <CartLineRow
                key={line.id}
                line={line}
                isLast={idx === cart.lines.nodes.length - 1}
              />
            ))}
          </div>

          {/* Divider before summary */}
          <div className="border-t border-border" />

          {/* Summary + Checkout */}
          <CartSummary cart={cart as OptimisticCart<any>} />
        </div>
      ) : (
        <CartEmpty />
      )}
    </div>
  );
}
