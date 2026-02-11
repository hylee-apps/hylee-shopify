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
import {Breadcrumb, Icon, Button} from '~/components';
import {PriceDisplay} from '~/components/commerce';

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
      <Icon name="cart" size={80} className="mb-6 text-text-muted" />
      <h2 className="mb-2 text-2xl font-semibold text-dark">
        Your cart is empty
      </h2>
      <p className="mb-8 text-text-muted">Add items to get started</p>
      <Button as="link" to="/collections" size="lg">
        Start Shopping
      </Button>
    </div>
  );
}

// ============================================================================
// CartLineItem Component
// ============================================================================

interface CartLineItemProps {
  line: OptimisticCart<any>['lines']['nodes'][number];
}

function CartLineItem({line}: CartLineItemProps) {
  const {id, quantity, cost, merchandise, attributes} = line;

  if (typeof merchandise === 'string') return null;

  const {product, title: variantTitle, image, selectedOptions} = merchandise;
  const lineUrl = `/products/${product.handle}`;

  const isOnSale =
    cost.compareAtAmountPerQuantity &&
    parseFloat(cost.compareAtAmountPerQuantity.amount) >
      parseFloat(cost.amountPerQuantity.amount);

  // Check if this line is being optimistically removed
  const isRemoving = 'isOptimistic' in line;

  return (
    <div
      className={`flex gap-4 border-b border-border py-6 transition-opacity sm:gap-6 ${
        isRemoving ? 'pointer-events-none opacity-50' : ''
      }`}
    >
      {/* Product Image */}
      <Link to={lineUrl} className="shrink-0">
        {image ? (
          <Image
            data={image}
            width={120}
            height={120}
            className="h-30 w-30 rounded-md object-cover"
            alt={image.altText || product.title}
          />
        ) : (
          <div className="flex h-30 w-30 items-center justify-center rounded-md bg-surface">
            <Icon name="image" size={40} className="text-text-muted" />
          </div>
        )}
      </Link>

      {/* Line Details */}
      <div className="flex flex-1 flex-col gap-2">
        <div>
          <Link
            to={lineUrl}
            className="text-base font-medium text-dark hover:text-primary"
          >
            {product.title}
          </Link>
          {product.vendor && (
            <p className="text-sm text-text-muted">{product.vendor}</p>
          )}
        </div>

        {/* Variant Options */}
        {selectedOptions &&
          selectedOptions.length > 0 &&
          !(
            selectedOptions.length === 1 &&
            selectedOptions[0].name === 'Title' &&
            selectedOptions[0].value === 'Default Title'
          ) && (
            <div className="flex flex-wrap gap-x-3 gap-y-0.5 text-sm text-text-muted">
              {selectedOptions.map((option: any) => (
                <span key={option.name}>
                  {option.name}: {option.value}
                </span>
              ))}
            </div>
          )}

        {/* Line item properties (custom attributes) */}
        {attributes && attributes.length > 0 && (
          <div className="flex flex-wrap gap-x-3 gap-y-0.5 text-sm text-text-muted">
            {attributes
              .filter((attr: any) => !attr.key.startsWith('_'))
              .map((attr: any) => (
                <span key={attr.key}>
                  {attr.key}: {attr.value}
                </span>
              ))}
          </div>
        )}

        {/* Quantity + Remove Row */}
        <div className="mt-auto flex items-center gap-4 pt-2">
          <CartLineQuantity lineId={id} quantity={quantity} />
          <CartLineRemove lineId={id} />
        </div>
      </div>

      {/* Pricing */}
      <div className="shrink-0 text-right">
        <PriceDisplay
          price={cost.amountPerQuantity}
          compareAtPrice={isOnSale ? cost.compareAtAmountPerQuantity : null}
          size="sm"
          layout="vertical"
        />
        {quantity > 1 && (
          <p className="mt-1 text-sm font-medium text-dark">
            Total: {formatMoney(cost.totalAmount)}
          </p>
        )}

        {/* Line-level discounts */}
        {'discountAllocations' in line &&
          (line as any).discountAllocations?.length > 0 && (
            <div className="mt-1 space-y-0.5">
              {(line as any).discountAllocations.map(
                (discount: any, idx: number) => (
                  <p key={idx} className="text-xs font-medium text-primary">
                    {discount.discountApplication?.title} (-
                    {formatMoney(discount.allocatedAmount)})
                  </p>
                ),
              )}
            </div>
          )}
      </div>
    </div>
  );
}

// ============================================================================
// CartLineQuantity Component
// ============================================================================

function CartLineQuantity({
  lineId,
  quantity,
}: {
  lineId: string;
  quantity: number;
}) {
  return (
    <div className="flex items-center rounded-md border border-border">
      {/* Decrement */}
      <CartForm
        route="/cart"
        action={CartForm.ACTIONS.LinesUpdate}
        inputs={{
          lines: [{id: lineId, quantity: Math.max(1, quantity - 1)}],
        }}
      >
        <button
          type="submit"
          disabled={quantity <= 1}
          className="flex h-8 w-8 items-center justify-center rounded-l-md border-r border-border text-text transition-colors hover:bg-surface disabled:cursor-not-allowed disabled:opacity-50"
          aria-label="Decrease quantity"
        >
          <Icon name="minus" size={14} />
        </button>
      </CartForm>

      {/* Display */}
      <span className="flex h-8 w-10 items-center justify-center text-sm font-medium text-dark">
        {quantity}
      </span>

      {/* Increment */}
      <CartForm
        route="/cart"
        action={CartForm.ACTIONS.LinesUpdate}
        inputs={{
          lines: [{id: lineId, quantity: quantity + 1}],
        }}
      >
        <button
          type="submit"
          className="flex h-8 w-8 items-center justify-center rounded-r-md border-l border-border text-text transition-colors hover:bg-surface"
          aria-label="Increase quantity"
        >
          <Icon name="plus" size={14} />
        </button>
      </CartForm>
    </div>
  );
}

// ============================================================================
// CartLineRemove Component
// ============================================================================

function CartLineRemove({lineId}: {lineId: string}) {
  return (
    <CartForm
      route="/cart"
      action={CartForm.ACTIONS.LinesRemove}
      inputs={{lineIds: [lineId]}}
    >
      <button
        type="submit"
        className="flex items-center gap-1 text-sm text-text-muted transition-colors hover:text-primary"
        aria-label="Remove item"
      >
        <Icon name="trash" size={16} />
        <span className="hidden sm:inline">Remove</span>
      </button>
    </CartForm>
  );
}

// ============================================================================
// CartSummary Component
// ============================================================================

interface CartSummaryProps {
  cart: OptimisticCart<any>;
}

function CartSummary({cart}: CartSummaryProps) {
  const {cost, totalQuantity, checkoutUrl, discountCodes, note} = cart;

  const subtotal = cost?.subtotalAmount;
  const total = cost?.totalAmount;

  // Calculate savings
  const hasSavings =
    subtotal && total && parseFloat(subtotal.amount) > parseFloat(total.amount);
  const savings = hasSavings
    ? (parseFloat(subtotal.amount) - parseFloat(total.amount)).toFixed(2)
    : null;

  return (
    <div className="rounded-lg border border-border bg-white p-6">
      <h2 className="mb-4 text-lg font-semibold text-dark">Order Summary</h2>

      {/* Subtotal */}
      <div className="flex items-center justify-between py-2 text-sm">
        <span className="text-text">
          Subtotal ({totalQuantity} {totalQuantity === 1 ? 'item' : 'items'})
        </span>
        {subtotal && (
          <span className="font-medium text-dark">{formatMoney(subtotal)}</span>
        )}
      </div>

      {/* Cart-level Discounts */}
      {discountCodes &&
        discountCodes.filter((d: any) => d.applicable).length > 0 && (
          <div className="space-y-1 border-t border-border pt-2">
            {discountCodes
              .filter((d: any) => d.applicable)
              .map((discount: any, idx: number) => (
                <div
                  key={idx}
                  className="flex items-center justify-between py-1 text-sm"
                >
                  <span className="text-primary">
                    <Icon
                      name="shopping-bag"
                      size={14}
                      className="mr-1 inline-block"
                    />
                    {discount.code}
                  </span>
                  <CartForm
                    route="/cart"
                    action={CartForm.ACTIONS.DiscountCodesUpdate}
                    inputs={{discountCodes: []}}
                  >
                    <button
                      type="submit"
                      className="text-xs text-text-muted hover:text-primary"
                      aria-label={`Remove discount ${discount.code}`}
                    >
                      <Icon name="x" size={12} />
                    </button>
                  </CartForm>
                </div>
              ))}
          </div>
        )}

      {/* Savings */}
      {savings && (
        <div className="flex items-center justify-between border-t border-border py-2 text-sm">
          <span className="font-medium text-primary">Total Savings</span>
          <span className="font-medium text-primary">
            -
            {formatMoney({
              amount: savings,
              currencyCode: total.currencyCode,
            })}
          </span>
        </div>
      )}

      {/* Shipping */}
      <div className="flex items-center justify-between border-t border-border py-2 text-sm">
        <span className="text-text">Shipping</span>
        <span className="text-text-muted">Calculated at checkout</span>
      </div>

      {/* Total */}
      <div className="flex items-center justify-between border-t border-border py-3 text-base">
        <span className="font-semibold text-dark">Total</span>
        {total && (
          <span className="font-bold text-dark">{formatMoney(total)}</span>
        )}
      </div>

      {/* Discount Code Input */}
      <DiscountCodeInput discountCodes={discountCodes} />

      {/* Order Notes */}
      <CartNoteInput note={note ?? ''} />

      {/* Checkout Button */}
      {checkoutUrl && (
        <a
          href={checkoutUrl}
          className="mt-4 flex w-full items-center justify-center gap-2 rounded-md bg-primary px-6 py-3 text-base font-medium text-white transition-colors hover:bg-primary/90"
        >
          <Icon name="check-circle" size={18} />
          Proceed to Checkout
        </a>
      )}

      {/* Continue Shopping */}
      <Link
        to="/collections"
        className="mt-3 block text-center text-sm text-text-muted transition-colors hover:text-primary"
      >
        Continue Shopping
      </Link>

      {/* Trust Badges */}
      <div className="mt-6 flex flex-col gap-2 border-t border-border pt-4">
        <div className="flex items-center gap-2 text-sm text-text-muted">
          <Icon name="check-circle" size={16} />
          <span>Secure Checkout</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-text-muted">
          <Icon name="truck" size={16} />
          <span>Free Shipping Over $50</span>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// DiscountCodeInput Component
// ============================================================================

function DiscountCodeInput({
  discountCodes,
}: {
  discountCodes: any[] | undefined;
}) {
  const fetcher = useFetcher();
  const isSubmitting = fetcher.state !== 'idle';

  return (
    <CartForm
      route="/cart"
      action={CartForm.ACTIONS.DiscountCodesUpdate}
      fetcherKey="discount-code"
    >
      <div className="mt-3 flex gap-2">
        <input
          type="text"
          name="discountCode"
          placeholder="Discount code"
          className="flex-1 rounded-md border border-border bg-white px-3 py-2 text-sm text-dark placeholder:text-text-muted focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
        />
        <button
          type="submit"
          disabled={isSubmitting}
          className="rounded-md border border-border bg-surface px-4 py-2 text-sm font-medium text-dark transition-colors hover:bg-surface/80 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isSubmitting ? 'Applying...' : 'Apply'}
        </button>
      </div>
    </CartForm>
  );
}

// ============================================================================
// CartNoteInput Component
// ============================================================================

function CartNoteInput({note}: {note: string}) {
  const fetcher = useFetcher();

  return (
    <CartForm
      route="/cart"
      action={CartForm.ACTIONS.NoteUpdate}
      fetcherKey="cart-note"
    >
      <div className="mt-4">
        <label
          htmlFor="cart-note"
          className="mb-1 block text-sm font-medium text-text"
        >
          Order Notes (Optional)
        </label>
        <textarea
          id="cart-note"
          name="note"
          rows={3}
          defaultValue={note}
          placeholder="Special instructions for your order..."
          className="w-full rounded-md border border-border bg-white px-3 py-2 text-sm text-dark placeholder:text-text-muted focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
          onBlur={(e) => {
            if (e.currentTarget.value !== note) {
              e.currentTarget.form?.requestSubmit();
            }
          }}
        />
      </div>
    </CartForm>
  );
}

// ============================================================================
// Main Cart Page Component
// ============================================================================

export default function CartPage() {
  const {cart: originalCart} = useLoaderData<typeof loader>();
  const cart = useOptimisticCart(originalCart);

  const breadcrumbs = [{label: 'Home', url: '/'}, {label: 'Shopping Cart'}];

  const hasItems = cart && (cart.totalQuantity ?? 0) > 0;

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <Breadcrumb items={breadcrumbs} className="mb-6" />

      {/* Page Header */}
      <div className="mb-8 flex items-baseline gap-3">
        <h1 className="text-3xl font-bold text-dark">Shopping Cart</h1>
        {hasItems && (
          <span className="text-text-muted">
            ({cart.totalQuantity} {cart.totalQuantity === 1 ? 'item' : 'items'})
          </span>
        )}
      </div>

      {hasItems ? (
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          {/* Cart Items */}
          <div className="lg:col-span-2">
            {cart.lines.nodes.map((line: any) => (
              <CartLineItem key={line.id} line={line} />
            ))}
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="sticky top-6">
              <CartSummary cart={cart as OptimisticCart<any>} />
            </div>
          </div>
        </div>
      ) : (
        <CartEmpty />
      )}
    </div>
  );
}
