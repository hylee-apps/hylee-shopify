import {Link} from 'react-router';
import {useTranslation} from 'react-i18next';
import {Image, CartForm} from '@shopify/hydrogen';
import {ImageIcon, ShoppingCart, Eye, Check, Loader2} from 'lucide-react';
import type {BuyAgainProduct} from '~/lib/buy-again-data';

// ============================================================================
// BuyAgainCard Component
// ============================================================================

interface BuyAgainCardProps {
  product: BuyAgainProduct;
}

export function BuyAgainCard({product}: BuyAgainCardProps) {
  const {t} = useTranslation();
  return (
    <div
      className="flex w-full flex-col overflow-clip rounded-[12px] bg-white shadow-[0px_1px_2px_0px_rgba(0,0,0,0.05)]"
      data-component="buy-again-card"
    >
      <div className="flex flex-col p-[20px]">
        {/* Product Image */}
        {product.image ? (
          <div className="h-[200px] w-full overflow-clip rounded-[8px] bg-[#f3f4f6]">
            <Image
              data={product.image}
              className="h-full w-full object-cover"
              sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
              alt={product.image.altText || product.productTitle}
            />
          </div>
        ) : (
          <div className="flex h-[200px] w-full items-center justify-center overflow-clip rounded-[8px] bg-[#f3f4f6]">
            <ImageIcon size={60} className="text-[#9ca3af]" />
          </div>
        )}

        {/* Product Title */}
        <div className="mt-[16px]">
          {product.productHandle ? (
            <Link
              to={`/products/${product.productHandle}`}
              className="text-[15px] font-medium leading-[21px] text-[#2699a6] hover:underline"
            >
              {product.productTitle}
            </Link>
          ) : (
            <span className="text-[15px] font-medium leading-[21px] text-[#2699a6]">
              {product.productTitle}
            </span>
          )}
        </div>

        {/* Price */}
        {product.price && (
          <div className="mt-[12px] text-[18px] font-bold leading-[27px] text-[#111827]">
            {formatMoney(product.price)}
          </div>
        )}

        {/* Last Ordered */}
        <div className="mt-[8px] text-[13px] leading-[19.5px] text-[#6b7280]">
          Last ordered: {formatDate(product.lastPurchasedDate)}
        </div>

        {/* Action Buttons */}
        <div className="mt-[16px] flex h-[47px] gap-[8px]">
          {/* Add to Cart */}
          {product.variantId ? (
            <CartForm
              route="/cart"
              action={CartForm.ACTIONS.LinesAdd}
              inputs={{
                lines: [{merchandiseId: product.variantId, quantity: 1}],
              }}
              fetcherKey={`buy-again-${product.id}`}
            >
              {(fetcher) => {
                const isAdding = fetcher.state !== 'idle';
                const isAdded =
                  fetcher.state === 'idle' &&
                  fetcher.data != null &&
                  !(fetcher.data as any)?.errors?.length;

                return (
                  <button
                    type="submit"
                    disabled={isAdding}
                    aria-label={`Add ${product.productTitle} to cart`}
                    className="flex h-full w-full cursor-pointer items-center justify-center gap-[8px] border border-[#2699a6] bg-[#2699a6] px-[17px] pb-[13.5px] pt-[12.5px] text-[14px] font-medium leading-[21px] text-white transition-colors hover:bg-[#1e7a85] disabled:opacity-70"
                  >
                    {isAdding ? (
                      <Loader2 size={14} className="animate-spin text-white" />
                    ) : isAdded ? (
                      <Check size={14} className="text-white" />
                    ) : (
                      <ShoppingCart size={14} className="text-white" />
                    )}
                    <span className="text-center">
                      {isAdding
                        ? t('addToCart.adding')
                        : isAdded
                          ? t('addToCart.added')
                          : t('addToCart.idle')}
                    </span>
                  </button>
                );
              }}
            </CartForm>
          ) : (
            <button
              type="button"
              disabled
              className="flex h-full flex-1 cursor-not-allowed items-center justify-center gap-[8px] border border-[#d1d5db] bg-[#f3f4f6] px-[17px] py-[13px] text-[14px] font-medium leading-[21px] text-[#9ca3af]"
            >
              <ShoppingCart size={14} className="text-[#9ca3af]" />
              <span className="text-center">Unavailable</span>
            </button>
          )}

          {/* View Button (icon only) */}
          {product.productHandle ? (
            <Link
              to={`/products/${product.productHandle}`}
              aria-label={`View ${product.productTitle}`}
              className="flex h-full flex-1 items-center justify-center border border-[#d1d5db] bg-white px-[17px] py-[13px] transition-colors hover:border-[#9ca3af]"
            >
              <Eye size={14} className="text-[#374151]" />
            </Link>
          ) : (
            <div className="flex h-full flex-1 items-center justify-center border border-[#d1d5db] bg-[#f3f4f6] opacity-50">
              <Eye size={14} className="text-[#9ca3af]" />
            </div>
          )}
        </div>
      </div>
    </div>
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

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}
