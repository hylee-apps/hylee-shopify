import type {Route} from './+types/account.login';
import {redirect} from 'react-router';
import {getSeoMeta} from '@shopify/hydrogen';

// ============================================================================
// Route Meta
// ============================================================================

export function meta() {
  return getSeoMeta({
    title: 'Sign In',
    description: 'Sign in to your Hy-lee account.',
  });
}

// ============================================================================
// Loader — Redirect to Shopify Customer Account OAuth
// ============================================================================

export async function loader({context}: Route.LoaderArgs) {
  const isLoggedIn = await context.customerAccount.isLoggedIn();
  if (isLoggedIn) {
    return redirect('/account');
  }

  return context.customerAccount.login();
}
