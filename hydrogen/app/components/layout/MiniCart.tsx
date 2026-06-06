import {Suspense} from 'react';
import {Link} from 'react-router';
import {Await, useRouteLoaderData} from 'react-router';
import {useTranslation} from 'react-i18next';
import {Image} from '@shopify/hydrogen';
import {ShoppingCart, X} from 'lucide-react';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '~/components/ui/sheet';
import {Button} from '~/components/ui/button';
import type {RootLoader} from '~/root';

// ============================================================================
// Types — minimal shapes needed from the resolved cart
// ============================================================================

interface Money {
  amount: string;
  currencyCode: string;
}

interface CartImage {
  url: string;
  altText?: string | null;
  width?: number | null;
  height?: number | null;
}

interface CartLine {
  id: string;
  quantity: number;
  cost: {totalAmount: Money};
  merchandise: {
    title: string;
    image?: CartImage | null;
    product: {title: string; handle: string};
    selectedOptions?: Array<{name: string; value: string}>;
  };
}

interface ResolvedCart {
  totalQuantity: number;
  checkoutUrl: string;
  cost: {totalAmount: Money};
  lines: {nodes: CartLine[]};
}

// ============================================================================
// Helpers
// ============================================================================

function formatMoney(money: Money): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: money.currencyCode,
  }).format(parseFloat(money.amount));
}

// ============================================================================
// MiniCartContent — rendered once cart Promise resolves
// ============================================================================

function MiniCartContent({
  cart,
  onClose,
}: {
  cart: ResolvedCart | null;
  onClose: () => void;
}) {
  const {t} = useTranslation();
  const lines = cart?.lines?.nodes ?? [];
  const hasItems = lines.length > 0;

  if (!hasItems) {
    return (
      <div className="flex flex-col items-center justify-center h-full py-16 text-center px-6">
        <ShoppingCart size={48} className="mb-4 text-text-muted" />
        <p className="text-sm font-medium text-text-muted mb-4">
          {t('miniCart.empty')}
        </p>
        <Button asChild onClick={onClose}>
          <Link to="/collections/all">{t('miniCart.continueShopping')}</Link>
        </Button>
      </div>
    );
  }

  const subtotal = cart!.cost?.totalAmount;

  return (
    <div className="flex flex-col h-full">
      {/* Item list */}
      <div className="flex-1 overflow-y-auto py-4 px-4 space-y-4">
        {lines.map((line) => {
          if (typeof line.merchandise === 'string') return null;
          const {
            product,
            image,
            title: variantTitle,
            selectedOptions,
          } = line.merchandise;
          const attrs =
            selectedOptions?.filter(
              (o) => !(o.name === 'Title' && o.value === 'Default Title'),
            ) ?? [];

          return (
            <div
              key={line.id}
              className="flex gap-3"
              data-testid="mini-cart-item"
            >
              {/* Thumbnail */}
              <div className="w-14 h-14 shrink-0 rounded-[6px] overflow-hidden bg-gray-100 border border-border">
                {image ? (
                  <Image
                    data={image}
                    sizes="56px"
                    className="w-full h-full object-cover"
                    alt={image.altText ?? product.title}
                  />
                ) : (
                  <div className="w-full h-full bg-gray-100" />
                )}
              </div>

              {/* Info */}
              <div className="flex flex-col justify-center flex-1 min-w-0">
                <Link
                  to={`/products/${product.handle}`}
                  className="text-[13px] font-medium text-text line-clamp-2 leading-tight hover:text-primary transition-colors"
                  onClick={onClose}
                >
                  {product.title}
                </Link>
                {attrs.length > 0 && (
                  <p className="text-xs text-text-muted mt-0.5">
                    {attrs.map((o) => o.value).join(' / ')}
                  </p>
                )}
                <div className="flex items-center justify-between mt-1">
                  <span className="text-xs text-text-muted">
                    {t('miniCart.qty', {count: line.quantity})}
                  </span>
                  <span className="text-[13px] font-semibold text-text">
                    {formatMoney(line.cost.totalAmount)}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Footer */}
      <div className="border-t border-border px-4 py-4 space-y-3 bg-white">
        {subtotal && (
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-text">
              {t('miniCart.subtotal')}
            </span>
            <span className="text-sm font-bold text-text">
              {formatMoney(subtotal)}
            </span>
          </div>
        )}
        <Button asChild className="w-full" onClick={onClose}>
          <Link to="/cart" data-testid="mini-cart-view-cart">
            {t('miniCart.viewCart')}
          </Link>
        </Button>
        <Button
          asChild
          variant="outline"
          className="w-full"
          data-testid="mini-cart-checkout"
        >
          <a href={cart!.checkoutUrl}>{t('miniCart.checkout')}</a>
        </Button>
      </div>
    </div>
  );
}

// ============================================================================
// MiniCart — Sheet wrapper
// ============================================================================

interface MiniCartProps {
  open: boolean;
  onClose: () => void;
  cartCount: number;
}

export function MiniCart({open, onClose, cartCount}: MiniCartProps) {
  const {t} = useTranslation();
  const data = useRouteLoaderData<RootLoader>('root');

  return (
    <Sheet open={open} onOpenChange={(v) => !v && onClose()}>
      <SheetContent
        side="right"
        className="w-full sm:w-[400px] p-0 flex flex-col"
        data-testid="mini-cart"
      >
        <SheetHeader className="px-4 py-4 border-b border-border shrink-0">
          <div className="flex items-center justify-between">
            <SheetTitle className="text-base font-bold text-text">
              {t('miniCart.title', {count: cartCount})}
            </SheetTitle>
            <button
              type="button"
              onClick={onClose}
              className="p-1 text-text-muted hover:text-text transition-colors"
              aria-label={t('miniCart.close')}
            >
              <X size={18} />
            </button>
          </div>
        </SheetHeader>

        <div className="flex-1 overflow-hidden flex flex-col">
          <Suspense
            fallback={
              <div className="flex items-center justify-center h-full">
                <ShoppingCart
                  size={32}
                  className="animate-pulse text-text-muted"
                />
              </div>
            }
          >
            <Await resolve={data?.cart}>
              {(resolvedCart) => (
                <MiniCartContent
                  cart={resolvedCart as ResolvedCart | null}
                  onClose={onClose}
                />
              )}
            </Await>
          </Suspense>
        </div>
      </SheetContent>
    </Sheet>
  );
}
