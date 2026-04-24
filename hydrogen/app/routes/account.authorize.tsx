import type {Route} from './+types/account.authorize';
import {redirect} from 'react-router';

// OAuth callback route — no longer used with legacy Storefront API auth.
export async function loader(_: Route.LoaderArgs) {
  return redirect('/account/login');
}
