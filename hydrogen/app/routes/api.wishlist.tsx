/**
 * /api/wishlist — Resource route for wishlist mutations.
 *
 * All product cards and the wishlist page POST here to add or remove items.
 * Returns the updated list of product GIDs so the caller can sync state.
 *
 * POST /api/wishlist
 *   body: { intent: 'add' | 'remove', productId: string }
 *   response: { wishlistIds: string[], error?: string }
 */

import type {Route} from './+types/api.wishlist';
import {isCustomerLoggedIn, getCustomerAccessToken} from '~/lib/customer-auth';
import {addToWishlist, removeFromWishlist, type AdminEnv} from '~/lib/wishlist';

export async function action({request, context}: Route.ActionArgs) {
  if (!isCustomerLoggedIn(context.session)) {
    return Response.json(
      {error: 'unauthorized', wishlistIds: []},
      {status: 401},
    );
  }

  const token = getCustomerAccessToken(context.session)!;
  const formData = await request.formData();
  const intent = formData.get('intent') as string;
  const productId = formData.get('productId') as string;

  if (!productId) {
    return Response.json(
      {error: 'productId is required', wishlistIds: []},
      {status: 400},
    );
  }

  try {
    let updatedIds: string[];

    if (intent === 'add') {
      updatedIds = await addToWishlist(
        context.storefront,
        context.env as unknown as AdminEnv,
        token,
        productId,
      );
    } else if (intent === 'remove') {
      updatedIds = await removeFromWishlist(
        context.storefront,
        context.env as unknown as AdminEnv,
        token,
        productId,
      );
    } else {
      return Response.json(
        {error: 'invalid intent', wishlistIds: []},
        {status: 400},
      );
    }

    return Response.json({wishlistIds: updatedIds});
  } catch (err) {
    console.error('[api.wishlist] Error:', err);
    return Response.json(
      {error: 'server error', wishlistIds: []},
      {status: 500},
    );
  }
}

// Resource route — no default export (no UI)
