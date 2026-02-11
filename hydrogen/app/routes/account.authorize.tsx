import type {Route} from './+types/account.authorize';

/**
 * Account Authorize — OAuth callback handler
 *
 * This route handles the Customer Account API OAuth callback.
 * After the customer logs in, Shopify redirects here.
 */
export async function loader({context}: Route.LoaderArgs) {
  return context.customerAccount.authorize();
}
