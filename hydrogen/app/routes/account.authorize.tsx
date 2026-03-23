import {redirect} from 'react-router';

/**
 * Account Authorize — Legacy OAuth callback handler
 *
 * This route previously handled the Customer Account API OAuth callback.
 * Now that we use custom Storefront API auth, it simply redirects to login.
 */
export async function loader() {
  return redirect('/account/login');
}
