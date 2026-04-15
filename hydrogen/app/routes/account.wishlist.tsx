import type {Route} from './+types/account.wishlist';
import {redirect, Form, Link, useNavigation} from 'react-router';
import {getSeoMeta, CartForm, Image} from '@shopify/hydrogen';
import {useTranslation} from 'react-i18next';
import {Heart, ImageIcon, ShoppingCart, Check, Loader2} from 'lucide-react';
import {isCustomerLoggedIn, getCustomerAccessToken} from '~/lib/customer-auth';
import {
  readWishlistIds,
  removeFromWishlist,
  type AdminEnv,
} from '~/lib/wishlist';

// ============================================================================
// Route Meta
// ============================================================================

export function meta() {
  return getSeoMeta({
    title: 'Wishlist',
    description: 'Your saved items on Hy-lee.',
  });
}

// ============================================================================
// GraphQL — Storefront API
// ============================================================================

const WISHLIST_PRODUCTS_QUERY = `#graphql
  query WishlistProducts($ids: [ID!]!) {
    nodes(ids: $ids) {
      ... on Product {
        id
        title
        handle
        featuredImage {
          url
          altText
        }
        priceRange {
          minVariantPrice {
            amount
            currencyCode
          }
        }
        variants(first: 1) {
          nodes {
            id
            availableForSale
          }
        }
      }
    }
  }
` as const;

// ============================================================================
// Types
// ============================================================================

interface WishlistItem {
  id: string;
  title: string;
  handle: string;
  image: {url: string; altText: string | null} | null;
  price: string;
  variantId: string;
  availableForSale: boolean;
}

// ============================================================================
// Loader
// ============================================================================

export async function loader({context}: Route.LoaderArgs) {
  if (!isCustomerLoggedIn(context.session)) {
    return redirect('/account/login');
  }

  const token = getCustomerAccessToken(context.session)!;

  // Step 1: Read the wishlist metafield to get product GIDs
  const productIds = await readWishlistIds(
    context.storefront,
    context.env as unknown as AdminEnv,
    token,
  );

  if (productIds.length === 0) {
    return {wishlistItems: [] as WishlistItem[]};
  }

  // Step 2: Fetch product details for all GIDs
  let wishlistItems: WishlistItem[] = [];
  try {
    const productsData = await context.storefront.query(
      WISHLIST_PRODUCTS_QUERY,
      {variables: {ids: productIds}},
    );
    const nodes = productsData?.nodes ?? [];
    wishlistItems = nodes
      .filter(
        (node: unknown) =>
          (node != null && (node as any).__typename !== undefined) ||
          (node as any).id,
      )
      .map((node: any) => {
        const variant = node.variants?.nodes?.[0];
        const price = node.priceRange?.minVariantPrice;
        const formattedPrice = price
          ? new Intl.NumberFormat('en-US', {
              style: 'currency',
              currency: price.currencyCode,
            }).format(parseFloat(price.amount))
          : '';
        return {
          id: node.id,
          title: node.title,
          handle: node.handle,
          image: node.featuredImage ?? null,
          price: formattedPrice,
          variantId: variant?.id ?? '',
          availableForSale: variant?.availableForSale ?? false,
        } satisfies WishlistItem;
      });
  } catch {
    // Graceful degradation
  }

  return {wishlistItems};
}

// ============================================================================
// Action
// ============================================================================

export async function action({request, context}: Route.ActionArgs) {
  if (!isCustomerLoggedIn(context.session)) {
    return redirect('/account/login');
  }

  const token = getCustomerAccessToken(context.session)!;
  const formData = await request.formData();
  const intent = formData.get('intent') as string;

  if (intent === 'removeFromWishlist') {
    const productId = formData.get('productId') as string;
    await removeFromWishlist(
      context.storefront,
      context.env as unknown as AdminEnv,
      token,
      productId,
    );
    return {success: true};
  }

  return {success: false};
}

// ============================================================================
// Main Component
// ============================================================================

export default function WishlistPage({loaderData}: Route.ComponentProps) {
  const {t} = useTranslation();
  const {wishlistItems} = loaderData;

  return (
    <div className="flex flex-col gap-6">
      {/* Page Title */}
      <h1 className="text-[28px] font-light leading-[42px] text-gray-800">
        {t('account.wishlist.pageTitle')}
      </h1>

      {/* Saved Items Card */}
      <div className="overflow-hidden rounded-xl border border-border bg-white shadow-sm">
        <div className="flex items-center justify-between border-b border-border px-6 py-5">
          <h2 className="text-lg font-bold text-gray-900">
            {t('account.wishlist.cardTitle')}
          </h2>
          {wishlistItems.length > 0 && (
            <span className="text-sm text-text-muted">
              {t('account.wishlist.itemCount', {count: wishlistItems.length})}
            </span>
          )}
        </div>

        <div className="p-4 sm:p-6">
          {wishlistItems.length === 0 ? (
            <WishlistEmptyState />
          ) : (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {wishlistItems.map((item) => (
                <WishlistItemCard key={item.id} item={item} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// Sub-components
// ============================================================================

function WishlistEmptyState() {
  const {t} = useTranslation();
  return (
    <div className="flex flex-col items-center gap-4 py-12 text-center">
      <Heart size={48} className="text-gray-300" />
      <div className="flex flex-col gap-2">
        <h3 className="text-base font-semibold text-gray-800">
          {t('account.wishlist.emptyHeading')}
        </h3>
        <p className="max-w-sm text-sm text-text-muted">
          {t('account.wishlist.emptyBody')}
        </p>
      </div>
      <Link
        to="/collections/all"
        className="mt-2 rounded-lg bg-secondary px-6 py-3 text-[15px] font-medium text-white transition-colors hover:bg-secondary/90"
      >
        {t('account.wishlist.startShopping')}
      </Link>
    </div>
  );
}

function WishlistItemCard({item}: {item: WishlistItem}) {
  const {t} = useTranslation();
  const navigation = useNavigation();
  const isRemoving =
    navigation.state === 'submitting' &&
    navigation.formData?.get('intent') === 'removeFromWishlist' &&
    navigation.formData?.get('productId') === item.id;

  return (
    <div className="flex flex-col overflow-hidden rounded-lg border border-border bg-white">
      {/* Product Image */}
      <Link to={`/products/${item.handle}`} className="block aspect-square">
        {item.image ? (
          <Image
            data={item.image}
            className="h-full w-full object-cover"
            sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
            alt={item.image.altText ?? item.title}
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-gray-100">
            <ImageIcon size={32} className="text-gray-400" />
          </div>
        )}
      </Link>

      {/* Card Body */}
      <div className="flex flex-1 flex-col gap-3 p-4">
        <div className="flex flex-col gap-1">
          <Link
            to={`/products/${item.handle}`}
            className="line-clamp-2 text-sm font-medium text-gray-800 hover:text-secondary"
          >
            {item.title}
          </Link>
          {item.price && (
            <span className="text-sm font-semibold text-secondary">
              {item.price}
            </span>
          )}
        </div>

        {/* Actions */}
        <div className="mt-auto flex flex-col gap-2">
          {/* Add to Cart */}
          {item.variantId && item.availableForSale ? (
            <CartForm
              route="/cart"
              action={CartForm.ACTIONS.LinesAdd}
              inputs={{lines: [{merchandiseId: item.variantId, quantity: 1}]}}
              fetcherKey={`wishlist-cart-${item.id}`}
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
                    className="flex w-full items-center justify-center gap-2 rounded-lg bg-secondary px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-secondary/90 disabled:opacity-70"
                  >
                    {isAdding ? (
                      <Loader2 size={14} className="animate-spin" />
                    ) : isAdded ? (
                      <Check size={14} />
                    ) : (
                      <ShoppingCart size={14} />
                    )}
                    {isAdding
                      ? t('addToCart.adding')
                      : isAdded
                        ? t('addToCart.added')
                        : t('account.wishlist.addToCart')}
                  </button>
                );
              }}
            </CartForm>
          ) : (
            <button
              type="button"
              disabled
              className="flex w-full cursor-not-allowed items-center justify-center gap-2 rounded-lg border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm font-medium text-gray-400"
            >
              <ShoppingCart size={14} />
              {t('account.wishlist.outOfStock')}
            </button>
          )}

          {/* Remove */}
          <Form method="post">
            <input type="hidden" name="intent" value="removeFromWishlist" />
            <input type="hidden" name="productId" value={item.id} />
            <button
              type="submit"
              disabled={isRemoving}
              className="w-full text-xs text-red-500 transition-colors hover:text-red-700 disabled:opacity-50"
            >
              {isRemoving ? '…' : t('account.wishlist.remove')}
            </button>
          </Form>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// Loading Skeleton
// ============================================================================

export function HydrateFallback() {
  return (
    <div className="flex flex-col gap-6">
      <div className="h-[42px] w-48 animate-pulse rounded bg-gray-200" />
      <div className="overflow-hidden rounded-xl border border-border bg-white shadow-sm">
        <div className="border-b border-border px-6 py-5">
          <div className="h-[27px] w-32 animate-pulse rounded bg-gray-200" />
        </div>
        <div className="grid grid-cols-1 gap-4 p-6 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="overflow-hidden rounded-lg border border-border"
            >
              <div className="aspect-square animate-pulse bg-gray-100" />
              <div className="flex flex-col gap-3 p-4">
                <div className="h-4 w-3/4 animate-pulse rounded bg-gray-200" />
                <div className="h-4 w-1/3 animate-pulse rounded bg-gray-200" />
                <div className="h-9 animate-pulse rounded-lg bg-gray-200" />
                <div className="h-4 w-16 animate-pulse rounded bg-gray-100" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
