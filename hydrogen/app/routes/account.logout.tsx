import {redirect} from 'react-router';
import type {Route} from './+types/account.logout';
import {
  getCustomerAccessToken,
  clearCustomerAccessToken,
  deleteCustomerAccessToken,
} from '~/lib/customer-auth';

// ============================================================================
// Action — Logout via POST
// ============================================================================

export async function action({context}: Route.ActionArgs) {
  const accessToken = getCustomerAccessToken(context.session);

  // Invalidate the token on Shopify's side
  if (accessToken) {
    await deleteCustomerAccessToken(context.storefront, accessToken).catch(
      () => {
        // Token may already be expired — ignore errors
      },
    );
  }

  // Clear session
  clearCustomerAccessToken(context.session);

  return redirect('/account/login');
}

// ============================================================================
// Loader — redirect GET requests to account
// ============================================================================

export async function loader() {
  return new Response(null, {
    status: 302,
    headers: {Location: '/account'},
  });
}
