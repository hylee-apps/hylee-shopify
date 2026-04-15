/**
 * useWishlist — per-product wishlist state + toggle.
 *
 * - Reads initial wishlist IDs from root loader data (SSR'd, no flicker).
 * - Submits add/remove mutations to `/api/wishlist` via useFetcher.
 * - If the user is not logged in, toggle() navigates to /account/login.
 */

import {useFetcher, useNavigate, useRouteLoaderData} from 'react-router';
import type {RootLoader} from '~/root';

export function useWishlist(productId: string) {
  const rootData = useRouteLoaderData<RootLoader>('root');
  const fetcher = useFetcher<{wishlistIds: string[]; error?: string}>();
  const navigate = useNavigate();

  const isLoggedIn = rootData?.isLoggedIn ?? false;

  // Server-rendered initial state
  const serverWishlistIds: string[] = (rootData as any)?.wishlistIds ?? [];

  // After a successful mutation, use the server's updated list
  const activeWishlistIds: string[] =
    fetcher.data?.wishlistIds ?? serverWishlistIds;

  const isWishlisted = activeWishlistIds.includes(productId);
  const isPending = fetcher.state !== 'idle';

  function toggle() {
    if (!isLoggedIn) {
      navigate('/account/login');
      return;
    }
    fetcher.submit(
      {intent: isWishlisted ? 'remove' : 'add', productId},
      {method: 'POST', action: '/api/wishlist'},
    );
  }

  return {isWishlisted, isPending, toggle, isLoggedIn};
}
